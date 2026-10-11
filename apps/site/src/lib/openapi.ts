import spec from '../../../../packages/contract/openapi.json';
import { API_BASE } from '../config';

export const SPEC: any = spec;

export interface Op {
  method: string;
  path: string;
  /** Path relative to the /api/v1 base. */
  rel: string;
  operationId: string;
  summary: string;
  tag: string;
  public: boolean;
  parameters: any[];
  body: { contentType: string; schema: any } | null;
  response: { status: string; schema: any } | null;
  errorStatuses: string[];
  anchor: string;
}

/** Tag → page slug, title and our own description. Order here is the sidebar order. */
export const TAG_META: Record<string, { slug: string; title: string; text: string }> = {
  post: { slug: 'post', title: 'Posts', text: 'Create, schedule, update, retry and delete posts. One post targets several networks at once through its per-network data.' },
  upload: { slug: 'upload', title: 'Uploads', text: 'Store media once and reference the upload id from any number of posts. Simple, from-URL, large (signed PUT) and multipart uploads.' },
  socialAccount: { slug: 'social-account', title: 'Social accounts', text: 'Connect, disconnect and inspect social accounts; pick channels; create hosted connect links for your own users.' },
  team: { slug: 'team', title: 'Teams', text: 'Teams (social sets) group at most one account per network. Create one team per customer, brand or location.' },
  comment: { slug: 'comment', title: 'Comments', text: 'Publish comments and replies, import the comments people left on your posts and moderate them.' },
  analytics: { slug: 'analytics', title: 'Analytics', text: 'Post and account metrics, normalised across networks, with the raw network payload kept alongside.' },
  postImport: { slug: 'post-history-import', title: 'Post history import', text: 'Backfill posts that were published outside Siar, optionally with their analytics.' },
  postCSV: { slug: 'post-csv-import', title: 'CSV import', text: 'Create many posts at once from a CSV file and follow the result row by row.' },
  webhook: { slug: 'webhook', title: 'Webhooks', text: 'Subscribe an HTTPS endpoint to events, inspect deliveries, resend and rotate the signing secret.' },
  'api-key': { slug: 'api-key', title: 'API keys', text: 'Create, roll and delete organization API keys. A new key is shown once.' },
  organization: { slug: 'organization', title: 'Organization', text: 'The organization, its settings, its usage against plan quotas and its activity log.' },
  credit: { slug: 'credit', title: 'X credit', text: 'Read the prepaid balance that pays for X API usage and quote an X action before running it.' },
  misc: { slug: 'misc', title: 'Network-specific', text: 'Operations that exist on one network only: playlists, boards, flairs, music libraries, Business Profile location data, reviews and more.' },
  conversation: { slug: 'conversation', title: 'Conversations', text: 'Direct-message inboxes for networks that allow it through their API.' },
  automation: { slug: 'automation', title: 'Automations', text: 'Flows that react to comments and messages, with executions you can inspect.' },
  bot: { slug: 'bot', title: 'Bots', text: 'Display identities (name and avatar) used when Siar posts to Discord and Slack.' },
  bio: { slug: 'bio', title: 'Bio pages', text: 'Hosted link-in-bio pages.' },
  'bio-item': { slug: 'bio-item', title: 'Bio items', text: 'Links and blocks on a bio page.' },
  'bio-analytics': { slug: 'bio-analytics', title: 'Bio analytics', text: 'Views and clicks of a bio page.' },
  user: { slug: 'user', title: 'Users', text: 'Your profile, organization members and invitations.' },
  notification: { slug: 'notification', title: 'Notifications', text: 'In-app notifications for the signed-in user.' },
  billing: { slug: 'billing', title: 'Billing', text: 'Plan, checkout, invoices and X credit top-ups.' },
  auth: { slug: 'auth', title: 'Dashboard sessions', text: 'Sign-up and session endpoints used by the dashboard. Integrations use API keys instead.' },
  portal: { slug: 'portal', title: 'Hosted portal', text: 'Endpoints behind the hosted connect page. They authenticate with the portal token in the path.' },
  app: { slug: 'app', title: 'Health', text: 'A health check that needs no key.' },
};

