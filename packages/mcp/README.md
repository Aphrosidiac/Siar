# @siar/mcp

MCP server for the [Siar](https://siaran.my) unified social media API — post, schedule, read
analytics and manage comments on 15 networks from Claude, Cursor or any MCP client.

```json
{ "mcpServers": { "siar": { "command": "npx", "args": ["-y", "@siar/mcp"], "env": { "SIAR_API_KEY": "sk_live_…" } } } }
```
Claude Code: `claude mcp add siar -e SIAR_API_KEY=sk_live_… -- npx -y @siar/mcp`

Tools: list_teams, create_team, list_social_accounts, get_connect_url, upload_media, create_post,
schedule_post, list_posts, get_post, retry_post, delete_post, list_comments, reply_to_comment,
get_post_analytics, get_account_analytics, get_usage, get_credit_balance, quote_x_cost, call_operation.
