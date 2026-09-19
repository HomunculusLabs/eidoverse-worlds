// fauna34-judge.ts — ZAI fallback judge (glm-5.3 vision) for the barn
// swallows. Judge identity: ZAI FALLBACK (cron lane has no native vision;
// native re-judge debt owed — recorded in FAUNA-PLAN). Discriminating
// contracts per view:
//  - yard_gameplay (18m N lane): birds VISIBLE in flight above the yard,
//    reading as birds not specks (the presence gate).
//  - bird profiles (0.7m aimed): THE forked tail + two-tone underparts +
//    rufous throat (the species gate — a generic "small bird" fails).
//  - side (plan): three distinct flight rings over open air, clear of
//    buildings/posts (the layout gate).
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.glmBase ?? "https://api.z.ai/api/coding/paas/v4";
const key = cfg.glmKey;
const model = cfg.glmModel ?? "glm-5.3";
const D = "/Users/t3rpz/projects/exidoverse-worlds/agents/arthur/reviews/fauna34-swallows".replace("exidoverse", "eidoverse");

const ask = async (file: string, label: string, text: string) => {
  const b64 = readFileSync(`${D}/${file}`).toString("base64");
  const body = {
    model,
    max_tokens: 900,
    temperature: 0.2,
    messages: [
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:image/png;base64,${b64}` } },
          { type: "text", text },
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
        signal: AbortSignal.timeout(90_000),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j: any = await r.json();
      const out = j.choices?.[0]?.message?.content ?? "";
      console.log(`\n=== ${label} (${file}) ===\n${out}`);
      return out;
    } catch (e: any) {
      console.log(`retry ${a} ${label}: ${e?.message ?? e}`);
      await new Promise(r2 => setTimeout(r2, 15_000 * a));
    }
  }
  throw new Error(`judge failed for ${label}`);
};

const run = async () => {
  // 1. presence gate — 18m
  await ask("new-yard_gameplay.png", "GAMEPLAY-18m",
    `This is an 18m gameplay-distance render of a village livery yard (stable left, horses at a rail, a tall tower right). Small flying birds circle in the air above the yard. Answer about THIS image only, tersely:\n` +
    `1) BIRDS: do you see small flying birds in the air (between the rooflines and the sky)? yes/no + how many you can see.\n` +
    `2) READ: do they read as birds (winged, in flight) rather than insects, debris or specks? yes/no + one phrase.\n` +
    `3) DEFECTS: anything floating/broken/intersecting the buildings? yes/no + one phrase.\n` +
    `End with exactly: VERDICT_BIRDS=VISIBLE or VERDICT_BIRDS=NOT`);

  // 2. species gate — aimed profiles
  for (const bn of ["swallow_1", "swallow_2", "swallow_3"]) {
    await ask(`new-bird-${bn}.png`, `PROFILE-${bn}`,
      `Close render (0.7m) of one flying barn swallow model, side profile, meadow background. Answer tersely:\n` +
      `1) FORK: does the tail read as a deep FORKED swallow tail — two long pointed streamers with a notch between? yes/no + one phrase.\n` +
      `2) COLORS: dark steel-blue back visible? pale cream underside visible? small red-brown (rufous) throat patch visible? yes/no each.\n` +
      `3) WINGS: wings attached at the shoulders in a flapping posture? anything detached, floating or broken? yes/no + one phrase.\n` +
      `4) BIRD: overall does it read as a small bird in flight (not a fish/plane/debris)? yes/no.\n` +
      `End with exactly: VERDICT_SWALLOW=YES or VERDICT_SWALLOW=NO`);
  }

  // 3. layout gate — plan view
  await ask("new-side.png", "SIDE-PLAN",
    `Elevated plan render of the livery yard: horses at a rail below, an owl post, stable roof edge. Three birds fly circular paths at different heights. Answer tersely:\n` +
    `1) RINGS: can you distinguish multiple distinct flight paths/rings (birds at different positions/radii)? yes/no + count.\n` +
    `2) CLEAR: are the birds in open air, clear of the buildings/posts (no intersections)? yes/no + one phrase.\n` +
    `End with exactly: VERDICT_LAYOUT=CLEAR or VERDICT_LAYOUT=NOT`);

  // 4. encounter vantage
  await ask("new-encounter.png", "ENCOUNTER",
    `Ground-level render looking up into a village yard's air (visitor standing in the yard). Answer tersely:\n` +
    `1) BIRD: is at least one flying bird clearly visible against the sky/roofline? yes/no.\n` +
    `2) READ: bird-like (wings/tail silhouette) rather than a speck? yes/no + one phrase.\n` +
    `End with exactly: VERDICT_ENCOUNTER=YES or VERDICT_ENCOUNTER=NO`);
};
await run();
console.log("\nJUDGE_DONE");
