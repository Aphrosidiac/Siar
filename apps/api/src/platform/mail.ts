import nodemailer from 'nodemailer';
import { config } from './config.js';
import type { Db } from './db.js';
import { prisma } from './db.js';
import { logger } from './logger.js';

export interface MailBody { to: string; subject: string; heading: string; paragraphs: string[]; cta?: { label: string; url: string }; footnote?: string }

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

/** Siar transactional email: neutral product look (not FF's palette), table layout, inline styles. */
export function renderMail(m: MailBody) {
  const cta = m.cta ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 4px"><tr><td style="background:#111827;border-radius:8px"><a href="${esc(m.cta.url)}" style="display:inline-block;padding:12px 22px;font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none">${esc(m.cta.label)} &rarr;</a></td></tr></table>` : '';
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:#F4F5F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#111827">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F5F7"><tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px">
<tr><td style="padding-bottom:28px;font-size:20px;font-weight:700;letter-spacing:-.02em;color:#111827">Siar</td></tr>
<tr><td style="background:#FFFFFF;border:1px solid #E5E7EB;border-radius:12px;padding:36px 32px">
<h1 style="margin:0 0 16px;font-size:24px;line-height:1.2;font-weight:600;letter-spacing:-.02em">${esc(m.heading)}</h1>
${m.paragraphs.map(p => `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151">${esc(p)}</p>`).join('')}
${cta}
${m.footnote ? `<p style="margin:22px 0 0;font-size:12px;line-height:1.6;color:#6B7280">${esc(m.footnote)}</p>` : ''}
</td></tr>
<tr><td style="padding:24px 4px 0;font-size:11px;line-height:1.7;color:#6B7280">Siar by FF DEV STUDIO (202603234793) &middot; ffdev.studio</td></tr>
</table></td></tr></table></body></html>`;
  const text = [m.heading, '', ...m.paragraphs, m.cta ? `\n${m.cta.label}: ${m.cta.url}` : '', m.footnote ?? '', '', 'Siar by FF DEV STUDIO (202603234793)'].join('\n');
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
    try { await t.sendMail({ from: config.MAIL_FROM, to: r.to, subject: r.subject, html: r.html, text: r.text }); }
    catch (err) { logger.error({ err, to: r.to }, 'mail failed'); await prisma.emailOutbox.update({ where: { id: r.id }, data: { status: 'FAILED', error: String((err as Error).message).slice(0, 500) } }); }
  }
  return rows.length;
}
