// =========================
// Tick CLOCK
// =========================
function handleTickInit(tick) {
  const secondsEl = document.getElementById('seconds-static');
  Tick.helper.interval(() => {
    const d = new Date();
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    const s = d.getSeconds().toString().padStart(2, '0');
    tick.value = { hours1: h[0], hours2: h[1], minutes1: m[0], minutes2: m[1] };
    if (secondsEl) { secondsEl.textContent = s; }
  }, 1000);
}

// =========================
// DATE
// =========================
function updateDate() {
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const date = now.getDate();
    const year = now.getFullYear();
    const reiwa = year - 2018;
    const dateEl = document.getElementById('date');
    if (dateEl) {
        dateEl.innerHTML = `${dayName}, ${monthName} ${date}, ${year} <span class="era-label">(R${reiwa})</span>`;
    }
}
updateDate();
setInterval(updateDate, 60000);

// =========================
// WEATHER 設定 & アイコン
// =========================
const API_KEY = 'eed3942fcebd430b2e32dfff2c611b11';
const LAT = 35.6895;
const LON = 139.6917;

const WEATHER_ICONS = {
  sunny: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4"><circle cx="32" cy="32" r="12"/><line x1="32" y1="2" x2="32" y2="14"/><line x1="32" y1="50" x2="32" y2="62"/><line x1="2" y1="32" x2="14" y2="32"/><line x1="50" y1="32" x2="62" y2="32"/><line x1="10" y1="10" x2="18" y2="18"/><line x1="46" y1="46" x2="54" y2="54"/><line x1="46" y1="18" x2="54" y2="10"/><line x1="10" y1="54" x2="18" y2="46"/></svg>`,
  cloudy: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4"><path d="M20 44h26a10 10 0 0 0 0-20 14 14 0 0 0-27-4A10 10 0 0 0 20 44z"/></svg>`,
  rainy: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 36c0-11 9-20 20-20s20 9 20 20H12z" /><line x1="32" y1="16" x2="32" y2="12" /><path d="M32 36v12c0 4-3 7-7 7s-7-3-7-7" /></svg>`,
  snowy: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="46" r="14" /><circle cx="32" cy="22" r="10" /><circle cx="28" cy="20" r="0.5" fill="currentColor" stroke="none" /><circle cx="36" cy="20" r="0.5" fill="currentColor" stroke="none" /><line x1="20" y1="40" x2="12" y2="32" /><line x1="44" y1="40" x2="52" y2="32" /></svg>`,
};

function getWeatherType(id) {
  if (id >= 200 && id < 600) return 'rainy';
  if (id >= 600 && id < 700) return 'snowy';
  if (id >= 801) return 'cloudy';
  return 'sunny';
}

// =========================
// WEATHER 背景更新
// =========================
function updateWeatherBackground(weatherId) {
    const el = document.getElementById('weather-fixed-content');
    if (!el) return;
    const month = new Date().getMonth() + 1;
    let bgUrl = "";
    if (weatherId >= 200 && weatherId < 600) {
        bgUrl = "https://images.unsplash.com/photo-1438449805896-28a666819a20?auto=format&fit=crop&w=800&q=80"; // 雨
    } else if (month >= 3 && month <= 5) {
        bgUrl = "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?auto=format&fit=crop&w=800&q=80"; // 春
    } else if (month >= 6 && month <= 8) {
        bgUrl = "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?auto=format&fit=crop&w=800&q=80"; // 夏
    } else if (month >= 9 && month <= 11) {
        bgUrl = "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?auto=format&fit=crop&w=800&q=80"; // 秋
    } else {
        bgUrl = "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=800&q=80"; // 冬
    }
    el.style.backgroundImage = `url('${bgUrl}')`;
}

// =========================
// HTML生成関数 (WEATHER)
// =========================
function createForecastGroupHtml(list, label) {
  const itemsHtml = list.map(item => {
    const date = new Date(item.dt * 1000);
    const hour = date.getHours().toString().padStart(2, '0') + ":00";
    const temp = Math.round(item.main.temp);
    const type = getWeatherType(item.weather[0].id);
    return `<div class="forecast-item"><div class="forecast-time">${hour}</div><div class="weather-icon weather-${type}">${WEATHER_ICONS[type]}</div><div class="forecast-temp">${temp}℃</div></div>`;
  }).join('');
  return `<div class="day-group"><div class="day-label">— ${label} —</div><div class="day-items">${itemsHtml}</div></div>`;
}

function createWeeklyForecastHtml(list) {
  const dailyData = {};
  list.forEach(item => {
    const dateObj = new Date(item.dt * 1000);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = dateObj.getDate();
    const dateKey = `${dayName} ${dayNum}`;
    if (!dailyData[dateKey]) dailyData[dateKey] = { temps: [], ids: [] };
    dailyData[dateKey].temps.push(item.main.temp);
    dailyData[dateKey].ids.push(item.weather[0].id);
  });
  let itemsHtml = '';
  Object.keys(dailyData).slice(1, 6).forEach(date => {
    const day = dailyData[date];
    const maxTemp = Math.round(Math.max(...day.temps));
    const minTemp = Math.round(Math.min(...day.temps));
    const midId = day.ids[Math.floor(day.ids.length / 2)];
    const type = getWeatherType(midId);
    itemsHtml += `<div class="forecast-item weekly-item"><div class="forecast-time">${date}</div><div class="weather-icon weather-${type}">${WEATHER_ICONS[type]}</div><div class="forecast-temp weekly-temp"><span class="max">${maxTemp}</span><span class="separator">/</span><span class="min">${minTemp}</span></div></div>`;
  });
  return `<div class="day-group"><div class="day-label">— Weekly Outlook —</div><div class="day-items">${itemsHtml}</div></div>`;
}

let economicScheduleHtml = ""; 
async function fetchEconomicSchedule() {
  economicScheduleHtml = `
    <div class="day-group">
      <div class="day-label">— Economic Calendar —</div>
      <div id="tv-economic-calendar" style="width:100%; height:200px;"></div>
    </div>`;
}

// =========================
// WEATHER & MARKET メイン表示
// =========================
let weatherSlideIndex = 0;
let weatherTimer = null;

async function fetchWeather() {
  try {
    await fetchEconomicSchedule();
    const r = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=ja`);
    const d = await r.json();
    if (!d || !d.list) return;

    const wrapper = document.getElementById('forecast-wrapper');
    const todayHtml = createForecastGroupHtml(d.list.slice(0, 8), "Today's Forecast");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString();
    const tomorrowList = d.list.filter(item => new Date(item.dt * 1000).toLocaleDateString() === tomorrowStr).slice(0, 8);
    const tomorrowHtml = createForecastGroupHtml(tomorrowList, "Tomorrow's Plan");
    const weeklyHtml = createWeeklyForecastHtml(d.list);

    const mktHtml = (id, label) => `<div class="day-group"><div class="day-label">— ${label} —</div><div id="${id}" style="width:700px; height:130px;"></div></div>`;

    wrapper.innerHTML = todayHtml + tomorrowHtml + weeklyHtml + 
                        mktHtml("tv-sp500", "S&P 500 Futures") +
                        mktHtml("tv-gold", "Gold Spot") +
                        mktHtml("tv-oil", "WTI Crude Oil") +
                        mktHtml("tv-eur-jpy", "EUR/JPY") +
                        mktHtml("tv-eur-usd", "EUR/USD") +
                        economicScheduleHtml;

    initTradingViewWidgets();
    weatherSlideIndex = 0;
    wrapper.style.transform = `translateY(0px)`;

    const weatherFixed = document.getElementById('weather-fixed-content');
    if (weatherFixed) {
        const today = d.list[0];
        const dayTemps = d.list.slice(0, 8).map(v => v.main.temp);
        const tomorrowList = d.list.filter(item => new Date(item.dt * 1000).toLocaleDateString() === tomorrowStr);

        const createSlide = (title, iconType, high, low, pop, prevHigh = null, prevLow = null) => {
            const dateObj = new Date();
            if (title === "明日") dateObj.setDate(dateObj.getDate() + 1);
            const dateStr = `${dateObj.getMonth() + 1}/${dateObj.getDate()}(${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dateObj.getDay()]})`;
            const formatDiff = (h, ph) => {
                if (ph === null) return "";
                const diff = Math.round(h - ph);
                if (diff > 0) return `<span class="diff-plus">[+${diff}]</span>`;
                if (diff < 0) return `<span class="diff-minus">[${diff}]</span>`;
                return `<span class="diff-zero">[±0]</span>`;
            };

            return `
            <div class="weather-slide">
                <div class="weather-slide-label">${title} ${dateStr}</div>
                <div class="weather-icon-large weather-${iconType}">${WEATHER_ICONS[iconType]}</div>
                <div class="weather-sub-info">
                    <span>${iconType === 'sunny' ? '晴れ' : iconType === 'cloudy' ? '曇り' : '雨'}</span>
                    <span><svg class="drop-icon" viewBox="0 0 24 24" fill="#4fc3f7" width="16"><path d="M12,2C12,2 6,8.19 6,12.5C6,15.78 8.42,18.5 12,18.5C15.58,18.5 18,15.78 18,12.5C18,8.19 12,2 12,2Z"/></svg>${Math.round(pop * 100)}%</span>
                </div>
                <div class="weather-data-line">
                    <span class="hi">${Math.round(high)}°${formatDiff(high, prevHigh)}</span>
                    <span class="sep">/</span>
                    <span class="lo">${Math.round(low)}°${formatDiff(low, prevLow)}</span>
                </div>
            </div>`;
        };

        weatherFixed.innerHTML = `
            <div id="weather-fixed-wrapper">
                ${createSlide("今日", getWeatherType(today.weather[0].id), Math.max(...dayTemps), Math.min(...dayTemps), today.pop || 0, 10, 2)}
                ${createSlide("明日", getWeatherType(tomorrowList[0].weather[0].id), Math.max(...tomorrowList.map(v=>v.main.temp)), Math.min(...tomorrowList.map(v=>v.main.temp)), tomorrowList[0].pop || 0, Math.max(...dayTemps), Math.min(...dayTemps))}
            </div>`;

        if (today && today.weather[0]) updateWeatherBackground(today.weather[0].id);

        const slides = weatherFixed.querySelectorAll('.weather-slide');
        if(slides.length > 0) slides[0].classList.add('active'); 
        startFixedWeatherCycle();
    }
    startWeatherCycle();
  } catch (err) { console.error('Weather/Market Fetch Error:', err); }
}

