import json,sys,time,urllib.request,urllib.parse,http.cookiejar,os,statistics,datetime,collections
S=os.path.dirname(os.path.abspath(__file__))
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
cj=http.cookiejar.MozillaCookieJar(S+'/bili.cj'); cj.load(ignore_discard=True,ignore_expires=True)
op=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
def get(url):
    r=urllib.request.Request(url,headers={'User-Agent':UA,'Referer':'https://search.bilibili.com/'})
    return json.loads(op.open(r,timeout=30).read())
segs={'pc_cn':["steam游戏推荐","低配游戏推荐","steam免费游戏推荐","steam史低推荐","steam新品节 demo推荐","独立游戏推荐"],
      'app_cn':["宝藏APP推荐","手机必备APP","冷门好用的软件","安卓必备软件","iPhone必备app","AI工具推荐"]}
out=open(S+'/bili_videos.tsv','w',encoding='utf-8')
authors=collections.Counter()
for seg,qs in segs.items():
    for q in qs:
        for order in ('click','pubdate'):
            try: d=get('https://api.bilibili.com/x/web-interface/search/type?search_type=video&order=%s&page=1&keyword=%s'%(order,urllib.parse.quote(q)))
            except Exception as e: print('ERR',q,e); continue
            for x in (d.get('data') or {}).get('result') or []:
                t=x.get('title','').replace('<em class="keyword">','').replace('</em>','')
                out.write('\t'.join(map(str,[seg,q,order,x.get('play'),x.get('author'),x.get('mid'),x.get('duration'),datetime.date.fromtimestamp(x.get('pubdate',0)),x.get('bvid'),t]))+'\n')
                if order=='click': authors[(seg,x.get('mid'),x.get('author'))]+=x.get('play') or 0
            time.sleep(1)
out.close()
json.dump([[k[0],k[1],k[2],v] for k,v in authors.most_common()],open(S+'/bili_authors.json','w'),ensure_ascii=False)
print('done')
