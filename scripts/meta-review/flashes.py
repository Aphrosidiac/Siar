#!/usr/bin/env python3
"""Find the Claude extension's orange pointer flashing in a raw take: review/raw/<film>.mp4 → JSON on stdout.

  python3 scripts/meta-review/flashes.py <film>        (the raw take)
  python3 scripts/meta-review/flashes.py <path.mp4>    (any video, e.g. a finished film in review.py)

The extension draws its own pointer (#claude-phantom-cursor, white with an orange glow) on every hover and click it
drives: it glides to the spot and lingers a few frames. cursor.js hides it from 2026-10-13 on; takes before that
show it. A flash is pointer-sized orange that is new in a frame (absent 12 frames before and after, so static red
icons and badges don't count), for at most 30 frames; hits up to 4 frames apart are one flash, and each is
widened by 3 frames on both sides because only the core of the glide passes the test.
Output: [{"hold": t, "a": t, "b": t}, …] in raw seconds: show the frame at `hold` from `a` until `b`.
"""
import json, os, subprocess, sys
from collections import deque
import numpy as np

film = sys.argv[1]
mp4 = film if film.endswith('.mp4') else os.path.join(os.path.dirname(__file__), '..', '..', 'review', 'raw', f'{film}.mp4')
W, GAP, MAXRUN, PAD, SIZE = 1408, 12, 30, 3, 60  # at 704 wide the glow shrinks to 1–4 px and most of a flash is missed
vw, vh = map(int, subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', mp4], capture_output=True, text=True).stdout.strip().split(','))
H = 2 * round(W * vh / vw / 2)
# presentation times of every frame (videotoolbox writes no B-frames, but sort anyway)
pts = sorted(float(x) for x in subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'packet=pts_time', '-of', 'csv=p=0', mp4],
                                               capture_output=True, text=True).stdout.split() if x and x != 'N/A')
proc = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', mp4, '-fps_mode', 'passthrough', '-vf', f'scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
size = W * H * 3
masks, hits, i = deque(maxlen=2 * GAP + 1), [], 0
def orange(buf):
    a = np.frombuffer(buf, np.uint8).reshape(H, W, 3).astype(np.int16)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    # the glow's orange, also where it lies over a dark page (Instagram, Threads)
    return (r > 160) & (g > 70) & (g < 170) & (b < 130) & (r - g > 55) & (r - b > 90)
while True:
    buf = proc.stdout.read(size)
    if len(buf) < size: break
    masks.append(orange(buf)); i += 1
    if len(masks) == masks.maxlen:
        mid = i - 1 - GAP
        new = masks[GAP] & ~masks[0] & ~masks[-1]
        if new.sum() >= 3:
            # pointer-sized only: a red button or dialog fading in is wider than the pointer and its glow
            ys, xs = np.nonzero(new)
            if xs.max() - xs.min() <= SIZE and ys.max() - ys.min() <= SIZE: hits.append(mid)
proc.wait()
n = min(i, len(pts))
runs = []
for f in hits:
    if runs and f - runs[-1][1] <= 4: runs[-1][1] = f
    else: runs.append([f, f])
out = []
for a, b in runs:
    if b - a + 1 > MAXRUN: continue
    a, b = max(1, a - PAD), min(n - 2, b + PAD)
    out.append({'hold': round(pts[a - 1], 4), 'a': round(pts[a], 4), 'b': round(pts[b + 1], 4)})
print(json.dumps(out))
