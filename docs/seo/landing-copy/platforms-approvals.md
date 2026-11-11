# /platforms/approvals: final copy (en)

Status: publish-ready copy, written 2026-11-12. Strike plan §5.3 row `/platforms/approvals` (cluster C04, NEW, W1) and
strike 5 ("Meta already cleared", the dated approval record and the gate guides). Segment: developers, mainly the
gate-blocked builders of `messaging.md` §4.4 and `market.md` segment 5. There is no current page:
`apps/site/src/pages/` has `platforms.astro` but no `platforms/` folder, so this is new copy. It sits under `/platforms`
(final copy in `landing-copy/platforms.md`) and reuses that page's status lines word for word.

Sources for every Siar fact:
- `docs/approvals/README.md` (status table "checked 2026-11-12") and the per-network files `meta.md`,
  `meta-review-audit.md`, `meta-review-submission.md` / `.json`, `google.md`, `linkedin.md`, `pinterest.md`,
  `tiktok.md`, `x.md`, `discord-slack-bluesky-mastodon.md`, `reddit.md`, `snapchat.md` [doc].
- `docs/seo/research/siar-truth.md` as corrected by `docs/seo/strike-plan.md` §2 (row 7: YouTube) [doc].
- Status lines: `docs/seo/messaging.md` §9, used word for word.

Network rules quoted on the page come from each network's own developer pages. I fetched these on 2026-11-12
[sourced]:
- https://developers.facebook.com/docs/resp-plat-initiatives/individual-processes/app-review
- https://developers.tiktok.com/doc/content-posting-api-get-started
- https://developers.tiktok.com/doc/content-sharing-guidelines
- https://developers.google.com/youtube/v3/revision_history
- https://developers.pinterest.com/docs/key-concepts/access-tiers/
- https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-overview
- https://learn.microsoft.com/en-us/linkedin/marketing/community-management-app-review
- https://developers.google.com/my-business/content/prereqs
- https://developers.snap.com/api/marketing-api/Public-Profile-API/GetStarted

