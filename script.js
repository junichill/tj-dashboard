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
    if (!d || !d.list) {
      showWeatherError('データ取得失敗: ' + (d && d.message ? d.message : 'list未取得'));
      return;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString();

    const wrapper = document.getElementById('forecast-wrapper');
    if (wrapper) {
      const todayHtml = createForecastGroupHtml(d.list.slice(0, 6), "Today's Forecast");
      
      const tomorrowListSlice = d.list.filter(item => new Date(item.dt * 1000).toLocaleDateString() === tomorrowStr).slice(0, 6);
      const tomorrowHtml = createForecastGroupHtml(tomorrowListSlice, "Tomorrow's Plan");

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
      const economicScheduleHtml = `<div class="day-group"><div class="day-label">— Economic Calendar —</div><div id="tv-economic-calendar" style="width:100%; height:200px;"></div></div>`;

      wrapper.innerHTML = todayHtml + tomorrowHtml + weekHtml + economicScheduleHtml;

      const ecoContainer = document.getElementById('tv-economic-calendar');
      if (ecoContainer && ecoContainer.childElementCount === 0) {
          const script = document.createElement('script');
          script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
          script.async = true;
          script.innerHTML = JSON.stringify({ "colorTheme": "dark", "isTransparent": true, "width": "100%", "height": "100%", "locale": "ja", "importanceFilter": "-1,0,1", "currencyFilter": "JPY,USD,EUR" });
          ecoContainer.appendChild(script);
      }
      weatherSlideIndex = 0;
      wrapper.style.transform = `translateY(0px)`;
    }

    const weatherFixed = document.getElementById('weather-fixed-content');
    if (weatherFixed) {
        const today = d.list[0];
        const dayTemps = d.list.slice(0, 8).map(v => v.main.temp);
        const tomorrowListFull = d.list.filter(item => new Date(item.dt * 1000).toLocaleDateString() === tomorrowStr);

        // 天気説明文
        const weatherLabel = (type) => ({
            'sunny': '晴れ', 'partly_cloudy': '曇時々晴', 'cloudy': '曇り',
            'rainy': '雨', 'snowy': '雪'
        }[type] || '');

        // 降水確率
        const todayPop  = Math.round((today.pop || 0) * 100);
        const tomorrowPop = tomorrowListFull.length
            ? Math.round(Math.max(...tomorrowListFull.map(v => v.pop || 0)) * 100) : 0;

        const todayType    = getWeatherType(today.weather[0].id);
        const tomorrowType = tomorrowListFull.length
            ? getWeatherType(tomorrowListFull[0].weather[0].id) : 'sunny';

        const todayHi  = Math.round(Math.max(...dayTemps));
        const todayLo  = Math.round(Math.min(...dayTemps));
        const tomHi    = tomorrowListFull.length
            ? Math.round(Math.max(...tomorrowListFull.map(v => v.main.temp))) : '--';
        const tomLo    = tomorrowListFull.length
            ? Math.round(Math.min(...tomorrowListFull.map(v => v.main.temp))) : '--';

        // 今日の日付・曜日
        const now = new Date();
        const days = ['日','月','火','水','木','金','土'];
        const tomObj = new Date(); tomObj.setDate(now.getDate() + 1);
        const todayLabel    = `${now.getMonth()+1}/${now.getDate()}(${days[now.getDay()]})`;
        const tomorrowLabel = `${tomObj.getMonth()+1}/${tomObj.getDate()}(${days[tomObj.getDay()]})`;

        // 時間別予報（今日の3時間毎）
        const hourlyHtml = d.list.slice(0, 5).map(item => {
            const h = new Date(item.dt * 1000).getHours();
            const t = Math.round(item.main.temp);
            const type = getWeatherType(item.weather[0].id);
            return `<div class="yw-hourly-item">
                <div class="yw-hourly-time">${String(h).padStart(2,'0')}時</div>
                <div class="yw-hourly-icon weather-${type}">${WEATHER_ICONS[type]}</div>
                <div class="yw-hourly-temp">${t}°</div>
            </div>`;
        }).join('');

        weatherFixed.innerHTML = `
        <div id="yw-panel">
          <!-- 左: 今日 -->
          <div class="yw-day-card yw-today">
            <div class="yw-day-label">今日 <span class="yw-date">${todayLabel}</span></div>
            <div class="yw-main-row">
              <div class="yw-icon-wrap weather-${todayType}">${WEATHER_ICONS[todayType]}</div>
              <div class="yw-temps">
                <span class="yw-hi">${todayHi}°</span>
                <span class="yw-sep">/</span>
                <span class="yw-lo">${todayLo}°</span>
              </div>
            </div>
            <div class="yw-desc-row">
              <span class="yw-label">${weatherLabel(todayType)}</span>
              <span class="yw-pop">☂ ${todayPop}%</span>
            </div>
            <div class="yw-divider"></div>
            <div class="yw-hourly">${hourlyHtml}</div>
          </div>

          <!-- 右: 明日 -->
          <div class="yw-day-card yw-tomorrow">
            <div class="yw-day-label">明日 <span class="yw-date">${tomorrowLabel}</span></div>
            <div class="yw-main-row">
              <div class="yw-icon-wrap weather-${tomorrowType}">${WEATHER_ICONS[tomorrowType]}</div>
              <div class="yw-temps">
                <span class="yw-hi">${tomHi}°</span>
                <span class="yw-sep">/</span>
                <span class="yw-lo">${tomLo}°</span>
              </div>
            </div>
            <div class="yw-desc-row">
              <span class="yw-label">${weatherLabel(tomorrowType)}</span>
              <span class="yw-pop">☂ ${tomorrowPop}%</span>
            </div>
            <div class="yw-diff-row">
              <span class="yw-diff-label">最高</span>
              <span class="yw-diff ${tomHi > todayHi ? 'diff-up' : tomHi < todayHi ? 'diff-dn' : 'diff-eq'}">
                ${tomHi > todayHi ? '▲' : tomHi < todayHi ? '▼' : '─'}${Math.abs(tomHi - todayHi)}°
              </span>
              <span class="yw-diff-label">最低</span>
              <span class="yw-diff ${tomLo > todayLo ? 'diff-up' : tomLo < todayLo ? 'diff-dn' : 'diff-eq'}">
                ${tomLo > todayLo ? '▲' : tomLo < todayLo ? '▼' : '─'}${Math.abs(tomLo - todayLo)}°
              </span>
            </div>
          </div>
        </div>`;

        if (today && today.weather[0]) updateWeatherBackground(today.weather[0].id);
    }
    startWeatherCycle();
  } catch (err) {
    showWeatherError('通信エラー: ' + err.message);
    console.error('Weather/Market Fetch Error:', err);
  }
}

