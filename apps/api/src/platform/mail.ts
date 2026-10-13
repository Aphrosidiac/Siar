import nodemailer from 'nodemailer';
import { appUrl, config, siteUrl } from './config.js';
import type { Db } from './db.js';
import { prisma } from './db.js';
import { logger } from './logger.js';

/** Where replies and help requests go. The sender stays MAIL_FROM (the domain the mail provider signs for). */
const SUPPORT_EMAIL = 'siaran@ffdev.studio';

export interface MailBody {
  to: string;
  subject: string;
  heading: string;
  paragraphs: string[];
  cta?: { label: string; url: string };
  footnote?: string;
  /** Mono eyebrow above the heading, like the dashboard's "/ SECTION" heads. */
  kicker?: string;
  /** Inbox preview line (hidden in the body). Defaults to the first paragraph. */
  preheader?: string;
  /** Ruled label/value rows (amounts, dates, plans, who invited you). */
  details?: [string, string][];
  /** Numbered next steps. */
  steps?: [string, string][];
  /** Mark the eyebrow as needing attention (failed payment, security). */
  alert?: boolean;
  /** Why this person got the email, shown in the footer. */
  reason?: string;
}

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

// Colours chosen to survive mail apps that force a dark mode by inverting: a near-white page and white
// card invert to neutral darks, the ink button and band stay ink, and the logo is a self-contained ink tile.
const C = { page: '#F3EFE4', card: '#FFFFFF', panel: '#F8F6F0', line: '#E7E2D6', ink: '#0B0B0A', paper: '#F3EFE4', text: '#0B0B0A', body: '#3B3A37', muted: '#6F6C64', faint: '#9A968C', alert: '#D8452E' };
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,Arial,sans-serif";
const MONO = "'SF Mono',Menlo,Consolas,'Liberation Mono',monospace";

/**
 * Siar transactional email: the product's cream-and-ink language, table layout, inline styles.
 * A card on cream: the broadcast art (or, for an alert, a compact ink bar) on top, a pill eyebrow, a
 * display heading, the copy, a full-width ink button, ruled details in a soft panel, then a centred
 * sign-off. Art lives at siaran.my/email/ (scripts/email/hero.ts renders it).
 */
