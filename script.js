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
// WEATHER 設定 & アイコン (Yahoo風・曇時々晴追加)
// =========================
const API_KEY = 'eed3942fcebd430b2e32dfff2c611b11';
const LAT = 35.6895;
const LON = 139.6917;

const WEATHER_ICONS = {
  sunny: `
    <svg viewBox="0 0 64 64">
      <circle class="sun-body" cx="32" cy="32" r="14" stroke-width="2"/>
      <g class="sun-rays" stroke-width="4" stroke-linecap="round">
        <line x1="32" y1="6" x2="32" y2="12"/><line x1="32" y1="52" x2="32" y2="58"/>
        <line x1="6" y1="32" x2="12" y2="32"/><line x1="52" y1="32" x2="58" y2="32"/>
        <line x1="13.6" y1="13.6" x2="17.8" y2="17.8"/><line x1="46.2" y1="46.2" x2="50.4" y2="50.4"/>
        <line x1="13.6" y1="50.4" x2="17.8" y2="46.2"/><line x1="46.2" y1="17.8" x2="50.4" y2="13.6"/>
      </g>
    </svg>`,
  partly_cloudy: `
    <svg viewBox="0 0 64 64">
      <g transform="translate(18, -4) scale(0.75)">
        <circle class="sun-body" cx="32" cy="32" r="14" stroke-width="2"/>
        <g class="sun-rays" stroke-width="4" stroke-linecap="round">
          <line x1="32" y1="6" x2="32" y2="12"/><line x1="32" y1="52" x2="32" y2="58"/>
          <line x1="6" y1="32" x2="12" y2="32"/><line x1="52" y1="32" x2="58" y2="32"/>
          <line x1="13.6" y1="13.6" x2="17.8" y2="17.8"/><line x1="46.2" y1="46.2" x2="50.4" y2="50.4"/>
          <line x1="13.6" y1="50.4" x2="17.8" y2="46.2"/><line x1="46.2" y1="17.8" x2="50.4" y2="13.6"/>
        </g>
      </g>
      <path class="cloud-body" d="M46,42a10,10,0,0,0,0-20,14,14,0,0,0-27-4,10,10,0,0,0,1,24Z" stroke-width="2" stroke-linejoin="round"/>
    </svg>`,
  cloudy: `
    <svg viewBox="0 0 64 64">
      <path class="cloud-dark" d="M46,42a10,10,0,0,0,0-20,14,14,0,0,0-27-4,10,10,0,0,0,1,24Z" stroke-width="2" stroke-linejoin="round"/>
    </svg>`,
  rainy: `
    <svg viewBox="0 0 64 64">
      <path class="cloud-dark" d="M46,36a10,10,0,0,0,0-20,14,14,0,0,0-27-4,10,10,0,0,0,1,24Z" stroke-width="2" stroke-linejoin="round"/>
      <g transform="translate(15, 12) scale(0.75)">
        <path class="rain-umbrella" d="M12,38a20,20,0,0,1,40,0Z" stroke-width="2"/>
        <path class="rain-umbrella" d="M32,38V50a4,4,0,0,1-8,0" fill="none" stroke-width="3" stroke-linecap="round"/>
      </g>
    </svg>`,
  snowy: `
    <svg viewBox="0 0 64 64">
      <path class="cloud-dark" d="M46,38a10,10,0,0,0,0-20,14,14,0,0,0-27-4,10,10,0,0,0,1,24Z" stroke-width="2" stroke-linejoin="round"/>
      <circle class="snow-body" cx="24" cy="48" r="4" stroke-width="1"/>
      <circle class="snow-body" cx="40" cy="48" r="4" stroke-width="1"/>
      <circle class="snow-body" cx="32" cy="54" r="4" stroke-width="1"/>
    </svg>`
};