let forexVIndex = 0;

function initTradingViewWidgets() {
    const conf = { "width": "100%", "height": 155, "locale": "ja", "dateRange": "1D", "colorTheme": "dark", "isTransparent": true, "interval": "5" };
    
    // スライド用3通貨（IDを変更）
    appendMiniWidget("slide-usd-jpy", { ...conf, "symbol": "FX:USDJPY" });
    appendMiniWidget("slide-eur-jpy", { ...conf, "symbol": "FX:EURJPY" });
    appendMiniWidget("slide-eur-usd", { ...conf, "symbol": "FX:EURUSD" });

    // 固定2指標（元のまま）
    appendMiniWidget("tv-n225-fixed",    { ...conf, "symbol": "OSE:NK2251!" });
    appendMiniWidget("tv-nasdaq-fixed",  { ...conf, "symbol": "CAPITALCOM:US100" });

    // その他中央パネル用
    appendMiniWidget("tv-sp500",   { ...conf, "symbol": "CAPITALCOM:US500" });
    appendMiniWidget("tv-gold",    { ...conf, "symbol": "TVC:GOLD" });
    appendMiniWidget("tv-oil",     { ...conf, "symbol": "CAPITALCOM:OIL_CRUDE" });
    appendMiniWidget("tv-eur-jpy", { ...conf, "symbol": "FX:EURJPY" });
    appendMiniWidget("tv-eur-usd", { ...conf, "symbol": "FX:EURUSD" });

    // 縦スライド開始
    startForexVerticalSlide();
}

