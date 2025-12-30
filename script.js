// =====================
// CLOCK (Flip)
// =====================
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
    const size = Math.min(panel.clientWidth / 5, panel.clientHeight / 2.5);
    tick.root.style.fontSize = size + 'px';
  }
  updateSize();
  window.addEventListener('resize', updateSize);
}

document.addEventListener('DOMContentLoaded', () => {
  const tick = new FlipClock.Clock(clockEl);
  initClock(tick);
  resizeClock(tick);
});

// =====================
// DATE
// =====================
const dateEl = document.getElementById('date');

function updateDate() {
  const now = new Date();
  const week = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  dateEl.textContent =
    `${week[now.getDay()]}, ${month[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
}
updateDate();
setInterval(updateDate, 60000);

// =====================
// WEATHER
// =====================
const weatherEl = document.getElementById('weather');
const API_KEY = 'eed3942fcebd430b2e32dfff2c611b11';
const LAT = 35.5309;
const LON = 139.7033;

async function fetchWeather() {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=en`
    );
    const data = await res.json();

    const today = data.list[0];
    const tomorrow = data.list.find(v => v.dt_txt.includes('12:00'));

    weatherEl.innerHTML =
      `Today: ${today.main.temp.toFixed(1)}℃ / ${today.weather[0].description}<br>` +
      `Tomorrow: ${tomorrow.main.temp.toFixed(1)}℃ / ${tomorrow.weather[0].description}`;
  } catch {
    weatherEl.textContent = 'Weather fetch failed';
  }
}

fetchWeather();
setInterval(fetchWeather, 600000);

// =====================
// NEWS
// =====================
const rssUrl = 'https://news.web.nhk/n-data/conf/na/rss/cat0.xml';
const rss2json = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(rssUrl);

const newsCard = document.getElementById('news-card');
const indicator = document.getElementById('news-indicator');

let newsItems = [];
let newsElements = [];
let newsIndex = 0;
let autoTimer = null;
let isAnimating = false;

// ---------- Fetch ----------
async function fetchNews() {
  const res = await fetch(rss2json);
  const data = await res.json();
  newsItems = data.items;
  buildNews();
  buildIndicator();
  showNews(0, 'right', true);
  startAuto();
}

// ---------- Build News ----------
function buildNews() {
  newsCard.innerHTML = '';
  newsElements = [];

  newsItems.forEach(item => {
    const el = document.createElement('div');
    el.className = 'news-item';
    el.innerHTML = `
      <a href="${item.link}" target="_blank" class="news-title">${item.title}</a>
      <div class="news-pubdate">${item.pubDate}</div>
      <div class="news-description">${item.description}</div>
    `;
    newsCard.appendChild(el);
    newsElements.push(el);
  });
}

// ---------- Indicator ----------
function buildIndicator() {
  indicator.innerHTML = '';

  newsElements.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'dot';

    dot.addEventListener('click', () => {
      if (i === newsIndex || isAnimating) return;

      stopAuto();

      const last = newsElements.length - 1;
      let direction;

      if (newsIndex === last && i === 0) {
        direction = 'right';
      } else if (newsIndex === 0 && i === last) {
        direction = 'left';
      } else {
        direction = i > newsIndex ? 'right' : 'left';
      }

      showNews(i, direction);
      startAuto();
    });

    indicator.appendChild(dot);
  });
}

function updateIndicator() {
  [...indicator.children].forEach((d, i) => {
    d.classList.toggle('active', i === newsIndex);
  });
}

// ---------- Show ----------
function showNews(next, direction = 'right', immediate = false) {
  if (isAnimating) return;
  isAnimating = true;

  const current = newsElements[newsIndex];
  const target = newsElements[next];

  if (immediate) {
    target.classList.add('show');
    newsIndex = next;
    updateIndicator();
    isAnimating = false;
    return;
  }

  current.className = `news-item slide-out-${direction}`;
  target.className = `news-item slide-in-${direction} show`;

  setTimeout(() => {
    current.className = 'news-item';
    newsIndex = next;
    updateIndicator();
    isAnimating = false;
  }, 800);
}

// ---------- Auto ----------
function startAuto() {
  autoTimer = setInterval(() => {
    const next = (newsIndex + 1) % newsElements.length;
    showNews(next, 'right');
  }, 7000);
}

function stopAuto() {
  clearInterval(autoTimer);
}

// ---------- Swipe ----------
let startX = 0;

newsCard.addEventListener('pointerdown', e => {
  startX = e.clientX;
  stopAuto();
});

newsCard.addEventListener('pointerup', e => {
  const dx = e.clientX - startX;
  if (Math.abs(dx) < 50) {
    startAuto();
    return;
  }

  if (dx < 0) {
    const next = (newsIndex + 1) % newsElements.length;
    showNews(next, 'right');
  } else {
    const prev = (newsIndex - 1 + newsElements.length) % newsElements.length;
    showNews(prev, 'left');
  }
  startAuto();
});

fetchNews();
