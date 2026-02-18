// =========================
// 1. CLOCK & DATE
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

function updateDate() {
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateEl = document.getElementById('date');
    if (dateEl) {
        dateEl.innerHTML = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    }
}
updateDate(); setInterval(updateDate, 60000);

// =========================
// 2. LEFT PANEL - 3D PRISMS
// =========================
// 3つのプリズムを生成・管理する
function initLeftPanel() {
    const container = document.getElementById('fixed-market-container'); // 左パネルのコンテナID
    if(!container) return;
    container.innerHTML = ''; // クリア

    // 定義: [タイトル, [面1シンボル, 面2シンボル, 面3シンボル], 開始遅延ms]
    const prismsData = [
        { 
            title: "FOREX", 
            symbols: ["FX:USDJPY", "FX:EURJPY", "FX:EURUSD"], 
            delay: 0 
        },
        { 
            title: "JAPAN MKT", 
            symbols: ["OSE:NK2251!", "OSE:NK2251!", "OSE:TOPIX1!"], // Nikkei, Nikkei Fut, Topix Fut
            delay: 4000 // 4秒ずらす
        },
        { 
            title: "US/COMMODITY", 
            symbols: ["CAPITALCOM:US500", "CAPITALCOM:US100", "TVC:GOLD"], // S&P, Nasdaq, Gold
            delay: 8000 // 8秒ずらす
        }
    ];

    prismsData.forEach((data, index) => {
        // HTML生成
        const wrapper = document.createElement('div');
        wrapper.className = 'prism-container';
        wrapper.innerHTML = `
            <div class="market-label">${data.title}</div>
            <div class="prism-stage" id="prism-stage-${index}">
                <div class="prism-face" id="face-${index}-0"></div>
                <div class="prism-face" id="face-${index}-1"></div>
                <div class="prism-face" id="face-${index}-2"></div>
            </div>
        `;
        container.appendChild(wrapper);

        // Widget埋め込み
        data.symbols.forEach((sym, faceIdx) => {
            embedTradingView(`face-${index}-${faceIdx}`, sym);
        });

        // 回転開始 (時間差)
        setTimeout(() => {
            startPrismRotation(`prism-stage-${index}`);
        }, data.delay);
    });
}

function embedTradingView(targetId, symbol) {
    const el = document.getElementById(targetId);
    if(!el) return;
    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
        "symbol": symbol,
        "width": "100%", "height": "100%", "locale": "ja",
        "dateRange": "1D", "colorTheme": "dark", "isTransparent": true, "interval": "5", "trendLineColor": "#00d4ff"
    });
    el.appendChild(script);
}

function startPrismRotation(elementId) {
    const el = document.getElementById(elementId);
    if(!el) return;
    let angle = 0;
    
    // 12秒ごとに120度回転
    setInterval(() => {
        angle -= 120;
        el.style.transform = `rotateX(${angle}deg)`;
    }, 12000);
}

initLeftPanel();

// =========================
// 3. CENTER PANEL - WEATHER, TRENDS, BOTTOM
// =========================
const API_KEY = 'eed3942fcebd430b2e32dfff2c611b11';
const LAT = 35.6895; const LON = 139.6917;