let cache: Op[] | null = null;
export function operations(): Op[] {
  if (cache) return cache;
  const out: Op[] = [];
  for (const [path, item] of Object.entries<any>(SPEC.paths)) {
    for (const [method, op] of Object.entries<any>(item)) {
      if (!op || typeof op !== 'object' || !op.operationId) continue;
      const content = op.requestBody?.content ?? null;
      const ct = content ? Object.keys(content)[0] : null;
      const okStatus = Object.keys(op.responses ?? {}).find((s) => s.startsWith('2'));
      const okContent = okStatus ? op.responses[okStatus]?.content : null;
      out.push({
        method: method.toUpperCase(),
        path,
        rel: path.replace(/^\/api\/v1/, '').replace(/\/$/, '') || '/',
        operationId: op.operationId,
        summary: op.summary ?? op.operationId,
        tag: op.tags?.[0] ?? 'app',
        public: Array.isArray(op.security) && op.security.length === 0,
        parameters: op.parameters ?? [],
        body: ct ? { contentType: ct, schema: content[ct].schema } : null,
        response: okStatus ? { status: okStatus, schema: okContent ? (Object.values<any>(okContent)[0]?.schema ?? null) : null } : null,
        errorStatuses: Object.keys(op.responses ?? {}).filter((s) => !s.startsWith('2')),
        anchor: op.operationId.replace(/[^a-zA-Z0-9]+/g, '-'),
      });
    }
  }
  cache = out;
  return out;
}

export const tagsInOrder = () => {
  const present = new Set(operations().map((o) => o.tag));
  return Object.keys(TAG_META).filter((t) => present.has(t)).concat([...present].filter((t) => !TAG_META[t]));
};
export const tagMeta = (tag: string) => TAG_META[tag] ?? { slug: tag.toLowerCase().replace(/[^a-z0-9]+/g, '-'), title: tag, text: '' };
export const opsForTag = (tag: string) => operations().filter((o) => o.tag === tag);
export const opById = (id: string) => operations().find((o) => o.operationId === id);
export const opLink = (id: string) => {
  const o = opById(id);
  return o ? `/docs/api/${tagMeta(o.tag).slug}#${o.anchor}` : '/docs/api';
};

export function postDataSchema(type: string): any {
  const op = SPEC.paths['/api/v1/post/']?.post;
  return op?.requestBody?.content?.['application/json']?.schema?.properties?.data?.properties?.[type] ?? null;
}

// ───────────── schema → field tree ─────────────

export interface Field {
  name: string;
  type: string;
  required: boolean;
  nullable: boolean;
  enum?: (string | number | boolean)[];
  default?: unknown;
  notes: string[];
  children?: Field[];
  variants?: { label: string; fields: Field[] }[];
}

export function typeLabel(s: any): string {
  if (!s) return 'any';
  if (s.oneOf) return s.oneOf.map(typeLabel).join(' | ');
  if (s.type === 'array') return `${typeLabel(s.items)}[]`;
  if (s.type === 'object' && s.additionalProperties && !s.properties) return `map<string, ${typeLabel(s.additionalProperties)}>`;
  if (s.format === 'binary') return 'file';
  return s.type ?? 'any';
}

function notes(s: any): string[] {
  const n: string[] = [];
  if (!s) return n;
  if (s.format && s.format !== 'binary') n.push(s.format);
  if (s.minLength !== undefined) n.push(`min length ${s.minLength}`);
  if (s.maxLength !== undefined) n.push(`max length ${s.maxLength.toLocaleString('en-US')}`);
  if (s.minimum !== undefined) n.push(`≥ ${s.minimum}`);
  if (s.maximum !== undefined) n.push(`≤ ${s.maximum}`);
  if (s.minItems !== undefined) n.push(`min ${s.minItems} items`);
  if (s.maxItems !== undefined) n.push(`max ${s.maxItems} items`);
  if (s.pattern) n.push(`pattern ${s.pattern}`);
  return n;
}

/** The object schema whose properties describe this value's children (unwrapping arrays). */
function objectOf(s: any): any {
  let x = s;
  while (x?.type === 'array') x = x.items;
  return x;
}

export function toFields(schema: any, depth = 0, maxDepth = 8): Field[] {
  const s = objectOf(schema);
  if (!s || !s.properties || depth > maxDepth) return [];
  const req: string[] = s.required ?? [];
  return Object.entries<any>(s.properties).map(([name, p]) => field(name, p, req.includes(name), depth, maxDepth));
}

