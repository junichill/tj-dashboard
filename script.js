// =========================
// NEWS (NHK + JST表示そのまま + description表示)
// =========================
const rssList = [
  { name: 'NHK', key: 'nhk', url: 'https://news.web.nhk/n-data/conf/na/rss/cat0.xml' }
];
const RSS_API = 'https://api.rss2json.com/v1/api.json?rss_url=';
const newsCard = document.getElementById('news-card');

let newsItems = [], newsEls = [], index = 0, timer = null;
const FADE = 1.8, AUTO_INTERVAL = 11000, FETCH_INTERVAL = 10 * 60 * 1000;

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
  // 既存ニュースを削除
  newsCard.querySelectorAll('.news-item').forEach(e => e.remove());

  newsEls = newsItems.map(n => {
    const div = document.createElement('div');
    div.className = 'news-item';
    if (isImportant(n.title)) div.classList.add('important');

    // JSON API から取得した pubDate をそのまま表示
    div.innerHTML = `
      <a class="news-title" href="${n.link}" target="_blank">${n.title}</a>
      <div class="news-pubdate">${n.pubDate}</div>
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
  }, FADE * 1000);
}

// --- 自動切替 ---
function startAuto() {
  stopAuto();
  timer = setInterval(() => showNews((index + 1) % newsEls.length), AUTO_INTERVAL);
}

function stopAuto() {
  if (timer) clearInterval(timer);
}

// --- ニュース取得 ---
async function fetchNews() {
  try {
    const r = await fetch(RSS_API + encodeURIComponent(rssList[0].url));
    const d = await r.json();

    newsItems = d.items || [];
    createNews();
    showNews(0, true);
    startAuto();

    const now = new Date();
    updateEl.textContent = `Last update ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')} JST`;
  } catch (e) {
    console.error('News fetch failed', e);
  }
}

fetchNews();
setInterval(fetchNews, FETCH_INTERVAL);
