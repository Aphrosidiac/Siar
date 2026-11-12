#!/usr/bin/env bash
# Siar analytics from the Mac (docs/ANALYTICS.md): runs the metrics CLI on the box, as the siar user, with the server env.
#   scripts/metrics.sh report [days]      markdown report (default 7 days)
#   scripts/metrics.sh json [days]        the same report as JSON
#   scripts/metrics.sh ingest             read the traffic log now (normally every 10 minutes)
#   scripts/metrics.sh search             pull Google Search Console and Bing now (normally 02:20 and 14:20 UTC)
#   scripts/metrics.sh sql "SELECT …"     any read-only query, rows as JSON
set -euo pipefail
HOST="${SIAR_HOST:-lewixportal-vps}"
cmd="${1:-report}"; shift || true
case "$cmd" in
  report) args="report --days ${1:-7}" ;;
  json) args="report --days ${1:-7} --json" ;;
  ingest|search) args="$cmd" ;;
  sql) args="sql $(printf '%q' "$*")" ;;
  *) sed -n '2,8p' "$0"; exit 1 ;;
esac
ssh "$HOST" "cd /srv/siar/current/api && sudo -n -u siar /opt/node22/bin/node --env-file=/srv/siar/shared/.env dist/metrics-cli.js $args"
