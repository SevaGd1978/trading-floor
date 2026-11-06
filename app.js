(async function(){
const $=s=>document.querySelector(s);
const INS=[{"id":"gold","name":"Золото","code":"XAU/USD","yahoo":"GC=F","binance":"PAXGUSDT","digits":1,"round":50},{"id":"eurusd","name":"EUR/USD","code":"EUR/USD","yahoo":"EURUSD=X","binance":"EURUSDT","digits":4,"round":0.01},{"id":"btc","name":"Биткоин","code":"BTC/USD","yahoo":"BTC-USD","binance":"BTCUSDT","digits":0,"round":1000},{"id":"oil","name":"Нефть Brent","code":"BRENT","yahoo":"BZ=F","binance":null,"digits":2,"round":5},{"id":"usdrub","name":"USD/RUB","code":"USD/RUB","yahoo":"RUB=X","binance":null,"digits":2,"round":5},{"id":"spx","name":"S&P 500","code":"SPX","yahoo":"^GSPC","binance":null,"digits":0,"round":100}];
const LOC={gold:'золоте',eurusd:'EUR/USD',btc:'биткоине',oil:'нефти',usdrub:'USD/RUB',spx:'S&P 500'};
const NQ={gold:'золото цена',eurusd:'курс евро доллар',btc:'биткоин',oil:'нефть Brent',usdrub:'курс рубля доллар ЦБ',spx:'S&P 500 фондовый рынок США'};
INS.forEach(i=>{i.loc=LOC[i.id];i.news=NQ[i.id];$('#ins').add(new Option(`${i.name} (${i.code})`,i.id))});
const localApi=['localhost','127.0.0.1'].includes(location.hostname);
const j=async(u,t='json')=>{const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw Error(r.status);return t==='json'?r.json():r.text()};
function parseRss(x){const d=new DOMParser().parseFromString(x,'text/xml');return[...d.querySelectorAll('item')].map(n=>({title:n.querySelector('title')?.textContent,link:n.querySelector('link')?.textContent,date:n.querySelector('pubDate')?.textContent}))}
async function loadBars(i){
  if(localApi){try{const r=(await j('api/yahoo?s='+encodeURIComponent(i.yahoo))).chart.result[0],q=r.indicators.quote[0];
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
function chart(bars,plan,d){const c=$('#chart'),x=c.getContext('2d'),W=c.width,H=c.height;x.clearRect(0,0,W,H);if(!bars)return;
  const b=bars.slice(-60);let hi=Math.max(...b.map(v=>v[2])),lo=Math.min(...b.map(v=>v[3]));
  if(plan){hi=Math.max(hi,plan.take,plan.stop,plan.entry);lo=Math.min(lo,plan.take,plan.stop,plan.entry)}
  const pad=(hi-lo)*.05;hi+=pad;lo-=pad;const Y=v=>H-(v-lo)/(hi-lo)*H,cw=(W-60)/b.length;
  b.forEach((v,k)=>{const X=k*cw+cw/2,up=v[4]>=v[1];x.strokeStyle=x.fillStyle=up?'#8fc79a':'#d98a7a';x.beginPath();x.moveTo(X,Y(v[2]));x.lineTo(X,Y(v[3]));x.stroke();
    x.fillRect(X-cw*.35,Math.min(Y(v[1]),Y(v[4])),cw*.7,Math.max(1,Math.abs(Y(v[1])-Y(v[4]))))});
  x.font='11px system-ui';if(plan)[['entry','#e0a24a','вход'],['stop','#d98a7a','стоп'],['take','#8fc79a','тейк']].forEach(([k,col,l])=>{x.strokeStyle=x.fillStyle=col;x.setLineDash([4,4]);x.beginPath();x.moveTo(0,Y(plan[k]));x.lineTo(W-60,Y(plan[k]));x.stroke();x.setLineDash([]);x.fillText(l+' '+Committee.fmt(plan[k],d),W-58,Y(plan[k])+4)})}
const BOTS={scanner:['📡','Сканер'],news:['📰','Новости'],trader:['🎯','Трейдер'],skeptic:['🧐','Скептик']};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function say(b,text,link){document.querySelectorAll('.tile').forEach(t=>t.classList.toggle('on',t.dataset.b===b));
  const t=document.createElement('p');t.className='typing';t.textContent=BOTS[b][1]+' печатает…';$('#chat').append(t);await sleep(700);t.remove();
  const m=document.createElement('div');m.className='msg '+b;m.innerHTML=`<span class="av">${BOTS[b][0]}</span><div class="bub"><div class="who">${BOTS[b][1]}</div><div></div></div>`;
  m.querySelector('.bub div:last-child').textContent=text;if(link){const a=document.createElement('a');a.href=link;a.target='_blank';a.rel='noopener';a.textContent='источник →';m.querySelector('.bub').append(document.createElement('br'),a)}
  $('#chat').append(m);m.scrollIntoView({block:'nearest',behavior:'smooth'});await sleep(500)}
let cur=null;
$('#run').onclick=async()=>{const i=INS.find(x=>x.id===$('#ins').value);$('#run').disabled=true;$('#chat').innerHTML='';$('#summary').hidden=true;$('#decision').textContent='';
  document.querySelectorAll('.decide button').forEach(b=>b.classList.remove('sel'));
  $('#src').className='src';$('#src').textContent='Загружаю котировки и ленту…';
  const[p,n]=await Promise.all([loadBars(i),loadNews(i)]);
  $('#src').className='src'+(p.err?' err':p.stale?' warn':'');$('#src').textContent=`Цены: ${p.src}. Новости: ${n.src}.`;
  $('#chartTitle').textContent=`${i.name} — свечи 1 ч`;
  if(!p.bars){await say('scanner','Котировки не загрузились — не на чем искать объём. Сессию проводить не будем.');$('#run').disabled=false;$('#run').textContent='Обновить сессию';chart(null);return}
  const r=Committee.analyze(i,p.bars,n.news);cur={i,r};
  if(r.error){await say('scanner',r.error);$('#run').disabled=false;return}
  chart(r.bars,r.plan,i.digits);
  await say('scanner',r.scanner);await say('news',r.news,r.newsLink);await say('trader',r.trader);await say('skeptic',r.skeptic);if(r.traderReply)await say('trader',r.traderReply);
  document.querySelectorAll('.tile').forEach(t=>t.classList.remove('on'));
  const F=v=>Committee.fmt(v,i.digits);
  $('#sumBody').innerHTML=`<div class="kv"><span>Инструмент</span><b>${i.name} (${i.code})</b><span>Последняя цена</span><b>${F(r.last)}${p.stale?' (снимок)':''}</b>
   ${r.plan?`<span>Идея</span><b>${r.plan.dir==='long'?'Лонг':'Шорт'}</b><span>Вход</span><b>${F(r.plan.entry)}</b><span>Стоп</span><b>${F(r.plan.stop)}</b><span>Тейк</span><b>${F(r.plan.take)}</b>`:'<span>Идея</span><b>сетапа нет</b>'}
   <span>Подтверждения</span><b>${r.conf.length?r.conf.join(', '):'нет'}</b><span>Вердикт скептика</span><b><span class="verdict v-${r.verdict}">${r.verdict}</span></b></div>`;
  $('#summary').hidden=false;$('#run').disabled=false;$('#run').textContent='Обновить сессию'};
const LOG=JSON.parse(localStorage.getItem('tf-log')||'[]');const drawLog=()=>{$('#log').innerHTML=LOG.slice(-10).reverse().map(l=>`<li>${l}</li>`).join('')||'<li>пока пусто</li>'};drawLog();
document.querySelectorAll('.decide button').forEach(b=>b.onclick=()=>{if(!cur)return;document.querySelectorAll('.decide button').forEach(x=>x.classList.toggle('sel',x===b));
  const t=new Date().toLocaleString('ru-RU',{dateStyle:'short',timeStyle:'short'});LOG.push(`${t} — ${cur.i.name}: «${b.dataset.d}» (скептик: ${cur.r.verdict})`);localStorage.setItem('tf-log',JSON.stringify(LOG));drawLog();
  $('#decision').textContent=`Решение «${b.dataset.d}» записано. Реальная заявка не отправлялась.`});
})();
