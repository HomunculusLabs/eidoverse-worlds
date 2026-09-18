// fauna27-judge.ts — ZAI fallback judge (glm-5.3 vision) for the fauna-27
// yaw-presentation falsification. Discriminating contract: the candidate
// 18° front-oblique must show the bird's HEAD/FACE toward the camera with
// the train dome presented; the rear control must NOT (train fronting,
// head hidden). A judge that answers both identically is non-discriminating
// → disclose, no PASS claimed. Disclosed judge identity: ZAI FALLBACK
// (cron lane has no native vision; native re-judge debt owed).
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.glmBase ?? "https://api.z.ai/api/coding/paas/v4";
const key = cfg.glmKey;
const model = cfg.glmModel ?? "glm-5.3";
const D = "/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/reviews/fauna27-peacock-reseat";

const ask = async (file: string, label: string) => {
  const b64 = readFileSync(`${D}/${file}`).toString("base64");
  const body = {
    model,
    max_tokens: 1200,
    temperature: 0.2,
    messages: [
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:image/png;base64,${b64}` } },
          {
            type: "text",
            text:
              `This is an 18m gameplay-distance render of one village show-bird model (a peacock on a stone plinth). ` +
              `Answer these questions about THIS image only, tersely:\n` +
              `1) PEACOCK: is it recognizable as a peacock (train/dome present)? yes/no + one phrase.\n` +
              `2) HEAD-FACING: does the bird's head/neck FACE the camera (face-side visible), or are you seeing mainly its BACK (train dome fronting the view, head hidden behind)? answer FRONT or BACK + one phrase.\n` +
              `3) DISPLAY: is the fan/dome of plumes presented toward the camera at an angle that reads (oblique), or edge-on/hIDDEN? answer READS or NOT.\n` +
              `4) DEFECTS: floating parts, intersecting geometry, anything broken? yes/no + one phrase.\n` +
              `End with exactly: VERDICT_FRONT=FRONT or VERDICT_FRONT=BACK`,
          },
        ],
      },
    ],
  };
  for (let a = 1; a <= 3; a++) {
    try {
      const r = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120_000),
      });
      if (!r.ok) {
        const t = await r.text();
        if (r.status === 429 && a < 3) { await Bun.sleep(20_000); continue; }
        throw new Error(`glm ${r.status}: ${t.slice(0, 300)}`);
      }
      const j: any = await r.json();
      const out = String(j.choices?.[0]?.message?.content ?? "").trim();
      if (!out) throw new Error("empty reply");
      console.log(`\n===== ${label} (${file}) =====\n${out}\n`);
      return out;
    } catch (e: any) {
      if (a === 3) throw e;
      console.log(`retry ${label}: ${e.message}`);
      await Bun.sleep(15_000);
    }
  }
  throw new Error("unreachable");
};

const cand = await ask("cand18.png", "CANDIDATE front-oblique (reader vantage)");
const ctrl = await ask("ctrlRear18.png", "CONTROL rear-oblique (wrong-yaw)");
const cFront = /VERDICT_FRONT=FRONT/i.test(cand);
const cBack = /VERDICT_FRONT=BACK/i.test(ctrl);
console.log(JSON.stringify({
  judge: "ZAI fallback glm-5.3 (cron lane, native debt owed)",
  candFront: cFront, ctrlBack: cBack,
  discriminating: cFront && cBack,
  gate: cFront ? "PASS — candidate presents the display to the approach" : "FAIL — candidate does not read front",
}));
