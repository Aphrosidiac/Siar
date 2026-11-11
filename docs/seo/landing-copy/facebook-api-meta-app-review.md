# /facebook-api/meta-app-review: final copy (en)

Status: publish-ready copy, NEW, wave W1. Written 2026-11-12. Strike plan §2 strike 5 ("Meta already cleared", the
dated approval record and the gate guides), §5.3 Facebook row (`/meta-app-review` C76 **W1**). Keyword map C76.
Segment: developers stuck at a network's gate (`messaging.md` §4.4, `market.md` segment 5).

There is no current page. `apps/site/src/pages/` has `[api]/index.astro` (the `/facebook-api` hub) and
`[api]/errors.astro`, but no `facebook-api/` folder, so this is new copy. It needs a new route, for example
`apps/site/src/pages/facebook-api/meta-app-review.astro`, outside the `[api]` dynamic routes.

This is the page that carries the site's one true "already done for you" call to action. Meta is the only network
where it is true. Every other network keeps its status line (section 12).

## Sources

**Siar facts [doc], all in this checkout:**
- `docs/approvals/meta.md`: status "App Review APPROVED 2026-10-27 (resubmission of 2026-10-27; all 27 permissions
  incl. Business Asset User Profile Access). Data Use Checkup completed 2026-10-27; business FF Dev Studio verified;
  app Live." Business verification inputs (§1), app settings (§2), the four Facebook Login for Business
  configurations created 2026-10-12 (§2b), deauthorize and data-deletion callbacks built 2026-10-12 (§2c).
- `docs/approvals/meta-review-plan.md`: the runbook dated 2026-10-12 (app Live, business verified, every permission
  used on production that day); what Meta asks for (§1, including the community-reported rejection causes, marked
  there as "not official policy"); the four use cases (§2); film format (§4); fresh consent screens (§4); the Testing
  page (§10: 0 calls on 2026-10-13, complete on 2026-10-14, Siar's own production calls counted, "Next" to clear
  "Needs your review"); what to keep during review (§11).
- `docs/approvals/meta-review-audit.md`: the pre-submit audit of 2026-10-14 (6 must-fix items, 2 should-fix items),
  the fixes deployed in `faaecd38d608`, the sign-in and consent heads added to every film, "Submitted (2026-10-14)".
- `docs/approvals/meta-review-submission.md` / `.json`: 27 permission keys (counted: 27), public_profile carries
  only the usage agreement (so 26 films), data handling answers, reviewer instructions, reviewer account on the top
  plan with messaging on.
- `docs/approvals/README.md`: status table checked 2026-11-12; "When a review comes back: I fix the exact point
  raised and it is resubmitted the same day."
- `packages/networks/src/adapters/meta-common.ts` line 105 [code]: Siar's reference entry for Meta error `(#10)`,
  meaning "A required permission was not granted, or the app lacks Advanced Access."

**Meta's own pages [sourced], fetched 2026-11-12:**
- App Review: https://developers.facebook.com/docs/resp-plat-initiatives/individual-processes/app-review
  (review is needed when the app is used by people outside its roles; "App Review is not required" otherwise; if Meta
  can't access the app, "your entire submission will be rejected"; a permission Meta can't test is not approved; no
  review time is stated; Business Verification listed as a separate process).
- Screen recordings: https://developers.facebook.com/docs/app-review/submission-guide/screen-recordings ("Capture the
  entire login flow, from logged-out to logged-in"; "Capture the complete authorization flow"; "Record in
  high-resolution, ideally 1080 or better"; "Omit audio; our reviewers will not listen to it"; "Use English as the app
  UI language"; captions and tooltips; bigger cursor).
- Access levels: https://developers.facebook.com/docs/graph-api/overview/access-levels/ (Standard Access "can only be
  requested from app users who have a role on the requesting app"; Advanced Access per permission through App Review;
  "Business Verification is required to get Advanced Access").
- Business verification: https://developers.facebook.com/docs/development/release/business-verification (required
  for apps that request advanced access; not needed for apps used only by people with a role; no timeframe stated;
  document list sits in Meta's Business Help Center).
- Instagram App Review: https://developers.facebook.com/docs/instagram-platform/app-review ("My app is only for a
  business I own or manage": Standard Access, no App Review, for Instagram Login and Facebook Login; a Tech Provider
  serving multiple businesses needs App Review for Advanced Access under both; "Upload a screencast showing the
  end-to-end user experience for that specific permission or feature").
- Data Use Checkup: https://developers.facebook.com/docs/development/maintaining-data-access/data-use-checkup
  ("an annual assessment"; not needed in Development mode; must be completed before an app can switch to Live mode).

**Not verified today:**
- Meta's Business Help Center article on verification documents (the fetch returned only a title). The page states
  what Siar gave Meta, not Meta's full document list.
- Live SERP and People Also Ask for "meta app review": this run's web-search budget was used up, so demand evidence
  comes from the siblings' measured autocomplete (`per-network.md` #26–28, `buyers-pains.md`, `market.md` §8).
- The permission-dialog guidance quoted in section 7 sits inside Meta's developer dashboard, not on a public page.
  The page attributes it to the dialogs "as we read them on 14 October 2026" [doc: `meta-review-audit.md`].

Labels in these editor notes (never on the page): **[doc]** Siar's own records, **[code]** this checkout,
**[sourced]** Meta's own page with URL, **[measured]** seen today, **[third-party]** someone else's page,
**[inferred]** judgement.

No competitor is named on this page (`messaging.md` §11). The comparison table compares three ways to get Meta
permissions, not vendors.

---

## Before this page ships (blocking)

1. **Wave 0 first.** This page sends developers to the home page and `/platforms`. The live home page still shows
   TikTok, LinkedIn company pages and Google Business as "Posted" (siar-truth §6 items 1–2). Ship strike plan 0.1–0.2
   first.