function showWeatherError(msg) {
  const weatherFixed = document.getElementById('weather-fixed-content');
  if (!weatherFixed) return;
  weatherFixed.innerHTML = `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.5);font-size:12px;font-family:monospace;padding:10px;text-align:center;">${msg}</div>`;
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
            <div class="tse-header">
                <span>日経平均株価</span>
                <span>Nikkei 225</span>
            </div>
            <div class="tse-main-content">
                <div class="tse-labels">
                    <div class="tse-label-group">
                        <span class="tse-jp-text">現在値</span>
                        <span class="tse-en-text">Current</span>
                    </div>
                    <div class="tse-label-group">
                        <span class="tse-jp-text">前日比</span>
                        <span class="tse-en-text">Change</span>
                    </div>
                    <div class="tse-label-group">
                        <span class="tse-jp-text">始値</span>
                        <span class="tse-en-text">Open</span>
                    </div>
                    <div class="tse-label-group">
                        <span class="tse-jp-text">高値</span>
                        <span class="tse-en-text">High</span>
                    </div>
                    <div class="tse-label-group">
                        <span class="tse-jp-text">安値</span>
                        <span class="tse-en-text">Low</span>
                    </div>
                </div>
                <div class="tse-data-area">
                    <div class="tse-price-box" id="tse-priceBox">
                        <span class="tse-price-num" id="tse-pNum">--</span>
                    </div>
                    <div class="tse-change-box" id="tse-changeBox">
                        <span class="tse-change-num" id="tse-cNum">--</span>
                    </div>
                    <div class="tse-sub-stats-table">
                        <div class="tse-stat-row"><span class="tse-stat-val" id="tse-open">--</span></div>
                        <div class="tse-stat-row"><span class="tse-stat-val" id="tse-high">--</span></div>
                        <div class="tse-stat-row"><span class="tse-stat-val" id="tse-low">--</span></div>
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
// 強震モニタ + 地震情報 - kwatch風
// =========================
(function () {
  const GAS_URL  = 'https://script.google.com/macros/s/AKfycbyKu4fnj5PPWPc3ezlmUhokRAwCyhUhSXeY0RKqB4WC0yXfI7nZ_mbIL52EJpOlVSRx/exec';
  const P2P_URL  = 'https://api.p2pquake.net/v2/history?codes=551&limit=8';

  // DOM
  const layerImg   = document.getElementById('seismo-layer');
  const dot        = document.getElementById('seismo-dot');
  const labelEl    = document.getElementById('seismo-label');
  const timeEl     = document.getElementById('seismo-time');
  const eewOverlay = document.getElementById('seismo-eew-overlay');
  const eewInfo    = document.getElementById('seismo-eew-info');
  const listEl     = document.getElementById('eq-list-items');
  const updatedEl  = document.getElementById('eq-list-updated');

  if (!layerImg) return;

  // ラジオボタン
  let curLyr  = 'jma';
  let curSfbh = 's';
  document.querySelectorAll('input[name="s-lyr"]').forEach(r => {
    r.addEventListener('change', () => { curLyr = r.value; });
  });
  document.querySelectorAll('input[name="s-sfbh"]').forEach(r => {
    r.addEventListener('change', () => { curSfbh = r.value; });
  });

  // 音ボタン
  let soundOn = true;
  const soundBtn = document.getElementById('seismo-sound-btn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundOn = !soundOn;
      soundBtn.textContent = soundOn ? '🔊' : '🔇';
      soundBtn.classList.toggle('sound-on',  soundOn);
      soundBtn.classList.toggle('sound-off', !soundOn);
      // ON にしたとき確認音（ピッピ）を鳴らす
      if (soundOn) playConfirm();
    });
  }

  // ---- Web Audio アラート音 ----
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }
  function playAlert(level) {
    if (!soundOn) return;
    // level: 'eew'=警報音, 'eq'=地震検知音
    try {
      const ctx  = getAudioCtx();
      const freqs = level === 'eew' ? [880, 660, 880, 660] : [520, 440];
      let t = ctx.currentTime;
      freqs.forEach(freq => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.start(t); osc.stop(t + 0.3);
        t += 0.35;
      });
    } catch(e) {}
  }

  // 確認音（ピッピ）: 音ONにしたとき
  function playConfirm() {
    try {
      const ctx = getAudioCtx();
      [1200, 1600].forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        const t = ctx.currentTime + i * 0.18;
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.start(t); osc.stop(t + 0.15);
      });
    } catch(e) {}
  }

  // ---- JSTタイムスタンプ生成 ----
  const p = n => String(n).padStart(2,'0');
  function toJstTS(d) {
    const jst = new Date(d.getTime() + 9*60*60*1000);
    return jst.getUTCFullYear()+p(jst.getUTCMonth()+1)+p(jst.getUTCDate())+
           p(jst.getUTCHours())+p(jst.getUTCMinutes())+p(jst.getUTCSeconds());
  }

  let baseTS = '', syncedAt = 0, synced = false, fetching = false;

  // ---- サーバー時刻同期 ----
  async function syncTime() {
    try {
      const res  = await fetch(GAS_URL + '?type=kmoni_latest&_=' + Date.now());
      const json = await res.json();
      baseTS   = json.latest_time.replace(/[^0-9]/g,'');
      syncedAt = Date.now();
      synced   = true;
      dot.classList.remove('alert');
      dot.style.background = '#00ff88';
      dot.style.boxShadow  = '0 0 6px #00ff88';
      labelEl.textContent  = 'K-NET LIVE';
    } catch(e) { synced = true; }
  }

  function currentTS(offsetSec) {
    if (!baseTS) return null;
    const y=baseTS.slice(0,4),mo=baseTS.slice(4,6),d=baseTS.slice(6,8);
    const h=baseTS.slice(8,10),mi=baseTS.slice(10,12),s=baseTS.slice(12,14);
    const base = new Date(y+'-'+mo+'-'+d+'T'+h+':'+mi+':'+s+'+09:00');
    const elapsed = Math.floor((Date.now()-syncedAt)/1000);
    base.setSeconds(base.getSeconds()+elapsed-offsetSec);
    return toJstTS(base);
  }

  // ---- 強震モニタ画像更新 ----
  async function updateMap() {
    if (!synced || fetching) return;
    const ts = currentTS(2);
    if (!ts) return;
    fetching = true;
    try {
      const lyrKey = curLyr + '_' + curSfbh;
      const url = GAS_URL + '?type=kmoni_img&ts=' + ts + '&lyr=' + encodeURIComponent(lyrKey) + '&_=' + Date.now();
      const res  = await fetch(url);
      const json = await res.json();
      if (json.ok && json.data) {
        layerImg.src = json.data;
        if (timeEl) timeEl.textContent = ts.slice(8,10)+':'+ts.slice(10,12)+':'+ts.slice(12,14);
      }
    } catch(e) {}
    finally { fetching = false; }
  }

  // ---- P2P地震情報 ----
  const scaleMap = {10:'1',20:'2',30:'3',40:'4',45:'5弱',50:'5強',55:'6弱',60:'6強',70:'7'};
  const iClass   = {'1':'eq-i1','2':'eq-i2','3':'eq-i3','4':'eq-i4',
                    '5弱':'eq-i5l','5強':'eq-i5u','6弱':'eq-i6l','6強':'eq-i6u','7':'eq-i7'};
  let lastEqId = '';

  function formatT(iso) {
    const d = new Date(iso);
    return (d.getMonth()+1)+'/'+d.getDate()+' '+
           p(d.getHours())+':'+p(d.getMinutes());
  }

  async function fetchEq() {
    try {
      const res  = await fetch(P2P_URL);
      const list = await res.json();
      if (!list || !list.length) return;

      const isNew = list[0].id !== lastEqId;
      if (isNew) {
        lastEqId = list[0].id;
        const sc = list[0].earthquake?.maxScale;
        const intStr = scaleMap[sc] || '-';
        // 震度3以上で音を鳴らす
        if (sc >= 30) playAlert('eq');
        if (updatedEl) updatedEl.textContent = '更新: ' + formatT(new Date().toISOString());
      }

      if (!listEl) return;
      listEl.innerHTML = '';
      list.forEach((eq, i) => {
        const h   = eq.earthquake?.hypocenter || {};
        const sc  = eq.earthquake?.maxScale;
        const int = scaleMap[sc] || '-';
        const cls = iClass[int] || 'eq-i0';
        const mag = h.magnitude ?? '-';
        const dep = h.depth != null ? h.depth+'km' : '-';
        const reg = h.name || '不明';
        const tim = eq.earthquake?.time ? formatT(eq.earthquake.time) : '-';

        const isNewItem  = i===0 && isNew;
        const isStrong   = sc >= 45;
        const itemClass  = isNewItem ? 'eq-item eq-new' : isStrong ? 'eq-item eq-strong' : 'eq-item';

        const div = document.createElement('div');
        div.className = itemClass;
        div.innerHTML = `
          <div class="eq-item-row1">
            <span class="eq-region">${reg}</span>
            <span class="eq-intensity ${cls}">${int!=='-'?'震度'+int:'M'+mag}</span>
          </div>
          <div class="eq-item-row2">
            <span>${tim}</span><span>M${mag}</span><span>${dep}</span>
          </div>`;
        listEl.appendChild(div);
      });
    } catch(e) {}
  }

  // ---- Wolfx EEW WebSocket ----
  let eewClearTimer = null;
  function connectEew() {
    try {
      const ws = new WebSocket('wss://ws-api.wolfx.jp/jma_eew');
      ws.onmessage = ev => {
        try {
          const d = JSON.parse(ev.data);
          if (d.type==='heartbeat' || d.isTraining) return;
          if (d.isCancel) { hideEew(); return; }
          if (!d.EventID) return;

          playAlert('eew');
          dot.classList.add('alert');
          labelEl.textContent = '⚠ 緊急地震速報';

          if (eewOverlay) eewOverlay.classList.remove('hidden');
          if (eewInfo) eewInfo.textContent =
            `第${d.Serial||'-'}報${d.isFinal?'【最終報】':''}${d.isWarn?' ⚠警報':''}\n` +
            `${d.Hypocenter||'-'}  M${d.Magunitude??'-'}\n` +
            `深さ${d.Depth!=null?d.Depth+'km':'-'}  最大震度${d.MaxIntensity||'-'}`;

          if (d.isFinal) {
            clearTimeout(eewClearTimer);
            eewClearTimer = setTimeout(hideEew, 30000);
          }
        } catch(e) {}
      };
      ws.onclose = () => setTimeout(connectEew, 5000);
      ws.onerror = () => {};
    } catch(e) {}
  }

  function hideEew() {
    if (eewOverlay) eewOverlay.classList.add('hidden');
    dot.classList.remove('alert');
    labelEl.textContent = 'K-NET LIVE';
  }

  // ---- 起動 ----
  syncTime().then(() => {
    updateMap();
    setInterval(updateMap, 1000);
    setInterval(syncTime, 5*60*1000);
  });
  fetchEq();
  setInterval(fetchEq, 30000);
  connectEew();
})();
