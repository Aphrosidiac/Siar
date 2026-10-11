import type { FastifyInstance } from 'fastify';
import { prisma } from '../platform/db.js';
import { badRequest, conflict, notFound } from '../platform/errors.js';
import { listOf, pageOf } from '../platform/http.js';
import { define } from '../platform/routes.js';
import type { Actor } from '../platform/auth.js';
import { teamOf } from './teams.js';

/** Link-in-bio: one page per team, public at /b/<slug>, views and clicks counted per day. */

const RESERVED = new Set(['admin', 'api', 'app', 'www', 'siar', 'login', 'signup', 'settings', 'help', 'docs', 'about', 'b', 'static', 'media']);
const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null);
const TYPES = ['LINK', 'HEADER', 'SOCIAL', 'TEXT'];

function checkSlug(slug: string) {
  if (!/^[a-z0-9](?:[a-z0-9-]{1,38})[a-z0-9]$/.test(slug)) throw badRequest('Slug must be 3–40 characters: lowercase letters, numbers and dashes.', [{ code: 'invalid', message: 'Invalid slug', path: ['slug'] }]);
  if (RESERVED.has(slug)) throw badRequest('That slug is reserved.', [{ code: 'reserved', message: 'Reserved', path: ['slug'] }]);
}
function checkUrl(url: unknown, path = 'url') {
  if (url == null || url === '') return;
  try { const u = new URL(String(url)); if (!/^https?:$/.test(u.protocol)) throw 0; } catch { throw badRequest('URL must start with http:// or https://', [{ code: 'invalid', message: 'Invalid URL', path: [path] }]); }
}

const item = (i: any, clicks = 0) => ({ id: i.id, bioId: i.bioId, type: i.type, title: i.title, url: i.url, icon: i.icon, position: i.position, active: i.active, clicks });
async function out(b: any) {
  const items = b.items ?? (await prisma.bioItem.findMany({ where: { bioId: b.id }, orderBy: { position: 'asc' } }));
  const clicks = await prisma.bioEvent.groupBy({ by: ['itemId'], where: { bioId: b.id, kind: 'CLICK' }, _count: true });
  const n = new Map(clicks.map(c => [c.itemId, c._count]));
  return { id: b.id, teamId: b.teamId, slug: b.slug, title: b.title, description: b.description, avatarUrl: b.avatarUrl, theme: b.theme ?? {}, published: b.published, items: items.map((i: any) => item(i, n.get(i.id) ?? 0)), createdAt: iso(b.createdAt), updatedAt: iso(b.updatedAt) };
}
async function bioOf(actor: Actor, id: string) {
  const b = await prisma.bio.findFirst({ where: { id, deletedAt: null, team: { organizationId: actor.organizationId } }, include: { items: { orderBy: { position: 'asc' } } } });
  if (!b) throw notFound('Bio page');
  return b;
}
async function itemOf(actor: Actor, id: string) {
  const i = await prisma.bioItem.findFirst({ where: { id, bio: { deletedAt: null, team: { organizationId: actor.organizationId } } } });
  if (!i) throw notFound('Bio item');
  return i;
}

