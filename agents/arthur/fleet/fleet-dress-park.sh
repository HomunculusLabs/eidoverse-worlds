#!/usr/bin/env bash
# fleet-dress-park.sh — park dress lane per usefulness audit (Bill 24h
# directive): dress is on hold-tick 53 with zero executable rows (its last
# row 38 executed; SW lamps + eye-gates are Bill-verdict-bound). Waits for
# the running fleet to drain at the STOP boundary, then relaunches WITHOUT
# dress: improve struct sweep survey, 21h (rest of the 24h window).
set -u
FLEET_DIR="/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/fleet"
LOG="$FLEET_DIR/logs/fleet.log"
RUNNER="$FLEET_DIR/fleet-pipeline.sh"
cd /Users/t3rpz/projects/eidoverse-worlds
touch "$FLEET_DIR/STOP"
echo "[$(date '+%F %T')] dress-park: STOP placed, waiting for fleet drain" >> "$LOG"
while pgrep -f "fleet-pipeline.sh" | grep -vw "$$" >/dev/null 2>&1; do sleep 30; done
rm -f "$FLEET_DIR/STOP"
sleep 15
echo "[$(date '+%F %T')] dress-park: relaunching improve struct sweep survey (21h)" >> "$LOG"
HOURS=21 LANES="improve struct sweep survey" bash "$RUNNER" >> "$LOG" 2>&1
