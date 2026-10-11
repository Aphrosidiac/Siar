#!/usr/bin/env bash
# Deploy Siar to a SHARED box (lewixportal-vps). Run from the Mac, repo root, on a clean main:
#   deploy/deploy-shared.sh
# Everything is built here and shipped as a release; the box never installs or builds (an install plus a
# build there once ran it out of memory and took every site down). On the box: the box-wide deploy lock,
# a database backup, migrations, the pm2 swap, a health check, then the nginx vhost only if `nginx -t` passes.
# One-time setup (user, database, env, pm2 service) is recorded in deploy/README.md.
set -euo pipefail
HOST="${SIAR_HOST:-lewixportal-vps}"
DOMAIN="${SIAR_DOMAIN:-siaran.my}"
cd "$(git rev-parse --show-toplevel)"
[ "$(git rev-parse --abbrev-ref HEAD)" = "main" ] || { echo "Deploy from main."; exit 1; }
[ -z "$(git status --porcelain)" ] || { echo "Commit your changes first."; exit 1; }
git push -q origin main
SHA="$(git rev-parse --short=12 HEAD)"
WORK="$(mktemp -d)"; OUT="$WORK/$SHA"; trap 'rm -rf "$WORK"' EXIT

echo "› build"
CI=true pnpm install --offline --frozen-lockfile >/dev/null
pnpm --filter @siar/contract build >/dev/null
pnpm --filter @siar/api db:generate >/dev/null
pnpm --filter @siar/api build >/dev/null
pnpm --filter @siar/web build >/dev/null
SITE_DOMAIN="$DOMAIN" pnpm --filter @siar/site build >/dev/null
# production dependencies for the box (Linux x64, glibc), assembled here
pnpm --filter @siar/api deploy --prod --legacy --os linux --cpu x64 --libc glibc "$OUT/api" >/dev/null
# `pnpm deploy` leaves the workspace marked as a Linux production install; put the Mac's back
CI=true pnpm install --offline --frozen-lockfile >/dev/null
rm -rf "$OUT/api/src" "$OUT/api/storage" "$OUT/api/scripts" "$OUT/api/tsup.config.ts" "$OUT/api/tsconfig.json" "$OUT/api"/.env*
sed -i '' '/dotenv\/config/d' "$OUT/api/prisma.config.ts"   # the box passes the env file instead
cp -R apps/web/dist "$OUT/web"
cp -R apps/site/dist "$OUT/site"
cp deploy/ecosystem.shared.cjs "$OUT/ecosystem.config.cjs"
sed "s/__DOMAIN__/$DOMAIN/g" deploy/nginx/siar.conf > "$OUT/nginx.conf"
echo "$SHA" > "$OUT/REVISION"

echo "› upload $SHA"
# hard-link unchanged files against the live release, so a deploy only sends what changed
rsync -az --delete --link-dest=/srv/siar/current/ --rsync-path="sudo -n -u siar rsync" "$OUT/" "$HOST:/srv/siar/releases/$SHA/"

echo "› release"
ssh "$HOST" "SHA='$SHA' DOMAIN='$DOMAIN' flock -w 1800 /tmp/vps-deploy.lock bash -s" <<'REMOTE'
set -euo pipefail
until [ "$(awk '/MemAvailable/{print int($2/1024)}' /proc/meminfo)" -ge 400 ]; do echo "waiting for memory"; sleep 10; done
R=/srv/siar/releases/$SHA
as_siar() { sudo -n -u siar env PATH=/opt/node22/bin:/usr/bin:/bin HOME=/home/siar "$@"; }
DB=$(sudo -n grep '^DATABASE_URL=' /srv/siar/shared/.env | cut -d= -f2-)
sudo -n -u siar bash -c "pg_dump '$DB' | gzip > /srv/siar/shared/backups/pre-$SHA.sql.gz"
(cd $R/api && as_siar node --env-file=/srv/siar/shared/.env node_modules/prisma/build/index.js migrate deploy)
PREV=$(readlink -f /srv/siar/current 2>/dev/null || true)
sudo -n -u siar ln -sfn $R /srv/siar/current
as_siar pm2 delete siar-api >/dev/null 2>&1 || true
as_siar pm2 start $R/ecosystem.config.cjs >/dev/null
as_siar pm2 save >/dev/null
ok=0; for i in $(seq 1 20); do sleep 2; curl -fsS -o /dev/null http://127.0.0.1:3290/api/v1/ && { ok=1; break; }; done
if [ $ok != 1 ]; then
  echo "health check failed; rolling back to ${PREV:-nothing}" >&2
  as_siar pm2 logs siar-api --lines 40 --nostream >&2 || true
  if [ -n "$PREV" ]; then sudo -n -u siar ln -sfn $PREV /srv/siar/current; as_siar pm2 delete siar-api >/dev/null 2>&1 || true; as_siar pm2 start $PREV/ecosystem.config.cjs >/dev/null; as_siar pm2 save >/dev/null; fi
  exit 1
fi
c=/etc/nginx/sites-available/siar.conf
sudo -n sh -c "[ -f $c ] && cp $c $c.prev || true; cp $R/nginx.conf $c; ln -sf $c /etc/nginx/sites-enabled/siar.conf"
if sudo -n nginx -t 2>/dev/null; then sudo -n systemctl reload nginx; else
  echo "nginx -t rejected the vhost; keeping the previous one" >&2
  sudo -n sh -c "if [ -f $c.prev ]; then mv $c.prev $c; else rm -f /etc/nginx/sites-enabled/siar.conf $c; fi; nginx -t && systemctl reload nginx"; exit 1
fi
# keep the three newest releases
ls -1dt /srv/siar/releases/*/ | tail -n +4 | while read d; do [ "$(readlink -f /srv/siar/current)/" = "$d" ] || sudo -n rm -rf "$d"; done
echo "released $SHA"
REMOTE
curl -fsS -o /dev/null "https://api.$DOMAIN/api/v1/" && echo "api.$DOMAIN live"
curl -fsS -o /dev/null "https://$DOMAIN/" && echo "$DOMAIN live"
