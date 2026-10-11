# X (Twitter) — pay-per-use, no review

## [F]
1. developer.x.com → sign up with the FF/Siar X account → describe use (paste below).
2. Create Project "Siar" → App "Siar". User authentication settings: OAuth 2.0, type **Web App,
   Automated App or Bot**, callback https://api.siaran.my/api/v1/social-account/callback/TWITTER,
   website https://siaran.my, permissions **Read and write** (+ Direct Messages not needed).
3. Billing: buy credits (start with $25); set a monthly spend limit.
4. Keys → server env: NETWORK_TWITTER_CLIENT_ID / NETWORK_TWITTER_CLIENT_SECRET.

Use-case text: *"Siar is a publishing tool: users connect their own X account and publish or
schedule posts, threads and replies they write, and read the metrics of their own posts. We do
not analyse other users' content, build profiles, or automate engagement."*

Costs are passed through to customers from their prepaid Siar credit at X's rates
($0.015 per post, $0.20 per post with a link; reads per resource).
