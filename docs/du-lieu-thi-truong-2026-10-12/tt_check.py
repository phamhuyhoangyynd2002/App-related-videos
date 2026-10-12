import sys,re,json,subprocess,statistics,urllib.request,datetime,os
S=os.path.dirname(os.path.abspath(__file__))
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
out=open(S+'/tt_results.tsv','a',encoding='utf-8')
for h in sys.argv[1:]:
    h=h.lstrip('@')
    try:
        req=urllib.request.Request(f"https://www.tiktok.com/@{h}",headers={'User-Agent':UA,'Accept-Language':'en'})
        html=urllib.request.urlopen(req,timeout=30).read().decode('utf-8','ignore')
    except Exception as e:
        print(h,'ERR',e); continue
    m=re.search(r'"statsV2":(\{[^}]*\})',html)
    if not m: print(h,'NOSTATS'); continue
    st=json.loads(m.group(1))
    nick=re.search(r'"nickname":"([^"]*)"',html); sig=re.search(r'"signature":"([^"]*)"',html)
    reg=re.search(r'"region":"([A-Z]*)"',html); lang=re.search(r'"language":"([a-z\-]*)"',html)
    p=subprocess.run([S+'/venv2/bin/yt-dlp','--flat-playlist','--playlist-end','30','--print','%(view_count)s|%(timestamp)s|%(title).60s',f'https://www.tiktok.com/@{h}'],capture_output=True,text=True,timeout=300)
    vs=[];ts=[]
    for line in p.stdout.splitlines():
        a=line.split('|',2)
        try: vs.append(int(float(a[0]))); ts.append(int(a[1]))
        except: pass
    med=int(statistics.median(vs)) if vs else None
    d1=datetime.datetime.utcfromtimestamp(max(ts)).date() if ts else ''
    d0=datetime.datetime.utcfromtimestamp(min(ts)).date() if ts else ''
    row=[h,nick.group(1) if nick else '',reg.group(1) if reg else '',st['followerCount'],st['heartCount'],st['videoCount'],len(vs),med,max(vs) if vs else '',sum(v>=1e6 for v in vs),str(d0),str(d1),(sig.group(1)[:60] if sig else '').replace('\t',' ')]
    out.write('\t'.join(map(str,row))+'\n'); out.flush()
    print('\t'.join(map(str,row)))
