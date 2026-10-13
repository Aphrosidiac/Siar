# TikTok — Login Kit + Content Posting API (Direct Post)

**Status: SUBMITTED, in review since 2026-10-13 22:21 MYT.** Production keys arrive when TikTok approves.
Until then production runs on the **sandbox** keys and only the sandbox target user can connect.

## Identifiers

| | |
|---|---|
| Developer account | hello@ffdev.studio (email + password; TikTok's portal has no Google sign-in) |
| Organization | FF DEV STUDIO — 7696076379615659029 |
| App | **Siar** — 7696085856649693236 (type "Other") |
| Sandbox | "Siar review" — 7696050807262955540 |
| Sandbox target user | ffdev.studio (the FF TikTok account) |
| Redirect URI | https://api.siaran.my/api/v1/social-account/callback/TIKTOK |
| Website / Terms / Privacy | https://siaran.my · /terms · /privacy |
| Domain verification | siaran.my, DNS TXT. Production and Sandbox each have their own token, so the siaran.my zone carries **two** `tiktok-developers-site-verification=` TXT records. Keep both. A domain property covers every subdomain (media.siaran.my for PULL_FROM_URL). |
| Category / description | Business · "Publish and schedule videos and photo posts to your own TikTok account from one dashboard and API." (≤120) |
| Products | Login Kit, Content Posting API with **Direct Post** on |
| Scopes (6) | user.info.basic, user.info.profile, user.info.stats, video.list, video.publish, video.upload |

The six Business-API scopes Siar also knows (user.info.username, user.account.type, user.insights,
video.insights, comment.list, comment.list.manage) belong to a separate TikTok API for Business app and are
**not** part of this application. siaran.my/tiktok-api lists the two groups separately (`scopeGroups`).

## What was submitted

- **Scope explanation** (864 chars):
  > Siar (siaran.my) is a social media publishing dashboard and API. Creators connect their own TikTok account and post to it. Demo: Siar sandbox, FF Dev Studio's account (private, as required before audit).
  > Login Kit + user.info.basic: sign-in; avatar and nickname shown in the composer.
  > user.info.profile: the @username on the connected account.
  > user.info.stats: followers and likes in Analytics.
  > video.publish: the composer reads creator_info, shows the creator, offers only their privacy levels with no default, greys out interactions they turned off, checks max duration, handles commercial disclosure and labels, shows the Music Usage Confirmation, then direct-posts and shows the status.
  > video.upload: "Send to TikTok drafts" uploads to the creator's inbox to finish in TikTok.
  > video.list: Analytics → Past posts lists the creator's videos with views and likes.
- **Submission reason:** "First submission: Login Kit + Content Posting API (Direct Post) for Siar's publishing dashboard."
- **Demo videos** (TikTok allows up to 5 files, 50 MB each; no length limit):
  - `review/out/K1.mp4` (3:36): connect → TikTok consent with all 6 scopes → composer (creator_info, privacy,
    interactions, disclosure, label, Music Usage Confirmation) → Direct Post → the private video on
    tiktok.com with caption, "Private", "Promotional content", comments on → second post sent to TikTok
    drafts (status Review) → Analytics stats (49 followers / 160 likes) → Past posts (video.list) with views.
  - `review/out/K2.mp4` (0:58): the post form up close, nothing posted: preview, disclosure on with no option
    → Publish disabled with TikTok's text, Your brand → "Promotional content", Branded content → "Paid
    partnership" + Branded Content Policy, Only me disabled ("Branded content visibility cannot be set to
    private."), Friends allowed.

## Content Sharing Guidelines — how Siar meets each point

Checked line by line against developers.tiktok.com/doc/content-sharing-guidelines on 2026-10-13.

| # | Requirement | Siar |
|---|---|---|
| 1 | Read creator_info when the post page renders; show the creator's nickname | `GET /misc/tiktok/creator-info` (`misc.tiktok.getCreatorInfo`) on account change; "Posting as" shows creator_info nickname/avatar/username |
| 2 | Stop and tell the user when the creator can't post (caps, bans) | creator_info errors `spam_risk_too_many_posts`, `spam_risk_user_banned_from_posting`, `reached_active_user_cap` → `canPost: false` + reason; Publish disabled |
| 3 | Check `max_video_post_duration_sec` | video length vs max → danger callout + Publish disabled (also enforced server-side in the adapter) |
| 4 | Privacy dropdown from `privacy_level_options`, no default | options filtered to the creator's; placeholder, no default; cleared if it stops being allowed |
| 5 | Comment/Duet/Stitch off by default; greyed when creator_info disables them; photos show Comment only | yes; "Turned off in this account's TikTok settings." |
| 6 | Disclosure toggle off by default; Your brand / Branded content; exact label texts; Publish disabled when on with nothing chosen + hover text | yes; "Your video will be labeled as 'Promotional content' / 'Paid partnership'"; Publish disabled with "You need to indicate if your content promotes yourself, a third party, or both." |
| 7 | Branded content only public/friends; Only me disabled with "Branded content visibility cannot be set to private." | yes, both directions (Only me chosen → Branded content disabled with the reason) |
| 8 | Consent line before Publish: Music Usage Confirmation (+ Branded Content Policy when branded) | yes |
| 9 | Preview of the to-be-posted content; upload only after consent | Preview (video player / photos + caption) in the TikTok tab; nothing is sent before "Publish now" is confirmed |
| 10 | No watermarks; preset text editable | Siar adds nothing; the caption is the user's |
| 11 | Tell the user processing takes minutes; follow status | note under the consent line; publisher polls `status/fetch` |

## Rules learned the hard way

- **Unaudited apps can only post to a PRIVATE TikTok account.** "Only me" on the post is not enough: a post to a
  public account fails with `unaudited_client_can_only_post_to_private_accounts` (TikTok's message: "Please review our
  integration guidelines…"). @ffdev.studio was switched to private for testing. With the account private,
  creator_info no longer offers "Everyone", and Duet/Stitch come back disabled.
- **Production cannot be saved without a demo video**, and the demo must be filmed on the sandbox. Configure the
  sandbox, film, then Production → Import → from Sandbox copies everything (icon, URLs, products, scopes, redirect,
  Direct Post); then paste the explanation and upload the videos.
- **Unaudited caps:** at most 5 users posting per 24 h; ~15 posts/day per creator across all Direct Post apps.
- **TikTok's status fetch can answer `internal_error` while the post succeeds.** Siar used to fail the target and a
  retry published the video a second time (two private copies on @ffdev.studio). The publisher now re-polls on a
  transient error (commit 72ab56b, `pollTarget` in apps/api/src/engine/publisher.ts).
- **Private posts have no public id**: `publicaly_available_post_id` is empty, so Siar shows Posted with no link and
  per-post analytics can't be read. video.list (Past posts) only returns public videos.
- **Disconnect → reconnect makes a new account row**: analytics snapshots and imported past posts start again.

## How the films were made (reusable)

The Meta App Review rig in `scripts/meta-review/` (see docs/approvals/meta-review-plan.md §4–5):
- `caffeinate -dimu` running; Chrome (Work profile) fronted on the laptop screen with the Siar tab active
  (`osascript … set active tab index`), viewport 1408×708 at the bottom of the screen.
- `scripts/meta-review/rec.sh start K1 708` → drive the page with claude-in-chrome → `rec.sh mark "<caption>"`,
  `rec.sh url <url>`, `@cut` / `@cut off` around redirects, `@fast 4` / `@fast 1` around network waits →
  `rec.sh stop`.
- Inject the cursor overlay (`scripts/meta-review/cursor.js`) after every full page load; it also hides the
  extension's glow and pointer.
- `node scripts/meta-review/edit.mjs K1` renders (title card from `films.json`: `review`, `label`, `footer`;
  `tail: "K1b"` appends a re-shot ending). `python3 scripts/meta-review/review.py K1` checks it.
- Traps: two `@cut` marks without `@cut off` between them — the second one resets the first. URL marks must sit
  where the page actually changes (check the raw take, not the EDL arithmetic). review.py's "extension pointer"
  check fires on TikTok's red/orange UI (false positive) — look at the frames. Its "longer than 3 min" is a Meta
  limit, not TikTok's.

## After approval (runbook)

1. App page → Production → copy the **production** client key and secret.
2. `Siar/.env.networks`: replace the sandbox `NETWORK_TIKTOK_CLIENT_KEY` / `NETWORK_TIKTOK_CLIENT_SECRET`.
3. Server: back up `/srv/siar/shared/.env`, swap the two lines (the sandbox block is marked
   `# TikTok SANDBOX (Siar review)`), `pm2 restart siar-api --update-env` as user `siar`.
4. Reconnect @ffdev.studio in Siar (tokens from the sandbox app don't work with production keys).
5. One public test post (with Fakhrul's yes), then check `/api/v1/` health and Past posts.
6. Optional later: request higher daily user caps if Siar's TikTok usage grows.

**If TikTok rejects:** the review comment names the point. Fix it, re-film only that part (K2-style clip), upload,
resubmit the same day. "Recall" on the app page pulls the submission back if something must change before review.

## Housekeeping (Fakhrul)

- Switch @ffdev.studio back to **public** (Siar's TikTok posts to it will fail until the audit passes; fine).
- Delete the test content in the TikTok app: three private "No templates" videos (two rehearsal, one filmed) and
  one draft in the inbox.
- The sandbox client secret was pasted in chat; rotate it if wanted (sandbox only).
