# Meta — Facebook Pages, Instagram, Threads, Messenger / Instagram DMs

One Meta app ("Siar") with three use cases: **Manage everything on your Page**, **Manage messaging
& content on Instagram** (Instagram API with Facebook Login *and* with Instagram Login), and
**Access the Threads API**. Until App Review passes the app runs in Development mode: it works
for any account with a role on the app — FF's own pages are added as testers so internal posting
works on day one.

## 1. Business verification [F] — start day 1

Meta Business Suite → Business settings → Business info → **Start verification**.
- Legal business name: `FF DEV STUDIO` (exactly as on the SSM certificate)
- Registration number: `202603234793`
- Address + phone: as on SSM; phone must receive a code
- Email: siaran@ffdev.studio. If Meta offers *email* verification it needs an address on the business website's domain, so either give https://ffdev.studio as the website for that step or verify by the DNS record below
- Website: `https://siaran.my` (the footer must show "FF DEV STUDIO (202603234793)" — it does)
- Documents: SSM certificate (PDF) + a utility bill or bank statement in the business name if asked
- Domain verification: Business settings → Brand safety → Domains → add `siaran.my`, DNS TXT record

## 2. App settings (I fill these)

| Field | Value |
|---|---|
| App type | Business |
| Display name | Siar |
| App domains | siaran.my, app.siaran.my, api.siaran.my |
| Privacy policy URL | https://siaran.my/privacy |
| Terms of service URL | https://siaran.my/terms |
| User data deletion | Data deletion instructions URL: https://siaran.my/data-deletion |
| Category | Business and pages |
| App icon | 1024×1024 PNG |
| Valid OAuth redirect URIs | https://api.siaran.my/api/v1/social-account/callback/FACEBOOK, …/INSTAGRAM, …/THREADS |
| Webhooks | Callback https://api.siaran.my/api/v1/webhooks/meta, verify token = NETWORK_META_WEBHOOK_VERIFY_TOKEN; fields: Page `feed`, `messages`, `messaging_postbacks`, `message_reactions`, `message_echoes`; Instagram `comments`, `messages`, `messaging_postbacks`, `message_reactions` |

## 2b. Facebook Login for Business — check before recording

Business-type apps may only offer Facebook Login for Business. Open the connect flow in Development
mode with a tester first. If Meta shows "Invalid Scopes" or ignores permissions: Facebook Login for
Business → Configurations → create "Siar Pages" (user access token, the Facebook permissions in
the table below) and "Siar Instagram" (the instagram_* + pages_show_list/pages_read_engagement/
business_management set), then set `NETWORK_FACEBOOK_LOGIN_CONFIG_ID` and
`NETWORK_INSTAGRAM_LOGIN_CONFIG_ID`. Siar sends `config_id` when these are present.

## 2c. Deauthorize and data-deletion callbacks (built 2026-10-12)

