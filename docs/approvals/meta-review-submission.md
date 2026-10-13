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
| Usage agreements | ticked by Fakhrul on all 27 (2026-10-13) |
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

Answered 2026-10-13 at Fakhrul's request ("fill in"):
- Processors: **Yes**.
  - Tencent Cloud: IT solutions / cloud storage and processing, **Singapore**. The VPS metadata reports
    region `ap-singapore`.
  - Cloudflare: IT solutions / cloud storage and processing, **Singapore, United States of America**. R2 bucket
    `siar-media` has location hint APAC, and Cloudflare does not publish the country; the US is Cloudflare's home.
  - Resend (email) is not listed, because Siar's emails do not carry Platform Data.
- National-security requests in the past 12 months: **Zero**. Siar went live on 2026-10-12.
- Policies for public-authority requests: **None of the above**. Siar's legal pages have no such process.

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

1. ~~Reviewer account~~ (done 2026-10-13): Fakhrul signed up `siaran+meta-review@ffdev.studio`. Its password is
   `META_REVIEWER_PASSWORD` in the git-ignored `.env.networks`. The organization "Meta Review" (team "Team Meta")
   was set to tier PRO with messaging enabled directly in the prod DB. It has no Subscription row, so billing never
   downgrades it.
2. Fakhrul types the password after `Password:` in Reviewer instructions → test credentials.
3. ~~Data handling declarations and the 27 usage agreements~~ (done 2026-10-13).
4. The Testing page shows the required API calls (see above).
5. Fakhrul reads the submission and presses Submit, by 2026-11-10.

## Cleanup after recording (2026-10-13)

All test content from the recordings is removed:
- Siar: the 6 test posts deleted from Posts (Facebook and Threads copies deleted on the network by Siar). The 8
  Inbox comments of those posts were soft-deleted in the database (`FetchedComment.deletedAt`), since Siar does not
  yet hear about comment removals.
- Instagram @ffdev.studio: the 5 test posts deleted on instagram.com (Instagram's API cannot delete posts); their
  comments went with them. Only FF's real posts remain.
- Facebook FF Dev Studio Page: no test posts left (newest is the real "Quick quiz" reel).
- Threads @ffdev.studio: the "Testing Siar publishing" thread and its self-reply, and the reply to fakhrlfahmi,
  deleted on threads.com (Siar's delete missed the first because its Threads account had been reconnected; filed as
  a task). fakhrlfahmi's two test replies deleted from that account.
- Not removed: direct messages (Messenger and Instagram DMs cannot be deleted for the other person) and the Siar
  Inbox conversations with Jon Doe and fakhrlfahmi, which F8/I5/G2 rely on if re-shot.

Reviewer comment automation: Fakhrul approved a Siar flow (Instagram, COMMENT_CREATED, keyword "Siar review",
step SEND_PUBLIC_COMMENT_REPLY) so the reviewer can test instagram_business_manage_comments on any FF post. Siar has
no automation screen; creating it through `POST /api/v1/automations` from the browser was blocked by Claude's
permission classifier, so it is not created yet.
