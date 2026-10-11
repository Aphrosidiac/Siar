import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SPEC } from './openapi';

/**
 * WEBHOOK_EVENTS lives in apps/api/src/platform/events.ts, which also imports the database layer,
 * so the site reads the constant from the source text rather than importing the module.
 * Falls back to the enum in the OpenAPI document (webhook.create) if the file moves.
 */
function load(): string[] {
  try {
    const src = readFileSync(fileURLToPath(new URL('../../../api/src/platform/events.ts', import.meta.url)), 'utf8');
    const m = src.match(/WEBHOOK_EVENTS\s*=\s*\[([\s\S]*?)\]/);
    if (m) {
      const list = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
      if (list.length) return list;
    }
  } catch {}
  return SPEC.paths['/api/v1/webhook']?.post?.requestBody?.content?.['application/json']?.schema?.properties?.events?.items?.enum ?? [];
}

export const WEBHOOK_EVENTS: string[] = load();

export const EVENT_TEXT: Record<string, string> = {
  'post.published': 'A post finished publishing on a network, or failed for good. Sent once per post per network.',
  'comment.published': 'A comment or reply you created through Siar was published (or failed).',
  'comment.received': 'Someone commented on a post, and Siar picked it up from the network.',
  'team.created': 'A team was created.',
  'team.updated': 'A team was renamed or its settings changed.',
  'team.deleted': 'A team was deleted.',
  'social-account.created': 'An account was connected to a team.',
  'social-account.updated': 'An account changed: channel picked, profile refreshed, or it needs reconnecting.',
  'social-account.deleted': 'An account was disconnected.',
  'credit.low-balance': 'The X credit balance fell below the threshold you set.',
  'credit.exhausted': 'The X credit balance reached zero. X actions stop until you top up; other networks keep publishing.',
  'conversation.created': 'A new direct-message conversation started.',
  'conversation.updated': 'A conversation was archived, reopened or otherwise changed.',
  'conversation.message.created': 'A message was sent or received in a conversation.',
  'conversation.message.updated': 'A message changed (reaction, edit, delivery state).',
  'conversation.read.updated': 'The read state of a conversation changed.',
};
