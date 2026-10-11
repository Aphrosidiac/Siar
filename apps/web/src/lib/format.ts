/** Formatting and timezone helpers. All instants travel as ISO-8601 UTC; display is in the user's timezone. */
export const browserTz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch { return 'UTC'; } };

const dtf = new Map<string, Intl.DateTimeFormat>();
function fmt(tz: string, opts: Intl.DateTimeFormatOptions) {
  const k = tz + JSON.stringify(opts);
  let f = dtf.get(k);
  if (!f) { f = new Intl.DateTimeFormat('en-GB', { timeZone: tz, ...opts }); dtf.set(k, f); }
  return f;
}

export function formatDate(iso: string | null | undefined, tz = browserTz()) {
  if (!iso) return '—';
  return fmt(tz, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
}
export function formatDateTime(iso: string | null | undefined, tz = browserTz()) {
  if (!iso) return '—';
  return fmt(tz, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso));
}
export function formatTime(iso: string | null | undefined, tz = browserTz()) {
  if (!iso) return '';
  return fmt(tz, { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso));
}
export function relative(iso: string | null | undefined) {
  if (!iso) return '—';
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  const a = Math.abs(s);
  const r = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (a < 60) return r.format(-Math.round(s), 'second');
  if (a < 3600) return r.format(-Math.round(s / 60), 'minute');
  if (a < 86400) return r.format(-Math.round(s / 3600), 'hour');
  if (a < 86400 * 30) return r.format(-Math.round(s / 86400), 'day');
  return formatDate(iso);
}

/** Wall-clock parts of an instant in a timezone. */
export function zonedParts(date: Date, tz: string) {
  const p = Object.fromEntries(fmt(tz, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(date).map((x) => [x.type, x.value]));
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour % 24, min: +p.minute, s: +p.second };
}
const offsetMs = (date: Date, tz: string) => {
  const z = zonedParts(date, tz);
  return Date.UTC(z.y, z.m - 1, z.d, z.h, z.min, z.s) - Math.floor(date.getTime() / 1000) * 1000;
};
/** Wall time in `tz` → UTC Date (DST-safe: re-checks the offset once). */
export function fromZoned(y: number, m: number, d: number, h: number, min: number, tz: string) {
  const guess = Date.UTC(y, m - 1, d, h, min);
  let t = guess - offsetMs(new Date(guess), tz);
  const o2 = offsetMs(new Date(t), tz);
  t = guess - o2;
  return new Date(t);
}
export const pad = (x: number) => String(x).padStart(2, '0');
/** 'YYYY-MM-DD' of an instant in tz. */
export function dayKey(date: Date, tz: string) { const z = zonedParts(date, tz); return `${z.y}-${pad(z.m)}-${pad(z.d)}`; }

export function formatBytes(n: number | null | undefined) {
  if (n === null || n === undefined) return '—';
  if (n < 1024) return `${n} B`;
  const u = ['KB', 'MB', 'GB', 'TB']; let i = -1; let v = n;
  do { v /= 1024; i++; } while (v >= 1024 && i < u.length - 1);
  return `${v.toFixed(v < 10 ? 1 : 0)} ${u[i]}`;
}
export const formatNumber = (n: number | null | undefined) => (n === null || n === undefined ? '—' : new Intl.NumberFormat('en').format(n));
export const compactNumber = (n: number) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
export const usd = (cents: number, currency = 'usd') => new Intl.NumberFormat('en', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
/** micro-USD → "$0.015" (keeps sub-cent precision). */
export const usdMicros = (m: number) => {
  const v = m / 1_000_000;
  return new Intl.NumberFormat('en', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: Math.abs(v) < 1 ? 3 : 2 }).format(v);
};
export const duration = (secs: number | null | undefined) => {
  if (!secs && secs !== 0) return '';
  const s = Math.round(secs); return `${Math.floor(s / 60)}:${pad(s % 60)}`;
};
export const fullName = (u: { firstName?: string | null; lastName?: string | null; email?: string } | null | undefined) =>
  u ? [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || '' : '';
export const initials = (s: string) => s.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('') || '?';
export const humanize = (s: string) => s.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').replace(/^\w/, (c) => c.toUpperCase()).replace(/\b(Url|Id)\b/g, (m) => m.toUpperCase());

export function copyText(text: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select();
  try { document.execCommand('copy'); } finally { t.remove(); }
  return Promise.resolve();
}

/** Download a text file from memory. */
export function downloadText(name: string, text: string, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const TIMEZONES: string[] = (() => { try { return (Intl as any).supportedValuesOf('timeZone') as string[]; } catch { return ['UTC', 'Asia/Kuala_Lumpur', 'Europe/London', 'America/New_York']; } })();

/** "@name" without doubling an @ the network already put in the username. */
export const handle = (u: string | null | undefined) => (u ? (u.startsWith('@') ? u : `@${u}`) : '');
