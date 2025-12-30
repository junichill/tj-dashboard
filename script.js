/* =========================
   CLOCK
   ========================= */
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('clock').textContent = `${h}:${m}:${s}`;
}
updateClock();
setInterval(updateClock, 1000);

/* =========================
   DATE
   ========================= */
function updateDate() {
  const d = new Date();
  document.getElementById('date').textContent =
    d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
}
updateDate();
setInterval(updateDate, 60000);

/* =========================
   WEATHER
   ========================= */
async function fetchWeather() {
  const weatherEl = document.getElementById('weather');
  try {
    const res = await fetch(
      'https://api.openweathermap.org/data/2.5/weather' +
      '?lat=35.53&lon=139.70' +
      '&appid=eed3942fcebd430b2e32dfff2c611b11&units=metric'
    );
    const data = await res.json();
    weatherEl.textContent = `Weather: ${data.main.temp.toFixed(1)}℃`;
  } catch {
    weatherEl.textContent = 'Weather unavailable';
  }
}
fetchWeather();

/* =========================
   NEWS
   ========================= */
const newsCard = document.getElementById('news-card');

let news = [];
let newsIndex = 0;

/* ---- ニュース取得 ---- */
async function fetchNews() {
  const res = await fetch(
    'https://api.rss2json.com/v1/api.json' +
    '?rss_url=https://news.web.nhk/n-data/conf/na/rss/cat0.xml'
  );
  const data = await res.json();
  news = data.items;
  newsIndex = 0;
  showNews(0, 'right'); // 初期表示は方向を固定
}

/* ---- 表示 ---- */
function showNews(index, direction) {
  if (!news[index]) return;

  // 現在表示中の要素
  const current = newsCard.querySelector('.news-item');

  // 新しい要素
  const next = document.createElement('div');
  next.className = 'news-item';
  next.innerHTML = `
    <div class="news-title">${news[index].title}</div>
    <div class="news-desc">${news[index].description}</div>
  `;

  // 初回表示（current がない）
  if (!current) {
    next.style.transform = 'translateX(0)';
    newsCard.appendChild(next);
    newsIndex = index;
    return;
  }

  // 次のニュースは必ず「左から出す」
  next.style.transform = 'translateX(-100%)';
  newsCard.appendChild(next);

  requestAnimationFrame(() => {
    next.style.transition = 'transform 0.5s ease';
    current.style.transition = 'transform 0.5s ease';

    next.style.transform = 'translateX(0)';
    current.style.transform = 'translateX(100%)';
  });

  current.addEventListener('transitionend', () => {
    current.remove();
  }, { once: true });

  newsIndex = index;
}

/* ---- スワイプ ---- */
let startX = 0;

newsCard.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
});

newsCard.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - startX;

  if (dx < -50) {
    // 次へ（右→左）
    const nextIndex = (newsIndex + 1) % news.length;
    showNews(nextIndex, 'right');
  }
  if (dx > 50) {
    // 前へ（左→右）
    const prevIndex = (newsIndex - 1 + news.length) % news.length;
    showNews(prevIndex, 'left');
  }
});

/* ========================= */
fetchNews();
