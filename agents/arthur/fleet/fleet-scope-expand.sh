#!/usr/bin/env bash
# fleet-scope-expand.sh — Bill commission widening 2026-09-06 ("expand scope
# hella"): relaunch fleet WITH dress (round-3 queues freshly authored in
# DRESSING-PLAN.md § "ROUND 3 — EXPANDED SCOPE"). Waits for any prior
# chained relaunch (fleet-dress-park.sh) to finish, then launches the full
# working set: improve struct dress sweep survey.
set -u
FLEET_DIR="/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/fleet"
LOG="$FLEET_DIR/logs/fleet.log"
RUNNER="$FLEET_DIR/fleet-pipeline.sh"
cd /Users/t3rpz/projects/eidoverse-worlds
# wait for any pipeline currently running (incl. the dress-park relaunch)
while pgrep -f "fleet-pipeline.sh" >/dev/null 2>&1; do sleep 30; done
# safety: no STOP left over
rm -f "$FLEET_DIR/STOP"
sleep 15
echo "[$(date '+%F %T')] scope-expand: launching improve struct dress sweep survey (rest of 24h window, dress round-3 armed)" >> "$LOG"
HOURS=20 LANES="improve struct dress sweep survey" bash "$RUNNER" >> "$LOG" 2>&1
