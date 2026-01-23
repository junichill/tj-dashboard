// =========================
// Tick CLOCK
// =========================
function handleTickInit(tick) {
  const secondsEl = document.getElementById('seconds-static');
  Tick.helper.interval(() => {
    const d = new Date();
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    if (secondsEl) secondsEl.textContent = d.getSeconds().toString().padStart(2, '0');
    tick.value = { hours1: h[0], hours2: h[1], minutes1: m[0], minutes2: m[1] };
  }, 1000);
}

// =========================
// DATE
// =========================
function updateDate() {
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const reiwa = now.getFullYear() - 2018;
    document.getElementById('date').innerHTML = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()} (R${reiwa})`;
}
updateDate(); setInterval(updateDate, 60000);

// =========================
// WEATHER 設定 & アイコン
// =========================
const API_KEY = 'eed3942fcebd430b2e32dfff2c611b11';
const LAT = 35.6895; const LON = 139.6917;
const WEATHER_ICONS = {
  sunny: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4"><circle cx="32" cy="32" r="12"/><line x1="32" y1="2" x2="32" y2="14"/><line x1="32" y1="50" x2="32" y2="62"/><line x1="2" y1="32" x2="14" y2="32"/><line x1="50" y1="32" x2="62" y2="32"/><line x1="10" y1="10" x2="18" y2="18"/><line x1="46" y1="46" x2="54" y2="54"/><line x1="46" y1="18" x2="54" y2="10"/><line x1="10" y1="54" x2="18" y2="46"/></svg>`,
  cloudy: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4"><path d="M20 44h26a10 10 0 0 0 0-20 14 14 0 0 0-27-4A10 10 0 0 0 20 44z"/></svg>`,
  rainy: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 36c0-11 9-20 20-20s20 9 20 20H12z" /><path d="M32 36v12c0 4-3 7-7 7s-7-3-7-7" /></svg>`,
  snowy: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="46" r="14" /><circle cx="32" cy="22" r="10" /></svg>`
};

function getWeatherType(id) {
  if (id >= 200 && id < 600) return 'rainy';
  if (id >= 600 && id < 700) return 'snowy';
  return (id >= 801) ? 'cloudy' : 'sunny';
}

// =========================
// HTML生成
// =========================
function createForecastGroupHtml(list, label) {
  const items = list.map(item => {
    const type = getWeatherType(item.weather[0].id);
    return `<div class="forecast-item">
      <div class="forecast-time">${new Date(item.dt * 1000).getHours()}:00</div>
      <div class="weather-icon weather-${type}">${WEATHER_ICONS[type]}</div>
      <div class="forecast-temp">${Math.round(item.main.temp)}℃</div>
    </div>`;
  }).join('');
  return `<div class="day-group"><div class="day-label">— ${label} —</div><div class="day-items">${items}</div></div>`;
}

function createWeeklyForecastHtml(list) {
  const daily = {};
  list.forEach(item => {
    const d = new Date(item.dt * 1000).getDate();
    if (!daily[d]) daily[d] = { temps: [], ids: [] };
    daily[d].temps.push(item.main.temp); daily[d].ids.push(item.weather[0].id);
  });
  const items = Object.keys(daily).slice(1, 6).map(d => {
    const day = daily[d];
    const type = getWeatherType(day.ids[0]);
    return `<div class="forecast-item weekly-item">
      <div class="forecast-time">Day ${d}</div>
      <div class="weather-icon weather-${type}">${WEATHER_ICONS[type]}</div>
      <div class="forecast-temp">${Math.round(Math.max(...day.temps))} / ${Math.round(Math.min(...day.temps))}</div>
    </div>`;
  }).join('');
  return `<div class="day-group"><div class="day-label">— WEEKLY OUTLOOK —</div><div class="day-items">${items}</div></div>`;
}

// =========================
// WEATHER & MARKET
// =========================
let weatherSlideIndex = 0; let weatherTimer = null;

async function fetchWeather() {
  try {
    const r = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=ja`);
    const d = await r.json();
    if (!d || !d.list) return;

    const wrapper = document.getElementById('forecast-wrapper');
    const mktHtml = (id, label) => `<div class="day-group"><div class="day-label">— ${label} —</div><div id="${id}" style="width:700px; height:150px; transform:scale(1.1);"></div></div>`;

    wrapper.innerHTML = createForecastGroupHtml(d.list.slice(0, 8), "TODAY'S FORECAST") +
                        createForecastGroupHtml(d.list.slice(8, 16), "TOMORROW'S PLAN") +
                        createWeeklyForecastHtml(d.list) +
                        mktHtml("tv-sp500", "S&P 500 INDEX") +
                        mktHtml("tv-gold", "GOLD SPOT") +
                        mktHtml("tv-oil", "WTI CRUDE OIL") +
                        mktHtml("tv-eur-jpy", "EUR/JPY") +
                        mktHtml("tv-eur-usd", "EUR/USD");

    initTradingViewWidgets();
    weatherSlideIndex = 0; wrapper.style.transform = `translateY(0px)`;
    startWeatherCycle();
  } catch (e) { console.error(e); }
}

