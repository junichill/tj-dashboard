// ---------------- CLOCK & DATE (SVG) ----------------
const hourHand = document.getElementById('hourHand');
const minuteHand = document.getElementById('minuteHand');
const secondHand = document.getElementById('secondHand');
const dateEl = document.getElementById('date');
const weatherEl = document.getElementById('weather');

function updateSVGClock() {
  const now = new Date();
  const hour = now.getHours() % 12;
  const minute = now.getMinutes();
  const second = now.getSeconds();

  const hourAngle = (hour + minute/60) * 30; // 360/12
  const minuteAngle = (minute + second/60) * 6; // 360/60
  const secondAngle = second * 6;

  hourHand.setAttribute('transform', `rotate(${hourAngle} 150 150)`);
  minuteHand.setAttribute('transform', `rotate(${minuteAngle} 150 150)`);
  secondHand.setAttribute('transform', `rotate(${secondAngle} 150 150)`);

  // ì˙ït (âEäÒÇπ)
  const year = now.getFullYear();
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const month = monthNames[now.getMonth()];
  const date = now.getDate();
  const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const day = weekdays[now.getDay()];
  dateEl.textContent = `${day}, ${month} ${date}, ${year}`;
}
setInterval(updateSVGClock, 1000/60);
updateSVGClock();

// ---------------- NEWS ----------------
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
    newsCard.textContent = 'News fetch failed';
    console.error(err);
  }
}

function prepareNewsElements() {
  newsCard.innerHTML = '';
  newsElements = newsItems.map(item => {
    const div = document.createElement('div');
    div.className = 'news-item';
    div.innerHTML =
      `<div class="news-title">${item.title}</div>` +
      `<div class="news-pubdate">${item.pubDate}</div>` +
      `<div class="news-description">${item.description}</div>`;
    newsCard.appendChild(div);
    return div;
  });
}

function showNews() {
  if(newsElements.length === 0) return;
  newsElements.forEach((el,i) => {
    el.classList.remove('show');
    if(i === newsIndex) el.classList.add('show');
  });
  newsIndex = (newsIndex + 1) % newsElements.length;
}

fetchNews();
setInterval(fetchNews, 5*60*1000);
setInterval(showNews, 5000);

// ---------------- WEATHER ----------------
const API_KEY = 'eed3942fcebd430b2e32dfff2c611b11';
const LAT = 35.5309;  // Kawasaki
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
        `Today: ${todayWeather.main.temp.toFixed(1)}Åé / ${todayWeather.weather[0].description}<br>` +
        `Tomorrow: ${tomorrowWeather.main.temp.toFixed(1)}Åé / ${tomorrowWeather.weather[0].description}`;
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
