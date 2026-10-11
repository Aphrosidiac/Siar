#!/usr/bin/env node
/**
 * Siar MCP server (stdio). Gives any MCP client tools to publish, schedule, inspect and measure
 * social media posts across 15 networks. Env: SIAR_API_KEY (required), SIAR_API_URL (optional).
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { Siar, SiarError, composePost, NETWORKS, type OperationId } from '@siar/sdk';

const siar = new Siar();
const server = new McpServer({ name: 'siar', version: '0.1.0' });
const NET = z.enum(NETWORKS as unknown as [string, ...string[]]);

const ok = (v: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(v, null, 1) }] });
const fail = (e: unknown) => ({
  isError: true,
  content: [{ type: 'text' as const, text: e instanceof SiarError ? JSON.stringify({ statusCode: e.statusCode, message: e.message, issues: (e as any).issues }) : String((e as Error)?.message ?? e) }],
});
const call = (id: OperationId, args: { body?: unknown; query?: object; path?: object } = {}) => siar.request(id, args as any);
function tool<S extends z.ZodRawShape>(name: string, description: string, shape: S, run: (a: z.infer<z.ZodObject<S>>) => Promise<unknown>) {
  server.tool(name, description, shape, (async (a: any) => { try { return ok(await run(a)); } catch (e) { return fail(e); } }) as any);
}

tool('list_teams', 'List teams (social sets). Each team holds at most one account per network; posts are created against a teamId.', {}, () => call('team.getList', { query: { limit: 100 } }));
tool('create_team', 'Create a team (social set).', { name: z.string() }, a => call('team.createTeam', { body: { name: a.name } }));
tool('list_social_accounts', 'Connected social accounts of a team, with connection state.', { teamId: z.string() }, async a => ((await call('team.getTeam', { path: { id: a.teamId } })) as any).socialAccounts);
tool('get_connect_url', 'Get the URL a human must open to connect a social account (OAuth). Connecting is never headless.', { teamId: z.string(), network: NET, redirectUrl: z.string().url(), serverUrl: z.string().optional().describe('Mastodon instance / Bluesky PDS') },
  a => call('socialAccount.connect', { body: { teamId: a.teamId, type: a.network, redirectUrl: a.redirectUrl, ...(a.serverUrl ? { serverUrl: a.serverUrl } : {}) } }));
tool('upload_media', 'Upload media from a public URL or a local file path; returns an upload id to attach to posts.', { source: z.string().describe('https URL or local path'), teamId: z.string().optional() },
  a => (/^https?:\/\//.test(a.source) ? siar.uploads.fromUrl(a.source, { teamId: a.teamId }) : siar.uploads.fromFile(a.source, { teamId: a.teamId })));
const postShape = {
  teamId: z.string(), networks: z.array(NET).min(1), text: z.string().optional(), uploadIds: z.array(z.string()).optional(),
  title: z.string().optional(), referenceKey: z.string().optional(),
  data: z.record(z.string(), z.record(z.string(), z.any())).optional().describe('Per-network fields, e.g. {"TIKTOK":{"privacy":"PUBLIC_TO_EVERYONE"},"PINTEREST":{"boardName":"Ideas"}}'),
  firstComment: z.string().optional(),
};
const build = (a: any, when: { at?: string; now?: boolean; draft?: boolean }) => {
  const body: any = composePost({ teamId: a.teamId, networks: a.networks, text: a.text, uploadIds: a.uploadIds, title: a.title, referenceKey: a.referenceKey, data: a.data, ...when });
  if (a.firstComment) body.firstComment = Object.fromEntries(a.networks.map((n: string) => [n, a.firstComment]));
  return body;
};
tool('create_post', 'Publish now, or save as draft. Returns the post; poll get_post for per-network status.', { ...postShape, draft: z.boolean().optional() }, a => call('post.create', { body: build(a, a.draft ? { draft: true } : { now: true }) }));
tool('schedule_post', 'Schedule a post for a future time (ISO 8601, UTC recommended).', { ...postShape, at: z.string() }, a => call('post.create', { body: build(a, { at: a.at }) }));
tool('list_posts', 'List posts of a team, newest first.', { teamId: z.string(), status: z.string().optional(), limit: z.number().int().min(1).max(100).optional() }, a => call('post.getList', { query: { teamId: a.teamId, status: a.status, limit: a.limit ?? 20 } }));
tool('get_post', 'Get a post with per-network status, permalinks and verbatim network errors.', { postId: z.string() }, a => call('post.get', { path: { id: a.postId } }));
tool('retry_post', 'Retry a post in ERROR (max 6 retries).', { postId: z.string() }, a => call('post.retry', { path: { id: a.postId } }));
tool('delete_post', 'Delete a post (also deletes it on networks that allow it).', { postId: z.string() }, a => call('post.delete', { path: { id: a.postId } }));
tool('list_comments', 'Comments fetched from a published post.', { teamId: z.string(), postId: z.string() }, a => call('comment.importGetFetchedComments', { query: { teamId: a.teamId, postId: a.postId } }));
tool('reply_to_comment', 'Reply to a fetched comment (or comment on a post) on the given networks.', { teamId: z.string(), postId: z.string(), networks: z.array(NET).min(1), text: z.string(), fetchedParentCommentId: z.string().optional() },
  a => call('comment.create', { body: { teamId: a.teamId, internalPostId: a.postId, fetchedParentCommentId: a.fetchedParentCommentId, title: 'Reply', postDate: new Date().toISOString(), status: 'SCHEDULED', socialAccountTypes: a.networks, data: Object.fromEntries(a.networks.map(n => [n, { text: a.text }])) } }));
tool('get_post_analytics', 'Analytics of a post on one network.', { postId: z.string(), network: NET }, a => call('analytics.getPostAnalytics', { query: { postId: a.postId, platformType: a.network } }));
tool('get_account_analytics', 'Analytics of a connected account.', { teamId: z.string(), network: NET }, a => call('analytics.getSocialAccountAnalytics', { query: { teamId: a.teamId, platformType: a.network } }));
tool('get_usage', 'This month\'s usage against plan limits (posts, comments, uploads).', {}, async () => ({ posts: await call('organization.getPostsUsage'), comments: await call('organization.getCommentsUsage'), uploads: await call('organization.getUploadsUsage') }));
tool('get_credit_balance', 'Prepaid X credit balance (X posts are billed per use).', {}, () => call('credit.getCreditBalance'));
tool('quote_x_cost', 'Quote the X cost of posting these texts ($0.015 each, $0.20 with a link).', { teamId: z.string(), texts: z.array(z.string()).min(1) }, a => call('credit.quoteBillableUsage', { body: { teamId: a.teamId, texts: a.texts } }));
tool('call_operation', 'Escape hatch: call any Siar API operation by operationId (see the API reference).', { operationId: z.string(), body: z.any().optional(), query: z.record(z.string(), z.any()).optional(), path: z.record(z.string(), z.any()).optional() },
  a => call(a.operationId as OperationId, { body: a.body, query: a.query, path: a.path }));

await server.connect(new StdioServerTransport());
