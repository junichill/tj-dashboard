// --- 基本設定 ---
const API_KEY = 'eed3942fcebd430b2e32dfff2c611b11';
const LAT = 35.6895; const LON = 139.6917;

// --- Tick CLOCK (安定版) ---
function handleTickInit(tick) {
  const secondsEl = document.getElementById('seconds-static');
  Tick.helper.interval(() => {
    const d = new Date();
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    tick.value = { hours1: h[0], hours2: h[1], minutes1: m[0], minutes2: m[1] };
    if (secondsEl) secondsEl.textContent = d.getSeconds().toString().padStart(2, '0');
  }, 1000);
}

// --- Weather Icons ---
const WEATHER_ICONS = {
  sunny: '☀️', cloudy: '☁️', rainy: '🌧️', snowy: '❄️'
};

function getWeatherType(id) {
  if (id >= 200 && id < 600) return 'rainy';
  if (id >= 600 && id < 700) return 'snowy';
  return (id >= 801) ? 'cloudy' : 'sunny';
}

// --- 中央パネル更新ロジック ---
let weatherSlideIndex = 0;
let weatherTimer = null;

async function fetchWeather() {
  try {
    const r = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=ja`);
    const d = await r.json();
    const type = getWeatherType(d.list[0].weather[0].id);
    
    // 背景切り替え
    document.getElementById('weather-bg-overlay').className = `weather-bg-overlay bg-${type}`;

    const wrapper = document.getElementById('forecast-wrapper');
    
    // スライド構成：特大天気 -> 経済カレンダー -> 指標チャート
    wrapper.innerHTML = `
      <div class="day-group">
        <div class="massive-weather-icon">${WEATHER_ICONS[type]}</div>
        <div class="massive-temp">${Math.round(d.list[0].main.temp)}°C</div>
        <div class="day-label">${d.list[0].weather[0].description}</div>
      </div>
      <div class="day-group">
        <div class="day-label">— ECONOMIC CALENDAR —</div>
        <div class="calendar-item">
          <div class="calendar-time">22:30 COUNTDOWN</div>
          <div class="calendar-event">米・雇用統計発表</div>
        </div>
        <div class="calendar-item">
          <div class="calendar-time">04:00 UP NEXT</div>
          <div class="calendar-event">FOMC 政策金利発表</div>
        </div>
      </div>
      <div class="day-group">
        <div class="day-label">— S&P 500 —</div>
        <div id="tv-sp500" style="width:700px; height:180px;"></div>
      </div>
    `;

    initTradingViewWidgets();
    startWeatherCycle();
  } catch (e) { console.error(e); }
}

function startWeatherCycle() {
  const wrapper = document.getElementById('forecast-wrapper');
  if (weatherTimer) clearInterval(weatherTimer);
  weatherTimer = setInterval(() => {
    const groups = wrapper.querySelectorAll('.day-group');
    weatherSlideIndex = (weatherSlideIndex + 1) % groups.length;
    wrapper.style.transform = `translateY(${weatherSlideIndex * -450}px)`;
  }, 9000);
}

function initTradingViewWidgets() {
  const conf = { "width": "100%", "height": 150, "locale": "ja", "dateRange": "1D", "colorTheme": "dark", "isTransparent": true, "interval": "5" };
  appendWidget("tv-usd-jpy-fixed", { ...conf, "symbol": "FX:USDJPY" });
  appendWidget("tv-n225-fixed", { ...conf, "symbol": "OSE:NK2251!" });
  appendWidget("tv-nasdaq-fixed", { ...conf, "symbol": "CAPITALCOM:US100" });
  appendWidget("tv-sp500", { ...conf, "symbol": "CAPITALCOM:US500", "height": 180 });
}

function appendWidget(id, config) {
  const container = document.getElementById(id);
  if (!container) return; container.innerHTML = '';
  const script = document.createElement('script');
  script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
  script.async = true; script.innerHTML = JSON.stringify(config);
  container.appendChild(script);
}

// --- ニューススタック・ロジック ---
const RSS_URL = 'https://news.web.nhk/n-data/conf/na/rss/cat0.xml';
let newsData = [];
let newsPointer = 0;

async function fetchNews() {
  try {
    const r = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(RSS_URL));
    const d = await r.json();
    const items = new DOMParser().parseFromString(d.contents, "application/xml").querySelectorAll('item');
    newsData = Array.from(items).map(i => i.querySelector('title').textContent);
    renderNewsStack();
    setInterval(rotateNews, 8000);
  } catch (e) { console.error(e); }
}

function renderNewsStack() {
  const container = document.getElementById('news-stack-container');
  container.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const card = document.createElement('div');
    card.className = `news-card-item pos-${i}`;
    card.innerHTML = `<div class="news-mark">NHK NEWS FLASH</div><div class="news-title">${newsData[i] || 'Loading...'}</div>`;
    container.appendChild(card);
  }
}

function rotateNews() {
  const container = document.getElementById('news-stack-container');
  const cards = Array.from(container.querySelectorAll('.news-card-item'));
  
  // 0番目を退場させる
  cards[0].classList.replace('pos-0', 'exit');
  // 1, 2番目を繰り上げる
  cards[1].classList.replace('pos-1', 'pos-0');
  cards[2].classList.replace('pos-2', 'pos-1');

  setTimeout(() => {
    cards[0].remove();
    newsPointer = (newsPointer + 1) % newsData.length;
    const nextIdx = (newsPointer + 2) % newsData.length;
    const newCard = document.createElement('div');
    newCard.className = `news-card-item pos-2`;
    newCard.innerHTML = `<div class="news-mark">NHK NEWS FLASH</div><div class="news-title">${newsData[nextIdx]}</div>`;
    container.appendChild(newCard);
  }, 900);
}

// --- INIT ---
window.addEventListener('load', () => { fetchWeather(); fetchNews(); });
