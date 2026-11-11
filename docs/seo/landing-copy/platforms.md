# /platforms: final copy

Status: publish-ready copy for Wave 0 (strike plan §5.1 item 0.2, §5.2 row `/platforms`). Written 2026-11-12.
Replaces the live page `apps/site/src/pages/platforms.astro` ("15 networks. One integration." plus the capability grid).

Sources for every Siar fact: `docs/seo/research/siar-truth.md` (checked 2026-11-12), `docs/seo/messaging.md` §9 (status
lines, used word for word), `docs/seo/strike-plan.md` §2 row 7 (YouTube), `docs/approvals/*.md` (dates). Network rules
come from each network's own developer pages, as recorded in `docs/seo/research/keywords/per-network.md` §1 (checked
2026-11-12). The YouTube 2 November 2026 change was re-read on Google's page for this file.

Labels in the editor notes: **[doc]** Siar's own approval records, **[code]** this checkout, **[sourced]** the network's
own page with URL, **[measured]** seen by me on 2026-11-12, **[inferred]** judgement.

---

## Meta

| Field | Value |
|---|---|
| URL | `https://siaran.my/platforms` (unchanged; it is already indexed in Google) |
| Meta title (52 chars) | `Social media API networks: what is open today \| Siar` |
| Meta description (150 chars) | `Siar's social media API posts to Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack today. The rest, with dates.` |
| H1 | Supported networks: what the Siar API can post to today |
| Visible date line (under the H1) | Updated 12 November 2026. Every row is checked against Siar's own approval records. |
| Canonical | `https://siaran.my/platforms` |

Editor note: the title follows strike plan §5.2 exactly. "| Siar" is allowed here because the title already carries
"social media API" (strike plan §5.0 rule 6).

---

## Hero

**H1:** Supported networks: what the Siar API can post to today

**Subhead (the answer, 58 words):**

> Siar, a unified social media API, publishes today to Facebook Pages, Instagram professional accounts, Threads, X,
> LinkedIn personal profiles, Bluesky, Mastodon, Discord and Slack. YouTube: connect and upload now; public uploads not
> yet confirmed. TikTok, Pinterest publishing and LinkedIn company pages open after each network approves Siar. Reddit,
> Snapchat and Google Business Profile are built, not open yet.

**Second line (smaller, under the subhead):**

> This page is the one place Siar records what is open. Every other page, the docs and `llms.txt` read their network
> status from it, so they can't disagree.

**Primary CTA:** Start with 20 free posts
**Secondary CTA:** Read the quickstart (links `/docs/quickstart`)

Under the buttons, one plain line: "20 free posts to try, once. No card."

