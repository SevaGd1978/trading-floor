#!/usr/bin/env python3
"""Снимок котировок и новостей на момент сборки -> snapshot.js (резерв для file://)."""
import json, urllib.request, urllib.parse, datetime, re, html, time
from zoneinfo import ZoneInfo
UA={'User-Agent':'Mozilla/5.0'}
INS=json.load(open('instruments.json'))
def get(u):
    last=None
    for n in range(3):
        try: return urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=25).read().decode()
        except Exception as e:
            last=e; time.sleep(1+n)
    raise last
def moex_bars(sec):
    raw=json.loads(get(f"https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities/{urllib.parse.quote(sec)}/candles.json?interval=60&iss.reverse=true&iss.meta=off"))
    cols=raw['candles']['columns']; ix={c:i for i,c in enumerate(cols)}; bars=[]
    for row in raw['candles']['data']:
        t=datetime.datetime.strptime(row[ix['begin']],'%Y-%m-%d %H:%M:%S').replace(tzinfo=ZoneInfo('Europe/Moscow'))
        if row[ix['close']] is None: continue
        bars.append([int(t.timestamp()*1000),row[ix['open']],row[ix['high']],row[ix['low']],row[ix['close']],row[ix['volume']] or 0])
    bars.sort(key=lambda b:b[0])
    if len(bars)<30: raise RuntimeError(f'{sec}: мало свечей ({len(bars)})')
    return bars[-220:]
out={'fetched':datetime.datetime.now(ZoneInfo('Asia/Yekaterinburg')).strftime('%d.%m.%Y %H:%M (Екатеринбург, UTC+5)'),'data':{}}
for i in INS:
    d={}
    try:
        if i.get('moex'):
            d['bars']=moex_bars(i['moex'])
        else:
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
for k,v in out['data'].items():
    print(k, 'bars', len(v.get('bars') or []), 'news', len(v.get('news') or []), v.get('barsError') or '', v.get('newsError') or '')
