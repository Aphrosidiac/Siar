import type { Issue, MediaRef, NetworkLimits } from '../types.js';

type MediaInfo = Pick<MediaRef, 'type' | 'mime' | 'fileSize' | 'width' | 'height' | 'duration'>;

/** Characters as people count them (emoji = 1), which is how most networks count. */
export const charCount = (s: string) => [...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(s)].length;

export function checkText(issues: Issue[], text: unknown, max: number | null, path: (string | number)[], required = false) {
  if (typeof text !== 'string' || !text.trim()) {
    if (required) issues.push({ code: 'required', message: 'Text is required for this network.', path });
    return;
  }
  if (max !== null && charCount(text) > max) issues.push({ code: 'too_long', message: `Text is ${charCount(text)} characters; the limit is ${max}.`, path });
}

export function checkMedia(issues: Issue[], media: MediaInfo[], limits: NetworkLimits, path: (string | number)[] = ['uploadIds'], opts: { required?: boolean; types?: ('image' | 'video' | 'document')[] } = {}) {
  const rules = limits.media;
  if (opts.required && media.length === 0) issues.push({ code: 'required', message: 'This post type needs media.', path });
  if (media.length > rules.maxItems) issues.push({ code: 'too_many', message: `At most ${rules.maxItems} media items.`, path });
  media.forEach((m, i) => {
    const p = [...path, i];
    if (opts.types && !opts.types.includes(m.type)) { issues.push({ code: 'type', message: `${m.type} is not allowed here.`, path: p }); return; }
    const r = rules[m.type];
    if (!r) { issues.push({ code: 'type', message: `This network does not accept ${m.type} media.`, path: p }); return; }
    if (r.mimes.length && !r.mimes.includes(m.mime)) issues.push({ code: 'mime', message: `${m.mime} is not supported; use ${r.mimes.join(', ')}.`, path: p });
    if (m.fileSize > r.maxBytes) issues.push({ code: 'too_large', message: `File is ${mb(m.fileSize)}; the limit is ${mb(r.maxBytes)}.`, path: p });
    if (m.type === 'video' && 'maxSeconds' in r && m.duration != null) {
      if (m.duration > r.maxSeconds) issues.push({ code: 'too_long', message: `Video is ${Math.round(m.duration)}s; the limit is ${r.maxSeconds}s.`, path: p });
      if (r.minSeconds && m.duration < r.minSeconds) issues.push({ code: 'too_short', message: `Video is ${Math.round(m.duration)}s; the minimum is ${r.minSeconds}s.`, path: p });
    }
  });
}

const mb = (b: number) => `${(b / 1024 / 1024).toFixed(b < 10 * 1024 * 1024 ? 1 : 0)} MB`;
export const MB = 1024 * 1024;
export const GB = 1024 * MB;
