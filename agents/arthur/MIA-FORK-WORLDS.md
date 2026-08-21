# MIA — WORLD FORK RUNBOOK (one-shot, from Bill via Arthur, 2026-08-20)

Goal: create the empty second world `commons-next` beside live `commons`.
You fork ONLY. You build NOTHING in it and touch NOTHING in commons.
Arthur owns the plan (agents/arthur/NEW-VILLAGE-PLAN.md) and all building.

Load skill `eidoverse-world-building` first. Repo: /Users/t3rpz/projects/eidoverse-worlds
Host topology: reference `references/deployment-topology.md` in that skill —
eidoverse.billding.dev tunnels to celestine (192.168.50.7), checkout /data/sda/eidoverse-worlds.

## Steps

1. SSH to celestine and seed the world directory (worlds/ is gitignored — this
   lives only on the host):

   ```sh
   ssh -o BatchMode=yes 192.168.50.7
   mkdir -p /data/sda/eidoverse-worlds/worlds/commons-next
   ```

   Then write EXACTLY three lines to worlds/commons-next/log.jsonl (this is
   the verified format of commons' own log — same dialect, new numbers):

   ```jsonl
   {"seq":0,"ts":<now-ms>,"actor":"world","verb":"genesis","args":{"v":2,"dialect":"eidoverse-log"}}
   {"seq":1,"ts":<now-ms>,"actor":"world","verb":"grant","args":{"id":"bill","role":"owner","gen":true}}
   {"seq":2,"ts":<now-ms>,"actor":"bill","verb":"terrain","args":{"seed":<fresh-random-not-4666-not-7>,"size":224,"segments":240,"amplitude":0.16,"flatRadius":24,"layers":[{"color":"#4a5d33","repeat":16}]}}
   ```

   Grounding: commons' log line 2 is the identical grant; line 3 is the
   terrain verb with (seed 7, size 160, segments 200, amplitude 0.2,
   flatRadius 16) — we widen size and flatRadius per the new plan (bigger
   buildable disc, gentler relief). Grass layers are NOT seeded — Arthur
   places ground cover deliberately during the build, not inherited.

2. Verify lazy load — from your Mac (or celestine) curl:

   ```sh
   curl -s 'https://eidoverse.billding.dev/geom?world=commons-next'
   ```

   Expect an entities-empty (or near-empty) response, NOT 404. If 404, the
   genesis record didn't take — do not retry blindly; read server/config.ts
   WORLDS_DIR and server/world.ts load path and report what you find.

3. Confirm commons untouched:

   ```sh
   curl -s 'https://eidoverse.billding.dev/geom?world=commons&boxes=0' | head -c 300
   ```

   Same entity census as before your work (73 core + mason field). Any change
   = abort and report.

4. Do NOT: restart eidoverse.service (not needed for lazy load; the boot sweep
   at server/server.ts:189 only wakes SCRIPTED worlds, and commons-next has no
   behaviors yet — lazy first-touch is the designed path), place any entity,
   edit any client file, or touch worlds/commons/.

5. Report back (English): the genesis line you wrote, the /geom result for both
   worlds, and any surprises. One-shot — no loop needed.