// Yahoo風アイコンマッピング
const W_ICONS = {
  sunny: `<svg viewBox="0 0 64 64" fill="none" stroke="#ffeb3b" stroke-width="3"><circle cx="32" cy="32" r="14" fill="#ffeb3b" fill-opacity="0.2"/><line x1="32" y1="2" x2="32" y2="12"/><line x1="32" y1="52" x2="32" y2="62"/><line x1="2" y1="32" x2="12" y2="32"/><line x1="52" y1="32" x2="62" y2="32"/><line x1="10" y1="10" x2="18" y2="18"/><line x1="46" y1="46" x2="54" y2="54"/><line x1="46" y1="18" x2="54" y2="10"/><line x1="10" y1="54" x2="18" y2="46"/></svg>`,
  cloudy: `<svg viewBox="0 0 64 64" fill="none" stroke="#90a4ae" stroke-width="3"><path d="M16 40c-4.4 0-8-3.6-8-8s3.6-8 8-8c.6 0 1.2.1 1.7.2C19.3 16.8 25 12 32 12c8.8 0 16 7.2 16 16 0 .5-.1 1-.2 1.5 3.5 1.1 6.2 4.3 6.2 8.5 0 5-4 9-9 9H16z" fill="#90a4ae" fill-opacity="0.2"/></svg>`,
  rainy: `<svg viewBox="0 0 64 64" fill="none" stroke="#4fc3f7" stroke-width="3"><path d="M20 32c-4.4 0-8-3.6-8-8s3.6-8 8-8c.6 0 1.2.1 1.7.2C23.3 8.8 29 4 36 4c8.8 0 16 7.2 16 16 0 .5-.1 1-.2 1.5 3.5 1.1 6.2 4.3 6.2 8.5 0 5-4 9-9 9H20z"/><line x1="24" y1="40" x2="20" y2="52"/><line x1="36" y1="40" x2="32" y2="52"/><line x1="48" y1="40" x2="44" y2="52"/></svg>`
};
function getWType(id) {
    if(id>=200 && id<600) return 'rainy';
    if(id>=801) return 'cloudy';
    return 'sunny';
}

