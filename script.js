// =========================
// Tick CLOCK
// =========================
function handleTickInit(tick) {
  const secondsEl = document.getElementById('seconds-static');

  Tick.helper.interval(() => {
    const d = new Date(); // 標準のDateオブジェクトを使用
    
    // 時・分をそれぞれ2桁の文字列にする（例: 9時5分 -> "09", "05"）
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    const s = d.getSeconds().toString().padStart(2, '0');

    // HTMLの data-key="hours1" などに対応させて値をセット
    tick.value = {
      hours1: h[0],   // 時の10の位
      hours2: h[1],   // 時の1の位
      minutes1: m[0], // 分の10の位
      minutes2: m[1]  // 分の1の位
    };

    // 静的テキストで秒を更新
    if (secondsEl) {
      secondsEl.textContent = s;
    }
  }, 1000);
}


// =========================
// DATE
// =========================
const dateEl = document.getElementById('date');

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
        // 改行なしの1行。和暦部分にspanを挿入して個別に色を変えられるようにします
        dateEl.innerHTML = `${dayName}, ${monthName} ${date}, ${year} <span class="era-label">(R${reiwa})</span>`;
    }
}
updateDate();
setInterval(updateDate, 60000);

// =========================
// WEATHER (NHK風・自前SVG)
// =========================
const API_KEY = 'eed3942fcebd430b2e32dfff2c611b11';
const LAT = 35.6895;
const LON = 139.6917;

const WEATHER_ICONS = {
  sunny: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4">
    <circle cx="32" cy="32" r="12"/>
    <line x1="32" y1="2" x2="32" y2="14"/>
    <line x1="32" y1="50" x2="32" y2="62"/>
    <line x1="2" y1="32" x2="14" y2="32"/>
    <line x1="50" y1="32" x2="62" y2="32"/>
    <line x1="10" y1="10" x2="18" y2="18"/>
    <line x1="46" y1="46" x2="54" y2="54"/>
    <line x1="46" y1="18" x2="54" y2="10"/>
    <line x1="10" y1="54" x2="18" y2="46"/>
  </svg>`,
  cloudy: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4">
    <path d="M20 44h26a10 10 0 0 0 0-20 14 14 0 0 0-27-4A10 10 0 0 0 20 44z"/>
  </svg>`,
  // WEATHER_ICONS の rainy 部分を差し替え
rainy: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    /* 傘の屋根部分（半円） */
    <path d="M12 36c0-11 9-20 20-20s20 9 20 20H12z" />
    /* 傘の先端（突起） */
    <line x1="32" y1="16" x2="32" y2="12" />
    /* 傘の持ち手（J字型） */
    <path d="M32 36v12c0 4-3 7-7 7s-7-3-7-7" />
  </svg>`,
// WEATHER_ICONS の snowy 部分を差し替え
snowy: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    /* 体（下の大きな丸） */
    <circle cx="32" cy="46" r="14" />
    /* 頭（上の小さな丸） */
    <circle cx="32" cy="22" r="10" />
    /* 目 */
    <circle cx="28" cy="20" r="0.5" fill="currentColor" stroke="none" />
    <circle cx="36" cy="20" r="0.5" fill="currentColor" stroke="none" />
    /* 手（枝） */
    <line x1="20" y1="40" x2="12" y2="32" />
    <line x1="44" y1="40" x2="52" y2="32" />
  </svg>`,
};

function getWeatherType(id) {
  if (id >= 200 && id < 600) return 'rainy';
  if (id >= 600 && id < 700) return 'snowy';
  if (id >= 801) return 'cloudy';
  return 'sunny';
}

// =========================
// WEATHER (3時間ごとの予報)
// =========================
let weatherSlideIndex = 0;
let weatherTimer = null;

// 天気グループのHTMLを作る共通関数（これがないとエラーになります）
function createForecastGroupHtml(list, label) {
  const itemsHtml = list.map(item => {
    const date = new Date(item.dt * 1000);
    const hour = date.getHours().toString().padStart(2, '0') + ":00";
    const temp = Math.round(item.main.temp);
    const type = getWeatherType(item.weather[0].id);
    return `
      <div class="forecast-item">
        <div class="forecast-time">${hour}</div>
        <div class="weather-icon weather-${type}">${WEATHER_ICONS[type]}</div>
        <div class="forecast-temp">${temp}℃</div>
      </div>`;
  }).join('');

  return `<div class="day-group"><div class="day-label">— ${label} —</div><div class="day-items">${itemsHtml}</div></div>`;
}

