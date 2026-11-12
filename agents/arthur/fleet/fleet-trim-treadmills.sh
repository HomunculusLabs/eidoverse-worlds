#!/usr/bin/env bash
# fleet-trim-treadmills.sh — usefulness trim (Bill's standing rule) during
# the 2026-09-08 24h window. city (register 13/13 EXECUTED, remainder
# HOLD-for-Bill) and dress (round-3: 2 build-only items left, then post-
# close holds) are running pure hold treadmills. Waits for drain, then
# relaunches the three lanes with real work: struct (R6+ queue + routed
# cures), survey (post-overhaul re-baseline + corroboration), sweep (audit).
# Resume either parked lane after verdicts: LANES="dress city ..." append.
set -u
FLEET_DIR="/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/fleet"
LOG="$FLEET_DIR/logs/fleet.log"
RUNNER="$FLEET_DIR/fleet-pipeline.sh"
cd /Users/t3rpz/projects/eidoverse-worlds
touch "$FLEET_DIR/STOP"
echo "[$(date '+%F %T')] trim-treadmills: STOP placed, waiting for drain" >> "$LOG"
while pgrep -f "fleet-pipeline.sh" | grep -vw "$$" >/dev/null 2>&1; do sleep 30; done
rm -f "$FLEET_DIR/STOP"
sleep 15
echo "[$(date '+%F %T')] trim-treadmills: relaunching struct survey sweep (~23h)" >> "$LOG"
HOURS=23 LANES="struct survey sweep" bash "$RUNNER" >> "$LOG" 2>&1
