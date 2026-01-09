// =========================
// CLOCK
// =========================
function handleTickInit(tick) {
  Tick.helper.interval(() => {
    const d = Tick.helper.date();
    tick.value = {
      sep: ':',
      hours: d.getHours(),
      minutes: d.getMinutes(),
      seconds: d.getSeconds(),
    };
  });
}

// =========================
// DATE
// =========================
const dateEl = document.getElementById('date');
function updateDate() {
  const now = new Date();
  dateEl.textContent = now.toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });
}
updateDate();
setInterval(updateDate, 60000);

// =========================
// WEATHER
// =========================
const weatherEl = document.getElementById('weather');
async function fetchWeather() {
  try {
    weatherEl.textContent = 'Weather: OK';
  } catch {
    weatherEl.textContent = 'Weather fetch failed';
  }
}
fetchWeather();

// =========================
// NEWS (FADE)
// =========================
const newsCard = document.getElementById('news-card');
let newsItems = [];
let newsIndex = 0;
let autoTimer;

async function fetchNews() {
  const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://news.web.nhk/n-data/conf/na/rss/cat0.xml');
  const data = await res.json();
  newsItems = data.items;
  createNews();
  showNews(0);
  startAuto();
}

function createNews() {
  newsCard.innerHTML = '';
  newsItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'news-item';
    div.innerHTML = `<h2>${item.title}</h2><p>${item.description}</p>`;
    newsCard.appendChild(div);
  });
}

function showNews(index) {
  const items = document.querySelectorAll('.news-item');
  items.forEach(el => el.classList.remove('show'));
  items[index].classList.add('show');
  newsIndex = index;
}

function startAuto() {
  autoTimer = setInterval(() => {
    showNews((newsIndex + 1) % newsItems.length);
  }, 5000);
}

fetchNews();
