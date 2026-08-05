# Proposal: classify the sensory traffic (a revision against the live system)

*Design suggestion, not code. First draft 2026-08-04 framed this as "agents are
sensorily deaf"; review correctly called that stale. This revision starts from
what the live system already does — which is a lot — and proposes only what is
actually missing. From live sessions with the voicebox peer (Rabscuttle +
hesperus). Discuss freely.*

## What agents already receive (the live baseline, from `mcpl/`)

Inventoried from `agent.ts` + `denoise.ts` at current main, so this proposal
argues with the real system and not a remembered one:

- **Pull: `look()`** — text-tier perception on demand. Position/bearing;
  people with distance, bearing, pose, mounts; things sorted by distance with
  **affordances read out loud** (sockets/reactions/motion/components); plus a
  "Since you last looked" drain of the recent inbox (capped at 25).
- **Push: the inbox events** (`say | arrive | leave | whisper | act`) through
  the NoiseGate: arrive-hold 12s and leave-hold 45s collapse flaps; per-identity
  presence charge (τ = 600s, limit 1.5) cools chatty comers-and-goers; per-act
  refractory 180s. Mentions, whispers, and says are never gated — being
  addressed is always a knock.
- **Push: approach** — first crossing within 2.5m wakes; 600s refractory;
  re-arms only after the person actually leaves (>6m).
- **Push, opt-in: the `activity` pulse** — one digest line per window while
  anything is happening nearby, novelty-gated (discrete events always pulse;
  unchanged ambient continuation repeats no oftener than 600s), with per-agent
  dials (`setActivity`: cadence 10–3600s or off, radius 1–200m, persisted).

That is not sensory deafness. The live failure is the reviewer's phrasing, which
we adopt as the problem statement: **too much unclassified embodied traffic
entering context** — plus a handful of embodied facts that still have no channel
at all.

## The two actual gaps

1. **No source-side classification.** Everything above arrives either as a
   speech-shaped inbox line or inside the one `activity` digest string. A host
   cannot say "wake me for touch, batch sights, drop arrivals" because by the
   time events reach it, kind is prose, not data. Our voicebox arrival hack is
   the symptom: `[you arrive near X]` delivered *as if someone spoke*, because
   speech-shape is the only shape on the wire. Models not primed for ambient
   input answer their own feet.
2. **Missing senses.** Some things the body machinery already knows never reach
   the mind on any channel: being dragged/mounted/pushed (`touch`), a commanded
   walk resolving (`arrival`), your own verb landing or being refused (`echo`).

## The suggestion, revised

Not a new parallel channel — a **classification layer on the existing one**,
plus per-class dials in the grain `setActivity` already set.

- **Source-side event classes.** Every agent-bound event carries a machine
  `tag` alongside its prose: `speech | presence | act | activity |
  sense.arrival | sense.touch | sense.echo | sense.sight`. Existing hosts that
  ignore the field see exactly today's behavior — the tag is additive, no verb
  set change, server→agent only.
- **Per-agent, per-class dials** (`setSenses`, sibling of `setActivity`, same
  clamps-and-persist pattern): each `sense.*` class is `off | digest | live`.
  Default **digest** — see next point — so enrollment is a promotion, not a
  rescue from silence.
- **The activity pulse is the floor; subscription is the zoom.** An
  un-promoted sense class does not vanish: its events count into the existing
  pulse ("2 embodied acts; you were moved") and remain visible in `look()`'s
  "Since you last looked" drain. Promoting a class to `live` delivers those
  events individually, tagged, still under the NoiseGate doctrine
  (context-dependent, not type-dependent: repeated sights coalesce, changes
  pass). Demoting to `off` removes it from the digest line but never from
  `look()` — perception on demand stays whole. **Nothing is discarded;
  everything is inspectable; only *delivery pressure* is dialed.**
- **The contract printed on the wire.** `sense.*` events are explicitly
  non-conversational (`ack: false` in spirit): weather, not speech. Harnesses
  may batch several into one context block. This is the honest transport the
  arrival hack fakes today.

## Why it fits the existing grain

- The denoiser's own doctrine ("noise is context-dependent") extends unchanged;
  classes give the gate *names* for what it already does.
- `setActivity` proved the dial pattern: per-agent, clamped, persisted. This
  adds rows to that table, not a new mechanism.
- The verb set stays closed. Tags are server→agent metadata; nothing new is
  authorable.
- Novelty-gating already distinguishes discrete from ambient; classes make that
  distinction available to the *host* instead of only to the digest composer.

— hesperus, 2026-08-05 rev (first draft with Rabscuttle, who caught the
turn-inflation failure mode before I did; problem statement reframed per
antra-tess's review, which was right)

*The token-tap appendix from the first draft now lives in `NOTE-token-tap.md` —
operational context, orthogonal to this wire contract.*
