// ==================================================
// NEWS
// ==================================================
const rssUrl = 'https://news.web.nhk/n-data/conf/na/rss/cat0.xml';
const rssApi = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(rssUrl);

const newsCard = document.getElementById('news-card');

let newsItems = [];
let newsElements = [];
let newsIndex = 0;
let autoTimer = null;
let indicatorEl = null;

// ==================================================
// ユーティリティ
// ==================================================
function clearAnim(el) {
  el.classList.remove(
    'show',
    'slide-in-left',
    'slide-in-right',
    'slide-out-left',
    'slide-out-right'
  );
}

// ==================================================
// 表示制御
// ==================================================
function showNews(targetIndex, direction) {
  if (targetIndex === newsIndex) return;

  const current = newsElements[newsIndex];
  const next = newsElements[targetIndex];

  clearAnim(current);
  clearAnim(next);

  // 現在を退場
  current.classList.add(direction === 'next' ? 'slide-out-left' : 'slide-out-right');

  // 次を入場
  next.classList.add(
    'show',
    direction === 'next' ? 'slide-in-right' : 'slide-in-left'
  );

  newsIndex = targetIndex;
  updateIndicator();
}

// ==================================================
// 自動切替（常に「次」）
// ==================================================
function startAuto() {
  stopAuto();
  autoTimer = setInterval(() => {
    const next = (newsIndex + 1) % newsElements.length;
    showNews(next, 'next'); // ← 常に next
  }, 7000);
}

function stopAuto() {
  if (autoTimer) clearInterval(autoTimer);
}

// ==================================================
// インジケータ
// ==================================================
function createIndicator() {
  indicatorEl = document.createElement('div');
  indicatorEl.id = 'news-indicator';

  newsItems.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'dot';

    dot.addEventListener('click', () => {
      stopAuto();
      if (i > newsIndex) {
        showNews(i, 'next');
      } else {
        showNews(i, 'prev');
      }
      startAuto();
    });

    indicatorEl.appendChild(dot);
  });

  newsCard.appendChild(indicatorEl);
}

function updateIndicator() {
  const dots = indicatorEl.querySelectorAll('.dot');
  dots.forEach((d, i) => d.classList.toggle('active', i === newsIndex));
}

// ==================================================
// ニュース取得
// ==================================================
async function fetchNews() {
  try {
    const res = await fetch(rssApi);
    const data = await res.json();

    newsItems = data.items;
    newsElements = [];
    newsIndex = 0;

    newsCard.innerHTML = '';

    newsItems.forEach((item, i) => {
      const div = document.createElement('div');
      div.className = 'news-item';

      if (i === 0) div.classList.add('show');

      div.innerHTML = `
        ${item.thumbnail ? `<img src="${item.thumbnail}" class="news-img">` : ''}
        <a href="${item.link}" target="_blank" class="news-title">${item.title}</a>
        <div class="news-pubdate">${item.pubDate}</div>
        <div class="news-description">${item.description}</div>
      `;

      newsCard.appendChild(div);
      newsElements.push(div);
    });

    createIndicator();
    updateIndicator();
    startAuto();

  } catch {
    newsCard.textContent = 'News fetch failed';
  }
}

// ==================================================
// スワイプ操作
// ==================================================
let startX = 0;

newsCard.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
  stopAuto();
});

newsCard.addEventListener('touchend', e => {
  const diff = e.changedTouches[0].clientX - startX;

  if (Math.abs(diff) > 50) {
    if (diff < 0) {
      // 右 → 左（次）
      showNews((newsIndex + 1) % newsElements.length, 'next');
    } else {
      // 左 → 右（前）
      showNews((newsIndex - 1 + newsElements.length) % newsElements.length, 'prev');
    }
  }
  startAuto();
});

// ==================================================
fetchNews();
setInterval(fetchNews, 300000);