let forexTimer = null;
let forexRotationDegree = 0;

function startForexVerticalSlide() {
    const wrapper = document.getElementById('forex-wrapper-v');
    const slides = document.querySelectorAll('.forex-slide-v');
    if (!wrapper || slides.length === 0) return;

    // --- 【修正点】既存のタイマーがあれば破棄する ---
    if (forexTimer) {
        clearInterval(forexTimer);
    }

    // 初期化: すべての面をflex表示にして3D配置を確定
    slides.forEach(s => s.style.display = 'flex');

    // 新しいタイマーを登録
    forexTimer = setInterval(() => {
        forexRotationDegree -= 120;
        wrapper.style.transform = `rotateX(${forexRotationDegree}deg)`;
    }, 12000); // 12秒ごとに回転
}

function appendMiniWidget(containerId, config) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = ''; 
    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify(config);
    container.appendChild(script);
}

function startWeatherCycle() {
  if (weatherTimer) clearInterval(weatherTimer);
  const wrapper = document.getElementById('forecast-wrapper');
  weatherTimer = setInterval(() => {
    const groups = wrapper.querySelectorAll('.day-group');
    if (groups.length === 0) return;
    const nextIndex = (weatherSlideIndex + 1) % groups.length;
    if (nextIndex === 0) {
      wrapper.style.transition = 'opacity 1.5s ease-in, filter 1.5s ease-in, transform 1.5s ease-in';
      wrapper.style.opacity = '0';
      wrapper.style.filter = 'blur(15px)';
      wrapper.style.transform = `translateY(${weatherSlideIndex * -250}px) scale(0.92)`;
      setTimeout(() => {
        weatherSlideIndex = 0;
        wrapper.style.transition = 'none';
        wrapper.style.transform = `translateY(0px) scale(0.92)`;
        groups.forEach((g, i) => g.classList.toggle('inactive', i !== 0));
        wrapper.offsetHeight; 
        wrapper.style.transition = 'opacity 1.8s ease-out, filter 1.8s ease-out, transform 1.8s ease-out';
        wrapper.style.opacity = '1';
        wrapper.style.filter = 'blur(0)';
        wrapper.style.transform = `translateY(0px) scale(1)`;
      }, 1500);
    } else {
      weatherSlideIndex = nextIndex;
      wrapper.style.transition = 'transform 1.2s cubic-bezier(0.65, 0, 0.35, 1), opacity 1.2s ease';
      wrapper.style.transform = `translateY(${weatherSlideIndex * -250}px) scale(1)`;
      groups.forEach((group, index) => { group.classList.toggle('inactive', index !== weatherSlideIndex); });
    }
  }, 9000);
}

