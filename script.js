// ---------------- CLOCK (Flip) ----------------
const clockEl = document.getElementById('clock');

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

        // パネルに収まる最大フォントサイズを計算
        const fontSize = Math.floor(Math.min(panelWidth / 6, panelHeight / 2));
        tick.root.style.fontSize = fontSize + 'px';
    }
    updateSize();
    window.addEventListener('resize', updateSize);
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    const tick = new FlipClock.Clock(clockEl); // Flip Clock ライブラリで生成
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
    dateEl.style.textAlign = 'right';
}

updateDate();
setInterval(updateDate, 60*1000); // 1分ごと更新

// ---------------- WEATHER ----------------
const weatherEl = document.getElementById('weather');
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
setInterval(fetchWeather, 10*60*1000); // 10分ごと更新

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

        let imgHtml = '';
        if(item.thumbnail) {
            imgHtml = `<img src="${item.thumbnail}" class="news-img" alt="news image"><br>`;
        }

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
setInterval(fetchNews, 5*60*1000); // 5分ごと更新
setInterval(showNews, 5000);        // 5秒ごと切替
