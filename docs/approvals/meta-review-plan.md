# Meta App Review — recording and submission plan (2026-10-12)

The runbook for submitting app "Siar" (28644434825211360) for Advanced Access. Pairs with
[meta.md](meta.md) (app setup). Status at writing: app Live, Business verified, Tech Provider access
verification in review, every permission exercised on production on 2026-10-12. Meta's Testing page
lags up to 24 h. Each test call is valid for 30 days, so **submit by 2026-11-10**.

## 1. What Meta asks for (checked 2026-10-12)

From the submission guide and the Instagram/Messenger review pages:

- **Every permission needs its own description and a screencast.** A permission with no screencast is
  not approved.
- **Screencast content:** an app user **granting** the permission (the login and consent screens),
  then the app **using** it, end to end.
- **Format:** 1080p or better, no audio, English UI. Captions or tooltips for anything unclear. A
  visible, enlarged mouse cursor. Record only the app, not other windows.
- **Common rejections** (community reports, not official policy):
  - the connected Page or username never appears on screen;
  - the data is used only in the back end, with nothing shown to the user;
  - one long video shared by every permission;
  - the reviewer cannot reproduce the flow (policy 1.9).
- **Reviewer access:** Siar has its own sign-in, so we give a Siar test login. We never give our Meta
  credentials, because Meta tests with its own accounts.
- **Messaging recordings** must show:
  - a message **sent from the app** (not just received);
  - the Facebook Login for Business grant;
  - a conversation started by a person.
- **Dependencies go in the same submission.** For example, `instagram_basic` needs `pages_show_list`,
  and `pages_messaging` needs `pages_manage_metadata`.

## 2. What we submit (from the Testing page, 2026-10-12)

All four use cases, in one submission:

| Use case | Permissions and features |
|---|---|
| Manage everything on your Page | pages_show_list, pages_read_engagement, pages_read_user_content, pages_manage_posts, pages_manage_engagement, pages_manage_metadata, read_insights, business_management, public_profile, Business Asset User Profile Access |
| Manage messaging & content on Instagram | instagram_basic, instagram_content_publish, instagram_manage_comments, instagram_manage_insights, instagram_manage_messages, instagram_business_basic, instagram_business_content_publish, instagram_business_manage_comments, instagram_business_manage_insights, instagram_business_manage_messages |
| Engage with customers on Messenger | pages_messaging (plus the shared Page permissions above) |
| Access the Threads API | threads_basic, threads_content_publish, threads_read_replies, threads_manage_replies, threads_manage_insights, threads_delete |

**Not requested:** Human Agent. Siar warns before replying outside the 24-hour window and does not
promise 7-day replies.

## 3. The films

There are 18 short films, one job each. Every permission gets the film that shows it, and some films
serve two related permissions. Each film opens on Siar already signed in, with a title card naming the
permission(s), and ends on proof on Meta's side (the post, reply or DM on facebook.com, instagram.com
or threads.net).

