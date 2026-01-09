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
// WEATHER (完全版: アイコン＋説明＋気温)
// =========================
const weatherIcon = document.getElementById('weather-icon');
const weatherDesc = document.getElementById('weather-desc');
const API_KEY = 'eed3942fcebd430b2e32dfff2c611b11';
const LAT = 35.5309;
const LON = 139.7033;

async function fetchWeather() {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=ja`
    );
    const data = await res.json();
    const iconCode = data.weather[0].icon;
    const desc = data.weather[0].description;
    const temp = Math.round(data.main.temp);

    if(weatherIcon) {
      weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
      weatherIcon.alt = desc; // ← 追加
    }
    if(weatherDesc) {
      weatherDesc.textContent = `${desc} ${temp}℃`;
    }

  } catch (err) {
    console.error('天気情報取得失敗', err);
    if(weatherDesc) weatherDesc.textContent = '天気情報取得失敗';
  }
}
fetchWeather();
setInterval(fetchWeather, 600000); // 10分ごとに更新

// =========================
// NEWS (Fade)
// =========================
const rssUrl = 'https://news.web.nhk/n-data/conf/na/rss/cat0.xml';
const api = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(rssUrl);
const newsCard = document.getElementById('news-card');

let newsItems = [];
let newsEls = [];
let index = 0;
let timer = null;
const FADE = 1.5;

// indicator
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
  const r = await fetch(api);
  const d = await r.json();
  newsItems = d.items;
  createNews();
  showNews(0, true);
  startAuto();
}

function createNews() {
  newsCard.querySelectorAll('.news-item').forEach(e => e.remove());
  newsEls = newsItems.map(n => {
    const div = document.createElement('div');
    div.className = 'news-item';
    div.innerHTML = `
      <a class="news-title" href="${n.link}" target="_blank">${n.title}</a>
      <div class="news-pubdate">${n.pubDate}</div>
      <div class="news-description">${n.description}</div>
    `;
    newsCard.appendChild(div);
    return div;
  });
}

function showNews(next, init = false) {
  const cur = newsEls[index];
  const nxt = newsEls[next];

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

function startAuto() {
  stopAuto();
  timer = setInterval(() => {
    showNews((index + 1) % newsEls.length);
  }, 5000);
}

function stopAuto() {
  if (timer) clearInterval(timer);
}

fetchNews();
