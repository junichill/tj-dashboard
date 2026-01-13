// =========================
// Tick CLOCK
// =========================
function handleTickInit(tick) {
  Tick.helper.interval(() => {
    const d = Tick.helper.date();
    tick.value = {
      sep: ':',
      hours: d.getHours(),
      minutes: d.getMinutes(),
      seconds: d.getSeconds()
    };
  });
}

// =========================
// DATE
// =========================
const dateEl = document.getElementById('date');

function updateDate() {
  const d = new Date();
  const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const w = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  dateEl.textContent = `${w[d.getDay()]}, ${m[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
updateDate();
setInterval(updateDate, 60000);

// =========================
// WEATHER (NHK風・自前SVG)
// =========================
const API_KEY = 'eed3942fcebd430b2e32dfff2c611b11';
const LAT = 35.6895; // 東京
const LON = 139.6917;

const WEATHER_ICONS = {
  sunny: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4">
    <circle cx="32" cy="32" r="12"/>
    <line x1="32" y1="2" x2="32" y2="14"/>
    <line x1="32" y1="50" x2="32" y2="62"/>
    <line x1="2" y1="32" x2="14" y2="32"/>
    <line x1="50" y1="32" x2="62" y2="32"/>
    <line x1="10" y1="10" x2="18" y2="18"/>
    <line x1="46" y1="46" x2="54" y2="54"/>
    <line x1="46" y1="18" x2="54" y2="10"/>
    <line x1="10" y1="54" x2="18" y2="46"/>
  </svg>`,
  cloudy: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4">
    <path d="M20 44h26a10 10 0 0 0 0-20 14 14 0 0 0-27-4A10 10 0 0 0 20 44z"/>
  </svg>`,
  rainy: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4">
    <path d="M20 36h26a10 10 0 0 0 0-20 14 14 0 0 0-27-4"/>
    <line x1="22" y1="44" x2="18" y2="56"/>
    <line x1="32" y1="44" x2="28" y2="56"/>
    <line x1="42" y1="44" x2="38" y2="56"/>
  </svg>`,
  snowy: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4">
    <path d="M20 36h26a10 10 0 0 0 0-20 14 14 0 0 0-27-4"/>
    <circle cx="24" cy="48" r="2"/>
    <circle cx="32" cy="54" r="2"/>
    <circle cx="40" cy="48" r="2"/>
  </svg>`
};

function getWeatherType(id) {
  if (id >= 200 && id < 600) return 'rainy';
  if (id >= 600 && id < 700) return 'snowy';
  if (id >= 801) return 'cloudy';
  return 'sunny';
}

async function fetchWeather() {
  try {
    const r = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=ja`
    );
    const d = await r.json();

    const today = d.list[0];
    const tomorrow = d.list.find(v => v.dt > today.dt + 86400);

    renderWeather(today, "weather-icon-today", "weather-temp-today");
    if (tomorrow) renderWeather(tomorrow, "weather-icon-tomorrow", "weather-temp-tomorrow");

  } catch (err) {
    console.error('天気情報取得失敗', err);
  }
}

function renderWeather(data, iconId, tempId) {
  const type = getWeatherType(data.weather[0].id);
  const iconEl = document.getElementById(iconId);
  const tempEl = document.getElementById(tempId);
  iconEl.className = `weather-icon weather-${type}`;
  iconEl.innerHTML = WEATHER_ICONS[type];
  tempEl.textContent = `${data.main.temp.toFixed(1)}℃`;
}

fetchWeather();
setInterval(fetchWeather, 600000);

// =========================
// NEWS（NHK JSON API + JST + インジケーター）
// =========================
const rssList = [
  { name: 'NHK', key: 'nhk', url: 'https://news.web.nhk/n-data/conf/na/rss/cat0.xml' }
];

const RSS_API = 'https://api.rss2json.com/v1/api.json?rss_url=';
const newsCard = document.getElementById('news-card');

let newsItems = [];
let newsEls = [];
let index = 0;
let timer = null;

const FADE = 1.8;
const AUTO_INTERVAL = 11000;
const FETCH_INTERVAL = 10 * 60 * 1000;

// --- 更新時刻表示 ---
const updateEl = document.createElement('div');
updateEl.style.position = 'absolute';
updateEl.style.top = '10px';
updateEl.style.right = '15px';
updateEl.style.fontSize = '12px';
updateEl.style.opacity = '0.6';
newsCard.appendChild(updateEl);

// --- ニュースインジケーター ---
const indicator = document.createElement('div');
indicator.style.position = 'absolute';
indicator.style.bottom = '10px';
indicator.style.left = '50%';
indicator.style.transform = 'translateX(-50%)';
indicator.style.display = 'flex';
indicator.style.gap = '8px';
newsCard.appendChild(indicator);

// --- JST 表示関数 ---
function formatJST(pubDate) {
  const d = new Date(pubDate); // 文字列からDate
  const offset = 9 * 60; // JST +9時間
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const jst = new Date(utc + offset * 60000);
  const day = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][jst.getDay()];
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][jst.getMonth()];
  return `${day}, ${jst.getDate()} ${mon} ${jst.getFullYear()} ${jst.getHours()}:${String(jst.getMinutes()).padStart(2,'0')} JST`;
}

// --- 重要ニュース判定 ---
function isImportant(title) {
  return /(地震|津波|警報|注意報|台風|噴火|避難)/.test(title);
}

// --- インジケーター更新 ---
function updateIndicator() {
  indicator.innerHTML = '';
  newsItems.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.style.width = dot.style.height = '10px';
    dot.style.borderRadius = '50%';
    dot.style.background = i === index ? '#fff' : '#555';
    dot.style.cursor = 'pointer';
    dot.onclick = () => {
      if (i === index) return;
      stopAuto();
      showNews(i);
      startAuto();
    };
    indicator.appendChild(dot);
  });
}

// --- ニュース作成 ---
function createNews() {
  newsCard.querySelectorAll('.news-item').forEach(e => e.remove());

  newsEls = newsItems.map(n => {
    const div = document.createElement('div');
    div.className = 'news-item';
    if (isImportant(n.title)) div.classList.add('important');

    div.innerHTML = `
      <a class="news-title" href="${n.link}" target="_blank">${n.title}</a>
      <div class="news-pubdate">${formatJST(n.pubDate)}</div>
      <div class="news-description">${n.description}</div>
    `;
    newsCard.appendChild(div);
    return div;
  });

  updateIndicator();
}

// --- ニュース表示 ---
function showNews(next, init=false) {
  if (!newsEls[next]) return;

  if (init) {
    newsEls[next].classList.add('show');
    index = next;
    updateIndicator();
    return;
  }

  newsEls[index].classList.remove('show');
  setTimeout(() => {
    newsEls[next].classList.add('show');
    index = next;
    updateIndicator();
  }, FADE * 1000);
}

// --- 自動切替 ---
function startAuto() {
  stopAuto();
  timer = setInterval(() => {
    showNews((index + 1) % newsEls.length);
  }, AUTO_INTERVAL);
}

function stopAuto() {
  if (timer) clearInterval(timer);
}

// --- ニュース取得 ---
async function fetchNews() {
  try {
    const r = await fetch(RSS_API + encodeURIComponent(rssList[0].url));
    const d = await r.json();

    newsItems = d.items || [];
    createNews();
    showNews(0, true);
    startAuto();

    const now = new Date();
    updateEl.textContent = `Last update ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')} JST`;

  } catch (e) {
    console.error('News fetch failed', e);
  }
}

fetchNews();
setInterval(fetchNews, FETCH_INTERVAL);
