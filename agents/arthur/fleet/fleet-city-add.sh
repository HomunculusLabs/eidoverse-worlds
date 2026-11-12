#!/usr/bin/env bash
# fleet-city-add.sh — add the city lane to the running fleet per Bill
# ("add that to our fleet"). Waits for the current pipeline to drain at the
# STOP boundary (zero lost ticks), then relaunches with city included.
set -u
FLEET_DIR="/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/fleet"
LOG="$FLEET_DIR/logs/fleet.log"
RUNNER="$FLEET_DIR/fleet-pipeline.sh"
cd /Users/t3rpz/projects/eidoverse-worlds
touch "$FLEET_DIR/STOP"
echo "[$(date '+%F %T')] city-add: STOP placed, waiting for drain" >> "$LOG"
while pgrep -f "fleet-pipeline.sh" | grep -vw "$$" >/dev/null 2>&1; do sleep 30; done
rm -f "$FLEET_DIR/STOP"
sleep 15
echo "[$(date '+%F %T')] city-add: launching improve struct dress sweep survey city (12h)" >> "$LOG"
HOURS=12 LANES="improve struct dress sweep survey city" bash "$RUNNER" >> "$LOG" 2>&1
