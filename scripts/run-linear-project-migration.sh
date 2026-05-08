#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 4 ]]; then
  echo "Usage: $0 <old_api_key> <old_project_name> <new_api_key> <new_project_name>"
  exit 1
fi

OLD_API_KEY="$1"
OLD_PROJECT_NAME="$2"
NEW_API_KEY="$3"
NEW_PROJECT_NAME="$4"

node "scripts/linear-migrate-project.mjs" \
  --oldApiKey "$OLD_API_KEY" \
  --oldProjectName "$OLD_PROJECT_NAME" \
  --newApiKey "$NEW_API_KEY" \
  --newProjectName "$NEW_PROJECT_NAME"
