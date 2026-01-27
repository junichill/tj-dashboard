// =========================
// 1. CLOCK & DATE (左パネル維持)
// =========================
function handleTickInit(tick) {
  const secondsEl = document.getElementById('seconds-static');
  Tick.helper.interval(() => {
    const d = new Date();
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    const s = d.getSeconds().toString().padStart(2, '0');
    tick.value = { hours1: h[0], hours2: h[1], minutes1: m[0], minutes2: m[1] };
    if (secondsEl) { secondsEl.textContent = s; }
  }, 1000);
}

function updateDate() {
  const now = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayName = days[now.getDay()];
  const monthName = months[now.getMonth()];
  const date = now.getDate();
  const year = now.getFullYear();
  const reiwa = year - 2018;
  const dateEl = document.getElementById('date');
  if (dateEl) {
    dateEl.innerHTML = `${dayName}, ${monthName} ${date}, ${year} <span class="era-label">(R${reiwa})</span>`;
  }
}

// =========================
// 2. WEATHER SETTINGS & LOGIC (左上パネル)
// =========================
const API_KEY = 'eed3942fcebd430b2e32dfff2c611b11';
const LAT = 35.6895;
const LON = 139.6917;

const WEATHER_ICONS = {
  sunny: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4"><circle cx="32" cy="32" r="12"/><line x1="32" y1="2" x2="32" y2="14"/><line x1="32" y1="50" x2="32" y2="62"/><line x1="2" y1="32" x2="14" y2="32"/><line x1="50" y1="32" x2="62" y2="32"/><line x1="10" y1="10" x2="18" y2="18"/><line x1="46" y1="46" x2="54" y2="54"/><line x1="46" y1="18" x2="54" y2="10"/><line x1="10" y1="54" x2="18" y2="46"/></svg>`,
  cloudy: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4"><path d="M20 44h26a10 10 0 0 0 0-20 14 14 0 0 0-27-4A10 10 0 0 0 20 44z"/></svg>`,
  rainy: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 36c0-11 9-20 20-20s20 9 20 20H12z" /><line x1="32" y1="16" x2="32" y2="12" /><path d="M32 36v12c0 4-3 7-7 7s-7-3-7-7" /></svg>`,
  snowy: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="46" r="14" /><circle cx="32" cy="22" r="10" /><circle cx="28" cy="20" r="0.5" fill="currentColor" stroke="none" /><circle cx="36" cy="20" r="0.5" fill="currentColor" stroke="none" /><line x1="20" y1="40" x2="12" y2="32" /><line x1="44" y1="40" x2="52" y2="32" /></svg>`,
};

function getWeatherType(id) {
  if (id >= 200 && id < 600) return 'rainy';
  if (id >= 600 && id < 700) return 'snowy';
  if (id >= 801) return 'cloudy';
  return 'sunny';
}

async function updateWeatherPanel() {
  try {
    const r = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=ja`);
    const d = await r.json();
    const container = document.getElementById('weather-content');
    if (!container || !d.list) return;

    let showWeekly = false;
    const render = () => {
      container.style.opacity = 0;
      setTimeout(() => {
        container.innerHTML = showWeekly ? createWeeklyForecastHtml(d.list) : createForecastGroupHtml(d.list.slice(0, 5), "Today");
        container.style.opacity = 1;
        showWeekly = !showWeekly;
      }, 500);
    };
    render();
    setInterval(render, 15000); 
  } catch (err) { console.error('Weather error:', err); }
}

function createForecastGroupHtml(list, label) {
  const items = list.map(item => {
    const hour = new Date(item.dt * 1000).getHours() + ":00";
    const type = getWeatherType(item.weather[0].id);
    return `<div class="forecast-item"><span>${hour}</span><span class="weather-icon weather-${type}">${WEATHER_ICONS[type]}</span><span>${Math.round(item.main.temp)}℃</span></div>`;
  }).join('');
  return `<div class="day-group"><div class="day-label">— ${label} —</div><div class="day-items">${items}</div></div>`;
}

function createWeeklyForecastHtml(list) {
  // 週間の簡易ロジック（重複除外）
  const daily = {};
  list.forEach(item => {
    const d = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
    if (!daily[d]) daily[d] = { temp: item.main.temp, id: item.weather[0].id };
  });
  const items = Object.keys(daily).slice(1, 6).map(day => {
    const type = getWeatherType(daily[day].id);
    return `<div class="forecast-item"><span>${day}</span><span class="weather-icon weather-${type}">${WEATHER_ICONS[type]}</span><span>${Math.round(daily[day].temp)}℃</span></div>`;
  }).join('');
  return `<div class="day-group"><div class="day-label">— Weekly —</div><div class="day-items">${items}</div></div>`;
}

