(async function(){
const $=s=>document.querySelector(s);
const INS=[{"id":"gold","name":"Золото","code":"XAU/USD","yahoo":"GC=F","binance":"PAXGUSDT","digits":1,"round":50},{"id":"eurusd","name":"EUR/USD","code":"EUR/USD","yahoo":"EURUSD=X","binance":"EURUSDT","digits":4,"round":0.01},{"id":"btc","name":"Биткоин","code":"BTC/USD","yahoo":"BTC-USD","binance":"BTCUSDT","digits":0,"round":1000},{"id":"oil","name":"Нефть Brent","code":"BRENT","yahoo":"BZ=F","binance":null,"digits":2,"round":5},{"id":"usdrub","name":"USD/RUB","code":"USD/RUB","yahoo":"RUB=X","binance":null,"digits":2,"round":5},{"id":"spx","name":"S&P 500","code":"SPX","yahoo":"^GSPC","binance":null,"digits":0,"round":100},{"id":"sber","name":"Сбер","code":"SBER","moex":"SBER","digits":2,"round":10},{"id":"gazp","name":"Газпром","code":"GAZP","moex":"GAZP","digits":2,"round":5},{"id":"lkoh","name":"Лукойл","code":"LKOH","moex":"LKOH","digits":1,"round":100},{"id":"gmkn","name":"Норникель","code":"GMKN","moex":"GMKN","digits":2,"round":5},{"id":"rosn","name":"Роснефть","code":"ROSN","moex":"ROSN","digits":2,"round":10},{"id":"nvtk","name":"Новатэк","code":"NVTK","moex":"NVTK","digits":1,"round":50},{"id":"ydex","name":"Яндекс","code":"YDEX","moex":"YDEX","digits":1,"round":100},{"id":"tbank","name":"Т-Банк","code":"T","moex":"T","digits":2,"round":10},{"id":"mgnt","name":"Магнит","code":"MGNT","moex":"MGNT","digits":1,"round":50},{"id":"mtss","name":"МТС","code":"MTSS","moex":"MTSS","digits":2,"round":5},{"id":"plzl","name":"Полюс","code":"PLZL","moex":"PLZL","digits":1,"round":50},{"id":"vtbr","name":"ВТБ","code":"VTBR","moex":"VTBR","digits":3,"round":1},{"id":"x5","name":"ИКС 5","code":"X5","moex":"X5","digits":1,"round":50},{"id":"ozon","name":"Ozon","code":"OZON","moex":"OZON","digits":1,"round":100},{"id":"alrs","name":"Алроса","code":"ALRS","moex":"ALRS","digits":2,"round":1},{"id":"tatn","name":"Татнефть","code":"TATN","moex":"TATN","digits":1,"round":10},{"id":"chmf","name":"Северсталь","code":"CHMF","moex":"CHMF","digits":1,"round":10},{"id":"nlmk","name":"НЛМК","code":"NLMK","moex":"NLMK","digits":2,"round":5},{"id":"phor","name":"ФосАгро","code":"PHOR","moex":"PHOR","digits":0,"round":100},{"id":"moex","name":"Мосбиржа","code":"MOEX","moex":"MOEX","digits":2,"round":5},{"id":"sngs","name":"Сургутнефтегаз","code":"SNGS","moex":"SNGS","digits":3,"round":0.5},{"id":"aflt","name":"Аэрофлот","code":"AFLT","moex":"AFLT","digits":2,"round":1}];
const LOC={gold:'золоте',eurusd:'EUR/USD',btc:'биткоине',oil:'нефти',usdrub:'USD/RUB',spx:'S&P 500',sber:'акциях Сбера',gazp:'акциях Газпрома',lkoh:'акциях Лукойла',gmkn:'акциях Норникеля',rosn:'акциях Роснефти',nvtk:'акциях Новатэка',ydex:'акциях Яндекса',tbank:'акциях Т-Банка',mgnt:'акциях Магнита',mtss:'акциях МТС',plzl:'акциях Полюса',vtbr:'акциях ВТБ',x5:'акциях X5',ozon:'акциях Ozon',alrs:'акциях Алросы',tatn:'акциях Татнефти',chmf:'акциях Северстали',nlmk:'акциях НЛМК',phor:'акциях ФосАгро',moex:'акциях Мосбиржи',sngs:'акциях Сургутнефтегаза',aflt:'акциях Аэрофлота'};
const NQ={gold:'золото цена',eurusd:'курс евро доллар',btc:'биткоин',oil:'нефть Brent',usdrub:'курс рубля доллар ЦБ',spx:'S&P 500 фондовый рынок США',sber:'акции Сбербанка',gazp:'акции Газпрома',lkoh:'акции Лукойла',gmkn:'акции Норникеля',rosn:'акции Роснефти',nvtk:'акции Новатэка',ydex:'акции Яндекса',tbank:'акции Т-Банка',mgnt:'акции Магнита',mtss:'акции МТС',plzl:'акции Полюса',vtbr:'акции ВТБ',x5:'акции X5',ozon:'акции Ozon',alrs:'акции Алросы',tatn:'акции Татнефти',chmf:'акции Северстали',nlmk:'акции НЛМК',phor:'акции ФосАгро',moex:'акции Московской биржи',sngs:'акции Сургутнефтегаза',aflt:'акции Аэрофлота'};
INS.forEach(i=>{i.loc=LOC[i.id];i.news=NQ[i.id]});
function addGroup(label,list){const g=document.createElement('optgroup');g.label=label;list.forEach(i=>g.append(new Option(`${i.name} (${i.code})`,i.id)));$('#ins').append(g)}
addGroup('Сырьё, валюта и индексы',INS.filter(i=>!i.moex));
addGroup('Акции Мосбиржи',INS.filter(i=>i.moex));
const localApi=['localhost','127.0.0.1'].includes(location.hostname);
const j=async(u,t='json')=>{const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw Error(r.status);return t==='json'?r.json():r.text()};
function parseRss(x){const d=new DOMParser().parseFromString(x,'text/xml');return[...d.querySelectorAll('item')].map(n=>({title:n.querySelector('title')?.textContent,link:n.querySelector('link')?.textContent,date:n.querySelector('pubDate')?.textContent}))}
async function loadMoex(sec){
  const r=await j(`https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities/${encodeURIComponent(sec)}/candles.json?interval=60&iss.reverse=true&iss.meta=off`);
  const cols=r.candles.columns, ix={}; cols.forEach((c,n)=>ix[c]=n);
  const bars=r.candles.data.map(row=>[Date.parse(String(row[ix.begin]).replace(' ','T')+'+03:00'),+row[ix.open],+row[ix.high],+row[ix.low],+row[ix.close],+row[ix.volume]||0]).filter(b=>b[4]!=null&&!Number.isNaN(b[0])).sort((a,b)=>a[0]-b[0]);
  if(bars.length<30) throw Error('мало свечей MOEX');
  return bars;
}
async function loadBars(i){
  if(i.moex){try{return{bars:await loadMoex(i.moex),src:`MOEX ${i.moex}, живые часовые свечи TQBR`}}catch(e){}}
  if(localApi&&i.yahoo){try{const r=(await j('api/yahoo?s='+encodeURIComponent(i.yahoo))).chart.result[0],q=r.indicators.quote[0];
    return{bars:r.timestamp.map((t,k)=>[t*1e3,q.open[k],q.high[k],q.low[k],q.close[k],q.volume[k]||0]).filter(b=>b[4]!=null),src:`Yahoo Finance ${i.yahoo}, живые данные через локальный сервер`}}catch(e){}}
  if(i.binance){try{const k=await j(`https://api.binance.com/api/v3/klines?symbol=${i.binance}&interval=1h&limit=200`);
    return{bars:k.map(b=>[b[0],+b[1],+b[2],+b[3],+b[4],+b[5]]),src:`Binance ${i.binance}, живые данные`+(i.id!=='btc'?` (прокси: ${i.binance==='PAXGUSDT'?'PAXG — токен на золото':'EUR/USDT'}, цена близка, но не равна ${i.code})`:'')}}catch(e){}}
  const s=window.SNAPSHOT?.data?.[i.id];
  if(s?.bars)return{bars:s.bars,src:`⚠️ Живые котировки недоступны. Показан СНИМОК на ${SNAPSHOT.fetched} — это не текущая цена.`,stale:true};
  return{bars:null,src:'Котировки загрузить не удалось.',err:true};
}
async function loadNews(i){
  const u=`https://news.google.com/rss/search?q=${encodeURIComponent(i.news)}&hl=ru&gl=RU&ceid=RU:ru`;
  if(localApi){try{return{news:parseRss(await j('api/news?q='+encodeURIComponent(i.news),'text')),src:'Google News'}}catch(e){}}
  try{const r=await j('https://api.rss2json.com/v1/api.json?rss_url='+encodeURIComponent(u));if(r.status==='ok')return{news:r.items.map(x=>({title:x.title,link:x.link,date:x.pubDate.replace(' ','T')+'Z'})),src:'Google News через rss2json'}}catch(e){}
  const s=window.SNAPSHOT?.data?.[i.id];if(s?.news)return{news:s.news,src:`новости из снимка на ${SNAPSHOT.fetched}`,stale:true};
  return{news:null,src:'лента недоступна'};
}
let lastChart=null, painting=false, chartQueued=false;
function chart(bars,plan,d){
  if(arguments.length) lastChart=bars?[bars,plan,d]:null;
  const c=$('#chart'); if(!c) return;
  const W=c.clientWidth||0, H=c.clientHeight||0;
  if(W<20||H<20) return;
  if(painting){chartQueued=true; return}
  painting=true;
  try{
    const dpr=Math.min(window.devicePixelRatio||1,2);
    c.width=Math.round(W*dpr); c.height=Math.round(H*dpr);
    const x=c.getContext('2d'); x.setTransform(dpr,0,0,dpr,0,0); x.clearRect(0,0,W,H);
    const job=lastChart; if(!job) return;
    const [bs,pl,dg]=job, b=bs.slice(-60); let hi=Math.max(...b.map(v=>v[2])), lo=Math.min(...b.map(v=>v[3]));
    if(pl){hi=Math.max(hi,pl.take,pl.stop,pl.entry);lo=Math.min(lo,pl.take,pl.stop,pl.entry)}
    const pad=(hi-lo)*.08||1; hi+=pad; lo-=pad;
    x.font='11px system-ui';
    const labels=pl?[['entry','#e0a24a','вход'],['stop','#d98a7a','стоп'],['take','#8fc79a','тейк']].map(([k,col,l])=>[k,col,l+' '+Committee.fmt(pl[k],dg)]):[];
    const gutter=Math.max(64, labels.reduce((m,lab)=>Math.max(m, Math.ceil(x.measureText(lab[2]).width)+10), 0));
    const plotR=W-gutter-4, Y=v=>16+(1-(v-lo)/(hi-lo))*(H-32), cw=Math.max(1,(plotR-8)/b.length);
    b.forEach((v,k)=>{const X=6+k*cw+cw/2, up=v[4]>=v[1]; x.strokeStyle=x.fillStyle=up?'#8fc79a':'#d98a7a'; x.beginPath(); x.moveTo(X,Y(v[2])); x.lineTo(X,Y(v[3])); x.stroke();
      x.fillRect(X-Math.min(cw*.3,3),Math.min(Y(v[1]),Y(v[4])),Math.max(1,Math.min(cw*.6,6)),Math.max(1,Math.abs(Y(v[1])-Y(v[4]))))});
    labels.forEach(([k,col,text])=>{x.strokeStyle=x.fillStyle=col; x.setLineDash([4,4]); x.beginPath(); x.moveTo(0,Y(pl[k])); x.lineTo(plotR,Y(pl[k])); x.stroke(); x.setLineDash([]); x.fillText(text, plotR+6, Y(pl[k])+4)});
  } finally {
    painting=false;
    if(chartQueued){chartQueued=false; requestAnimationFrame(()=>chart())}
  }
}
if(window.ResizeObserver){new ResizeObserver(()=>{if(lastChart&&!painting) chart(...lastChart)}).observe($('#chart').parentElement)}
const BOTS={scanner:['📡','Сканер'],news:['📰','Новости'],trader:['🎯','Трейдер'],skeptic:['🧐','Скептик']};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function clearBots(){document.querySelectorAll('.bot').forEach(t=>{t.classList.remove('on'); t.querySelector('.bot-text').innerHTML='<p class="hint">Ждёт запуска.</p>'})}
async function say(b,text,link){document.querySelectorAll('.bot').forEach(t=>t.classList.toggle('on',t.dataset.b===b));
  const slot=document.querySelector('.bot[data-b="'+b+'"] .bot-text'); const hint=slot.querySelector('.hint'); if(hint) hint.remove();
  const t=document.createElement('p'); t.className='typing'; t.textContent=BOTS[b][1]+' печатает…'; slot.append(t);
  if(window.innerWidth<1100) slot.closest('.bot').scrollIntoView({block:'nearest',behavior:'smooth'});
  await sleep(420); t.remove();
  const p=document.createElement('p'); p.textContent=text; slot.append(p);
  if(link){const a=document.createElement('a'); a.href=link; a.target='_blank'; a.rel='noopener'; a.textContent='источник →'; slot.append(a)}
  await sleep(240)}
let cur=null;
function kpis(i,r,stale){const F=v=>Committee.fmt(v,i.digits), plan=r.plan;
  $('#sumBody').innerHTML=`<div class="kpi kpi-price"><span>${i.name} (${i.code})</span><b>${F(r.last)}${stale?' (снимок)':''}</b></div>
   <div class="kpi"><span>Идея</span><b>${plan?(plan.dir==='long'?'Лонг':'Шорт'):'сетапа нет'}</b></div>
   <div class="kpi"><span>Вход</span><b>${plan?F(plan.entry):'—'}</b></div>
   <div class="kpi"><span>Стоп</span><b>${plan?F(plan.stop):'—'}</b></div>
   <div class="kpi"><span>Тейк</span><b>${plan?F(plan.take):'—'}</b></div>
   <div class="kpi"><span>Подтверждения</span><b>${r.conf.length?r.conf.join(', '):'нет'}</b></div>
   <div class="kpi"><span>Вердикт</span><b><span class="verdict v-${r.verdict}">${r.verdict}</span></b></div>`}
$('#run').onclick=async()=>{const i=INS.find(x=>x.id===$('#ins').value);$('#run').disabled=true;clearBots();$('#decision').textContent='';
  document.querySelectorAll('.decide button').forEach(b=>b.classList.remove('sel'));
  $('#src').className='src';$('#src').textContent=$('#src').title='Загружаю котировки и ленту…';
  const[p,n]=await Promise.all([loadBars(i),loadNews(i)]);
  $('#src').className='src'+(p.err?' err':p.stale?' warn':'');$('#src').textContent=$('#src').title=`Цены: ${p.src}. Новости: ${n.src}.`;
  $('#chartTitle').textContent=`${i.name} — свечи 1 ч`;
  if(!p.bars){await say('scanner','Котировки не загрузились — не на чем искать объём. Сессию проводить не будем.');$('#run').disabled=false;$('#run').textContent='Обновить сессию';chart(null);return}
  const r=Committee.analyze(i,p.bars,n.news);cur={i,r};
  if(r.error){await say('scanner',r.error);$('#run').disabled=false;return}
  chart(r.bars,r.plan,i.digits);
  await say('scanner',r.scanner);await say('news',r.news,r.newsLink);await say('trader',r.trader);await say('skeptic',r.skeptic);if(r.traderReply)await say('trader',r.traderReply);
  document.querySelectorAll('.bot').forEach(t=>t.classList.remove('on'));
  kpis(i,r,p.stale);$('#run').disabled=false;$('#run').textContent='Обновить сессию'};
const LOG=JSON.parse(localStorage.getItem('tf-log')||'[]');const drawLog=()=>{$('#log').innerHTML=LOG.slice(-10).reverse().map(l=>`<li>${l}</li>`).join('')||'<li>пока пусто</li>'};drawLog();
document.querySelectorAll('.decide button').forEach(b=>b.onclick=()=>{if(!cur)return;document.querySelectorAll('.decide button').forEach(x=>x.classList.toggle('sel',x===b));
  const t=new Date().toLocaleString('ru-RU',{dateStyle:'short',timeStyle:'short'});LOG.push(`${t} — ${cur.i.name}: «${b.dataset.d}» (скептик: ${cur.r.verdict})`);localStorage.setItem('tf-log',JSON.stringify(LOG));drawLog();
  $('#decision').textContent=`Решение «${b.dataset.d}» записано. Реальная заявка не отправлялась.`});
})();
