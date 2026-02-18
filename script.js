// =========================
// 基本時計 & 日付
// =========================
function handleTickInit(tick) {
    const secondsEl = document.getElementById('seconds-static');
    Tick.helper.interval(() => {
        const d = new Date();
        const h = d.getHours().toString().padStart(2, '0');
        const m = d.getMinutes().toString().padStart(2, '0');
        const s = d.getSeconds().toString().padStart(2, '0');
        tick.value = { hours1: h[0], hours2: h[1], minutes1: m[0], minutes2: m[1] };
        if (secondsEl) secondsEl.textContent = s;
    }, 1000);
}

function updateDate() {
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateEl = document.getElementById('date');
    if (dateEl) dateEl.innerHTML = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()} (R${now.getFullYear()-2018})`;
}
updateDate(); setInterval(updateDate, 60000);

// =========================
// 左パネル: 3段プリズム回転 (ゆっくり)
// =========================
const LEFT_CONFIG = [
    { id: "tv-n225-fixed", label: "MARKET INDICES", symbols: ["OSE:NK2251!", "CAPITALCOM:US100", "CAPITALCOM:US500"] },
    { id: "tv-nasdaq-fixed", label: "CURRENCY / FX", symbols: ["FX:USDJPY", "FX:EURJPY", "FX:EURUSD"] },
    { id: "forex-viewport-v", label: "COMMODITIES", symbols: ["TVC:GOLD", "CAPITALCOM:OIL_CRUDE", "TVC:SILVER"] }
];

function initPrisms() {
    LEFT_CONFIG.forEach((conf, i) => {
        const container = document.getElementById(conf.id);
        if (!container) return;
        container.innerHTML = `<div class="prism-stage" id="stage-${i}">
            <div class="prism-face" id="f-${i}-0"></div>
            <div class="prism-face" id="f-${i}-1"></div>
            <div class="prism-face" id="f-${i}-2"></div>
        </div>`;
        conf.symbols.forEach((sym, idx) => embedTV(`f-${i}-${idx}`, sym));
        
        let angle = 0;
        setInterval(() => {
            angle -= 120;
            document.getElementById(`stage-${i}`).style.transform = `rotateX(${angle}deg)`;
        }, 15000 + (i * 2000)); // 各段少しずらして15秒〜回転
    });
}

function embedTV(target, symbol) {
    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
        "symbol": symbol, "width": "100%", "height": "100%", "locale": "ja",
        "dateRange": "1D", "colorTheme": "dark", "isTransparent": true
    });
    document.getElementById(target).appendChild(script);
}

// =========================
// トレンド (Google風 4x2 タイル)
// =========================
async function fetchTrends() {
    const GAS_TRENDS = "https://script.google.com/macros/s/AKfycbx6dVnRjptPeQouJM6Czl-GUBqQzxFq8Nj06POOVbqTEGb_w4Wx0rHm-M9_GgApEWnv/exec?type=trends";
    const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#FF6D01', '#46BDC6', '#7B1FA2', '#1976D2'];
    try {
        const r = await fetch(GAS_TRENDS);
        const txt = await r.text();
        const xml = new DOMParser().parseFromString(txt, "application/xml");
        const items = Array.from(xml.querySelectorAll('item')).map(i => i.querySelector('title').textContent).slice(0, 8);
        
        const container = document.getElementById('trend-fixed-content');
        container.innerHTML = items.map((word, i) => `
            <div class="trend-tile" style="background:${colors[i]}">${word}</div>
        `).join('');
    } catch(e) { console.error("Trend fail"); }
}

// =========================
// ニュース (2行目が1行目に吸い込まれる挙動)
// =========================
let newsList = [];
let newsCursor = 0;

async function fetchNews() {
    const GAS_NEWS = "https://script.google.com/macros/s/AKfycbx6dVnRjptPeQouJM6Czl-GUBqQzxFq8Nj06POOVbqTEGb_w4Wx0rHm-M9_GgApEWnv/exec";
    try {
        const r = await fetch(GAS_NEWS);
        const txt = await r.text();
        const xml = new DOMParser().parseFromString(txt, "application/xml");
        newsList = Array.from(xml.querySelectorAll('item')).map(i => ({
            title: i.querySelector('title').textContent,
            desc: i.querySelector('description')?.textContent || '',
            date: i.querySelector('pubDate')?.textContent || ''
        }));
        if (newsList.length > 0) initNewsUI();
    } catch(e) {}
}

function initNewsUI() {
    const card = document.getElementById('news-card');
    card.innerHTML = `
        <div class="news-overlay">
            <div class="news-main-area" id="n-main"></div>
            <div class="news-sub-window">
                <div class="news-sub-track" id="n-track"></div>
            </div>
        </div>`;
    updateNewsDisplay();
    setInterval(slideNews, 12000); // 12秒ごとにゆっくり切り替え
}

function updateNewsDisplay() {
    const main = document.getElementById('n-main');
    const track = document.getElementById('n-track');
    const item = newsList[newsCursor % newsList.length];
    
    main.innerHTML = `<div class="news-main-title">${item.title}</div><div class="news-main-desc">${item.desc}</div>`;
    
    track.innerHTML = '';
    for(let i=1; i<=7; i++) {
        const subItem = newsList[(newsCursor + i) % newsList.length];
        track.innerHTML += `<div class="news-sub-item"><div class="news-sub-dot"></div><div class="news-sub-text">${subItem.title}</div></div>`;
    }
}

function slideNews() {
    const track = document.getElementById('n-track');
    track.style.transform = 'translateY(-55px)'; // 1行分上げる
    
    setTimeout(() => {
        newsCursor++;
        track.style.transition = 'none';
        track.style.transform = 'translateY(0)';
        updateNewsDisplay();
        setTimeout(() => track.style.transition = 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)', 50);
    }, 1200);
}

// =========================
// 中央下: 切替方式 (ゆっくり)
// =========================
let bottomIdx = 0;
function initBottomSlides() {
    const wrapper = document.getElementById('forecast-wrapper');
    // 既存のHTML要素（Today, Weekly, Economic等）をグループ化して切り替える
    // ここでは簡易的に3つのスライドがあるものとして処理
    const groups = wrapper.querySelectorAll('.day-group');
    if (groups.length === 0) return;

    groups.forEach((g, i) => {
        g.classList.add('slide-group');
        if(i===0) g.classList.add('active');
    });

    setInterval(() => {
        groups[bottomIdx].classList.remove('active');
        bottomIdx = (bottomIdx + 1) % groups.length;
        groups[bottomIdx].classList.add('active');
    }, 20000); // 20秒間隔
}

// 初期化
initPrisms();
fetchTrends();
fetchNews();
setTimeout(initBottomSlides, 2000); // 描画待ち
