const RSS_URL = "https://api.allorigins.win/get?url=" +
                encodeURIComponent("https://news.web.nhk/n-data/conf/na/rss/cat0.xml");

let newsItems = [];
let currentNews = 0;

function showNews() {
  const panel = document.getElementById("news-panel");
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  panel.classList.add("active");

  const list = document.getElementById("news-list");
  list.innerHTML = "";

  if(newsItems.length === 0) return;

  const item = newsItems[currentNews];
  const li = document.createElement("li");
  li.textContent = item.title;
  list.appendChild(li);

  // QRコード生成
  const qrContainer = document.getElementById("qr");
  qrContainer.innerHTML = "";
  new QRCode(qrContainer, { text: item.link, width: 120, height: 120 });

  currentNews = (currentNews + 1) % newsItems.length;
}

fetch(RSS_URL)
  .then(res => res.json())
  .then(data => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(data.contents, "application/xml");
    const items = xml.querySelectorAll("item");

    newsItems = Array.from(items).slice(0, 5).map(item => ({
      title: item.querySelector("title").textContent,
      link: item.querySelector("link").textContent
    }));

    showNews();
    setInterval(showNews, 5000); // 5秒ごとに切替
  })
  .catch(err => {
    document.getElementById("news-list").innerHTML = "<li>ニュース取得失敗</li>";
    console.error(err);
  });