function field(name: string, p: any, required: boolean, depth: number, maxDepth: number): Field {
  const inner = objectOf(p);
  const f: Field = {
    name,
    type: typeLabel(p),
    required,
    nullable: Boolean(p?.nullable || inner?.nullable),
    enum: p?.enum ?? (p?.type === 'array' ? p.items?.enum : undefined),
    default: p?.default,
    notes: [...notes(p), ...(p?.type === 'array' ? notes(p.items).map((x) => `each: ${x}`) : [])],
  };
  if (inner?.oneOf && inner.oneOf.some((v: any) => v?.properties)) {
    const disc = inner.discriminator?.propertyName;
    f.variants = inner.oneOf.map((v: any, i: number) => ({
      label: disc && v?.properties?.[disc]?.enum ? `${disc} = ${v.properties[disc].enum.join(' | ')}` : v?.properties ? `Variant ${i + 1}` : typeLabel(v),
      fields: toFields(v, depth + 1, maxDepth),
    }));
  } else if (inner?.properties) {
    f.children = toFields(inner, depth + 1, maxDepth);
  } else if (inner?.additionalProperties?.properties) {
    f.children = toFields(inner.additionalProperties, depth + 1, maxDepth).map((c) => ({ ...c, name: `<key>.${c.name}` }));
  }
  return f;
}

export const countFields = (fs: Field[]): number => fs.reduce((n, f) => n + 1 + countFields(f.children ?? []) + (f.variants ?? []).reduce((m, v) => m + countFields(v.fields), 0), 0);

// ───────────── examples ─────────────

function sampleString(name: string, s: any): string {
  if (s.enum) return s.enum[0];
  if (s.format === 'date-time' || /date/i.test(name)) return '2026-11-02T09:00:00.000Z';
  if (s.format === 'uri' || /url$/i.test(name)) return name.toLowerCase().includes('redirect') ? 'https://yourapp.example/connected' : 'https://example.com/file.jpg';
  if (/^teamId$/.test(name)) return 'TEAM_ID';
  if (/id$/i.test(name)) return name.replace(/Id$/, '').toUpperCase() + '_ID';
  if (/email/i.test(name)) return 'you@example.com';
  if (/name/i.test(name)) return 'Example';
  if (/text|title|description/i.test(name)) return 'Hello from Siar';
  return 'string';
}

export function example(s: any, name = '', depth = 0, all = false): unknown {
  if (!s || depth > 6) return null;
  if (s.oneOf) return example(s.oneOf[0], name, depth, all);
  if (s.default !== undefined && !s.enum) return s.default;
  switch (s.type) {
    case 'string': return s.format === 'binary' ? '@./file.jpg' : sampleString(name, s);
    case 'integer':
    case 'number': return s.enum ? s.enum[0] : name === 'limit' ? 10 : name === 'offset' ? 0 : s.minimum ?? 1;
    case 'boolean': return false;
    case 'array': return [example(s.items, name.replace(/s$/, ''), depth + 1, all)];
    case 'object': {
      if (!s.properties) return {};
      const req: string[] = s.required ?? [];
      let keys = Object.keys(s.properties).filter((k) => all || req.includes(k));
      if (!keys.length && depth === 0) keys = Object.keys(s.properties).slice(0, 3);
      return Object.fromEntries(keys.map((k) => [k, example(s.properties[k], k, depth + 1, all)]));
    }
    default: return null;
  }
}

export function curl(op: Op): string {
  let path = op.path;
  for (const p of op.parameters.filter((x) => x.in === 'path')) path = path.replace(`{${p.name}}`, `${p.name.toUpperCase()}`);
  const q = op.parameters.filter((x) => x.in === 'query' && x.required).map((x) => `${x.name}=${encodeURIComponent(String(example(x.schema, x.name)))}`);
  const url = `${API_BASE}${path.replace(/^\/api\/v1/, '')}${q.length ? `?${q.join('&')}` : ''}`;
  const lines = [`curl -X ${op.method} "${url}"`];
  if (!op.public) lines.push(`  -H "x-api-key: $SIAR_API_KEY"`);
  if (op.body) {
    if (op.body.contentType.startsWith('multipart/')) {
      for (const [k, v] of Object.entries(example(op.body.schema, '', 0, true) as Record<string, unknown>)) lines.push(`  -F "${k}=${v}"`);
    } else {
      lines.push(`  -H "content-type: application/json"`);
      lines.push(`  -d '${JSON.stringify(example(op.body.schema), null, 2).replace(/\n/g, '\n  ')}'`);
    }
  }
  return lines.join(' \\\n');
}

export const OP_COUNT = () => operations().length;
