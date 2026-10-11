#!/usr/bin/env bash
# Deploy Siar. Run from the Mac, repo root:   SIAR_HOST=<ssh-alias> SIAR_DOMAIN=siaran.my deploy/deploy.sh
# GitHub first (main, clean tree), then a git bundle to the server (private repo, no deploy key),
# build as `siar`, migrate, reload pm2, publish the static site, swap the nginx vhosts only if
# `nginx -t` passes, health check through the public URL.
set -euo pipefail
HOST="${SIAR_HOST:?set SIAR_HOST}"
DOMAIN="${SIAR_DOMAIN:-siaran.my}"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
[ "$BRANCH" = "main" ] || { echo "Deploy from main (on $BRANCH)."; exit 1; }
[ -z "$(git status --porcelain)" ] || { echo "Commit your changes first."; exit 1; }
git push origin main
SHA="$(git rev-parse HEAD)"
BUNDLE="$(mktemp -t siar).bundle"
git bundle create -q "$BUNDLE" main
REMOTE_BUNDLE=$(ssh "$HOST" mktemp --suffix=.bundle)
scp -q "$BUNDLE" "$HOST:$REMOTE_BUNDLE" && rm -f "$BUNDLE"
ssh "$HOST" "chmod 644 $REMOTE_BUNDLE && sudo -n -iu siar BUNDLE='$REMOTE_BUNDLE' SHA='$SHA' DOMAIN='$DOMAIN' bash -se" <<'REMOTE'
set -euo pipefail
cd /srv/siar
git fetch -q "$BUNDLE" main && git reset -q --hard "$SHA"
pnpm install --frozen-lockfile
pnpm --filter @siar/contract build
pnpm --filter @siar/api db:generate
pnpm --filter @siar/api build
pnpm --filter @siar/web build
SITE_DOMAIN="$DOMAIN" pnpm --filter @siar/site build
rsync -a --delete apps/site/dist/ /var/www/siar-site/
cd apps/api && npx prisma migrate deploy && cd ../..
pm2 startOrReload deploy/ecosystem.config.cjs --update-env
pm2 save
sleep 4
curl -fsS http://127.0.0.1:3290/api/v1/ >/dev/null
REMOTE
ssh "$HOST" "rm -f $REMOTE_BUNDLE"
ssh "$HOST" "sudo -n DOMAIN='$DOMAIN' bash -s" <<'NGINX'
set -e
src=/srv/siar/deploy/nginx/siar.conf
c=/etc/nginx/sites-available/siar.conf
[ -f $c ] && cp $c $c.prev
sed "s/__DOMAIN__/$DOMAIN/g" $src > $c
ln -sf $c /etc/nginx/sites-enabled/siar.conf
if nginx -t 2>/dev/null; then systemctl reload nginx; else
  echo "nginx -t rejected the new vhost; keeping the previous one" >&2
  if [ -f $c.prev ]; then mv $c.prev $c; else rm -f /etc/nginx/sites-enabled/siar.conf; fi
  nginx -t && systemctl reload nginx; exit 1
fi
NGINX
curl -fsS "https://api.$DOMAIN/api/v1/" >/dev/null && echo "api.$DOMAIN live"