2. **Owner check: the resubmission.** The records say "resubmission of 2026-10-27" and nothing about what Meta asked
   for, or when it came back. The page says only "one resubmission, on 27 October 2026, approved the same day". Add
   the reviewer's point if you want it printed. Do not invent one.
3. **Owner check: the consent-screen name.** Section 9 and FAQ 6 say Meta's consent screen names Siar, because the
   customer is granting Siar's app [inferred from how Meta's login works; not filmed for this page]. Confirm on one
   real connect before publishing.
4. **Link only live pages.** `/platforms/approvals` and `/facebook-api/page-access-token` are NEW. Link each only once
   it returns 200 (strike plan §6 rule 11). Until `/platforms/approvals` is live, point those links at `/platforms`.
5. **Per-code anchors.** The link to `/facebook-api/errors#code-10` needs the per-code anchors from strike plan §6
   rule 5. Until then, link `/facebook-api/errors`.
6. **Hosted-connect page copy.** `/use-cases/hosted-connect-oauth` still says "Your logo, name, language" and
   "optional 'powered by' hiding" (`apps/site/src/lib/usecases.ts` line 184). The connect page is English only and
   shows "Powered by Siar" (siar-truth §1c, Portal.vue line 96). Fix that line before this page links to it, or a
   reader meets a contradiction one click away.

---

## Meta

| Field | Value |
|---|---|
| URL | `https://siaran.my/facebook-api/meta-app-review` |
| Meta title (54 chars) | `Meta App Review: our 13-day timeline and video lessons` |
| Meta description (153 chars) | `Submitted 14 Oct, approved 27 Oct 2026, all 27 permissions. What Meta asked for, the screencast rules, the 6 fixes before submitting, and how to skip it.` |
| H1 | Meta App Review, step by step: what we submitted and how long it took |
| Visible date line (under the H1) | Updated 12 November 2026. Meta's rules checked on Meta's own developer pages on 12 November 2026. |
| Canonical | `https://siaran.my/facebook-api/meta-app-review` |
| Breadcrumb | Home › Networks › Facebook API › Meta App Review |
| Kicker (one plain kicker, no side note) | Facebook API |

Editor notes:
- The title has no "Siar". Strike plan §5.0 rule 6 forbids "Siar" alone in a title, not a title without it. A
  first-hand title ("our 13-day timeline") is what a searcher for "meta app review time" clicks [inferred].
- "13 days" is 14 to 27 October 2026, submission to approval [doc]. It is a date span, not a speed claim.
- "how to skip it" in the description is allowed only because this is the Meta page (`messaging.md` §3 pillar 2,
  banned for every other network).

---

## 1. Hero

**H1:** Meta App Review, step by step: what we submitted and how long it took

**Date line:** Updated 12 November 2026. Meta's rules checked on Meta's own developer pages on 12 November 2026.

**Subhead (the answer, 58 words):**

> Meta App Review is Meta's check before an app can use a permission for people who have no role on it. Siar, a
> [unified social media API](/), submitted on 14 October 2026 and was approved on 27 October, with all 27 permissions.
> Below is everything we filed, filmed and fixed, so you can pass yours or skip it.

**Primary CTA:** Start with 20 free posts
**Secondary CTA (text link):** See how your customers connect (`/use-cases/hosted-connect-oauth`)

**One line under the buttons (the CTA sentence, word for word):**

> Siar's Meta app passed App Review on 27 October 2026, so your customers connect Facebook, Instagram and Threads
> through it.

Editor notes:
- The first 60 words answer "what is Meta App Review" and "how long does it take" with Siar's own dates only [doc].
- "the category anchor" "unified social media API" points to `/` once on this page (strike plan §6 rule 1).
- Primary CTA label from `messaging.md` §6 "Calls to action" (developer pages may use "Get an API key"; same sign-up
  URL). One primary action per section.

---

## 2. How long Meta App Review took us

**H2:** How long Meta App Review takes: our dates

> Meta's App Review page gives no review time. Ours ran 13 days from submission to approval: submitted on 14 October
> 2026, approved on 27 October 2026. It took one resubmission, made on 27 October and approved the same day.
>
> The 13 days are only the review. The work before it (business verification, a description and a film for each
> permission, fixes to the product) is what decides whether those days end in an approval.

**Table: Siar's Meta App Review, as it happened**

| Date | What happened |
|---|---|
| 2026-10-12 | Siar went live. Business verification was already done. Every permission was used on production that day, and the four Facebook Login for Business configurations and the deauthorize and data-deletion callbacks were in place. |
| 2026-10-13 | Descriptions and films entered for 26 permissions (`public_profile` needs only the usage agreement). Data handling answered. A reviewer login created. Meta's Testing page still showed 0 API calls. |
| 2026-10-14 | The Testing page showed every permission complete. A pre-submit audit found six things Meta could reject; we fixed them, rebuilt the films and submitted. |
| 2026-10-27 | Resubmitted and approved the same day: all 27 permissions, Advanced Access. Data Use Checkup completed. |
| 2026-11-12 | Facebook Pages, Instagram professional accounts and Threads: open today in Siar. |

**Short note under the table:**

> These are one app's dates, not a promise for yours. Meta doesn't publish a review time, and we don't either.

Editor notes:
- Every row [doc]: `meta-review-plan.md` header and §10, `meta-review-submission.md` "Allowed usage" and "Before
  Submit", `meta-review-audit.md` "Progress" and "Submitted", `meta.md` status line, `README.md` status table.
- "Meta's App Review page gives no review time" [sourced, App Review page, checked 2026-11-12]. The runbook's note
  "Meta: most are reviewed within 20 days" (`meta-review-plan.md` §11) is NOT used: the task rule is Siar's own dates
  only, and that figure was not found on Meta's public page today.
