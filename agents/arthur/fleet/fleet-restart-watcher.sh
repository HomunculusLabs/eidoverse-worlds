#!/usr/bin/env bash
# fleet-restart-watcher.sh — chained fleet handoff (improve-5w, 2026-09-06)
# Waits for the OLD fleet-runner (PID $1) to exit at its next wave boundary
# (STOP file already placed — it checks between waves, never mid-wave),
# then clears STOP and launches the NEW 6-lane fleet from the widened
# runner. Killing the old PID directly would abort its in-flight improve
# tick mid-mutation; the STOP-file handoff loses zero work.
set -u
OLD_PID="$1"
FLEET_DIR="/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/fleet"
LOG="$FLEET_DIR/logs/fleet.log"
RUNNER="$FLEET_DIR/fleet-runner.sh"

echo "[$(date '+%F %T')] restart-watcher: waiting on old fleet PID $OLD_PID (STOP placed)" >> "$LOG"
while kill -0 "$OLD_PID" 2>/dev/null; do sleep 20; done
echo "[$(date '+%F %T')] restart-watcher: old fleet gone; clearing STOP" >> "$LOG"
rm -f "$FLEET_DIR/STOP"
# settle: honor the runner's WAVE_SPACER so the last wave's ledger commits
# are fully flushed before the new fleet's first census/gate reads them
sleep 130
echo "[$(date '+%F %T')] restart-watcher: launching 6-lane fleet (HOURS=8)" >> "$LOG"
HOURS=8 nohup bash "$RUNNER" >> "$LOG" 2>&1 &
NEW_PID=$!
echo "[$(date '+%F %T')] restart-watcher: new fleet PID $NEW_PID; handoff complete" >> "$LOG"
