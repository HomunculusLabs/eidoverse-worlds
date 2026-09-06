#!/usr/bin/env bash
# fleet-runner.sh — overnight subagent fleet for eidoverse lanes (nvp-149)
# Bill-directed token-burn fleet, 2026-09-06. Each tick is ONE fresh bounded
# `hermes chat --oneshot` session executing ONE wakeup of one lane per its
# loop file. 6 lanes run concurrently per wave; waves repeat until END_EPOCH
# or the STOP file appears.
#
# Kill switch:  touch /Users/t3rpz/projects/eidoverse-worlds/agents/arthur/fleet/STOP
# Logs:         agents/arthur/fleet/logs/<lane>-w<wave>.log + fleet.log
# Per-tick bounds: --max-turns 100 --run-budget 2700 (45 min)
# Consent: per-invocation --yolo ONLY (profile approvals stay `manual`).
set -u
REPO=/Users/t3rpz/projects/eidoverse-worlds
FLEET_DIR="$REPO/agents/arthur/fleet"
LOGS="$FLEET_DIR/logs"
PROMPTS="$FLEET_DIR/prompts"
mkdir -p "$LOGS" "$PROMPTS"

# ---- config ----
HOURS=8
MAX_TURNS=100
RUN_BUDGET=2700
WAVE_SPACER=120
SKILL=eidoverse-world-building

declare -A LOOPFILE=(
  [waysign]=WAYSIGN   [mile]=MILESTONE   [dress]=DRESSING
  [sweep]=SWEEP       [night]=NIGHT      [artwalk]=ARTWALK
)
LANES=(waysign mile dress sweep night artwalk)

END_EPOCH=$(( $(date +%s) + HOURS*3600 ))

PREAMBLE="OVERNIGHT FLEET TICK — unattended, commissioned by Bill, $(date '+%F %T').
You are ONE wakeup of ONE lane. Load your skill, read your loop file, your
plan, and INTERLANE-PROTOCOL.md fresh; verify CURRENT state (never assume
earlier iterations hold). Execute exactly ONE wakeup: full house discipline —
standing gate real exit 0 before any live mutation, tags derived from ledger
max, one ledger append, stage ONLY lane-owned paths by explicit name, commit
under your lane prefix, never push. Five sibling lanes run in this same wave:
shared upload budget 4/min/IP (pace 20s+, backoff on 429), verbs 500ms+, and
every SAT/census preflight fetches the live set fresh. If your queue item is
exhausted or blocked on Bill, perform ONE cheap lawful hold verification and
report HOLD — do not manufacture work, do not invent queue items. English
only. End your reply with LANE_TICK_DONE on its own line."

# ---- build per-lane prompt files once (marker-extracted loop prompt) ----
for lane in "${LANES[@]}"; do
  f="$REPO/agents/arthur/${LOOPFILE[$lane]}-LOOP.md"
  if [ ! -f "$f" ]; then echo "MISSING loop file: $f" >> "$LOGS/fleet.log"; exit 1; fi
  awk 'BEGIN{f=0} /^---8<--- LOOP PROMPT ---8<---$/{f=1;next} /^---8<--- END LOOP PROMPT ---8<---$/{f=0} f' "$f" > "$PROMPTS/$lane.txt"
  # sanity: extraction must be non-trivial
  if [ "$(wc -l < "$PROMPTS/$lane.txt")" -lt 20 ]; then echo "BAD extraction for $lane" >> "$LOGS/fleet.log"; exit 1; fi
  { echo "$PREAMBLE"; echo ""; cat "$PROMPTS/$lane.txt"; } > "$PROMPTS/$lane.full.txt"
done
echo "[$(date '+%F %T')] prompts built for: ${LANES[*]}" >> "$LOGS/fleet.log"

# ---- wave loop ----
WAVE=0
while [ "$(date +%s)" -lt "$END_EPOCH" ]; do
  if [ -f "$FLEET_DIR/STOP" ]; then echo "[$(date '+%F %T')] STOP file — halting" >> "$LOGS/fleet.log"; break; fi
  WAVE=$((WAVE+1))
  echo "[$(date '+%F %T')] wave $WAVE start" >> "$LOGS/fleet.log"
  for lane in "${LANES[@]}"; do
    (
      timeout $((RUN_BUDGET+300)) hermes chat \
        --query-file "$PROMPTS/$lane.full.txt" \
        --oneshot --yolo -s "$SKILL" --in "$REPO" \
        --max-turns "$MAX_TURNS" --run-budget "$RUN_BUDGET" \
        > "$LOGS/$lane-w$WAVE.log" 2>&1
      echo "[$(date '+%F %T')] $lane w$WAVE exit=$? done=$(grep -c LANE_TICK_DONE "$LOGS/$lane-w$WAVE.log" 2>/dev/null || echo 0)" >> "$LOGS/fleet.log"
    ) &
  done
  wait
  echo "[$(date '+%F %T')] wave $WAVE complete" >> "$LOGS/fleet.log"
  sleep "$WAVE_SPACER"
done
echo "[$(date '+%F %T')] fleet ended after $WAVE waves" >> "$LOGS/fleet.log"