// 週間天気のHTMLを作る関数
function createWeeklyForecastHtml(list) {
  const dailyData = {};
  list.forEach(item => {
    // 曜日を英語(short: Mon, Tue...)、日付を数字で取得
    const dateObj = new Date(item.dt * 1000);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = dateObj.getDate();
    const dateKey = `${dayName} ${dayNum}`; // "Wed 21" のような形式
    
    if (!dailyData[dateKey]) dailyData[dateKey] = { temps: [], ids: [] };
    dailyData[dateKey].temps.push(item.main.temp);
    dailyData[dateKey].ids.push(item.weather[0].id);
  });

  let itemsHtml = '';
  // 今日を除いた明日以降の5日間を表示
  Object.keys(dailyData).slice(1, 6).forEach(date => {
    const day = dailyData[date];
    const maxTemp = Math.round(Math.max(...day.temps));
    const minTemp = Math.round(Math.min(...day.temps));
    const midId = day.ids[Math.floor(day.ids.length / 2)];
    const type = getWeatherType(midId);
    
    itemsHtml += `
      <div class="forecast-item weekly-item">
        <div class="forecast-time">${date}</div>
        <div class="weather-icon weather-${type}">${WEATHER_ICONS[type]}</div>
        <div class="forecast-temp weekly-temp">
          <span class="max">${maxTemp}</span><span class="separator">/</span><span class="min">${minTemp}</span>
        </div>
      </div>`;
  });

  return `<div class="day-group"><div class="day-label">— Weekly Outlook —</div><div class="day-items">${itemsHtml}</div></div>`;
}