let fixedWeatherIndex = 0;
function startFixedWeatherCycle() {
    const slides = document.querySelectorAll('.weather-slide');
    if (slides.length === 0) return;

    if (window.fixedWeatherTimer) clearInterval(window.fixedWeatherTimer);
    
    fixedWeatherIndex = 0;

    window.fixedWeatherTimer = setInterval(() => {
        const currentSlides = document.querySelectorAll('.weather-slide');
        if (currentSlides.length < 2) return;

        // 1. 今のスライドに「粒子消去」クラスをつける
        currentSlides[fixedWeatherIndex].classList.remove('active');
        currentSlides[fixedWeatherIndex].classList.add('exit');

  // 2. 消え去る粒子(3.5秒)を見せた後、さらに「無」の時間を足して待つ
        const particleTime = 3500; // 粒子が消えるのにかかる時間
        const silentTime = 2000;   // 背景だけを見せたい時間（2秒）

        setTimeout(() => {
            // クリーンアップ
            currentSlides[fixedWeatherIndex].classList.remove('exit');

            // 3. 完全に消えた後に、インデックスを進めて次を表示
            fixedWeatherIndex = (fixedWeatherIndex + 1) % currentSlides.length;
            currentSlides[fixedWeatherIndex].classList.add('active');
            
        }, particleTime + silentTime); // ここで合計の待ち時間を指定
    }, 12000); // 12秒おきに切り替え
}

