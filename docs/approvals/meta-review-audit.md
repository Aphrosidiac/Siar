# Meta App Review — pre-submit audit (2026-10-14)

This audit checks the draft submission (`submission_id=28644479528540223`) against:
- the guidance inside each of the 27 permission dialogs (read in full on 2026-10-14);
- Meta's screen-recording guide (developers.facebook.com/docs/app-review/submission-guide/screen-recordings);
- the Instagram messaging review requirements for apps that serve other businesses
  (developers.facebook.com/docs/messenger-platform/instagram/app-review/apps-for-other-businesses).

Status on 2026-10-14: testing is complete, all 5 steps are green and Submit is enabled. The items below would still
risk a rejection.

## Must fix (Meta states these as requirements)

| # | Requirement (Meta's words) | Where we stand | Fix |
|---|---|---|---|
| 1 | Screen recordings: "Capture the full login flow, from logged out to logged in. If users can create accounts and log in without Meta Login, record that flow too." | No film shows signing in to Siar. Every film starts already signed in. | Record one Siar sign-in clip (logged out → login form → dashboard) and put it at the start of every film. |
| 2 | "For each permission, show the business login button, the user granting the permission, and the app feature that uses it." | F3, F4, F5, F6 (Pages), I3 (instagram_manage_comments), G3 (instagram_business_manage_comments) and T2 (Threads replies) show the feature but not the login and grant. | Record one consent pass per login (Facebook, Instagram through a Page, Instagram Login, Threads), showing every permission line, and put the right one in front of each of those films, captioned to point at that film's permission. |
| 3 | instagram_manage_messages: "Explain how to test how the experience or inbox handles unsent messages", and the recording shows "How to test unsent message processing." | **Siar drops unsent messages.** `meta-common.ts` skips every webhook message with `is_deleted`, so an unsent DM stays in the Inbox. | Code: pass unsends through as `isUnsent` (ingest already clears the text), and show "Message unsent" in the Inbox. Deploy. Add an unsend to the I5 and G2 films. Add a "how to test unsend" step to both messaging descriptions. |
| 4 | instagram_business_manage_comments: a post link "that has automation already set up with your app", the keyword to comment, and a reply "within 30 seconds" in the recording. | The description says replies are manual. No automation exists, and G3 shows manual replies. | Create the Siar automation (Instagram, COMMENT_CREATED, keyword "Siar review" → public reply) on an @ffdev.studio post. Record fakhrlfahmi commenting and the auto-reply landing within 30 s. Add the post link and keyword to the description. |
| 5 | pages_messaging: "create a real account on Facebook and grant this account the Tester role… Do not submit a test user created in App Roles." | Our steps tell the reviewer to message the Page "from another Facebook account". Under standard access, Siar only receives messages from people with a role on the app, so the reviewer's message would never arrive. | Give the reviewer the login of a real Facebook account with the Tester role (Jon Doe is one), in the pages_messaging steps and the reviewer instructions. **Fakhrul's decision.** |
| 6 | business_management: "State that you request it as a dependency for pages_messaging and pages_show_list (and instagram_manage_messages)", and "In the app, inform the Page admin that they must explicitly provide permissions to the app to manage their business assets." | The description doesn't say it's a dependency. Siar has no such notice. | Add the dependency sentence. Add the notice to Siar's Facebook connect step (Accounts.vue). Deploy, and show it in F1. |

## Should fix (lowers the risk of a question back from Meta)

| # | Item | Fix |
|---|---|---|
| 7 | The privacy policy never names Meta Platform Data, or the data of people who comment on or message a connected account (name, username, picture, message text). | Add a "Data from Facebook, Instagram and Threads" section: what Siar receives, the business-only use, retention, deletion (revoke, disconnect, deletion callback). Deploy the site. |
| 8 | The local G1 film (raw + edited) is missing from `review/`. Only its EDL and review frames are left. Item 1 has to prepend to G1 too. | Re-record G1, or download the uploaded copy from Meta. |

## Checked and fine

