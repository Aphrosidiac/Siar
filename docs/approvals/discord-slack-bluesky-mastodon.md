# Discord, Slack, Bluesky, Mastodon — no review

## Discord [F: create the app]
discord.com/developers → New Application "Siar" → Bot (no privileged intents) → OAuth2 redirect
https://api.siar.dev/api/v1/social-account/callback/DISCORD. Env: NETWORK_DISCORD_CLIENT_ID,
NETWORK_DISCORD_CLIENT_SECRET, NETWORK_DISCORD_BOT_TOKEN. Verification is only required once the
bot is in 100+ servers (then: identity verification of the team owner).

## Slack [F: create the app]
api.slack.com/apps → Create "Siar" → OAuth & Permissions: redirect
https://api.siar.dev/api/v1/social-account/callback/SLACK, bot scopes as in the Slack adapter →
Manage Distribution → **Activate Public Distribution** (no review needed; the Slack Marketplace
listing is optional and can come later). Env: NETWORK_SLACK_CLIENT_ID / CLIENT_SECRET.

## Bluesky
Nothing to register. Siar serves its OAuth client metadata at
https://api.siar.dev/api/v1/oauth/bluesky/client-metadata.json (client_id = that URL).

## Mastodon
Nothing to register. Siar registers itself as an app on each Mastodon server the first time a
user from that server connects.
