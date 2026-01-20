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
  const d = new Date();
  const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const w = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  dateEl.textContent = `${w[d.getDay()]}, ${m[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
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
snowy: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round">
    <path d="M20 36c-5 0-8-4-8-8a10 10 0 0 1 20-2 12 12 0 0 1 22 10"/>
    <circle cx="24" cy="50" r="1" fill="currentColor"/>
    <circle cx="34" cy="56" r="1" fill="currentColor"/>
    <circle cx="44" cy="50" r="1" fill="currentColor"/>
  </svg>`
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
async function fetchWeather() {
  try {
    const r = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=ja`
    );
    const d = await r.json();

    const container = document.getElementById('forecast-container');
    container.innerHTML = ''; // 一旦クリア

    // 直近の4つ（12時間分）を取得して表示
    const forecastList = d.list.slice(0, 4);

    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000);
      const hour = date.getHours().toString().padStart(2, '0') + ":00";
      const temp = Math.round(item.main.temp);
      const type = getWeatherType(item.weather[0].id);

      const forecastHtml = `
        <div class="forecast-item" style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
          <div style="font-size: 14px; opacity: 0.8;">${hour}</div>
          <div class="weather-icon weather-${type}" style="width: 40px; height: 40px;">
            ${WEATHER_ICONS[type]}
          </div>
          <div style="font-size: 18px; font-weight: 700;">${temp}℃</div>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', forecastHtml);
    });

  } catch (err) {
    console.error('天気情報取得失敗', err);
  }
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
