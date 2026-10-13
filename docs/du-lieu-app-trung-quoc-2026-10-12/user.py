import json,time,urllib.request,urllib.parse,http.cookiejar,datetime,re
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"
cj=http.cookiejar.CookieJar(); op=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
g=lambda u:json.loads(op.open(urllib.request.Request(u,headers={'User-Agent':UA,'Referer':'https://search.bilibili.com/'}),timeout=30).read())
op.open(urllib.request.Request('https://www.bilibili.com/',headers={'User-Agent':UA}))
out=[]
for n in ["晚晚是也","阿闲说软件","李大可爱玩","一网一匠","一木的AI工具库","趣共享资源","系统迷","橘猫殿下_","萌sir壹号","李野王SG","TechTeam软件分享","从头学电脑","工具人胡胡","老麦的工具库","阿峰工具箱","赛博茶室","YLN_Software","JOJO数码"]:
  try:
    d=g('https://api.bilibili.com/x/web-interface/search/type?search_type=bili_user&keyword='+urllib.parse.quote(n))
    u=[x for x in d['data'].get('result') or [] if x['uname']==n] or (d['data'].get('result') or [None])[:1]
    u=u[0]
    r=dict(name=u['uname'],fans=u['fans'],videos=u['videos'],sign=u['usign'][:80],recent=[(re.sub('<[^>]+>','',x['title']),x.get('play'),x.get('duration'),str(datetime.date.fromtimestamp(x['pubdate']))) for x in u.get('res') or []])
  except Exception as e: r=dict(name=n,err=str(e))
  out.append(r); print(json.dumps(r,ensure_ascii=False)); time.sleep(3)
json.dump(out,open('user.json','w'),ensure_ascii=False,indent=1)
