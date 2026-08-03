/**
 * §17 server side for the eidoverse door (RFC-003 / SPEC 0.5, eidoverse#2).
 *
 * The canonical content digest (§17.2), the complete-manifest answer
 * (§17.4), and the per-connection announcement seed (§17 impl note: seed
 * last-announced from the initialize handshake, or a fresh connection fires
 * a redundant announce for a manifest initialize already carried).
 *
 * Digest rules exactly as adjudicated in the frozen 25-vector corpus
 * (mcpl main `2cdc7fb`+`a77be49` lineage — see conformance/README there):
 *  - revision = "sha256:" + base64url_unpadded(SHA-256(JCS(manifest minus
 *    root revision)));
 *  - JCS: member names sorted by UTF-16 code units, ES6 string escapes,
 *    ES6 Number::toString;
 *  - set semantics (sort by UTF-8 bytes + dedupe) ONLY for the three set
 *    paths in the object-keyed shape, ONLY when the array is all-strings;
 *    anything else — wrong-typed fields, mixed arrays, the array
 *    featureSets shape — is hashed VERBATIM (totality; validation is where
 *    non-conformance fails, never the digest);
 *  - the sole refusal is identifier_charset on the enumerated identifier
 *    positions, and only in the conforming all-string shape.
 *
 * This server's declared surface (declaration.ts) is compile-time static,
 * so mcpl/manifestChanged has no live trigger today. The announce helper
 * exists and is wired anyway (the dog-mcp pattern): a future mutating site
 * calls `announceIfChanged` and the plumbing already works, instead of a
 * dead code path being invented under pressure later.
 */

import { createHash } from "node:crypto";
import { MCPL_ADVERTISEMENT } from "./declaration.ts";

// ── JCS (RFC 8785) ──────────────────────────────────────────────────────────

const SHORT_ESCAPES: Record<number, string> = {
  0x08: "\\b", 0x09: "\\t", 0x0a: "\\n", 0x0c: "\\f", 0x0d: "\\r",
  0x22: '\\"', 0x5c: "\\\\",
};

function jcsString(s: string): string {
  let out = '"';
  for (const ch of s) {
    const cp = ch.codePointAt(0)!;
    if (cp in SHORT_ESCAPES) out += SHORT_ESCAPES[cp];
    else if (cp < 0x20) out += "\\u" + cp.toString(16).padStart(4, "0");
    else out += ch;
  }
  return out + '"';
}

function jcsNumber(x: number): string {
  if (!Number.isFinite(x)) throw new ManifestDigestError("non_finite_number", String(x));
  // ES6 Number::toString IS JavaScript's String(x) — the one serializer
  // RFC 8785 §3.2.2.3 defers to. (-0 → "0" via the x===0 identity.)
  return x === 0 ? "0" : String(x);
}

function utf16Key(s: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
  return out;
}

