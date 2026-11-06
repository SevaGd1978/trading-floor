#!/usr/bin/env python3
"""Локальный сервер «Торгового зала»: раздаёт файлы и проксирует Yahoo Finance и Google News RSS.
Запуск: python3 serve.py  ->  http://localhost:8765"""
import http.server, urllib.request, urllib.parse, json, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
UA={'User-Agent':'Mozilla/5.0'}
def get(u):
    return urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=15).read()
class H(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        p=urllib.parse.urlparse(self.path); q=urllib.parse.parse_qs(p.query)
        try:
            if p.path=='/api/yahoo':
                s=urllib.parse.quote(q['s'][0])
                return self.send(get(f'https://query1.finance.yahoo.com/v8/finance/chart/{s}?interval=1h&range=10d'),'application/json')
            if p.path=='/api/news':
                t=urllib.parse.quote(q['q'][0])
                return self.send(get(f'https://news.google.com/rss/search?q={t}&hl=ru&gl=RU&ceid=RU:ru'),'application/xml')
        except Exception as e:
            return self.send(json.dumps({'error':str(e)}).encode(),'application/json',502)
        super().do_GET()
    def send(self,b,ct,code=200):
        self.send_response(code); self.send_header('Content-Type',ct+'; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin','*'); self.end_headers(); self.wfile.write(b)
if __name__=='__main__':
    port=int(os.environ.get('PORT',8765)); print(f'Торговый зал: http://localhost:{port}')
    http.server.ThreadingHTTPServer(('0.0.0.0',port),H).serve_forever()
