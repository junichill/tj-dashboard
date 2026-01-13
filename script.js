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
// WEATHER (Today & Tomorrow)
// =========================
const API_KEY = 'eed3942fcebd430b2e32dfff2c611b11';
const LAT = 35.6895; // 東京
const LON = 139.6917;

async function fetchWeather() {
  try {
    const r = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=ja`
    );
    const d = await r.json();

    // 今日の天気
    const today = d.list[0];
    document.getElementById('weather-icon-today').src = `https://openweathermap.org/img/wn/${today.weather[0].icon}@2x.png`;
    document.getElementById('weather-temp-today').textContent = `${today.weather[0].description} ${today.main.temp.toFixed(1)}℃`;

    // 明日の天気（24時間後に一番近い時間）
    const tomorrow = d.list.find(v => v.dt > today.dt + 86400);
    if (tomorrow) {
      document.getElementById('weather-icon-tomorrow').src = `https://openweathermap.org/img/wn/${tomorrow.weather[0].icon}@2x.png`;
      document.getElementById('weather-temp-tomorrow').textContent = `${tomorrow.weather[0].description} ${tomorrow.main.temp.toFixed(1)}℃`;
    }

  } catch (err) {
    console.error('天気情報取得失敗', err);
    document.getElementById('weather-temp-today').textContent = '天気取得失敗';
    document.getElementById('weather-temp-tomorrow').textContent = '';
  }
}

fetchWeather();
setInterval(fetchWeather, 600000); // 10分ごと更新

// =========================
// NEWS (Fade + Advanced)
// =========================
const rssList = [
  'https://news.web.nhk/n-data/conf/na/rss/cat0.xml',
  'https://news.yahoo.co.jp/rss/topics/top-picks.xml'
];
const api = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(rssUrl);
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
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}/${m}/${day} ${h}:${min}`;
}

// --- 重要ニュース判定 ---
function isImportant(title) {
  return /(地震|津波|警報|注意報|台風|噴火|避難)/.test(title);
}

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

async function fetchNews() {
  try {
    let allItems = [];

    for (const rss of rssList) {
      const api =
        'https://api.rss2json.com/v1/api.json?rss_url=' +
        encodeURIComponent(rss);

      const r = await fetch(api);
      const d = await r.json();
      if (d.items) allItems = allItems.concat(d.items);
    }

    // タイトル重複排除
    const map = new Map();
    allItems.forEach(n => map.set(n.title, n));
    newsItems = Array.from(map.values());

    // ① 重要ニュースを最前面に
    newsItems.sort((a, b) => {
      return isImportant(b.title) - isImportant(a.title);
    });

    createNews();

    if (index >= newsEls.length) index = 0;

    showNews(index, true);
    startAuto();

    const now = new Date();
    updateEl.textContent =
      `Last update: ${now.getHours().toString().padStart(2, '0')}:` +
      `${now.getMinutes().toString().padStart(2, '0')}`;

  } catch (e) {
    console.error('News fetch failed', e);
  }
}

function createNews() {
  newsCard.querySelectorAll('.news-item').forEach(e => e.remove());

  newsEls = newsItems.map(n => {
    const important = isImportant(n.title);

    const div = document.createElement('div');
    div.className = 'news-item';
    if (important) div.classList.add('important');

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
  const cur = newsEls[index];
  const nxt = newsEls[next];
  if (!nxt) return;

  const title = nxt.querySelector('.news-title').textContent;

  // 地震速報時のみ全画面
  if (isEarthquakeFlash(title)) {
    newsCard.classList.add('news-fullscreen');
  } else {
    newsCard.classList.remove('news-fullscreen');
  }

  if (init) {
    nxt.classList.add('show');
    index = next;
    updateIndicator();
    return;
  }

  if (cur) cur.classList.remove('show');

  setTimeout(() => {
    nxt.classList.add('show');
    index = next;
    updateIndicator();
  }, FADE * 1000);
}

  if (cur) cur.classList.remove('show');

  setTimeout(() => {
    nxt.classList.add('show');
    index = next;
    updateIndicator();
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

function isEarthquakeFlash(title) {
  return /地震/.test(title) && /速報/.test(title);
}

fetchNews();
setInterval(fetchNews, FETCH_INTERVAL);