function initTradingViewWidgets() {
  const conf = { "width": "100%", "height": 155, "locale": "ja", "dateRange": "1D", "colorTheme": "dark", "isTransparent": true, "interval": "5" };
  appendMiniWidget("tv-usd-jpy-fixed", { ...conf, "symbol": "FX:USDJPY" });
  appendMiniWidget("tv-n225-fixed", { ...conf, "symbol": "OSE:NK2251!" });
  appendMiniWidget("tv-nasdaq-fixed", { ...conf, "symbol": "CAPITALCOM:US100" });

  const sConf = { ...conf, "height": 150 };
  appendMiniWidget("tv-sp500", { ...sConf, "symbol": "CAPITALCOM:US500" });
  appendMiniWidget("tv-gold", { ...sConf, "symbol": "TVC:GOLD" });
  appendMiniWidget("tv-oil", { ...sConf, "symbol": "CAPITALCOM:OIL_CRUDE" });
  appendMiniWidget("tv-eur-jpy", { ...sConf, "symbol": "FX:EURJPY" });
  appendMiniWidget("tv-eur-usd", { ...sConf, "symbol": "FX:EURUSD" });
}

function appendMiniWidget(containerId, config) {
  const container = document.getElementById(containerId);
  if (!container) return; container.innerHTML = '';
  const script = document.createElement('script');
  script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
  script.async = true; script.innerHTML = JSON.stringify(config);
  container.appendChild(script);
}

function startWeatherCycle() {
  if (weatherTimer) clearInterval(weatherTimer);
  const wrapper = document.getElementById('forecast-wrapper');
  weatherTimer = setInterval(() => {
    const groups = wrapper.querySelectorAll('.day-group');
    weatherSlideIndex = (weatherSlideIndex + 1) % groups.length;
    wrapper.style.transform = `translateY(${weatherSlideIndex * -220}px)`;
    groups.forEach((g, i) => g.classList.toggle('inactive', i !== weatherSlideIndex));
  }, 9000);
}

// =========================
// NEWS
// =========================
const RSS_URL = 'https://news.web.nhk/n-data/conf/na/rss/cat0.xml';
let newsItems = [], newsEls = [], nIndex = 0, nTimer = null;

async function fetchNews() {
  try {
    const r = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(RSS_URL));
    const data = await r.json();
    const items = new DOMParser().parseFromString(data.contents, "application/xml").querySelectorAll('item');
    newsItems = Array.from(items).map(i => ({
      title: i.querySelector('title')?.textContent,
      link: i.querySelector('link')?.textContent,
      description: i.querySelector('description')?.textContent
    }));
    createNews();
  } catch (e) { console.error(e); }
}

function createNews() {
  const card = document.getElementById('news-card');
  card.querySelectorAll('.news-item').forEach(e => e.remove());
  newsEls = newsItems.map(n => {
    const div = document.createElement('div');
    div.className = 'news-item';
    div.innerHTML = `<div class="news-mark">NHK NEWS FLASH</div><a class="news-title" href="${n.link}" target="_blank">${n.title}</a><div class="news-description">${n.description}</div>`;
    card.appendChild(div); return div;
  });
  showNews(0); startAutoNews();
}

function showNews(idx) {
  if (!newsEls[idx]) return;
  newsEls[nIndex].classList.remove('show');
  nIndex = idx;
  newsEls[nIndex].classList.add('show');
}

function startAutoNews() {
  if (nTimer) clearInterval(nTimer);
  nTimer = setInterval(() => showNews((nIndex + 1) % newsEls.length), 11000);
}

// =========================
// SCALING & INIT
// =========================
function adjustScale() {
  const container = document.getElementById('container');
  const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 720);
  container.style.transform = `scale(${scale})`;
}

window.addEventListener('resize', adjustScale);
window.addEventListener('load', () => { adjustScale(); fetchWeather(); fetchNews(); });
