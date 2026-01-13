// -------------------
// Flip Clock
// -------------------
function handleTickInit(tick) {
  Tick.helper.interval(() => {
    const d = Tick.helper.date();
    tick.value = { sep: ':', hours: d.getHours(), minutes: d.getMinutes(), seconds: d.getSeconds() };
  });
}

// -------------------
// Date
// -------------------
const dateEl = document.getElementById('date');
function updateDate() {
  const d = new Date();
  const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const w = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  dateEl.textContent = `${w[d.getDay()]}, ${m[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
updateDate();
setInterval(updateDate, 60000);

// -------------------
// WEATHER
// -------------------
const API_KEY = 'eed3942fcebd430b2e32dfff2c611b11';
const LAT = 35.6895;
const LON = 139.6917;

const WEATHER_ICONS = {
  sunny:`<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4"><circle cx="32" cy="32" r="12"/><line x1="32" y1="2" x2="32" y2="14"/><line x1="32" y1="50" x2="32" y2="62"/><line x1="2" y1="32" x2="14" y2="32"/><line x1="50" y1="32" x2="62" y2="32"/><line x1="10" y1="10" x2="18" y2="18"/><line x1="46" y1="46" x2="54" y2="54"/><line x1="46" y1="18" x2="54" y2="10"/><line x1="10" y1="54" x2="18" y2="46"/></svg>`,
  cloudy:`<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4"><path d="M20 44h26a10 10 0 0 0 0-20 14 14 0 0 0-27-4A10 10 0 0 0 20 44z"/></svg>`,
  rainy:`<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4"><path d="M20 36h26a10 10 0 0 0 0-20 14 14 0 0 0-27-4"/><line x1="22" y1="44" x2="18" y2="56"/><line x1="32" y1="44" x2="28" y2="56"/><line x1="42" y1="44" x2="38" y2="56"/></svg>`,
  snowy:`<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4"><path d="M20 36h26a10 10 0 0 0 0-20 14 14 0 0 0-27-4"/><circle cx="24" cy="48" r="2"/><circle cx="32" cy="54" r="2"/><circle cx="40" cy="48" r="2"/></svg>`
};

function getWeatherType(id){
  if(id>=200&&id<600)return 'rainy';
  if(id>=600&&id<700)return 'snowy';
  if(id>=801)return 'cloudy';
  return 'sunny';
}

async function fetchWeather(){
  try{
    const r=await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=ja`);
    const d=await r.json();
    const today=d.list[0];
    const tomorrow=d.list.find(v=>v.dt>today.dt+86400);
    renderWeather(today,document.getElementById('weather-icon-today'),document.getElementById('weather-temp-today'));
    if(tomorrow) renderWeather(tomorrow,document.getElementById('weather-icon-tomorrow'),document.getElementById('weather-temp-tomorrow'));
  }catch(e){console.error("天気情報取得失敗",e);}
}

function renderWeather(data, iconEl, textEl){
  const type=getWeatherType(data.weather[0].id);
  iconEl.className=`weather-icon weather-${type}`;
  iconEl.innerHTML=WEATHER_ICONS[type];
  textEl.textContent=`${data.main.temp.toFixed(1)}℃`;
}

fetchWeather(); setInterval(fetchWeather,600000);

// -------------------
// NEWS (NHK RSS + JST表示)
// -------------------
const RSS_URL = 'https://news.web.nhk/n-data/conf/na/rss/cat0.xml';
const newsCard = document.getElementById('news-card');
let newsItems=[],newsEls=[],index=0,timer=null;
const FADE=1.8,AUTO_INTERVAL=11000,FETCH_INTERVAL=600000;

const updateEl=document.createElement('div');
updateEl.style.position='absolute';
updateEl.style.top='10px';
updateEl.style.right='15px';
updateEl.style.fontSize='12px';
updateEl.style.opacity='0.6';
newsCard.appendChild(updateEl);

const indicator=document.createElement('div');
indicator.style.position='absolute';
indicator.style.bottom='10px';
indicator.style.left='50%';
indicator.style.transform='translateX(-50%)';
indicator.style.display='flex';
indicator.style.gap='8px';
newsCard.appendChild(indicator);

function isImportant(title){return /(地震|津波|警報|注意報|台風|噴火|避難)/.test(title);}
function updateIndicator(){indicator.innerHTML=''; newsItems.forEach((_,i)=>{const dot=document.createElement('div'); dot.style.width=dot.style.height='10px'; dot.style.borderRadius='50%'; dot.style.background=i===index?'#fff':'#555'; dot.style.cursor='pointer'; dot.onclick=()=>{if(i===index)return; stopAuto(); showNews(i); startAuto();}; indicator.appendChild(dot);});}

function createNews(){
  newsCard.querySelectorAll('.news-item').forEach(e=>e.remove());
  newsEls=newsItems.map(n=>{const div=document.createElement('div'); div.className='news-item'; if(isImportant(n.title)) div.classList.add('important'); div.innerHTML=`<a class="news-title" href="${n.link}" target="_blank">${n.title}</a><div class="news-pubdate">${n.pubDate}</div>`; newsCard.appendChild(div); return div;});
  updateIndicator();
}

function showNews(next,init=false){
  if(!newsEls[next])return;
  if(init){newsEls[next].classList.add('show'); index=next; updateIndicator(); return;}
  newsEls[index].classList.remove('show');
  setTimeout(()=>{newsEls[next].classList.add('show'); index=next; updateIndicator();},FADE*1000);
}

function startAuto(){stopAuto(); timer=setInterval(()=>{showNews((index+1)%newsEls.length);},AUTO_INTERVAL);}
function stopAuto(){if(timer) clearInterval(timer);}

async function fetchNews(){
  try{
    const proxy='https://api.allorigins.win/get?url=';
    const r=await fetch(proxy+encodeURIComponent(RSS_URL));
    const data=await r.json();
    const parser=new DOMParser();
    const xml=parser.parseFromString(data.contents,'text/xml');
    const items=Array.from(xml.querySelectorAll('item'));
    newsItems=items.map(item=>({
      title:item.querySelector('title')?.textContent||'',
      link:item.querySelector('link')?.textContent||'#',
      pubDate:item.querySelector('pubDate')?.textContent||''
    }));
    createNews(); showNews(0,true); startAuto();
    const now=new Date();
    updateEl.textContent=`Last update ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')} JST`;
  }catch(e){console.error("News fetch failed",e);}
}

fetchNews(); setInterval(fetchNews,FETCH_INTERVAL);
