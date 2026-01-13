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

// --- SVG定義（currentColorで色制御） ---
const WEATHER_ICONS = {
  sunny: `
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4">
      <circle cx="32" cy="32" r="12"/>
      <line x1="32" y1="2" x2="32" y2="14"/>
      <line x1="32" y1="50" x2="32" y2="62"/>
      <line x1="2" y1="32" x2="14" y2="32"/>
      <line x1="50" y1="32" x2="62" y2="32"/>
      <line x1="10" y1="10" x2="18" y2="18"/>
      <line x1="46" y1="46" x2="54" y2="54"/>
      <line x1="46" y1="18" x2="54" y2="10"/>
      <line x1="10" y1="54" x2="18" y2="46"/>
    </svg>
  `,
  cloudy: `
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4">
      <path d="M20 44h26a10 10 0 0 0 0-20 14 14 0 0 0-27-4A10 10 0 0 0 20 44z"/>
    </svg>
  `,
  rainy: `
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4">
      <path d="M20 36h26a10 10 0 0 0 0-20 14 14 0 0 0-27-4"/>
      <line x1="22" y1="44" x2="18" y2="56"/>
      <line x1="32" y1="44" x2="28" y2="56"/>
      <line x1="42" y1="44" x2="38" y2="56"/>
    </svg>
  `,
  snowy: `
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4">
      <path d="M20 36h26a10 10 0 0 0 0-20 14 14 0 0 0-27-4"/>
      <circle cx="24" cy="48" r="2"/>
      <circle cx="32" cy="54" r="2"/>
      <circle cx="40" cy="48" r="2"/>
    </svg>
  `
};

// --- OpenWeather → NHK風分類 ---
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

    renderWeather(
      today,
      document.getElementById('weather-icon-today'),
      document.getElementById('weather-temp-today')
    );

    if (tomorrow) {
      renderWeather(
        tomorrow,
        document.getElementById('weather-icon-tomorrow'),
        document.getElementById('weather-temp-tomorrow')
      );
    }

  } catch (err) {
    console.error('天気情報取得失敗', err);
  }
}

function renderWeather(data, iconEl, textEl) {
  const type = getWeatherType(data.weather[0].id);

  iconEl.className = `weather-icon weather-${type}`;
  iconEl.innerHTML = WEATHER_ICONS[type];

  // 温度のみ表示（説明文なし）
  textEl.textContent = `${data.main.temp.toFixed(1)}℃`;
}

fetchWeather();
setInterval(fetchWeather, 600000);

// =========================
// NEWS（NHK）
// =========================
const rssList = [
  {
    name: 'NHK',
    key: 'nhk',
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

// --- 更新時刻表示 ---
const updateEl = document.createElement('div');
updateEl.style.position = 'absolute';
updateEl.style.top = '10px';
updateEl.style.right = '15px';
updateEl.style.fontSize = '12px';
updateEl.style.opacity = '0.6';
newsCard.appendChild(updateEl);

async function fetchNews() {
  try {
    const r = await fetch(RSS_API + encodeURIComponent(rssList[0].url));
    const d = await r.json();

    newsItems = d.items || [];
    createNews();
    showNews(0, true);
    startAuto();

    const now = new Date();
    updateEl.textContent =
      `Last update ${now.getHours().toString().padStart(2,'0')}:` +
      `${now.getMinutes().toString().padStart(2,'0')} JST`;

  } catch (e) {
    console.error('News fetch failed', e);
  }
}

function isImportant(title) {
  return /(地震|津波|警報|注意報|台風|噴火|避難)/.test(title);
}

function createNews() {
  newsCard.querySelectorAll('.news-item').forEach(e => e.remove());

  newsEls = newsItems.map(n => {
    const div = document.createElement('div');
    div.className = 'news-item';
    if (isImportant(n.title)) div.classList.add('important');

// UTC → JST 変換関数
function formatJST(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
}

// ニュース生成時
div.innerHTML = `
  <a class="news-title" href="${n.link}" target="_blank">${n.title}</a>
  <div class="news-pubdate">${formatJST(n.pubDate)}</div>
  <div class="news-description">${n.description}</div>
`;

    newsCard.appendChild(div);
    return div;
  });
}

function showNews(next, init = false) {
  if (!newsEls[next]) return;

  if (init) {
    newsEls[next].classList.add('show');
    index = next;
    return;
  }

  newsEls[index].classList.remove('show');
  setTimeout(() => {
    newsEls[next].classList.add('show');
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
