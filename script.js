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
// 省略（以前のままでもOK）
const API_KEY = 'eed3942fcebd430b2e32dfff2c611b11';
const LAT = 35.6895;
const LON = 139.6917;

const WEATHER_ICONS = { /* 省略 */ };

function getWeatherType(id) { /* 省略 */ }

async function fetchWeather() { /* 省略 */ }

function renderWeather(data, iconEl, textEl) { /* 省略 */ }

fetchWeather();
setInterval(fetchWeather, 600000);

// =========================
// NEWS (NHK RSS直接取得 + JST表示 + インジケーター)
// =========================
const RSS_URL = 'https://news.web.nhk/n-data/conf/na/rss/cat0.xml';
const newsCard = document.getElementById('news-card');

let newsItems = [], newsEls = [], index = 0, timer = null;
const FADE = 1.8, AUTO_INTERVAL = 11000, FETCH_INTERVAL = 10*60*1000;

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

// --- 重要ニュース判定 ---
function isImportant(title) {
  return /(地震|津波|警報|注意報|台風|噴火|避難)/.test(title);
}

// --- インジケータ更新 ---
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

    // --- RSS XML の pubDate をそのまま使用 ---
    const pubDateStr = n.pubDate; // "Tue, 13 Jan 2026 14:39:11 +0900" 形式

    // --- NHKONEニュースタイトル上にマーク追加 ---
    div.innerHTML = `
      <div class="news-mark">NHKONEニュース</div>
      <a class="news-title" href="${n.link}" target="_blank">${n.title}</a>
      <div class="news-pubdate">${pubDateStr}</div>
      <div class="news-description">${n.description}</div>
    `;

    newsCard.appendChild(div);
    return div;
  });

  updateIndicator();
}

// --- ニュース表示 ---
function showNews(next, init = false) {
  if (!newsEls[next]) return;

  if (init) {
    newsEls[next].classList.add('show');
    index = next;
    updateIndicator();
    return;
  }

  // フェードアウト → フェードイン
  newsEls[index].classList.remove('show');
  setTimeout(() => {
    newsEls[next].classList.add('show');
    index = next;
    updateIndicator();
  }, FADE*1000);
}

// --- 自動切替 ---
function startAuto() {
  stopAuto();
  timer = setInterval(() => showNews((index+1)%newsEls.length), AUTO_INTERVAL);
}

function stopAuto() {
  if (timer) clearInterval(timer);
}

// --- ニュース取得 ---
async function fetchNews() {
  try {
    const r = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(RSS_URL));
    const data = await r.json();
    const parser = new DOMParser();
    const xml = parser.parseFromString(data.contents, "application/xml");
    const items = xml.querySelectorAll('item');

    newsItems = Array.from(items).map(item => ({
      title: item.querySelector('title')?.textContent,
      link: item.querySelector('link')?.textContent,
      pubDate: item.querySelector('pubDate')?.textContent,
      description: item.querySelector('description')?.textContent
    }));

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
