---
name: siar
description: Publish, schedule and inspect social media posts across 15 networks through the Siar API from a shell. Use when asked to post or schedule to Instagram, TikTok, YouTube, LinkedIn, X, Facebook, Threads, Pinterest, Reddit, Bluesky, Mastodon, Discord, Slack, Google Business or Snapchat, or to check post status, analytics, usage or X credit.
---

# siar CLI

Auth: `SIAR_API_KEY` (organization API key from the dashboard → API Keys). Optional `SIAR_API_URL`.
Output: JSON on stdout, progress on stderr. Exit codes: 0 ok, 2 usage, 3 auth, 4 not found,
5 validation (read `error.issues[].path`), 6 rate limited (retry later), 7 server/network.

## Typical flow
```bash
siar teams:list                                   # find the teamId
siar accounts:list --team <teamId>                # which networks are connected
siar posts:create --team <teamId> --networks INSTAGRAM,LINKEDIN --text "Launch day" --media ./photo.jpg --now
siar posts:get <postId>                           # status: SCHEDULED → PROCESSING → POSTED | ERROR
siar posts:retry <postId>                         # only when status is ERROR (max 6 retries)
```
Schedule with `--at 2026-10-20T09:00:00Z`; save a draft with `--draft`. Network-specific fields go in
`--data @data.json` keyed by network, e.g. `{"YOUTUBE":{"type":"SHORT"},"PINTEREST":{"boardName":"Ideas"}}`.
TikTok needs `"privacy"`; Reddit needs `"sr"`; Discord/Slack need `"channelId"`.

## Everything else
`siar call <operationId> --body '{…}' --query '{…}' --path '{…}'` reaches any API operation
(operationIds as in the API reference, e.g. `analytics.getPostAnalytics`, `misc.youtube.getChannelPlaylist`).
X posts cost credit ($0.015, $0.20 with a link): check `siar credits:balance` first.