| # | Film | Permissions it is uploaded for | Shot list |
|---|---|---|---|
| F1 | Connect a Facebook Page | pages_show_list, business_management, public_profile | Social accounts → Connect Facebook → Facebook Login for Business → choose the business, then the Page → the consent screen listing the permissions → Save → back in Siar, the Page picker lists "FF Dev Studio" → select → the card shows the Page name, its URL, and Connected |
| F2 | Publish and delete a Page post | pages_manage_posts | New post → Facebook → text + image → Publish now → status Posted → View on Facebook (the post is live) → back in Siar, Delete → the dialog says it is deleted from Facebook too → facebook.com shows the post gone |
| F3 | Read Page engagement | pages_read_engagement | Posts → the published post → per-network status, permalink, likes and comments counts; Analytics → Top posts row for it |
| F4 | Read Page comments | pages_read_user_content | A person comments on the Page post (another account) → Inbox → Comments shows it with name, text, time and likes |
| F5 | Moderate Page comments | pages_manage_engagement | Inbox → Comments → Reply → the reply on facebook.com; Like; Hide → hidden on Facebook; Unhide; Delete |
| F6 | Real-time updates | pages_manage_metadata | Inbox open → a person comments, then DMs the Page → each appears in Siar within seconds with no reload (the webhook subscription) |
| F7 | Page insights | read_insights | Analytics → Facebook → Refresh → followers, impressions, views, likes per day, top posts |
| F8 | Messenger inbox | pages_messaging, Business Asset User Profile Access | Inbox → Messages → Turn on for Facebook → Facebook Login with the messaging grant → a person messages the Page → it appears with their name (and picture) → reply from Siar → Sent → the reply shown in Meta Business Suite's inbox for the Page |
| I1 | Connect Instagram (through a Page) | instagram_basic | Connect Instagram → "Facebook" method → Facebook Login → select the Instagram account → Siar shows @ffdev.studio with its avatar |
| I2 | Publish to Instagram (through a Page) | instagram_content_publish | New post → Instagram → image + caption → Publish now → Posted → View on Instagram |
| I3 | Instagram comments (through a Page) | instagram_manage_comments | A person comments → Inbox shows it → reply (visible on instagram.com) → hide → delete |
| I4 | Instagram insights (through a Page) | instagram_manage_insights | Analytics → Instagram → refresh → account metrics + post rows |
| I5 | Instagram DMs (through a Page) | instagram_manage_messages | Turn on Instagram messages (grant shown) → a person DMs @ffdev.studio → appears in Siar → reply → Sent → the reply in the instagram.com inbox |
| G1 | Instagram Login: connect, publish, comments, insights | instagram_business_basic, instagram_business_content_publish, instagram_business_manage_comments, instagram_business_manage_insights | Reconnect → "Instagram (professional account)" → instagram.com login and consent screen → connected card → publish → comment reply/hide → Analytics. Cut into four films if the long version runs past ~2.5 min. |
| G2 | Instagram Login: DMs | instagram_business_manage_messages | Turn on messages (Instagram consent with messaging) → DM arrives → reply → visible on instagram.com |
| T1 | Threads: connect, publish, delete | threads_basic, threads_content_publish, threads_delete | Connect Threads → threads.net consent → profile card → publish → View on Threads → Delete in Siar → gone on Threads |
| T2 | Threads replies | threads_read_replies, threads_manage_replies | A person replies → Inbox shows it → reply from Siar → visible on Threads → hide |
| T3 | Threads insights | threads_manage_insights | Analytics → Threads → refresh → views, likes, replies, followers |

Order of recording: F1→F8, I1→I5, then switch Instagram to Instagram Login for G1–G2, then T1–T3.
Siar connects one Instagram at a time per team. Since commit 1c8177e, switching method keeps the
account's history.

## 4. How the films are made

**Script.** `scripts/meta-review/record.mjs` uses Playwright with the real Chrome (`channel: 'chrome'`).
It follows the shot list with human pacing and real typing.
- It uses a dedicated persistent profile in `review/chrome-profile` (git-ignored).
- Fakhrul signs in once to Siar, Facebook (Fakhrul Dev), Instagram (ffdev.studio) and Threads in that
  window. Claude never types a password.
- No automation banner (`--enable-automation` off). Locale en-US, `--lang=en-US`.

**Capture.**
- The CDP screencast records the page at a 1440×900 viewport and DPR 2. Frames are sorted by
  timestamp and resampled to 30 fps.
- Output is 1920×1200 H.264, tagged bt709, with a 1920×96 caption band below. Final size is
  1920×1296 MP4, under 100 MB and 3 min.
- Same method as `apps/site/scripts/clips.mjs`.

**Cursor and captions.**
- A drawn, enlarged cursor (32 px) follows real mouse moves; Playwright moves the mouse in steps.
  Each click shows a ring.
- The caption for each step comes from the script's own timeline, so captions never drift.
- Captions sit in the band, never over the UI.

**Waits.**
- Network processing (publishing, insights) is sped up and captioned "sped up ×N".
- Waits for a person's comment or DM are cut, and the cut is captioned ("A follower comments from
  another account").
- Nothing on screen is staged. Every action happens on production against FF's real Page and accounts.

**Live actions by Fakhrul (phone, at a cue from the script).** He comments on the post from
fakhrlfahmi (Instagram) and his personal Facebook, replies on Threads, and DMs @ffdev.studio and the
FF Page.

**Fresh consent screens.** Meta only shows the full grant screens to someone who hasn't granted
before. Before F1, I1, G1 and T1, Siar is removed from that account on Meta's side:
- Facebook: Settings → Business integrations;
- Instagram: Apps and websites;
- Threads: Website permissions.

The deauthorize callback then disconnects it in Siar, and the film reconnects it on camera.

## 5. Frame-by-frame review (every film, before upload)

1. **Automated checks:**
   - `ffprobe`: size 1920×1296, 30 fps, H.264 yuv420p bt709, duration under 3 min;
   - `blackdetect`: no black frames;
   - `freezedetect`: no still longer than 4 s unless captioned.