define({
  'bio.list': async ({ actor, query }) => {
    const p = pageOf(query);
    const where = { deletedAt: null, team: { organizationId: actor.organizationId, deletedAt: null }, ...(query.teamId ? { teamId: query.teamId } : {}) };
    const [rows, total] = await Promise.all([prisma.bio.findMany({ where, include: { items: { orderBy: { position: 'asc' } } }, orderBy: { createdAt: 'asc' }, ...p }), prisma.bio.count({ where })]);
    return listOf(await Promise.all(rows.map(out)), total);
  },
  'bio.create': async ({ actor, body }) => {
    await teamOf(actor, body.teamId);
    const slug = String(body.slug).toLowerCase(); checkSlug(slug); checkUrl(body.avatarUrl, 'avatarUrl');
    if (await prisma.bio.findFirst({ where: { teamId: body.teamId, deletedAt: null } })) throw conflict('This team already has a bio page.');
    if (await prisma.bio.findUnique({ where: { slug } })) throw conflict('That slug is taken.');
    await prisma.bio.deleteMany({ where: { teamId: body.teamId, deletedAt: { not: null } } });
    return out(await prisma.bio.create({ data: { teamId: body.teamId, slug, title: body.title, description: body.description ?? null, avatarUrl: body.avatarUrl ?? null, theme: body.theme ?? {} } }));
  },
  'bio.get': async ({ actor, params }) => out(await bioOf(actor, params.id)),
  'bio.update': async ({ actor, params, body }) => {
    const b = await bioOf(actor, params.id);
    const data: Record<string, unknown> = {};
    if ('slug' in body) { const s = String(body.slug).toLowerCase(); checkSlug(s); if (s !== b.slug && (await prisma.bio.findUnique({ where: { slug: s } }))) throw conflict('That slug is taken.'); data.slug = s; }
    for (const k of ['title', 'description', 'avatarUrl', 'theme', 'published']) if (k in body) data[k] = body[k];
    checkUrl(body.avatarUrl, 'avatarUrl');
    return out(await prisma.bio.update({ where: { id: b.id }, data, include: { items: { orderBy: { position: 'asc' } } } }));
  },
  'bio.delete': async ({ actor, params }) => {
    const b = await bioOf(actor, params.id);
    await prisma.bio.update({ where: { id: b.id }, data: { deletedAt: new Date(), published: false, slug: `${b.slug}--deleted-${Date.now()}` } });
    return { success: true };
  },
  'bioItem.create': async ({ actor, body }) => {
    const b = await bioOf(actor, body.bioId);
    if (!TYPES.includes(body.type)) throw badRequest('Unknown item type.');
    if (body.type === 'LINK' || body.type === 'SOCIAL') { if (!body.url) throw badRequest('url is required for links.', [{ code: 'required', message: 'Required', path: ['url'] }]); checkUrl(body.url); }
    const pos = (await prisma.bioItem.aggregate({ where: { bioId: b.id }, _max: { position: true } }))._max.position ?? -1;
    return item(await prisma.bioItem.create({ data: { bioId: b.id, type: body.type, title: body.title, url: body.url ?? null, icon: body.icon ?? null, position: pos + 1 } }));
  },
  'bioItem.update': async ({ actor, params, body }) => {
    const i = await itemOf(actor, params.id);
    checkUrl(body.url);
    const data: Record<string, unknown> = {};
    for (const k of ['title', 'url', 'icon', 'active']) if (k in body) data[k] = body[k];
    return item(await prisma.bioItem.update({ where: { id: i.id }, data }));
  },
  'bioItem.delete': async ({ actor, params }) => {
    const i = await itemOf(actor, params.id);
    await prisma.bioItem.delete({ where: { id: i.id } });
    return { success: true };
  },
  'bioItem.reorder': async ({ actor, body }) => {
    const b = await bioOf(actor, body.bioId);
    const ids: string[] = body.ids;
    if (ids.length !== b.items.length || !b.items.every(i => ids.includes(i.id))) throw badRequest('ids must list every item of the bio page exactly once.');
    await prisma.$transaction(ids.map((id, position) => prisma.bioItem.update({ where: { id }, data: { position } })));
    return { success: true };
  },
  'bioAnalytics.get': async ({ actor, query }) => {
    const b = await bioOf(actor, query.bioId);
    const to = query.to ? new Date(query.to) : new Date();
    const from = query.from ? new Date(query.from) : new Date(to.getTime() - 30 * 86400_000);
    const ev = await prisma.bioEvent.findMany({ where: { bioId: b.id, createdAt: { gte: from, lte: to } }, select: { kind: true, itemId: true, createdAt: true } });
    const days = new Map<string, { views: number; clicks: number }>();
    for (let d = new Date(from); d <= to; d = new Date(d.getTime() + 86400_000)) days.set(d.toISOString().slice(0, 10), { views: 0, clicks: 0 });
    const perItem = new Map<string, number>();
    for (const e of ev) {
      const k = e.createdAt.toISOString().slice(0, 10); const v = days.get(k) ?? { views: 0, clicks: 0 };
      if (e.kind === 'VIEW') v.views++; else { v.clicks++; if (e.itemId) perItem.set(e.itemId, (perItem.get(e.itemId) ?? 0) + 1); }
      days.set(k, v);
    }
    return {
      views: ev.filter(e => e.kind === 'VIEW').length, clicks: ev.filter(e => e.kind === 'CLICK').length,
      days: [...days].map(([day, v]) => ({ day, ...v })),
      items: b.items.map(i => ({ itemId: i.id, title: i.title, clicks: perItem.get(i.id) ?? 0 })),
    };
  },
});

