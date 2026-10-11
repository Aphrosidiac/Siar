# Reddit — Responsible Builder API access

Self-serve OAuth tokens for new apps ended in Nov 2025; every new app is reviewed by hand and may
be refused. Siar's Reddit adapter is built and tested; it turns on only if access is granted.

## [F]
Submit the API access request (reddit.com/r/reddit.com/wiki/api → "request access" form) from the
FF Reddit account. Paste:
- **What are you building?** A publishing and scheduling tool. Users connect their own Reddit
  account and submit posts they wrote to subreddits they choose, edit or delete them, and reply to
  comments on their own posts. We read only the user's own posts and their comment threads to show
  status and engagement.
- **Why the Data API?** To act on behalf of a logged-in user (submit/edit/delete their posts,
  reply to comments) and show the score and comment count of their own posts.
- **Volume:** under 500 submissions/day across all users at launch; we respect subreddit rules
  (post requirements and flair are checked before submitting) and Reddit's rate limits.
- **Data use:** no scraping, no model training, no resale, no data on non-users beyond the
  comments on the user's own posts; tokens deleted on disconnect.
- **Contact:** hello@siar.dev, FF DEV STUDIO (202603234793).
Then create a **web app** at reddit.com/prefs/apps with redirect
https://api.siar.dev/api/v1/social-account/callback/REDDIT.
