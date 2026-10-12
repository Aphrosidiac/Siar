#!/usr/bin/env python3
"""Move each `@url` mark of a take to the moment its page actually shows: review/raw/<film>.tl is rewritten.

  python3 scripts/meta-review/snapurls.py <film>

Marks are stamped when the driver acts, but a page can appear seconds earlier or later (a redirect, a slow load,
a sped-up wait), and the address band then names the wrong site. The raw video tells Siar's pages (the ink sidebar
beside a light page) from Meta's; each mark that changes site moves to the nearest switch to its kind within 20 s.
"""
import os, subprocess, sys
import numpy as np

film = sys.argv[1]
raw = os.path.join(os.path.dirname(__file__), '..', '..', 'review', 'raw')
mp4, tl = os.path.join(raw, f'{film}.mp4'), os.path.join(raw, f'{film}.tl')
vw, vh = map(int, subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', mp4], capture_output=True, text=True).stdout.strip().split(','))
fh = max(1, round(vh / vw * 96))
buf = subprocess.run(['ffmpeg', '-v', 'error', '-i', mp4, '-vf', f'fps=10,scale=96:{fh}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
fr = np.frombuffer(buf, np.uint8).reshape(-1, fh, 96, 3).astype(int)
siar = np.array([f[fh // 2, 3].max() < 40 and f[fh // 2, 8].max() < 40 and f[fh // 2, 20].mean() > 60 for f in fr])
# a switch to a kind that then holds for half a second
def switches(kind):
    return [i / 10 for i in range(1, len(siar) - 5) if siar[i] == kind and siar[i - 1] != kind and all(siar[i:i + 5] == kind)]
sw = {True: switches(True), False: switches(False)}

lines = [l.split('\t', 1) for l in open(tl).read().rstrip('\n').split('\n')]
t0 = next(float(e) for e, x in lines if x == '@start') + 0.35  # LATENCY in edit.mjs
moved = 0; prev = None
for l in lines:
    e, x = l
    if not x.startswith('@url '): continue
    u = float(e) - t0; kind = 'siaran.my' in x
    # only a change of site shows in the video (Siar → Meta or back); a move within Siar keeps its mark
    if prev is None or prev == kind: prev = kind; continue
    prev = kind
    i = min(len(siar) - 1, max(0, int(u * 10)))
    if siar[i] == kind and siar[max(0, i - 3)] == kind:
        cand = [s for s in sw[kind] if u - 20 <= s <= u]   # already on it: the switch was earlier
    else:
        cand = [s for s in sw[kind] if u - 20 <= s <= u + 20]
    if not cand: continue
    s = min(cand, key=lambda c: abs(c - u))
    if abs(s - u) > 0.2:
        print(f'{x[5:60]}: {u:.2f} → {s:.2f}'); l[0] = f'{t0 + s:.3f}'; moved += 1
lines.sort(key=lambda l: float(l[0]))
open(tl, 'w').write('\n'.join('\t'.join(l) for l in lines) + '\n')
print(f'{film}: {moved} address marks moved')
