// verify-tex84.ts — PERSISTENT lane verifier for tex-84 (does NOT
// self-delete; committed as durable, runnable evidence).
// THE FULL-STACK REGRESSION: runs every persistent verifier tex-55..83
// in sequence (batch-order realistic) and asserts all green, then the
// standing gate. This is the lane's proof it built one village, not
// 83 phases.
// NOTE: verifiers that rebuild landmark/ring GLBs restore their
// siblings themselves (tex-69 fixed this wakeup); the caller should
// still re-restore afterwards:
//   cp /tmp/carousel-polish-backup.glb agents/arthur/assets/village_carousel3.glb
//   cp /tmp/ring-bak-village_belltower3.glb agents/arthur/assets/village_belltower3.glb
//   cp /tmp/ring-bak-village_windmill3.glb agents/arthur/assets/village_windmill3.glb
// Run: bun agents/arthur/verify-tex84.ts   (takes ~4-5 minutes)
import { execSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync } from "node:fs";
import { appendFileSync } from "node:fs";
import { createHash } from "node:crypto";

const W = "/Users/t3rpz/projects/eidoverse-worlds";
const A = `${W}/agents/arthur/assets`;
const fails: string[] = [];
const lines: string[] = [];
const ok = (n: string, c: boolean, d = "") => {
    const line = `${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`;
    console.log(line);
    lines.push(line);
    if (!c) fails.push(n);
};
const restore = () => {
    try { copyFileSync("/tmp/carousel-polish-backup.glb", `${A}/village_carousel3.glb`); } catch {}
    try { copyFileSync("/tmp/ring-bak-village_belltower3.glb", `${A}/village_belltower3.glb`); } catch {}
    try { copyFileSync("/tmp/ring-bak-village_windmill3.glb", `${A}/village_windmill3.glb`); } catch {}
};

// 0) pre-state: backups exist
ok("backups exist (carousel + belltower + windmill)",
    existsSync("/tmp/carousel-polish-backup.glb")
    && existsSync("/tmp/ring-bak-village_belltower3.glb")
    && existsSync("/tmp/ring-bak-village_windmill3.glb"));

// 1) full stack, sequential (batch-order realistic)
const results: string[] = [];
for (let v = 55; v <= 83; v++) {
    const p = `${W}/agents/arthur/verify-tex${v}.ts`;
    if (!existsSync(p)) continue;
    restore();
    let out = "";
    try {
        out = execSync(`bun agents/arthur/verify-tex${v}.ts`, { cwd: W, encoding: "utf8", timeout: 120000, stdio: ["ignore", "pipe", "pipe"] });
    } catch (e: any) {
        out = (e.stdout ?? "") + (e.stderr ?? "");
    }
    const pass = out.includes("ALL PASS");
    results.push(`tex-${v}: ${pass ? "ALL PASS" : "FAIL"}`);
    if (!pass) fails.push(`tex-${v}`);
}
restore();
console.log(results.join("\n"));
lines.push(...results);
ok(`full stack green (tex-55..83, ${results.length} verifiers)`, fails.length === 0, `${results.length - [...new Set(fails)].length}/${results.length} green`);

// 2) standing gate
let vr = { code: 1, out: "" };
try { vr.out = execSync("bun agents/arthur/verify-repairs.ts", { cwd: W, encoding: "utf8", timeout: 120000 }); vr.code = 0; } catch (e: any) { vr.out = (e.stdout ?? "") + (e.stderr ?? ""); }
ok("verify-repairs.ts 0 / ALL PASS (all pins + ledger EXACT + HEAD gate)",
    vr.code === 0 && vr.out.includes("ALL PASS") && !/\bFAIL\b/.test(vr.out), "code=" + vr.code);

// 3) lane hygiene: T-dir residue 0
const t = "/private/var/folders/vk/ynsnb3x92sv16bj7wz5xtnm80000gn/T";
let residue = 0;
try { residue = execSync(`ls ${t}/hermes-verify-tex* 2>/dev/null | wc -l`, { encoding: "utf8" }).trim() === "" ? 0 : parseInt(execSync(`ls ${t}/hermes-verify-tex* 2>/dev/null | wc -l`, { encoding: "utf8" }).trim()); } catch { residue = 0; }  // tex-scoped: polish lane keeps its own standing verifiers
ok("T-dir hermes-verify residue 0 (one-shot hygiene law)", residue === 0, String(residue));

const verdict = fails.length ? `${fails.length} FAIL` : "ALL PASS";
console.log(`\n${verdict}`);
lines.push("", verdict, "");
appendFileSync(`${W}/agents/arthur/VERIFY-EVIDENCE.md`, `\n## tex-84 full-stack regression evidence — ${new Date().toISOString()}\n\n\`\`\`\n${lines.join("\n")}\n\`\`\`\n`);
process.exit(fails.length ? 1 : 0);
