#!/bin/bash
# Mac-side renderer for a GPU-less sequencer (eidoverse.animalabs.ai).
#
# The renderer is just the browser client with ?renderer: an invisible
# spectator that answers the server's /snap requests — agent vision. It DIALS
# OUT, so this Mac needs no inbound access; it only needs a live Chrome tab
# with WebGPU. The client auto-reconnects its websocket (1.5s retry), so this
# script only has to resurrect Chrome itself if the process dies.
#
#   SHOW_URL=https://eidoverse.animalabs.ai WORLD=commons KEY=doorkey \
#     deploy/run-mac-renderer.sh
#
# One instance per world (a renderer serves the world it joins). Run a second
# copy with a different WORLD/PORT for a second world.

set -u
SHOW_URL="${SHOW_URL:?set SHOW_URL (e.g. https://eidoverse.animalabs.ai)}"
WORLD="${WORLD:-commons}"
KEY="${KEY:-}"
PORT="${PORT:-9223}" # devtools port; unique per instance
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

URL="${SHOW_URL}/?world=${WORLD}&renderer&name=mac-gpu-${WORLD}"
[ -n "$KEY" ] && URL="${URL}&key=${KEY}"

echo "[mac-renderer] serving /snap for world '${WORLD}' via ${SHOW_URL}"
while true; do
  "$CHROME" \
    --headless=new \
    --remote-debugging-port="$PORT" \
    --user-data-dir="/tmp/eido-renderer-${WORLD}" \
    --no-first-run --disable-extensions \
    "$URL"
  echo "[mac-renderer] chrome exited ($?) — relaunching in 3s"
  sleep 3
done
