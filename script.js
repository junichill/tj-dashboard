// ---------------- CLOCK (Flip) ----------------
const clockEl = document.getElementById('clock');

// Flip Clock 初期化
function initClock(tick) {
    function update() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2,'0');
        const m = String(now.getMinutes()).padStart(2,'0');
        const s = String(now.getSeconds()).padStart(2,'0');
        const str = `${h}:${m}:${s}`;  // コロンを含む
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
        const fontSize = Math.floor(Math.min(panelWidth / 6, panelHeight / 2));
        tick.root.style.fontSize = fontSize + 'px';
    }
    updateSize();
    window.addEventListener('resize', updateSize);
}

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

        const todayWeather = data.list.f