export function renderMail(m: MailBody) {
  const pre = m.preheader ?? m.paragraphs[0] ?? '';
  const dot = (c: string) => `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${c};margin-right:8px;vertical-align:1px"></span>`;
  const kicker = m.kicker
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px"><tr><td class="pill" style="border:1px solid ${C.line};border-radius:999px;padding:5px 12px;font-family:${MONO};font-size:11px;line-height:14px;letter-spacing:.1em;text-transform:uppercase;color:${C.muted};white-space:nowrap">${m.alert ? dot(C.alert) : ''}${esc(m.kicker)}</td></tr></table>`
    : '';
  const paragraphs = m.paragraphs.map(p => `<p class="b" style="margin:0 0 14px;font-size:16px;line-height:26px;color:${C.body}">${esc(p)}</p>`).join('');
  const details = m.details?.length
    ? `<table role="presentation" class="panel" width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0 0;background:${C.panel};border-radius:14px"><tr><td style="padding:4px 20px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${m.details.map(([k, v], i) => `<tr><td class="m ln" style="padding:13px 16px 13px 0;${i ? `border-top:1px solid ${C.line};` : ''}font-family:${MONO};font-size:11px;line-height:18px;letter-spacing:.08em;text-transform:uppercase;color:${C.muted};white-space:nowrap;vertical-align:top">${esc(k)}</td><td class="t ln" align="right" style="padding:13px 0;${i ? `border-top:1px solid ${C.line};` : ''}font-size:15px;line-height:20px;color:${C.text};font-weight:600;word-break:break-word">${esc(v)}</td></tr>`).join('')}</table>
</td></tr></table>`
    : '';
  const steps = m.steps?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0 0">${m.steps.map(([t, d], i) => `<tr><td style="padding:0 14px ${i === m.steps!.length - 1 ? 0 : 18}px 0;vertical-align:top;width:28px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td class="num" align="center" style="width:28px;height:28px;border-radius:50%;background:${C.ink};font-family:${MONO};font-size:12px;line-height:28px;font-weight:600;color:${C.paper}">${i + 1}</td></tr></table></td><td style="padding:3px 0 ${i === m.steps!.length - 1 ? 0 : 18}px;vertical-align:top"><p class="t" style="margin:0;font-size:15px;line-height:22px;font-weight:600;color:${C.text}">${esc(t)}</p><p class="m" style="margin:2px 0 0;font-size:14px;line-height:21px;color:${C.muted}">${esc(d)}</p></td></tr>`).join('')}</table>`
    : '';
  const cta = m.cta
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0"><tr><td class="btn" align="center" style="border-radius:14px;background:${C.ink}"><a class="btnt" href="${esc(m.cta.url)}" style="display:block;padding:17px 24px;font-family:${FONT};font-size:16px;line-height:20px;font-weight:600;color:${C.paper};text-decoration:none;border-radius:14px;text-align:center">${esc(m.cta.label)}&nbsp;&nbsp;&rarr;</a></td></tr></table>
<p class="m" style="margin:14px 0 0;font-size:12px;line-height:18px;color:${C.faint};text-align:center">Or paste this link into your browser:<br><a class="b" href="${esc(m.cta.url)}" style="font-family:${MONO};font-size:11px;color:${C.muted};word-break:break-all;text-decoration:underline">${esc(m.cta.url)}</a></p>`
    : '';
  const footnote = m.footnote ? `<p class="m ln" style="margin:30px 0 0;padding-top:20px;border-top:1px solid ${C.line};font-size:13px;line-height:20px;color:${C.muted}">${esc(m.footnote)}</p>` : '';
  const link = (href: string, label: string) => `<a class="m" href="${esc(href)}" style="color:${C.muted};text-decoration:none">${label}</a>`;
  const help = SUPPORT_EMAIL;
  const top = m.alert
    ? `<tr><td class="bar" style="background:${C.ink};border-radius:20px 20px 0 0;padding:18px 28px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:middle"><img src="${esc(siteUrl('/email/mark.png'))}" width="28" height="28" alt="Siar" style="display:block;border:0;border-radius:7px"></td><td style="vertical-align:middle;padding-left:10px;font-size:18px;line-height:20px;font-weight:700;letter-spacing:-.03em;color:${C.paper}">siar</td></tr></table></td></tr>`
    : `<tr><td style="line-height:0;font-size:0;border-radius:20px 20px 0 0;background:${C.ink}"><a href="${esc(siteUrl())}" style="text-decoration:none"><img src="${esc(siteUrl('/email/hero.png'))}" width="600" alt="Siar: one post, fifteen networks" style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:20px 20px 0 0;color:${C.paper};font-family:${FONT};font-size:14px"></a></td></tr>`;

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>${esc(m.subject)}</title>
<style>
@media (prefers-color-scheme: dark) {
  .bg { background:#0E0E0D !important; } .card { background:#171715 !important; } .panel { background:#1F1F1C !important; }
  .t { color:#F3EFE4 !important; } .b { color:#CFCBC0 !important; } .m { color:#A19D92 !important; }
  .ln { border-color:#2A2A27 !important; } .pill { border-color:#34332F !important; }
  .btn { background:#F3EFE4 !important; } .btnt { color:#0B0B0A !important; } .num { background:#F3EFE4 !important; color:#0B0B0A !important; }
}
@media (max-width: 600px) { .pad { padding:30px 24px 30px !important; } .h1 { font-size:28px !important; line-height:32px !important; } }
</style></head>
<body class="bg" style="margin:0;padding:0;background:${C.page};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(pre)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" class="bg" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page};font-family:${FONT}"><tr><td align="center" style="padding:32px 12px 40px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">

<tr><td><table role="presentation" class="card" width="100%" cellpadding="0" cellspacing="0" style="background:${C.card};border-radius:20px">
${top}
<tr><td class="pad" style="padding:40px 48px 44px">
${kicker}
<h1 class="h1 t" style="margin:0 0 16px;font-size:34px;line-height:38px;font-weight:700;letter-spacing:-.04em;color:${C.text}">${esc(m.heading)}</h1>
<div class="b">${paragraphs}</div>
${cta}${details}${steps}${footnote}
</td></tr>
</table></td></tr>

<tr><td align="center" style="padding:32px 16px 0">
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:middle"><a href="${esc(siteUrl())}" style="text-decoration:none"><img src="${esc(siteUrl('/email/mark.png'))}" width="24" height="24" alt="Siar" style="display:block;border:0;border-radius:6px"></a></td><td class="t" style="vertical-align:middle;padding-left:8px;font-size:16px;line-height:18px;font-weight:700;letter-spacing:-.03em;color:${C.text}">siar</td></tr></table>
<p class="t" style="margin:12px 0 0;font-size:14px;line-height:20px;font-weight:600;letter-spacing:-.01em;color:${C.text}">Write it once. Siar it everywhere.</p>
<p class="m" style="margin:14px 0 0;font-size:12px;line-height:20px;color:${C.muted}">${link(appUrl(), 'Dashboard')} &nbsp;&middot;&nbsp; ${link(siteUrl('/docs'), 'Docs')} &nbsp;&middot;&nbsp; ${link(siteUrl('/pricing'), 'Pricing')} &nbsp;&middot;&nbsp; ${link(`mailto:${help}`, 'Help')}</p>
<p class="m" style="margin:14px 0 0;font-size:12px;line-height:18px;color:${C.faint};max-width:440px">${esc(m.reason ?? 'You received this email because of your Siar account.')}<br>Siar by FF Dev Studio &middot; FF DEV STUDIO (202603234793), Malaysia</p>
</td></tr>

</table></td></tr></table></body></html>`;

  const rule = '—'.repeat(32);
  const text = [
    'siar', '', ...(m.kicker ? [`/ ${m.kicker.toUpperCase()}`, ''] : []), m.heading, '', ...m.paragraphs.flatMap(p => [p, '']),
    ...(m.details?.length ? [rule, ...m.details.map(([k, v]) => `${k}: ${v}`), rule, ''] : []),
    ...(m.cta ? [`${m.cta.label}: ${m.cta.url}`, ''] : []),
    ...(m.steps?.length ? [...m.steps.map(([t, d], i) => `${String(i + 1).padStart(2, '0')}  ${t} — ${d}`), ''] : []),
    ...(m.footnote ? [m.footnote, ''] : []),
    rule, 'Write it once. Siar it everywhere.', `${appUrl()} · ${siteUrl('/docs')} · ${help}`,
    m.reason ?? 'You received this email because of your Siar account.', 'Siar by FF Dev Studio · FF DEV STUDIO (202603234793), Malaysia',
  ].join('\n');
  return { html, text };
}

export async function queueMail(db: Db, m: MailBody) {
  const { html, text } = renderMail(m);
  return db.emailOutbox.create({ data: { to: m.to, subject: m.subject, html, text } });
}

let transport: nodemailer.Transporter | null = null;
const getTransport = () => (transport ??= config.SMTP_URL ? nodemailer.createTransport(config.SMTP_URL) : null);

/** Deliver queued mail. Without SMTP_URL mail is marked LOGGED and printed (dev). */
export async function flushOutbox(limit = 25) {
  const rows = await prisma.emailOutbox.findMany({ where: { status: 'QUEUED' }, orderBy: { createdAt: 'asc' }, take: limit });
  const t = getTransport();
  for (const r of rows) {
    const claimed = await prisma.emailOutbox.updateMany({ where: { id: r.id, status: 'QUEUED' }, data: { status: t ? 'SENT' : 'LOGGED', sentAt: new Date() } });
    if (!claimed.count) continue;
    if (!t) { logger.info({ to: r.to, subject: r.subject }, `mail (not sent, no SMTP_URL)\n${r.text}`); continue; }
    try { await t.sendMail({ from: config.MAIL_FROM, replyTo: SUPPORT_EMAIL, to: r.to, subject: r.subject, html: r.html, text: r.text }); }
    catch (err) { logger.error({ err, to: r.to }, 'mail failed'); await prisma.emailOutbox.update({ where: { id: r.id }, data: { status: 'FAILED', error: String((err as Error).message).slice(0, 500) } }); }
  }
  return rows.length;
}
