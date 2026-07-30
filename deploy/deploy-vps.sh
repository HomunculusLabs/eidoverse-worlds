#!/usr/bin/env bash
# Deploy eidoverse-worlds on the show VPS (eidoverse.animalabs.ai).
# Run ON the VPS:   ~/eidoverse-worlds/deploy/deploy-vps.sh
# Or from anywhere: ssh ubuntu@eidoverse.animalabs.ai eidoverse-worlds/deploy/deploy-vps.sh
#
# Code comes from git (origin/main). Everything the working tree accumulates
# at runtime — worlds/, mcpl/tokens.json, mcpl/state.json, assets/ — is
# gitignored and survives untouched. Assets travel by rsync, not git.
set -euo pipefail
cd "$(dirname "$0")/.."

BUN="$HOME/.bun/bin/bun"

before=$(git rev-parse --short HEAD)
git fetch origin main
git reset --hard origin/main
after=$(git rev-parse --short HEAD)
echo "code: $before -> $after"

# deps only when the lockfiles moved
if ! git diff --quiet "$before" "$after" -- client/package-lock.json 2>/dev/null; then
  (cd client && "$BUN" install)
fi
if ! git diff --quiet "$before" "$after" -- mcpl/package.json mcpl/package-lock.json 2>/dev/null; then
  (cd mcpl && "$BUN" install)
fi

sudo systemctl restart eidoverse eidoverse-mcpl
sleep 2
systemctl is-active eidoverse eidoverse-mcpl
echo "deployed $after"
