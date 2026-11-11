Verified 2026-11-12: 14 corrections

# Buyers, pains, jobs, triggers and objections: unified social media API

> **Verification pass (2026-11-12).** Re-checked against primary sources: every vendor price, limit and plan
> (ayrshare.com/pricing, zernio.com/pricing + home HTML, buffer.com/pricing.md + /agencies, bundle.social/pricing,
> bundle.social home + /ayrshare-alternative, hootsuite.com/plans, sproutsocial.com/pricing, upload-post.com,
> getduta.com/pricing, postla-page.pages.dev/pricing.html, docs.x.com pricing + developer agreement, TikTok and LinkedIn
> docs, Meta token docs, buffer.com/resources/legacy-rest-api-retired); all 20 cited Postiz issues and both Mixpost issues
> (`gh`, quotes grepped in bodies and comments); n8n topics (forum JSON: views, dates, quotes); all six dev.to articles
> (dev.to API: quotes, dates, vendor disclosures); HN items (Algolia API); Stack Overflow views and tag counts (API 2.3);
> Trustpilot and AppSumo quotes (WebFetch, phrase-by-phrase); 23 Google autocomplete phrases (suggest endpoint, gl=us / gl=my);
> Siar claims against `siar-truth.md` and the code (`billing-core.ts` for invoices).
> **Not done:** a 10-query "who ranks" search sample. The run-wide WebSearch budget was exhausted when this pass started
> (every WebSearch call was refused). This file makes no ranking claims of its own, so nothing below depends on one, but
> the autocomplete re-checks above stand in for search evidence. Corrections are marked "**Corrected 2026-11-12**" inline.

Checked 2026-11-12. This file is about who buys a unified social media API and why. The vendor teardowns are in
`../competitors/`, keyword demand is in `../keywords/`, and Siar wording comes from `../siar-truth.md`. Where a Siar
claim appears here, it uses the allowed wording from that file. This file does not repeat them.

## How to read this file

| Label | Meaning |
|---|---|
| **[measured]** | I fetched or counted it myself on 2026-11-12 (GitHub issues via `gh`, Stack Exchange API, n8n forum JSON, dev.to API, HN pages, vendor pages) |
| **[sourced]** | The vendor's own page, with URL, checked 2026-11-12 |
| **[third-party]** | A review site, forum, blog or a rival's page. Quoted as said; not proof of fact |
| **[sibling]** | Measured today by another file in this research set (named). Not re-checked here |
| **[inferred]** | My reading of the evidence |
| **[doc] / [code]** | Siar's own repo records or code, via `siar-truth.md` |

### What I could and could not reach (read this first)

- **WebSearch was not available for this file.** The shared 200-search budget for this run was spent before this task
  started, so I could not search Reddit, Indie Hackers, G2 or Capterra through a search engine. Everything below comes
  from pages I could fetch directly.
- **Reddit: not reached.** The fetch tool refuses reddit.com and old.reddit.com [measured]. Sibling files also failed
  (`competitors/buffer.md`, `competitors/late.md`). Reddit demand is shown only through autocomplete (for example
  "ayrshare alternatives reddit", "meta app review reddit") and through third-party digests. **No direct Reddit quote appears in this file.**
- **G2 and Capterra: not reached** (HTTP 403 to every fetch) [measured]. Review quotes come from Trustpilot and AppSumo instead.
- **Indie Hackers: not reached** (no known thread URLs, and no search to find them).
- **Stack Overflow web pages: blocked.** I used the public Stack Exchange API for question lists, view counts and tag sizes [measured].
- **What worked, and is used heavily here:**
  - GitHub issues for the open-source schedulers Postiz (878 issues, 2024-03 to 2026-11) and Mixpost. Their self-hosters hit
    every network gate themselves, so they write the most detailed first-hand complaints on the web.
  - The n8n community forum.
  - dev.to.
  - Hacker News.
  - Trustpilot and AppSumo reviews.
  - Vendor developer docs (Meta, TikTok, LinkedIn, X).

**Follow-up worth doing (inferred):** a pass over Reddit (r/SaaS, r/n8n, r/socialmedia, r/webdev), G2 and Capterra once the
search budget resets or from a logged-in browser. The themes below are well evidenced elsewhere. Reddit would mostly
add more verbatim phrasing, not new themes.

---

## 1. The short version

1. **Six buyer segments.** Four pay for the API:
   - SaaS builders who embed publishing in their product.
   - Agencies and multi-brand teams.
   - Workflow and AI-agent builders (n8n, Make, MCP).
   - DIY integrators and self-hosters who hit a network gate and give up.

   The other two segments:
   - **Switchers** come from Ayrshare, Zernio/Late, bundle.social or the Buffer API. They are the warmest leads.
   - **Malaysian SMEs and local agencies** buy the dashboard, not the API.