Editor note: drop the old kicker "Networks" and the side note "15 supported". No kicker is needed; if the layout insists
on one, use "Networks" alone with no side note (messaging §8: a claim never sits in a kicker's side note).

---

## Section 1: the status table

**H2:** Status of every network, checked 12 November 2026

**Intro (2 sentences):**

> Siar is built for 15 networks. Nine are open today; the rest wait on a network's approval or on Siar's own next step,
> and each row says which.

**Table.** One row per network, each row with an anchor (`#facebook`, `#instagram`, `#threads`, `#x`, `#linkedin`,
`#linkedin-company-pages`, `#bluesky`, `#mastodon`, `#discord`, `#slack`, `#youtube`, `#tiktok`, `#pinterest`,
`#reddit`, `#snapchat`, `#google-business-profile`) so hubs and other pages can link to one row. Rows are grouped by
status in this order. The network's monochrome glyph sits before its name.

Columns: Network · Status · Since · Why · What you can do today · Links

| Network | Status | Since | Why | What you can do today | Links |
|---|---|---|---|---|---|
| Facebook | Open | 2026-10-27 | Siar's Meta app passed Meta's App Review on 27 October 2026, with all 27 permissions it asked for. | Facebook Pages: open today. Publish, schedule, edit and delete Page posts, reels and stories. Read, reply to, hide and delete comments. Page and post insights on paid plans. | [Facebook API reference](/facebook-api) · [Approval record](/platforms/approvals#facebook) |
| Instagram | Open | 2026-10-27 | Same Meta App Review, passed 27 October 2026. | Instagram professional accounts: open today (Facebook Login or Instagram Login). Feed posts, carousels, reels and stories, a first comment, comments and insights on paid plans. | [Instagram API reference](/instagram-api) · [Approval record](/platforms/approvals#instagram) |
| Threads | Open | 2026-10-27 | Same Meta App Review, passed 27 October 2026. | Threads: open today. Text, image, video and carousel posts, replies, insights and deletes. | [Threads API reference](/threads-api) · [Approval record](/platforms/approvals#threads) |
| X | Open | 2026-10-12 | X has no app review. It charges for every API call instead. | X: open today, billed from a prepaid credit at X's own USD prices. Posts, threads, polls, quotes and replies. | [X API reference](/x-api) · [Approval record](/platforms/approvals#x) |
| LinkedIn (personal profiles) | Open | 2026-10-12 | Posting to your own profile uses LinkedIn's self-serve Share on LinkedIn product. Siar's LinkedIn app is live. | LinkedIn: personal profiles today. Posts with text, images, video, documents and links. | [LinkedIn API reference](/linkedin-api) · [Approval record](/platforms/approvals#linkedin) |
| Bluesky | Open | 2026-10-12 | Bluesky has no app review. | Bluesky: open today. Posts with images, video, link cards, quotes, tags and labels. | [Bluesky API reference](/bluesky-api) |
| Mastodon | Open | 2026-10-12 | Mastodon has no app review. Siar registers itself on each server the first time someone connects from it. | Mastodon: open today, on any server. Statuses with visibility, content warnings and media. | [Mastodon API reference](/mastodon-api) |
| Discord | Open | 2026-10-12 | Discord asks for no review below 100 servers. | Discord: open today, posting as a bot with a name and avatar per brand. The bot can post replies and delete them; it does not import comments. | [Discord API reference](/discord-api) |
| Slack | Open | 2026-10-12 | Slack asks for no review for public distribution. | Slack: open today. Importing replies is slow, because Slack limits apps outside its Marketplace. Channel messages with files and a custom bot name. | [Slack API reference](/slack-api) |
| YouTube | Not confirmed | Connect and upload: 2026-10-15 | Google verified Siar's YouTube sign-in on 15 October 2026. On 2 November 2026 Google stopped forcing uploads from unaudited projects to private. Siar lists YouTube as open after one public upload is confirmed on production. | YouTube: connect and upload now; public uploads not yet confirmed. Connect a channel, upload videos and Shorts, read comments and analytics. | [YouTube API reference](/youtube-api) · [Approval record](/platforms/approvals#youtube) |
| TikTok | Opening after approval | Applied 2026-10-13 | TikTok's audit of Siar's app has not passed yet. Until it does, TikTok keeps any app's posts private, so Siar keeps TikTok closed. | TikTok: built, opening after TikTok approves Siar. Nothing to connect yet. Read the reference to see what Siar checks before a TikTok post. | [TikTok API reference](/tiktok-api) · [Approval record](/platforms/approvals#tiktok) |
| Pinterest | Opening after approval | Connect: 2026-11-12 | Pinterest granted Siar Trial access on 21 October 2026. Trial apps can connect and read, but the Pins they create are visible only to their creator. Public Pins need Standard access. | Pinterest: connect your account today; publishing Pins opens after Pinterest grants Standard access. | [Pinterest API reference](/pinterest-api) · [Approval record](/platforms/approvals#pinterest) |
| LinkedIn (company pages) | Opening after approval | Applied 2026-10-14 | Company pages need LinkedIn's Community Management API, which LinkedIn vets by hand. Siar's request was denied without a reason. | LinkedIn: personal profiles today; company pages open after LinkedIn grants page access. Post from a personal profile in the meantime. | [LinkedIn API reference](/linkedin-api) · [Approval record](/platforms/approvals#linkedin) |
| Reddit | Not open | No date | Siar has not applied for Reddit API access yet. | Reddit: built, not open yet. | [Reddit API reference](/reddit-api) |
| Snapchat | Not open | No date | Snapchat's Public Profile API is invite-only, through a Snap contact. Siar is not on the list. | Snapchat: built, not open yet. | [Snapchat API reference](/snapchat-api) |
| Google Business Profile | Not open | No date | Google gives Business Profile API access to businesses whose own profile has been verified and active for at least 60 days. Siar's request is on hold. | Google Business Profile: built, not open yet. | [Google Business Profile API reference](/google-business-profile-api) · [Approval record](/platforms/approvals#google-business-profile) |

**Under the table (small type):**

> Network names are trademarks of their owners. Siar is not affiliated with or endorsed by any of them.

**Phone layout:** at phone width each row becomes a block: network name and status on one line, then "Since", "Why",
"What you can do today" and the links as short labelled lines. No horizontal scroll.

Editor notes on the table:
- Every "What you can do today" cell starts with the exact messaging §9 line, then adds capabilities from siar-truth §1a.
- Status labels: four values, matching messaging §9 (`Open`, `Not confirmed`, `Opening after approval`, `Not open`).
  YouTube is the only "Not confirmed" row. It must not be shown as "Open" until a public upload is recorded on
  production (strike plan §3 item 8, "Kills it").
- The status pill uses ink on paper for every value. The on-air red (messaging §8) is not used: nothing here is a live
  feed.
- `/platforms/approvals` is NEW in W1. Until it ships, drop the "Approval record" links rather than link a 404. The
  networks without a review (Bluesky, Mastodon, Discord, Slack) and the parked ones (Reddit, Snapchat) get no approval
  link, because there is no record to show. Google Business Profile has one (parked 2026-10-14).
- **Owner check before publishing (Fakhrul):**
  1. "Since 2026-10-12" for X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack is Siar's launch date
     (README "LIVE at siaran.my since 2026-10-12") [doc]. The approval files give no separate go-live date for these
     networks, and X has no production post on record ("$20 balance, no usage yet") [doc]. Confirm or change.
  2. TikTok "Applied 2026-10-13" and "has not passed yet" follow the strike plan default ("audit not passed yet").
     The rejection itself (2026-10-20) is not printed, per strike plan §3 item 5. Say more only with Fakhrul's yes.
  3. LinkedIn "denied without a reason" is printed because messaging §5 allows it word for word.
  4. Reddit "Siar has not applied yet" and Google Business Profile "on hold" are the plain versions of "parked
     2026-10-14" [doc]. If Fakhrul prefers less detail, the fallback "Why" for all three parked rows is: "Not open yet.
     No date."

---

## Section 2: what the statuses mean

**H2:** What each status means

> **Open.** You can connect accounts and publish today, on every plan, Free included.
>
> **Not confirmed.** Connecting and uploading work, but one part (public YouTube visibility) has not been confirmed on
> production yet. Siar changes the row when it is.
>
> **Opening after approval.** The integration is built and tested. The network has to approve Siar's app first, and
> Siar can't set the date.
>
> **Not open.** The integration is built, but Siar hasn't opened it and gives no date.

> When a status changes, this table, the network's reference page and Siar's `llms.txt` change in the same release,
> and the change is listed in the [changelog](/changelog).

Editor note: "in the same release" is true only once item 0.2 ships (one status constant rendered everywhere). Do not
publish this sentence before that build. `/network-changes` (W1) can replace or join the changelog link when it exists.

---

## Section 3: why some networks are closed

**H2:** Why some networks are closed: each network's own gate

**Body:**

> Every network decides which apps may post for other people. Some ask nothing. Some review your app, your company and
> a screen recording of your product. Siar goes through the same gates you would. The difference is that Meta's is
> already cleared: Facebook, Instagram and Threads connect through Siar's Meta app, which passed App Review on
> 27 October 2026, so you don't need your own.
>
> Here is what each network asks for, from its own developer pages.

**Table:** What each network requires before an app can post for other people (checked 2026-11-12)

| Network | What the network requires | Source |
|---|---|---|
| Facebook, Instagram, Threads | Meta App Review for the publishing permissions, plus business verification. Siar's review: submitted 14 October 2026, passed 27 October 2026. | Siar's own record ([Approval record](/platforms/approvals#facebook)); Meta's permission lists at [developers.facebook.com/docs/instagram-platform/content-publishing](https://developers.facebook.com/docs/instagram-platform/content-publishing) and [developers.facebook.com/docs/threads/overview](https://developers.facebook.com/docs/threads/overview) |
| X | No review. Pay per use: for example, $0.015 to create a post and $0.20 for a post with a URL. | [docs.x.com/x-api/getting-started/pricing](https://docs.x.com/x-api/getting-started/pricing) |
| LinkedIn profiles | "Share on LinkedIn" is self-serve. | [learn.microsoft.com, Share on LinkedIn](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin) |
| LinkedIn company pages | The Community Management API is a vetted product with Development and Standard tiers, requested on a separate app. | [learn.microsoft.com, Community Management overview](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-overview) |
| TikTok | An audit. Until an app passes, TikTok restricts its posts to private viewing, and at most 5 users can post through it in 24 hours. | [developers.tiktok.com/doc/content-posting-api-get-started](https://developers.tiktok.com/doc/content-posting-api-get-started), [developers.tiktok.com/doc/content-sharing-guidelines](https://developers.tiktok.com/doc/content-sharing-guidelines) |
| YouTube | Google OAuth verification for the upload scopes, then an API audit for more quota. Since 2 November 2026, uploads from unaudited projects are no longer forced to private. | [developers.google.com/youtube/v3/revision_history](https://developers.google.com/youtube/v3/revision_history) |
| Pinterest | Trial access first, where Pins are visible only to their creator. Standard access needs a demo video and a live integration. | [developers.pinterest.com/docs/key-concepts/access-tiers](https://developers.pinterest.com/docs/key-concepts/access-tiers/) |
| Google Business Profile | An access request. The applicant's own profile must be verified and active for 60+ days; quota is 0 until approved. | [developers.google.com/my-business/content/prereqs](https://developers.google.com/my-business/content/prereqs) |
| Snapchat | The Public Profile API is allowlist-only: you send your app's client ID to a Snap contact. | [developers.snap.com, Public Profile API](https://developers.snap.com/api/marketing-api/Public-Profile-API/GetStarted) |
| Slack | No review for public distribution. Apps outside the Slack Marketplace (installed since 29 May 2025) can read message history once a minute. | [docs.slack.dev changelog, 2025-05-29](https://docs.slack.dev/changelog/2025/05/29/rate-limit-changes-for-non-marketplace-apps) |
| Bluesky, Mastodon, Discord | No review. Discord asks for verification only once a bot is in 100 or more servers. | Siar's own setup notes; Bluesky and Mastodon publish no app review |

> The full dated record of Siar's own applications, including the ones that went badly, is on the
> [approval record](/platforms/approvals).

Editor notes:
- Reddit is left out of this table on purpose: Reddit's own pages could not be fetched on 2026-11-12 (per-network.md
  §1, "Unverified on Reddit's pages"). Add it when a Reddit page is read and quoted.
- The Discord "100 servers" line is from Siar's own notes, not checked on Discord's page [doc]. Re-check
  discord.com/developers before publishing, or cut the sentence.
- Every row is a network's own rule, not a competitor fact, so `messaging.md` §11 (where rivals may be named) does not
  apply. No competitor is named on this page.
- Re-check each linked page within 7 days of publishing (strike plan §5.0 rule 3).

---

## Section 4: what works on each open network

**H2:** Comments, analytics and DMs on the open networks

> Publishing is the same request on every open network: one post, with per-network text and media where you want them.
> The rest varies by network, because the networks' own APIs do.

> **Comments and replies.** Read, reply and moderate on Facebook, Instagram, Threads, X (within X's reply rules),
> Bluesky, Mastodon and YouTube. On Slack, replies import slowly because of Slack's limit on apps outside its
> Marketplace. On Discord, the bot can post and delete replies but does not import comments.
>
> **Analytics.** Account and post metrics on every paid plan (not Free), put into one shape across networks, with the
> network's raw numbers kept.
>
> **LinkedIn comments and analytics.** Not confirmed on personal profiles yet.
>
> **DMs.** Facebook and Instagram DMs and comment-to-DM automations: in beta, turned on per organization on request
> (paid plans).

> Each network's reference page lists its post types, media rules, daily caps, requested permissions and error codes,
> generated from the code that enforces them.

Editor note: this section replaces the old "Compare networks" capability grid, which marked TikTok, Pinterest, Reddit,
Google Business Profile and Snapchat as usable (siar-truth §6 item 16). If a grid comes back, it lists open networks
only and is generated from the status constant plus each adapter's `capabilities`, with LinkedIn comments and analytics
set to "Not confirmed" (siar-truth §2, "LinkedIn comments/analytics").

---

## Section 5: network reference pages (the card grid)

**H2:** Reference pages for all 15 integrations

**Intro:**

> Every network Siar is built for has a reference page and an error page, open or not. Use them to plan an integration
> before a network opens.

**Grid.** Three groups, in this order, each with a plain sub-heading:

1. **Open today**: Facebook, Instagram, Threads, X, LinkedIn, Bluesky, Mastodon, Discord, Slack.
2. **Not confirmed, or opening after approval**: YouTube, TikTok, Pinterest.
3. **Not open yet**: Reddit, Snapchat, Google Business Profile.

**Card copy.** Each card shows the glyph, the network name, the exact status line from messaging §9 (not the `about`
text), and one link "<Network> API reference". Examples:

- Instagram: "Instagram professional accounts: open today (Facebook Login or Instagram Login)."
- YouTube: "YouTube: connect and upload now; public uploads not yet confirmed."
- Reddit: "Reddit: built, not open yet."

Editor note: the live cards print `n.about`, which describes LinkedIn company pages, Pinterest boards, Reddit
subreddits, Snapchat Stories and Google Business offers as working (`lib/networks.ts` lines 28–36). Cards must print the
status line until `about` is fixed (strike plan §5.1 item 0.12). The LinkedIn card stays one card; its status line
already covers both rows.

---

## Section 6: price, for the open networks

**H2:** One price for your organization, not for each account

> No per-account fees. Each brand connects one account on every open network: Starter 1 brand, Pro 10, Business
> unlimited. A post sent to every connected network counts as one post.
>
> Start with 20 free posts to try. Then $19 a month (RM39 in Malaysia) for one brand and 300 posts a month, $49 (RM99)
> for 10 brands, or $149 (RM399) for unlimited brands. Your price never goes up while you stay subscribed.

Link: [See the pricing](/pricing)

Trust line (small, under the section):

> FF DEV STUDIO (SSM 202603234793), Malaysia. Meta App Review passed on 27 October 2026.

Editor note: "Each brand connects one account on every open network" is the default accounts wording until Fakhrul rules
(messaging pillar 3, strike plan §10 decision 3). If he rules differently, change this paragraph and FAQ 9 together.

---

## Section 7: what Siar can't do yet

**H2:** What you can't do with Siar today

> - Post to TikTok.
> - Confirm that a YouTube upload goes public. It may; Siar hasn't recorded one on production yet.
> - Create Pins on Pinterest.
> - Post to a LinkedIn company page, or read LinkedIn analytics.
> - Post to Reddit, Snapchat or Google Business Profile.
> - Post to a personal Facebook profile or a Facebook group. Facebook's API allows Pages only.
> - Post to a personal Instagram account. Instagram's API allows professional (business or creator) accounts only.
>
> If one of these is the reason you're here, the table above tells you whether it depends on a network's approval or
> on Siar.

Editor note: bullets are allowed here because this is a real list, not decoration. No icons on the bullets.

---

## Section 8: FAQ (visible on the page; same text in FAQPage JSON-LD)

**H2:** Questions about networks

**Which social networks does Siar support?**
Siar publishes today to Facebook Pages, Instagram professional accounts, Threads, X, LinkedIn personal profiles,
Bluesky, Mastodon, Discord and Slack. YouTube connects and uploads now; public uploads are not yet confirmed. TikTok,
Pinterest publishing and LinkedIn company pages open after each network approves Siar. Reddit, Snapchat and Google
Business Profile are built, not open yet.

**Can I post to TikTok with Siar?**
Not yet. TikTok's audit of Siar's app has not passed, and until it does TikTok keeps an app's posts private, so Siar
keeps TikTok closed. The integration is built. Open today: Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky,
Mastodon, Discord and Slack.

**Can I upload public YouTube videos through Siar?**
You can connect a channel and upload videos and Shorts now. Since 2 November 2026, Google no longer forces uploads from
unaudited projects to private, so public uploads may work. Siar lists YouTube as open once a public upload is confirmed
on production. Until then, treat public visibility as unconfirmed.

**Can I post to a LinkedIn company page?**
Not yet. Posting to your own LinkedIn profile works today. Company pages need LinkedIn's Community Management API, which
LinkedIn vets by hand; Siar applied on 14 October 2026 and was denied without a reason. Company pages open if LinkedIn
grants page access.

**Can I create Pins on Pinterest?**
Not yet. You can connect a Pinterest account today. Pinterest granted Siar Trial access on 21 October 2026, and Pins
created under Trial access are visible only to their creator. Publishing Pins opens after Pinterest grants Standard
access, which needs a demo of Siar's live Pinterest integration.

**Do I need my own Meta developer app and App Review?**
No, for Facebook, Instagram and Threads. Your accounts connect through Siar's Meta app, which passed Meta's App Review
on 27 October 2026 with all 27 permissions it asked for. Your customers sign in to Meta themselves through Siar's
connect link, and you never see their password or token.

**Why does the API's health endpoint list TikTok and Pinterest as available?**
`GET /api/v1/` reports a network as available when its keys are on Siar's server. That is not the same as open:
TikTok runs on sandbox keys and Pinterest on Trial access. Use this page, not the health endpoint, to decide what you
can sell to your own customers.

**Do Reddit, Snapchat and Google Business Profile have a date?**
No. The integrations are built, but Siar has not opened them and gives no date. Snapchat's Public Profile API is
invite-only, Google Business Profile needs a profile verified for 60 days, and Siar has not applied to Reddit yet.
Changes appear in this table and the changelog.

**How many accounts can I connect?**
There are no per-account fees on any plan. Each brand connects one account on every open network: Starter has 1 brand,
Pro 10, and Business unlimited. Plans are capped by posts instead: 300 a month on Starter, 10,000 on Pro, 100,000 on
Business. A post to several networks counts as one.

**Can I post to personal Facebook profiles, groups or personal Instagram accounts?**
No. Facebook's API publishes to Pages only, not personal profiles or groups. Instagram's API publishes to professional
accounts only, business or creator, which you can connect with Facebook Login or Instagram Login. Switching a personal
Instagram account to a professional one is free in the Instagram app.

**Are Facebook and Instagram DMs included?**
They are in beta. Facebook and Instagram DMs and comment-to-DM automations are turned on per organization on request,
on paid plans. Meta approved the messaging permissions with Siar's App Review on 27 October 2026. No other network has
DMs in Siar.

**How will I know when a network opens?**
This table changes in the release that opens the network, and so do the network's reference page and Siar's
`llms.txt`. The change is also listed in the changelog. Siar does not change a status before the network has approved
its app and a post has gone through on production.

Editor notes:
- Answer lengths (words): 49, 42, 50, 42, 47, 48, 48, 47, 51, 47, 41, 49. All lead with the answer.
- FAQ 7 tells developers about the health endpoint's meaning. That is siar-truth §0, stated as a fact about Siar's own
  API. If Fakhrul fixes the endpoint to report real status, rewrite the answer.
- FAQ 12, last sentence: "and a post has gone through on production" is a commitment for the open process. Keep it
  only if Fakhrul agrees that is the rule (it is the rule for YouTube in strike plan §3 item 8).
- FAQ 10, last sentence ("Switching ... is free in the Instagram app"): a general Instagram fact, not checked on
  Instagram's help pages on 2026-11-12 [inferred]. Cut it if not verified before publishing.

---

## Section 9: closing CTA

**H2:** Write it once. Siar it everywhere.
**Dim line:** Everywhere that's open today.

**Body:**

> Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack, from one request. Start with
> 20 free posts to try. No card.

**Primary CTA:** Start with 20 free posts
**Secondary CTA:** Read the quickstart

Editor note: the shared `Cta.astro` default text says "The Free plan gives you 20 posts and 60 uploads to try", a
near-bare "20 posts" with "Free plan". Pass this page's text as props, and fix the default separately (messaging §6:
"20 free posts to try"). Its button "Start free" with an arrow glyph becomes "Start with 20 free posts" with no arrow
(messaging §6, Calls to action).

---

## Objection handling (where each is answered on the page)

| The buyer thinks | Answered by | Line |
|---|---|---|
| "Another API that says it supports everything, then doesn't." | Hero subhead, Section 1 | The page leads with what is closed, by name, with dates. "Siar is built for 15 networks. Nine are open today." |
| "Can I post to TikTok?" | Table row `#tiktok`, FAQ 2 | "Not yet. TikTok's audit of Siar's app has not passed." |
| "YouTube is what I need." | Row `#youtube`, FAQ 3 | Connect and upload now; Google's 2 November 2026 change; public uploads not yet confirmed. |
| "LinkedIn company pages are the whole point for my clients." | Row `#linkedin-company-pages`, FAQ 4 | Personal profiles today; denied without a reason; opens if LinkedIn grants page access. |
| "Will I still have to sit through Meta's review?" | Section 3, FAQ 6 | No: Siar's Meta app passed on 27 October 2026. Only Meta, never "skip the review" elsewhere. |
| "Your health endpoint says TikTok is available." | FAQ 7 | Available means keys are on the server, not open. |
| "Will this page go stale?" | Date line, Section 2 | Updated date shown; one status constant drives every page; changes listed in the changelog. |
| "How much does connecting 40 accounts cost?" | Section 6, FAQ 9 | No per-account fees; plans are fenced by brands and posts. |
| "Is this a real company?" | Trust line, Section 6 | FF DEV STUDIO (SSM 202603234793), Malaysia. |

---

## Comparison table

None against competitors on this page. `messaging.md` §11 limits rival names to `/compare/*`, the pricing explainers,
`/malaysia`, the webhook table and `/compare/failure-handling`. The Section 3 table compares the **networks'** own gates,
each sourced to the network's own developer page and dated 2026-11-12.

For the record, why this matters [sourced, from the research files, not for the page]: rivals lead with "Skip months of
platform approvals and go live today." (Zernio, quoted in `market.md` §8) and Ayrshare's page is titled "Supported Social
Networks: One API for 14+ Networks" (`competitors/ayrshare.md`), with no per-network status. `competitors/late.md` §5
records Zernio's home page selling networks its own docs list as disabled or closed beta. A dated, exactly true table
is the opening.

---

## Internal links

**Out of this page** (all in the copy above):
- Each network hub: `/facebook-api`, `/instagram-api`, `/threads-api`, `/x-api`, `/linkedin-api`, `/bluesky-api`,
  `/mastodon-api`, `/discord-api`, `/slack-api`, `/youtube-api`, `/tiktok-api`, `/pinterest-api`, `/reddit-api`,
  `/snapchat-api`, `/google-business-profile-api`.
- `/platforms/approvals#<net>` for Facebook, Instagram, Threads, X, LinkedIn, YouTube, TikTok, Pinterest, Google
  Business Profile (W1; omit until it exists).
- `/pricing`, `/docs/quickstart`, `/changelog`.
- When they ship: `/network-changes` (Section 2), `/how-publishing-works#status`, `/platforms/limits#<net>` (one link
  per open row, W2), the gate guides `/facebook-api/meta-app-review`, `/linkedin-api/community-management-api`,
  `/youtube-api/audit`, `/pinterest-api/access` (from the matching "Why" cells).

**Into this page** (add when this ships):
- Home FAQ "Which social networks does Siar support?" links `/platforms` (strike plan 0.10).
- Every network hub's status line links `/platforms#<net>` (strike plan §6 rule 4).
- `/pricing`: "on every open network" links `/platforms`.
- `/features`: the networks mention links `/platforms`.
- `llms.txt` and `/pricing.md`: the status block ends with "Full status: https://siaran.my/platforms".
- Every `/compare/*` page links `/platforms` as the status source (strike plan §6 rule 6).
- Site-wide header or footer: "Networks" links `/platforms`.
- Anchor text to use: "which networks are open", "network status", "<Network> status". Never "all 15 networks".

---

## Schema notes

- `BreadcrumbList`: Home › Networks (keep the existing `breadcrumbLd` call; the label "Platforms" may become "Networks").
- `WebPage` with `name` = the H1, `description` = the meta description, `dateModified` = the date in the visible
  "Updated" line (generated from the status constant's last change, ISO format), `about` → the site's
  `SoftwareApplication`/`Organization` `@id`.
- `FAQPage` with the 12 questions exactly as visible. This replaces the home FAQ's "15 networks: TikTok, YouTube, ..."
  answer as the fact engines repeat (siar-truth §6 item 9); the home FAQ answer must use FAQ 1's text word for word.
- Optional `ItemList` of the 16 rows (name + url of the hub + a `description` that is the status line). Only if it is
  generated from the same constant.
- No `AggregateRating`, `Review` or `Offer` here. Prices live in `/pricing` schema.
- No markup claims a network is "available" beyond the visible status.

---

## Build notes (for whoever wires it)

- One constant, e.g. `NETWORK_STATUS` in `apps/site/src/lib/networks.ts`: per row `{ key, label, status, since, why,
  today, approvalAnchor }`, with LinkedIn split into two rows. Status lines are the messaging §9 strings, nothing
  rewritten per page. **Never** derive status from `GET /api/v1/` health: it reports TikTok, YouTube and Pinterest as
  available because keys exist (siar-truth §0).
- The page `<title>` and description must not interpolate `NETWORKS.length` (today: "The 15 social networks the Siar
  API publishes to").
- Hero spans: a real space between lines (strike plan 0.19; the live H1 reads "15 networks.One integration.").
- The open count "Nine" in Section 1 and the open list in the hero, FAQ 1 and the CTA should be generated from the
  constant, so they change the day a network opens.

---

## Why this wins

**Targets:**
- Primary: "social media API supported networks". Demand is low: Google autocomplete returned 0 completions for
  "social media api supported" and "social media api networks" [measured 2026-11-12, one run, gl=us]. The page's value
  is as the fact source engines quote and every other Siar page links to, not as a head-term ranker [inferred].
- "which networks does Siar support" (prompt p033 in `docs/geo/prompts_v1.csv`): navigational, very low volume, high
  stakes. Today engines can only find "15 networks" with no status (`ai-answers.md` row 68). FAQ 1 gives them one
  exact sentence to repeat.
- "social media api networks status" / "<network> api status": "tiktok api status" does autocomplete, but its
  completions are about outages ("tiktok server status today") [measured]. This page answers the integration meaning of
  "status" through its anchors (`/platforms#tiktok`), not the outage meaning [inferred]. Don't chase outage traffic.
- "social media api approval by platform" (C04, Outstand has a page for it, `per-network.md` row 1): Section 3 is the
  dated table until `/platforms/approvals` takes the query in W1/W2.
- Gate long tail answered in rows and FAQs: "pinterest api standard access" (autocompletes [measured]), "youtube api
  audit" (6 completions incl. "youtube api services audit and quota extension" [measured]), "pinterest api trial access
  denied" and "linkedin community management api development tier access form" (`market.md` §8c [measured by a
  sibling]).

**AI prompts it should answer:**
- "Which networks does Siar support?" / "Does Siar post to TikTok?" / "Can Siar post to LinkedIn company pages?"
- "Which social media APIs can post to Threads, Bluesky, Mastodon, Discord and Slack?" (open-network depth, strike plan
  §3 item 11).
- "Do I need my own Meta App Review to post to Instagram through an API?" (Meta already cleared).
- "Can an unaudited YouTube API project upload public videos in 2026?" (Google's 2 November 2026 change, dated and
  sourced).

**Why it should beat the field:** rival "supported networks" pages list every network as supported. This one says, per
network, open or not, since when and why, with the network's own rule linked. That is the one thing a buyer checks
first (`market.md` §7: "Every segment's first objection is network status"), and it is checkable, which is what
answer engines cite [inferred].

**Research limits:** the shared web-search budget was spent before this page was written, so no new SERP was run for
these queries. The autocomplete checks above were made in one batch at the same time and are a single run. Every
demand estimate here is inferred.
