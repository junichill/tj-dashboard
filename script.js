// =========================
// CLOCK (Flip)
// =========================
const clockEl = document.getElementById('clock');
const leftPanel = document.getElementById('left-panel');

function initClock(tick) {
  const update = () => {
    const now = new Date();
    const str = [
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    ].map(v => String(v).padStart(2, '0')).join(':');

    tick.value = str;
    tick.root.setAttribute('aria-label', str);
  };

  update();
  setInterval(update, 1000);
}

function resizeClock(tick) {
  const updateSize = () => {
    const size = Math.min(leftPanel.clientWidth / 6, leftPanel.clientHeight / 2);
    tick.root.style.fontSize = Math.floor(size) + 'px';
  };

  updateSize();
  window.addEventListener('resize', updateSize);
}

document.addEventListener('DOMContentLoaded', () => {
  const tick = new FlipClock.Clock(clockEl);
  initClock(tick);
  resizeClock(tick);
});

// =========================
// DATE
// =========================
const dateEl = document.getElementById('date');
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function updateDate() {
  const now = new Date();
  dateEl.textContent =
    `${WEEKDAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
}

updateDate();
setInterval(updateDate, 60000);

// =========================
// WEATHER
// =========================
const weatherEl = document.getElementById('weather');
const API_KEY = 'eed3942fcebd430b2e32dfff2c611b11';
const LAT = 35.5309;
const LON = 139.7033;

async function fetchWeather() {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&lang=en&units=metric`
    );
    const data = await res.json();

    const today = data.list[0];
    const tomorrow = data.list.find(v => v.dt > today.dt + 86400);

    weatherEl.innerHTML =
      `Today: ${today.main.temp.toFixed(1)}℃ / ${today.weather[0].description}<br>` +
      `Tomorrow: ${tomorrow.main.temp.toFixed(1)}℃ / ${tomorrow.weather[0].description}`;
  } catch {
    weatherEl.textContent = 'Weather fetch failed';
  }
}

fetchWeather();
setInterval(fetchWeather, 600000);

// =========================
// NEWS
// =========================
const rssUrl = 'https://news.web.nhk/n-data/conf/na/rss/cat0.xml';
const rss2jsonApi =
  'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(rssUrl);

const newsCard = document.getElementById('news-card');

let newsItems = [];
let newsElements = [];
let newsIndex = 0;

let autoTimer = null;
let isInteracting = false;

const SLIDE_DURATION = 0.8;
const AUTO_INTERVAL = 8000;
const SWIPE_THRESHOLD = 50;

// ---------- インジケータ ----------
const indicator = document.createElement('div');
Object.assign(indicator.style, {
  position: 'absolute',
  bottom: '10px',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: '8px'
});
newsCard.appendChild(indicator);

function createDot(i) {
  const dot = document.createElement('div');
  Object.assign(dot.style, {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: i === newsIndex ? '#fff' : '#555',
    cursor: 'pointer'
  });

  dot.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    if (i === newsIndex) return;

    stopAuto();
    showNews(i, 'right');
    startAuto();
  });

  return dot;
}

function updateIndicator() {
  indicator.innerHTML = '';
  newsItems.forEach((_, i) => indicator.appendChild(createDot(i)));
}

// ---------- ニュース取得 ----------
async function fetchNews() {
  const res = await fetch(rss2jsonApi);
  const data = await res.json();

  newsItems = data.items;
  createNewsElements();
  showNews(0, 'init');
  startAuto();
}

// ---------- DOM生成 ----------
function createNewsElements() {
  newsCard.querySelectorAll('.news-item').forEach(e => e.remove());

  newsElements = newsItems.map(item => {
    const div = document.createElement('div');
    div.className = 'news-item';
    div.innerHTML = `
      <a class="news-title" href="${item.link}" target="_blank">${item.title}</a>
      <div class="news-pubdate">${item.pubDate}</div>
      <div class="news-description">${item.description}</div>
    `;
    newsCard.appendChild(div);
    return div;
  });
}

// ---------- 表示制御 ----------
function showNews(nextIndex, direction) {
  const current = newsElements[newsIndex];
  const next = newsElements[nextIndex];

  if (direction === 'init') {
    newsElements.forEach(el => {
      el.style.transition = 'none';
      el.style.transform = 'translateX(0)';
      el.style.opacity = 0;
      el.classList.remove('show');
    });
    next.style.opacity = 1;
    next.classList.add('show');
    newsIndex = nextIndex;
    updateIndicator();
    return;
  }

  if (current) {
    current.style.transition =
      `transform ${SLIDE_DURATION}s ease, opacity ${SLIDE_DURATION}s ease`;
    current.style.transform =
      direction === 'left' ? 'translateX(100%)' : 'translateX(-100%)';
    current.style.opacity = 0;
    current.classList.remove('show');
  }

  next.style.transition = 'none';
  next.style.transform =
    direction === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
  next.style.opacity = 1;
  next.classList.add('show');

  requestAnimationFrame(() => {
    next.style.transition = `transform ${SLIDE_DURATION}s ease`;
    next.style.transform = 'translateX(0)';
  });

  newsIndex = nextIndex;
  updateIndicator();
}

// ---------- 自動切替 ----------
function startAuto() {
  stopAuto();
  autoTimer = setInterval(() => {
    if (!isInteracting) {
      showNews((newsIndex + 1) % newsElements.length, 'right');
    }
  }, AUTO_INTERVAL);
}

function stopAuto() {
  if (autoTimer) clearInterval(autoTimer);
}

// ---------- スワイプ ----------
let startX = 0;

newsCard.addEventListener('pointerdown', e => {
  isInteracting = true;
  startX = e.clientX;
});

newsCard.addEventListener('pointerup', e => {
  const dx = e.clientX - startX;
  isInteracting = false;

  if (Math.abs(dx) > SWIPE_THRESHOLD) {
    stopAuto();
    showNews(
      (newsIndex + (dx > 0 ? -1 : 1) + newsElements.length) % newsElements.length,
      dx > 0 ? 'left' : 'right'
    );
    startAuto();
  }
});

fetchNews();
