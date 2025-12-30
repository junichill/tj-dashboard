// =========================
// CLOCK (Flip)
// =========================
const clockEl = document.getElementById('clock');

function initClock(tick) {
  function update() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const str = `${h}:${m}:${s}`;
    tick.value = str;
    tick.root.setAttribute('aria-label', str);
  }
  update();
  setInterval(update, 1000);
}

function resizeClock(tick) {
  function updateSize() {
    const panel = document.getElementById('left-panel');
    const fontSize = Math.min(panel.clientWidth / 6, panel.clientHeight / 2);
    tick.root.style.fontSize = Math.floor(fontSize) + 'px';
  }
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

function updateDate() {
  const now = new Date();
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  dateEl.textContent =
    `${weekdays[now.getDay()]}, ${monthNames[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
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
// NEWS + SWIPE + INDICATOR
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
const SLIDE_DURATION = 0.8; // ← スライド速度（秒）

// ---------- インジケータ ----------
const indicator = document.createElement('div');
indicator.style.position = 'absolute';
indicator.style.bottom = '10px';
indicator.style.left = '50%';
indicator.style.transform = 'translateX(-50%)';
indicator.style.display = 'flex';
indicator.style.gap = '8px';
newsCard.appendChild(indicator);

function updateIndicator() {
  indicator.innerHTML = '';
  newsItems.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.style.width = '10px';
    dot.style.height = '10px';
    dot.style.borderRadius = '50%';
    dot.style.background = i === newsIndex ? '#fff' : '#555';
    dot.style.cursor = 'pointer';

    // ★ クリックでジャンプ
    dot.addEventListener('click', () => {
      if (i === newsIndex) return;
      stopAuto();
      const dir = i > newsIndex ? 'right' : 'left';
      showNews(i, dir);
      startAuto();
    });

    indicator.appendChild(dot);
  });
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

  // 初期表示
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
  }, 5000);
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

  if (Math.abs(dx) > 50) {
    stopAuto();
    if (dx > 0) {
      showNews((newsIndex - 1 + newsElements.length) % newsElements.length, 'left');
    } else {
      showNews((newsIndex + 1) % newsElements.length, 'right');
    }
    startAuto();
  }
});

fetchNews();