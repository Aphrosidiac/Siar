#!/usr/bin/env python3
"""Frame review material for a finished film: review/out/<film>.mp4 → review/out/<film>-review/

  python3 scripts/meta-review/review.py <film>

Writes: checks.txt (format, black frames, long stills), sheet-NN.jpg (every frame at 2 fps, 4×3 tiles with
timecodes) and key-*.jpg (full size, 0.4 s and 1.6 s after every caption change, plus the last frame).
"""
import json, os, re, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

film = sys.argv[1]
root = os.path.join(os.path.dirname(__file__), '..', '..')
out = os.path.join(root, 'review', 'out')
mp4 = os.path.join(out, f'{film}.mp4')
dst = os.path.join(out, f'{film}-review'); os.makedirs(dst, exist_ok=True)
for f in os.listdir(dst): os.remove(os.path.join(dst, f))
edl = json.load(open(os.path.join(out, f'{film}.edl.json')))

def run(*a): return subprocess.run(a, capture_output=True, text=True)
probe = json.loads(run('ffprobe', '-v', 'error', '-show_entries', 'stream=codec_name,width,height,r_frame_rate,pix_fmt,color_space,color_primaries,color_transfer:format=duration,size', '-of', 'json', mp4).stdout)
s, f = probe['streams'][0], probe['format']
dur = float(f['duration'])
checks = [f"format: {s['codec_name']} {s['width']}x{s['height']} {s['r_frame_rate']} {s['pix_fmt']} {s.get('color_space')}/{s.get('color_primaries')}/{s.get('color_transfer')}",
          f"duration: {dur:.1f}s  size: {int(f['size'])/1e6:.1f} MB"]
problems = []
if s['codec_name'] != 'h264' or s['pix_fmt'] != 'yuv420p' or s.get('color_space') != 'bt709': problems.append('format/colour tags')
if dur > 180: problems.append('longer than 3 min')
if int(f['size']) > 100e6: problems.append('over 100 MB')
bd = run('ffmpeg', '-hide_banner', '-i', mp4, '-vf', 'blackdetect=d=0.1:pix_th=0.05', '-an', '-f', 'null', '-').stderr
blacks = re.findall(r'black_start:([\d.]+) black_end:([\d.]+)', bd)
checks.append(f"black ranges: {blacks or 'none'}")
if blacks: problems.append('black frames')
fz = run('ffmpeg', '-hide_banner', '-i', mp4, '-vf', 'scale=1408:-1,freezedetect=n=0.0004:d=4', '-an', '-f', 'null', '-').stderr
stills = re.findall(r'freeze_start: ([\d.]+)', fz)
checks.append(f"stills over 4 s start at: {stills or 'none'} (title card at 0 and end hold are expected)")
checks.append('captions:')
for c in edl['captions']: checks.append(f"  {c['at']:6.2f}–{c['to']:6.2f}  {c['caption']}  [{c['url']}]")
import subprocess as _sp
edge = _sp.run(['ffmpeg', '-v', 'error', '-ss', '3.6', '-i', mp4, '-vf', 'fps=2,crop=1400:6:440:2,scale=1:1', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True).stdout
dark = [round(3.6 + i / 2, 1) for i, v in enumerate(edge) if v < 90]
checks.append(f"dark top edge (debugging bar / shifted crop) at: {dark or 'none'}")
if dark: problems.append('dark top edge')
checks.append(f"PROBLEMS: {problems or 'none'}")
open(os.path.join(dst, 'checks.txt'), 'w').write('\n'.join(checks) + '\n')

# contact sheets: every frame at 2 fps
tmp = os.path.join(dst, 'f'); os.makedirs(tmp, exist_ok=True)
run('ffmpeg', '-v', 'error', '-i', mp4, '-vf', 'fps=2,scale=640:-1', os.path.join(tmp, '%05d.png'))
frames = sorted(os.listdir(tmp))
try: font = ImageFont.truetype('/System/Library/Fonts/Menlo.ttc', 20)
except Exception: font = ImageFont.load_default()
per = 12
for n in range(0, len(frames), per):
    group = frames[n:n + per]
    w, h = Image.open(os.path.join(tmp, group[0])).size
    sheet = Image.new('RGB', (w * 4 + 15, (h + 26) * 3 + 10), (40, 40, 40))
    for i, name in enumerate(group):
        t = (int(name[:5]) - 1) / 2
        im = Image.open(os.path.join(tmp, name)).convert('RGB')
        x, y = (i % 4) * (w + 5), (i // 4) * (h + 26 + 5)
        sheet.paste(im, (x, y + 26))
        ImageDraw.Draw(sheet).text((x + 6, y + 2), f't={t:5.1f}s', fill=(255, 220, 90), font=font)
    sheet.save(os.path.join(dst, f'sheet-{n // per + 1:02d}.jpg'), quality=88)
for name in frames: os.remove(os.path.join(tmp, name))
os.rmdir(tmp)

# key frames at full size
keys = sorted({round(min(dur - 0.05, c['at'] + d), 2) for c in edl['captions'] for d in (0.4, 1.6)} | {round(dur - 0.1, 2)})
for t in keys:
    run('ffmpeg', '-v', 'error', '-ss', str(t), '-i', mp4, '-frames:v', '1', '-q:v', '3', os.path.join(dst, f'key-{t:06.2f}.jpg'))
print('\n'.join(checks)); print(f'{len(frames)} frames on {(len(frames) + per - 1) // per} sheets, {len(keys)} key frames → {dst}')