function compareUtf16(a: string, b: string): number {
  const x = utf16Key(a), y = utf16Key(b);
  const n = Math.min(x.length, y.length);
  for (let i = 0; i < n; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return x.length - y.length;
}

function compareUtf8(a: string, b: string): number {
  const enc = new TextEncoder();
  const x = enc.encode(a), y = enc.encode(b);
  const n = Math.min(x.length, y.length);
  for (let i = 0; i < n; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return x.length - y.length;
}

function jcs(value: unknown): string {
  if (value === true) return "true";
  if (value === false) return "false";
  if (value === null) return "null";
  if (typeof value === "string") return jcsString(value);
  if (typeof value === "number") return jcsNumber(value);
  if (Array.isArray(value)) return "[" + value.map(jcs).join(",") + "]";
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort(compareUtf16); // RFC 8785 §3.2.3
    return "{" + keys.map((k) => jcsString(k) + ":" + jcs(obj[k])).join(",") + "}";
  }
  throw new ManifestDigestError("unserializable", typeof value);
}

// ── §17.2 normalization ─────────────────────────────────────────────────────

export class ManifestDigestError extends Error {
  constructor(public readonly code: string, detail: string) {
    super(`${code}: ${detail}`);
  }
}

const IDENT_RE = /^[A-Za-z0-9._:*-]+$/;

/** Set-valued paths, object-keyed shape only ("*" = any member name). */
const SET_PATHS = [
  ["featureSets", "*", "uses"],
  ["featureSets", "*", "tagOntology", "coreTags"],
  ["featureSets", "*", "tagOntology", "tags", "*", "implies"],
];

const ROOT_NON_CAPABILITY = new Set(["version", "revision", "featureSets"]);

/** Identifier positions, mirroring the vector corpus's identifierPositions:
 *  "#key" = the object's member names at that path, "[]" = array elements.
 *  Capability member names at EVERY depth are covered by the isCapMember
 *  branch in normalize(); these are the featureSets-subtree positions. */
const IDENT_PATHS = [
  ["featureSets", "#key"],
  ["featureSets", "*", "uses", "[]"],
  ["featureSets", "*", "tagOntology", "coreTags", "[]"],
  ["featureSets", "*", "tagOntology", "tags", "#key"],
  ["featureSets", "*", "tagOntology", "tags", "*", "implies", "[]"],
  ["featureSets", "*", "tagOntology", "keyed", "#key"],
  ["featureSets", "*", "tagOntology", "keyed", "*", "values", "[]"],
  ["featureSets", "*", "tagOntology", "suggestedTreatment", "*", "tagsAny", "[]"],
  ["featureSets", "*", "tagOntology", "suggestedTreatment", "*", "tagsAll", "[]"],
  ["featureSets", "*", "tagOntology", "suggestedTreatment", "*", "tagsNone", "[]"],
  ["featureSets", "*", "tagOntology", "tags", "*", "facet"],
];

function pathMatches(path: string[], pattern: string[]): boolean {
  if (path.length !== pattern.length) return false;
  // "*" is a dict-key wildcard; list indices are recorded as "[i]" and never
  // match it (the array-form featureSets shape hashes verbatim).
  return pattern.every((want, i) => (want === "*" ? path[i] !== "[i]" : want === path[i]));
}

const isIdentPath = (p: string[]) => IDENT_PATHS.some((pat) => pathMatches(p, pat));

function checkIdent(v: unknown, where: string): void {
  if (typeof v !== "string" || !IDENT_RE.test(v)) {
    throw new ManifestDigestError("identifier_charset", `${where} = ${JSON.stringify(v)}`);
  }
}

function normalize(value: unknown, path: string[]): unknown {
  if (Array.isArray(value)) {
    const items = value.map((v) => normalize(v, [...path, "[i]"]));
    const allStrings = items.every((it) => typeof it === "string");
    // Totality: set semantics AND identifier checks only for the conforming
    // all-string shape; a mixed array is left verbatim for JCS.
    if (allStrings && isIdentPath([...path, "[]"])) {
      for (const it of items) checkIdent(it, path.join(".") + "[]");
    }
    if (allStrings && SET_PATHS.some((p) => pathMatches(path, p))) {
      return [...new Set(items as string[])].sort(compareUtf8);
    }
    return items;
  }
  if (typeof value === "string" && isIdentPath(path)) {
    checkIdent(value, path.join("."));
    return value;
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      // Capability member names at EVERY depth (the recursive-walk rule):
      // everything outside the featureSets/version/revision root members.
      const inCapSubtree = path.length === 0 ? !ROOT_NON_CAPABILITY.has(k) : !ROOT_NON_CAPABILITY.has(path[0]);
      if (inCapSubtree || isIdentPath([...path, "#key"])) checkIdent(k, [...path, k].join("."));
      out[k] = normalize(v, [...path, k]);
    }
    return out;
  }
  return value;
}

// ── Public surface ──────────────────────────────────────────────────────────

/** Canonical JCS string of a manifest, root `revision` stripped (§17.2). */
export function canonicalManifestJson(manifest: Record<string, unknown>): string {
  const { revision: _dropped, ...rest } = manifest;
  return jcs(normalize(rest, []));
}

/** `sha256:` + base64url-unpadded digest of the canonical bytes. */
export function manifestRevision(manifest: Record<string, unknown>): string {
  const canonical = canonicalManifestJson(manifest);
  const b64 = createHash("sha256").update(canonical, "utf8").digest("base64");
  return "sha256:" + b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** The complete current manifest WITH its content-derived revision — what
 *  both `initialize` (§5.1) and `mcpl/manifest` (§17.4) present. Computed
 *  once: the declared surface is compile-time static. */
export const MANIFEST_WITH_REVISION: Record<string, unknown> = (() => {
  const base = MCPL_ADVERTISEMENT as unknown as Record<string, unknown>;
  return { ...base, revision: manifestRevision(base) };
})();

/**
 * Per-connection announcement seed + trigger (§17 impl note). Seeded from
 * the initialize handshake so a fresh connection never fires a redundant
 * announce; a future surface-mutating site calls `announceIfChanged` and
 * the notification goes out only when the CURRENT revision differs from
 * the last one this connection was told.
 */
export class ManifestAnnouncer {
  private lastAnnounced: string;
  constructor(
    private readonly send: (params: { revision: string; domains: string[] }) => void,
    seedRevision: string = MANIFEST_WITH_REVISION.revision as string,
  ) {
    this.lastAnnounced = seedRevision;
  }
  /** Announce iff the current manifest revision differs from the seed/last.
   *  Domains are derived by the CALLER of the mutation (it knows what it
   *  changed); the notification carries no payload either way (§17.3). */
  announceIfChanged(domains: Array<"capabilities" | "featureSets" | "tagOntology">): boolean {
    const current = manifestRevision(MCPL_ADVERTISEMENT as unknown as Record<string, unknown>);
    if (current === this.lastAnnounced) return false;
    this.lastAnnounced = current;
    this.send({ revision: current, domains });
    return true;
  }
}
