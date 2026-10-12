#!/bin/bash
# usage: yt_search.sh <segment> <query> ; appends TSV to $S/yt/<segment>.tsv
S=<thu-muc-tam>
seg="$1"; q="$2"
enc=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$q")
$S/venv2/bin/yt-dlp --flat-playlist --playlist-end 40 --print "${seg}	${q}	%(view_count)s	%(duration)s	%(channel)s	%(channel_id)s	%(id)s	%(title)s" "https://www.youtube.com/results?search_query=${enc}" 2>/dev/null >> $S/yt/${seg}.tsv
