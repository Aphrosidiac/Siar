/**
 * Final Meta App Review films: review/out/<film>.mp4 + parts  →  review/final/<film>.mp4
 *
 *   node scripts/meta-review/assemble.mjs [film…]     (no names: every film in ASSEMBLY)
 *
 * Meta's screen-recording guide asks every recording to start logged out and show the sign-in, and to show the
 * business login and the grant for each permission. Each final film is: the film's own title card (its first
 * 3.5 s), the Siar sign-in (S0), the consent take for its login where the film has none of its own, the film
 * body, then any extra takes (an unsend, the comment auto-reply). Parts are edited with `edit.mjs <part> --part`.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const ROOT = new URL('../../', import.meta.url).pathname;
const OUT = `${ROOT}review/out/`, FINAL = `${ROOT}review/final/`;
const TITLE = 3.5;

// film → { before: parts after the title card and before the body, after: parts after the body }
export const ASSEMBLY = {
  F1: { before: ['S0', 'CFB'] },
  F2: { before: ['S0'] },
  F3: { before: ['S0', 'CFB'] },
  F4: { before: ['S0', 'CFB'] },
  F5: { before: ['S0', 'CFB'] },
  F6: { before: ['S0', 'CFB'] },
  F7: { before: ['S0'] },
  F8: { before: ['S0'] },
  I1: { before: ['S0'] },
  I3: { before: ['S0', 'CIG'] },
  I5: { before: ['S0'], after: ['I5U'] },
  G1: { before: ['S0', 'CIGL'] },
  G2: { before: ['S0'], after: ['G2U'] },
  G3: { before: ['S0', 'CIGL'], after: ['G3A'] },
  T1: { before: ['S0'] },
  T2: { before: ['S0', 'CTH'] },
};

const dur = (f) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());

mkdirSync(FINAL, { recursive: true });
const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(ASSEMBLY);
for (const film of names) {
  const plan = ASSEMBLY[film];
  if (!plan) throw new Error(`no assembly for ${film}`);
  const main = `${OUT}${film}.mp4`;
  const parts = [...(plan.before ?? []), ...(plan.after ?? [])].map((p) => `${OUT}${p}.mp4`);
  const inputs = [main, ...parts].flatMap((f) => ['-i', f]);
  const nb = (plan.before ?? []).length;
  // [0] title card, [1..nb] before parts, [0] body, [nb+1..] after parts
  const g = [
    `[0:v]trim=0:${TITLE},setpts=PTS-STARTPTS[title]`,
    `[0:v]trim=start=${TITLE},setpts=PTS-STARTPTS[body]`,
    ...parts.map((_, i) => `[${i + 1}:v]setpts=PTS-STARTPTS,fps=30,format=yuv420p,setsar=1[p${i}]`),
  ];
  const order = ['[title]', ...parts.slice(0, nb).map((_, i) => `[p${i}]`), '[body]', ...parts.slice(nb).map((_, i) => `[p${nb + i}]`)];
  g.push(`${order.join('')}concat=n=${order.length}:v=1:a=0,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv[v]`);
  execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...inputs, '-filter_complex', g.join(';'), '-map', '[v]',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv',
    '-movflags', '+faststart', `${FINAL}${film}.mp4`]);
  console.log(`${film}: ${[film, ...parts.map((p) => p.split('/').pop().replace('.mp4', ''))].join(' + ')} → ${dur(`${FINAL}${film}.mp4`).toFixed(1)}s`);
}
