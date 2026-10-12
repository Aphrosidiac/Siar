/**
 * Meta App Review film editor: review/raw/<film>.mp4 + <film>.tl  →  review/out/<film>.mp4
 *
 *   node scripts/meta-review/edit.mjs <film>
 *
 * The raw file is the Chrome viewport recorded by rec.sh (2816×1400, 2x). The timeline (.tl) holds
 * "<epoch>\t<text>" lines written by `rec.sh mark|url` while the film was driven:
 *   <caption>        caption shown from here until the next caption
 *   @url <url>       the page address shown in the caption band
 *   @fast <n>        speed up ×n from here (a wait on the network); `@fast 1` ends it
 *   @cut <caption>   drop everything from here to `@cut off` (waiting for a person); the caption runs after
 * Long stills are shortened to 0.9 s, except that every caption stays readable for at least 2.6 s.
 * Output: a 3.5 s title card naming the permissions, then the film at 1920×954 with a 96 px caption band,
 * 30 fps H.264, BT.709, last frame held 1.5 s.
 */
import { chromium } from 'playwright';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const ROOT = new URL('../../', import.meta.url).pathname;
const RAW = `${ROOT}review/raw/`, OUT = `${ROOT}review/out/`, TMP = `${ROOT}review/tmp/`;
const FONTS = `${ROOT}apps/web/public/fonts/`;
const film = process.argv[2];
const meta = JSON.parse(readFileSync(new URL('./films.json', import.meta.url), 'utf8'))[film];
if (!meta) throw new Error(`unknown film ${film}`);
const W = 1920, VH = 954, BAND = 96, H = VH + BAND, FPS = 30, TITLE = 3.5, HOLD = 1.5;
const LATENCY = 0.35; // ffmpeg's first frame lands this long after `rec.sh start` stamps @start
mkdirSync(OUT, { recursive: true }); mkdirSync(TMP, { recursive: true });

// ── timeline ──
const lines = readFileSync(`${RAW}${film}.tl`, 'utf8').trim().split('\n').map((l) => { const i = l.indexOf('\t'); return { e: Number(l.slice(0, i)), text: l.slice(i + 1) }; });
const t0 = lines.find((l) => l.text === '@start').e + LATENCY;
const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', `${RAW}${film}.mp4`]).toString());
const ev = lines.filter((l) => l.text !== '@start' && l.text !== '@stop').map((l) => ({ t: Math.max(0, Math.min(dur, l.e - t0)), text: l.text }));

