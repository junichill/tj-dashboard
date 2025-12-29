// ---------------- CLOCK & DATE ----------------
const clockEl = document.getElementById('clock');
const dateEl = document.getElementById('date');
const weatherEl = document.getElementById('weather');

function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  const s = String(now.getSeconds()).padStart(2,'0');
  clockEl.textContent = `${h}:${m}:${s}`;

  const year = now.getFullYear();
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const month = monthNames[now.getMonth()];
  const date = now.getDate();
  const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const day = weekdays[now.getDay()];
  dateEl.textContent = `${day}, ${month} ${date}, ${year}`;
  dateEl.style.textAlign = 'right';
}
setInterval(updateClock, 1000);
updateClock();

// ---------------- NEWS ----------------
const rssUrl = 'https://news.web.nhk/n-data/conf/na/rss/cat0.xml';
const rss2jsonApi = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(rssUrl);
const newsCard = document.getElementById('news-card');
let newsItems = [];
let newsIndex = 0;

async function fetchNews() {
  try {
    const res = await fetch(rss2jsonApi);
    const data = await res.json();
    newsItems = data.items;
    renderNewsItems();
    slideNews();
  } catch(err) {
    newsCard.textContent = 'News fetch failed';
    console.error(err);
  }
}

function renderNewsItems() {
  newsCard.innerHTML = '';
  newsItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'news-item';
    div.innerHTML =
      `<div class="news-title">${item.title}</div>` +
      `<hr>` +
      `<div class="news-description">${item.description}</div>` +
      `<br>${item.pubDate}`;
    newsCard.appendChild(div);
  });
}

function slideNews() {
  if(newsItems.length === 0) return;
  setInterval(() => {
    newsIndex = (newsIndex + 1) % newsItems.length;
    const offset = -newsIndex * 100;
    newsCard.style.transform = `translateX(${offset}%)`;
  }, 5000); // 5秒ごとにスライド
}

fetchNews();
setInterval(fetchNews, 5*60*1000); // 5分ごと更新

// ---------------- WEATHER ----------------
const API_KEY = 'eed3942fcebd430b2e32dfff2c611b11';
const LAT = 35.5309;
const LON = 139.7033;

async function fetchWeather() {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&lang=en&units=metric`
    );
    const data = await res.json();

    const now = new Date();
    const todayDate = now.getDate();
    const tomorrowDate = new Date(now.getTime() + 24*60*60*1000).getDate();

    const todayWeather = data.list.find(item => new Date(item.dt_txt).getDate() === todayDate);
    const tomorrowWeather = data.list.find(item => new Date(item.dt_txt).getDate() === tomorrowDate);

    if(todayWeather && tomorrowWeather){
      weatherEl.innerHTML =
        `Today: ${todayWeather.main.temp.toFixed(1)}℃ / ${todayWeather.weather[0].description}<br>` +
        `Tomorrow: ${tomorrowWeather.main.temp.toFixed(1)}℃ / ${tomorrowWeather.weather[0].description}`;
      weatherEl.style.textAlign = 'left';
    } else {
      weatherEl.textContent = 'Weather info unavailable';
    }
  } catch(err) {
    weatherEl.textContent = 'Weather fetch failed';
    console.error(err);
  }
}

fetchWeather();
setInterval(fetchWeather, 10*60*1000);
