// Логика комитета из четырёх ботов. Детерминированная: одни и те же данные -> одни и те же выводы.
(function(root){
const fmt=(x,d)=>Number(x).toLocaleString('ru-RU',{minimumFractionDigits:d,maximumFractionDigits:d});
const sma=(a,n)=>a.slice(-n).reduce((s,x)=>s+x,0)/Math.min(n,a.length);
function closedBars(bars){ // отбрасываем незакрытый «тик» с нулевым объёмом в конце
  const b=bars.filter(x=>x[4]!=null);
  if(b.length>2 && b[b.length-1][5]===0 && b[b.length-2][5]>0) return b.slice(0,-1);
  if(b.length>2 && b[b.length-1][2]===b[b.length-1][3]) return b.slice(0,-1);
  return b;
}
function atr(b,n=14){const tr=[];for(let i=1;i<b.length;i++){const[,,h,l]=b[i],pc=b[i-1][4];tr.push(Math.max(h-l,Math.abs(h-pc),Math.abs(l-pc)));}return sma(tr,n);}
const BULL=/рост|растут|растёт|вырос|подорож|повыш|рекорд|взлет|взлёт|максимум|укреп|спрос|приток|снижение ставк|снизит ставк|смягч|surge|rally|rise|gain|record/i;
const BEAR=/паден|упал|падает|снижа|снизил|подешев|обвал|минимум|ослаб|отток|давлен|распрод|повышение ставк|ужесточ|fall|drop|slump|plunge/i;
const MACRO=/ФРС|ЕЦБ|ЦБ|ставк|инфляц|ОПЕК|санкц|пошлин|тариф|занятост|ВВП|Пауэлл|Трамп|ETF|Fed/i;
function analyze(ins,bars,news,now=Date.now()){
  const d=ins.digits, P=x=>fmt(x,d), R={ins};
  const b=closedBars(bars||[]);
  if(b.length<30){R.error='Мало данных по цене — анализ невозможен.';return R;}
  const c=b.map(x=>x[4]), last=c[c.length-1], A=atr(b), L=b[b.length-1];
  R.last=last; R.atr=A; R.bars=b;
  // ---- СКАНЕР
  const vols=b.map(x=>x[5]); const hasVol=vols.slice(-21).filter(v=>v>0).length>=15;
  const prevAvg=sma(vols.slice(-21,-1),20); const vr=hasVol&&prevAvg>0?L[5]/prevAvg:null;
  const rangeX=(L[2]-L[3])/A;
  const w=b.slice(-25,-1); const hi=Math.max(...w.map(x=>x[2])), lo=Math.min(...w.map(x=>x[3]));
  const rnd=Math.round(last/ins.round)*ins.round;
  const nearHi=Math.abs(hi-last)<0.4*A||last>hi, nearLo=Math.abs(last-lo)<0.4*A||last<lo, nearRound=Math.abs(last-rnd)<0.3*A;
  const s20=sma(c,20), s50=sma(c,50);
  const dir= last>s20&&s20>s50?'long': last<s20&&s20<s50?'short':null;
  R.flags={unusualVol:vr!=null&&vr>=1.5, rangeX:rangeX>=1.5, level:nearHi||nearLo||nearRound};
  let sc=[];
  if(vr==null) sc.push(`По ${ins.loc} биржевого объёма в источнике нет — смотрю только размах свечей.`);
  else if(vr>=1.5) sc.push(`На ${ins.loc} странный объём: последний час ×${vr.toFixed(1)} к среднему за 20 баров.`);
  else sc.push(`Объём спокойный: ×${vr.toFixed(1)} к среднему за 20 баров, всплеска нет.`);
  if(rangeX>=1.5) sc.push(`Свеча широкая — ${rangeX.toFixed(1)} ATR.`);
  if(last>hi) sc.push(`Пробили максимум суток ${P(hi)}.`); else if(last<lo) sc.push(`Пробили минимум суток ${P(lo)}.`);
  else if(nearHi) sc.push(`Цена ${P(last)} у максимума суток ${P(hi)}.`); else if(nearLo) sc.push(`Цена ${P(last)} у минимума суток ${P(lo)}.`);
  else if(nearRound) sc.push(`Цена ${P(last)} у круглого уровня ${P(rnd)}.`);
  else sc.push(`Цена ${P(last)} в середине диапазона ${P(lo)}–${P(hi)}.`);
  R.scanner=sc.join(' ');
  // ---- НОВОСТИ
  let nw={support:false};
  if(!news||!news.length){R.news='Лента недоступна — новости загрузить не удалось. Причину движения не называю.';}
  else{
    const fresh=news.map(n=>({...n,t:Date.parse(n.date)||0})).filter(n=>now-n.t<72*3600e3).sort((a,b)=>b.t-a.t);
    const score=n=>(MACRO.test(n.title)?2:0)+(BULL.test(n.title)||BEAR.test(n.title)?1:0);
    const pick=fresh.slice(0,12).sort((a,b)=>score(b)-score(a)||b.t-a.t)[0];
    if(!pick){R.news='Свежих новостей за 72 часа не нашёл — фон пустой.';}
    else{
      const tone=BULL.test(pick.title)&&!BEAR.test(pick.title)?'long':BEAR.test(pick.title)&&!BULL.test(pick.title)?'short':null;
      nw={support:!!(tone&&dir&&tone===dir),tone,item:pick};
      const h=Math.max(1,Math.round((now-pick.t)/3600e3));
      R.news=`${MACRO.test(pick.title)?'Нашёл возможную причину':'Главное в ленте'} (${h} ч назад): «${pick.title.replace(/\s+-\s+[^-]+$/,'')}». `+
        (tone?`Тон: ${tone==='long'?'в пользу роста':'в пользу снижения'}.`:'Направление из заголовка неясно.');
      R.newsLink=pick.link;
    }
  }
  R.newsInfo=nw;
  // ---- ТРЕЙДЕР
  const sw=b.slice(-13,-1);
  if(!dir){R.trader=`Сетапа нет: цена ${P(last)} между средними (SMA20 ${P(s20)}, SMA50 ${P(s50)}), тренда нет.`;R.plan=null;}
  else{
    const k=dir==='long'?1:-1;
    const entry=last-k*0.3*A;
    const swing=dir==='long'?Math.min(...sw.map(x=>x[3])):Math.max(...sw.map(x=>x[2]));
    let risk=Math.abs(entry-swing)+0.2*A; risk=Math.min(Math.max(risk,1*A),3*A);
    const stop=entry-k*risk, take=entry+k*2*risk;
    R.plan={dir,entry,stop,take};
    R.trader=`${dir==='long'?'Лонг':'Шорт'} от отката: вход ${P(entry)}, стоп ${P(stop)}, тейк ${P(take)} (≈2R, риск ${P(risk)} ≈ ${(risk/A).toFixed(1)} ATR).`;
  }
  // ---- СКЕПТИК
  const conf=[]; if(R.flags.unusualVol)conf.push('объём'); if(nw.support)conf.push('новости'); if(R.flags.level&&(R.flags.rangeX||last>hi||last<lo))conf.push('уровень');
  const against=nw.tone&&dir&&nw.tone!==dir;
  R.conf=conf;
  if(!R.plan){R.verdict='пропустить';R.skeptic='Согласен — без тренда не торгую. Пропускаем.';}
  else if(conf.length>=2&&!against){R.verdict='вход';R.skeptic=`Принято. Подтверждений ${conf.length}: ${conf.join(', ')}. Но стоп — обязателен.`;}
  else if(against){R.verdict='пропустить';R.skeptic='Против. Новости играют в обратную сторону от сделки. Пропускаем.';}
  else if(conf.length===1){R.verdict='ждать';R.skeptic=`Рано. Есть только ${conf[0]}, второго подтверждения нет. Ждём ретест ${P(R.plan.entry)}.`;}
  else{R.verdict='ждать';R.skeptic='Рано. Подтверждения нет: ни объёма, ни новостей, ни пробоя уровня.';}
  R.traderReply= R.plan&&R.verdict==='ждать'?'Ок, ждём ретест.': R.plan&&R.verdict==='пропустить'?'Ладно, снимаю идею.':null;
  return R;
}
root.Committee={analyze,fmt,closedBars};
if(typeof module!=='undefined')module.exports=root.Committee;
})(typeof window!=='undefined'?window:globalThis);
