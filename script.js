const API_KEY = 'eed3942fcebd430b2e32dfff2c611b11';
const LAT = 35.6895; const LON = 139.6917;

// --- Tick CLOCK ---
function handleTickInit(tick) {
  const secondsEl = document.getElementById('seconds-static');
  Tick.helper.interval(() => {
    const d = new Date();
    tick.value = { 
      hours1: d.getHours().toString().padStart(2, '0')[0], 
      hours2: d.getHours().toString().padStart(2, '0')[1],
      minutes1: d.getMinutes().toString().padStart(2, '0')[0], 
      minutes2: d.getMinutes().toString().padStart(2, '0')[1]
    };
    if (secondsEl) secondsEl.textContent = d.getSeconds().toString().padStart(2, '0');
  }, 1000);
}

// --- Weather Visuals ---
const WEATHER_ICONS = { sunny: '☀️', cloudy: '☁️', rainy: '🌧️', snowy: '❄️' };
function getWeatherType(id) {
  if (id >= 200 && id < 600) return 'rainy';
  if (id >= 600 && id < 700) return 'snowy';
  return (id >= 801) ? 'cloudy' : 'sunny';
}

async function fetchWeather() {
  try {
    const r = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=ja`);
    const d = await r.json();
    const type = getWeatherType(d.list[0].weather[0].id);
    document.getElementById('weather-bg-overlay').className = `weather-bg-overlay bg-${type}`;

    const wrapper = document.getElementById('forecast-wrapper');
    wrapper.innerHTML = `
      <div class="day-group">
        <div class="massive-weather-icon">${WEATHER_ICONS[type]}</div>
        <div class="massive-temp">${Math.round(d.list[0].main.temp)}°C</div>
        <div class="day-label">${d.list[0].weather[0].description.toUpperCase()}</div>
      </div>
      <div class="day-group">
        <div class="day-label">— ECONOMIC CALENDAR —</div>
        <div id="tv-economic-calendar" style="width:90%; height:350px;"></div>
      </div>
      <div class="day-group">
        <div class="day-label">— MARKET FOCUS —</div>
        <div id="tv-sp500" style="width:750px; height:200px;"></div>
      </div>
    `;
    initTV();
    startSlide();
  } catch (e) { console.error(e); }
}

let slideIdx = 0;
function startSlide() {
  setInterval(() => {
    slideIdx = (slideIdx + 1) % 3;
    document.getElementById('forecast-wrapper').style.transform = `translateY(${slideIdx * -450}px)`;
  }, 10000);
}

function initTV() {
  const common = { "colorTheme": "dark", "isTransparent": true, "locale": "ja" };
  // 左固定
  renderTV("tv-usd-jpy-fixed", { ...common, "width":"100%", "height":150, "symbol":"FX:USDJPY" });
  renderTV("tv-n225-fixed", { ...common, "width":"100%", "height":150, "symbol":"OSE:NK2251!" });
  renderTV("tv-nasdaq-fixed", { ...common, "width":"100%", "height":150, "symbol":"CAPITALCOM:US100" });
  // 中央
  renderTV("tv-sp500", { ...common, "width":"100%", "height":200, "symbol":"CAPITALCOM:US500" });
  
  // 経済カレンダー
  const cal = document.createElement('script');
  cal.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
  cal.async = true;
  cal.innerHTML = JSON.stringify({ ...common, "width":"100%", "height":"100%", "importanceFilter":"-1,0,1", "currencyFilter":"USD,JPY,EUR" });
  document.getElementById('tv-economic-calendar').appendChild(cal);
}

function renderTV(id, cfg) {
  const el = document.getElementById(id); if (!el) return;
  const s = document.createElement('script');
  s.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
  s.async = true; s.innerHTML = JSON.stringify(cfg);
  el.appendChild(s);
}

// --- News Stack ---
let news = [];
let newsPtr = 0;
async function fetchNews() {
  try {
    const r = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://news.web.nhk/n-data/conf/na/rss/cat0.xml'));
    const d = await r.json();
    const items = new DOMParser().parseFromString(d.contents, "application/xml").querySelectorAll('item');
    news = Array.from(items).map(i => i.querySelector('title').textContent);
    const container = document.getElementById('news-stack-container');
    for(let i=0; i<3; i++) createCard(i, i);
    setInterval(rotateNews, 8000);
  } catch (e) { console.error(e); }
}

function createCard(posIdx, dataIdx) {
  const c = document.createElement('div');
  c.className = `news-card-item pos-${posIdx}`;
  c.innerHTML = `<div class="news-mark">NHK NEWS FLASH</div><div class="news-title">${news[dataIdx % news.length]}</div>`;
  document.getElementById('news-stack-container').appendChild(c);
}

function rotateNews() {
  const container = document.getElementById('news-stack-container');
  const cards = container.querySelectorAll('.news-card-item');
  cards[0].classList.replace('pos-0', 'exit');
  cards[1].classList.replace('pos-1', 'pos-0');
  cards[2].classList.replace('pos-2', 'pos-1');
  setTimeout(() => {
    cards[0].remove();
    newsPtr = (newsPtr + 1) % news.length;
    createCard(2, newsPtr + 2);
  }, 900);
}

window.addEventListener('load', () => {
  fetchWeather(); fetchNews();
  const upDate = () => {
    const d = new Date();
    const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
    document.getElementById('date').textContent = `${d.getFullYear()}.${d.getMonth()+1}.${d.getDate()} ${days[d.getDay()]}`;
  };
  upDate(); setInterval(upDate, 60000);
});
