// =========================
// Tick CLOCK
// =========================
function handleTickInit(tick) {
  const secondsEl = document.getElementById('seconds-static');

  Tick.helper.interval(() => {
    const d = new Date();
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    const s = d.getSeconds().toString().padStart(2, '0');

    tick.value = {
      hours1: h[0],
      hours2: h[1],
      minutes1: m[0],
      minutes2: m[1]
    };

    if (secondsEl) {
      secondsEl.textContent = s;
    }
  }, 1000);
}

// =========================
// DATE
// =========================
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
updateDate();
setInterval(updateDate, 60000);

// =========================
// WEATHER 設定 & アイコン
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

// =========================
// HTML生成関数
// =========================
function createForecastGroupHtml(list, label) {
  const itemsHtml = list.map(item => {
    const date = new Date(item.dt * 1000);
    const hour = date.getHours().toString().padStart(2, '0') + ":00";
    const temp = Math.round(item.main.temp);
    const type = getWeatherType(item.weather[0].id);
    return `
      <div class="forecast-item">
        <div class="forecast-time">${hour}</div>
        <div class="weather-icon weather-${type}">${WEATHER_ICONS[type]}</div>
        <div class="forecast-temp">${temp}℃</div>
      </div>`;
  }).join('');
  return `<div class="day-group"><div class="day-label">— ${label} —</div><div class="day-items">${itemsHtml}</div></div>`;
}

function createWeeklyForecastHtml(list) {
  const dailyData = {};
  list.forEach(item => {
    const dateObj = new Date(item.dt * 1000);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = dateObj.getDate();
    const dateKey = `${dayName} ${dayNum}`;
    if (!dailyData[dateKey]) dailyData[dateKey] = { temps: [], ids: [] };
    dailyData[dateKey].temps.push(item.main.temp);
    dailyData[dateKey].ids.push(item.weather[0].id);
  });

  let itemsHtml = '';
  Object.keys(dailyData).slice(1, 6).forEach(date => {
    const day = dailyData[date];
    const maxTemp = Math.round(Math.max(...day.temps));
    const minTemp = Math.round(Math.min(...day.temps));
    const midId = day.ids[Math.floor(day.ids.length / 2)];
    const type = getWeatherType(midId);
    itemsHtml += `
      <div class="forecast-item weekly-item">
        <div class="forecast-time">${date}</div>
        <div class="weather-icon weather-${type}">${WEATHER_ICONS[type]}</div>
        <div class="forecast-temp weekly-temp">
          <span class="max">${maxTemp}</span><span class="separator">/</span><span class="min">${minTemp}</span>
        </div>
      </div>`;
  });
  return `<div class="day-group"><div class="day-label">— Weekly Outlook —</div><div class="day-items">${itemsHtml}</div></div>`;
}

// =========================
// WEATHER & MARKET メイン
// =========================
let weatherSlideIndex = 0;
let weatherTimer = null;