fetchWeather();
setInterval(fetchWeather, 600000);

// =========================
// NEWS
// =========================
const RSS_URL = 'https://news.web.nhk/n-data/conf/na/rss/cat0.xml';
const newsCard = document.getElementById('news-card');
let newsItems = [], newsEls = [], index = 0, newsT = null;
let lastGoodNews = null;
const AUTO_INTERVAL = 11000, FETCH_INTERVAL = 10*60*1000;

function createNews(index) {
    if (newsItems.length === 0) return;

    const item = document.createElement('div');
    item.className = 'news-item';
    
    // 背景画像の設定（元のunsplash画像を維持）
    item.style.backgroundImage = "url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop')";

    const currentItems = [];
    for (let i = 0; i < 10; i++) {
        currentItems.push(newsItems[(index + i) % newsItems.length]);
    }

item.innerHTML = `
        <div class="news-link-wrapper">
            <div class="news-mark"></div>
            <div class="news-content-area">
                <div class="main-container">
                    <a href="${currentItems[0].link || '#'}" target="_blank" class="news-main-link">
                     <div class="news-title">${currentItems[0].title}</div>
                    </a>

                    <div class="news-description">${currentItems[0].description || ''}</div>
                    <div class="news-date">${currentItems[0].pubDate || ''}</div>
                </div>
                <div class="sub-list">
                    ${currentItems.slice(1).map(sub => `
                        <a href="${sub.link || '#'}" target="_blank" class="news-sub-link">
                         <div class="sub-row">
                         <div class="sub-dot"></div>
                         <div class="sub-row-title">${sub.title}</div>
                         </div>
                        </a>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
  return item;
}

function showNews(next, init = false) {
  if (!newsEls[next]) return;
  newsEls.forEach(el => el.classList.remove('show', 'next', 'exit'));
  if (!init) { newsEls[index].classList.add('exit'); }
  newsEls[next].classList.add('show');
  const nxtIdx = (next + 1) % newsEls.length;
  if (newsEls[nxtIdx]) newsEls[nxtIdx].classList.add('next');
  index = next;
}

let newsIndex = 0;

async function fetchNews() {
    // 【重要】ここにステップ2でコピーしたURLを貼り付けてください
    const MY_GAS_URL = "https://script.google.com/macros/s/AKfycbx6dVnRjptPeQouJM6Czl-GUBqQzxFq8Nj06POOVbqTEGb_w4Wx0rHm-M9_GgApEWnv/exec";

    try {
        // GAS経由で取得（GASがCORSを解決済みなのでそのまま呼べる）
        const r = await fetch(MY_GAS_URL);
        const xmlText = await r.text();
        
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, "application/xml");
        const items = xml.querySelectorAll('item');
        
        newsItems = Array.from(items).map(item => ({
         title: item.querySelector('title')?.textContent,
         link: item.querySelector('link')?.textContent, // これが必要！
         pubDate: item.querySelector('pubDate')?.textContent,
         description: item.querySelector('description')?.textContent
        }));

        if (newsItems.length > 0) {
            renderNewsBoard(0); // せり上がり演出のボードを表示
            startAutoNews();    // 自動ループ開始
        }
    } catch (e) {
        console.error('GAS経由の取得に失敗しました', e);
    }
}

// newsItemsには常に最新の20件程度が入っている前提
let newsDisplayIndex = 0;

function renderNewsBoard(idx) {
    const subList = document.querySelector('.sub-list');
    if (!subList) return;

    // 初回実行時、またはリストが空の時に中身を充填
    if (subList.children.length === 0) {
        let initialHtml = "";
        for (let i = 0; i < 10; i++) {
            const item = newsItems[(idx + i) % newsItems.length];
            initialHtml += createSubRowHtml(item);
        }
        subList.innerHTML = initialHtml;
    }

    // スライド演出の開始
    slideNextNews();
}

