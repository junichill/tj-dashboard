// 時計 & 日付
function handleTickInit(tick) {
  const secondsEl = document.getElementById('seconds-static');
  Tick.helper.interval(() => {
    const d = new Date();
    const h = d.getHours().toString().padStart(2, '0'), m = d.getMinutes().toString().padStart(2, '0'), s = d.getSeconds().toString().padStart(2, '0');
    tick.value = { hours1: h[0], hours2: h[1], minutes1: m[0], minutes2: m[1] };
    if (secondsEl) { secondsEl.textContent = s; }
  }, 1000);
}

function updateDate() {
  const now = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateEl = document.getElementById('date');
  if (dateEl) dateEl.innerHTML = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()} (R${now.getFullYear()-2018})`;
}

// 天気更新
const API_KEY = 'eed3942fcebd430b2e32dfff2c611b11';
const LAT = 35.6895, LON = 139.6917;
async function updateWeather() {
  const r = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=ja`);
  const d = await r.json();
  const container = document.getElementById('weather-content');
  let showWeekly = false;
  const render = () => {
    container.style.opacity = 0;
    setTimeout(() => {
      container.innerHTML = showWeekly ? createWeeklyForecastHtml(d.list) : createForecastGroupHtml(d.list.slice(0, 5), "Today");
      container.style.opacity = 1;
      showWeekly = !showWeekly;
    }, 500);
  };
  render(); setInterval(render, 15000);
}

// トレンド取得
async function fetchTrends() {
  const r = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://trends.google.co.jp/trends/trendingsearches/daily/rss?geo=JP'));
  const d = await r.json();
  const xml = new DOMParser().parseFromString(d.contents, "application/xml");
  const items = Array.from(xml.querySelectorAll('item')).slice(0, 6);
  document.getElementById('trend-content').innerHTML = items.map((it, i) => `<div class="trend-item"><span style="color:#00d4ff">0${i+1}</span><span>${it.querySelector('title').textContent}</span></div>`).join('');
}

// ウィジェット初期化
function initWidgets() {
  const conf = { "width": "100%", "height": 155, "locale": "ja", "colorTheme": "dark", "isTransparent": true };
  appendMiniWidget("tv-usd-jpy-fixed", { ...conf, "symbol": "FX:USDJPY" });
  appendMiniWidget("tv-n225-fixed", { ...conf, "symbol": "OSE:NK2251!" });
  appendMiniWidget("tv-nasdaq-fixed", { ...conf, "symbol": "CAPITALCOM:US100" });

  // 下段ウィジェット
  new TradingView.MediumWidget({ "container_id": "tv-gauge-container", "symbols": [["USD/JPY","FX:USDJPY|1D"]], "width": "100%", "height": "100%", "colorTheme": "dark", "isTransparent": true });
  const cal = document.createElement('script');
  cal.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
  cal.async = true; cal.innerHTML = JSON.stringify({ "colorTheme": "dark", "isTransparent": true, "width": "100%", "height": "100%", "importanceFilter": "0,1" });
  document.getElementById('tv-calendar-container').appendChild(cal);
}

function appendMiniWidget(id, config) {
  const container = document.getElementById(id); if (!container) return;
  const s = document.createElement('script'); s.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
  s.async = true; s.innerHTML = JSON.stringify(config); container.appendChild(s);
}

// ニュース & スケール（元のロジックを維持）
// (※ここに、お手元のscript.jsにあるfetchNews関数とadjustScale関数をそのまま貼り付けてください)

window.onload = () => {
  updateDate(); updateWeather(); fetchTrends(); initWidgets(); fetchNews(); adjustScale();
};
window.onresize = adjustScale;