const esc = (s: string | null | undefined) => (s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

/** Public page: neutral theme (light/dark), mobile-first, no tracking beyond our own view/click counts. */
function page(b: any, items: any[]) {
  const accent = /^#[0-9a-f]{6}$/i.test(b.theme?.accent ?? '') ? b.theme.accent : '#4F46E5';
  const rows = items.map(i => i.type === 'HEADER'
    ? `<h2>${esc(i.title)}</h2>`
    : i.type === 'TEXT' ? `<p class="t">${esc(i.title)}</p>`
    : `<a class="l" href="/b/${esc(b.slug)}/go/${esc(i.id)}" rel="noopener">${esc(i.title)}</a>`).join('\n');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(b.title)}</title><meta name="description" content="${esc(b.description ?? b.title)}"><meta property="og:title" content="${esc(b.title)}">${b.avatarUrl ? `<meta property="og:image" content="${esc(b.avatarUrl)}">` : ''}
<style>:root{--bg:#fff;--fg:#111827;--mute:#6B7280;--line:#E5E7EB;--card:#F9FAFB;--a:${accent}}@media(prefers-color-scheme:dark){:root{--bg:#0B0F19;--fg:#F3F4F6;--mute:#9CA3AF;--line:#1F2937;--card:#111827}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
main{max-width:560px;margin:0 auto;padding:48px 16px 64px;text-align:center}img{width:88px;height:88px;border-radius:50%;object-fit:cover;border:1px solid var(--line)}
h1{font-size:22px;margin:16px 0 4px}p.d{color:var(--mute);margin:0 0 28px}h2{font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--mute);margin:28px 0 10px}
a.l{display:block;padding:14px 16px;margin:10px 0;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--fg);text-decoration:none;font-weight:600}
a.l:hover,a.l:focus-visible{border-color:var(--a);outline:none}p.t{color:var(--mute)}footer{margin-top:40px;font-size:12px;color:var(--mute)}footer a{color:var(--mute)}</style></head>
<body><main>${b.avatarUrl ? `<img src="${esc(b.avatarUrl)}" alt="">` : ''}<h1>${esc(b.title)}</h1>${b.description ? `<p class="d">${esc(b.description)}</p>` : ''}
${rows}<footer>Made with <a href="https://siar.dev">Siar</a></footer></main></body></html>`;
}

export async function bioRawRoutes(app: FastifyInstance) {
  const live = (slug: string) => prisma.bio.findFirst({ where: { slug: slug.toLowerCase(), published: true, deletedAt: null, team: { deletedAt: null } }, include: { items: { where: { active: true }, orderBy: { position: 'asc' } } } });
  app.get('/b/:slug', async (req: any, reply) => {
    const b = await live(String(req.params.slug));
    if (!b) return reply.status(404).type('text/html').send('<!doctype html><title>Not found</title><p style="font-family:system-ui;padding:40px">This page does not exist.</p>');
    void prisma.bioEvent.create({ data: { bioId: b.id, kind: 'VIEW', referrer: String(req.headers.referer ?? '').slice(0, 300) || null, country: (req.headers['cf-ipcountry'] as string) ?? null } }).catch(() => undefined);
    return reply.header('cache-control', 'public, max-age=60').type('text/html').send(page(b, b.items));
  });
  app.get('/b/:slug/go/:itemId', async (req: any, reply) => {
    const b = await live(String(req.params.slug));
    const i = b?.items.find(x => x.id === req.params.itemId);
    if (!b || !i?.url || !/^https?:\/\//i.test(i.url)) return reply.status(404).send({ statusCode: 404, message: 'Link not found.' });
    void prisma.bioEvent.create({ data: { bioId: b.id, kind: 'CLICK', itemId: i.id, country: (req.headers['cf-ipcountry'] as string) ?? null } }).catch(() => undefined);
    return reply.redirect(i.url, 302);
  });
}
