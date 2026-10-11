import nodemailer from 'nodemailer';
import { appUrl, config, siteUrl } from './config.js';
import type { Db } from './db.js';
import { prisma } from './db.js';
import { logger } from './logger.js';

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
const C = { page: '#F6F4EE', card: '#FFFFFF', line: '#E7E2D6', ink: '#0B0B0A', paper: '#F3EFE4', text: '#0B0B0A', body: '#3B3A37', muted: '#6F6C64', faint: '#9A968C', alert: '#D8452E' };
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,Arial,sans-serif";
const MONO = "'SF Mono',Menlo,Consolas,'Liberation Mono',monospace";

/** Siar transactional email: the product's cream-and-ink language, table layout, inline styles. */
export function renderMail(m: MailBody) {
  const pre = m.preheader ?? m.paragraphs[0] ?? '';
  const kicker = m.kicker
    ? `<p style="margin:0 0 18px;font-family:${MONO};font-size:11px;line-height:16px;letter-spacing:.12em;text-transform:uppercase;color:${C.muted}">${m.alert ? `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${C.alert};margin-right:8px;vertical-align:1px"></span>` : ''}/ ${esc(m.kicker)}</p>`
    : '';
  const paragraphs = m.paragraphs.map(p => `<p class="b" style="margin:0 0 14px;font-size:16px;line-height:26px;color:${C.body}">${esc(p)}</p>`).join('');
  const details = m.details?.length
    ? `<table role="presentation" class="lk" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 6px;border-top:1px solid ${C.ink}">${m.details.map(([k, v]) => `<tr><td class="m ln" style="padding:12px 16px 12px 0;border-bottom:1px solid ${C.line};font-family:${MONO};font-size:11px;line-height:18px;letter-spacing:.08em;text-transform:uppercase;color:${C.muted};white-space:nowrap;vertical-align:top">${esc(k)}</td><td class="t ln" align="right" style="padding:12px 0;border-bottom:1px solid ${C.line};font-size:15px;line-height:20px;color:${C.text};font-weight:500">${esc(v)}</td></tr>`).join('')}</table>`
    : '';
  const steps = m.steps?.length
    ? `<table role="presentation" class="lk" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 4px;border-top:1px solid ${C.ink}">${m.steps.map(([t, d], i) => `<tr><td class="m ln" style="padding:14px 14px 14px 0;border-bottom:1px solid ${C.line};font-family:${MONO};font-size:12px;line-height:20px;color:${C.faint};vertical-align:top;width:28px">${String(i + 1).padStart(2, '0')}</td><td class="ln" style="padding:14px 0;border-bottom:1px solid ${C.line}"><p class="t" style="margin:0;font-size:15px;line-height:20px;font-weight:600;color:${C.text}">${esc(t)}</p><p class="m" style="margin:3px 0 0;font-size:14px;line-height:21px;color:${C.muted}">${esc(d)}</p></td></tr>`).join('')}</table>`
    : '';
  const cta = m.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 0"><tr><td class="btn" style="border-radius:999px;background:${C.ink};border:1px solid ${C.ink}"><a class="btnt" href="${esc(m.cta.url)}" style="display:inline-block;padding:14px 28px;font-family:${FONT};font-size:15px;line-height:18px;font-weight:600;color:${C.paper};text-decoration:none;border-radius:999px">${esc(m.cta.label)}&nbsp;&nbsp;&rarr;</a></td></tr></table>
<p class="m" style="margin:18px 0 0;font-size:12px;line-height:18px;color:${C.muted}">Button not working? Paste this link into your browser:<br><a class="b" href="${esc(m.cta.url)}" style="font-family:${MONO};font-size:12px;color:${C.body};word-break:break-all;text-decoration:underline">${esc(m.cta.url)}</a></p>`
    : '';
  const footnote = m.footnote ? `<p class="m" style="margin:24px 0 0;font-size:13px;line-height:20px;color:${C.muted}">${esc(m.footnote)}</p>` : '';
  const link = (href: string, label: string) => `<a class="b" href="${esc(href)}" style="color:${C.body};text-decoration:none">${label}</a>`;
  const help = 'hello@siaran.my';

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>${esc(m.subject)}</title>
<style>
@media (prefers-color-scheme: dark) {
  .bg { background:#0E0E0D !important; } .card { background:#171715 !important; border-color:#2A2A27 !important; }
  .t { color:#F3EFE4 !important; } .b { color:#CFCBC0 !important; } .m { color:#A19D92 !important; }
  .ln { border-color:#2A2A27 !important; } .lk { border-color:#6F6C64 !important; }
  .btn { background:#F3EFE4 !important; border-color:#F3EFE4 !important; } .btnt { color:#0B0B0A !important; }
  .band { background:#000000 !important; box-shadow: inset 0 0 0 1px #2A2A27; }
}
@media (max-width: 600px) { .pad { padding:28px 22px !important; } .h1 { font-size:26px !important; line-height:30px !important; } }
</style></head>
<body class="bg" style="margin:0;padding:0;background:${C.page};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(pre)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" class="bg" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page};font-family:${FONT}"><tr><td align="center" style="padding:36px 14px 44px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px">

<tr><td style="padding:0 6px 22px"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="vertical-align:middle"><a href="${esc(siteUrl())}" style="text-decoration:none"><img src="${esc(siteUrl('/email/mark.png'))}" width="36" height="36" alt="Siar" style="display:block;border:0;border-radius:9px"></a></td>
<td class="t" style="vertical-align:middle;padding-left:10px;font-size:21px;line-height:24px;font-weight:700;letter-spacing:-.03em;color:${C.text}">siar</td>
</tr></table></td></tr>

<tr><td class="card pad" style="background:${C.card};border:1px solid ${C.line};border-radius:14px;padding:40px 40px 36px">
${kicker}
<h1 class="h1 t" style="margin:0 0 18px;font-size:30px;line-height:34px;font-weight:700;letter-spacing:-.035em;color:${C.text}">${esc(m.heading)}</h1>
<div class="b">${paragraphs}</div>
${details}${cta}${steps}${footnote}
</td></tr>

<tr><td style="padding:12px 0 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td class="band" style="background:${C.ink};border-radius:14px;padding:22px 28px">
<p style="margin:0;font-size:18px;line-height:22px;font-weight:700;letter-spacing:-.03em;color:${C.paper}">Write it once.<br>Siar it everywhere.</p>
<p style="margin:8px 0 0;font-family:${MONO};font-size:11px;line-height:16px;letter-spacing:.08em;text-transform:uppercase;color:#A19D92">One API &middot; 15 networks &middot; one price per organization</p>
</td></tr></table></td></tr>

<tr><td class="m" style="padding:26px 6px 0;font-size:12px;line-height:20px;color:${C.muted}">
<p style="margin:0 0 10px">${link(appUrl(), 'Dashboard')} &nbsp;&middot;&nbsp; ${link(siteUrl('/docs'), 'Docs')} &nbsp;&middot;&nbsp; ${link(siteUrl('/pricing'), 'Pricing')} &nbsp;&middot;&nbsp; ${link(`mailto:${help}`, help)}</p>
<p style="margin:0 0 10px">${esc(m.reason ?? 'You received this email because of your Siar account.')}</p>
<p class="m" style="margin:0;color:${C.faint}">Siar by FF Dev Studio &middot; FF DEV STUDIO (202603234793), Malaysia</p>
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
    try { await t.sendMail({ from: config.MAIL_FROM, replyTo: 'hello@siaran.my', to: r.to, subject: r.subject, html: r.html, text: r.text }); }
    catch (err) { logger.error({ err, to: r.to }, 'mail failed'); await prisma.emailOutbox.update({ where: { id: r.id }, data: { status: 'FAILED', error: String((err as Error).message).slice(0, 500) } }); }
  }
  return rows.length;
}
