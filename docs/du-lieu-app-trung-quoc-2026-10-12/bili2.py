import json,time,urllib.request,urllib.parse,http.cookiejar,hashlib,statistics,datetime,collections,sys,re
OUT=sys.argv[1]
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
cj=http.cookiejar.CookieJar(); op=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
def raw(url,ref='https://www.bilibili.com/'):
    return op.open(urllib.request.Request(url,headers={'User-Agent':UA,'Referer':ref}),timeout=30).read()
def get(url,ref='https://search.bilibili.com/'): return json.loads(raw(url,ref))
raw('https://www.bilibili.com/')
nav=get('https://api.bilibili.com/x/web-interface/nav')['data']['wbi_img']
k=lambda u:u.rsplit('/',1)[1].split('.')[0]
orig=k(nav['img_url'])+k(nav['sub_url'])
TAB=[46,47,18,2,53,8,23,32,15,50,10,31,58,3,45,35,27,43,5,49,33,9,42,19,29,28,14,39,12,38,41,13,37,48,7,16,24,55,40,61,26,17,0,1,60,51,30,4,22,25,54,21,56,59,6,63,57,62,11,36,20,34,44,52]
mixin=''.join(orig[i] for i in TAB)[:32]
def wbi(params):
    params=dict(params,wts=int(time.time()))
    q=urllib.parse.urlencode(sorted({k:re.sub(r"[!'()*]","",str(v)) for k,v in params.items()}.items()))
    return q+'&w_rid='+hashlib.md5((q+mixin).encode()).hexdigest()
KW=["宝藏APP推荐","手机必备APP","冷门好用的软件","安卓必备软件","iPhone必备app","AI工具推荐","神仙APP","小众app推荐","良心软件推荐","手机软件推荐","app推荐","iOS必备软件","好用到哭的app","提升效率的app","免费工具网站推荐"]
vids=open(OUT+'/video.tsv','w'); A=collections.defaultdict(lambda:[0,0,''])
for q in KW:
  for order in ('click','pubdate'):
    try: d=get('https://api.bilibili.com/x/web-interface/wbi/search/type?'+wbi({'search_type':'video','order':order,'page':1,'keyword':q}))
    except Exception as e: print('ERR',q,e); continue
    for x in (d.get('data') or {}).get('result') or []:
        t=re.sub('<[^>]+>','',x.get('title',''))
        vids.write('\t'.join(map(str,[q,order,x.get('play'),x.get('author'),x.get('mid'),x.get('duration'),datetime.date.fromtimestamp(x.get('pubdate',0)),x.get('bvid'),t]))+'\n')
        if order=='click': a=A[x['mid']]; a[0]+=x.get('play') or 0; a[1]+=1; a[2]=x.get('author')
    time.sleep(1.2)
vids.close()
top=sorted(A.items(),key=lambda kv:-kv[1][1]*1e9-kv[1][0])[:30]
res=[]
for mid,(pl,n,name) in top:
    try:
        st=get('https://api.bilibili.com/x/relation/stat?vmid=%s'%mid)['data']['follower']
        d=get('https://api.bilibili.com/x/space/wbi/arc/search?'+wbi({'mid':mid,'ps':30,'pn':1,'order':'pubdate'}),'https://space.bilibili.com/%s'%mid)
        vl=(d.get('data') or {}).get('list',{}).get('vlist') or []
        plays=[v['play'] for v in vl if isinstance(v.get('play'),int)]
        durs=[v.get('length') for v in vl]
        dates=[datetime.date.fromtimestamp(v['created']) for v in vl]
        r=dict(mid=mid,name=name,hits=n,follower=st,median=statistics.median(plays) if plays else None,max=max(plays) if plays else None,n=len(vl),
               range='%s..%s'%(min(dates),max(dates)) if dates else '',durs=durs[:10],titles=[(v['title'],v['play']) for v in vl[:12]],code=d.get('code'))
    except Exception as e: r=dict(mid=mid,name=name,err=str(e))
    res.append(r); print(json.dumps(r,ensure_ascii=False)[:300]); time.sleep(2)
json.dump(res,open(OUT+'/tac-gia.json','w'),ensure_ascii=False,indent=1)
