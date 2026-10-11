#!/usr/bin/env bash
# Fails on a raw font-size or an off-scale font-weight in the dashboard.
# Sizes come from the --fs-* tokens in apps/web/src/styles.css; weights are 400/500/600.
# A deliberate exception carries a `type-ok` comment on the same line.
set -euo pipefail
cd "$(dirname "$0")/../apps/web/src"
scan() { grep -rnE "$1" --include='*.vue' --include='*.css' . | grep -v 'type-ok' | grep -v '^./styles.css' || true; }
sizes=$(scan 'font-size:\s*([0-9.]+(px|rem)|clamp)')
weights=$(scan 'font-weight:\s*[0-9]{3}' | grep -vE 'font-weight:\s*(400|500|600)\b' || true)
out=$(printf '%s\n%s\n' "$sizes" "$weights" | sed '/^$/d')
[ -z "$out" ] || { echo "Off-scale type (use var(--fs-*), weights 400/500/600 — CLAUDE.md Look):"; echo "$out"; exit 1; }
echo "type: ok"
