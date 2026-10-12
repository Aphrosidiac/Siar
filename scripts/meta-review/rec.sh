#!/usr/bin/env bash
# rec.sh start <film> <innerHeight> | stop | mark <caption…> | url <url>
# Records the Chrome viewport on the laptop screen (screen 0, 2x) with no OS cursor.
set -euo pipefail
D="$HOME/Desktop/dev/Siar/review/raw"; mkdir -p "$D"
CUR="$D/.current"
# The OS pointer is captured too (capture_cursor 0 is ignored) and its hover shows on the page: if it is over the
# laptop screen below the menu bar, move it into the menu bar. It is never clicked.
park() { osascript -l JavaScript -e 'ObjC.import("CoreGraphics"); ObjC.import("AppKit"); var p=$.NSEvent.mouseLocation; var y=881-p.y; var r="pointer ok"; if (p.x>=0 && p.x<1408 && y>36) { $.CGWarpMouseCursorPosition({x:700,y:12}); r="pointer parked"; } r'; }
now() { python3 -c 'import time;print(f"{time.time():.3f}")'; }
case "$1" in
  start)
    # $3 = the page's innerHeight (points): the viewport is the bottom of the window (bottom edge at 881 pt),
    # so the crop follows Chrome's debugging bar appearing or not
    if [ -n "${3:-}" ]; then CROP="2816:$(( $3 * 2 )):0:$(( 1762 - $3 * 2 ))"; fi
    pgrep -qf "caffeinate -dimu" || { echo "start caffeinate -dimu first: an idle Mac shows its screen saver mid-take"; exit 1; }
    park; f="$2"; echo "$f" > "$CUR"; rm -f "$D/$f.mp4" "$D/$f.tl"
    # CROP = the page viewport in screen pixels (2x) as w:h:x:y; default = 1408×700 pt under the debugging bar
    nohup ffmpeg -hide_banner -loglevel error -f avfoundation -capture_cursor 0 -framerate 30 -pixel_format nv12 -i "Capture screen 0:none" \
      -vf "crop=${CROP:-2816:1400:0:362}" -c:v h264_videotoolbox -b:v 40M -pix_fmt yuv420p "$D/$f.mp4" > "$D/$f.log" 2>&1 &
    echo $! > "$D/.pid"; echo "$(now)	@start" > "$D/$f.tl"; sleep 2
    # the screen is chosen by name: device numbers shift when an iPhone camera comes or goes
    if ! kill -0 "$(cat "$D/.pid")" 2>/dev/null; then echo "RECORDER FAILED:"; cat "$D/$f.log"; exit 1; fi
    echo "recording $f";;
  stop)
    f=$(cat "$CUR"); echo "$(now)	@stop" >> "$D/$f.tl"; kill -INT "$(cat "$D/.pid")" 2>/dev/null || true
    for i in $(seq 1 40); do kill -0 "$(cat "$D/.pid")" 2>/dev/null || break; sleep 0.25; done
    ffprobe -v error -show_entries format=duration -of csv=p=0 "$D/$f.mp4";;
  mark) park >/dev/null; f=$(cat "$CUR"); shift; echo "$(now)	$*" >> "$D/$f.tl";;
  url) f=$(cat "$CUR"); echo "$(now)	@url $2" >> "$D/$f.tl";;
esac
