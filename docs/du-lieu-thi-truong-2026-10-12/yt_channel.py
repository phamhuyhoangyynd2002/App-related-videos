import sys,os,statistics,subprocess,json
S=os.path.dirname(os.path.abspath(__file__))
Y=S+'/venv2/bin/yt-dlp'
out=open(S+'/yt_channels.tsv','a',encoding='utf-8')
def tab(url,n=30):
    for _ in range(2):
        p=subprocess.run([Y,'--flat-playlist','--playlist-end',str(n),'-J',url],capture_output=True,text=True,timeout=300)
        try:
            info=json.loads(p.stdout); E=[e for e in (info.get('entries') or []) if e]
            return info,E
        except Exception: pass
    return {},[]
def date(vid):
    p=subprocess.run([Y,'--skip-download','--print','%(upload_date)s','https://www.youtube.com/watch?v='+vid],capture_output=True,text=True,timeout=120)
    return p.stdout.strip()
def st(E):
    vs=[e.get('view_count') for e in E if e.get('view_count') is not None]
    if not vs: return [0,'','','','']
    return [len(vs),int(statistics.median(vs)),max(vs),sum(v>=1e5 for v in vs),f"{date(E[-1]['id'])}->{date(E[0]['id'])}"]
for arg in sys.argv[1:]:
    seg,cid=arg.split(':',1)
    base=f'https://www.youtube.com/channel/{cid}'
    info,E=tab(base+'/videos'); _,Es=tab(base+'/shorts')
    row=[seg,cid,info.get('channel') or info.get('title') or '',info.get('channel_follower_count'),*st(E),*st(Es)]
    out.write('\t'.join(map(str,row))+'\n'); out.flush(); print('\t'.join(map(str,row)),flush=True)