const captions = [], urls = [], fast = [], cuts = [];
let fastFrom = null, fastN = 1, cutFrom = null;
for (const x of ev) {
  if (x.text.startsWith('@url ')) urls.push({ t: x.t, url: x.text.slice(5).replace(/^https?:\/\//, '').replace(/\?.*$/, '') });
  else if (x.text.startsWith('@fast ')) {
    const n = Number(x.text.slice(6));
    if (fastFrom !== null) fast.push({ a: fastFrom, b: x.t, n: fastN });
    fastFrom = n > 1 ? x.t : null; fastN = n;
  } else if (x.text === '@cut off') { if (cutFrom !== null) cuts.push({ a: cutFrom, b: x.t }); cutFrom = null; }
  else if (x.text.startsWith('@cut ')) { cutFrom = x.t; captions.push({ t: x.t, text: x.text.slice(5) }); }
  else captions.push({ t: x.t, text: x.text });
}
if (fastFrom !== null) fast.push({ a: fastFrom, b: dur, n: fastN });
if (cutFrom !== null) cuts.push({ a: cutFrom, b: dur });

// ── stills ──
const fd = spawnSync('ffmpeg', ['-hide_banner', '-i', `${RAW}${film}.mp4`, '-vf', 'scale=704:-1,freezedetect=n=0.002:d=1.0', '-an', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
const freezes = []; let fs0 = null;
for (const m of fd.matchAll(/freeze_(start|end): ([\d.]+)/g)) { if (m[1] === 'start') fs0 = Number(m[2]); else if (fs0 !== null) { freezes.push({ a: fs0, b: Number(m[2]) }); fs0 = null; } }
if (fs0 !== null) freezes.push({ a: fs0, b: dur });

// ── raw → output time map: pieces with a speed factor (0 = dropped) ──
const drops = [...cuts];
for (const f of freezes) {
  if (cuts.some((c) => f.a >= c.a && f.b <= c.b) || fast.some((s) => f.a >= s.a && f.b <= s.b)) continue;
  const need = Math.max(f.a + 0.9, ...captions.filter((c) => c.t < f.b && c.t + 2.6 > f.a).map((c) => c.t + 2.6));
  const keepTo = f.b >= dur - 0.05 ? Math.min(f.b, f.a + 1.2) : Math.min(f.b, need);
  if (f.b - keepTo > 0.05) drops.push({ a: keepTo, b: f.b });
}
const cutsAt = new Set([0, dur, ...drops.flatMap((d) => [d.a, d.b]), ...fast.flatMap((s) => [s.a, s.b])].map((x) => +x.toFixed(3)));
const bounds = [...cutsAt].sort((a, b) => a - b);
const pieces = [];
for (let i = 0; i < bounds.length - 1; i++) {
  const a = bounds[i], b = bounds[i + 1]; if (b - a < 0.01) continue;
  const mid = (a + b) / 2;
  const f = drops.some((d) => mid > d.a && mid < d.b) ? 0 : fast.find((s) => mid > s.a && mid < s.b)?.n ?? 1;
  const last = pieces.at(-1);
  if (last && last.f === f && Math.abs(last.b - a) < 0.001) last.b = b; else pieces.push({ a, b, f });
}
const map = (t) => { let o = 0; for (const p of pieces) { if (t <= p.a) break; if (p.f) o += (Math.min(t, p.b) - p.a) / p.f; } return o; };
const kept = pieces.filter((p) => p.f);
const mainDur = kept.reduce((s, p) => s + (p.b - p.a) / p.f, 0);

// ── band states (caption × url × fast) in output time ──
const at = (list, t) => list.filter((x) => x.t <= t + 1e-6).at(-1);
const marks = [...new Set([0, ...captions.map((c) => c.t), ...urls.map((u) => u.t), ...fast.flatMap((s) => [s.a, s.b])])].sort((a, b) => a - b);
const states = [];
for (const t of marks) {
  const c = at(captions, t)?.text ?? '', u = at(urls, t)?.url ?? '', s = fast.find((x) => t >= x.a && t < x.b);
  const st = { from: map(t), caption: c + (s ? `  · sped up ×${s.n}` : ''), url: u };
  const prev = states.at(-1);
  if (prev && prev.caption === st.caption && prev.url === st.url) continue;
  if (prev && Math.abs(prev.from - st.from) < 0.02) states.pop();
  states.push(st);
}
states.forEach((s, i) => { s.to = i + 1 < states.length ? states[i + 1].from : mainDur + HOLD; });

// ── cards rendered with Siar's own type ──
const font = (w, f = 'sans') => `@font-face{font-family:${f === 'mono' ? 'PlexMono' : 'Plex'};font-weight:${w};src:url(file://${FONTS}plex-${f}-${w}.woff2)}`;
const css = `${font(400)}${font(500)}${font(600)}${font(400, 'mono')}${font(500, 'mono')}*{margin:0;box-sizing:border-box}body{font-family:Plex;-webkit-font-smoothing:antialiased}`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
async function shot(html, path, h) { await page.setViewportSize({ width: W, height: h }); await page.setContent(`<style>${css}</style>${html}`); await page.evaluate(() => document.fonts.ready); await page.screenshot({ path, omitBackground: false }); }
await shot(`<div style="width:${W}px;height:${H}px;background:#f3efe4;color:#0b0b0a;padding:120px 140px;display:flex;flex-direction:column">
  <div style="font-family:PlexMono;font-weight:500;font-size:22px;letter-spacing:.12em;color:#5c584f">/ SIAR · META APP REVIEW · ${film}</div>
  <div style="font-weight:600;font-size:76px;line-height:1.08;margin-top:28px;max-width:1500px">${esc(meta.title)}</div>
  <div style="font-size:28px;color:#3d3a34;margin-top:44px">Permissions shown in this recording</div>
  <div style="display:flex;flex-wrap:wrap;gap:14px;margin-top:20px">${meta.perms.map((p) => `<span style="font-family:PlexMono;font-weight:500;font-size:30px;padding:12px 24px;border:2px solid #0b0b0a;border-radius:999px">${esc(p)}</span>`).join('')}</div>
  <div style="margin-top:auto;font-size:24px;line-height:1.5;color:#5c584f">Recorded in Siar (app.siaran.my) on 13 October 2026, using FF Dev Studio's own Facebook Page, Instagram and Threads accounts.<br>Captions describe each step. Waits on the network are shortened and labelled.</div></div>`, `${TMP}${film}-title.png`, H);
for (const [i, s] of states.entries()) {
  s.png = `${TMP}${film}-band-${i}.png`;
  await shot(`<div style="width:${W}px;height:${BAND}px;background:#0b0b0a;color:#f3efe4;display:flex;align-items:center;gap:40px;padding:0 44px">
    <div style="flex:1;font-weight:500;font-size:32px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(s.caption)}</div>
    <div style="font-family:PlexMono;font-size:21px;color:#a29d92;white-space:nowrap">${esc(s.url)}</div></div>`, s.png, BAND);
}
await browser.close();

// ── assemble ──
const args = ['-y', '-hide_banner', '-loglevel', 'error', '-i', `${RAW}${film}.mp4`, '-loop', '1', '-framerate', String(FPS), '-t', String(TITLE), '-i', `${TMP}${film}-title.png`];
for (const s of states) args.push('-loop', '1', '-framerate', String(FPS), '-t', String(mainDur + HOLD + 0.5), '-i', s.png);
const g = [];
g.push(`[0:v]split=${kept.length}${kept.map((_, i) => `[s${i}]`).join('')}`);
kept.forEach((p, i) => g.push(`[s${i}]trim=start=${p.a.toFixed(3)}:end=${p.b.toFixed(3)},setpts=(PTS-STARTPTS)/${p.f}[p${i}]`));
g.push(`${kept.map((_, i) => `[p${i}]`).join('')}concat=n=${kept.length}:v=1:a=0,fps=${FPS},scale=${W}:${VH}:flags=lanczos:in_color_matrix=bt709:out_color_matrix=bt709,tpad=stop_mode=clone:stop_duration=${HOLD},pad=${W}:${H}:0:0:color=0x0b0b0a[m0]`);
states.forEach((s, i) => g.push(`[m${i}][${i + 2}:v]overlay=0:${VH}:enable='between(t,${s.from.toFixed(3)},${(s.to - 0.001).toFixed(3)})'[m${i + 1}]`));
g.push(`[1:v]fps=${FPS},scale=${W}:${H}:out_color_matrix=bt709,format=yuv420p,setsar=1[t]`);
g.push(`[m${states.length}]format=yuv420p,setsar=1[mm]`);
g.push('[t][mm]concat=n=2:v=1:a=0[v]');
args.push('-filter_complex', g.join(';'), '-map', '[v]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p',
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv', '-movflags', '+faststart', `${OUT}${film}.mp4`);
execFileSync('ffmpeg', args, { stdio: 'inherit' });

// edit decision list, for the review notes
const out = { film, rawDuration: +dur.toFixed(2), duration: +(TITLE + mainDur + HOLD).toFixed(2), pieces, captions: states.map((s) => ({ at: +(TITLE + s.from).toFixed(2), to: +(TITLE + s.to).toFixed(2), caption: s.caption, url: s.url })) };
writeFileSync(`${OUT}${film}.edl.json`, JSON.stringify(out, null, 1));
console.log(`${film}: raw ${out.rawDuration}s → ${out.duration}s, ${kept.length} pieces, ${states.length} captions`);
