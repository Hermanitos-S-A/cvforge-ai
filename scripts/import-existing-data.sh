#!/usr/bin/env bash
# One-time, non-destructive migration from the former Windows/host data bind
# mount (./data) to the ePersona Docker named volume.
set -Eeuo pipefail

if [[ ! -f docker-compose.yml ]]; then
  echo 'Run this script from the ePersona repository root.' >&2
  exit 1
fi
if [[ ! -d data ]] || [[ -z "$(find data -mindepth 1 -maxdepth 1 -print -quit)" ]]; then
  echo 'No existing files in ./data; no import is necessary.'
  exit 0
fi
if ! command -v docker >/dev/null 2>&1; then
  echo 'Docker is required to import the local data.' >&2
  exit 1
fi
if [[ -z "${SECRET_KEY:-}" ]]; then
  echo 'Set SECRET_KEY in this terminal before running the importer.' >&2
  exit 1
fi

# Caller must stop the original Compose project before copying SQLite files.
# Never overwrite an initialized named volume: an operator must reconcile it.
echo 'Verifying source files and target volume...'
# Build the backend image if needed, without starting the application.
docker compose build backend

# Keep the original source data on disk. Back it up before copying.
backup="../epersona-data-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$backup" data
echo "Source backup written to: $backup"

# Avoid MSYS/Git Bash translating Linux mount destinations on Windows.
MSYS_NO_PATHCONV=1 docker compose run --rm --no-deps --user 0 \
  --volume ./data:/legacy-data:ro --entrypoint sh backend -ec '
  if [ -n "$(ls -A /app/data)" ]; then
    echo "Target volume has files already. Refusing to overwrite existing data." >&2
    exit 2
  fi
  cp -a /legacy-data/. /app/data/
  chown -R 10001:10001 /app/data
  echo "Existing user data copied to the writable Docker volume."
'
echo 'Original ./data and backup remain intact; no source files were deleted.'
