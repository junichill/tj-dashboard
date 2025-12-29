// ---------------- CLOCK & DATE ----------------
const clockEl = document.getElementById('clock');
const dateEl = document.getElementById('date');
const weatherEl = document.getElementById('weather');

function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  const s = String(now.getSeconds()).padStart(2,'0');
  clockEl.textContent = `${h}:${m}:${s}`;

  const year = now.getFullYear();
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const month = monthNames[now.getMonth()];
  const date = now.getDate();
  const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const day = weekdays[now.getDay()];
  dateEl.textContent = `${day}, ${month} ${date}, ${year}`;
  dateEl.style.textAlign = 'right';
}
setInterval(updateClock, 1000);
updateClock();

// ---------------- NEWS ----------------
const rssUrl = 'https://news.web.nhk/n-data/conf/na/rss/cat0.xml';
const rss2jsonApi = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(rssUrl);
const newsCard = document.getElementById('news-card');
let newsItems = [];
let newsIndex = 0;
let fadeInterval;

// ニュース取得
async function fetchNews() {
  newsCard.innerHTML = '<div class="news-item" style="opacity:1;">Loading news...</div>';
  try {
    const res = await fetch(rss2jsonApi);
    const data = await res.json();
    newsItems = data.items;
    renderNewsItems();
    startFadeNews();
  } catch(err) {
    newsCard.innerHTML = '<div class="news-item" style="opacity:1;">News fetch failed</div>';
    console.error(err);
  }
}

// ニュース表示要素作成
function renderNewsItems() {
  newsCard.innerHTML = '';
  newsItems.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'news-item';
    div.style.opacity = idx === 0 ? '1' : '0'; // 最初のニュースは表示
    div.innerHTML =
      `<div class="news-title">${item.title}</div>` +
      `<hr>` +
      `<div class="news-pubdate">${item.pubDate}</div>` +
      `