// =========================
// 3. GOOGLE TRENDS (右上パネル)
// =========================
async function fetchGoogleTrends() {
  try {
    const RSS_URL = 'https://trends.google.co.jp/trends/trendingsearches/daily/rss?geo=JP';
    const r = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(RSS_URL));
    const data = await r.json();
    const xml = new DOMParser().parseFromString(data.contents, "application/xml");
    const items = Array.from(xml.querySelectorAll('item')).slice(0, 6);
    const html = items.map((item, i) => `
      <div class="trend-item">
        <span class="trend-rank">0${i+1}</span>
        <span class="trend-word">${item.querySelector('title').textContent}</span>
      </div>`).join('');
    document.getElementById('trend-content').innerHTML = html;
  } catch (e) { console.error("Trend error", e); }
}

// =========================
// 4. TRADINGVIEW WIDGETS (左・中央下・左固定)
// =========================
function initAllWidgets() {
  const conf = { "width": "100%", "height": 155, "locale": "ja", "dateRange": "1D", "colorTheme": "dark", "isTransparent": true, "interval": "5" };
  
  // 左パネルの固定表示 (USD/JPY, NK225, NASDAQ)
  appendMiniWidget("tv-usd-jpy-fixed", { ...conf, "symbol": "FX:USDJPY" });
  appendMiniWidget("tv-n225-fixed",    { ...conf, "symbol": "OSE:NK2251!" });
  appendMiniWidget("tv-nasdaq-fixed",  { ...conf, "symbol": "CAPITALCOM:US100" });

  // 中央下：テクニカルゲージ
  const gaugeContainer = document.getElementById("tv-gauge-container");
  if(gaugeContainer) {
    const s = document.createElement('script');
    s.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
    s.async = true;
    s.innerHTML = JSON.stringify({
      "interval": "1D", "width": "100%", "height": "100%", "isTransparent": true,
      "symbol": "FX:USDJPY", "showIntervalTabs": false, "locale": "ja", "colorTheme": "dark"
    });
    gaugeContainer.appendChild(s);
  }

  // 中央下：経済カレンダー
  const calContainer = document.getElementById("tv-calendar-container");
  if(calContainer) {
    const s = document.createElement('script');
    s.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    s.async = true;
    s.innerHTML = JSON.stringify({
      "colorTheme": "dark", "isTransparent": true, "width": "100%", "height": "100%",
      "locale": "ja", "importanceFilter": "-1,0,1", "currencyFilter": "USD,JPY"
    });
    calContainer.appendChild(s);
  }
}

function appendMiniWidget(containerId, config) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = ''; 
    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify(config);
    container.appendChild(script);
}

// =========================
// 5. NEWS (右パネル維持)
// =========================
const NEWS_RSS = 'https://news.web.nhk/n-data/conf/na/rss/cat0.xml';
let newsItems = [], index = 0, newsT = null;

async function fetchNews() {
  try {
    const r = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(NEWS_RSS));
    const data = await r.json();
    const xml = new DOMParser().parseFromString(data.contents, "application/xml");
    newsItems = Array.from(xml.querySelectorAll('item')).map(item => ({
      title: item.querySelector('title')?.textContent,
      link: item.querySelector('link')?.textContent,
      description: item.querySelector('description')?.textContent
    }));
    renderNews();
  } catch (e) { console.error('News error', e); }
}

function renderNews() {
  const card = document.getElementById('news-card');
  if (!newsItems.length) return;
  const showNext = () => {
    const item = newsItems[index];
    card.innerHTML = `<div class="news-item show">
      <div class="news-title">${item.title}</div>
      <div class="news-description">${item.description}</div>
    </div>`;
    index = (index + 1) % newsItems.length;
  };
  showNext();
  setInterval(showNext, 11000);
}

// =========================
// 6. SCALING & INIT
// =========================
function adjustScale() {
  const container = document.getElementById('container');
  if (!container) return;
  let scale = Math.min(window.innerWidth / 1920, window.innerHeight / 720);
  container.style.transform = `scale(${scale})`;
}

window.onload = () => {
  updateDate();
  updateWeatherPanel();
  fetchGoogleTrends();
  initAllWidgets();
  fetchNews();
  adjustScale();
};
window.onresize = adjustScale;
