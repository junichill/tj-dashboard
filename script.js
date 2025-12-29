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
let newsElements = [];

async function fetchNews() {
  try {
    const res = await fetch(rss2jsonApi);
    const data = await res.json();
    newsItems = data.items;
    newsIndex = 0;
    prepareNewsElements();
    showNews();
  } catch(err) {
    newsCard.textContent = 'News fetch failed';
    console.error(err);
  }
}

function prepareNewsElements() {
  newsCard.innerHTML = '';
  newsElements = newsItems.map(item => {
    const div = document.createElement('div');
    div.className = 'news-item';

    // ニュース画像がある場合のみ表示
    let imgHtml = '';
    if(item.thumbnail) {
      imgHtml = `<img src="${item.thumbnail}" class="news-img" alt="news image"><br>`;
    }

    // 正しい順序: 画像 → タイトル → 日時（右寄せ） → 本文
    div.innerHTML =
      imgHtml +
      `<a href="${item.link}" target="_blank" class="news-title">${item.title}</a><hr>` +
      `<div class="news-pubdate">${item.pubDate}</div>` +
      `<div class="news-description">${item.description}</div>`;

    newsCard.appendChild(div);
    return div;
  });
}

function showNews() {
  if(newsElem
