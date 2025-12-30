// ---------------- CLOCK (Flip) ----------------
const clockEl = document.getElementById('clock');

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

function resizeClock(tick) {
    function updateSize() {
        const panel = document.getElementById('left-panel');
        const fontSize = Math.floor(
            Math.min(panel.clientWidth / 6, panel.clientHeight / 2)
        );
        tick.root.style.fontSize = fontSize + 'px';
    }
    updateSize();
    window.addEventListener('resize', updateSize);
}

document.addEventListener('DOMContentLoaded', () => {
    const tick = new FlipClock.Clock(clockEl);
    initClock(tick);
    resizeClock(tick);
});

// ---------------- DATE ----------------
const dateEl = document.getElementById('date');

function updateDate() {
    const now = new Date();
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    dateEl.textContent =
        `${weekdays[now.getDay()]}, ${monthNames[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    dateEl.style.textAlign = 'right';
}
updateDate();
setInterval(updateDate, 60000);

// ---------------- WEATHER ----------------
const weatherEl = document.getElementById('weather');
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
        const today = data.list.find(i => new Date(i.dt_txt).getDate() === now.getDate());
        const tomorrow = data.list.find(i =>
            new Date(i.dt_txt).getDate() === new Date(now.getTime()+86400000).getDate()
        );

        if (today && tomorrow) {
            weatherEl.innerHTML =
                `Today: ${today.main.temp.toFixed(1)}℃ / ${today.weather[0].description}<br>` +
                `Tomorrow: ${tomorrow.main.temp.toFixed(1)}℃ / ${tomorrow.weather[0].description}`;
        } else {
            weatherEl.textContent = 'Weather info unavailable';
        }
    } catch {
        weatherEl.textContent = 'Weather fetch failed';
    }
}
fetchWeather();
setInterval(fetchWeather, 600000);

// ---------------- NEWS ----------------
const rssUrl = 'https://news.web.nhk/n-data/conf/na/rss/cat0.xml';
const rss2jsonApi =
    'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(rssUrl);

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
        showNews(newsIndex);
    } catch {
        newsCard.textContent = 'News fetch failed';
    }
}

function prepareNewsElements() {
    newsCard.innerHTML = '';
    newsElements = newsItems.map(item => {
        const div = document.createElement('div');
        div.className = 'news-item';

        div.innerHTML = `
            ${item.thumbnail ? `<img src="${item.thumbnail}" class="news-img">` : ''}
            <a href="${item.link}" target="_blank" class="news-title">${item.title}</a>
            <hr>
            <div class="news-pubdate">${item.pubDate}</div>
            <div class="news-description">${item.description}</div>
        `;
        newsCard.appendChild(div);
        return div;
    });
}

function showNews(index) {
    if (!newsElements.length) return;
    newsElements.forEach((el,i) =>
        el.classList.toggle('show', i === index)
    );
}

// 自動切替
setInterval(() => {
    if (!newsElements.length) return;
    newsIndex = (newsIndex + 1) % newsElements.length;
    showNews(newsIndex);
}, 5000);

// -------- 横スクロール操作で切替 --------
let scrollAccumulator = 0;
const SCROLL_THRESHOLD = 80;

newsCard.addEventListener('wheel', e => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        scrollAccumulator += e.deltaX;

        if (scrollAccumulator > SCROLL_THRESHOLD) {
            newsIndex = (newsIndex + 1) % newsElements.length;
            showNews(newsIndex);
            scrollAccumulator = 0;
        } else if (scrollAccumulator < -SCROLL_THRESHOLD) {
            newsIndex = (newsIndex - 1 + newsElements.length) % newsElements.length;
            showNews(newsIndex);
            scrollAccumulator = 0;
        }
    }
}, { passive: false });

fetchNews();
setInterval(fetchNews, 300000);
