# Snapchat — Public Profile API (allowlist)

No application form: the API is allowlist-only, and an emailed client ID is the approval.
The adapter follows the current docs (developers.snap.com → Public Profile API: Get Started,
Profiles, Profile Asset Management) and is tested against a mock only. It has not touched the
live API; the first connection after allowlisting is the real test.

## [F]
1. Snapchat account (ideally a shared FF team account) + a **Snap Business** organization with FF's
   **Public Profile**, created at ads.snapchat.com.
2. Ads Manager → **Business Dashboard → Business Details** → create app **Siar**.
   Do **not** use the Snap Developer Portal: its client IDs do not work with this API.
   Redirect URI: https://api.siaran.my/api/v1/social-account/callback/SNAPCHAT
   Scope: `snapchat-profile-api`.
3. Email your Snap partner contact the **client ID only** (never the secret) and ask for the app to be
   allowlisted for the Public Profile API (Stories, Saved Stories, Spotlight posting). Paste:
   *"Siar is a publishing tool. Creators and brands connect their own Public Profile to post
   Stories, Saved Stories and Spotlight videos they created, scheduled from one dashboard and
   API. We only act on the connected profile and only post content the profile owner uploaded."*
   Until it is allowlisted every call answers 403 `AUTHORIZATION_PERMISSION_DENIED`.
4. Keys → server env: `NETWORK_SNAPCHAT_CLIENT_ID` / `NETWORK_SNAPCHAT_CLIENT_SECRET`.

## Behaviour to know
- Video is `.mp4` only, at least 540×960; Story 5–60 s, Spotlight 6–60 s. Spotlight needs a `locale`
  (e.g. `en_US`), description up to 160 characters. Saved Story title up to 45 characters, 5 minutes in total.
- A Story returns no id from Snap, so Siar records the media id as its reference. A Spotlight is
  `SUBMITTED` until Snap approves it, then `LIVE` or `REJECTED` (Siar shows it as in review and polls).
- Access tokens last 60 minutes and are refreshed automatically.
