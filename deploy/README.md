# Deploying Siar

Dedicated Ubuntu 24.04 VPS (4 vCPU / 8 GB to start), Cloudflare in front (proxied, SSL Full strict).
**Nothing here runs without Fakhrul's go** (deploys are never automatic).

1. DNS (Cloudflare): `siaran.my`, `www`, `app`, `api`, `media` → the VPS IP, proxied.
   Cloudflare → SSL/TLS → Origin Server → create a certificate for `siaran.my, *.siaran.my`; save as
   `~/.config/siar/origin.pem` and `origin.key` on the Mac.
2. `SIAR_HOST=<alias> SIAR_DOMAIN=siaran.my deploy/setup-server.sh` — provisions the box.
3. Fill network/billing/storage/SMTP secrets in `/srv/siar/apps/api/.env` on the server as they
   arrive (docs/approvals). Networks without keys stay unavailable — the API says so.
4. `SIAR_HOST=<alias> SIAR_DOMAIN=siaran.my deploy/deploy.sh` — push to GitHub, build, migrate,
   reload, publish the site, swap nginx only if `nginx -t` passes, health check.

Media: start with local storage on the VPS disk (`/srv/siar-storage`); switch to Cloudflare R2
(`STORAGE_DRIVER=s3`) before volume grows. Backups: nightly `pg_dump`, 14 days, `/var/backups/siar`
— copy them off the box (R2) once billing is live.

## Shared box (current: lewixportal-vps, since 2026-10-12)

Siar runs on the shared Tencent box next to ~25 other apps, so nothing is installed or built there.

- `deploy/deploy-shared.sh` builds on the Mac (API bundle, Linux x64 production `node_modules` via
  `pnpm deploy`, dashboard, site), rsyncs a release to `/srv/siar/releases/<sha>` (hard-linked against
  the live one), then on the box: takes the box-wide `/tmp/vps-deploy.lock`, waits for 400 MB free,
  backs up the database to `/srv/siar/shared/backups`, runs `prisma migrate deploy`, points
  `/srv/siar/current` at the release, restarts `siar-api` (pm2 as user `siar`), health-checks with
  rollback, and swaps the nginx vhost only if `nginx -t` passes.
- One process: `RUN_JOBS_IN_API=true` (no separate worker) to save memory; it also serves the dashboard.
- One-time setup done 2026-10-12: user `siar`, `/srv/siar/{releases,shared}`, Postgres role + db `siar`,
  Redis db 11, `/srv/siar/shared/.env` (secrets generated on the box, mode 600), `pm2-siar.service`,
  origin certificate `/etc/ssl/cloudflare/siaran.my.{pem,key}`.
- Cloudflare: DNS `siaran.my`, `www`, `app`, `api`, `media` → the box, proxied; R2 bucket `siar-media`
  (`STORAGE_DRIVER=s3`). Mail: Resend key `siar-prod`, sending from `hello@ffdev.studio` (the Resend
  plan's domain limit is reached, so siaran.my is not a sending domain yet).
- Deploy credentials live in `.env.deploy` (git-ignored) at the repo root.
