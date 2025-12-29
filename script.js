// ---------------- CLOCK (Flip) ----------------
const clockEl = document.getElementById('flip-clock');

// Flip Clock 初期化
function initClock(tick) {
    function update() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2,'0');
        const m = String(now.getMinutes()).padStart(2,'0');
        const s = String(now.getSeconds()).padStart(2,'0');
        const str = `${h}:${m}:${s}`;
        tick.value = str;
        tick.root.setAttribute('aria-label', str);
    }
    update();
    setInterval(update, 1000);
}

// ---------------- 自動リサイズ ----------------
function resizeClock(tick) {
    function updateSize() {
        const panelWidth = document.getElementById('left-panel').clientWidth;
        const panelHeight = document.getElementById('left-panel').clientHeight;

        // 左パネルいっぱいに表示されるサイズに調整
        // 以前より割る値を小さくして大きくする
        const fontSize = Math.floor(Math.min(panelWidth / 2, panelHeight * 0.8));
        tick.root.style.fontSize = fontSize + 'px';
    }
    updateSize();
    window.addEventListener('resize', updateSize);
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    const tick = new FlipClock.Clock(clockEl);
    initClock(tick);
    resizeClock(tick);
});

// ---------------- DATE ----------------
const dateEl = document.getElementById('date');
function updateDate() {
    const now = new Date();
    const year = now.getFullYear();
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const month = monthNames[now.getMonth()];
    const date = now.getDate();
    const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const day = weekdays[now.getDay()];
    dateEl.textContent = `${day}, ${month} ${date}, ${year}`;
}
updateDate();
setInterval(updateDate, 60*1000);

// ---------------- WEATHER ----------------
const weatherEl = document.getElementById('weather');
const API_KEY = 'YOUR_OPENWEATHERMAP_KEY';
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
        let imgHtml = item.thumbnail ? `<img src="${item.thumbnail}" class="news-img" alt="news image"><br>` : '';
        div.innerHTML =
            imgHtml +
            `<a href="${item.link}" target="_blank" class="news-title">${item.title}</a><hr>` +
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