2. **The top pain is not code. It is the gate in front of each network:**
   - Meta App Review and Business Verification.
   - TikTok's audit and its "no internal use" rule.
   - LinkedIn's vetted Community Management API.
   - YouTube's audit.
   - Pinterest Standard access.

   The evidence is first-hand and recent, for example: "I spent over a month struggling with Facebook integrations, waiting for approvals"
   ([n8n forum](https://community.n8n.io/t/instagram-dms-webhooks-work-only-in-test-mode/176851), 2025-08-30).
   **Caveat:** Siar has passed Meta, but it has the same open problem on TikTok (rejected 2026-10-20), YouTube (audit pending)
   and LinkedIn Pages (denied) [doc]. It can sell "we cleared Meta for you", not "we cleared every gate".
3. **The second pain is the billing unit.** Buyers complain about paying per profile, per account, per channel or per seat,
   and about prices that change under them. Examples:
   - "I was surprised to see that you moved from charging by profiles to charging by accounts"
     ([Trustpilot, Zernio/Late, 1★, 2026-06-07](https://www.trustpilot.com/review/getlate.dev?stars=1&stars=2&stars=3)).
   - "They charge 3k/year" ([Trustpilot, Hootsuite](https://www.trustpilot.com/review/hootsuite.com?stars=1)).

   Siar answers with per-organization pricing, unlimited accounts and a price lock [code].
4. **The third pain is silent failure:** tokens that expire, channels that drop, posts that fail or double-post with an
   error that points nowhere. Examples:
   - "flags content as duplicate aggressively, swallows errors" (Zernio, Trustpilot).
   - "Post failures occur far too often" (Buffer, Trustpilot).
   - "Need to 'refresh' (re-auth) the Youtube channel virtually every day" ([Postiz #1351](https://github.com/gitroomhq/postiz-app/issues/1351)).
5. **The triggers are mostly events outside the buyer's control:**
   - A rejection email.
   - A price change.
   - An API version sunset. LinkedIn Marketing 202511 sunsets on 2026-11-16 [sourced]. Buffer's legacy REST API shuts on 2027-02-01 [sourced: buffer.com/resources/legacy-rest-api-retired/, checked 2026-11-12].
   - A customer who asks for a new network.

   Content that answers those exact moments is the cheapest way to reach buyers [inferred].
6. **Siar's biggest objection is not price. It is proof.** Siar has:
   - No customers, reviews or uptime record [doc].
   - TikTok, YouTube (public), LinkedIn Pages and Pinterest publishing not open yet.
   - An SDK, CLI and MCP server that are not on npm.

   Buyers in every segment ask "is network X live?" first. An exact, dated status table is both the honest answer and a
   differentiator, because rivals over-claim (`competitors/late.md` §5, `competitors/bundle-social.md` §6) [sibling].

---

## 2. Buyer segments

Demand grades are **inferred** from the evidence listed. There is no volume data.

| # | Segment | Who, in their own words | What they buy | Billing unit that hurts them today | Evidence of size / intent | Fit for Siar now |
|---|---|---|---|---|---|---|
| S1 | **SaaS builders embedding publishing** | Builders of a planner app, a CMS, a creator tool or a vertical SaaS (real estate, restaurants) who want "my customers connect their accounts in my app" | Multi-tenant API + hosted connect + webhooks | Per profile (Ayrshare): 1 profile = $149; Business = $599 for 30 profiles [sourced: ayrshare.com/pricing]; their own calculator: 100 profiles = $1,228/month [sibling: `competitors/ayrshare.md`] | Ayrshare reviewers: "One API covers every network, so I could build my own planner app on top of it" (2026-11-04); "One API call publishes content across all major social networks directly to our clients' pages" (2026-07-13) ([Trustpilot](https://www.trustpilot.com/review/ayrshare.com)) [third-party]. Postiz #975: "In SaaS environments, each customer must connect their own accounts" ([GitHub](https://github.com/gitroomhq/postiz-app/issues/975)) [measured] | **Strong** on pricing, API shape, webhooks and Meta approval. **Weak** on TikTok/YouTube/LinkedIn Pages and on "white-label" (Siar's connect page is branded, shows "Powered by Siar") |
| S2 | **Agencies and multi-brand teams** | Agencies, franchise and multi-location operators, in-house teams with several brands | Dashboard (calendar, approvals, inbox) and sometimes the API for client portals | Per channel (Buffer from $6/channel/month Essentials, $12 Team, billed monthly; $5 / $10 billed yearly [sourced: buffer.com/pricing.md, checked 2026-11-12]); per seat (Hootsuite "Paid plans start at $99 USD per user/month" for Standard, billed annually [sourced: https://www.hootsuite.com/plans, checked 2026-11-12]; Sprout Advanced, the plan that includes "The Sprout API", $399/seat/month [sourced: https://sproutsocial.com/pricing/, checked 2026-11-12]); per account (Zernio $6/$3/$1 per account after 2 free [sourced: zernio.com/pricing]) | Hootsuite 1★ reviews are mostly about money: "every year they charge my card £1200." (GB, 2026-03-31); "hiding ridiculous renewal terms in their contracts" (US, 2026-03-12) ([Trustpilot](https://www.trustpilot.com/review/hootsuite.com?stars=1)) [third-party] | **Strong** on price (Pro 10 brands RM99/$49; Business unlimited brands RM399/$149). **Weak:** no client proof, no white-label dashboard, LinkedIn Pages not open |
| S3 | **Workflow and AI-agent builders** (n8n, Make, Zapier, Claude/ChatGPT MCP) | Solo operators, automation freelancers, "AI content" builders | One HTTP node or one MCP tool that posts everywhere | Usually stuck before billing: their own Meta/LinkedIn app will not pass | n8n forum: "How to post Facebook Page using the Facebook Graph API node?" 11,195 views; "LinkedIn OAuth: Unauthorized scope w_organization_social" 2,359 views ([forum JSON](https://community.n8n.io/tag/linkedin)) [measured]. Autocomplete (sibling, `keywords/ai-agents-mcp.md`): "can n8n post to instagram", "n8n post to social media", "social media mcp server", "claude mcp for social media" | **Good** for Meta networks, X, Bluesky, Mastodon, Discord, Slack. **Blocked** for MCP install copy until `@siar/mcp` is on npm |
| S4 | **DIY integrators and self-hosters who hit the wall** | Developers who tried the network APIs directly, or self-host Postiz/Mixpost and must register their own apps | They switch to a hosted API once a gate blocks them | Their cost is time: weeks to months per gate | Postiz: 28 issue titles matching scope / audit / "app review" (120 comments) and 15 matching token / refresh / reconnect (59 comments) out of 878 issues [measured: `gh issue list --state all`, title regex, some noise]. **Corrected 2026-11-12:** the earlier figures (31 / 133 and 19 / 77) could not be reproduced with any keyword set; counts depend on the regex. Stack Overflow: "Facebook: Permanent Page Access Token?" 208,098 views; "Facebook API 'This app is in development mode'" 188,827 views [measured: Stack Exchange API] | **Good** for Meta. **Honesty trap** for TikTok: Siar cannot yet post publicly to TikTok either |
| S5 | **Switchers from another unified API** | Current Ayrshare, Zernio/Late, bundle.social, Upload-Post or Buffer API users | A cheaper or steadier provider with the same shape | Price changes; plan gaps (bundle.social has nothing between $0 and $100: "Hobbyist and need a smaller plan? Message us" [sourced: bundle.social/pricing]) | Autocomplete (re-checked 2026-11-12, gl=us): "ayrshare alternatives reddit", "ayrshare api alternatives", "buffer alternative with api", "bundle social alternatives", "zernio alternative", "zernio api alternative" [measured]. **Corrected 2026-11-12:** "getlate alternative" does not autocomplete (Google offers "getdate alternative") [measured]. AppSumo: "Features started being split into expensive monthly add-ons." (2026-05-18) ([AppSumo](https://appsumo.com/products/late/reviews/)) [third-party] | **Strongest for bundle.social users** (wire compatible as of Oct 2026, but naming bundle.social is parked [doc]). Buffer API users face a forced migration (REST shutdown 2027-02-01) [sibling: `competitors/buffer.md`] |
| S6 | **Malaysian SMEs and local agencies** | Shop owners, F&B, clinics, small agencies posting to FB/IG/TikTok; they search "cara schedule post TikTok" | Dashboard in ringgit; comment-to-DM | USD billing on Buffer/Hootsuite; per-account local tools (PostLa Starter RM97/month for 3 social accounts, Professional RM197 for 10 [sourced: https://postla-page.pages.dev/pricing.html, checked 2026-11-12]). **Corrected 2026-11-12:** Duta is *not* per channel. It is a flat RM99/month or RM990/year, "Every channel Duta publishes to, connected as many times as you like" [sourced: https://getduta.com/pricing, checked 2026-11-12], so it already offers the flat, ringgit, any-number-of-accounts model to this segment | Autocomplete gl=my, re-checked 2026-11-12: 9 completions for "cara schedule post" (10 in the sibling's run; it fluctuates), 10 for "comment to dm automation", zero for "social media scheduler malaysia" [measured] | **Mixed.** Ringgit, FPX/DuitNow and per-organization pricing fit well. But the two things this segment asks for most, TikTok and auto-DM, are not open to everyone yet [doc] |

**Who is not a buyer (inferred):**

- People who want to scrape or read other people's content. They ask for "Instagram scraper" and "get followers of followers"; Stack Overflow has 36,273 views on that question [measured].
- Ads managers.
- Social listening teams.

Siar should not chase these.

---

## 3. Pains, with quotes and links

Each pain lists the evidence, a demand signal, and what Siar can honestly say, using `siar-truth.md` wording.
Quotes are kept short and verbatim. Where a quote is cut, it ends with "…".

### P1. Network gates: app review, business verification, audits, vetted APIs

The pain all segments share. One gate per network, each with its own paperwork, screencast and wait.

| Gate | What the network itself says | What builders say |
|---|---|---|
| **Meta** (FB, IG, Threads) | App Review for Advanced Access. Development mode only works for users with an app role (Postiz #621 quotes Meta's own text). | "The entire Facebook process for getting this all working is extremely unintuitive, especially for private app use." ([Postiz #621](https://github.com/gitroomhq/postiz-app/issues/621), 2025-02-19) [measured] |
| | | "I spent over a month struggling with Facebook integrations, waiting for approvals, setting up webhooks, watching dozens of YouTube videos" ([n8n forum](https://community.n8n.io/t/instagram-dms-webhooks-work-only-in-test-mode/176851), 2025-08-30). Permissions approved, but webhooks still fired only for testers [measured] |
| | | "it asked for business registration info. That's where I stopped." ([dev.to, JustJinoIT](https://dev.to/justjinoit/instagram-graph-api-lies-to-you-3-things-that-broke-my-automation-12n2), 2026-06-19) [measured] |
| | | "Meta Business Verification requires a registered legal entity, and I was running this as a solo pilot without one." He shipped on browser automation instead ([dev.to, "No company, no API"](https://dev.to/hrekov/no-company-no-api-59cd), 2026-10-07) [measured] |
| **TikTok** | "All content posted by unaudited clients will be restricted to private viewing mode." ([developers.tiktok.com/doc/content-posting-api-get-started](https://developers.tiktok.com/doc/content-posting-api-get-started)) [sourced] | TikTok reviewer note: "Applications intended for personal use or internal company use are not eligible for approval." ([Postiz #2297](https://github.com/gitroomhq/postiz-app/issues/2297), 2026-10-20) [measured] |
| | Intended use: API clients "must not be limited to test applications and should be intended for a wide audience". A utility that uploads to accounts you or your team manage is not acceptable ([content-sharing-guidelines](https://developers.tiktok.com/doc/content-sharing-guidelines)) [sourced] | "I've had enough with tiktok. I gave them a detailed video and they keep rejecting the application." ([Postiz #1329](https://github.com/gitroomhq/postiz-app/issues/1329), 2026-03-19) [measured] |
| | | "This has been going on for months now." ([Postiz #1563](https://github.com/gitroomhq/postiz-app/issues/1563), 2026-05-27; 14 comments) [measured] |
| | | A TikTok support reply quoted in the same thread (2026-10-30) says the product "must genuinely be available to a broad range of external users" [measured, third-party quote of TikTok] |
| **LinkedIn** (company pages) | Community Management API is a "Vetted Product with development and standard tiers"; Standard needs a screencast per use case; request it only on a new app with no other products; `r_member_social` is "closed" ([learn.microsoft.com](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-overview)) [sourced] | n8n: "unauthorized_scope_error" when connecting a company page; the fix offered was to apply for another LinkedIn product and "Wait for few days" ([n8n forum](https://community.n8n.io/t/linkedin-oauth-unauthorized-scope-w-organization-social-when-connecting-organization-page/127405), 2025-06) [measured] |
| | | Postiz: 49 LinkedIn issue titles, several on scopes ("Not enough scopes", "org scopes for personal accounts") [measured] |
| **X** | No review, but pay per use: create post $0.015, post with URL $0.200, read $0.005 per post ([docs.x.com pricing](https://docs.x.com/x-api/getting-started/pricing)) [sourced] | See P5 |
| **Pinterest, YouTube** | Trial access and test tokens (Pinterest); YouTube audit for public uploads [sibling: `keywords/per-network.md`] | "pinterest api trial access denied" is an autocomplete phrase [sibling]. Postiz: 28 YouTube issue titles, mostly refresh/reconnect [measured] |

**Demand signal [inferred from measured evidence]:**

- **"meta app review"** has 10 autocomplete children: process, reddit, time, video, instagram, requirements, "taking time" [sibling: `keywords/per-network.md` #26].
- **TikTok audit** queries also autocomplete: "tiktok content posting api audit" and "tiktok api audit" (AC 5).
- **Stack Overflow** has 188,827 views on "This app is in development mode" [measured].
- **Postiz** has 28 issue titles on scopes, audits and app review [measured, re-counted 2026-11-12; earlier "31" not reproduced].

**What Siar can say:**

- **Meta (live):** "Facebook, Instagram and Threads connect through Siar's Meta app, which passed App Review on 2026-10-27, so you do not
  need your own." [doc] Do not turn this into a badge or "Meta partner".
- **The rest:** use the status wording from siar-truth §2. **Do not** use "skip the review" for TikTok, YouTube, LinkedIn Pages or Pinterest.
- **First-hand content:** the gate stories are content Siar can own honestly, because Siar went through them itself (`docs/approvals/`).
  A dated "what Meta asked us for" guide is credible. "We got rejected by TikTok, here is why" is also true and useful,
  but it is Fakhrul's call whether to publish it [inferred].

### P2. Paying per profile, per account, per channel or per seat

| Evidence | Source | Label |
|---|---|---|
| Ayrshare bills per "social profile", meaning "one customer, brand, or location connected to any number of social networks". Premium is $149/month for 1 profile. Launch is $299/month for up to 10. Business is $599/month with 30 included, then $8.99 per profile for profiles 31–100. No free plan | https://www.ayrshare.com/pricing/ | sourced |
| Zernio (Late): "You pay per connected social account, per month." The first 2 are free, then $6, $3 or $1 per account | https://zernio.com/pricing | sourced |
| Buffer: "You're billed per channel." $6 per channel per month (Essentials), $12 (Team) | https://buffer.com/pricing.md | sourced |
| "I was surprised to see that you moved from charging by profiles to charging by accounts." (1★, 2026-06-07) | [Trustpilot getlate.dev](https://www.trustpilot.com/review/getlate.dev?stars=1&stars=2&stars=3) | third-party |
| "Now it's unlimited posts but $3 per connected account after the first 2." (3★, 2026-05-07) | same | third-party |
| "Existing customers were suddenly required to pay significantly more on a monthly basis" (1★, 2026-05-10) | same | third-party |
| "You need to pay 450$/ month with your Appsumo plan." (2026-05-08) | [AppSumo Late reviews](https://appsumo.com/products/late/reviews/) | third-party |
| "They charge 3k/year" (Hootsuite, CA) | [Trustpilot Hootsuite 1★](https://www.trustpilot.com/review/hootsuite.com?stars=1) | third-party |
| "every year they charge my card £1200." (Hootsuite, GB, 2026-03-31) | same | third-party |
| "overpaying for it because it's a Canadian business" (Hootsuite, CA, 2026-02-09). Currency pain; it matches S6 | same | third-party |
| bundle.social's founder on HN, launching it as an "Ayrshare Alternative": "We created it due to cost." He paraphrases his dislike of per-seat pricing and "no account limits" | [HN 46062145](https://news.ycombinator.com/item?id=46062145) | third-party (a rival's founder) |
| Rivals attack the per-profile model by name: bundle.social "no $149 profile minimum" (meta description of its Ayrshare page); Upload-Post "$24/mo vs Ayrshare's $149/mo" | https://bundle.social/ayrshare-alternative, https://www.upload-post.com/ (checked 2026-11-12) | sourced (rivals' copy) |

**Counter-evidence (keep it in view):** some buyers *like* per-channel billing. Buffer's own testimonial praises it because
"she stops paying when a client leaves" [sibling: `competitors/buffer.md`]. So per-organization pricing is a win at
many accounts and a weaker story for someone with three accounts [inferred].

**Demand signal [inferred]:**

- "cheapest social media API": **unverified as a query. Corrected 2026-11-12:** Google autocomplete returns zero completions for it (gl=us); "cheapest social media" completes only to scheduler / management-tool phrasings [measured]. The sibling's "live query" claim was not reproduced.
- "social media api pricing per account vs per post" has no autocomplete, but competitors write pages on it [sibling: `keywords/head-unified.md` #62].
- A dev.to comparison by a rival vendor argues the billing unit "decides your bill far more than the headline number"
  ([dev.to, perufitlife](https://dev.to/perufitlife/9-social-media-posting-apis-compared-by-price-october-2026-read-from-each-pricing-page-509b)) [third-party].

**What Siar can say:** "Per organization, never per connected account. Unlimited social accounts on every plan, from
RM39 / $19 a month." "Your price never goes up while you stay subscribed." [code]

State the caps next to it:

- Posts, comments, uploads and brands are capped.
- Free is "20 free posts to try", one-time.

### P3. Tokens expire, channels disconnect, reconnect breaks

| Evidence | Source | Label |
|---|---|---|
| Instagram long-lived tokens are "valid for 60 days from the date at which they are refreshed" and can be refreshed once "at least 24 hours old but has not expired" | https://developers.facebook.com/docs/instagram-platform/reference/refresh_access_token | sourced |
| "red dot, attempt to reconnect, get reconnected; rinse and repeat ad nausium." (IG, 7+ "same" replies) | [Postiz #623](https://github.com/gitroomhq/postiz-app/issues/623) | measured |
| "Need to 'refresh' (re-auth) the Youtube channel virtually every day" (17 comments) | [Postiz #1351](https://github.com/gitroomhq/postiz-app/issues/1351) | measured |
| FB/IG channels flagged "refresh needed" after 59 days, though Page tokens do not expire | [Postiz #2299](https://github.com/gitroomhq/postiz-app/issues/2299) | measured |
| "Buffer disconnected from Instagram a week and a half ago." (US, 2025-05-07) | [Trustpilot Buffer 1★](https://www.trustpilot.com/review/buffer.com?stars=1) | third-party |
| "always not connecting my account and hard to refresh connection with accounts." (MX, 2026-06-28) | same | third-party |
| Stack Overflow: "Facebook: Permanent Page Access Token?" (208,098 views); "Long-lasting FB access-token for server to pull FB page info" (51,193 views) | [SO 17197970](https://stackoverflow.com/questions/17197970), [SO 12168452](https://stackoverflow.com/questions/12168452) | measured |
| n8n: "How to get a token for a long lifetime fb page?" (4,684 views) | [n8n forum](https://community.n8n.io/t/how-to-get-a-token-for-a-long-lifetime-fb-page/16143) | measured |
| A rival publishes a whole explainer: "Meta access token expired? Why it lasts 60 days and how to refresh it" (2026-10-14) | [dev.to](https://dev.to/frandeveloper/meta-access-token-expired-why-it-lasts-60-days-and-how-to-refresh-it-2h81) | third-party |

**What Siar can say:** "Reconnect detection: revoked or expiring grants are flagged, with a `social-account.updated`
webhook." Also: "Disconnecting and reconnecting does not reset an account's daily cap." [code]

**Do not** claim "tokens never expire" or "no reconnects ever". Networks revoke grants.

### P4. Posts fail silently, fail late, or go out twice

| Evidence | Source | Label |
|---|---|---|
| "Post failures occur far too often for this to be a reliable tool." (Buffer, US, 2026-02-21) | [Trustpilot Buffer 1★](https://www.trustpilot.com/review/buffer.com?stars=1) | third-party |
| "Every scheduled post fails to send." (Buffer, US, 2025-08-09) | same | third-party |
| Buffer 1★ themes: 8 of 20 reviews are about failed posts | `competitors/buffer.md` | sibling |
| "flags content as duplicate aggressively, swallows errors, and docs aren't up-to-date." (Zernio, 3★, 2026-05-07) | [Trustpilot getlate.dev](https://www.trustpilot.com/review/getlate.dev?stars=1&stars=2&stars=3) | third-party |
| "At first it posted the same video 4x, then it wasn't posting at all." (Zernio, 4★) | [Trustpilot zernio.com p.8](https://uk.trustpilot.com/review/zernio.com?page=8), via `competitors/late.md` | sibling |
| "Errors plagued the integration with YouTube and TikTok" (Late, 2026-05-14) | [AppSumo](https://appsumo.com/products/late/reviews/) | third-party |
| A developer's own bot posted the same Instagram post three times: it treated a 403 as failure and retried, but "Instagram got the post every time" | [dev.to, JustJinoIT](https://dev.to/justjinoit/instagram-graph-api-lies-to-you-3-things-that-broke-my-automation-12n2) | measured |
| X returned 402 "credits depleted" while the UI said "Added successfully" and then "Unknown Error" | [Postiz #2231](https://github.com/gitroomhq/postiz-app/issues/2231) | measured |
| "errors whose message points nowhere near the actual cause" (Instagram publishing) | [dev.to, Chrononyte](https://dev.to/chrononyte/what-the-instagram-api-doesnt-tell-you-about-publishing-3m5e) | measured |
| Instagram fetches media from your URL itself; Drive links and private URLs fail with misleading errors. The same article and Postiz #1472 and #1004 ("Media fetch failed", 11 comments) cover it | same; [Postiz #1004](https://github.com/gitroomhq/postiz-app/issues/1004) | measured |
| "It is easy to demo a scheduler. It is much harder to build one that survives real life" (a builder's list: expired tokens, flaky APIs, failures "while you are asleep") | [dev.to, Ashley B](https://dev.to/ashb4/what-building-a-social-scheduler-taught-me-about-reliability-4ff3) | measured |

**What Siar can say** (design guarantees, not measured rates):

- "Each network's limits are checked when you create the post, so a bad request fails with a 400 you can fix, not at 9 a.m."
- "Each network target is claimed once. Retries, restarts and double clicks cannot publish the same post again."
- "If a network says no, you get its own code and message, plus a plain-English fix."
- 16 HMAC-signed webhook events with a delivery log and resend.

[code] No reliability numbers.

### P5. X (Twitter) API cost and credits

| Evidence | Source | Label |
|---|---|---|
| X API is "pay-per-usage pricing with no subscriptions": credits bought upfront. Create post $0.015, with URL $0.200, read $0.005 per post; 3 million post reads per month cap, then Enterprise | https://docs.x.com/x-api/getting-started/pricing | sourced |
| Self-hosted users share one X app's limits across all accounts: "One busy account can exhaust limits for all others" | [Postiz #1016](https://github.com/gitroomhq/postiz-app/issues/1016) | measured |
| 402 credits-depleted errors surface badly in tools (P4) | [Postiz #2231](https://github.com/gitroomhq/postiz-app/issues/2231), [#1513](https://github.com/gitroomhq/postiz-app/issues/1513) | measured |
| Historical (2023): HN reacted to the paid tiers; "The new limits seem designed to make it hard to read tweets via the API but relatively easier to post tweets." | [HN 35374698](https://news.ycombinator.com/item?id=35374698) | third-party, old |
| Autocomplete: "x api credits depleted", "x api 402", "x api pay per use" | `keywords/per-network.md` #45–46 | sibling |
| Ayrshare (CEO Marc Blinder, 2026-05-15) argues that a provider serving many customers through one X app with its own credentials breaks X's Developer Agreement, and pushes "Bring Your Own App" as the compliant model | https://www.ayrshare.com/blog/x-api-compliance-byo-app/ | third-party (a rival's opinion) |
| **Corrected 2026-11-12:** the clause exists. X's Developer Agreement, section III.A(e), bars providing use of the X API "on a service bureau, rental or managed services basis" ("Last Updated: April 27, 2026"). Whether Siar's prepaid pass-through falls under it is a legal reading: **unverified**, no X enforcement found | https://docs.x.com/developer-terms/agreement | sourced (clause); inferred (application) |

**What Siar can say:** "X usage is passed through at X's own USD prices from a prepaid credit; Siar adds no markup on X." [code]
In ringgit, the rate includes a card and FX buffer, so do not say "at cost" in ringgit.

Expect the Ayrshare compliance argument as an objection (section 6).

### P6. Constant API churn: versions, scopes and endpoints change under you

| Evidence | Source | Label |
|---|---|---|
| "LinkedIn API 202407 sunset: Mixpost can no longer publish to LinkedIn as of July 22, 2025" | [Mixpost #166](https://github.com/inovector/mixpost/issues/166) | measured |
| LinkedIn: "Marketing Version 202511 (Marketing November 2025) will be sunset on November 16, 2026." | [learn.microsoft.com](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-overview) | sourced |
| "LinkedIn posts fail with 426 NONEXISTENT_VERSION"; "Facebook and Instagram publishing hardcode Graph API v20.0, which expires September 24, 2026"; "Invalid Scopes: instagram_basic — scope deprecated by Meta"; "TikTok changed the scopes the required scopes are no longer available!!!" | Postiz [#2005](https://github.com/gitroomhq/postiz-app/issues/2005), [#1807](https://github.com/gitroomhq/postiz-app/issues/1807), [#1578](https://github.com/gitroomhq/postiz-app/issues/1578), [#515](https://github.com/gitroomhq/postiz-app/issues/515) | measured |
| Buffer: "We're retiring Buffer's legacy REST API on February 1, 2027", with brownouts on November 11 and December 9, 2026. The replacement is Buffer's "GraphQL-first" Public API (with MCP server and CLI). **Corrected 2026-11-12:** the earlier "GraphQL only" is not Buffer's wording | https://buffer.com/resources/legacy-rest-api-retired/ (checked 2026-11-12) | sourced |
| Vendors sell against this pain directly: "Stop maintaining 14+ social media integrations and ship in days, not quarters." (Ayrshare home) | https://www.ayrshare.com/ (checked 2026-11-12) | sourced (vendor copy) |

**What Siar can say:** "One REST API, with an OpenAPI document at `/openapi.json`." The dashboard is a client of the same API.

**Do not** promise "we absorb every network change instantly". There is no track record yet [inferred].

### P7. Multi-tenant and branding needs

| Evidence | Source | Label |
|---|---|---|
| "Current Postiz setup requires hard-coded secrets in Docker, which only supports single-tenant usage." "In SaaS environments, each customer must connect their own accounts" | [Postiz #975](https://github.com/gitroomhq/postiz-app/issues/975) | measured |
| Buffer's API needs every end user to have a Buffer account and Buffer plan; there is no API call to connect a social account | `competitors/buffer.md` | sibling |
| Ayrshare: the hosted linking page lets you "Add your logo, set custom headers, choose which social networks appear", localise the language and swap in your own help links; "with the Max Pack, apply a full custom CSS file, favicon, page title, and footer". Max Pack is $300/month (paid add-on on Launch and Business). **Corrected 2026-11-12:** the docs do not mention colours outside the Max Pack CSS | https://www.ayrshare.com/docs/multiple-users/business-plan-overview, https://www.ayrshare.com/pricing/ (checked 2026-11-12) | sourced |
| "white label social media management" is a high-demand query, but it is agencies buying a rebrandable dashboard | `keywords/head-unified.md` #45 | sibling |

**What Siar can say:** "A branded connect link (your name, logo, colour). Customers sign in to each network themselves; you never touch a password or token."

**Never** say "white-label" or "on your domain". The page shows "Powered by Siar" and is English only [code].

### P8. No plan for small buyers, or a trial that needs a card

| Evidence | Source | Label |
|---|---|---|
| bundle.social: Free (20 posts a month, 3 accounts) then Pro $100; "Hobbyist and need a smaller plan? Message us" | https://bundle.social/pricing | sourced |
| Ayrshare: no free plan; the only trial is 28 days on the $299 Launch plan | https://www.ayrshare.com/pricing/ | sourced |
| AppSumo reviewer on per-account free tiers: "If it is free for two accounts, I can just have unlimited Gmail accounts" (shows how buyers game account-based free tiers) | [AppSumo](https://appsumo.com/products/late/reviews/) | third-party |
| "ayrshare free" and "ayrshare free plan" are live searches | `competitors/ayrshare.md` | sibling |

**What Siar can say:** "20 free posts to try, no card", then Starter at RM39 / $19.

### P9. Billing trust: renewals, cancellations, price changes

| Evidence | Source | Label |
|---|---|---|
| Hootsuite: "I cancelled my subscription, still got charged $150 after the trial period"; "hiding ridiculous renewal terms in their contracts" (2026-03) | [Trustpilot Hootsuite 1★](https://www.trustpilot.com/review/hootsuite.com?stars=1) | third-party |
| Late/Zernio: "they keep changing their pricing and plans without notice" (1★, 2026-06-23) | [Trustpilot getlate.dev](https://www.trustpilot.com/review/getlate.dev?stars=1&stars=2&stars=3) | third-party |
| Ayrshare (2023): price increases; integration data removed after one late payment | [Slashdot](https://slashdot.org/software/p/Ayrshare/), via `competitors/ayrshare.md` | third-party, old |

**What Siar can say:** "Your price never goes up while you stay subscribed." Yearly is 10x monthly. For Malaysia, yearly can
be paid once by FPX or DuitNow, so there is no auto-renewal surprise: "renewed by link" [code].

### P10. Inbox and DM automation (mostly S2 and S6)

- **Instagram DM webhooks fired only for the tester account** even though the app was in Live mode with permissions
  approved; the fix was subscribing the webhook to the right field ("instagram_message") after review
  ([n8n forum](https://community.n8n.io/t/instagram-dms-webhooks-work-only-in-test-mode/176851), 2025-08-27/30) [measured].
  **Corrected 2026-11-12:** the earlier wording ("until the app is Live") misread the thread; the poster's app was already Live.
- **"Help on creating Instagram automatic DM responses"** has 3,800 views [measured: n8n forum].
- **"comment to dm automation …"** returns 10 completions in Malaysia [sibling].

**What Siar can say today:** "Facebook and Instagram DMs and comment-to-DM automations: in beta, turned on per organization
on request (paid plans)." [code] Do not sell it in ads until the beta opens to everyone.

---

## 4. Jobs to be done

Written as the buyer would say them. The segments are from section 2. "Siar today" uses only truth-file claims.

| # | Job ("When …, I want to …, so I can …") | Segments | Siar today |
|---|---|---|---|
| J1 | When customers ask for social posting inside my product, I want one integration instead of one per network, so I can ship this quarter, not next year. An Ayrshare reviewer said it "has allowed us to get live months in advance" ([Trustpilot](https://www.trustpilot.com/review/ayrshare.com)) | S1, S4 | Yes for open networks; one REST API, OpenAPI, webhooks |
| J2 | When I need Meta (and TikTok, LinkedIn Pages…) permissions, I want to use an app that is already approved, so I skip months of review and business verification | S1, S3, S4 | Meta yes [doc]; TikTok, YouTube public, LinkedIn Pages, Pinterest publishing no |
| J3 | When my customer connects an account, I want a connect page with my name on it, so they trust it and I never handle passwords | S1, S2 | Branded connect link; not white-label |
| J4 | When I add a client or location, I want my bill to stay predictable, so growth does not punish me | S1, S2, S5 | Per organization, unlimited accounts, price lock |
| J5 | When a token expires or a post fails, I want to hear about it at once, with the network's real error, so my customer does not find out first | S1, S2, S3, S4 | Webhooks, reconnect flags, verbatim errors [code] |
| J6 | When I retry or a worker restarts, I want a guarantee nothing posts twice, so I don't spam my customer's audience | S1, S4 | "Never posts twice" design guarantee [code] |
| J7 | When I write one post, I want each network's version (shorter line, first comment, thread) checked before send, so it doesn't fail at 9 a.m. | S2, S3, S6 | Per-network text/media in one post; validation at create time |
| J8 | When my workflow or AI agent drafts a post, I want one HTTP call or MCP tool to publish it, so I don't build a node per network | S3 | API yes; MCP built but not on npm (no install claims) |
| J9 | When comments (and DMs) come in, I want them in one place with replies from one place | S2, S6 | Comments live on FB, IG, Threads, X, Bluesky, Mastodon, Slack, YouTube; DMs beta FB/IG |
| J10 | When I report to a client, I want normalised metrics across networks | S2 | Analytics on paid plans [code]; LinkedIn analytics: do not claim |
| J11 | When my current provider changes price or retires its API, I want to switch without a rewrite | S5 | bundle.social v1 wire compatibility (naming parked) |
| J12 | When I pay as a Malaysian business, I want ringgit, FPX/DuitNow and a local invoice, so I avoid USD card fees | S6, S2 (MY) | Yes [code] |

---

## 5. Buying triggers

Moments when a buyer starts looking. Each has evidence and a content idea. Ideas are **inferred** and not decided.

| Trigger | Evidence | Who | Content that meets it |
|---|---|---|---|
| A rejection email from Meta, TikTok or LinkedIn | Postiz #2297, #1563, #1329; n8n LinkedIn scope thread; autocomplete "meta app review taking time", "tiktok content posting api audit", "pinterest api trial access denied" [measured 2026-11-12]. **Corrected 2026-11-12:** "meta app review rejected" returns no autocomplete [measured] | S3, S4, S1 | Per-network gate guides from Siar's own approval files, with honest status. Meta: "already approved". TikTok: a guide only |
| An API version sunset or forced migration | LinkedIn 202511 sunset 2026-11-16 [sourced]; Buffer REST shutdown 2027-02-01 with brownouts 2026-11-11 and 2026-12-09 [sibling]; Meta Graph v20 expiry on 2026-09-24 as stated in Postiz #1807's title (already past; not checked against Meta's changelog) [measured] | S4, S5 | "Buffer REST API shutdown: your options" page (Buffer users must rewrite anyway) |
| A price change or plan-model change at the current vendor | Zernio/Late moved to per-account pricing around May 2026 (Trustpilot, AppSumo) [third-party]; Hootsuite renewals [third-party] | S5, S2 | Sourced, dated `/compare/*` pages; a per-account vs per-organization cost calculator |
| Crossing a profile or seat tier | Ayrshare Launch caps at 10 profiles; the next step is $599 [sourced] | S1 | "What 10, 30, 100 customers cost on each API" page, sourced and dated |
| A customer asks for a network the current tool lacks | Ayrshare review: "let us add Facebook, which our previous tool couldn't do" [third-party] | S1 | Honest per-network status table |
| Tokens and disconnects become a support burden | Postiz #623, #1351; Buffer Trustpilot [measured / third-party] | S1, S2 | Token lifetime explainer per network + Siar's reconnect webhook |
| X credits run out or X charges surprise | Postiz #2231; autocomplete "x api credits depleted", "x api 402" [measured / sibling] | S3, S4 | `/x-api/credits` and `/x-api/errors` pages |
| Starting an AI-agent or n8n project | Autocomplete "can n8n post to instagram", "social media mcp server" [sibling] | S3 | n8n HTTP-node recipe for open networks. MCP install guide only after npm publish |
| A Malaysian SME wants to stop paying in USD, or wants auto-DM | gl=my autocomplete for "cara schedule post …" and "comment to dm automation …" [sibling] | S6 | BM how-to pages per network (open networks only); the DM beta only when it opens |

---

## 6. Objections and honest answers

The answers use only `siar-truth.md` wording. Where Siar has no good answer, the table says so.

| Objection (as a buyer would put it) | How common (inferred) | Honest answer | Gap to close |
|---|---|---|---|
| "Can I post to TikTok / YouTube / LinkedIn company pages / Pinterest?" | Very common: these are the most-searched networks (`keywords/per-network.md` §336) | "Open today: Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack. YouTube uploads work but stay private until YouTube's audit completes. TikTok, Pinterest publishing, LinkedIn company pages, Reddit, Snapchat and Google Business Profile are built and open as each network approves Siar." | The approvals themselves. Until then, lose these buyers honestly rather than churn them later |
| "You're new. Who uses you? What's your uptime?" | Common in S1 and S5; rivals lead with scale numbers (bundle.social home: "16,454+ customers", "99.881%" uptime; Ayrshare home: ">99.99%" API uptime) [sourced: https://bundle.social/, https://www.ayrshare.com/, checked 2026-11-12; their own claims, not independently verified] | No customers, testimonials, usage or uptime may be claimed [doc]. What can be shown: the public OpenAPI document, public per-network error references, a dated status table, the price lock, and 20 free posts to try | Real proof over time (status page history, first case study), only when it exists |
| "Is it white-label?" | Common in S1 and S2 | "A branded connect link (your name, logo, colour)… you never touch a password or token." The page says "Powered by Siar" | Product decision (custom domain, removable footer, `language` support) |
| "Others have unlimited posts (Ayrshare, Zernio). You cap posts." | Medium | Per organization with unlimited accounts. Caps: Starter 300, Pro 10,000, Business 100,000 posts/month. "A post sent to every connected network counts as one post." Drafts and retries don't count | None; just state the caps beside the price |
| "Zernio gives 2 accounts free forever, Buffer 3 channels. Your free tier is 20 posts once." | Medium (S3, S6) | "20 free posts to try" (one-time, no card), then RM39 / $19. Do not hide that it is one-time | Pricing decision, not copy |
| "Is your X pass-through even allowed? Ayrshare says shared-app billing breaks X's terms." | Low now, rising if Ayrshare pushes it [inferred] | Not answerable from Siar's docs today. The clause is real (X Developer Agreement III.A(e), "service bureau, rental or managed services basis", sourced: https://docs.x.com/developer-terms/agreement, checked 2026-11-12); whether it covers Siar's pass-through is **unverified** | Fakhrul to read section III.A(e) (and get advice if needed) and decide |
| "Where's the SDK / MCP? `npx @siar/mcp` fails." | High for S3 once they try it; the home page shows the command [doc §6] | "TypeScript SDK, CLI and MCP server (version 0.1.0), built from the same OpenAPI contract." No install commands until published | Publish to npm (Fakhrul's go), or remove the commands from the site |
| "Can I do DMs / comment-to-DM?" | High in S6, medium in S2 | Beta for FB and IG, per organization on request, paid plans | Open the beta, then update `INBOX_NOTE` and the pricing copy |
| "Will a small Malaysian company be around in a year?" | Medium in S1 and S5 [inferred] | The price lock; one REST API with a public OpenAPI document. bundle.social v1 compatibility is a real exit path both ways, but naming it is parked | No data-export or SLA claims exist; do not invent them |
| "Why not just use Meta Business Suite / the native apps for free?" | High in S6. A Buffer 1★ reviewer: "you can actually do FOR FREE directly in each social media app" ([Trustpilot](https://www.trustpilot.com/review/buffer.com?stars=1)) | One post to every network, one calendar, one inbox for comments, analytics across networks, and an API. For a single-network shop, the native tool may be enough | None; target multi-network buyers |
| "Why not build it ourselves?" | Common in S1 and S4 | Point at the gates (P1), the tokens (P3) and the churn (P6) with sources. Siar's own approval files are first-hand proof of the work involved | None |
| "Do you have analytics for LinkedIn / TikTok?" | Medium | No claim: LinkedIn analytics are untested in production, and TikTok is not open | Test on a real profile |

---

## 7. The words buyers actually use

Verbatim phrases for copy, headings and FAQ questions. **Buyer** = said by a user. **Vendor** = a vendor's own copy (it shows
how the category talks, but never copy it). **Query** = an autocomplete phrase measured by a sibling file today.

### Pain words (buyer)

| Phrase | Where |
|---|---|
| "keep rejecting the application" | Postiz #1329 |
| "I've had enough with tiktok" | Postiz #1329 |
| "intended for personal use or internal company use are not eligible" | TikTok reviewer, via Postiz #2297 |
| "waiting for approvals" | n8n forum |
| "extremely unintuitive" | Postiz #621 (Facebook process) |
| "That's where I stopped." | dev.to (business registration) |
| "No company, no API" | dev.to title |
| "keeps disconnecting" / "keep getting disconnected" | Postiz #757, #623 |
| "refresh needed" / "keeps asking to refresh channel" | Postiz #2299, #1351 |
| "rinse and repeat" | Postiz #623 |
| "Could not add provider" | Postiz #918, 56 comments |
| "posts fail too often" / "Every scheduled post fails to send" | Buffer Trustpilot |
| "swallows errors" | Zernio Trustpilot |
| "posted the same video 4x" | Zernio Trustpilot |
| "charging per account makes it too expensive" | Zernio Trustpilot, via `competitors/late.md` |
| "moved from charging by profiles to charging by accounts" | Zernio Trustpilot |
| "keep changing their pricing and plans without notice" | Zernio Trustpilot |
| "split into expensive monthly add-ons" | AppSumo |
| "credits depleted" | X's error, Postiz #2231 |
| "Permanent Page Access Token" / "long-lived token" | Stack Overflow, n8n |
| "each customer must connect their own accounts" | Postiz #975 |

### Outcome words (buyer)

| Phrase | Where |
|---|---|
| "One API covers every network" | Ayrshare Trustpilot |
| "build my own planner app on top of it" | Ayrshare Trustpilot |
| "One API call publishes content across all major social networks directly to our clients' pages" | Ayrshare Trustpilot |
| "get live months in advance" | Ayrshare Trustpilot |
| "easy to integrate" | Ayrshare Trustpilot |
| "most reliable" | Ayrshare Trustpilot |
| "had everything up and running in less than an hour" | Zernio testimonial, via `competitors/late.md` (vendor-selected) |

### Query words (people type these)

- **Category:** "unified social media API", "social media API for AI agents", "social media mcp server",
  "social media api pricing" (all four autocomplete, re-checked 2026-11-12). **Corrected 2026-11-12:** "post to multiple
  social networks api" and "cheapest social media API" return no autocomplete [measured]; keep them only as unverified phrasings.
- **Switching:** "ayrshare alternatives reddit", "ayrshare free plan", "buffer alternative with api", "bundle social alternatives",
  "zernio alternative" (re-checked 2026-11-12). "getlate alternative" does not autocomplete [measured].
- **Workflow:** "can n8n post to instagram", "n8n post to social media".
- **Gates and errors:** "meta app review taking time", "tiktok content posting api audit", "pinterest api trial access denied",
  "linkedin community management api development tier access form", "x api credits depleted", "x api 402".
- **Malaysia:** "cara schedule post tiktok / facebook / ig", "comment to dm automation".

### Vendor framing to know, not copy

- "Stop maintaining 14+ social media integrations" (Ayrshare home).
- "no $149 profile minimum" (bundle.social/ayrshare-alternative, meta description).
- "Pay for channels, not seats" (Buffer, on buffer.com/agencies; not on its pricing page).
- "Unlimited connected accounts" (bundle.social home H3).

All four re-checked on the vendors' pages 2026-11-12 [sourced].

### Copy lines this research supports

All are inside `siar-truth.md` rules; inferred, for Fakhrul to choose from:

- "Pay per business, not per account. Every social account is included, from RM39 / $19 a month."
- "Facebook, Instagram and Threads through an app that has already passed Meta's review. No App Review of your own."
- "If a network says no, you get its own error and a fix, not a silent failure."
- "One post can't go out twice. Retries, restarts and double clicks are safe."
- "Your price never goes up while you stay subscribed."

---

## 8. Demand evidence summary (all grades inferred)

| Theme | Strongest evidence | Grade |
|---|---|---|
| Meta permissions and tokens | SO: 208k views (permanent page token), 189k (development mode), 35k tag questions on facebook-graph-api; n8n: 11k views (post to FB page); "meta app review" autocomplete 10 [measured / sibling] | **High**, long-standing |
| Per-account / per-profile pricing pain | Several rivals build pages on it; repeated Trustpilot/AppSumo complaints in 2026 [measured / third-party]. ("cheapest social media API" has no autocomplete on re-check, so it is not evidence) | **Medium–high** among people already paying |
| TikTok posting and audit | SO: 16k views (publishing videos on TikTok via API); Postiz: 29 TikTok issue titles; audit queries autocomplete [measured / sibling] | **Medium**, and Siar can't serve it yet |
| LinkedIn company pages | n8n: 2.4k views on the org scope error; Postiz: 49 LinkedIn titles [measured] | **Medium**, and Siar can't serve it yet |
| X cost and credits | Autocomplete "x api credits depleted", "x api 402"; X's pay-per-use page [sibling / sourced] | **Low–medium**, rising since pay-per-use [inferred] |
| n8n / AI-agent posting | Autocomplete for n8n + Instagram/Facebook/LinkedIn; "social media mcp server" [sibling]; Postiz shipped MCP and CLI and posted several Show HNs [measured: HN from?site=github.com/gitroomhq] | **Medium**, growing |
| Malaysian SME scheduling | Job queries ("cara schedule post …") yes; brand queries ("scheduler malaysia") no [sibling] | **Low** for the category, **medium** for the jobs |

Hacker News is a weak channel for this category. HN's Algolia index holds 57 stories linking to ayrshare.com, mostly its own
blog posts; 47 of them have 1–2 points and the best has 14. Postiz's best Show HN got 42 points and 4 comments (2024-11-20);
the 2024-08-30 one got 19 points and 7 comments, none about network gates. bundle.social's "Show HN: Ayrshare Alternative"
(2025-11-26) got 1 point and 1 comment, which is the founder's own [measured: hn.algolia.com API, 2026-11-12].
**Corrected 2026-11-12:** the earlier text said "30 HN submissions" (one page of `from?site=`) and named the 19-point post as Postiz's best. Buyers discuss this on GitHub issues, the n8n
forum, dev.to and (by autocomplete evidence) Reddit, not HN [inferred].

---

## 9. What this means for Siar (inferred, not decided)

1. **Lead with the two pains Siar can answer today: per-organization pricing and the Meta approval.** Both are true, sourced
   and hit S1, S2, S3 and S5.
2. **Make network status the trust signal.** Every segment asks "is X live?" first, and rivals contradict themselves. A
   single, dated status table helps more than any feature claim. The site must first stop over-claiming (siar-truth §6).
3. **Own the gate content from first-hand records.** Siar's `docs/approvals/` covers Meta (approved), TikTok (rejected,
   with the reason), LinkedIn Pages (denied) and Pinterest (trial). That is the experience buyers search for, written by
   someone who went through it. Publishing the rejections is Fakhrul's call.
4. **Time content to the triggers:** the Buffer REST shutdown (2027-02-01, brownouts now), the LinkedIn 202511 sunset
   (2026-11-16), and X credit errors.
5. **Do not court S6 with TikTok or auto-DM promises** until both are open. Court it with ringgit, FPX/DuitNow, one price for
   every account, and per-network BM how-tos for the open networks.
6. **Close the cheap objections in the product:** publish the npm packages or remove the install lines; decide on the DM
   beta; consider removing "Powered by Siar" or adding a custom domain if S1 is the main target.
7. **Fill the research gaps next:** Reddit (r/SaaS, r/n8n, r/socialmedia, r/webdev, r/Entrepreneur), G2/Capterra and
   Indie Hackers were not reachable for this file. Re-run when search is available.

---

## Sources (all fetched 2026-11-12 unless dated otherwise)

**Vendor pages (sourced):**

- https://www.ayrshare.com/pricing/
- https://www.ayrshare.com/ and https://www.ayrshare.com/docs/multiple-users/business-plan-overview (added in verification)
- https://zernio.com/pricing
- https://buffer.com/pricing.md, https://buffer.com/agencies, https://buffer.com/resources/legacy-rest-api-retired/ (added in verification)
- https://bundle.social/pricing, https://bundle.social/, https://bundle.social/ayrshare-alternative (added in verification)
- https://www.hootsuite.com/plans, https://sproutsocial.com/pricing/, https://www.upload-post.com/ (added in verification)
- https://getduta.com/pricing, https://postla-page.pages.dev/pricing.html (added in verification)
- https://docs.x.com/developer-terms/agreement (added in verification)
- https://docs.x.com/x-api/getting-started/pricing
- https://developers.tiktok.com/doc/content-posting-api-get-started
- https://developers.tiktok.com/doc/content-sharing-guidelines
- https://developers.facebook.com/docs/instagram-platform/reference/refresh_access_token
- https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-overview

**GitHub issues (measured, via `gh`):**

- Postiz: https://github.com/gitroomhq/postiz-app/issues — #515, #621, #623, #757, #918, #975, #1004, #1016, #1329, #1351, #1513, #1563, #1578, #1807, #1854, #2005, #2231, #2297, #2299. 878 issues listed with `gh issue list --state all`.
- Mixpost: https://github.com/inovector/mixpost/issues — #74, #166.

**n8n community forum (measured):**

- https://community.n8n.io/t/instagram-dms-webhooks-work-only-in-test-mode/176851
- https://community.n8n.io/t/linkedin-oauth-unauthorized-scope-w-organization-social-when-connecting-organization-page/127405
- https://community.n8n.io/t/how-to-get-a-token-for-a-long-lifetime-fb-page/16143
- https://community.n8n.io/t/linkedin-how-to-post-to-the-company-page/47924
- Tag listings /tag/linkedin and /tag/facebook

**dev.to (measured):**

- https://dev.to/justjinoit/instagram-graph-api-lies-to-you-3-things-that-broke-my-automation-12n2
- https://dev.to/hrekov/no-company-no-api-59cd
- https://dev.to/chrononyte/what-the-instagram-api-doesnt-tell-you-about-publishing-3m5e
- https://dev.to/ashb4/what-building-a-social-scheduler-taught-me-about-reliability-4ff3
- https://dev.to/frandeveloper/meta-access-token-expired-why-it-lasts-60-days-and-how-to-refresh-it-2h81 (a rival vendor)
- https://dev.to/perufitlife/9-social-media-posting-apis-compared-by-price-october-2026-read-from-each-pricing-page-509b (a rival vendor)

**Stack Overflow (measured, via api.stackexchange.com 2.3):**

- Top-voted questions in instagram-graph-api, tiktok-api, twitter-api-v2, linkedin-api and facebook-graph-api.
- Tag counts: facebook-graph-api 34,975; linkedin-api 5,223; youtube-data-api 4,501; instagram-api 2,958; instagram-graph-api 618; tiktok-api 67.

**Hacker News (measured):**

- https://news.ycombinator.com/from?site=ayrshare.com
- https://news.ycombinator.com/from?site=github.com/gitroomhq
- https://news.ycombinator.com/from?site=bundle.social
- https://news.ycombinator.com/from?site=twittercommunity.com
- https://news.ycombinator.com/item?id=41402138
- https://news.ycombinator.com/item?id=35374698
- https://news.ycombinator.com/item?id=46062145

**Reviews (third-party):**

- https://www.trustpilot.com/review/ayrshare.com
- https://www.trustpilot.com/review/getlate.dev?stars=1&stars=2&stars=3
- https://www.trustpilot.com/review/buffer.com?stars=1
- https://www.trustpilot.com/review/hootsuite.com?stars=1
- https://appsumo.com/products/late/reviews/

**Not reachable:**

- reddit.com and old.reddit.com (fetch refused)
- g2.com and capterra.com (403)
- stackoverflow.com web pages (blocked)
- devcommunity.x.com (403)
- WebSearch (run-wide budget exhausted)

**Sibling files used:**

- `../siar-truth.md`
- `../competitors/ayrshare.md`
- `../competitors/buffer.md`
- `../competitors/bundle-social.md`
- `../competitors/late.md`
- `../competitors/hootsuite-sprout.md`
- `../competitors/upload-post.md`
- `../competitors/my-sea-schedulers.md`
- `../keywords/head-unified.md`
- `../keywords/alternatives-vs.md`
- `../keywords/per-network.md`
- `../keywords/ai-agents-mcp.md`
- `../keywords/malaysia-bm.md`
