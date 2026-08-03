/**
 * §17.2 digest conformance for the eidoverse door, against the frozen
 * 25-vector corpus (vendored byte-for-byte from mcpl main).
 *
 * Run: cd mcpl && bun run manifest-test.ts
 */
import { canonicalManifestJson, manifestRevision, ManifestDigestError, MANIFEST_WITH_REVISION, ManifestAnnouncer } from "./manifest.ts";
import vectors from "./vectors/manifest-digest-vectors.json";

let pass = 0, fail = 0;
const bad = (name: string, msg: string) => { fail++; console.error(`not ok ${name}: ${msg}`); };

for (const v of (vectors as any).vectors) {
  try {
    const canonical = canonicalManifestJson(v.input);
    if (v.expectError) { bad(v.name, `expected ${v.expectError}, digested`); continue; }
    if (canonical !== v.canonicalJson) { bad(v.name, `canonical mismatch`); continue; }
    const rev = manifestRevision(v.input);
    if (rev !== v.digest) { bad(v.name, `digest mismatch: ${rev}`); continue; }
    pass++;
  } catch (e) {
    if (v.expectError && e instanceof ManifestDigestError && e.code === v.expectError) { pass++; continue; }
    bad(v.name, `unexpected ${e instanceof ManifestDigestError ? e.code : e}`);
  }
}

// Own manifest: conforming, stable, self-consistent.
const own = MANIFEST_WITH_REVISION;
const rev1 = manifestRevision(own);
const rev2 = manifestRevision({ ...own, revision: "sha256:WRONG" });
if (rev1 !== rev2) bad("own-manifest-revision-self-excluding", `${rev1} !== ${rev2}`); else pass++;
if (own.revision !== rev1) bad("own-manifest-carries-its-digest", `${own.revision} !== ${rev1}`); else pass++;

// Announcer: seeded from initialize ⇒ silent while the surface is static.
let sent = 0;
const ann = new ManifestAnnouncer(() => { sent++; });
if (ann.announceIfChanged(["capabilities"]) || sent !== 0) bad("announcer-static-silence", `announced ${sent}`); else pass++;

console.log(`# pass ${pass}`);
console.log(`# fail ${fail}`);
if (fail > 0) process.exit(1);