function getWeatherType(id) {
  if (id >= 200 && id < 600) return 'rainy';
  if (id >= 600 && id < 700) return 'snowy';
  if (id === 800) return 'sunny';
  // 801(雲11-25%), 802(雲25-50%) の場合に「曇り時々晴れ」を適用
  if (id === 801 || id === 802) return 'partly_cloudy';
  if (id >= 803) return 'cloudy';
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

// =========================
// WEATHER & MARKET メイン表示
// =========================
let weatherSlideIndex = 0;
let weatherTimer = null;

async function fetchWeather() {
  try {
    const r = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=ja`);
    const d = await r.json();
    if (!d || !d.list) return;

    const wrapper = document.getElementById('forecast-wrapper');
    const todayHtml = createForecastGroupHtml(d.list.slice(0, 6), "Today's Forecast");
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString();
    const tomorrowList = d.list.filter(item => new Date(item.dt * 1000).toLocaleDateString() === tomorrowStr).slice(0, 6);
    const tomorrowHtml = createForecastGroupHtml(tomorrowList, "Tomorrow's Plan");

    // --- 追加：週間天気データ生成（各日のお昼のデータまたは最初のデータを抽出） ---
    const dailyList = [];
    const seenDates = new Set();
    d.list.forEach(item => {
        const dateStr = new Date(item.dt * 1000).toLocaleDateString();
        if (!seenDates.has(dateStr)) {
            const noonItem = d.list.find(x => new Date(x.dt * 1000).toLocaleDateString() === dateStr && new Date(x.dt * 1000).getHours() === 12);
            dailyList.push(noonItem || item);
            seenDates.add(dateStr);
        }
    });
    const weekItemsHtml = dailyList.slice(0, 6).map(item => {
        const date = new Date(item.dt * 1000);
        const dayStr = (date.getMonth() + 1) + "/" + date.getDate();
        const temp = Math.round(item.main.temp);
        const type = getWeatherType(item.weather[0].id);
        return `<div class="forecast-item"><div class="forecast-time">${dayStr}</div><div class="weather-icon weather-${type}">${WEATHER_ICONS[type]}</div><div class="forecast-temp">${temp}℃</div></div>`;
    }).join('');
    const weekHtml = `<div class="day-group"><div class="day-label">— Weekly Forecast —</div><div class="day-items">${weekItemsHtml}</div></div>`;
    // -------------------------------------------------------------

    // 経済指標用のHTMLブロック
    const economicScheduleHtml = `
      <div class="day-group">
        <div class="day-label">— Economic Calendar —</div>
        <div id="tv-economic-calendar" style="width:100%; height:200px;"></div>
      </div>`;

    // 4項目を結合して表示にセット（今日の天気 ＋ 明日の天気 ＋ 週間天気 ＋ 経済指標）
    wrapper.innerHTML = todayHtml + tomorrowHtml + weekHtml + economicScheduleHtml;

    // TradingView 経済指標カレンダーのスクリプトを注入
    const ecoContainer = document.getElementById('tv-economic-calendar');
    if (ecoContainer && ecoContainer.childElementCount === 0) {
        const script = document.createElement('script');
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
        script.async = true;
        script.innerHTML = JSON.stringify({
          "colorTheme": "dark",
          "isTransparent": true,
          "width": "100%",
          "height": "100%",
          "locale": "ja",
          "importanceFilter": "-1,0,1",
          "currencyFilter": "JPY,USD,EUR"
        });
        ecoContainer.appendChild(script);
    }

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
                ${createSlide("今日", getWeatherType(today.weather[0].id), Math.max(...dayTemps), Math.min(...dayTemps), today.pop || 0, null, null)}
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
let forexTimer = null;
let forexRotationDegree = 0;

// --- 左パネルの3D回転設定 ---
const LEFT_CONFIG = [
    {
        targetId: "forex-viewport-v", // 為替パネル
        symbols: ["FX_IDC:USDJPY", "FX_IDC:EURJPY", "FX_IDC:EURUSD"],
        delay: 0
    },
    {
        targetId: "tv-n225-fixed", 
        symbols: ["OSE:NK2251!", "OSE:NK225M1!", "TOPIX"],
        delay: 5000
    },
    {
        targetId: "tv-nasdaq-fixed", // 米国・コモディティ（指定シンボル）
        symbols: ["CAPITALCOM:US100", "CAPITALCOM:US500", "TVC:GOLD", "CAPITALCOM:OIL_CRUDE"],
        delay: 10000
    }
];

function initLeftPrisms() {
    LEFT_CONFIG.forEach((conf, idx) => {
        const container = document.getElementById(conf.targetId);
        if (!container) return;

        const count = conf.symbols.length;
        const step = 360 / count; 
        
        // 重なり防止：4面(90度)と3面(120度)で奥行きを調整
        const translateZ = count === 4 ? "60px" : "40px";

        // 各面をあらかじめ回転・配置させて重なりを解消
        const facesHtml = conf.symbols.map((_, sIdx) => {
            return `<div class="prism-face" id="f-${idx}-${sIdx}" 
                         style="transform: rotateX(${sIdx * step}deg) translateZ(${translateZ});">
                    </div>`;
        }).join('');

        // 表題（Currency等）は一切入れず、構造のみ生成
        container.innerHTML = `
            <div class="mini-widget-fixed">
                <div class="prism-stage" id="prism-stage-${idx}">
                    ${facesHtml}
                </div>
            </div>`;

        // TradingViewウィジェット埋め込み
        conf.symbols.forEach((sym, sIdx) => {
            const script = document.createElement('script');
            script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
            script.async = true;
            script.innerHTML = JSON.stringify({
                "symbol": sym, "width": "100%", "height": "100%", "locale": "ja",
                "dateRange": "1D", "colorTheme": "dark", "isTransparent": true
            });
            const face = document.getElementById(`f-${idx}-${sIdx}`);
            if (face) face.appendChild(script);
        });

        // 回転処理
        setTimeout(() => {
            let angle = 0;
            setInterval(() => {
                angle -= step;
                const stage = document.getElementById(`prism-stage-${idx}`);
                if (stage) stage.style.transform = `rotateX(${angle}deg)`;
            }, 15000); 
        }, conf.delay);
    });
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

        currentSlides[fixedWeatherIndex].classList.remove('active');
        currentSlides[fixedWeatherIndex].classList.add('exit');

        const particleTime = 3500; 
        const silentTime = 2000;   

        setTimeout(() => {
            currentSlides[fixedWeatherIndex].classList.remove('exit');
            fixedWeatherIndex = (fixedWeatherIndex + 1) % currentSlides.length;
            currentSlides[fixedWeatherIndex].classList.add('active');
        }, particleTime + silentTime); 
    }, 12000); 
}

fetchWeather();
initLeftPrisms(); 
setInterval(fetchWeather, 600000);


// =========================
// NEWS - シンクロ・スライド方式
// =========================
let newsData = [];
let newsCursor = 0;
const NEWS_FETCH_INTERVAL = 10 * 60 * 1000; 
const NEWS_SLIDE_INTERVAL = 8000; 

async function fetchNews() {
    const MY_GAS_URL = "https://script.google.com/macros/s/AKfycbyWq0pZXLP2ZE2ptRr-1iAxD0fT6WzTFS1E1oCAMKba7AAroldDcCZcK_HRnjed-ua2/exec";

    try {
        const r = await fetch(MY_GAS_URL);
        const xmlText = await r.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, "application/xml");
        const items = xml.querySelectorAll('item');

        newsData = Array.from(items).map(item => ({
            title: item.querySelector('title')?.textContent || "",
            link: item.querySelector('link')?.textContent || "#",
            pubDate: item.querySelector('pubDate')?.textContent || "",
            description: item.querySelector('description')?.textContent || ""
        }));

        if (newsData.length > 0) {
            const card = document.getElementById('news-card');
            if (!card.querySelector('.news-container-overlay')) {
                initNewsSystem();
            }
        }
    } catch (e) {
        console.error('GAS News Fetch Error:', e);
    }
}

function initNewsSystem() {
    const card = document.getElementById('news-card');
    
    card.innerHTML = `
        <div class="news-container-overlay">
            <div class="news-main-area">
                <div class="news-main-wrapper" id="news-main-wrapper">
                    </div>
            </div>
            
            <div class="news-sub-window">
                <div class="news-sub-track" id="news-track">
                    </div>
            </div>
        </div>
    `;

    updateNewsDisplay();
    setInterval(slideNewsNext, NEWS_SLIDE_INTERVAL);
}

function updateNewsDisplay() {
    const wrapper = document.getElementById('news-main-wrapper');
    if (!wrapper || newsData.length === 0) return;

    const mainItem = newsData[newsCursor % newsData.length];
    
    wrapper.innerHTML = `
        <a href="${mainItem.link}" target="_blank" class="news-title">${mainItem.title}</a>
        <div class="news-description">${mainItem.description}</div>
        <div class="news-date">${mainItem.pubDate}</div>
    `;
    
    wrapper.className = 'news-main-wrapper news-anim-idle';
    renderSubTrack();
}

function renderSubTrack() {
    const track = document.getElementById('news-track');
    let html = '';
    for (let i = 1; i <= 10; i++) {
        const subItem = newsData[(newsCursor + i) % newsData.length];
        html += `
            <a href="${subItem.link}" target="_blank" class="news-sub-item">
                <div class="sub-dot"></div>
                <div class="sub-row-title">${subItem.title}</div>
            </a>
        `;
    }
    track.innerHTML = html;
}

function slideNewsNext() {
    const wrapper = document.getElementById('news-main-wrapper');
    const track = document.getElementById('news-track');
    if (!wrapper || !track) return;

    const animDuration = 600; 
    const rowHeight = 51; 

    wrapper.className = 'news-main-wrapper news-anim-exit';
    
    track.style.transition = `transform ${animDuration}ms cubic-bezier(0.2, 0.8, 0.2, 1)`;
    track.style.transform = `translateY(-${rowHeight}px)`;

    setTimeout(() => {
        newsCursor++;
        const nextMainItem = newsData[newsCursor % newsData.length];

        wrapper.innerHTML = `
            <a href="${nextMainItem.link}" target="_blank" class="news-title">${nextMainItem.title}</a>
            <div class="news-description">${nextMainItem.description}</div>
            <div class="news-date">${nextMainItem.pubDate}</div>
        `;

        wrapper.style.transition = 'none';
        wrapper.className = 'news-main-wrapper news-anim-enter-prepare';
        
        track.style.transition = 'none';
        track.style.transform = 'translateY(0)';
        renderSubTrack(); 

        void wrapper.offsetWidth; 

        wrapper.style.transition = `transform ${animDuration}ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity ${animDuration}ms ease`;
        wrapper.className = 'news-main-wrapper news-anim-idle';

    }, animDuration); 
}

fetchNews();
setInterval(fetchNews, NEWS_FETCH_INTERVAL);

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

// =========================
// TRENDS & TSE MONITOR (Real-time via GAS - Pro Market Mode)
// =========================
let isShowingTrends = true;

// 取得した本物のデータを保持する変数
let realNikkeiData = {
    price: 0,
    change: 0,
    open: 0,
    high: 0,
    low: 0
};

// --- 市場判定：平日 9:00-11:30 / 12:30-15:30 ---
function isMarketOpen() {
    const now = new Date();
    const day = now.getDay();
    if (day === 0 || day === 6) return false; // 土日は休み

    const time = now.getHours() * 100 + now.getMinutes();
    if ((time >= 900 && time <= 1130) || (time >= 1230 && time <= 1530)) {
        return true;
    }
    return false;
}

// --- 1. GASから日経平均データ取得（本物のみ） ---
async function fetchNikkei() {
    // 【重要】ここにあなたのGASのURLを正確に入れてください
    const MY_GAS_URL = "https://script.google.com/macros/s/AKfycbyWq0pZXLP2ZE2ptRr-1iAxD0fT6WzTFS1E1oCAMKba7AAroldDcCZcK_HRnjed-ua2/exec?type=nikkei";
    
    try {
        const r = await fetch(MY_GAS_URL);
        const d = await r.json();
        
        if (d.chart && d.chart.result && d.chart.result.length > 0) {
            const res = d.chart.result[0];
            const meta = res.meta;
            const quote = res.indicators.quote[0];
            
            const newPrice = meta.regularMarketPrice;
            const newChange = meta.regularMarketPrice - meta.chartPreviousClose;
            const lastIdx = quote.open.length - 1;

            const pBox = document.getElementById('tse-priceBox');
            const cBox = document.getElementById('tse-changeBox');
            const pNum = document.getElementById('tse-pNum');
            const cNum = document.getElementById('tse-cNum');

            if (pNum && cNum) {
                // 価格に変動があった時だけパカッと光らせる
                if (realNikkeiData.price !== newPrice && realNikkeiData.price !== 0) {
                    pBox.style.animation = 'none';
                    cBox.style.animation = 'none';
                    void pBox.offsetWidth; // リフロー
                    pBox.style.animation = 'tse-anim-white 0.5s ease-out';
                    cBox.style.animation = 'tse-anim-red 0.5s ease-out';
                }

                realNikkeiData.price = newPrice;
                realNikkeiData.change = newChange;
                realNikkeiData.open = quote.open[lastIdx];
                realNikkeiData.high = quote.high[lastIdx];
                realNikkeiData.low = quote.low[lastIdx];

                pNum.innerText = realNikkeiData.price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                let sign = realNikkeiData.change >= 0 ? "+" : "";
                cNum.innerText = sign + realNikkeiData.change.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
            }

            // サブデータ反映
            document.getElementById('tse-open').innerText = realNikkeiData.open.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
            document.getElementById('tse-high').innerText = realNikkeiData.high.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
            document.getElementById('tse-low').innerText = realNikkeiData.low.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        }
    } catch(e) { 
        console.error("Nikkei fetch error:", e); 
    }
}

// --- 2. トレンド取得 ---
async function fetchTrends() {
    const container = document.getElementById('trend-fixed-content');
    if (!container) return;
    const MY_GAS_URL = "https://script.google.com/macros/s/AKfycbx6dVnRjptPeQouJM6Czl-GUBqQzxFq8Nj06POOVbqTEGb_w4Wx0rHm-M9_GgApEWnv/exec?type=trends";
    let trendData = [];
    try {
        const r = await fetch(MY_GAS_URL);
        const xmlText = await r.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, "application/xml");
        const items = xml.querySelectorAll('item');
        if (items.length > 0) {
            trendData = Array.from(items).map(item => item.querySelector('title')?.textContent || "");
        }
    } catch (e) { console.error('Trends fetch failed:', e); }

    const tiles = container.querySelectorAll('.trend-tile');
    if (tiles.length > 0) {
        tiles.forEach(t => { t.classList.remove('enter-active'); t.classList.add('exit-active'); });
        setTimeout(() => renderTrends(container, trendData), 800);
    } else {
        renderTrends(container, trendData);
    }
}

function renderTrends(container, data) {
    if (!container) return;
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(8, 1fr)";
    container.style.gridTemplateRows = "repeat(4, 1fr)";
    container.style.gap = "0px"; 

    const backupWords = ["CORE_NODE", "MARKET_IDX", "GLB_FEED", "SIG_PROC", "DATA_STREAM", "CLOUD_ARC", "API_LINK", "NET_STAT"];
    let finalData = [];
    for (let i = 0; i < 8; i++) { finalData.push(data[i] || backupWords[i]); }
    const temp = finalData[2]; finalData[2] = finalData[3]; finalData[3] = temp;

    let html = "";
    const colormap = ["rgba(213,62,79,0.95)", "rgba(244,109,67,0.9)", "rgba(253,174,97,0.85)", "rgba(171,221,164,0.8)", "rgba(102,194,165,0.75)", "rgba(50,136,189,0.7)", "rgba(35,80,160,0.65)", "rgba(20,30,100,0.6)"];
    const layouts = ["grid-area: 1/1/4/6;", "grid-area: 1/6/3/9;", "grid-area: 3/6/5/8;", "grid-area: 3/8/5/9;", "grid-area: 4/1/5/3;", "grid-area: 4/3/5/5;", "grid-area: 4/5/5/6;"];

    for (let i = 1; i <= 7; i++) {
        let style = layouts[i-1]; let content = finalData[i-1]; let bgColor = colormap[i-1];
        let fontSize = i === 1 ? "44px" : (i <= 3 ? "20px" : "13px");
        let textColor = (i >= 3 && i <= 5) ? "rgba(0,0,0,0.75)" : "#ffffff";
        html += `<div class="trend-tile" style="${style} background-color: ${bgColor} !important; position: relative; display: flex; align-items: center; justify-content: center; font-size: ${fontSize}; font-weight: 300; color: ${textColor}; padding: 10px; text-align: center; text-transform: uppercase; opacity: 0;" onclick="window.open('https://www.google.com/search?q=${encodeURIComponent(content)}', '_blank')"> <div style="width:100%; word-wrap: break-word;">${content}</div></div>`;
    }
    container.innerHTML = html;
    container.querySelectorAll('.trend-tile').forEach((tile, i) => { setTimeout(() => { tile.classList.add('enter-active'); }, i * 60); });
}

// --- 3. UI構築とループ設定 ---
function initTopRightPanel() {
    const trendEl = document.getElementById('trend-fixed-content');
    if (!trendEl) return;
    
    const parent = trendEl.parentElement;
    const tseWrapper = document.createElement('div');
    tseWrapper.id = "tse-wrapper";
    tseWrapper.innerHTML = `
        <div class="tse-monitor-container">
            <div class="tse-header"><span style="font-size: 52px; font-weight: bold; margin-right: 20px;">日経平均株価</span><span style="font-size: 32px;">Nikkei 225</span></div>
            <div class="tse-main-content">
                <div class="tse-labels">
                    <div class="tse-label-group"><span class="tse-jp-text">現在値</span><span class="tse-en-text">Current</span></div>
                    <div class="tse-label-group"><span class="tse-jp-text">前日比</span><span class="tse-en-text">Change</span></div>
                </div>
                <div class="tse-data-area">
                    <div class="tse-price-box" id="tse-priceBox"><span class="tse-price-num" id="tse-pNum">--</span></div>
                    <div class="tse-change-box" id="tse-changeBox"><span class="tse-change-num" id="tse-cNum">--</span></div>
                    <div class="tse-sub-stats-table">
                        <div class="tse-stat-row"><span>始値 Open</span><span class="tse-stat-val" id="tse-open">--</span></div>
                        <div class="tse-stat-row"><span>高値 High</span><span class="tse-stat-val" id="tse-high">--</span></div>
                        <div class="tse-stat-row"><span>安値 Low</span><span class="tse-stat-val" id="tse-low">--</span></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    parent.appendChild(tseWrapper);

    fetchNikkei();
    fetchTrends();

    // 5秒おきに市場が開いているかチェックして取得
    setInterval(() => {
        if (isMarketOpen()) {
            fetchNikkei();
            console.log("Market is open: Fetching Nikkei...");
        }
    }, 5000); 

    if (window.topRightTimer) clearInterval(window.topRightTimer);
    window.topRightTimer = setInterval(toggleTopRightPanel, 15000);
}

function toggleTopRightPanel() {
    const trendEl = document.getElementById('trend-fixed-content');
    const tseEl = document.getElementById('tse-wrapper');
    if (!trendEl || !tseEl) return;

    if (isShowingTrends) {
        trendEl.style.opacity = "0";
        trendEl.style.pointerEvents = "none";
        tseEl.classList.add('active');
        isShowingTrends = false;
    } else {
        tseEl.classList.remove('active');
        trendEl.style.opacity = "1";
        trendEl.style.pointerEvents = "auto";
        isShowingTrends = true;
        fetchTrends();
    }
}

initTopRightPanel();


// =========================
// 地震情報パネル - P2P地震情報 + Wolfx EEW
// =========================
(function () {
  const P2P_API   = 'https://api.p2pquake.net/v2/history?codes=551&limit=5';
  const dot       = document.getElementById('seismo-dot');
  const label     = document.getElementById('seismo-label');
  const eewBanner = document.getElementById('eew-banner');
  const eewBody   = document.getElementById('eew-banner-body');
  const itemsEl   = document.getElementById('seismo-items');
  const markersEl = document.getElementById('eq-markers');

  if (!dot) return;

  // --- 震度文字列 → CSSクラス ---
  function intensityClass(v) {
    const map = {'1':'int-1','2':'int-2','3':'int-3','4':'int-4',
                 '5-':'int-5l','5弱':'int-5l','5+':'int-5u','5強':'int-5u',
                 '6-':'int-6l','6弱':'int-6l','6+':'int-6u','6強':'int-6u','7':'int-7'};
    return map[String(v)] || 'int-0';
  }

  // --- 震度ラベル整形 ---
  function intensityLabel(v) {
    const map = {'5-':'5弱','5+':'5強','6-':'6弱','6+':'6強'};
    return map[String(v)] || String(v);
  }

  // --- 緯度経度 → SVGのx,y座標（viewBox 450x520、日本周辺を大まかにマッピング）---
  function latLonToXY(lat, lon) {
    // 日本: 緯度 24〜46、経度 122〜148 をSVGにマッピング
    const x = ((lon - 122) / (148 - 122)) * 430 + 10;
    const y = ((46 - lat)  / (46 - 24))   * 490 + 15;
    return { x: Math.round(x), y: Math.round(y) };
  }

  // --- 震度 → マーカー色 ---
  function intensityColor(v) {
    const s = String(v);
    if (s==='7')  return '#ff00ff';
    if (s==='6+' || s==='6強') return '#ff0000';
    if (s==='6-' || s==='6弱') return '#ff4444';
    if (s==='5+' || s==='5強') return '#ff7f2a';
    if (s==='5-' || s==='5弱') return '#ffb347';
    if (s==='4')  return '#ffe94d';
    if (s==='3')  return '#a0e060';
    if (s==='2')  return '#7ecef4';
    if (s==='1')  return '#7ecef4';
    return '#888';
  }

  // --- 震源マーカーをSVGに追加 ---
  let markerCount = 0;
  function addMarker(lat, lon, intensity, isNew) {
    if (!markersEl || !lat || !lon) return;
    const {x, y} = latLonToXY(lat, lon);
    const color = intensityColor(intensity);
    const r = isNew ? 5 : 3.5;
    const id = 'mk' + (markerCount++);

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.innerHTML = `
      <circle class="eq-marker-dot" cx="${x}" cy="${y}" r="${r}"
              fill="${color}" fill-opacity="0.9"
              stroke="rgba(255,255,255,0.6)" stroke-width="0.8"/>
      ${isNew ? `<circle class="eq-marker-ring" cx="${x}" cy="${y}" r="5" stroke="${color}"/>` : ''}
    `;
    markersEl.appendChild(g);

    // 古いマーカーが増えすぎないよう5個まで
    while (markersEl.children.length > 5) {
      markersEl.removeChild(markersEl.firstChild);
    }
  }

  // --- 日時フォーマット ---
  function formatTime(iso) {
    const d = new Date(iso);
    return (d.getMonth()+1) + '/' + d.getDate() + ' ' +
           String(d.getHours()).padStart(2,'0') + ':' +
           String(d.getMinutes()).padStart(2,'0');
  }

  // --- P2P地震情報を取得して表示 ---
  let lastEventId = '';
  async function fetchEarthquakes() {
    try {
      const res = await fetch(P2P_API);
      const list = await res.json();
      if (!list || !list.length) return;

      // 最新イベントが新しければ点滅
      const newest = list[0];
      const isNew = newest.id !== lastEventId;
      lastEventId = newest.id;

      // マーカーをリセット
      if (markersEl) markersEl.innerHTML = '';

      // リストを構築（最大4件）
      if (itemsEl) {
        itemsEl.innerHTML = '';
        list.slice(0, 4).forEach((eq, i) => {
          const h = eq.earthquake?.hypocenter || {};
          const intensity = eq.earthquake?.maxScale;
          // maxScale: 10=1, 20=2, 30=3, 40=4, 45=5弱, 50=5強, 55=6弱, 60=6強, 70=7
          const intensityStr = scaleToStr(intensity);
          const mag = h.magnitude || '-';
          const depth = h.depth != null ? h.depth + 'km' : '-';
          const region = h.name || '不明';
          const time = eq.earthquake?.time ? formatTime(eq.earthquake.time) : '-';

          const cls = intensityClass(intensityStr);
          const isNewItem = i === 0 && isNew;

          const div = document.createElement('div');
          div.className = 'eq-item' + (isNewItem ? ' eq-item-new' : '');
          div.innerHTML = `
            <div class="eq-item-top">
              <span class="eq-item-region">${region}</span>
              <span class="eq-item-intensity ${cls}">${intensityStr !== '-' ? '震度'+intensityLabel(intensityStr) : 'M'+mag}</span>
            </div>
            <div class="eq-item-detail">
              <span>${time}</span>
              <span>M${mag}</span>
              <span>${depth}</span>
            </div>`;
          itemsEl.appendChild(div);

          // マーカー追加
          if (h.latitude && h.longitude) {
            addMarker(h.latitude, h.longitude, intensityStr, i === 0 && isNew);
          }
        });
      }

      // ステータス更新
      dot.classList.remove('alert');
      label.textContent = 'P2P LIVE';
    } catch(e) {
      label.textContent = 'ERROR';
      console.warn('P2P fetch failed:', e);
    }
  }

  // --- maxScale数値 → 震度文字列 ---
  function scaleToStr(scale) {
    const map = {10:'1',20:'2',30:'3',40:'4',45:'5-',50:'5+',55:'6-',60:'6+',70:'7'};
    return map[scale] || '-';
  }

  // --- Wolfx EEW WebSocket ---
  let eewTimer = null;
  function connectEewWs() {
    try {
      const ws = new WebSocket('wss://ws-api.wolfx.jp/jma_eew');

      ws.onmessage = (event) => {
        try {
          const d = JSON.parse(event.data);
          if (d.type === 'heartbeat' || d.isTraining) return;

          if (d.isCancel) {
            hideEew(); return;
          }
          if (!d.EventID) return;

          // EEWバナー表示
          dot.classList.add('alert');
          label.textContent = '⚠ EEW';
          if (eewBanner) {
            eewBanner.classList.add('active');
            eewBody.innerHTML =
              `第${d.Serial||'-'}報${d.isFinal?'【最終報】':''}${d.isWarn?' ⚠警報':''}\n` +
              `震源: ${d.Hypocenter||'-'}\n` +
              `M${d.Magunitude??'-'}  深さ${d.Depth!=null?d.Depth+'km':'-'}\n` +
              `最大震度: ${d.MaxIntensity||'-'}`;
          }

          // 最終報から30秒後に自動消去
          if (d.isFinal) {
            clearTimeout(eewTimer);
            eewTimer = setTimeout(hideEew, 30000);
          }
        } catch(e) {}
      };

      ws.onclose = () => setTimeout(connectEewWs, 5000);
      ws.onerror = () => {};
    } catch(e) {}
  }

  function hideEew() {
    if (eewBanner) eewBanner.classList.remove('active');
    dot.classList.remove('alert');
    label.textContent = 'P2P LIVE';
  }

  // --- 起動 ---
  fetchEarthquakes();
  setInterval(fetchEarthquakes, 30000); // 30秒ごとに更新
  connectEewWs();
})();