function createSubRowHtml(item) {
    return `
        <a href="${item.link || '#'}" target="_blank" class="news-sub-link">
            <div class="sub-row">
                <div class="sub-dot"></div>
                <div class="sub-row-title">${item.title}</div>
            </div>
        </a>`;
}

async function slideNextNews() {
    const subList = document.querySelector('.sub-list');
    const firstItem = subList.firstElementChild;
    if (!firstItem) return;

    // 1. 次に表示すべきニュースのインデックスを更新
    newsDisplayIndex = (newsDisplayIndex + 1) % newsItems.length;
    // 10件表示しているので、次に「新しく下から出てくる」のは index + 9 のデータ
    const nextNewsData = newsItems[(newsDisplayIndex + 9) % newsItems.length];

    // 2. 一番下に新しいニュースを準備（まだ見えない状態）
    const newItemHtml = createSubRowHtml(nextNewsData);
    subList.insertAdjacentHTML('beforeend', newItemHtml);

    // 3. アニメーション：全体を上に1行分ずらす
    const rowHeight = 36; // CSSで指定する sub-row の高さ + margin
    subList.style.transition = "transform 0.8s cubic-bezier(0.65, 0, 0.35, 1)";
    subList.style.transform = `translateY(-${rowHeight}px)`;

    // 4. アニメーション完了後に要素を整理
    setTimeout(() => {
        subList.style.transition = "none";
        subList.style.transform = "translateY(0)";
        // 先頭（一番上）だった要素を削除
        if (subList.firstElementChild) subList.firstElementChild.remove();
    }, 800);
}

function startAutoNews() {
    if (newsT) clearInterval(newsT);
    newsT = setInterval(() => {
        // 次のインデックスへ（数珠つなぎの核：次は「今の2番目」が「1番目」になるようにidxを+1する）
        const nextIdx = (newsIndex + 1) % newsItems.length;
        renderNewsBoard(nextIdx);
    }, AUTO_INTERVAL);
}

fetchNews();
setInterval(fetchNews, FETCH_INTERVAL);

// =========================
// SCALING
// =========================
function adjustScale() {
    const container = document.getElementById('container');
    if (!container) return;
    const baseWidth = 1920, baseHeight = 720;
    const sW = window.innerWidth, sH = window.innerHeight;
    let scale = Math.min(sW / baseWidth, sH / baseHeight);
    container.style.transform = `scale(${scale})`;
}
window.addEventListener('resize', adjustScale);
window.addEventListener('load', adjustScale);
adjustScale();


let trendItems = [];
let trendIndex = 0;

// =========================
// TRENDS (Google Trends via GAS) - 修正版
// =========================
async function fetchTrends() {
    const container = document.getElementById('trend-fixed-content');
    if (!container) return;

    // あなたのGAS URL
    const MY_GAS_URL = "https://script.google.com/macros/s/AKfycbx6dVnRjptPeQouJM6Czl-GUBqQzxFq8Nj06POOVbqTEGb_w4Wx0rHm-M9_GgApEWnv/exec?type=trends";
    
    let trendData = [];

    try {
        const r = await fetch(MY_GAS_URL);
        const xmlText = await r.text();
        
        // XMLパース処理
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, "application/xml");
        const items = xml.querySelectorAll('item');
        
        // データの抽出
        if (items.length > 0) {
            trendData = Array.from(items).map(item => item.querySelector('title')?.textContent || "");
        } else {
            console.warn("Trends data extraction failed or empty.");
        }
    } catch (e) {
        console.error('Trends fetch failed via GAS:', e);
        // エラー時はtrendDataは空配列のまま進む
    }

    // 【重要】成功・失敗に関わらず描画を実行する
    // （データが空の場合は renderTrends 内でバックアップワードが使われる）
    const tiles = container.querySelectorAll('.trend-tile');
    
    if (tiles.length > 0) {
        // 既存タイルがある場合は沈み込み演出を入れてから更新
        tiles.forEach(t => {
            t.classList.remove('enter-active');
            t.classList.add('exit-active'); // CSSで未定義なら無視されるだけなので安全
        });
        setTimeout(() => {
            renderTrends(container, trendData);
        }, 800);
    } else {
        // 初回描画
        renderTrends(container, trendData);
    }
}

