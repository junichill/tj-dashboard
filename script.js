// ---------------- 時計・日付 ----------------
const clockEl = document.getElementById('clock');
const dateEl = document.getElementById('date');

function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  clockEl.textContent = `${h}:${m}`;

  const year = now.getFullYear();
  const month = String(now.getMonth()+1).padStart(2,'0');
  const date = String(now.getDate()).padStart(2,'0');
  const weekdays = ['日','月','火','水','木','金','土'];
  const day = weekdays[now.getDay()];
  dateEl.textContent = `${year}/${month}/${date}(${day})`;
}
setInterval(updateClock, 1000);
updateClock();

// ---------------- ニュース ----------------
const rssUrl = 'https://news.web.nhk/n-data/conf/na/rss/cat0.xml';
const rss2jsonApi = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(rssUrl);
const newsCard = document.getElementById('news-card');
let newsItems = [];
let newsIndex = 0;
let newsElements = [];

async function fetchNews() {
  try {
    const res = await fetch(rss2jsonApi);
    const data = await res.json();
    newsItems = data.items;
    newsIndex = 0;
    prepareNewsElements();
    showNews();
  } catch(err) {
    newsCard.textContent = 'ニュース取得に失敗しました';
    console.error(err);
  }
}

function prepareNewsElements() {
  newsCard.innerHTML = '';
  newsElements = newsItems.map(item => {
    const div = document.createElement('div');
    div.className = 'news-item';
    div.innerHTML =
      `<a href="${item.link}" target="_blank" class="news-title">${item.title}</a>` +
      `${item.description}<br>` +
      `${item.pubDate}`;
    newsCard.appendChild(div);
    return div;
  });
}

function showNews() {
  if(newsElements.length === 0) return;
  newsElements.forEach((el,i) => {
    el.classList.remove('show','hide');
    if(i === newsIndex) el.classList.add('show');
    else el.classList.add('hide');
  });
  newsIndex = (newsIndex + 1) % newsElements.length;
}

fetchNews();
setInterval(fetchNews, 5*60*1000);
setInterval(showNews, 5000);

// ---------------- 天気 ----------------
const weatherEl = document.getElementById('weather');
const CITY_ID = '<YOUR_CITY_ID>'; // OpenWeatherMapの都市ID
const API_KEY = '<YOUR_API_KEY>'; // APIキー

async function fetchWeather() {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?id=${CITY_ID}&appid=${API_KEY}&lang=ja&units=metric`);
    const data = await res.json();
    const today = new Date().getDate();
    const todayWeather = data.list.find(item => new Date(item.dt_txt).getDate() === today);
    const tomorrowWeather = data.list.find(item => new Date(item.dt_txt).getDate() === today + 1);
    if(todayWeather && tomorrowWeather) {
      weatherEl.textContent = `今日: ${todayWeather.main.temp.toFixed(1)}℃/${todayWeather.weather[0].description}  明日: ${tomorrowWeather.main.temp.toFixed(1)}℃/${tomorrowWeather.weather[0].description}`;
    }
  } catch(err) {
    weatherEl.textContent = '天気取得失敗';
    console.error(err);
  }
}

fetchWeather();
setInterval(fetchWeather, 10*60*1000);
