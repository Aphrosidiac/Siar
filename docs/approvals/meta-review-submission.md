# Meta App Review — what is entered in the submission (2026-10-13)

Submission draft: App Review → submissions, `submission_id=28644479528540223` (auto-saves). The 27 permission
descriptions and the film uploaded for each are in [meta-review-submission.json](meta-review-submission.json);
films come from `review/out/<film>.mp4` (`scripts/meta-review/films.json` maps film → permissions).

## Allowed usage (27 permissions)

| State | Permissions |
|---|---|
| Description + film saved | all except public_profile (26) |
| Extra fields | pages_messaging: Page = FF Dev Studio, plus the five test steps below. instagram_business_basic and instagram_business_manage_comments: Meta's "customized questions" are instructions for the description, so each description ends with a dependency note and "How to test" steps (below) |
| public_profile | only the usage agreement, no description or film |
| **Left for Fakhrul** | the "If approved, I agree that any data I receive through … will be used in accordance with the allowed usage" box on each of the 27 (a legal certification) |
| **Blocked by Meta** | "Ensure that you have performed required API test calls": the Testing page still shows 0 calls for every permission on 2026-10-13, although Siar has used them all on production since 2026-10-12. Recheck after 24 h; if still 0, make the calls from Graph API Explorer with the Siar app |

pages_messaging test steps:
1. Sign in at https://app.siaran.my/login with the reviewer account given in the reviewer instructions.
2. Social accounts → Connect Facebook → complete Facebook Login for Business and choose a Page you manage.
3. Inbox → Messages → "Turn on messages" on the Facebook card, and grant "Manage and access Page conversations on Messenger".
4. From another Facebook account, message the Page (m.me/<your Page>). Within seconds it appears in Inbox → Messages with the sender's name and profile picture.
5. Open the conversation, type a reply and click Send. The reply is delivered in Messenger and shows as Sent.

instagram_business_basic adds: it is the base permission for the other four instagram_business_* permissions in
the submission, and how to test (sign in with the reviewer login → Social accounts → Instagram → Connect → "Sign in
with Instagram" → the card shows the username and picture; New post lists the account).

instagram_business_manage_comments adds: replies are written by the business's team from Siar (Comments API), not
automated; how to test (connect with Instagram Login, comment on a post from another account, Inbox → Comments →
Reply, Hide/Unhide, Delete). Meta's guidance for this permission is written for auto-reply apps (a post link, a
keyword, a reply within 30 seconds). Siar has comment automations (Bots, `COMMENT_CREATED` →
`SEND_PUBLIC_COMMENT_REPLY`), so one could be set up on an @ffdev.studio post for the reviewer; that is a standing
public auto-reply on a live account and waits for Fakhrul's yes.

## Data handling

Filled: data controller **FF DEV STUDIO**, country **Malaysia**.

**Left for Fakhrul** (legal declarations; all three are required):
- Processors with access to Platform Data. Facts: Siar's API and database run on a Tencent Cloud VPS
  (lewixportal-vps); media is stored in Cloudflare R2; email is sent with Resend. Suggested answer: Yes —
  Tencent Cloud (hosting and database), Cloudflare (media storage and delivery).
- National-security requests from public authorities in the past 12 months (suggested: No, if that is so).
- Policies for public-authority requests (tick what FF Dev Studio actually has).

## Reviewer instructions

Filled: the test instructions (below), "Is Facebook Login integrated? Yes", and the test credentials with the
reviewer email `siaran+meta-review@ffdev.studio` and an empty `Password:` line for Fakhrul. Site URL stays
https://siaran.my/ (the instructions give the sign-in URL).

> Siar (https://app.siaran.my) is a web dashboard and API that lets a business publish to, and manage, its own
> social media accounts: Facebook Pages, Instagram professional accounts and Threads profiles, alongside other
> networks.
>
> Facebook Login: yes. Siar uses Facebook Login for Business (configuration-based) to connect a person's Facebook
> Pages and the Instagram accounts linked to them. It also uses Instagram Login (Instagram API with Instagram
> Login) for Instagram professional accounts without a Page, and Threads Login for Threads. Siar's own sign-in is
> email and password; Meta logins are only used to connect social accounts.
>
> How to test:
> 1. Sign in at https://app.siaran.my/login with the Siar reviewer account below. It is a Siar account (not a Meta
>    account) on the top plan, with messaging enabled.
> 2. Social accounts → Facebook → Connect, and complete Facebook Login for Business with your test user. Choose a
>    business and a Page. Social accounts then shows the Page as connected ("Signed in as …"); Change lists your
>    Pages.
> 3. Instagram: Social accounts → Instagram → Connect. Choose "Sign in with Facebook" for an Instagram account
>    linked to a Page (instagram_* permissions) or "Sign in with Instagram" for a professional account with no
>    Page (instagram_business_* permissions). Threads: Social accounts → Threads → Connect.
> 4. Publish: New post (top right) → choose the account → write text, attach an image → Publish now. Posts → open
>    the post → View on Facebook / Instagram / Threads. Delete removes it from the network too.
> 5. Comments: comment on the post from another account. Inbox → Comments shows it within seconds (Import
>    comments fetches a chosen post's comments). Use Reply, Like, Hide/Unhide and Delete.
> 6. Messages: Inbox → Messages → "Turn on messages" on the Facebook or Instagram card (this runs the login again
>    with the messaging permission). Message the Page or Instagram account from another account; the message
>    appears in Siar with the sender's name and picture. Open it, type a reply and Send.
> 7. Insights: Analytics → choose Facebook, Instagram or Threads → Refresh now. Each post also shows its likes,
>    comments and views with a Refresh button.
>
> Each permission's screencast shows the same steps with our own accounts (FF Dev Studio Page, @ffdev.studio on
> Instagram and Threads). Replies in Messenger and Instagram are only sent by a person, inside the 24-hour window.

## Before Submit

1. Fakhrul creates the Siar account `siaran+meta-review@ffdev.studio` at https://app.siaran.my/signup, with
   its own organization. Then Claude puts that organization on the top plan with messaging on.
2. Fakhrul types the password after `Password:` in Reviewer instructions → test credentials.
3. Fakhrul answers the three Data handling declarations and ticks the 27 usage agreements.
4. The Testing page shows the required API calls (see above).
5. Fakhrul reads the submission and presses Submit, by 2026-11-10.
