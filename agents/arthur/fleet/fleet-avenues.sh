#!/usr/bin/env bash
# fleet-avenues.sh — Four Avenues execution window (city-14, Bill delegation).
# Current fleet (struct/survey/sweep) drains at its natural boundary or via
# STOP, then relaunches with city added to execute CITY-PLAN-V2 moves.
set -u
FLEET_DIR="/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/fleet"
LOG="$FLEET_DIR/logs/fleet.log"
RUNNER="$FLEET_DIR/fleet-pipeline.sh"
cd /Users/t3rpz/projects/eidoverse-worlds
touch "$FLEET_DIR/STOP"
echo "[$(date '+%F %T')] avenues: STOP placed, waiting for drain" >> "$LOG"
while pgrep -f "fleet-pipeline.sh" | grep -vw "$$" >/dev/null 2>&1; do sleep 30; done
rm -f "$FLEET_DIR/STOP"
sleep 15
echo "[$(date '+%F %T')] avenues: launching city struct survey sweep (20h)" >> "$LOG"
HOURS=20 LANES="city struct survey sweep" bash "$RUNNER" >> "$LOG" 2>&1
