#!/usr/bin/env bash
# rec.sh start <film> | stop | mark <caption…> | url <url>
# Records the Chrome viewport on the laptop screen (screen 0, 2x) with no OS cursor.
set -euo pipefail
D="$HOME/Desktop/dev/Siar/review/raw"; mkdir -p "$D"
CUR="$D/.current"
now() { python3 -c 'import time;print(f"{time.time():.3f}")'; }
case "$1" in
  start)
    f="$2"; echo "$f" > "$CUR"; rm -f "$D/$f.mp4" "$D/$f.tl"
    # CROP = the page viewport in screen pixels (2x) as w:h:x:y; default = 1408×700 pt under the debugging bar
    nohup ffmpeg -hide_banner -loglevel error -f avfoundation -capture_cursor 0 -framerate 30 -pixel_format nv12 -i "3:none" \
      -vf "crop=${CROP:-2816:1400:0:362}" -c:v h264_videotoolbox -b:v 40M -pix_fmt yuv420p "$D/$f.mp4" > "$D/$f.log" 2>&1 &
    echo $! > "$D/.pid"; echo "$(now)	@start" > "$D/$f.tl"; sleep 1.5; echo "recording $f";;
  stop)
    f=$(cat "$CUR"); echo "$(now)	@stop" >> "$D/$f.tl"; kill -INT "$(cat "$D/.pid")" 2>/dev/null || true
    for i in $(seq 1 40); do kill -0 "$(cat "$D/.pid")" 2>/dev/null || break; sleep 0.25; done
    ffprobe -v error -show_entries format=duration -of csv=p=0 "$D/$f.mp4";;
  mark) f=$(cat "$CUR"); shift; echo "$(now)	$*" >> "$D/$f.tl";;
  url) f=$(cat "$CUR"); echo "$(now)	@url $2" >> "$D/$f.tl";;
esac
