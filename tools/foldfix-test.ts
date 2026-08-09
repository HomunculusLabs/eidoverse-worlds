// Conformance: shared/fold.js vs spec/fixtures (PROTOCOL.md §11).
//
// Folds each fixtures/*/log.jsonl from empty state with the SHARED fold and
// deep-compares the result to folded.json over exactly the conformance
// fields — entities (comp bags and parents included), mounts, roles,
// behaviors — numbers within 1e-6 (orphan-stamping does trigonometry).
// Chat windows, ban lists, and other implementation-defined folds are out
// of scope, per spec/fixtures/README.md.
//
// Needs no server and no network:
//
//   bun tools/foldfix-test.ts
//
// This is also the harness that pins the foldEntry extraction (TEL0S_NOTES
// §8 step 2): the reference fold moved out of server/server.ts verbatim,
// and these fixtures are the proof it stayed itself.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { emptyState, foldEntry } from "../shared/fold.js";

const FIX = join(import.meta.dir, "..", "spec", "fixtures");
const FIELDS = ["entities", "mounts", "roles", "behaviors"] as const;
const EPS = 1e-6;

let passed = 0, failed = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (ok) { passed++; console.log(`  ✓ ${name}`); }
  else { failed++; console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`); }
};

/** Deep equality, JSON semantics, numbers within EPS. Returns a path string
 *  naming the first divergence, or null when equal. */
function diff(a: unknown, b: unknown, path = "$"): string | null {
  if (typeof a === "number" && typeof b === "number") {
    return Math.abs(a - b) <= EPS ? null : `${path}: ${a} vs ${b}`;
  }
  if (a === b) return null;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return `${path}: length ${a.length} vs ${b.length}`;
    for (let i = 0; i < a.length; i++) {
      const d = diff(a[i], b[i], `${path}[${i}]`);
      if (d) return d;
    }
    return null;
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    const ka = Object.keys(a as object).sort();
    const kb = Object.keys(b as object).sort();
    if (ka.join("") !== kb.join("")) {
      const extra = ka.filter((k) => !kb.includes(k));
      const missing = kb.filter((k) => !ka.includes(k));
      return `${path}: keys differ (ours+[${extra}] theirs+[${missing}])`;
    }
    for (const k of ka) {
      const d = diff((a as any)[k], (b as any)[k], `${path}.${k}`);
      if (d) return d;
    }
    return null;
  }
  return `${path}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`;
}

console.log(`\nfold conformance — spec/fixtures vs shared/fold.js\n`);

for (const dir of readdirSync(FIX).sort()) {
  const base = join(FIX, dir);
  if (!statSync(base).isDirectory()) continue;

  const st = emptyState();
  const lines = readFileSync(join(base, "log.jsonl"), "utf8").split("\n").filter(Boolean);
  for (const line of lines) foldEntry(st, JSON.parse(line));
  // JSON round-trip: the comparison is over JSON semantics (what a snapshot
  // or a join payload would actually carry), not in-memory quirks
  const ours = JSON.parse(JSON.stringify(st));
  const want = JSON.parse(readFileSync(join(base, "folded.json"), "utf8"));

  for (const f of FIELDS) {
    const d = diff(ours[f] ?? null, want[f] ?? null, `$.${f}`);
    check(`${dir}: ${f}`, d === null, d ?? "");
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