Meta POSTs a `signed_request` (signed with that login's app secret); Siar disconnects the matching
accounts (matched on the stored Meta user id) and, for deletion, answers `{ url, confirmation_code }`.

| Login | Deauthorize callback | Data deletion callback |
|---|---|---|
| Facebook Login for Business (Settings) | https://api.siaran.my/api/v1/webhooks/meta/deauthorize/facebook | https://api.siaran.my/api/v1/webhooks/meta/data-deletion/facebook |
| Instagram (business login) | https://api.siaran.my/api/v1/webhooks/meta/deauthorize/instagram | https://api.siaran.my/api/v1/webhooks/meta/data-deletion/instagram |
| Threads (use case settings) | https://api.siaran.my/api/v1/webhooks/meta/deauthorize/threads | https://api.siaran.my/api/v1/webhooks/meta/data-deletion/threads |

Status page for a deletion request: `GET /api/v1/webhooks/meta/data-deletion/status/<code>`.
Instagram Login is a separate app (Siar-IG, id 1122271633548081): its secret is
`NETWORK_INSTAGRAM_INSTAGRAM_CLIENT_SECRET`, accepted for webhook signatures and these callbacks.

## 3. App Review — submission A (publishing, comments, insights)

Submit after deploy. For each permission: the description below + a screencast of **Siar's own
UI** doing exactly that (never Meta's UI), recorded at 1280×800, English captions, under 3 min.

**Reviewer instructions (paste into "Testing instructions"):**
> Siar is a social media publishing API with a web dashboard. Log in at https://app.siaran.my with
> the credentials below. Open Social accounts → Connect Facebook (or Instagram), complete Facebook
> Login with your test user, choose a Page. Then Posts → New post: select the network, write text,
> attach an image, Publish now. The post appears on the Page/Instagram account. Inbox → Comments
> shows comments on published posts; Analytics shows insights.

| Permission | How Siar uses it (paste) | Screencast shows |
|---|---|---|
| `pages_show_list` | Lists the Pages the user manages so they can choose which Page Siar publishes to. | Connect Facebook → Page picker listing the user's Pages |
| `pages_read_engagement` | Reads Page details, published posts and engagement so the user sees post status and performance in Siar. | Post detail showing likes/comments counts |
| `pages_manage_posts` | Publishes, schedules, edits and deletes posts on the selected Page when the user creates them in Siar or through the Siar API. | Composer → Publish now → post visible on the Page; then delete from Siar |
| `pages_read_user_content` | Reads comments and recommendations on the Page so the user can moderate them in Siar's inbox. | Inbox listing comments of a published post |
| `pages_manage_engagement` | Replies to, hides and deletes comments on the Page from Siar's inbox, and posts the first comment the user scheduled. | Reply to a comment in Siar → reply visible on Facebook; hide a comment |
| `pages_manage_metadata` | Subscribes Siar to the Page's webhooks (new comments, messages) so the inbox updates in real time instead of polling. | Comment on the Page from another account → it appears in Siar's inbox without refresh |
| `read_insights` | Shows Page and post insights (reach, impressions, engagement) in Siar's analytics. | Analytics screen for the Page |
| `business_management` | Required to list Pages and Instagram accounts that belong to the user's business portfolio. | Page picker including portfolio Pages |
| `instagram_basic` | Reads the connected Instagram professional account's profile and media list. | Connected Instagram account card with username and avatar |
| `instagram_content_publish` | Publishes photos, carousels, Reels and Stories to the user's Instagram professional account. | Composer → Instagram tab → Reel → Publish now → Reel on Instagram |
| `instagram_manage_comments` | Reads, replies to, hides and deletes comments on the user's Instagram media from Siar's inbox, and posts the scheduled first comment. | Reply + hide in Siar's inbox, visible on Instagram |
| `instagram_manage_insights` | Shows media and account insights in Siar's analytics. | Analytics screen for the Instagram account |
| `instagram_business_basic`, `instagram_business_content_publish`, `instagram_business_manage_comments`, `instagram_business_manage_insights` (Instagram Login) | Same uses as above, for users who connect Instagram directly without a Facebook Page. | Connect Instagram → "Continue with Instagram" flow, then publish |
| `threads_basic`, `threads_content_publish`, `threads_manage_replies`, `threads_read_replies`, `threads_manage_insights`, `threads_delete` | Publishes text, image, video and carousel posts to the user's Threads profile, manages replies, shows insights, and deletes a post when the user deletes it in Siar. | Connect Threads → publish a Threads post → reply from Siar → delete the post from Siar |

## 4. App Review — submission B (messaging), only after A passes

| Permission | How Siar uses it | Screencast shows |
|---|---|---|
| `pages_messaging` | Lets the Page reply to people who message it, from Siar's inbox, inside Meta's 24-hour window, and send automated replies the Page owner configured. | A DM arrives in Siar's inbox → reply from Siar → reply in Messenger |
| `instagram_manage_messages` / `instagram_business_manage_messages` | Same, for Instagram Direct, including a private reply to a comment the user chose. | Instagram DM in Siar → reply; comment → private reply |

Notes: messaging stays off until a customer enables it per account; automations only send
messages the account owner wrote; no promotional messages outside the 24-hour window.

## 5. Data Use Checkup / annual review

Answer: Siar processes data only to provide the features the user connected the account for;
tokens are encrypted at rest; data is deleted when the user disconnects the account or deletes the
organization, or on request via https://siaran.my/data-deletion; no data is sold or used for
advertising.
