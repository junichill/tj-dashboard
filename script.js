// ---------------- CLOCK ----------------
const clockEl = document.getElementById('clock');

function initFlipClock() {
    try {
        // Flip.js ライブラリで時計を初期化
        const clock = new Flip.Clock(clockEl, {
            value: "00:00:00",
            animation: "flip",
            spacing: 10
        });

        // 1秒ごとに現在時刻を更新
        setInterval(() => {
            const now = new Date();
            const h = String(now.getHours()).padStart(2,'0');
            const m = String(now.getMinutes()).padStart(2,'0');
            const s = String(now.getSeconds()).padStart(2,'0');
            clock.value = `${h}:${m}:${s}`;
        }, 1000);

        // 左パネル幅いっぱいにリサイズ
        function resizeClock() {
            const panelWidth = document.getElementById('left-panel').clientWidth;
            const panelHeight = document.getElementById('left-panel').clientHeight;
            const fontSize = Math.floor(Math.min(panelWidth / 6, panelHeight / 2));
            clock.root.style.fontSize = fontSize + 'px';
        }
        resizeClock();
        window.addEventListener('resize', resizeClock);

    } catch(e) {
        console.error("Flip Clock initialization failed:", e);
        clockEl.textContent = "Clock Error";
    }
}

// ---------------- DATE ----------------
const dateEl = document.getElementById('date');
function updateDate() {
    try {
        const now = new Date();
        const year = now.getFullYear();
        const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const month = monthNames[now.getMonth()];
        const date = now.getDate();
        const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        const day = weekdays[now.getDay()];
        dateEl.textContent = `${day}, ${month} ${date}, ${year}`;
        dateEl.style.textAlign = 'right';
    } catch(e) {
        console.error("Date update failed:", e);
    }
}
updateDate();
setInterval(updateDate, 60*1000);

// ---------------- WEATHER ----------------
const weatherEl = document.getElementById('weather');
const API_KEY = 'eed3942fcebd430b2e32dfff2c611b11';
const LAT = 35.5309;
const LON = 139.7033;

async function fetchWeather() {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&lang=en&units=metric`);
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
    } catch(e) {
        weatherEl.textContent = 'Weather fetch failed';
        console.error(e);
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
        newsItems = data.items || [];
        newsIndex = 0;
        prepareNewsElements();
        showNews();
    } catch(e) {
        newsCard.textContent = 'News fetch failed';
        console.error(e);
    }
}

function prepareNewsElements() {
    newsCard.innerHTML = '';
    newsElements = newsItems.map(item => {
        const div = document.createElement('div');
        div.className = 'news-item';

        let imgHtml = '';
        if(item.thumbnail) imgHtml = `<img src="${item.thumbnail}" class="news-img" alt="news image"><br>`;

        div.innerHTML =
            imgHtml +
            `<a href="${item.link}" target="_blank" class="news-title">${item.title}</a><hr>` +
            `<div class="news-pubdate" style="text-align:right;">${item.pubDate}</div>` +
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

// ---------------- INITIALIZE ----------------
document.addEventListener('DOMContentLoaded', () => {
    initFlipClock();
});
