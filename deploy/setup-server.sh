#!/usr/bin/env bash
# First-time provisioning of a DEDICATED Ubuntu 24.04 box for Siar (docs/PLAN.md D6).
# Run from the Mac, repo root:   SIAR_HOST=<ssh-alias> SIAR_DOMAIN=siaran.my deploy/setup-server.sh
# Idempotent. Installs: Node 22 + pnpm + pm2, PostgreSQL 16, Redis, ffmpeg, nginx, ufw.
# Creates user `siar`, db `siar`, /srv/siar, apps/api/.env with generated secrets (never overwritten),
# nightly pg_dump (14 days), Cloudflare origin certificate from ~/.config/siar/origin.{pem,key}.
set -euo pipefail
HOST="${SIAR_HOST:?set SIAR_HOST to the ssh alias of the Siar server}"
DOMAIN="${SIAR_DOMAIN:-siaran.my}"
CONF="$HOME/.config/siar"
[ -s "$CONF/origin.pem" ] && [ -s "$CONF/origin.key" ] || { echo "No Cloudflare origin certificate in $CONF (origin.pem/origin.key for *.$DOMAIN + $DOMAIN)." >&2; exit 1; }
STAGE=$(ssh "$HOST" mktemp -d)
scp -q "$CONF/origin.pem" "$CONF/origin.key" "$HOST:$STAGE/"
ssh "$HOST" "sudo -n STAGE='$STAGE' DOMAIN='$DOMAIN' bash -s" <<'REMOTE'
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive NEEDRESTART_MODE=l
apt-get update -qq
apt-get install -y -qq postgresql-16 redis-server ffmpeg nginx ufw curl git ca-certificates >/dev/null
systemctl enable --now postgresql redis-server nginx >/dev/null

NODE_DIR=/opt/node22
if ! "$NODE_DIR/bin/node" -v 2>/dev/null | grep -q '^v22\.'; then
  t=$(mktemp -d); base=https://nodejs.org/dist/latest-v22.x
  tarball=$(curl -fsSL "$base/SHASUMS256.txt" | awk '/linux-x64.tar.xz$/ {print $2}')
  curl -fsSL "$base/$tarball" -o "$t/$tarball"
  rm -rf "$NODE_DIR" && mkdir -p "$NODE_DIR" && tar -xJf "$t/$tarball" -C "$NODE_DIR" --strip-components=1 && rm -rf "$t"
fi
[ -x "$NODE_DIR/bin/pm2" ] || PATH="$NODE_DIR/bin:$PATH" npm install -g --prefix "$NODE_DIR" pm2@latest >/dev/null

id -u siar >/dev/null 2>&1 || useradd -m -s /bin/bash siar
grep -q node22 /home/siar/.profile || echo 'export PATH="/opt/node22/bin:$HOME/.local/bin:$PATH"' >> /home/siar/.profile
sudo -iu siar bash -c 'command -v pnpm >/dev/null || npm install -g --prefix ~/.local pnpm@11 >/dev/null'

mkdir -p /srv/siar /var/backups/siar /srv/siar/current/site
[ -d /srv/siar/.git ] || git init -q -b main /srv/siar
chown -R siar:siar /srv/siar /srv/siar/current/site && chown postgres:postgres /var/backups/siar

ENV=/srv/siar/apps/api/.env
mkdir -p /srv/siar/apps/api && chown siar:siar /srv/siar/apps /srv/siar/apps/api
if [ ! -f "$ENV" ]; then
  pw=$(openssl rand -hex 18)
  sudo -u postgres psql -qtc "SELECT 1 FROM pg_roles WHERE rolname='siar'" | grep -q 1 \
    && sudo -u postgres psql -qc "ALTER ROLE siar PASSWORD '$pw'" \
    || sudo -u postgres psql -qc "CREATE ROLE siar LOGIN PASSWORD '$pw'"
  install -o siar -g siar -m 600 /dev/null "$ENV"
  cat > "$ENV" <<ENVFILE
NODE_ENV=production
PORT=3290
HOST=127.0.0.1
DATABASE_URL=postgresql://siar:$pw@127.0.0.1:5432/siar
REDIS_URL=redis://127.0.0.1:6379/0
SESSION_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)
APP_URL=https://app.$DOMAIN
API_URL=https://api.$DOMAIN
MEDIA_URL=https://media.$DOMAIN/media
SITE_URL=https://$DOMAIN
STORAGE_DRIVER=local
STORAGE_DIR=/srv/siar-storage
NETWORK_MODE=live
BILLING_MODE=mock
SMTP_URL=
MAIL_FROM="Siar <hello@$DOMAIN>"
RUN_JOBS_IN_API=false
STAFF_EMAILS=hello@ffdev.studio
# Network app credentials: NETWORK_<TYPE>_<KEY>=… (docs/approvals). A network is available once its keys are set.
# Stripe / CHIP: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, CHIP_SECRET_KEY, CHIP_BRAND_ID, then BILLING_MODE=live.
# R2: STORAGE_DRIVER=s3, S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY.
ENVFILE
fi
mkdir -p /srv/siar-storage && chown siar:siar /srv/siar-storage
sudo -u postgres psql -qtc "SELECT 1 FROM pg_database WHERE datname='siar'" | grep -q 1 || sudo -u postgres createdb -O siar siar

mkdir -p /etc/ssl/cloudflare
install -o root -g root -m 644 "$STAGE/origin.pem" /etc/ssl/cloudflare/$DOMAIN.pem
install -o root -g root -m 600 "$STAGE/origin.key" /etc/ssl/cloudflare/$DOMAIN.key
rm -rf "$STAGE"

cat > /etc/cron.d/siar-backup <<CRON
20 3 * * * postgres pg_dump -Fc siar > /var/backups/siar/siar-\$(date +\%F).dump && find /var/backups/siar -name '*.dump' -mtime +14 -delete
CRON

ufw allow OpenSSH >/dev/null; ufw allow 'Nginx Full' >/dev/null; ufw --force enable >/dev/null
[ -f /etc/systemd/system/pm2-siar.service ] || env PATH="/opt/node22/bin:$PATH" pm2 startup systemd -u siar --hp /home/siar >/dev/null
echo "server ready for $DOMAIN — run deploy/deploy.sh"
REMOTE