- "Business verification was already done" by 2026-10-12: the runbook header says so; the start date of verification
  is not recorded, so no duration is given.

---

## 3. What Meta asks for, and who needs it

**H2:** Who needs Meta App Review

> You need App Review when people without a role on your Meta app will use it: your customers, their clients, the
> public. Meta's own page puts it plainly: an app used only by people with a role on it does not need review
> ([Meta, App Review](https://developers.facebook.com/docs/resp-plat-initiatives/individual-processes/app-review),
> checked 12 November 2026).
>
> The permissions work the same way. With Standard Access, a permission "can only be requested from app users who have
> a role on the requesting app". Advanced Access, the level that works for anyone, is granted permission by permission
> through App Review ([Meta, access levels](https://developers.facebook.com/docs/graph-api/overview/access-levels/),
> checked 12 November 2026).

**H3:** The error that tells you you've hit the gate

> A Graph API call that returns `(#10) Application does not have permission for this action` usually means a
> permission was not granted, or the app lacks Advanced Access for it. Inside your own team the call works; for a
> customer it fails. [Facebook API error codes](/facebook-api/errors#code-10) lists the fix for each Meta error Siar
> relays.

Editor notes:
- Quotes [sourced] as listed under Sources. The `(#10)` message and meaning [code: `meta-common.ts` line 105].
- Market evidence for this H3 [third-party, measured by sibling]: Stack Overflow "Facebook API 'This app is in
  development mode'" 188,827 views (`buyers-pains.md` S4). The phrase is not quoted on the page because the exact
  error text was not verified on Meta's site today.

---

## 4. Business verification

**H2:** Meta business verification: what we gave Meta

> Meta requires business verification before it grants Advanced Access
> ([Meta, access levels](https://developers.facebook.com/docs/graph-api/overview/access-levels/), checked 12 November
> 2026). It is a separate process from App Review, done in Meta Business Suite, and it needs a registered company.
>
> This is what Siar's verification used. FF DEV STUDIO is a company registered in Malaysia with SSM, the Companies
> Commission of Malaysia:
>
> - **Legal name exactly as on the registration certificate.** "FF DEV STUDIO", letter for letter.
> - **The registration number**, the address and a phone number as they appear on the certificate. The phone has to
>   receive a code.
> - **A website that shows the same company.** siaran.my's footer carries the legal name and registration number.
> - **The certificate as a PDF**, with a utility bill or bank statement in the business name ready in case Meta asks
>   for one.
> - **A verified domain.** We verified siaran.my with a DNS TXT record in Business settings. If you choose email
>   verification instead, the address must be on the website's own domain.

**Line after the list:**

> No registered company means no verification, and no Advanced Access on your own app. One developer wrote it up as
> "No company, no API"
> ([dev.to](https://dev.to/hrekov/no-company-no-api-59cd), 7 October 2026). Connecting through an app that is already
> verified and reviewed is the other way through, and section 9 sets out what that trades away.

Editor notes:
- The rule [sourced, access-levels page and business-verification page]. The list is what Siar prepared [doc:
  `meta.md` §1]. It is not Meta's full document list, which sits in the Business Help Center (not verified today).
- "SSM, the Companies Commission of Malaysia" is the expansion of SSM (Suruhanjaya Syarikat Malaysia); the
  registration number is not printed in the body (it is in the trust line).
- The dev.to quote [third-party, measured by sibling: `buyers-pains.md` line 147]. Title quoted, under 15 words.
- The email-domain point is from Siar's own preparation notes [doc], not a Meta quote, so it is phrased as what
  happens on that path.

---

## 5. What else has to exist before you can submit

**H2:** What your app needs before Meta will review it

> App Review is the last step. By the time we pressed Submit, all of this was already live:
>
> - **App settings filled in:** app type Business, app domains, a privacy policy, terms of service and a data deletion
>   instructions URL.
> - **Login configurations.** Business apps send a configuration ID instead of a list of scopes. Siar has four: Pages,
>   Pages with Messenger, Instagram, and Instagram with DMs. Each new permission goes into its configuration too.
> - **Deauthorize and data-deletion callbacks** for each login you use: Facebook Login for Business, Instagram Login
>   and Threads. When someone removes the app, the callback disconnects their accounts; a deletion request gets a
>   confirmation code and a status URL.
> - **Real API calls for every permission.** Meta's Testing page wants calls for each permission before Submit
>   unlocks. Our production use counted, but the page lagged: it showed 0 calls on 13 October and "complete" on
>   14 October.
> - **Data handling answers:** who processes the data and in which countries, requests from public authorities, and
>   your policies for them.
> - **Reviewer instructions** with a login to your own app. If Meta can't get into the app, "your entire submission
>   will be rejected"
>   ([Meta, App Review](https://developers.facebook.com/docs/resp-plat-initiatives/individual-processes/app-review),
>   checked 12 November 2026). We gave a reviewer account on Siar's top plan with messaging switched on.
>
> One small trap: the reviewer-instructions step stayed marked "Needs your review" until we opened it and pressed
> Next, even though it was filled in.

Editor notes:
- [doc]: `meta.md` §2, §2b, §2c; `meta-review-submission.md` "Data handling", "Reviewer instructions", "Allowed usage"
  (the blocked Testing row); `meta-review-plan.md` §10 (Testing complete 2026-10-14, Next to clear the review flag).
- No reviewer email, password, processor names, app IDs, configuration IDs or submission IDs on the page.
- The runbook's "each test call is valid for 30 days" is left out: it is the runbook's reading of Meta's UI and was not
  found on a public Meta page today.

---

## 6. The four use cases and 27 permissions

**H2:** What Siar asked Meta for: four use cases, 27 permissions

> Siar sent every permission in one submission, grouped the way Meta's dashboard groups them:
>
> - **Manage everything on your Page:** publish, schedule, edit and delete Page posts; read and moderate comments;
>   Page insights; real-time updates by webhook.
> - **Manage messaging and content on Instagram,** through both of Meta's logins: Instagram API with Facebook Login
>   (an Instagram professional account linked to a Page) and Instagram API with Instagram Login (no Page needed).
> - **Access the Threads API:** publish, read and manage replies, insights, delete.
> - **Engage with customers on Messenger,** plus Instagram DMs, in the same submission.
>
> Dependencies go in the same submission. `instagram_basic` needs `pages_show_list`, for example, and `pages_messaging`
> needs `pages_manage_metadata`.

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

**Line under the list:**

> Meta approved all 27. In Siar, Facebook and Instagram DMs and comment-to-DM automations are in beta, turned on per
> organization on request (paid plans). Siar did not request Human Agent, so replies stay inside Meta's 24-hour
> messaging window.

Editor notes:
- Use cases and dependencies [doc: `meta-review-plan.md` §1–2]. The list matches the 27 keys of
  `meta-review-submission.json` and the identical block on `/platforms/approvals` (keep them in sync).
- DM line is the `messaging.md` §9 status line, word for word. Human Agent [doc: `meta-review-plan.md` §2 "Not
  requested"].

---

## 7. The screencast rules, and what we learned filming 26 of them

**H2:** Meta App Review video requirements, and how we met them

> Meta wants a screen recording for each permission. "Upload a screencast showing the end-to-end user experience for
> that specific permission or feature"
> ([Meta, Instagram App Review](https://developers.facebook.com/docs/instagram-platform/app-review), checked
> 12 November 2026). A permission Meta can't see in use is not approved.

**H3:** Meta's rules

> From Meta's screen-recording guide
> ([Meta, screen recordings](https://developers.facebook.com/docs/app-review/submission-guide/screen-recordings),
> checked 12 November 2026):
>
> - Start logged out, and capture the entire login flow to logged in.
> - Capture the complete authorization flow: the person granting the permission.
> - Then show the app using the data that permission gives.
> - Record at 1080p or better, with the app UI in English.
> - No audio; reviewers don't listen. Use captions and tooltips to explain what's on screen.
> - Record only the app, and make the mouse cursor bigger.

**H3:** What we did, film by film

> - **One upload for each permission.** We made 26 films, one for every permission except `public_profile`, which
>   needs only the usage agreement. Some films share their middle when two permissions do the same job, but each
>   opens on its own title card naming its permission.
> - **Every film starts signed out.** We recorded our own sign-in once (signed out, the login form, the dashboard) and
>   put it at the start of every film.
> - **Every film shows the consent.** We recorded one full consent pass for each login (Facebook, Instagram through a
>   Page, Instagram Login, Threads) and put the right one in front of each film that lacked it.
> - **Get a fresh consent screen.** Meta skips the full permission list for someone who has already granted the app.
>   Remove the app from the test account first (Facebook: Business integrations; Instagram: Apps and websites;
>   Threads: Website permissions), then film the connect.
> - **End on Meta's side.** Each film ends with the result on facebook.com, instagram.com or threads.com: the post, the
>   reply, the hidden comment, the message.
> - **Captions in a band under the app**, never over it, short enough to read. Waits for a person's comment are cut and
>   captioned; slow network steps are sped up and labelled as sped up.
> - **Nothing staged.** Every action ran on production against our own Page and accounts. Then we deleted the test
>   posts everywhere.

Editor notes:
- Meta's rules [sourced, both URLs above]. The bullets paraphrase; the one direct quote is the Instagram page's.
- What Siar did [doc]: `meta-review-plan.md` §3–4 (title cards, ending on Meta's side, captions band, cuts, speed-up
  labels, fresh consent, nothing staged), `meta-review-audit.md` items 1–2 and "Progress (afternoon)" (sign-in clip
  S0 and the four consent heads), `meta-review-submission.md` "Cleanup after recording".
- How the films were captured is deliberately left out (the rig is internal; TikTok has since asked for films recorded
  by hand, `approvals/README.md`). Do not add it.
- "26 films": 27 permissions minus `public_profile` [doc: `meta-review-submission.md` "Allowed usage"].

---

## 8. The pre-submit audit

**H2:** Six things that would have got us rejected

> Before pressing Submit, we read the guidance inside each of the 27 permission dialogs in Meta's dashboard and
> checked our submission against it. It found six problems, on 14 October 2026, the day we submitted:
>
> 1. **No film showed signing in.** Every film started already signed in. Fixed with the sign-in clip at the start of
>    every film.
> 2. **Some films showed the feature but not the grant.** Seven films lacked the login button and consent. Fixed with
>    a consent pass in front of each.
> 3. **Unsent Instagram messages.** The guidance for `instagram_manage_messages` asks how the inbox handles a message
>    the sender unsends. Siar dropped those events, so an unsent DM stayed in the inbox. We changed the product to
>    show "Message unsent", and filmed it.
> 4. **An auto-reply for Instagram comments.** The guidance for `instagram_business_manage_comments` asks for a post
>    link with an automation already set up, a keyword to comment, and a reply within 30 seconds. Our description said
>    replies were manual. We set up a keyword reply on one of our posts and filmed a comment getting its reply.
> 5. **A real tester for Messenger.** For `pages_messaging`, Meta asks for the login of a real Facebook account with
>    the Tester role, not a test user created in App Roles. We gave a low-privilege account with that role, never an
>    admin's.
> 6. **`business_management` as a dependency.** Its guidance asks you to state that it's needed for
>    `pages_show_list` and the messaging permissions, and to tell the Page admin in your app that they are granting
>    access to business assets. We added the sentence and a notice to Siar's Facebook connect step.
>
> We also added a section to the privacy policy on data from Facebook, Instagram and Threads: what Siar receives, what
> it's used for, how long it's kept and how to delete it.

**Line after the list:**

> Read each permission's dialog before you film. Its guidance differs from permission to permission and asks for more
> than the general docs.

Editor notes:
- [doc]: `meta-review-audit.md` "Must fix" items 1–6, "Should fix" item 7, "Progress (2026-10-14)" (the three
  deployed changes in `faaecd38d608`: unsend, business-assets notice, privacy section), "Progress (afternoon)" (films
  F3–F6, I3, G3 and T2 got consent heads: seven films), "Done (evening)" (the reply rule, 4 seconds in the take).
- Numbered list is allowed here: the items are a real checklist (`messaging.md` §8).
- Quotes from inside the dialogs are paraphrased, attributed to the dialogs as read on 14 October 2026; they are not
  public pages.
- The reply time in the take (4 seconds) is left out on purpose: no speed figures (`messaging.md` §6 banned list).

---

## 9. Rejected? What to do

**H2:** Meta App Review rejected: what to do next

> Meta's page names two outcomes. If the reviewer can't get into your app, the whole submission is rejected. If they
> can test the app but not one permission, that permission isn't approved
> ([Meta, App Review](https://developers.facebook.com/docs/resp-plat-initiatives/individual-processes/app-review),
> checked 12 November 2026).
>
> What we do when a review comes back: fix the exact point the reviewer raised, and resubmit the same day. Our Meta
> review needed one resubmission, on 27 October 2026, and it was approved that day.

**H3:** Causes developers report most often

> These come from community reports, not from Meta's policy pages. We checked our films against each one before
> submitting:
>
> - The connected Page or username never appears on screen.
> - The data is used only in the back end, with nothing shown to the person.
> - One long video is uploaded for every permission.
> - The reviewer can't reproduce the flow from the instructions.

Editor notes:
- Meta's outcomes [sourced]. "Fix the exact point… same day" [doc: `approvals/README.md` "Order of operations" 3].
- The four causes [doc: `meta-review-plan.md` §1, which labels them "community reports, not official policy"]. The
  page says so in its first sentence. No forum is quoted.
- Owner check 2: no reason for the resubmission is printed.

---

## 10. While you wait

**H2:** Meta App Review taking time? Leave the test setup alone

> While Meta reviewed Siar's app, we froze everything a reviewer might touch:
>
> - the reviewer's login, its plan and its messaging switch;
> - the tester's role on the app;
> - the keyword auto-reply and the post it runs on;
> - the connected Page, Instagram account and Threads profile, on the same login method as in the films;
> - the final films, so a fix can be re-cut from them.
>
> A reviewer who opens your app on day 10 should find exactly what your films show. If Meta asks a question, answer in
> the App Review thread.

Editor notes: [doc: `meta-review-plan.md` §11]. Nothing here predicts how long a review will take.

---

## 11. Instagram API without App Review

**H2:** Can you use the Instagram API without App Review?

> Yes, for your own accounts. Meta's Instagram docs say an app "only for a business I own or manage" uses Standard
> Access and needs no App Review, under Instagram Login or Facebook Login
> ([Meta, Instagram App Review](https://developers.facebook.com/docs/instagram-platform/app-review), checked
> 12 November 2026). Standard Access only works for people with a role on your app.
>
> For your customers' accounts, there are two ways: pass App Review for Advanced Access yourself, or connect them
> through an app that already has. Siar's Meta app passed on 27 October 2026, under both Instagram logins, so your
> customers can connect a professional account with or without a Facebook Page.

Editor notes:
- [sourced]: Instagram App Review page (own business → Standard, no review; multiple businesses → App Review under both
  logins); access-levels page (Standard = people with a role).
- "under both Instagram logins": the 27 include `instagram_*` and `instagram_business_*` [doc].
- Targets p012 ("post to Instagram via API without building a Meta app") and "instagram api without app review".

---

## 12. Three ways to get Meta permissions

**H2:** Your own Meta app, or Siar's

> Every row about your own app comes from Meta's developer pages, checked 12 November 2026. The Siar column comes from
> Siar's approval record.

| | Your own app, Standard Access | Your own app, Advanced Access | Siar's Meta app |
|---|---|---|---|
| Who can connect | Only people with a role on your app ([access levels](https://developers.facebook.com/docs/graph-api/overview/access-levels/)) | Anyone | Anyone with a Facebook Page, an Instagram professional account or a Threads profile |
| App Review | Not needed ([App Review](https://developers.facebook.com/docs/resp-plat-initiatives/individual-processes/app-review)) | Needed, permission by permission ([access levels](https://developers.facebook.com/docs/graph-api/overview/access-levels/)) | Passed 2026-10-27, all 27 permissions |
| Business verification | Not needed for role-only apps ([business verification](https://developers.facebook.com/docs/development/release/business-verification)) | Required ([access levels](https://developers.facebook.com/docs/graph-api/overview/access-levels/)) | FF DEV STUDIO verified |
| Data Use Checkup | Every year once the app is Live ([Data Use Checkup](https://developers.facebook.com/docs/development/maintaining-data-access/data-use-checkup)) | Every year | Siar's job; completed 2026-10-27 |
| Permissions | Any you choose | Any Meta approves for you | The 27 Siar holds: Pages, Instagram, Threads, Messenger and Instagram DMs. No ads, no WhatsApp |
| Name on Meta's consent screen | Yours | Yours | Siar. Your name, logo and color are on the connect link before it |
| Callbacks, tokens, webhooks | You build and run them | You build and run them | Siar runs them |
| Cost | Your time | Your time, plus the review | 20 free posts to try, then from $19 a month (RM39 in Malaysia), per organization |

**Where your own app is the better choice (directly under the table):**

> Build your own app if you need permissions Siar doesn't hold (ads, WhatsApp, anything beyond the 27), if your own
> name must appear on Meta's consent screen, or if you only ever post to accounts your team owns. In the last case
> Standard Access needs no review at all.

Editor notes:
- Own-app cells [sourced, the linked Meta pages]. Siar cells [doc: `meta.md`, `meta-review-submission.json`]. The
  consent-screen cell for Siar is [inferred], owner check 3. Price [code: `plans.ts` via `messaging.md` §3 pillar 3].
- "Every year once the app is Live": the DUC page says it is annual and must be done before an app can switch to Live
  mode; Development mode apps don't need it [sourced].
- Not a vendor comparison, so `messaging.md` §11 does not apply. Re-check the linked Meta pages within 7 days of
  publishing (strike plan §5.0 rule 3).

---

## 13. How Siar handles this (three-line box)

**Box heading:** How Siar handles this

> - Every network's status, with dates. [Network approvals](/platforms/approvals#meta)
> - Revoked or expiring connections are flagged, with a `social-account.updated` webhook.
>   [How connections are checked](/how-publishing-works#accounts)
> - If a network says no, you get its own code and message, plus the fix.
>   [The network's own error](/how-publishing-works#errors)

Editor note: box format and anchors per `messaging.md` §2 (gate pages) and strike plan §6 rule 2.

---

## 14. The call to action (the one "already done for you" block on the site)

**H2:** Already through Meta's review: connect your customers today

> Siar's Meta app passed App Review on 27 October 2026, so your customers connect Facebook, Instagram and Threads
> through it.
>
> Send a customer a connect link with your name, logo and color. They sign in to Facebook, Instagram or Threads in
> their own browser, choose the Page or account, grant the permissions and land back in your app. You never see their
> password or token, and you file nothing with Meta.
>
> Then one REST request publishes to every account they connected. Write it once. Siar it everywhere.

**Primary CTA:** Start with 20 free posts
**Secondary CTA (text link):** See how the connect link works (`/use-cases/hosted-connect-oauth`)

**Line under the buttons:**

> Facebook Pages: open today. Instagram professional accounts: open today (Facebook Login or Instagram Login).
> Threads: open today.

Editor notes:
- CTA sentence word for word from the task brief; "Meta partner" and "approved by Meta" as a badge never appear
  (`messaging.md` §6 banned list). No badge, logo or seal next to this block.
- Connect-link wording from `messaging.md` §3 pillar 2 [code: Portal.vue, accounts.ts]. "Your first post is one
  request away" is the allowed alternative to the "one REST request" line.
- Status lines from `messaging.md` §9, word for word.
- Brand line "Write it once. Siar it everywhere." kept, in sentence position, not as a heading.

---

## 15. What this does not cover

**H2:** What Siar's Meta approval doesn't cover

> - **Other networks have their own gates, and Siar is waiting at some of them.** TikTok: built, opening after TikTok
>   approves Siar. YouTube: connect and upload now; public uploads not yet confirmed. Pinterest: connect your account
>   today; publishing Pins opens after Pinterest grants Standard access. LinkedIn: personal profiles today; company
>   pages open after LinkedIn grants page access.
> - **Facebook posts go to Pages only**, not personal profiles or groups. Instagram posts go to professional (business
>   or creator) accounts only.
> - **The connect page is Siar's.** It shows your name, logo and color, but says "Powered by Siar", runs on
>   app.siaran.my and is in English.
> - **One account per network per brand.** A client with two Facebook Pages uses two brands.
> - **DMs are a beta.** Facebook and Instagram DMs and comment-to-DM automations: in beta, turned on per organization
>   on request (paid plans).

Link line: [Every network's status, with dates](/platforms/approvals)

Editor notes: status lines from `messaging.md` §9 word for word; concessions from `messaging.md` §3 pillar 2 and §4.5
[doc/code]. This section is why the CTA above cannot be read as "no review anywhere".

---

## 16. Price

**H2:** One price for your organization, not for each account

> No per-account fees. Each brand connects one account on every open network: Starter 1 brand, Pro 10, Business
> unlimited. A post sent to every connected network counts as one post.
>
> Start with 20 free posts to try, no card. Then $19 a month (RM39 in Malaysia) for one brand and 300 posts a month,
> $49 (RM99) for 10 brands and 10,000 posts with a 14-day trial, or $149 (RM399) for unlimited brands and 100,000
> posts. Your price never goes up while you stay subscribed.

Link: [See the pricing](/pricing)

**Trust line (small):**

> FF DEV STUDIO (SSM 202603234793), Malaysia. Meta App Review passed on 27 October 2026.

Editor note: identical to `/platforms/approvals` section 11 and `messaging.md` §2 level 3 and 5. "Each brand connects
one account on every open network" is the default until Fakhrul rules (strike plan §10 decision 3); change it on every
page together.

---

## 17. Objection handling (where each answer sits)

| The developer thinks | Answer on the page | Section |
|---|---|---|
| "Is Siar a Meta partner?" | No. Siar's Meta app passed App Review on 27 October 2026. That is an approval of an app, not a partnership, and Siar is not affiliated with or endorsed by Meta. | FAQ 9 |
| "I want my own name on Meta's consent screen." | Then file your own review; sections 3 to 10 are the checklist. With Siar, your name, logo and color are on the connect link and Meta's screen names Siar. | 12, FAQ 6 |
| "I need ads or WhatsApp permissions." | Siar holds the 27 permissions listed. Ads and WhatsApp aren't among them, so those need your own app and review. | 12, FAQ 7 |
| "Does this get me TikTok or LinkedIn company pages too?" | No. Each network runs its own gate. The status of each is on the approvals page, with dates. | 15, FAQ 8 |
| "What if Meta revokes access later?" | Siar runs Meta's annual Data Use Checkup for its app. If a customer's connection is revoked or about to expire, Siar flags it and sends a `social-account.updated` webhook; they reconnect through the same link. | 13, 12 |
| "Who uses you? What's your uptime?" | Siar has been live since 12 October 2026, so there are no case studies or uptime record to show yet. What you can check today: the public OpenAPI file, the network and error references, the dated status of every network, and a price list with a price lock. Try it with 20 free posts, no card. | FAQ 10 |
| "How long will my own review take?" | We can only give our dates: 14 to 27 October 2026, one resubmission. Meta's page gives no time. | 2, FAQ 1 |
| "Can my customers send DMs through it?" | Facebook and Instagram DMs and comment-to-DM automations: in beta, turned on per organization on request (paid plans). | 6, 15 |

Editor notes: the uptime answer is `messaging.md` §5 word for word. "Not affiliated with or endorsed by" is the site's
existing line (siar-truth §5).

---

## 18. FAQ (visible on the page; same text in FAQPage JSON-LD)

**H2:** Questions about Meta App Review

**1. How long does Meta App Review take?**
Meta's App Review page gives no review time. Siar's took 13 days: submitted on 14 October 2026, approved on 27 October
2026 with all 27 permissions, after one resubmission that same day. Most of the work came before submitting: business
verification, a description and a film for each permission, and product fixes.

**2. Why was my Meta App Review rejected?**
Meta rejects the whole submission when its reviewer can't get into your app, and refuses a single permission when it
can't see that permission in use. Check your reviewer login first. Then check each film: signed out at the start, the
consent screen shown, and the feature visibly using the data.

**3. What are the Meta App Review video requirements?**
One screencast for each permission, at 1080p or better, with the app in English and no audio. Start logged out, show
the full login and the person granting the permission, then show the feature using it. Add captions where the screen
isn't self-explanatory, and record only your app with a bigger cursor.

**4. Do I need Meta business verification for App Review?**
Yes, for Advanced Access. Meta's access-levels page says business verification is required to get it, and apps used
only by people with a role on them don't need it. Verification needs a registered company. Siar's used the
registration certificate, the exact legal name, address, phone and a verified domain.

**5. Can I use the Instagram API without App Review?**
Yes, for accounts your own business owns or manages: Meta gives those apps Standard Access, with no App Review, under
Instagram Login or Facebook Login. Your customers' accounts need Advanced Access, so either pass App Review yourself or
connect them through an app that has, such as Siar's.

**6. Do I need my own Meta App Review if I use Siar?**
No, for Facebook, Instagram and Threads. Siar's Meta app passed App Review on 27 October 2026, so your customers connect
through it. They sign in to Meta themselves through a connect link with your name and logo. Meta's own consent screen
names Siar, because they are granting Siar's app.

**7. Which Meta permissions does Siar's app hold?**
All 27 it asked for: Facebook Page posting, comments, insights and webhooks; Instagram publishing, comments, insights
and DMs through both Facebook Login and Instagram Login; Threads publishing, replies, insights and delete; and
Messenger. It holds no ads or WhatsApp permissions, so those still need your own app and review.

**8. Does Siar's Meta approval cover TikTok, YouTube or LinkedIn?**
No. Each network runs its own gate. TikTok: built, opening after TikTok approves Siar. YouTube: connect and upload now;
public uploads not yet confirmed. LinkedIn: personal profiles today; company pages open after LinkedIn grants page
access. Open today besides Meta: X, Bluesky, Mastodon, Discord and Slack.

**9. Is Siar a Meta partner?**
No. Siar's Meta app passed App Review on 27 October 2026, with all 27 permissions it asked for. That approves how one
app uses Meta's data. It is not a partnership, and Siar is not affiliated with or endorsed by Meta. Siar is made by FF
DEV STUDIO, a company registered in Malaysia.

**10. What is Meta's Data Use Checkup?**
An annual check that an app's continued access to Meta data still follows Meta's Platform Terms and Developer
Policies. Apps in Development mode don't need it; it must be done before an app goes Live. Siar completed its Data Use
Checkup on 27 October 2026, the day its App Review passed.

Editor notes:
- Word counts (each answer 40–60 words, answer first): 1 = 52, 2 = 51, 3 = 52, 4 = 49, 5 = 48, 6 = 49, 7 = 49,
  8 = 46, 9 = 53, 10 = 51 (counted on the final text; recount after any edit).
- FAQ 1, 2, 3, 4, 5, 10 [sourced, Meta pages above] plus [doc] dates. FAQ 6 consent-screen sentence: owner check 3.
- FAQ 8 lists the status lines from `messaging.md` §9 word for word, and the open list from siar-truth §1a.
- FAQ 9 "not affiliated with or endorsed by": the site's own line (siar-truth §5).

---

## 19. Internal links

**Out of this page (add all):**

| Anchor text | Target | Where |
|---|---|---|
| unified social media API | `/` | Hero subhead (the only exact-match anchor to home on this page) |
| See how your customers connect / See how the connect link works | `/use-cases/hosted-connect-oauth` | Hero, section 14 (blocking item 6) |
| Facebook API error codes | `/facebook-api/errors#code-10` | Section 3 (blocking item 5) |
| Network approvals / Every network's status, with dates | `/platforms/approvals#meta`, `/platforms/approvals` | Sections 13, 15 (blocking item 4) |
| How connections are checked | `/how-publishing-works#accounts` | Section 13 |
| The network's own error | `/how-publishing-works#errors` | Section 13 |
| Facebook Page posting API | `/facebook-api` | Breadcrumb and a "Related" line at the foot |
| Instagram posting API | `/instagram-api` | "Related" line |
| Threads posting API | `/threads-api` | "Related" line |
| Instagram API error codes | `/instagram-api/errors` | "Related" line |
| See the pricing | `/pricing` | Section 16 |
| Read the quickstart | `/docs/quickstart` | "Related" line |
| Facebook Page access token (when live, W2) | `/facebook-api/page-access-token` | Section 5, after "Login configurations"; add only when it returns 200 |

**"Related" line at the foot (plain text links, no chips):** Facebook Page posting API · Instagram posting API ·
Threads posting API · Instagram API error codes · Read the quickstart.

**Into this page (add at launch; at least 3 contextual in-links, strike plan §6 rule 10):**

| From | Anchor text | Where on that page |
|---|---|---|
| `/platforms/approvals` | Meta App Review, step by step | Section 2 link line (already in its copy) |
| `/facebook-api` hub | Meta App Review: our dates and lessons | Lead, after the status line |
| `/instagram-api` hub | Instagram API without App Review | The p012 H2 (keyword map C64) |
| `/threads-api` hub | Meta App Review for the Threads API | "Connect" paragraph |
| `/use-cases/hosted-connect-oauth` | through an app that passed Meta's App Review | After "Do my users need a Siar account?" |
| `/use-cases/multi-tenant-social-media-api` | without sitting through Meta's review | The `messaging.md` §4.1 lead line |
| `/facebook-api/errors` and `/instagram-api/errors`, code 10 entry | the app lacks Advanced Access | The code-10 "meaning" line |
| Footer | stays on `/platforms/approvals` (strike plan §6 rule 9); this page is reached through it | — |

---

## 20. Schema notes

- **`TechArticle`** (or `Article`) with `headline` = the H1, `datePublished` and `dateModified` = 2026-11-12 (same as
  the visible date line), `author` and `publisher` = Organization "FF DEV STUDIO" with `url` https://siaran.my and the
  same `@id` the site uses for the organization. `about`: Thing "Meta App Review". `mentions`: Organization "Meta"
  with `sameAs` https://developers.facebook.com. No `review`, `rating` or `AggregateRating`.
- **`FAQPage`** with the ten questions of section 18, text identical to the visible answers (strike plan §5.0 rule 5).
- **`BreadcrumbList`**: Home (`/`) › Networks (`/platforms`) › Facebook API (`/facebook-api`) › Meta App Review
  (`/facebook-api/meta-app-review`). Same shape as `breadcrumbLd` in `[api]/index.astro`.
- **No `HowTo`.** Google no longer shows HowTo rich results, and the page is a record, not a recipe [inferred].
- No `Event`, badge or partner markup for the approval. The approval is stated in text only.
- Add the page to the sitemap and to `/llms.txt` under the Facebook section, with the CTA sentence as its one-line
  summary.

---

## 21. Why this wins

**Keywords it targets** (demand evidence is measured autocomplete from the sibling sweeps on 2026-11-12; volume
estimates are inferred):

| Query | Where it is answered | Evidence |
|---|---|---|
| meta app review | Title, H1, subhead | 10 autocomplete completions (process, reddit, time, video, instagram, requirements, "taking time") [measured by sibling, `per-network.md` #26] |
| meta app review time / taking time | Section 2 H2, section 10 H2, FAQ 1 | Autocomplete children [measured by sibling]; `market.md` §8c "Gates and errors" |
| meta app review rejected | Section 9 H2, FAQ 2 | No autocomplete for the exact phrase [measured, `buyers-pains.md` correction]; kept as an H2 because rejection is the trigger moment (`market.md` triggers) [inferred] |
| meta app review video requirements | Section 7 H2, FAQ 3 | "video" and "requirements" completions [measured by sibling] |
| instagram api without app review (p012) | Section 11 H2, FAQ 5 | `ai-answers.md` #72, keyword map C64/C76; rival pages lead with "no Instagram app review" (`late.md`, `upload-post.md`) [sourced there] |
| meta business verification | Section 4 H2, FAQ 4 | Buyer pain "No company, no API" (dev.to) and "That's where I stopped." (`market.md` §8a) [third-party] |

**AI prompts it is written to be quoted for** (add to the visibility prompt set):
- "How long does Meta App Review take?" → a dated, first-hand answer (14 to 27 October 2026) that most pages lack.
- "What are Meta's screencast requirements for App Review?" → Meta's rules, quoted with the URL, plus a checklist.
- "Why was my Meta App Review rejected?" → Meta's two stated outcomes plus a clearly labelled community list.
- "Can I use the Instagram API without App Review?" → yes for own accounts (Meta's quote), otherwise through an
  approved app.
- "Which social media API has an approved Meta app?" → "Siar's Meta app passed App Review on 27 October 2026", with no
  partner claim.
- "Do I need business verification for the Meta Graph API?" → the access-levels quote.

**Why it beats the pages that rank for these terms** [inferred]:
- It is first-hand and dated. Generic guides explain the process; this page shows one real submission, its 27
  permissions, the six pre-submit problems and the fixes, with dates.
- Every Meta rule links Meta's own page with a check date, so AI answers can cite it safely.
- The CTA is true. Rival "no app review" pages make that claim for every network; this page makes it for Meta only and
  says which gates Siar still faces, which is the candour advantage U7 in the strike plan.
- It answers each sub-question in its own H2 and in a 40–60-word FAQ answer, which matches how AI engines fan a query
  out into "time", "video", "rejected" and "without review".

**Kill rule** (strike plan §8): no impressions 8 weeks after indexing → one rewrite of the title and H2s, then merge
into `/platforms/approvals#meta`.