async function fetchWeather() {
  try {
    const r = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=ja`);
    const d = await r.json();
    if (!d || !d.list) return;

    const wrapper = document.getElementById('forecast-wrapper');
    const todayHtml = createForecastGroupHtml(d.list.slice(0, 8), "TODAY'S FORECAST");
    const tomorrowHtml = createForecastGroupHtml(d.list.slice(8, 16), "TOMORROW'S PLAN");
    const weeklyHtml = createWeeklyForecastHtml(d.list);

    const mktHtml = (id, label) => `
      <div class="day-group">
        <div class="day-label">— ${label} —</div>
        <div id="${id}" class="tv-mini-wrapper" style="width:500px; height:160px;"></div>
      </div>`;

    // 中央スライド: NASDAQは抜いて、S&P500、ゴールド、原油、為替を巡回
    wrapper.innerHTML = todayHtml + tomorrowHtml + weeklyHtml + 
                        mktHtml("tv-sp500",  "S&P 500 Futures") +
                        mktHtml("tv-gold",   "Gold Spot (XAU/USD)") +
                        mktHtml("tv-oil",    "WTI Crude Oil") +
                        mktHtml("tv-eur-jpy", "FX: EUR/JPY") +
                        mktHtml("tv-eur-usd", "FX: EUR/USD");

    initTradingViewWidgets();
    weatherSlideIndex = 0;
    wrapper.style.transform = `translateY(0px)`;
    startWeatherCycle();
  } catch (err) { console.error(err); }
}

function initTradingViewWidgets() {
    const conf = { "width": "100%", "height": 160, "locale": "ja", "dateRange": "1D", "colorTheme": "dark", "isTransparent": true, "interval": "5" };

    // --- 左パネル (固定 3本立て) ---
    appendMiniWidget("tv-usd-jpy-fixed", { ...conf, "symbol": "FX:USDJPY" });
    appendMiniWidget("tv-n225-fixed",    { ...conf, "symbol": "OSE:NK2251!" });
    appendMiniWidget("tv-nasdaq-fixed",  { ...conf, "symbol": "CAPITALCOM:US100" });

    // --- 中央パネル (スライド用) ---
    appendMiniWidget("tv-sp500",  { ...conf, "symbol": "CAPITALCOM:US500" });
    appendMiniWidget("tv-gold",   { ...conf, "symbol": "TVC:GOLD" });
    appendMiniWidget("tv-oil",    { ...conf, "symbol": "CAPITALCOM:OIL_CRUDE" });
    appendMiniWidget("tv-eur-jpy", { ...conf, "symbol": "FX:EURJPY" });
    appendMiniWidget("tv-eur-usd", { ...conf, "symbol": "FX:EURUSD" });
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

function startWeatherCycle() {
  if (weatherTimer) clearInterval(weatherTimer);
  const wrapper = document.getElementById('forecast-wrapper');
  weatherTimer = setInterval(() => {
    const groups = wrapper.querySelectorAll('.day-group');
    if (groups.length === 0) return;
    weatherSlideIndex = (weatherSlideIndex + 1) % groups.length;
    // translateY の移動量を CSS の .day-group の高さ (400px) に合わせる
    wrapper.style.transform = `translateY(${weatherSlideIndex * -400}px)`;
    groups.forEach((g, i) => g.classList.toggle('inactive', i !== weatherSlideIndex));
  }, 9000);
}

fetchWeather();
setInterval(fetchWeather, 600000);

// =========================
// NEWS
// =========================
const RSS_URL = 'https://news.web.nhk/n-data/conf/na/rss/cat0.xml';
const newsCard = document.getElementById('news-card');

let newsItems = [], newsEls = [], index = 0, newsT = null;
let lastGoodNews = null;
const FADE = 1.8, AUTO_INTERVAL = 11000, FETCH_INTERVAL = 10*60*1000;

const updateEl = document.createElement('div');
updateEl.style.cssText = 'position:absolute; top:10px; right:15px; font-size:12px; opacity:0.6;';
newsCard.appendChild(updateEl);

const indicator = document.createElement('div');
indicator.style.cssText = 'position:absolute; bottom:10px; left:50%; transform:translateX(-50%); display:flex; gap:8px;';
newsCard.appendChild(indicator);

function isImportant(title) { return /(地震|津波|警報|注意報|台風|噴火|避難)/.test(title); }

function updateIndicator() {
  indicator.innerHTML = '';
  newsItems.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.style.cssText = `width:10px; height:10px; border-radius:50%; background:${i === index ? '#fff' : '#555'}; cursor:pointer;`;
    dot.onclick = () => { if (i === index) return; stopAutoNews(); showNews(i); startAutoNews(); };
    indicator.appendChild(dot);
  });
}

function createNews() {
  newsCard.querySelectorAll('.news-item').forEach(e => e.remove());
  newsEls = newsItems.map(n => {
    const div = document.createElement('div');
    div.className = 'news-item';
    div.innerHTML = `<div class="news-mark">NHKONEニュース</div><a class="news-title" href="${n.link}" target="_blank">${n.title}</a><div class="news-pubdate">${n.pubDate}</div><div class="news-description">${n.description}</div>`;
    newsCard.appendChild(div);
    return div;
  });
  updateIndicator();
}

function showNews(next, init = false) {
  if (!newsEls[next]) return;
  if (init) { newsEls[next].classList.add('show'); index = next; updateIndicator(); return; }
  newsEls[index].classList.remove('show');
  setTimeout(() => { newsEls[next].classList.add('show'); index = next; updateIndicator(); }, FADE*1000);
}

function startAutoNews() { stopAutoNews(); newsT = setInterval(() => showNews((index+1)%newsEls.length), AUTO_INTERVAL); }
function stopAutoNews() { if (newsT) clearInterval(newsT); }

async function fetchNews() {
  try {
    const r = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(RSS_URL));
    const data = await r.json();
    const parser = new DOMParser();
    const xml = parser.parseFromString(data.contents, "application/xml");
    const items = xml.querySelectorAll('item');
    let fetched = Array.from(items).map(item => ({
      title: item.querySelector('title')?.textContent,
      link: item.querySelector('link')?.textContent,
      pubDate: item.querySelector('pubDate')?.textContent,
      description: item.querySelector('description')?.textContent
    }));

    if (fetched.length === 0) {
      if (lastGoodNews) newsItems = lastGoodNews; else return;
    } else {
      newsItems = fetched; lastGoodNews = fetched;
    }
    createNews();
    showNews(0, true);
    if (newsItems.length > 1) startAutoNews();
    const now = new Date();
    updateEl.textContent = `Last update ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')} JST`;
  } catch (e) { console.error('News fetch failed', e); }
}
fetchNews();
setInterval(fetchNews, FETCH_INTERVAL);

// =========================
// SCALING
// =========================
function adjustScale() {
    const container = document.getElementById('container');
    if (!container) return;
    const baseWidth = 1920, baseHeight = 720;
    const sW = window.innerWidth, sH = window.innerHeight;
    let scale = Math.min(sW / baseWidth, sH / baseHeight);
    container.style.transform = `scale(${scale})`;
}
window.addEventListener('resize', adjustScale);
window.addEventListener('load', adjustScale);
adjustScale();
