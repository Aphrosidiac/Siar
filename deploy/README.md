# Deploying Siar

Dedicated Ubuntu 24.04 VPS (4 vCPU / 8 GB to start), Cloudflare in front (proxied, SSL Full strict).
**Nothing here runs without Fakhrul's go** (deploys are never automatic).

1. DNS (Cloudflare): `siar.dev`, `www`, `app`, `api`, `media` → the VPS IP, proxied.
   Cloudflare → SSL/TLS → Origin Server → create a certificate for `siar.dev, *.siar.dev`; save as
   `~/.config/siar/origin.pem` and `origin.key` on the Mac.
2. `SIAR_HOST=<alias> SIAR_DOMAIN=siar.dev deploy/setup-server.sh` — provisions the box.
3. Fill network/billing/storage/SMTP secrets in `/srv/siar/apps/api/.env` on the server as they
   arrive (docs/approvals). Networks without keys stay unavailable — the API says so.
4. `SIAR_HOST=<alias> SIAR_DOMAIN=siar.dev deploy/deploy.sh` — push to GitHub, build, migrate,
   reload, publish the site, swap nginx only if `nginx -t` passes, health check.

Media: start with local storage on the VPS disk (`/srv/siar-storage`); switch to Cloudflare R2
(`STORAGE_DRIVER=s3`) before volume grows. Backups: nightly `pg_dump`, 14 days, `/var/backups/siar`
— copy them off the box (R2) once billing is live.