function renderTrends(container, data) {
    if (!container) return;
    
    // 8x4グリッド設定
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(8, 1fr)";
    container.style.gridTemplateRows = "repeat(4, 1fr)";
    container.style.gap = "0px"; 

    const backupWords = ["CORE_NODE", "MARKET_IDX", "GLB_FEED", "SIG_PROC", "DATA_STREAM", "CLOUD_ARC", "API_LINK", "NET_STAT"];
    let finalData = [];
    for (let i = 0; i < 8; i++) {
        finalData.push(data[i] || backupWords[i]);
    }

    // 順位入れ替え（デザイン上のアクセント）
    const temp = finalData[2];
    finalData[2] = finalData[3];
    finalData[3] = temp;

    let html = "";
    const colormap = [
        "rgba(213, 62, 79, 0.95)", "rgba(244, 109, 67, 0.9)", "rgba(253, 174, 97, 0.85)",
        "rgba(171, 221, 164, 0.8)", "rgba(102, 194, 165, 0.75)", "rgba(50, 136, 189, 0.7)",
        "rgba(35, 80, 160, 0.65)", "rgba(20, 30, 100, 0.6)"
    ];

    const layouts = [
        "grid-area: 1 / 1 / 4 / 6;", // 1位
        "grid-area: 1 / 6 / 3 / 9;", // 2位
        "grid-area: 3 / 6 / 5 / 8;", // 3位
        "grid-area: 3 / 8 / 5 / 9;", // 4位
        "grid-area: 4 / 1 / 5 / 3;", // 5位
        "grid-area: 4 / 3 / 5 / 5;", // 6位
        "grid-area: 4 / 5 / 5 / 6;", // 7位
    ];

    for (let i = 1; i <= 7; i++) {
        let style = layouts[i-1];
        let content = finalData[i-1];
        let bgColor = colormap[i-1];
        let fontSize = i === 1 ? "44px" : (i <= 3 ? "20px" : "13px");
        let textColor = (i >= 3 && i <= 5) ? "rgba(0,0,0,0.75)" : "#ffffff";
        
        let valTag = "";
        if (i <= 2) {
            const randomVal = (Math.random() * 100).toFixed(1);
            valTag = `<span style="position:absolute; bottom:12px; right:12px; font-size:14px; font-weight:400; font-family:monospace; opacity:0.9;">${randomVal}%</span>`;
        }

        html += `<div class="trend-tile" style="${style} 
                    background-color: ${bgColor} !important;
                    border: 0.5px solid rgba(255,255,255,0.08) !important;
                    position: relative;
                    display: flex; align-items: center; justify-content: center;
                    font-size: ${fontSize}; 
                    font-weight: 300;
                    letter-spacing: 0.05em;
                    color: ${textColor}; 
                    padding: 25px; text-align: center;
                    text-transform: uppercase; 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    overflow: hidden;
                    cursor: pointer;
                    opacity: 0;"
                    onclick="window.open('https://www.google.com/search?q=${encodeURIComponent(content)}', '_blank')">
                    <div style="width:100%; word-wrap: break-word; line-height:1.1;">${content}</div>
                    ${valTag}
                 </div>`;
    }
    container.innerHTML = html;

    // 描き出し直後にスタッガー登場アニメーション
    const newTiles = container.querySelectorAll('.trend-tile');
    newTiles.forEach((tile, i) => {
        setTimeout(() => {
            tile.classList.add('enter-active');
        }, i * 60); 
    });

    // サイクルタイマーを再起動
    startHeatmapCycle();
}

function startHeatmapCycle() {
    if (window.trendTimer) clearInterval(window.trendTimer);
    window.trendTimer = setInterval(() => {
        fetchTrends();
    }, 20000); 
}

// 起動時に実行
fetchTrends();
// 1時間ごとに最新トレンドに全取得更新
setInterval(fetchTrends, 3600000);
