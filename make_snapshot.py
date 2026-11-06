#!/usr/bin/env python3
"""Снимок котировок и новостей на момент сборки -> snapshot.js (резерв для file://)."""
import json, urllib.request, urllib.parse, datetime, re, html
from zoneinfo import ZoneInfo
UA={'User-Agent':'Mozilla/5.0'}
INS=json.load(open('instruments.json'))
def get(u): return urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=20).read().decode()
out={'fetched':datetime.datetime.now(ZoneInfo('Asia/Yekaterinburg')).strftime('%d.%m.%Y %H:%M (Екатеринбург, UTC+5)'),'data':{}}
for i in INS:
    d={}
    try:
        r=json.loads(get(f"https://query1.finance.yahoo.com/v8/finance/chart/{urllib.parse.quote(i['yahoo'])}?interval=1h&range=10d"))['chart']['result'][0]
        q=r['indicators']['quote'][0]; bars=[]
        for k,t in enumerate(r['timestamp']):
            if q['close'][k] is None: continue
            bars.append([t*1000,q['open'][k],q['high'][k],q['low'][k],q['close'][k],q['volume'][k] or 0])
        d['bars']=bars
    except Exception as e: d['barsError']=str(e)
    try:
        x=get(f"https://news.google.com/rss/search?q={urllib.parse.quote(i['news'])}&hl=ru&gl=RU&ceid=RU:ru")
        items=re.findall(r'<item>.*?<title>(.*?)</title>.*?<link>(.*?)</link>.*?<pubDate>(.*?)</pubDate>',x,re.S)[:15]
        d['news']=[{'title':html.unescape(a),'link':b,'date':c} for a,b,c in items]
    except Exception as e: d['newsError']=str(e)
    out['data'][i['id']]=d
open('snapshot.js','w').write('window.SNAPSHOT='+json.dumps(out,ensure_ascii=False)+';')
print('ok',out['fetched'])