Taken from sibling files that checked them the same day [sourced there]:
- X pricing (https://docs.x.com/x-api/getting-started/pricing), from `siar-truth.md` §1c.
- Slack's 2025-05-29 rate-limit change (https://docs.slack.dev/changelog/2025/05/29/rate-limit-changes-for-non-marketplace-apps),
  from `landing-copy/platforms.md`.

Not verified today:
- Discord's 100-server rule. Discord's help page returned 403 to the fetcher, so the line rests on Siar's own setup
  notes [doc, unverified on Discord's page].
- Reddit's rules. Reddit's pages refused the fetcher (`per-network.md` §1). The page states no Reddit rule, only that
  Siar has not applied.

Labels in these editor notes (never on the page): **[doc]** Siar's own records, **[code]** this checkout,
**[sourced]** the network's own page with URL, **[measured]** seen by me today, **[inferred]** judgement.

No competitor is named on this page. `messaging.md` §11 allows rival names only on `/compare/*`, the pricing
explainers, `/malaysia`, the webhook table and `/compare/failure-handling`. The comparison table below compares the
**networks'** gates, not vendors.

---

## Before this page ships (blocking)

1. **TikTok row.** It uses the strike-plan default: "audit not passed yet; sandbox only" (strike plan §5.3, §3 item 5).
   The 20 October 2026 rejection and its reason stay off the page until Fakhrul says yes. The held text is under the
   TikTok section, marked HELD.
2. **Wave 0 first.** This page says plainly what is closed. The live home page still shows TikTok, LinkedIn company
   pages and Google Business as "Posted" (siar-truth §6 items 1–2). A reader who sees both leaves. Ship strike plan
   0.1–0.2 before this page.
3. **Gate guide links.** `/facebook-api/meta-app-review`, `/linkedin-api/community-management-api`,
   `/youtube-api/audit`, `/youtube-api/quota` and `/pinterest-api/access` are NEW in W1. Link each one only when it is
   live; until then, drop the link sentence for that network. Never link a 404 or a HOLD page (strike plan §6
   rule 11). `/tiktok-api/audit` is HOLD, so the TikTok section links the hub and its error page only.
4. **Owner checks (Fakhrul).** Each is also flagged where it appears:
   1. **Meta.** "Resubmitted on 27 October and approved the same day." The records give no reason for the
      resubmission. Add it if you want it printed; otherwise the line stays as written.
   2. **Pinterest.** "Siar has not requested Standard access yet" is my reading. `pinterest.md` lists the request as
      the next step, and `per-network.md` says "Standard not yet applied for". Correct it if it has been filed.
   3. **Google Business Profile.** "FF Dev Studio is an online-only studio, so it can't hold a Business Profile" is
      the plain version of `google.md`. Cut it to "Not open yet. No date." if you'd rather not say it.
   4. **Open-network dates.** "Live since 2026-10-12" for X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack
      is Siar's launch date (README). The approval files give no separate date for each, and X has no production post
      on record [doc]. This matches `/platforms`.
   5. **LinkedIn denial date.** The records show "Access denied" when checked on 2026-11-12, with no date for the
      decision itself. The page says "shown as Access denied, checked 12 November 2026", not a decision date.

---

## Meta

| Field | Value |
|---|---|
| URL | `https://siaran.my/platforms/approvals` |
| Meta title (60 chars) | `Social media API approval by platform: a dated record \| Siar` |
| Meta description (150 chars) | `Which social media APIs need approval, and what each asked Siar for: Meta approved, TikTok's audit not passed, LinkedIn Pages denied, YouTube waiting.` |
| H1 | Social media API approval by platform: Siar's own record |
| Visible date line (under the H1) | Updated 12 November 2026. Every date comes from Siar's own application records. |
| Canonical | `https://siaran.my/platforms/approvals` |
| Breadcrumb | Home › Networks › Approvals |

Editor notes:
- The title leads with the C04 head phrase. "| Siar" is allowed because the title already carries "social media API"
  (strike plan §5.0 rule 6).
- The description names the three outcomes people search for: Meta approved, TikTok not passed, LinkedIn denied. It
  uses "Pages" for LinkedIn company pages to fit 155 characters. The body always says "company pages".

---

## Hero

**H1:** Social media API approval by platform: Siar's own record

**Date line:** Updated 12 November 2026. Every date comes from Siar's own application records.

**Subhead (the answer, 59 words):**

> Meta, TikTok, YouTube, Pinterest, LinkedIn company pages, Google Business Profile and Snapchat all vet an app before
> it can post for other people. X, Bluesky, Mastodon, Slack and small Discord bots don't. Siar, a unified social media
> API, records every gate here: Meta approved Siar on 27 October 2026, LinkedIn denied company-page access, and
> TikTok's audit hasn't passed yet.

**Second line (smaller):**

> What each network asked for, what Siar sent, what came back, and what it means for the accounts your customers
> connect. Refusals included.

**Primary CTA:** Start with 20 free posts
**Secondary CTA:** Read the quickstart (links `/docs/quickstart`)

Under the buttons, one plain line: "20 free posts to try, once. No card."

Editor note: no kicker. If the layout needs one, use "Networks" alone with no side note (`messaging.md` §8).

---

## Section 1: the record at a glance

**H2:** Which social media APIs need approval, and where Siar stands

**Intro (2 sentences):**

> Siar is built for 15 networks, and they use three kinds of gate: a review of your app, an allowlist you have to be
> invited onto, or nothing at all. Here is each network's gate, when Siar applied, what came back, and what you can do through Siar today.

**Table.** One row per network. Each row has an anchor (`#meta`, with `#facebook`, `#instagram` and `#threads` as
aliases; then `#youtube`, `#pinterest`, `#linkedin`, `#tiktok`, `#x`, `#bluesky`, `#mastodon`, `#discord`, `#slack`,
`#reddit`, `#snapchat`, `#google-business-profile`), so `/platforms`, the hubs and the gate guides can link one row.
The network's monochrome glyph sits before its name. Rows are grouped by outcome in this order.

Columns: Network · The network's gate · Applied · Decided · Outcome · What you can do through Siar today

| Network | The network's gate | Applied | Decided | Outcome | What you can do through Siar today |
|---|---|---|---|---|---|
| Facebook, Instagram, Threads | Meta App Review, plus business verification | 2026-10-14 | 2026-10-27 | Approved: all 27 permissions | Facebook Pages: open today. Instagram professional accounts: open today (Facebook Login or Instagram Login). Threads: open today. |
| YouTube | Google OAuth verification, then a YouTube API compliance audit for more quota | OAuth 2026-10-14 · audit 2026-10-15 | OAuth 2026-10-15 · audit: no decision | OAuth verified. Audit acknowledged 2026-10-16, nothing since | YouTube: connect and upload now; public uploads not yet confirmed. |
| Pinterest | Trial access, then Standard access with a demo film | Trial at registration | Trial 2026-10-21 | Trial approved. Standard not requested yet | Pinterest: connect your account today; publishing Pins opens after Pinterest grants Standard access. |
| LinkedIn (personal profiles) | None: Share on LinkedIn is self-serve | 2026-10-12 | Self-serve | Live | LinkedIn: personal profiles today. |
| LinkedIn (company pages) | Community Management API, vetted, Development then Standard tier | 2026-10-14 | No date given | Access denied, no reason given | Company pages open after LinkedIn grants page access. |
| TikTok | Content Posting API audit | 2026-10-13 | — | Audit not passed yet; sandbox only | TikTok: built, opening after TikTok approves Siar. |
| X | None: pay per use | — | — | Live since 2026-10-12 | X: open today, billed from a prepaid credit at X's own USD prices. |
| Bluesky | None | — | — | Live since 2026-10-12 | Bluesky: open today. |
| Mastodon | None: Siar registers itself on each server | — | — | Live since 2026-10-12 | Mastodon: open today, on any server. |
| Discord | None below 100 servers | — | — | Live since 2026-10-12 | Discord: open today, posting as a bot with a name and avatar per brand. |
| Slack | None for public distribution | — | — | Live since 2026-10-12 | Slack: open today. Importing replies is slow, because Slack limits apps outside its Marketplace. |
| Reddit | A Reddit API access request | Not filed | — | Built, not open | Reddit: built, not open yet. |
| Snapchat | An allowlist, through a Snap contact | Not filed | — | Built, not open | Snapchat: built, not open yet. |
| Google Business Profile | An access request from a profile verified 60+ days | Not filed | — | Built, not open | Google Business Profile: built, not open yet. |

**Under the table (small type):**

> Network names are trademarks of their owners. Siar is not affiliated with or endorsed by any of them. An approval is
> a decision about Siar's app, not a partnership or a badge.

**Phone layout:** at phone width each row becomes a block: network and outcome on one line, then the gate, the dates
and "What you can do today" as short labelled lines. No horizontal scroll.

Editor notes:
- Every cell in the last column is the exact `messaging.md` §9 line. The table, `/platforms` and the hubs must read
  from the one status constant (strike plan 0.2), never from the health endpoint (siar-truth §0).
- Dates [doc]:
  - Meta: `meta-review-audit.md` "Submitted (2026-10-14)"; `meta.md` "APPROVED 2026-10-27".
  - YouTube: README tracker row 3 (OAuth submitted 2026-10-14); `google.md` (approved 2026-10-15; audit submitted
    2026-10-15); README status (acknowledged 2026-10-16).
  - Pinterest: `pinterest.md`.
  - LinkedIn: `linkedin.md` (the "Siar" app created 2026-10-12; CM form submitted 2026-10-14; Access denied as of
    2026-11-12).
  - TikTok: `tiktok.md` ("submitted 2026-10-13 22:21 MYT").
  - Reddit, Snapchat, Google Business Profile: each file says "PARKED 2026-10-14 … Nothing was submitted" or the
    equivalent.
- "Pinterest: Standard not requested yet": owner check 2.
- No status pills in color. Ink on paper for every value. The on-air red is not used: nothing here is a live feed
  (`messaging.md` §8).

---

## Section 2: Meta (Facebook, Instagram, Threads)

**H2:** Meta App Review: submitted 14 October, approved 27 October 2026

**Lead (answer first):**

> Meta approved Siar's app on 27 October 2026, with all 27 permissions it asked for. Facebook Pages, Instagram
> professional accounts and Threads connect through that app. It is the one gate where using Siar means you skip the
> review: your customers sign in to Meta through Siar's connect link, and you never file your own.

**What Meta asked for**

> Meta reviews any app used by people who have no role on it. Its own page puts it this way: review applies "if your
> app will be used by anyone without a Role on the app"
> ([Meta, App Review](https://developers.facebook.com/docs/resp-plat-initiatives/individual-processes/app-review),
> checked 12 November 2026). For Siar that meant:
>
> - **Business verification** of FF DEV STUDIO against its company registration, and a verified siaran.my domain.
> - **A written use for each permission**, saying what Siar does with it and why the product breaks without it.
> - **A screen recording of Siar's own product for each permission**: starting signed out, showing the person grant the
>   permission, then the feature that uses it.
> - **Proof of the edge cases.** How an unsent Instagram message is handled. A real Facebook account with a tester role
>   for the Messenger permission. A live comment rule that replies within 30 seconds for the Instagram comment
>   permission.
> - **Data handling answers:** who processes the data, in which countries, and how deletion works, plus a data
>   deletion page and callbacks for when someone removes the app.

**What Siar did**

> Siar asked for 27 permissions in one submission, across four parts of the product: Facebook Pages, Instagram
> (through Facebook Login and through Instagram Login), Threads, and Messenger and Instagram messages. Each
> permission got its own description and its own film.
>
> A check against the guidance in each permission dialog, before submitting, found six things Meta could reject. Siar
> changed the product for three of them. The inbox now shows a message as unsent when the sender unsends it.
> Connecting a Facebook Page now tells the admin they are granting access to business assets. The privacy policy now
> has a section on data from Facebook, Instagram and Threads. The submission went in on 14 October 2026.

**What came back**

> Siar resubmitted on 27 October 2026, and Meta approved the app the same day, with all 27 permissions. The Data Use
> Checkup was completed the same day, and the business is verified.

**What it means for you**

> - Facebook Pages, Instagram professional accounts and Threads are open today, on every plan, Free included.
> - Your customers connect through Siar's branded connect link with your name, logo and color. You never see their
>   password or token.
> - Facebook's API posts to Pages only, not to personal profiles or groups. Instagram's posts to professional
>   (business or creator) accounts only.
> - Meta approved the messaging permissions too. In Siar, Facebook and Instagram DMs and comment-to-DM automations are
>   in beta, turned on per organization on request (paid plans).

**The 27 permissions (collapsed by default, "Show all 27"):**

> Facebook Pages: `pages_show_list`, `pages_read_engagement`, `pages_read_user_content`, `pages_manage_posts`,
> `pages_manage_engagement`, `pages_manage_metadata`, `read_insights`, `business_management`, `pages_messaging`,
> `public_profile`, Business Asset User Profile Access.
> Instagram (Facebook Login): `instagram_basic`, `instagram_content_publish`, `instagram_manage_comments`,
> `instagram_manage_insights`, `instagram_manage_messages`.
> Instagram (Instagram Login): `instagram_business_basic`, `instagram_business_content_publish`,
> `instagram_business_manage_comments`, `instagram_business_manage_insights`, `instagram_business_manage_messages`.
> Threads: `threads_basic`, `threads_content_publish`, `threads_manage_replies`, `threads_read_replies`,
> `threads_manage_insights`, `threads_delete`.

**Link line:** The full walkthrough, with what each film showed: [Meta App Review, step by step](/facebook-api/meta-app-review).

Editor notes:
- Facts [doc]:
  - Dates and the 27 permissions: `meta.md` and the keys of `meta-review-submission.json` (counted: 27).
  - The six pre-submit items and the three product fixes: `meta-review-audit.md` (items 1–6, the "Progress" section
    shows #3, #6 and #7 deployed in `faaecd38d608`). Item 7, the privacy policy, was a "should fix", so "three of
    them" counts #3, #6 and #7 together. If you want it exact: "Siar changed the product for two of them and the
    privacy policy for a third."
- "Resubmitted on 27 October": owner check 1. Do not add a reason that is not in the records.
- Two of the four "What Meta asked for" bullets paraphrase the permission-dialog guidance. Siar's record quotes it,
  but the dialogs sit inside Meta's developer dashboard, not on a public page [doc]. The one public quote is from
  Meta's App Review page [sourced].
- "skip the review" appears only here and only for Meta (`messaging.md` §3 pillar 2; task rule).
- No reviewer names, test logins, processor names or submission IDs on the page.

---

## Section 3: YouTube (Google)

**H2:** YouTube: Google verified Siar's sign-in on 15 October 2026; the API audit has no decision yet

**Lead:**

> Google verified Siar's YouTube sign-in on 15 October 2026, so people connecting a channel see Siar's name with no
> unverified-app warning. The YouTube API compliance audit, which decides quota, was submitted the same day.
> Google acknowledged it on 16 October 2026 and has not answered since.

**What Google asked for**

> - **OAuth verification** for the two sensitive scopes Siar uses to upload and manage a channel's videos and
>   comments: a verified domain, Siar's name and logo on the consent screen, a privacy policy and terms on siaran.my,
>   and a demo film showing each scope in use.
> - **A compliance audit** against YouTube's developer policies. Google's own page says every developer must pass it
>   "to be granted more than the default quota allocation of 10,000 units"
>   ([YouTube Data API revision history](https://developers.google.com/youtube/v3/revision_history), entry of
>   1 July 2021, checked 12 November 2026).

**What Siar did**

> Before filing the audit, Siar shipped the policy work on 15 October 2026. The privacy policy gained a "Data from
> YouTube" section. The connect screen now links YouTube's terms and Google's privacy policy. Siar deletes data read
> from a channel when the channel is removed, and refreshes or deletes stored YouTube data within 30 days. The audit
> form lists the 22 endpoints Siar calls, and search is not one of them.

**What changed on Google's side**

> Until 2 November 2026, uploads from an unaudited project were locked private. On that date Google changed it:
> uploads from unverified projects "are no longer restricted to private viewing mode"
> ([revision history](https://developers.google.com/youtube/v3/revision_history), entry of 2 November 2026, checked
> 12 November 2026). Google adds that some uploads may still default to private because of the creator's own account
> settings.

**What it means for you**

> - YouTube: connect and upload now; public uploads not yet confirmed. Siar lists YouTube as open once a public upload
>   is confirmed on production.
> - Comments and analytics work on connected channels.
> - Until Google grants the extra quota, every Siar customer's YouTube calls share the default daily quota of Siar's
>   one Google project.

**Link line:** [YouTube API audit: what Google checks](/youtube-api/audit) · [YouTube API quota explained](/youtube-api/quota)

Editor notes:
- Facts [doc]: `google.md` (OAuth approval email 2026-10-15 14:58 MYT; the scopes `youtube.upload` and
  `youtube.force-ssl`; release 8ec1540 deployed 2026-10-15 with the privacy, connect-screen and retention work;
  22 endpoints, "Never search.list"); README status (acknowledged 2026-10-16, "nothing since").
- The YouTube status line follows `messaging.md` §9 and strike plan §2 row 7, not the older "videos stay private"
  wording in siar-truth §1b.
- "Share the default daily quota" is strike plan §3 item 8 ("all customers share Siar's one Google project quota
  until the quota extension is granted" [doc]). Never print a per-day upload number here (strike plan §2 row 7).
- The retention sentence simplifies `google.md` ("imported YouTube comments and history deleted after 30 days unless
  refreshed"; "everything read from YouTube for a removed channel wiped"). Keep it no stronger than that.

---

## Section 4: Pinterest

**H2:** Pinterest: Trial access approved 21 October 2026; Standard access is the next step

**Lead:**

> Pinterest approved Siar's Trial access on 21 October 2026. Trial lets an app connect accounts and read them, but
> Pins it creates are visible only to whoever made them, so Siar keeps Pin publishing closed. Publishing needs
> Standard access, which Siar has not requested yet.

**What Pinterest asks for**

> - **Trial access:** a business account and an app registration, reviewed when the app is created. Pinterest says
>   "all Pins and Boards created with Trial access are only visible to their creator as Sandbox entities."
> - **Standard access:** requested with the Upgrade button on the app card. It needs a demo video of the app using the
>   Pinterest API, including the full sign-in flow, inside a live integration
>   ([Pinterest, access tiers](https://developers.pinterest.com/docs/key-concepts/access-tiers/), checked
>   12 November 2026).

**What Siar did**

> Siar registered its app and received Trial access on 21 October 2026. Its Trial keys went live on production on
> 12 November 2026, so connecting and reading work. The Standard request needs a demo film recorded by hand on the live
> integration. That film is Siar's next step.

**What it means for you**

> - Pinterest: connect your account today; publishing Pins opens after Pinterest grants Standard access.
> - If you try to create a Pin today, Siar's API refuses it with a plain reason instead of making a Pin only you can
>   see.

**Link line:** [Pinterest API access: Trial vs Standard](/pinterest-api/access)

Editor notes:
- Facts [doc]: `pinterest.md`, README status. The refusal is [code: `pinterest.ts` line 42, "The Pinterest app only
  has Trial access, so it cannot create public pins yet"].
- "Siar has not requested yet": owner check 2.

---

## Section 5: LinkedIn

**H2:** LinkedIn: personal profiles live; company-page access denied, no reason given

**Lead:**

> Posting to your own LinkedIn profile works through Siar today, because LinkedIn's Share on LinkedIn product is
> self-serve. Company pages need LinkedIn's Community Management API, which LinkedIn vets by hand. Siar applied on
> 14 October 2026. When checked on 12 November 2026, the request showed "Access denied", with no reason given.

**What LinkedIn asks for**

> - **Personal profiles:** nothing beyond creating an app and adding Share on LinkedIn and Sign In with LinkedIn.
> - **Company pages:** the Community Management API, "Vetted Product with development and standard tiers"
>   ([LinkedIn, Community Management overview](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-overview),
>   checked 12 November 2026). LinkedIn's review page lists what it checks: an approved use case, a verified business
>   email, a verified organization, its website and domain, and an app verified by the organization's LinkedIn Page.
>   It is open "only to registered legal organizations for commercial use cases"
>   ([LinkedIn, Community Management App Review](https://learn.microsoft.com/en-us/linkedin/marketing/community-management-app-review),
>   checked 12 November 2026).
> - **A separate app.** The request can only be made on a new app with no other LinkedIn products.
> - **If refused:** a rejected app can't apply again. LinkedIn's instruction is to create a new app and submit a new
>   request.

**What Siar did**

> Siar's main LinkedIn app went live on 12 October 2026, verified by the FF Dev Studio company page, with Share on
> LinkedIn and Sign In with LinkedIn. On 14 October 2026 Siar created a second app, "Siar Pages", with no other
> products, verified it the same day, and submitted the Development tier form. The form named FF DEV STUDIO, its
> registered address in Malaysia, and three uses: page management, page analytics and profile management.

**What came back**

> The developer portal shows "Access denied" for that request. No email with a reason arrived.

**What it means for you**

> - LinkedIn: personal profiles today; company pages open after LinkedIn grants page access.
> - Comments and analytics on LinkedIn profiles are not confirmed yet.
> - If company pages are the job, Siar is not the tool for it today.

**Link line:** [LinkedIn Community Management API: tiers, forms and denials](/linkedin-api/community-management-api)

Editor notes:
- Facts [doc]: `linkedin.md` (status 2026-11-12 and 2026-10-14 blocks). LinkedIn rules [sourced, both URLs fetched
  2026-11-12]. The quoted phrases are verbatim from those pages.
- LinkedIn comments/analytics on profiles: siar-truth §2 row "LinkedIn comments/analytics" ("Leave out until tested"),
  so "not confirmed".
- Do not print Siar's next move (a new app, or a reapplication from a different company form). Nothing in the records
  decides it.

---

## Section 6: TikTok

**H2:** TikTok: the Content Posting API audit hasn't passed yet

**Lead:**

> Siar applied for TikTok's Content Posting API audit on 13 October 2026. The audit has not passed yet, so Siar runs
> TikTok on sandbox keys only, and no customer can connect a TikTok account.

**What TikTok asks for**

> - **An audit before public posting.** TikTok's own page: "All content posted by unaudited clients will be restricted
>   to private viewing mode"
>   ([TikTok, Content Posting API get started](https://developers.tiktok.com/doc/content-posting-api-get-started),
>   checked 12 November 2026).
> - **Limits until then.** "Unaudited API Clients can allow up to 5 users to post in a 24 hour window", and every
>   posting account must be private
>   ([TikTok, content sharing guidelines](https://developers.tiktok.com/doc/content-sharing-guidelines), checked
>   12 November 2026).
> - **A composer that follows TikTok's rules line by line:** the creator's own privacy options with no default, their
>   interaction settings, the maximum video length, commercial content disclosure and the music usage confirmation.

**What Siar did**

> Siar verified its domain, built the posting flow to TikTok's content-sharing guidelines, recorded demo films of that
> flow, and submitted the audit on 13 October 2026.

**What it means for you**

> - TikTok: built, opening after TikTok approves Siar.
> - There is nothing to connect yet. A private-only TikTok for at most five people is not something you could sell to
>   your customers, so Siar keeps it closed rather than half open.
> - TikTok comments are not part of this application.

**Link line:** [TikTok API reference](/tiktok-api) · [TikTok API error codes](/tiktok-api/errors) (it explains
`unaudited_client_can_only_post_to_private_accounts`)

Editor notes:
- Facts [doc]: `tiktok.md` (submitted 2026-10-13 22:21 MYT; domain verification; the composer table; production on
  sandbox keys, "only the sandbox target user can connect"). The guideline rules [sourced, both URLs fetched
  2026-11-12].
- "TikTok comments are not part of this application": `tiktok.md` ("The six Business-API scopes … are not part of
  this application"). siar-truth §2 says not to mention TikTok comments as a feature. This line states the absence and
  promises nothing. Cut it if Fakhrul prefers silence.
- `/tiktok-api/audit` is HOLD. Do not link it.
- **HELD: publish only with Fakhrul's yes.** If he says yes, replace the H2, the lead and add a "What came back" block:
  > **H2:** TikTok: audit not passed on 20 October 2026; resubmission next
  >
  > **What came back:** On 20 October 2026 TikTok's reviewer turned the audit down. The demo films have to be recorded
  > by hand, every click and transition, with no automated recording, and the full website address has to be visible.
  > Siar is re-recording them by hand and will resubmit. Production stays on sandbox keys until then.
  >
  > Source: `tiktok.md` "NOT APPROVED 2026-10-20" and README status. "Will resubmit" is the README's "Re-record K1/K2,
  > resubmit". Print it only if that is still the plan.

---

## Section 7: networks with no review

**H2:** X, Bluesky, Mastodon, Discord and Slack: no app review, live since 12 October 2026

**Lead:**

> Five networks ask for no review before an app posts for other people. Siar's apps for all five have been live since
> launch on 12 October 2026. What each one asks for instead:

**X**

> - **What X asks for:** a developer account, a description of the app's use, and credit. There is no review and no
>   subscription. X charges per call: $0.015 to create a post, $0.20 for a post with a URL
>   ([X API pricing](https://docs.x.com/x-api/getting-started/pricing), checked 12 November 2026).
> - **What it means for you:** X: open today, billed from a prepaid credit at X's own USD prices. Posts, threads, polls,
>   quotes and replies, within X's own reply rules.

**Bluesky**

> - **What Bluesky asks for:** nothing to register. Siar publishes its OAuth client details at a public address, and
>   that address is its identity.
> - **What it means for you:** Bluesky: open today. Under Bluesky's rules for public OAuth clients, a sign-in lasts two
>   weeks before the account reconnects. An app password connection has no such limit.

**Mastodon**

> - **What Mastodon asks for:** nothing central. Siar registers itself as an app on each server the first time someone
>   from that server connects.
> - **What it means for you:** Mastodon: open today, on any server.

**Discord**

> - **What Discord asks for:** an application with a bot. Discord asks for verification only once a bot is in 100 or
>   more servers.
> - **What it means for you:** Discord: open today, posting as a bot with a name and avatar per brand. The bot can post
>   and delete replies; it does not import comments.

**Slack**

> - **What Slack asks for:** an app with public distribution turned on. No review; a Slack Marketplace listing is
>   optional. Apps outside the Marketplace installed since 29 May 2025 can read message history once a minute
>   ([Slack changelog](https://docs.slack.dev/changelog/2025/05/29/rate-limit-changes-for-non-marketplace-apps),
>   checked 12 November 2026).
> - **What it means for you:** Slack: open today. Importing replies is slow, because Slack limits apps outside its
>   Marketplace. Posting is not affected.

Editor notes:
- Facts [doc]: `x.md`, `discord-slack-bluesky-mastodon.md`. X prices [sourced in siar-truth §1c]. Slack [sourced in
  `landing-copy/platforms.md`, re-check before publishing].
- **Bluesky two-week line** rests on Siar's own notes ("Bluesky caps an OAuth session at 2 weeks"; app passwords have
  no cap) [doc]. Not checked on Bluesky's or atproto's pages today. Verify on the atproto OAuth spec before
  publishing, or cut both sentences after "Bluesky: open today."
- **Discord 100 servers** is [doc]. Discord's help page returned 403 today. Re-check on discord.com before publishing,
  or cut the sentence.
- "Live since 12 October 2026": owner check 4. "within X's own reply rules" points at `x.md` (since February 2026,
  self-serve apps can only reply to posts that mention or quote the account). That rule is not printed because it is
  not checked on X's page.

---

## Section 8: built, not open

**H2:** Reddit, Snapchat and Google Business Profile: built, not open yet

**Lead:**

> Siar's integrations for these three are built and tested against mocks. None is open, and Siar gives no date. In
> each case Siar has not filed the network's request, for the reason below.

> **Snapchat.** The Public Profile API is invite-only: "The Public Profile API is currently allowlist only." You send
> your app's client ID to your Snap contact
> ([Snap, Public Profile API](https://developers.snap.com/api/marketing-api/Public-Profile-API/GetStarted), checked
> 12 November 2026). Siar has no Snap contact, so there is no one to send it to. Snapchat: built, not open yet.
>
> **Google Business Profile.** Google gives API access to an applicant that manages "a Google Business Profile that is
> verified and active for 60+ days"
> ([Google, Business Profile API prerequisites](https://developers.google.com/my-business/content/prereqs), checked
> 12 November 2026). FF Dev Studio is an online-only studio, so it can't hold a Business Profile of its own. Google
> Business Profile: built, not open yet.
>
> **Reddit.** Siar has not applied for Reddit API access yet. Reddit: built, not open yet.

Editor notes:
- Facts [doc]: `snapchat.md`, `google.md` (Business Profile, "PARKED 2026-10-14 … online-only studios are not
  eligible"), `reddit.md` ("Nothing was submitted").
- "Tested against mocks": `snapchat.md` says so ("tested against a mock only"); `reddit.md` says "built and tested".
  For Google Business Profile the records say nothing about tests. If in doubt, cut "and tested against mocks".
- Google Business Profile reason: owner check 3.
- No Reddit rule is stated: Reddit's pages could not be read (`per-network.md` §1).

---

## Section 9: the gates side by side

**H2:** What each network requires before an app can post for other people

**Intro:**

> If you're deciding whether to build these integrations yourself, this is the list of gates you'd face. Each row
> quotes the network's own developer page, checked 12 November 2026.

| Network | Gate | Before you pass it | Source |
|---|---|---|---|
| Facebook, Instagram, Threads | App Review per permission; business verification is a separate Meta process | Only people with a role on your app can grant the permissions | [Meta, App Review](https://developers.facebook.com/docs/resp-plat-initiatives/individual-processes/app-review) |
| TikTok | Content Posting API audit | Posts are private only; at most 5 users can post in 24 hours; posting accounts must be private | [Get started](https://developers.tiktok.com/doc/content-posting-api-get-started), [guidelines](https://developers.tiktok.com/doc/content-sharing-guidelines) |
| YouTube | OAuth verification for sensitive scopes; compliance audit for more than 10,000 quota units a day | Since 2 November 2026, uploads are no longer forced private | [Revision history](https://developers.google.com/youtube/v3/revision_history) |
| Pinterest | Trial access, then Standard access with a demo video of the sign-in flow and a live integration | Pins and boards are visible only to their creator | [Access tiers](https://developers.pinterest.com/docs/key-concepts/access-tiers/) |
| LinkedIn company pages | Community Management API: vetted Development tier, then Standard tier with a screen recording per use case; registered legal organizations only; a new app with no other products | Development tier carries limited call volume; a refused app can't reapply | [Overview](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-overview), [app review](https://learn.microsoft.com/en-us/linkedin/marketing/community-management-app-review) |
| LinkedIn profiles | None: Share on LinkedIn is self-serve | — | [Share on LinkedIn](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin) |
| Google Business Profile | Access request from a profile verified and active for 60+ days, with a website | Quota is 0 until approved | [Prerequisites](https://developers.google.com/my-business/content/prereqs) |
| Snapchat | Allowlist through a Snap contact | Not usable | [Public Profile API](https://developers.snap.com/api/marketing-api/Public-Profile-API/GetStarted) |
| X | None; pay per use | — | [X API pricing](https://docs.x.com/x-api/getting-started/pricing) |
| Slack | None for public distribution | Message history once a minute outside the Marketplace | [Slack changelog](https://docs.slack.dev/changelog/2025/05/29/rate-limit-changes-for-non-marketplace-apps) |
| Bluesky, Mastodon, Discord | None (Discord: verification from 100 servers) | — | Siar's own setup notes |

Editor notes:
- Every row is a network rule, not a competitor fact, so `messaging.md` §11 does not apply. Re-check every linked page
  within 7 days of publishing (strike plan §5.0 rule 3).
- Reddit is left out because Reddit's pages could not be read.
- The Share on LinkedIn URL was sourced in `per-network.md` §1 (checked 2026-11-12), not fetched again by me today.

---

## Section 10: build it yourself, or use Siar's apps

**H2:** If you build these integrations yourself

> You can. Budget for the gates, not just the code. Siar's Meta review ran from 14 to 27 October 2026, including a
> same-day resubmission. LinkedIn denied company-page access without a reason. TikTok's audit hasn't passed. YouTube's
> audit has had no answer since 16 October. Each network also changes its API on its own schedule; LinkedIn, for
> example, retires each monthly API version after about a year.
>
> With Siar, your customers connect Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and
> Slack through apps that are live today. You get the same gates on the rest, and this page tells you where each one
> stands.

**"How Siar handles this" box (3 lines, links `/how-publishing-works`):**

> - Every network's status, with dates. [Network status](/platforms)
> - Revoked or expiring connections are flagged, with a `social-account.updated` webhook.
>   [How connections are checked](/how-publishing-works#accounts)
> - If a network says no, you get its own code and message, plus the fix. [The network's own error](/how-publishing-works#errors)

Editor notes:
- The first paragraph is the `messaging.md` §5 answer to "Why not build it ourselves?", with the YouTube line added
  [doc]. The LinkedIn version rule: "each version supported a minimum of one (1) year" (strike plan §2 row 6
  [sourced: learn.microsoft.com …/versioning]). "About a year" stays inside that.
- The box follows `messaging.md` §2 (gate pages: the answer first, then a three-line box) and strike plan §6 rule 2.

---

## Section 11: price, for the open networks

**H2:** One price for your organization, not for each account

> No per-account fees. Each brand connects one account on every open network: Starter 1 brand, Pro 10, Business
> unlimited. A post sent to every connected network counts as one post.
>
> Start with 20 free posts to try. Then $19 a month (RM39 in Malaysia) for one brand and 300 posts a month, $49 (RM99)
> for 10 brands and 10,000 posts with a 14-day trial, or $149 (RM399) for unlimited brands and 100,000 posts. Your
> price never goes up while you stay subscribed.

Link: [See the pricing](/pricing)

Trust line (small):

> FF DEV STUDIO (SSM 202603234793), Malaysia. Meta App Review passed on 27 October 2026.

Editor note: "Each brand connects one account on every open network" is the default accounts wording until Fakhrul
rules (strike plan §10 decision 3). Change it here, on `/platforms` and in FAQ 12 together.

---

## Section 12: how this record is kept

**H2:** How this page stays true

> Every row comes from Siar's own application records. When a network decides, this page, `/platforms`, the network's
> reference page and Siar's `llms.txt` change in the same release, and the change goes in the
> [changelog](/changelog). A network moves to "open" only after it has approved Siar's app and a post has gone
> through on production.
>
> Siar publishes the refusals too, because "which networks are actually open" is the first thing you need to know,
> and a list that only shows wins doesn't answer it.

Editor notes:
- "In the same release" is true only once strike plan 0.2 ships (one status constant). Do not publish this sentence
  before that build.
- "A post has gone through on production" is the rule for YouTube (strike plan §3 item 8), stated as general here as
  on `/platforms` FAQ 12. Keep it only if Fakhrul agrees it is the rule for every network.
- Add `/network-changes` (W1) next to the changelog link once it exists.

---

## Section 13: FAQ (visible on the page; same text in FAQPage JSON-LD)

**H2:** Questions about social media API approvals

**Which social media APIs need approval?**
Meta (Facebook, Instagram, Threads), TikTok, YouTube, Pinterest, LinkedIn company pages, Google Business Profile and
Snapchat all vet an app before it can post for other people. X, Bluesky, Mastodon, Slack and LinkedIn personal
profiles need no review. Discord asks for verification only once a bot is in 100 or more servers.

**How long does Meta App Review take?**
Meta publishes no fixed time. Siar's took 13 days: submitted on 14 October 2026, resubmitted and approved on 27 October
2026, with all 27 permissions. Most of the work came before submitting: a written use and a screen recording for each
permission, business verification, and fixes to the product where Meta's guidance asked for them.

**Do I need my own Meta App Review if I use Siar?**
No, for Facebook, Instagram and Threads. Your customers connect through Siar's Meta app, which passed App Review on
27 October 2026 with all 27 permissions it asked for. They sign in to Meta themselves through Siar's connect link, so
you never handle a password or token, and you file nothing with Meta.

**Why was Siar's LinkedIn Community Management API request denied?**
LinkedIn gave no reason. Siar applied on 14 October 2026 from a new app, verified by its company page, as LinkedIn
requires. The portal later showed "Access denied" and no email followed. LinkedIn's rule is that a refused app can't
reapply: a new request needs a new app. Personal profiles work through Siar today.

**Can I post to TikTok through Siar?**
Not yet. Siar applied for TikTok's Content Posting API audit on 13 October 2026, and the audit hasn't passed yet. Until
an app passes, TikTok keeps its posts private and lets at most five users post in 24 hours, so Siar runs TikTok on
sandbox keys only and nobody can connect an account.

**Are YouTube API uploads still locked private before the audit?**
Not since 2 November 2026. Google's revision history says uploads from unverified projects are no longer restricted to
private, though a creator's own settings can still make an upload private. Through Siar you can connect and upload
now; Siar lists public uploads as confirmed once one goes through on production.

**What is the difference between Pinterest Trial and Standard access?**
Trial access lets an app connect accounts and call the API, but Pins and boards it creates are visible only to their
creator. Standard access lifts that. Pinterest grants it after you request it from the app card with a demo video of
the sign-in flow and a live integration. Siar has Trial access since 21 October 2026.

**Does the X API need an app review?**
No. X has no app review. You open a developer account, describe the app, buy credit and pay per call, for example
$0.015 to create a post and $0.20 for a post with a URL. Through Siar, X is open today, billed from a prepaid credit at
X's own USD prices, with no markup from Siar.

**When will TikTok, Pinterest publishing or LinkedIn company pages open?**
Siar can't give a date, because each network decides on its own schedule. The integrations are built. When a network
approves Siar's app and a post goes through on production, this page, the network's status on Siar's networks page and
the changelog change in the same release.

**Is Siar a Meta partner?**
No. Meta approved Siar's app in App Review on 27 October 2026. That is a decision about one app's permissions, not a
partnership, a certification or a badge. Siar is not affiliated with or endorsed by Meta or any other network on this
page, and it uses each network's public developer APIs under their terms.

**Why does Siar publish its refusals?**
Because the first thing a developer needs to know is which networks actually work. A list that shows only approvals
hides the answer. This page shows every gate Siar has met, with the date and the outcome, so you can plan around
TikTok, LinkedIn company pages and the rest before you write any code.

**What does it cost to use Siar's approved apps?**
There is no extra fee for the approvals. Siar charges per organization, not per account: 20 free posts to try, then
$19 a month (RM39 in Malaysia) for one brand, $49 (RM99) for 10 brands or $149 (RM399) for unlimited brands. Your price
never goes up while you stay subscribed.

Editor notes:
- Answer lengths (words, counted by script): see the build check at the end of this file. All lead with the answer.
- FAQ 1: Discord's threshold is [doc] (owner check / re-check in Section 7). If it is cut there, cut it here.
- FAQ 9: "in the same release" depends on strike plan 0.2, like Section 12. Hold the sentence until that build.
- FAQ 2: "13 days" is arithmetic on Siar's dates [inferred from doc]. "Meta publishes no fixed time": Meta's App Review
  page fetched today states no review time [measured]. If Fakhrul adds the resubmission reason (owner check 1), it
  can go here.
- FAQ 8: "no markup from Siar" holds in USD (siar-truth §4, X row). Ringgit buyers see a rate with a buffer, so the
  answer says "at X's own USD prices" and nothing about ringgit. The X terms read is still open (strike plan §3 gated
  doors); this states how it works and is not a price weapon (`messaging.md` §11 rule 5).
- FAQ 10: "uses each network's public developer APIs under their terms" is a general statement. Keep it only if
  Fakhrul is comfortable while the X terms question is open; otherwise end the answer at "on this page".

---

## Section 14: closing CTA

**H2:** Write it once. Siar it everywhere.
**Dim line:** Everywhere that's open today.

> Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack, through apps that are
> already live. Start with 20 free posts to try. No card.

**Primary CTA:** Start with 20 free posts
**Secondary CTA:** Read the quickstart

Editor note: pass this text to `Cta.astro` as props. Its default still says "The Free plan gives you 20 posts…" and
"Start free" with an arrow glyph (see `landing-copy/platforms.md`, Section 9).

---

## Objection handling (where each is answered on the page)

| The buyer thinks | Answered by | Line |
|---|---|---|
| "Every API says it supports every network, then doesn't." | Hero, Section 1 | The page leads with the refusals: "LinkedIn denied company-page access, and TikTok's audit hasn't passed yet." |
| "Will I still have to sit through Meta's review?" | Section 2, FAQ 3 | No: "the one gate where using Siar means you skip the review." Meta only. |
| "How do I know Meta really approved it?" | Section 2 | Dates, the resubmission, the 27 permission names, and what Meta asked for. No badge. |
| "Can I post to TikTok?" | Section 6, FAQ 5 | Not yet; the audit hasn't passed; sandbox only; TikTok's own private-only and 5-user rules, linked. |
| "I need YouTube." | Section 3, FAQ 6 | Connect and upload now; Google's 2 November 2026 change, linked; public uploads not yet confirmed; shared quota until the audit. |
| "LinkedIn company pages are the whole point." | Section 5, FAQ 4 | Denied, no reason given. "If company pages are the job, Siar is not the tool for it today." |
| "Pinterest?" | Section 4, FAQ 7 | Connect today; Pins need Standard access; Siar hasn't requested it yet. |
| "Why not just build it myself?" | Sections 9–10 | The network gates side by side, sourced, and Siar's own timeline as the cost of doing it. |
| "When will X open?" | FAQ 9, Section 12 | No date; the rule for when a row changes. |
| "Is a small company honest about this?" | Section 12, FAQ 11 | Refusals are published; FF DEV STUDIO with its SSM number in the trust line. |
| "Is this a partnership?" | Under the table, FAQ 10 | An approval is a decision about one app, not a badge; not affiliated. |

---

## Comparison table

The page has one: Section 9, the networks' own gates, each sourced to the network's own developer page and checked
2026-11-12. No vendor comparison: `messaging.md` §11 keeps rival names off this page.

For the record (not for the page), why this table is the opening [from the research files]:
- One rival leads with "Skip months of platform approvals and go live today." (Zernio, `research/competitors/late.md`
  line 42).
- Another vendor claims passed TikTok and LinkedIn reviews on its own page without dates (Post for Me,
  `research/competitors/others-dev-apis.md` lines 430–433, "not independently verified").
- PostWire shows approval dates (strike plan §2 row 2). Duta shows a "Built, waiting for approval" list
  (`research/competitors/my-sea-schedulers.md` line 120).
- No vendor in the files publishes refusals with dates and what the network asked for [inferred from the
  teardowns]. That gap is the page.

Never claim "the only" or "the first" to publish this (`messaging.md` §10: "The only one … with dated approvals" is
banned; PostWire has dates).

---

## Internal links

**Out of this page** (all in the copy above):
- `/platforms` and `/platforms#<net>`; `/pricing`; `/docs/quickstart`; `/changelog`.
- `/how-publishing-works#accounts`, `#errors` (Section 10 box).
- Gate guides, W1, each linked only when live: `/facebook-api/meta-app-review`,
  `/linkedin-api/community-management-api`, `/youtube-api/audit`, `/youtube-api/quota`, `/pinterest-api/access`.
- Hubs: `/tiktok-api`, `/tiktok-api/errors`. Add `/facebook-api`, `/instagram-api`, `/threads-api`, `/youtube-api`,
  `/pinterest-api`, `/linkedin-api`, `/x-api`, `/bluesky-api`, `/mastodon-api`, `/discord-api`, `/slack-api`,
  `/reddit-api`, `/snapchat-api` and `/google-business-profile-api` as the network name in each section heading's
  first mention. Use the query wording: "Instagram API", not "Learn more".
- Never link `/tiktok-api/audit` (HOLD) or `/google-business-profile-api/access` (W3) before they exist.

**Into this page** (add when it ships):
- `/platforms`: the "Approval record" link on each gated row (`/platforms/approvals#<net>`), already written in
  `landing-copy/platforms.md`. Its Section 3 closing line links here.
- Every gate guide links `/platforms/approvals#<net>` and its hub (strike plan §6 rule 3).
- Every network hub links `/platforms/approvals#<net>` (strike plan §6 rule 4).
- Footer, site-wide: "Approvals" next to "Networks" (strike plan §6 rule 9).
- `/about` facts block: "Meta App Review passed on 27 October 2026" links `/platforms/approvals#meta`.
- Home FAQ "Do I need developer apps on every network?" ends with "See each network's approval record." linking here.
- `/guides/social-media-api-integration` (C27, W2): the build-vs-buy cost section links here as its evidence.
- `llms.txt` and `/pricing.md`: one line under the status block, "Approval record with dates:
  https://siaran.my/platforms/approvals".
- Anchor text to use: "social media API approval by platform", "approval record", "Meta App Review record",
  "<Network> approval status". Never "approved on every network" or "all 15 networks".

Minimum 3 contextual in-links at launch (strike plan §6 rule 10): `/platforms`, the footer and `/about` cover it on
day one; the gate guides add more as they ship.

---

## Schema notes

- `BreadcrumbList`: Home › Networks (`/platforms`) › Approvals (`/platforms/approvals`).
- `WebPage` (not `Article`: it is a living record, not a dated post):
  - `name` = the H1, `description` = the meta description;
  - `dateModified` = the visible "Updated" date, generated from the status constant's last change, ISO format;
  - `datePublished` = launch day;
  - `about` → the site's `Organization` / `SoftwareApplication` `@id`;
  - `mainEntity` → the FAQPage.
- `FAQPage` with the 12 questions exactly as visible.
- Optional `ItemList` of the network rows. Only if generated from the same constant. Each `ListItem` gets a `name`
  (the network), a `url` (`/platforms/approvals#<net>`) and a `description` (the status line). Nothing more.
- Do not use `Event` for application dates, or `Certification` / `EducationalOccupationalCredential` /
  `award` for the Meta approval. It is not a credential, and markup that implies one is a badge in disguise.
- No `AggregateRating`, `Review` or `Offer`. Prices live in `/pricing` schema.
- `Organization` stays as on the rest of the site (FF DEV STUDIO, SSM in `identifier`). Do not add `memberOf` or
  `sponsor` links to Meta, Google or any network.

---

## Build notes

- Data: one record per network in the status constant, extended with `{ gate, applied, decided, outcome, asked[],
  did[], meaning[], guide? }`, filled from `docs/approvals/`. The page and `/platforms` render from it. A change in
  `docs/approvals` changes both at the next build (strike plan §5.0 rule 2).
- The 27 Meta permission names render from the keys of `docs/approvals/meta-review-submission.json`, so the count can't
  drift.
- Dates render as "27 October 2026" in prose and `2026-10-27` in the table and JSON-LD (`messaging.md` §6).
- Section headings get anchors matching the table (`#meta`, `#youtube`, …), so the table rows link to their section.
- No icons on the "What … asked for / What Siar did / What it means for you" run-in heads. They are plain bold words
  in body type, not mono-caps labels.

---

## Why this wins

**Keywords (C04 hub and its spokes):**
- Primary: "social media api approval by platform". Demand is low to medium; there is no autocomplete test for the
  exact phrase, and one vendor already has a page with that slug (`keyword-map.md` C04, `per-network.md` row 1)
  [inferred].
- "which social media apis need approval": the H2 of Section 1 and FAQ 1, worded to be quoted whole [inferred].
- "meta app review": 10 autocomplete completions, including "time", "taking time", "process", "requirements", "video",
  "reddit" [measured by a sibling, `per-network.md` row 26]. Section 2 and FAQ 2 answer "time" with a dated, first-hand
  13 days, which is rare in that SERP [inferred].
- "tiktok content posting api audit": autocomplete child; "tiktok api audit" has 5 completions; page 1 is thin vendor
  posts [measured by a sibling, `per-network.md` row 71].
- "linkedin community management api" (4 completions, including "access" and "development tier access form")
  [measured by a sibling, row 56]. The denial with LinkedIn's own reapply rule is first-hand.
- "pinterest api standard access" and "pinterest api trial access denied" (autocomplete) [measured by a sibling,
  row 93, `market.md` §8c].
- "youtube api audit" (6 completions, including "services audit and quota extension") and "youtube api upload
  private" [measured by a sibling, rows 88–89]. The 2 November 2026 change makes older pages stale [sourced +
  inferred].

**AI prompts it should answer:**
- "Which social media APIs need app review?" (FAQ 1).
- "How long does Meta App Review take?" (FAQ 2, a dated case).
- "Do I need my own Meta App Review to post to Instagram through an API?" (FAQ 3, `ai-answers.md` row 72).
- "Can Siar post to TikTok / LinkedIn company pages?" (FAQs 4–5).
- "Can an unaudited YouTube project upload public videos in 2026?" (FAQ 6).
- "Pinterest API Trial vs Standard access" (FAQ 7).
- "Is building my own social media integration worth it?" (Section 10).

**Why it should beat the field:** rival pages say "skip the approvals" or list networks as supported. This one gives,
per network, the network's own rule (linked and dated), what Siar actually sent, what came back (refusals included),
and what that means for an account your customer connects. That is first-hand, checkable and dated, which is what
engines cite for "when" and "why" questions (strike plan §8 item 4) [inferred]. It also feeds every gate guide and
`/platforms`, so it earns links inside the site from day one.

**Research limits:** the shared web-search budget for this run was spent before this page was written, so I ran no
new SERP, autocomplete or People Also Ask check. Every demand figure above is a sibling's measurement from
2026-11-12, used as inferred demand. The network pages I fetched myself today are listed at the top; Discord and
Reddit could not be fetched.

---

## Build check (character and word counts)

Counted with a script on the final text:
- Meta title: 60 characters. Meta description: 150 characters.
- Hero subhead: 59 words; the first 60 words of the page (H1 + subhead) answer "which social media APIs need
  approval" and give Siar's outcomes.
- FAQ answers (words), in order: 51, 55, 52, 54, 53, 50, 58, 56, 47, 55, 54, 50. All within 40–60.
- Hero, FAQ 1 and the Section 9 table rely on Discord's 100-server rule [doc, unverified today]. If the re-check
  fails, change "small Discord bots" in the hero to "Discord" and cut the Discord sentence in FAQ 1.