async function fetchWeatherAndRender() {
    try {
        const r = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=ja`);
        const d = await r.json();
        
        // 1. メイン天気 (Yahoo風) - 今日の天気
        renderYahooWeather(d.list[0]);

        // 2. 下部パネル (3時間予報 / 週間 / 経済)
        renderBottomPanel(d.list);

    } catch(e) { console.error(e); }
}

function renderYahooWeather(item) {
    const el = document.getElementById('weather-fixed-content');
    const type = getWType(item.weather[0].id);
    const date = new Date();
    
    el.innerHTML = `
        <div class="weather-yahoo-style">
            <div class="wy-header">
                <div class="wy-title">TOKYO</div>
                <div class="wy-date">${date.getMonth()+1}/${date.getDate()} Now</div>
            </div>
            <div class="wy-main">
                <div class="wy-icon-area">${W_ICONS[type]}</div>
                <div class="wy-temp-area">
                    <div class="wy-high">${Math.round(item.main.temp_max)}°</div>
                    <div class="wy-low">${Math.round(item.main.temp_min)}°</div>
                </div>
            </div>
            <div class="wy-rain">
                <div class="wy-rain-item"><span class="wy-rain-time">12-18</span><span class="wy-rain-val">${Math.round(item.pop*100)}%</span></div>
                <div class="wy-rain-item"><span class="wy-rain-time">18-24</span><span class="wy-rain-val">${Math.round(item.pop*80)}%</span></div>
            </div>
        </div>
    `;
}

function renderBottomPanel(list) {
    const wrapper = document.getElementById('forecast-wrapper');
    // ラッパーの構造を3分割グリッドに変更
    wrapper.className = 'bottom-split-container';
    wrapper.style.transform = 'none'; // 既存のスライドリセット
    wrapper.innerHTML = '';

    // 左：3時間予報 (直近3つ)
    const threeHourHtml = list.slice(0, 3).map(item => {
        const h = new Date(item.dt*1000).getHours();
        const t = getWType(item.weather[0].id);
        return `
            <div class="th-item">
                <div class="th-time">${h}:00</div>
                <div class="th-icon">${W_ICONS[t]}</div>
                <div class="th-temp">${Math.round(item.main.temp)}°</div>
            </div>
        `;
    }).join('');

    // 中：週間予報 (簡易5日)
    const dailyMap = {};
    list.forEach(i => {
        const k = new Date(i.dt*1000).getDate();
        if(!dailyMap[k]) dailyMap[k] = {min:100, max:-100, icon: i.weather[0].id};
        dailyMap[k].max = Math.max(dailyMap[k].max, i.main.temp_max);
        dailyMap[k].min = Math.min(dailyMap[k].min, i.main.temp_min);
    });
    const weeklyHtml = Object.keys(dailyMap).slice(1, 5).map(k => {
        const d = dailyMap[k];
        const t = getWType(d.icon);
        return `
            <div class="wk-item">
                <div class="wk-date">${k}日</div>
                <div class="wk-icon">${W_ICONS[t]}</div>
                <div class="wk-hl"><span class="wk-h">${Math.round(d.max)}</span>/<span class="wk-l">${Math.round(d.min)}</span></div>
            </div>
        `;
    }).join('');

    // 右：経済指標 (TradingView)
    const ecoHtml = `<div id="eco-cal-widget" style="width:100%; height:100%;"></div>`;

    // 結合
    wrapper.innerHTML = `
        <div class="bottom-section">
            <div class="bottom-label">3 HOURS</div>
            <div class="bottom-content"><div class="three-hour-row">${threeHourHtml}</div></div>
        </div>
        <div class="bottom-section">
            <div class="bottom-label">WEEKLY</div>
            <div class="bottom-content"><div class="weekly-row">${weeklyHtml}</div></div>
        </div>
        <div class="bottom-section">
            <div class="bottom-label">CALENDAR</div>
            <div class="bottom-content">${ecoHtml}</div>
        </div>
    `;

    // 経済指標ウィジェット埋め込み
    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
        "width": "100%", "height": "100%", "colorTheme": "dark", "isTransparent": true, "locale": "ja", "importanceFilter": "-1,0,1"
    });
    document.getElementById('eco-cal-widget').appendChild(script);
}

fetchWeatherAndRender();

// =========================
// 4. TRENDS (Google Year in Search Style)
// =========================
async function fetchTrends() {
    // GAS URL (ダミーの場合はここを修正)
    const MY_GAS_URL = "https://script.google.com/macros/s/AKfycbx6dVnRjptPeQouJM6Czl-GUBqQzxFq8Nj06POOVbqTEGb_w4Wx0rHm-M9_GgApEWnv/exec?type=trends";
    let data = ["AI Trend", "Nvidia", "Bitcoin", "Election", "SpaceX", "Climate", "Anime", "Tech"]; // Default

    try {
        const r = await fetch(MY_GAS_URL);
        const txt = await r.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(txt, "application/xml");
        const items = xml.querySelectorAll('item');
        if(items.length > 0) {
            data = Array.from(items).map(i => i.querySelector('title').textContent).slice(0, 8);
        }
    } catch(e) {}

    renderTrends(data);
}

function renderTrends(data) {
    const container = document.getElementById('trend-fixed-content');
    container.innerHTML = '';
    
    // Grid設定 (画像のイメージに合わせて、大小を組み合わせる)
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(4, 1fr)';
    container.style.gridTemplateRows = 'repeat(4, 1fr)';
    container.style.gap = '2px';

    // カラースキーム (ビビッド)
    const colors = ['#FF5252', '#7C4DFF', '#448AFF', '#18FFFF', '#69F0AE', '#EEFF41', '#FFAB40', '#FF4081'];
    
    // 配置定義 (col-start / col-end / row-start / row-end)
    const layout = [
        { area: '1 / 3 / 1 / 3', size: 24 }, // Big Top Left
        { area: '1 / 3 / 3 / 5', size: 20 }, // Top Right
        { area: '3 / 5 / 1 / 2', size: 32 }, // Big Bottom Right
        { area: '3 / 4 / 2 / 3', size: 14 }, 
        { area: '3 / 4 / 3 / 4', size: 14 },
        { area: '4 / 5 / 2 / 3', size: 14 },
        { area: '4 / 5 / 3 / 4', size: 14 },
        { area: '2 / 3 / 4 / 5', size: 14 }
    ];

    // 足りない分は補完
    for(let i=0; i<8; i++) {
        const item = data[i] || "DATA";
        const div = document.createElement('div');
        div.className = 'trend-tile';
        const style = layout[i] || { area: 'auto', size: 14 };
        
        div.style.gridArea = style.area;
        div.style.backgroundColor = colors[i % colors.length];
        div.style.fontSize = style.size + 'px';
        div.innerHTML = `
            <div>${item}</div>
            <div class="trend-rank">#${i+1}</div>
            <div class="trend-val">${Math.floor(Math.random()*50)+1}k+</div>
        `;
        
        // onclick
        div.onclick = () => window.open('https://www.google.com/search?q='+encodeURIComponent(item));
        
        container.appendChild(div);
    }
}
fetchTrends();

// =========================
// 5. NEWS (数珠つなぎスライド)
// =========================
async function fetchNews() {
    const MY_GAS_URL = "https://script.google.com/macros/s/AKfycbx6dVnRjptPeQouJM6Czl-GUBqQzxFq8Nj06POOVbqTEGb_w4Wx0rHm-M9_GgApEWnv/exec";
    let items = [];
    try {
        const r = await fetch(MY_GAS_URL);
        const txt = await r.text();
        const xml = new DOMParser().parseFromString(txt, "application/xml");
        items = Array.from(xml.querySelectorAll('item')).map(i => ({
            title: i.querySelector('title')?.textContent,
            link: i.querySelector('link')?.textContent,
            desc: i.querySelector('description')?.textContent,
            date: i.querySelector('pubDate')?.textContent
        }));
    } catch(e) { console.error(e); }

    if(items.length > 0) initNewsSlide(items);
}

let newsListState = { items: [], index: 0 };

function initNewsSlide(items) {
    newsListState.items = items;
    const card = document.getElementById('news-card');
    card.innerHTML = '';

    // 外枠
    const container = document.createElement('div');
    container.className = 'news-container';
    
    // ヘッダー
    container.innerHTML = `
        <div class="news-header">
            <div class="news-header-title">NEWS TICKER</div>
            <div class="news-header-source">NHK FEED</div>
        </div>
        <div class="news-viewport">
            <div class="news-list" id="news-list-el"></div>
        </div>
    `;
    card.appendChild(container);

    // 初期表示 (画面に入る分だけ埋める、例: 6件)
    const listEl = document.getElementById('news-list-el');
    for(let i=0; i<8; i++) {
        addNewsRow(listEl, items[i % items.length]);
    }
    newsListState.index = 8;

    // スライド開始
    startNewsTicker();
}

function addNewsRow(container, item) {
    const div = document.createElement('div');
    div.className = 'news-row';
    div.innerHTML = `
        <a href="${item.link}" target="_blank" class="news-row-title">${item.title}</a>
        <div class="news-row-meta">
            <span class="news-row-desc">${item.desc ? item.desc.substring(0,30)+"..." : ""}</span>
            <span>${new Date(item.date).getHours()}:00</span>
        </div>
    `;
    container.appendChild(div);
}

function startNewsTicker() {
    setInterval(() => {
        const listEl = document.getElementById('news-list-el');
        if(!listEl) return;

        // 1. 次の要素を末尾に追加
        const nextItem = newsListState.items[newsListState.index % newsListState.items.length];
        addNewsRow(listEl, nextItem);
        newsListState.index++;

        // 2. コンテナ全体を上にスライド (rowの高さ85px分)
        listEl.style.transition = 'transform 0.8s cubic-bezier(0.2, 1, 0.3, 1)';
        listEl.style.transform = 'translateY(-85px)';

        // 3. アニメーション終了後にDOM整理
        setTimeout(() => {
            listEl.style.transition = 'none';
            listEl.style.transform = 'translateY(0)';
            if(listEl.firstElementChild) {
                listEl.firstElementChild.remove();
            }
        }, 800); // transition時間と合わせる
        
    }, 4000); // 4秒ごとにスライド
}

fetchNews();