async function fetchWeather() {
  try {
    const r = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=ja`);
    const d = await r.json();
    if (!d || !d.list) return;

    const wrapper = document.getElementById('forecast-wrapper');
    
    // --- 1-3枚目: 天気データ ---
    const todayHtml = createForecastGroupHtml(d.list.slice(0, 8), "Today's Forecast");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString();
    const tomorrowList = d.list.filter(item => new Date(item.dt * 1000).toLocaleDateString() === tomorrowStr).slice(0, 8);
    const tomorrowHtml = createForecastGroupHtml(tomorrowList, "Tomorrow's Plan");
    const weeklyHtml = createWeeklyForecastHtml(d.list);

    // --- 4-9枚目: 経済データ (TradingView / 5分足) ---
    const mktHtml = (id, label) => `
      <div class="day-group">
        <div class="day-label">— ${label} —</div>
        <div id="${id}" class="tv-mini-wrapper"></div>
      </div>`;

    // 全てを代入（計9枚構成）
    wrapper.innerHTML = 
        todayHtml + tomorrowHtml + weeklyHtml + 
        mktHtml("tv-usd-jpy", "Realtime FX: USD/JPY") +
        mktHtml("tv-eur-jpy", "Realtime FX: EUR/JPY") +
        mktHtml("tv-eur-usd", "Realtime FX: EUR/USD") +
        mktHtml("tv-n225",    "Index: Nikkei 225") +
        mktHtml("tv-nasdaq",  "Index: NASDAQ 100") +
        mktHtml("tv-sp500",   "Index: S&P 500");

    initTradingViewWidgets();

    weatherSlideIndex = 0;
    wrapper.style.transform = `translateY(0px)`;
    startWeatherCycle();

  } catch (err) {
    console.error('Weather/Market Fetch Error:', err);
  }
}

function initTradingViewWidgets() {
    const conf = {
        "width": 750,
        "height": 160,
        "locale": "ja",
        "dateRange": "1D",    // 5分足を綺麗に見せるための1日表示
        "colorTheme": "dark",
        "isTransparent": true,
        "interval": "5",       // 5分足設定
        "largeChartUrl": ""
    };

    // 為替
    appendMiniWidget("tv-usd-jpy", { ...conf, "symbol": "FX:USDJPY" });
    appendMiniWidget("tv-eur-jpy", { ...conf, "symbol": "FX:EURJPY" });
    appendMiniWidget("tv-eur-usd", { ...conf, "symbol": "FX:EURUSD" });
    
    // 指数
    appendMiniWidget("tv-n225",    { ...conf, "symbol": "OSE:NK2251!" });
    appendMiniWidget("tv-nasdaq",  { ...conf, "symbol": "NASDAQ:NQ1!" });
    appendMiniWidget("tv-sp500",   { ...conf, "symbol": "CME_MINI:ES1!" });}

function appendMiniWidget(containerId, config) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 重複読み込み防止：すでにウィジェットがある場合は中身を空にする
    container.innerHTML = ''; 

    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify(config);
    container.appendChild(script);
}

// 経済情報用のHTMLを生成する共通関数（JSの末尾などに追加してください）
function createMarketGroupHtml(data, label) {
  if (!data) return '';
  const itemsHtml = data.map(item => `
    <div class="forecast-item market-item">
      <div class="market-name">${item.name}</div>
      <div class="market-value">${item.value}</div>
      <div class="market-change ${item.dir}">${item.change}</div>
    </div>`).join('');

  return `<div class="day-group"><div class="day-label">— ${label} —</div><div class="day-items">${itemsHtml}</div></div>`;
}

function startWeatherCycle() {
  if (weatherTimer) clearInterval(weatherTimer);
  const wrapper = document.getElementById('forecast-wrapper');
  
  weatherTimer = setInterval(() => {
    const groups = wrapper.querySelectorAll('.day-group');
    if (groups.length === 0) return;

    const nextIndex = (weatherSlideIndex + 1) % groups.length;

    if (nextIndex === 0) {
      // --- 週間から今日に戻る：極上のフェード演出 ---
      // 1. ゆっくりと奥へ消えていく
      wrapper.style.transition = 'opacity 1.5s ease-in, filter 1.5s ease-in, transform 1.5s ease-in';
      wrapper.style.opacity = '0';
      wrapper.style.filter = 'blur(15px)';
      wrapper.style.transform = `translateY(${weatherSlideIndex * -180}px) scale(0.92)`;

      setTimeout(() => {
        // 2. 見えない間に位置をリセット
        weatherSlideIndex = 0;
        wrapper.style.transition = 'none';
        wrapper.style.transform = `translateY(0px) scale(0.92)`;
        
        groups.forEach((g, i) => g.classList.toggle('inactive', i !== 0));

        // 描画を確定
        wrapper.offsetHeight; 

        // 3. 手前にゆっくりと浮かび上がる
        wrapper.style.transition = 'opacity 1.8s ease-out, filter 1.8s ease-out, transform 1.8s ease-out';
        wrapper.style.opacity = '1';
        wrapper.style.filter = 'blur(0)';
        wrapper.style.transform = `translateY(0px) scale(1)`;
      }, 1500);

    } else {
      // --- 通常のスライド（1.2秒かけて優雅に移動） ---
      weatherSlideIndex = nextIndex;
      wrapper.style.transition = 'transform 1.2s cubic-bezier(0.65, 0, 0.35, 1), opacity 1.2s ease';
      wrapper.style.transform = `translateY(${weatherSlideIndex * -180}px) scale(1)`;

      groups.forEach((group, index) => {
        group.classList.toggle('inactive', index !== weatherSlideIndex);
      });
    }
  }, 9000); // 演出が長くなったので、切り替え間隔を少しだけ(8s->9s)伸ばすと余裕が出ます
}

fetchWeather();
setInterval(fetchWeather, 600000);

// =========================
// NEWS (NHK RSS直接取得 + JST表示 + インジケーター)
// =========================
const RSS_URL = 'https://news.web.nhk/n-data/conf/na/rss/cat0.xml';
const newsCard = document.getElementById('news-card');

let newsItems = [], newsEls = [], index = 0, timer = null;
let lastGoodNews = null;
const FADE = 1.8, AUTO_INTERVAL = 11000, FETCH_INTERVAL = 10*60*1000;

// --- 更新時刻表示 ---
const updateEl = document.createElement('div');
updateEl.style.position = 'absolute';
updateEl.style.top = '10px';
updateEl.style.right = '15px';
updateEl.style.fontSize = '12px';
updateEl.style.opacity = '0.6';
newsCard.appendChild(updateEl);

// --- ニュースインジケーター ---
const indicator = document.createElement('div');
indicator.style.position = 'absolute';
indicator.style.bottom = '10px';
indicator.style.left = '50%';
indicator.style.transform = 'translateX(-50%)';
indicator.style.display = 'flex';
indicator.style.gap = '8px';
newsCard.appendChild(indicator);

// --- 重要ニュース判定 ---
function isImportant(title) {
  return /(地震|津波|警報|注意報|台風|噴火|避難)/.test(title);
}

// --- インジケータ更新 ---
function updateIndicator() {
  indicator.innerHTML = '';
  newsItems.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.style.width = dot.style.height = '10px';
    dot.style.borderRadius = '50%';
    dot.style.background = i === index ? '#fff' : '#555';
    dot.style.cursor = 'pointer';
    dot.onclick = () => {
      if (i === index) return;
      stopAuto();
      showNews(i);
      startAuto();
    };
    indicator.appendChild(dot);
  });
}

// --- ニュース作成 ---
function createNews() {
  newsCard.querySelectorAll('.news-item').forEach(e => e.remove());

  newsEls = newsItems.map(n => {
    const div = document.createElement('div');
    div.className = 'news-item';
    if (isImportant(n.title)) div.classList.add('important');

    const pubDateStr = n.pubDate;

    // --- NHKONEニュースマーク追加 ---
    div.innerHTML = `
      <div class="news-mark">NHKONEニュース</div>
      <a class="news-title" href="${n.link}" target="_blank">${n.title}</a>
      <div class="news-pubdate">${pubDateStr}</div>
      <div class="news-description">${n.description}</div>
    `;

    newsCard.appendChild(div);
    return div;
  });

  updateIndicator();
}

// --- ニュース表示 ---
function showNews(next, init = false) {
  if (!newsEls[next]) return;

  if (init) {
    newsEls[next].classList.add('show');
    index = next;
    updateIndicator();
    return;
  }

  newsEls[index].classList.remove('show');
  setTimeout(() => {
    newsEls[next].classList.add('show');
    index = next;
    updateIndicator();
  }, FADE*1000);
}

// --- 自動切替 ---
function startAuto() {
  stopAuto();
  timer = setInterval(() => showNews((index+1)%newsEls.length), AUTO_INTERVAL);
}

function stopAuto() {
  if (timer) clearInterval(timer);
}

// --- ニュース取得 ---
async function fetchNews() {
  try {
    const r = await fetch(
      'https://api.allorigins.win/get?url=' + encodeURIComponent(RSS_URL)
    );
    const data = await r.json();

    const parser = new DOMParser();
    const xml = parser.parseFromString(data.contents, "application/xml");
    const items = xml.querySelectorAll('item');

    let fetchedItems = Array.from(items).map(item => ({
      title: item.querySelector('title')?.textContent,
      link: item.querySelector('link')?.textContent,
      pubDate: item.querySelector('pubDate')?.textContent,
      description: item.querySelector('description')?.textContent
    }));

    // --- 0件取得時のフォールバック（F5対策） ---
    if (fetchedItems.length === 0) {
      if (lastGoodNews) {
        newsItems = lastGoodNews;
      } else {
        console.warn('ニュース取得失敗（初回）');
        return;
      }
    } else {
      newsItems = fetchedItems;
      lastGoodNews = fetchedItems;
    }

    createNews();
    showNews(0, true);

    // 1件以下なら自動切替しない
    if (newsItems.length > 1) {
      startAuto();
    }

    const now = new Date();
    updateEl.textContent =
      `Last update ${now.getHours().toString().padStart(2,'0')}:` +
      `${now.getMinutes().toString().padStart(2,'0')} JST`;

  } catch (e) {
    console.error('News fetch failed', e);
  }
}

fetchNews();
setInterval(fetchNews, FETCH_INTERVAL);

function adjustScale() {
    const container = document.getElementById('container');
    if (!container) return;

    const baseWidth = 1920;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // 画面の横幅に合わせて倍率を決定
    let scale = screenWidth / baseWidth;

    // もし横向き（Landscape）で、高さがはみ出してしまう場合は高さ基準に切り替える
    const baseHeight = 720;
    if (baseHeight * scale > screenHeight) {
        scale = screenHeight / baseHeight;
    }

    // スケールを適用
    container.style.transform = `scale(${scale})`;
}

// 初期化とリサイズ時のイベント
window.addEventListener('resize', adjustScale);
window.addEventListener('load', adjustScale);
adjustScale();
