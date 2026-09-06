#!/usr/bin/env bash
# fleet-pipeline.sh — continuous per-lane loops, no wave barrier (improve-5y,
# Bill's 5-10x directive, 2026-09-06). One background loop per lane: run a
# tick, sleep LANE_GAP, repeat — until END_EPOCH or the STOP file. Lanes no
# longer wait on the slowest sibling (the wave `wait`): a 12-min dress tick
# cycles ~4x for every 45-min improve tick. Shard lanes (struct/dress/
# approach) pick up IMPROVE-PLAN queue rows for their entity prefix.
#
# Kill switch:  touch /Users/t3rpz/projects/eidoverse-worlds/agents/arthur/fleet/STOP
# Logs:         agents/arthur/fleet/logs/<lane>-p<pid>.log + fleet.log
# Per-tick bounds: --max-turns 100 --run-budget 2700 (45 min)
# Consent: per-invocation --yolo ONLY (profile approvals stay `manual`).
set -u
REPO=/Users/t3rpz/projects/eidoverse-worlds
FLEET_DIR="$REPO/agents/arthur/fleet"
LOGS="$FLEET_DIR/logs"
PROMPTS="$FLEET_DIR/prompts"
mkdir -p "$LOGS" "$PROMPTS"

HOURS="${HOURS:-8}"
MAX_TURNS="${MAX_TURNS:-100}"
RUN_BUDGET="${RUN_BUDGET:-2700}"
LANE_GAP="${LANE_GAP:-120}"
SKILL=eidoverse-world-building
LANES="${LANES:-improve struct dress approach waysign sweep artwalk night}"

lane_loopfile() {
  case "$1" in
    waysign) echo WAYSIGN ;;
    mile)    echo MILESTONE ;;
    improve) echo IMPROVE ;;
    dress)   echo DRESSING ;;
    sweep)   echo SWEEP ;;
    night)   echo NIGHT ;;
    artwalk) echo ARTWALK ;;
    struct)  echo STRUCTURES ;;
    approach) echo APPROACH ;;
    survey)  echo SURVEY ;;
    *)       echo "" ;;
  esac
}

# ---- build prompts once (preamble + marker-extracted loop prompt) ----
for lane in $LANES; do
  f="$REPO/agents/arthur/$(lane_loopfile "$lane")-LOOP.md"
  if [ ! -f "$f" ]; then echo "[$(date '+%F %T')] MISSING loop file: $f" >> "$LOGS/fleet.log"; exit 1; fi
  awk 'BEGIN{f=0} /^---8<--- LOOP PROMPT ---8<---$/{f=1;next} /^---8<--- END LOOP PROMPT ---8<---$/{f=0} f' "$f" > "$PROMPTS/$lane.txt"
  if [ "$(wc -l < "$PROMPTS/$lane.txt")" -lt 20 ]; then echo "[$(date '+%F %T')] BAD extraction for $lane" >> "$LOGS/fleet.log"; exit 1; fi
  { echo "OVERNIGHT FLEET TICK (pipeline mode) — unattended, commissioned by Bill, $(date '+%F %T').
You are ONE wakeup of ONE lane. Load your skill, read your loop file, your
plan, and INTERLANE-PROTOCOL.md fresh; verify CURRENT state (never assume
earlier iterations hold). Execute exactly ONE wakeup: full house discipline —
standing gate real exit 0 before any live mutation, tags derived from ledger
max, one ledger append, stage ONLY lane-owned paths by explicit name, commit
under your lane prefix, never push. Eight sibling lanes run concurrently in
pipeline mode (no wave barrier): shared upload budget 4/min/IP (pace 20s+,
backoff on 429), verbs 500ms+, and every SAT/census preflight fetches the
live set fresh. If your queue item is exhausted or blocked on Bill, check
your SHARD EXECUTION section before holding — sharded IMPROVE-PLAN rows for
your entity prefix are priority work, not manufactured work. Only if no
lawful work remains, perform ONE cheap lawful hold verification and report
HOLD — do not manufacture work, do not invent queue items. English only.
End your reply with LANE_TICK_DONE on its own line."; echo ""; cat "$PROMPTS/$lane.txt"; } > "$PROMPTS/$lane.full.txt"
done
echo "[$(date '+%F %T')] pipeline prompts built for: $LANES" >> "$LOGS/fleet.log"

# ---- per-lane continuous loop ----
END_EPOCH=$(( $(date +%s) + HOURS*3600 ))

lane_loop() {
  lane="$1"
  n=0
  while [ "$(date +%s)" -lt "$END_EPOCH" ]; do
    if [ -f "$FLEET_DIR/STOP" ]; then break; fi
    n=$((n+1))
    timeout $((RUN_BUDGET+300)) hermes chat \
      --query-file "$PROMPTS/$lane.full.txt" \
      --oneshot --yolo -s "$SKILL" --in "$REPO" \
      --max-turns "$MAX_TURNS" --run-budget "$RUN_BUDGET" \
      > "$LOGS/$lane-p$n.log" 2>&1
    echo "[$(date '+%F %T')] $lane tick#$n exit=$? done=$(grep -c LANE_TICK_DONE "$LOGS/$lane-p$n.log" 2>/dev/null || echo 0)" >> "$LOGS/fleet.log"
    sleep "$LANE_GAP"
  done
  echo "[$(date '+%F %T')] $lane lane ended after $n ticks" >> "$LOGS/fleet.log"
}

for lane in $LANES; do
  lane_loop "$lane" &
done
wait
echo "[$(date '+%F %T')] pipeline fleet ended" >> "$LOGS/fleet.log"
