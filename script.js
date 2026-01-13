// DOMロード後に処理開始
document.addEventListener('DOMContentLoaded', () => {

  // 1. Flip時計初期化
  function handleTickInit(tick) {
    const secondsEl = document.getElementById('seconds-static');
    Tick.helper.interval(() => {
      const d = Tick.helper.date();
      tick.value = {
        sep: ':',
        hours: d.getHours(),
        minutes: d.getMinutes(),
        seconds: 0 // 秒は非表示
      };
      if (secondsEl) secondsEl.textContent = d.getSeconds().toString().padStart(2,'0');
    });
  }

  // 2. 日付
  const dateEl = document.getElementById('date');
  function updateDate() {
    const d = new Date();
    const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const w = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    dateEl.textContent = `${w[d.getDay()]}, ${m[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }
  updateDate();
  setInterval(updateDate, 60000);

  // 3. 天気
  const API_KEY = 'eed3942fcebd430b2e32dfff2c611b11';
  const LAT = 35.6895;
  const LON = 139.6917;
  const WEATHER_ICONS = { /* SVGは省略 */ };

  function getWeatherType(id) { /* 省略 */ }

  async function fetchWeather() {
    try {
      const r = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=ja`);
      const d = await r.json();
      const today = d.list[0];
      const tomorrow = d.list.find(v=>v.dt>today.dt+86400);
      renderWeather(today, document.getElementById('weather-icon-today'), document.getElementById('weather-temp-today'));
      if(tomorrow) renderWeather(tomorrow, document.getElementById('weather-icon-tomorrow'), document.getElementById('weather-temp-tomorrow'));
    } catch(err){ console.error('天気取得失敗',err);}
  }
  function renderWeather(data, iconEl, textEl) {
    const type = getWeatherType(data.weather[0].id);
    iconEl.className = `weather-icon weather-${type}`;
    iconEl.innerHTML = WEATHER_ICONS[type];
    textEl.textContent = `${data.main.temp.toFixed(1)}℃`;
  }
  fetchWeather();
  setInterval(fetchWeather,600000);

  // 4. ニュース
  const RSS_URL = 'https://news.web.nhk/n-data/conf/na/rss/cat0.xml';
  const newsCard = document.getElementById('news-card');
  if(!newsCard) return;

  let newsItems=[], newsEls=[], index=0, timer=null;
  const FADE=1.8, AUTO_INTERVAL=11000, FETCH_INTERVAL=10*60*1000;

  const updateEl=document.createElement('div');
  updateEl.style.cssText='position:absolute;top:10px;right:15px;font-size:12px;opacity:0.6;';
  newsCard.appendChild(updateEl);

  const indicator=document.createElement('div');
  indicator.style.cssText='position:absolute;bottom:10px;left:50%;transform:translateX(-50%);display:flex;gap:8px;';
  newsCard.appendChild(indicator);

  function isImportant(title){ return /(地震|津波|警報|注意報|台風|噴火|避難)/.test(title); }
  function updateIndicator(){ /* 省略（既存コードでOK） */ }
  function createNews(){ /* 省略（既存コードでOK） */ }
  function showNews(next, init=false){ /* 省略（既存コードでOK） */ }
  function startAuto(){ /* 既存コードでOK */ }
  function stopAuto(){ if(timer) clearInterval(timer); }

  async function fetchNews(){
    try{
      const r = await fetch('https://api.allorigins.win/get?url='+encodeURIComponent(RSS_URL));
      const data = await r.json();
      const parser = new DOMParser();
      const xml = parser.parseFromString(data.contents,"application/xml");
      const items = xml.querySelectorAll('item');
      newsItems = Array.from(items).map(item=>({
        title:item.querySelector('title')?.textContent,
        link:item.querySelector('link')?.textContent,
        pubDate:item.querySelector('pubDate')?.textContent,
        description:item.querySelector('description')?.textContent
      }));
      createNews();
      showNews(0,true);
      startAuto();
      const now = new Date();
      updateEl.textContent=`Last update ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')} JST`;
    }catch(e){console.error('News fetch failed',e);}
  }
  fetchNews();
  setInterval(fetchNews,FETCH_INTERVAL);

});