- All 27 descriptions are saved, each with a film. The texts on Meta match `meta-review-submission.json`; the two
  instagram_business_* texts also have their dependency note and how-to-test steps.
- instagram_business_basic says it is the dependency for the other instagram_business_* permissions, as its dialog asks.
- Testing: all four use cases are complete.
- Data handling, the usage agreements, the reviewer login (on Pro, messaging on) and the site URL.
- Privacy, terms and data-deletion pages answer 200. The data-deletion page covers revoking access, disconnecting and email.
- Captions are in English and the app UI is English. The films review clean (`review.py`).

## Progress (2026-10-14)

- Deployed `faaecd38d608` (Fakhrul approved): unsent Instagram DMs (#3), the business-assets notice (#6) and the
  privacy policy's Meta data section (#7). All three were checked live.
- Decided: Jon Doe (already a Tester) is the Facebook account for pages_messaging (#5). Fakhrul types its login
  into Meta's form.
- #4, the automation: creating it from the browser was blocked again by Claude's permission guard. Fakhrul runs
  the console snippet in meta-review-submission.md, or allows the browser JavaScript permission.
- Still to do: an end-to-end test of the unsend; the recordings (#1 sign-in, #2 consent passes, the unsend in
  I5/G2, the auto-reply in G3, and G1, which has to be re-recorded or downloaded from Meta); then the description,
  reviewer-instruction and film updates in the form.

## Progress (2026-10-14, afternoon)

- #1 and #2 are done for 26 of 27 permissions. Each permission's film was replaced by a final film from
  `review/final/` (`scripts/meta-review/assemble.mjs`): the film's title card, then the Siar sign-in (S0), then
  the consent head for its login where the original had none, then the body:
  - CFB (Facebook, with the business-assets notice) for F1 and F3–F6;
  - CIG (Instagram through a Page) for I3;
  - CIGL (Instagram Login, cut from G2's consent) for G1 and G3;
  - CTH (Threads, cut from T1's consent) for T2.
- #3: the unsend takes I5U (Page route, including turning messages on) and G2U (Instagram Login) are appended
  to I5 and G2. The unsend was verified live on both routes.
- G1 was re-recorded: Instagram Login account, a test post published to @ffdev.studio
  (https://www.instagram.com/p/DedvzHqCRWk/, to delete), Analytics refresh.
- Descriptions now carry the business_management dependency, the steps for testing an unsend, and the
  sign-in/consent opening. The pages_messaging steps now use the Tester account. Reviewer instructions have a
  Tester account block (Fakhrul fills in Jon Doe's email and password) and a note that every film starts
  signed out.
- Left: #4, the auto-reply. It waits on Fakhrul running the console snippet. Then the G3 auto-reply clip, the
  instagram_business_manage_comments update (post https://www.instagram.com/p/DeTrh77EdKX/ and keyword
  "Siar review"), Jon Doe's login, and deleting the G1 test post.

## Done (2026-10-14, evening)

- #4: Fakhrul created the reply rule (flow 01a13930…, keyword "Siar review", Instagram Login account). The reply
  text was first stored garbled (emoji mangled by `pbcopy`); it was fixed in the database to plain text, and the
  bad reply was deleted. Instagram silently hid a repeat of a comment the owner had just deleted, so the take
  uses "Does this include hosting? (Siar review)". Siar replied 4 s after it. G3 = S0 + CIGL + G3 + G3A.
- instagram_business_manage_comments: the "not by an automated reply" sentence was replaced with the reply rule;
  added the post link (https://www.instagram.com/p/DeTrh77EdKX/), the keyword, the 30 s promise and the
  screencast note.
- All 27 permissions now have their final film and text. All five steps are green and Submit is enabled.
- Left for Fakhrul: Jon Doe's Facebook email and password in Reviewer instructions; deleting the G1 test post;
  pressing Submit.

## Submitted (2026-10-14)

Fakhrul filled in Jon Doe's login (checked as present, values not read), deleted the G1 test post, and submitted.
The submissions page shows "Review in progress".
