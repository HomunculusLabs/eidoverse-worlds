#!/usr/bin/env bash
# fleet-24h-handoff.sh — 24h useful-work handoff (town-4, Bill directive
# 2026-09-06: "keep going for the next 24 hours, all jobs useful").
# Waits for both running pipeline fleets (main PID $1, survey PID $2) to
# reach their STOP-file boundary (in-flight ticks finish cleanly), then
# relaunches ONE curated 24-hour fleet: only lanes with real work.
# Parked (hold-only on Bill verdicts): approach, waysign, artwalk, night.
# Resume any parked lane: touch nothing — just run
#   LANES="<lane>" HOURS=<n> bash fleet-pipeline.sh
set -u
MAIN_PID="$1"; SURVEY_PID="$2"
FLEET_DIR="/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/fleet"
LOG="$FLEET_DIR/logs/fleet.log"
RUNNER="$FLEET_DIR/fleet-pipeline.sh"

echo "[$(date '+%F %T')] 24h-handoff: waiting on mains $MAIN_PID + $SURVEY_PID (STOP placed)" >> "$LOG"
while kill -0 "$MAIN_PID" 2>/dev/null || kill -0 "$SURVEY_PID" 2>/dev/null; do sleep 30; done
echo "[$(date '+%F %T')] 24h-handoff: fleets drained; clearing STOP" >> "$LOG"
rm -f "$FLEET_DIR/STOP"
sleep 20
echo "[$(date '+%F %T')] 24h-handoff: launching curated 24h fleet (improve struct dress sweep survey)" >> "$LOG"
HOURS=24 LANES="improve struct dress sweep survey" nohup bash "$RUNNER" >> "$LOG" 2>&1 &
NEW_PID=$!
echo "[$(date '+%F %T')] 24h-handoff: new fleet PID $NEW_PID — parked: approach waysign artwalk night (all Bill-verdict-bound)" >> "$LOG"
