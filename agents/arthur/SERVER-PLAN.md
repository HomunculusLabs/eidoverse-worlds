# SERVER LOOP — durable plan

Loop name: SERVER LOOP
Repo: /Users/t3rpz/projects/eidoverse-worlds
Live host: celestine (192.168.50.7), checkout /data/sda/eidoverse-worlds, user service eidoverse.service on :8940, public via Cloudflare (eidoverse.billding.dev).
Only Bill stops this loop: reply LOOP_COMPLETE only when Bill says stop in his own message.

## Mission

One real server/engine improvement per wakeup — server/, shared/, client/lib engine
code (not village GLBs, not textures; those belong to their own loops). Close the
gap between "code that works in the repo" and "code the live host runs".

## The law that birthed this loop

2026-08-17: the carousel rider fix sat deployed-to-GitHub while the live host kept
serving August 14 code through two restarts, because NOTHING checked what celestine
actually runs. Meanwhile celestine accumulated hot-patches (net.js agent-silence,
core.js GPU pre-flight) that exist in no branch — if that disk dies, they are gone.

LAW: the live host must never run un-versioned code. Every byte celestine serves
must be reachable from a git ref, and every intentional hot-patch must be committed
into the fork before the loop may proceed to new work.

## Each wakeup

1. Load skill `eidoverse-world-building` (it carries the celestine deploy law).
2. Read this file first; update it at the end of the run.
3. DRIFT GATE (every run, no rotation): sha256 sweep of engine dirs on celestine
   vs fork/main (server/, shared/, client/lib). Any drifted file is the run's work:
   either commit the hot-patch into the fork (if intentional) or restore from
   fork/main (if stale). Zero drift is required before new work begins.
4. New work: one substantial improvement. Pick from the queue below or survey fresh.
5. Verify locally before deploy: the repo's test tools are the gate —
   `WORLDS_DIR=$(mktemp -d) JOIN_TOKEN=test-door PORT=8993 bun server/server.ts &`
   then comptest.ts / permtest.ts / worldops-test.ts / foldfix-test.ts /
   paritybench.ts as relevant. A tool failing at HEAD is itself a finding.
6. Commit (scoped, one concern per commit) → push fork/main.
7. Deploy surgically over ssh to celestine: `git fetch` the fork commit on host,
   `git restore --source=FETCH_HEAD` the changed files, `node --check` each,
   `systemctl --user restart eidoverse.service` (needs user approval).
8. Verify live: public `/lib/<file>` sha256 == fork/main blob hash, `/version`
   startedAt moved, and a functional check against the live world (geom endpoint).
   No claim of "deployed" without the public hash match.
9. Append a dated entry to SERVER-LOG.md (id server-N, what/why/evidence) and commit.

## Rules inherited from the village loops

- Verification is ad-hoc + live-assertion, never called "suite green".
- Probes are one-shot: run, evidence logged, file deleted.
- Report findings concisely each iteration.
- Eye-needing changes (rendering, UI behavior) get Bill's eye-check before "done".
- Service restarts are destructive: ask approval each time.

## Queue (seed)

- [ ] server-0: COMMIT the two orphan hot-patches (net.js agent join/leave silence;
      core.js GPU adapter pre-flight rev3) into fork/main so celestine's drift = 0.
- [ ] server-1: /version reports sha "unknown" — wire real commit metadata so deploys
      are self-identifying (kills the hash-sweep guesswork at the source).
- [ ] server-2: deploy provenance check as a standing script (this loop's step 3,
      automated: `agents/arthur/server-drift.ts`).
- [ ] server-3: verb rate-limit (429 "slow down") hit mid-placer — placer-side pacing
      or server-side queue fairness for comp storms.
- [ ] server-4: rider-transform regression risk: mountTransform in world.js now
      carries carousel-specific composition; a comptest case mounting a part-socket
      rider would pin it.
