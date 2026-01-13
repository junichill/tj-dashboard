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
// WEATHER (NHK-style SVG)
// =========================
const API_KEY = 'eed3942fcebd430b2e32dfff2c611b11';
const LAT = 35.6895;
const LON = 139.6917;

// --- NHK風 SVG定義 ---
const WeatherSVG = {
  sunny: `
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4">
  <circle cx="32" cy="32" r="10"/>
  <line x1="32" y1="2" x2="32" y2="14"/>
  <line x1="32" y1="50" x2="32" y2="62"/>
  <line x1="2" y1="32" x2="14" y2="32"/>
  <line x1="50" y1="32" x2="62" y2="32"/>
  <line x1="10" y1="10" x2="18" y2="18"/>
  <line x1="46" y1="46" x2="54" y2="54"/>
  <line x1="46" y1="18" x2="54" y2="10"/>
  <line x1="10" y1="54" x2="18" y2="46"/>
</svg>`,

  cloudy: `
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4">
  <path d="M18 40h28a10 10 0 0 0 0-20
           14 14 0 0 0-27-3
           9 9 0 0 0-1 23z"/>
</svg>`,

  rainy: `
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4">
  <path d="M18 34h28a10 10 0 0 0 0-20
           14 14 0 0 0-27-3
           9 9 0 0 0-1 23z"/>
  <line x1="24" y1="42" x2="24" y2="56"/>
  <line x1="32" y1="42" x2="32" y2="56"/>
  <line x1="40" y1="42" x2="40" y2="56"/>
</svg>`
};

// --- OpenWeatherMap → 種別変換 ---
function mapWeather(icon) {
  if (icon.startsWith('01')) return 'sunny';
  if (icon.startsWith('02') || icon.startsWith('03') || icon.startsWith('04')) return 'cloudy';
  if (icon.startsWith('09') || icon.startsWith('10')) return 'rainy';
  return 'cloudy';
}

async function fetchWeather() {
  try {
    const r = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=ja`
    );
    const d = await r.json();

    // --- 今日 ---
    const today = d.list[0];
    const todayType = mapWeather(today.weather[0].icon);
    const todayIcon = document.getElementById('weather-icon-today');
    todayIcon.className = `weather-icon weather-${todayType}`;
    todayIcon.innerHTML = WeatherSVG[todayType];
    document.getElementById('weather-temp-today').textContent =
      `${today.main.temp.toFixed(1)}℃`;

    // --- 明日 ---
    const tomorrow = d.list.find(v => v.dt > today.dt + 86400);
    if (tomorrow) {
      const tomorrowType = mapWeather(tomorrow.weather[0].icon);
      const tomorrowIcon = document.getElementById('weather-icon-tomorrow');
      tomorrowIcon.className = `weather-icon weather-${tomorrowType}`;
      tomorrowIcon.innerHTML = WeatherSVG[tomorrowType];
      document.getElementById('weather-temp-tomorrow').textContent =
        `${tomorrow.main.temp.toFixed(1)}℃`;
    }

  } catch (err) {
    console.error('天気情報取得失敗', err);
    document.getElementById('weather-temp-today').textContent = '天気取得失敗';
    document.getElementById('weather-temp-tomorrow').textContent = '';
  }
}

fetchWeather();
setInterval(fetchWeather, 600000);

// =========================
// NEWS（変更なし）
// =========================
const rssList = [
  {
    name: 'NHK',
    key: 'nhk',
    type: 'rss2json',
    url: 'https://news.web.nhk/n-data/conf/na/rss/cat0.xml'
  }
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

// --- 最終更新表示 ---
const updateEl = document.createElement('div');
updateEl.style.position = 'absolute';
updateEl.style.top = '10px';
updateEl.style.right = '15px';
updateEl.style.fontSize = '12px';
updateEl.style.opacity = '0.6';
newsCard.appendChild(updateEl);

// --- インジケータ ---
const indicator = document.createElement('div');
indicator.style.position = 'absolute';
indicator.style.bottom = '10px';
indicator.style.left = '50%';
indicator.style.transform = 'translateX(-50%)';
indicator.style.display = 'flex';
indicator.style.gap = '8px';
newsCard.appendChild(indicator);

// --- JST変換 ---
function formatJST(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}
          ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

// --- 重要ニュース判定 ---
function isImportant(title) {
  return /(地震|津波|警報|注意報|台風|噴火|避難)/.test(title);
}

async function fetchNews() {
  try {
    const r = await fetch(RSS_API + encodeURIComponent(rssList[0].url));
    const d = await r.json();

    newsItems = (d.items || []).map(item => ({
      ...item,
      source: rssList[0]
    }));

    createNews();
    showNews(0, true);
    startAuto();

    const now = new Date();
    updateEl.textContent =
      `Last update ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} JST`;

  } catch (e) {
    console.error('News fetch failed', e);
  }
}

function createNews() {
  newsCard.querySelectorAll('.news-item').forEach(e => e.remove());

  newsEls = newsItems.map(n => {
    const div = document.createElement('div');
    div.className = 'news-item';

    const label = document.createElement('div');
    label.className = `news-source ${n.source.key}`;
    label.textContent = n.source.name;

    div.innerHTML = `
      <a class="news-title" href="${n.link}" target="_blank">${n.title}</a>
      <div class="news-pubdate">${formatJST(n.pubDate)}</div>
      <div class="news-description">${n.description}</div>
    `;

    div.appendChild(label);
    newsCard.appendChild(div);
    return div;
  });
}

function showNews(next, init = false) {
  const cur = newsEls[index];
  const nxt = newsEls[next];
  if (!nxt) return;

  if (init) {
    nxt.classList.add('show');
    index = next;
    return;
  }

  if (cur) cur.classList.remove('show');
  setTimeout(() => {
    nxt.classList.add('show');
    index = next;
  }, FADE * 1000);
}

function startAuto() {
  stopAuto();
  timer = setInterval(() => {
    showNews((index + 1) % newsEls.length);
  }, AUTO_INTERVAL);
}

function stopAuto() {
  if (timer) clearInterval(timer);
}

fetchNews();
setInterval(fetchNews, FETCH_INTERVAL);