2. **Contact sheets:** every frame at 2 fps, tiled 4×3 with timecodes. Claude inspects every sheet.
3. **Key frames at full size:** every caption change, every click, the consent screen and the final
   proof frame.
4. **Checklist for each film:**
   - the permission's name appears in the title card and the description;
   - the grant screen is visible and readable (permission names in English);
   - the connected Page or username is visible;
   - the data the permission returns is on screen in Siar;
   - the final state is proven on Meta's side;
   - captions are spelled right and in sync (±0.5 s);
   - no tokens, app secrets, other people's private data, browser notifications or other tabs;
   - no "Confirm your email" banner in Siar (verify the email first);
   - nothing cut off at the edges;
   - the cursor is visible on every click.
5. **Findings:** any failure means fix the script and record that film again. Films are never edited by
   hand.

The review notes for each film are written to `review/out/<film>.md`, with the frames that were
checked.

## 6. Written fields

**Testing instructions** (Settings → Basic, and per submission):

> Siar (https://app.siaran.my) is a dashboard and API that lets businesses publish to and manage their
> own social accounts.
> 1. Sign in at https://app.siaran.my/login with the reviewer account below.
> 2. Social accounts → Connect Facebook (or Instagram → "Facebook" or "Instagram" method, or Threads)
>    and complete Meta's login with your test user. Choose a Page or Instagram professional account.
> 3. New post (top right) → pick the network → write text, attach an image → Publish now. Posts →
>    open the post → "View on Facebook". Delete removes it from the network.
> 4. Comment on the post from another account → Inbox → Comments shows it within seconds. Use Reply,
>    Like, Hide and Delete.
> 5. Inbox → Messages → Turn on for the account → message the Page or Instagram account from another
>    account → reply from Siar.
> 6. Analytics → choose the network → Refresh.

**Reviewer account:** `siaran+meta-review@ffdev.studio`, in its own organization on the top plan with
messaging enabled. Fakhrul creates the password and types it into Meta's form.

**Per-permission descriptions:** one each, never copy-pasted. Each says:
- what the user does in Siar;
- which data Siar reads or writes;
- that the data is shown only to that business;
- that Siar is worse without it.

Drafts are in §7.

## 7. Permission descriptions (paste one per permission)

- **pages_show_list:** When a business connects Facebook, Siar lists the Pages they manage so they
  can choose the Page Siar publishes to. Without it the user cannot pick a Page, and nothing can be
  published. Page names and ids are shown only to that business in Social accounts.
- **business_management:** Pages and Instagram accounts owned by a Business portfolio only appear
  when the person grants access to the portfolio's assets in Facebook Login for Business. Siar needs
  this to list portfolio Pages (dependency of pages_show_list, pages_messaging and
  instagram_manage_messages). Siar does not read ads, billing or people in the portfolio.
- **public_profile:** Shows which Facebook user connected the account ("Signed in as …"), so a team
  can see who connected it and reconnect when the token expires.
- **pages_read_engagement:** Reads the selected Page's details (name, picture, link, followers) and
  the likes, comments and shares on posts Siar published, shown on each post and in Analytics. The
  user sees whether a post landed and how it performs. Without it Siar only knows that a post went
  out.
- **pages_manage_posts:** Publishes the posts a user writes in Siar (text, photos, videos, links) to
  their Page, now or at a scheduled time, and deletes them when the user deletes the post in Siar.
  This is Siar's core feature.
- **pages_read_user_content:** Reads the comments people leave on the Page's posts, so the business
  can read and answer them in Siar's Inbox alongside their other networks. Comments are shown only to
  that business's team.
- **pages_manage_engagement:** Lets the business reply to, like, hide, unhide and delete comments on
  their Page posts from Siar's Inbox, and post the first comment they scheduled with a post. Every
  action is started by the user.
- **pages_manage_metadata:** Subscribes Siar to the Page's webhooks (feed and messages), so new
  comments and messages appear in Siar's Inbox within seconds instead of after polling. Turning
  messages off in Siar leaves other subscriptions intact.
- **read_insights:** Shows the Page's reach, impressions, views and engagement over time and per post
  in Siar's Analytics, so the business can see what works. Metrics are shown only to that business.
- **pages_messaging:** When the business turns on messages for their Page in Siar, people's messages
  to the Page appear in Siar's Inbox and the business replies to them from Siar, inside Messenger's
  24-hour window. Siar never sends a message the business did not write and does not send
  promotional messages.
- **Business Asset User Profile Access:** Shows the name and profile picture of the person who
  messaged or commented, so the business knows who it is replying to. Used only in the Inbox of the
  business that person contacted.
- **instagram_basic:** Reads the connected Instagram professional account's username, picture and
  media list, so the user can pick it and see it connected in Siar.
- **instagram_content_publish:** Publishes the photos, carousels and Reels a user creates in Siar to
  their Instagram professional account, now or scheduled.
- **instagram_manage_comments:** Reads comments on the account's media and lets the business reply,
  hide and delete them from Siar's Inbox, and post a scheduled first comment.
- **instagram_manage_insights:** Shows the account's and each post's reach, views and engagement in
  Siar's Analytics.
- **instagram_manage_messages:** When the business turns on Instagram messages in Siar, DMs to their
  account appear in Siar's Inbox and the business replies from Siar inside the 24-hour window.
- **instagram_business_basic / instagram_business_content_publish /
  instagram_business_manage_comments / instagram_business_manage_insights /
  instagram_business_manage_messages:** The same features for businesses that connect Instagram
  directly with Instagram Login (no Facebook Page). Each description names its one feature, as above.
- **threads_basic:** Reads the connected Threads profile (username, name, picture) to show which
  profile Siar posts to.
- **threads_content_publish:** Publishes the text, image, video and carousel posts a user creates in
  Siar to their Threads profile.
- **threads_read_replies:** Reads replies to the user's Threads posts and shows them in Siar's Inbox.
- **threads_manage_replies:** Lets the user reply to and hide replies on their Threads posts from
  Siar's Inbox.
- **threads_manage_insights:** Shows views, likes, replies, reposts and followers for the profile and
  each post in Siar's Analytics.
- **threads_delete:** Deletes a Threads post when the user deletes it in Siar, so the post is removed
  everywhere at once.

## 8. Order of work

1. **Code:** the Inbox's live refresh and accurate delete copy (fc06f91, deployed). Done.
2. **Fakhrul:**
   - verify Siar's email;
   - in the recording window, sign in to Siar, Facebook, Instagram and Threads;
   - approve removing Siar from the three Meta accounts (one at a time, right before each connect
     film).
3. **Claude:**
   - build `record.mjs`;
   - record one film (F7, insights, no live actions needed) as a pilot;
   - run the full review on the pilot and show it to Fakhrul.
4. Record the rest in the §3 order, with Fakhrul on his phone for the live comments and DMs. Review
   each film per §5.
5. **Once the Testing page shows every permission, Claude fills in the App Review form:**
   - descriptions;
   - the video for each permission;
   - testing instructions;
   - the reviewer login, except the password.
6. **Fakhrul:**
   - types the reviewer password;
   - reads the submission;
   - clicks Submit. It can't be edited once sent.

## 9. Recording status (2026-10-13)

Some films were merged, so one video covers the permissions granted on the same consent screen
(`scripts/meta-review/films.json` is the source of truth):

| Film | Permissions | Status |
|---|---|---|
| F1 Connect a Facebook Page | pages_show_list, business_management, public_profile | Done |
| F2 Publish and delete a Page post | pages_manage_posts | Done |
| F7 Page insights | read_insights | Done |
| G1 Instagram Login: connect, publish, insights | instagram_business_basic, instagram_business_content_publish, instagram_business_manage_insights | Done |
| T1 Threads: connect, publish, insights, delete | threads_basic, threads_content_publish, threads_manage_insights, threads_delete | Done |
| I1 Instagram through a Page: connect, publish, insights | instagram_basic, instagram_content_publish, instagram_manage_insights | Done |
| F3, F4, F5, F6, F8 | Page engagement, comments, moderation, webhooks, Messenger | Needs a person commenting and messaging |
| I3, I5 | instagram_manage_comments, instagram_manage_messages | Needs a person (Instagram is on the Facebook method now) |
| G3, G2 | instagram_business_manage_comments, instagram_business_manage_messages | Needs a person; reconnect with Instagram Login first |
| T2 | threads_read_replies, threads_manage_replies | Needs a person replying |

Rig lessons from these takes:
- **Redirects:** Meta's redirects flash a blank white page. Cut them with `@cut` (no caption).
- **Extension pointer and glow:** the extension's orange pointer and glow linger on a fresh page
  until the first mouse move. Cut that moment too. `scratchpad orange.py` and the right-edge colour
  probe find both.
- **Timeline lag:** timeline marks run about 0.35 s ahead of the video. A cut that must hide
  exact frames is placed by measuring the raw video, not by the mark time.
