#!/usr/bin/env bash
# fleet-improve-park.sh — park improve lane per usefulness rule (Bill's
# standing "all jobs useful" directive). improve delivered its rounds-1-2
# close-out eye-gate packet at improve-46 and has held 22+ consecutive
# ticks awaiting Bill's verdicts (mosaic siting + eye-gate circuit) with
# zero re-armable evidence. Waits for fleet drain at STOP boundary, then
# relaunches WITHOUT improve. Resume: LANES="improve ..." after verdicts.
set -u
FLEET_DIR="/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/fleet"
LOG="$FLEET_DIR/logs/fleet.log"
RUNNER="$FLEET_DIR/fleet-pipeline.sh"
cd /Users/t3rpz/projects/eidoverse-worlds
touch "$FLEET_DIR/STOP"
echo "[$(date '+%F %T')] improve-park: STOP placed, waiting for drain" >> "$LOG"
while pgrep -f "fleet-pipeline.sh" | grep -vw "$$" >/dev/null 2>&1; do sleep 30; done
rm -f "$FLEET_DIR/STOP"
sleep 15
echo "[$(date '+%F %T')] improve-park: relaunching struct dress sweep survey city (~8h rest of window)" >> "$LOG"
HOURS=8 LANES="struct dress sweep survey city" bash "$RUNNER" >> "$LOG" 2>&1
