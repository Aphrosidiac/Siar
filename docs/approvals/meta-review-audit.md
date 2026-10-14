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
