// --- ニュース取得 ---
const RSS_URL = "https://api.allorigins.win/get?url=" +
                encodeURIComponent("https://news.web.nhk/n-data/conf/na/rss/cat0.xml");

let newsItems = [];
let panelIndex = 0;
const panels = ["news-panel", "weather-panel", "quake-panel"];

// ニュース取得
fetch(RSS_URL)
  .then(res => res.json())
  .then(data => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(data.contents, "application/xml");
    const items = xml.querySelectorAll("item");

    newsItems = Array.from(items).slice(0,5).map(item => ({
      title: item.querySelector("title").textContent,
      link: item.querySelector("link").textContent
    }));
  })
  .catch(err => console.error(err));

// --- ニュース表示 ---
function showNews() {
  const panel = document.getElementById("news-panel");
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  panel.classList.add("active");

  const list = document.getElementById("news-list");
  const qrContainer = document.getElementById("qr");
  list.innerHTML = "";
  qrContainer.innerHTML = "";

  if(newsItems.length === 0){
    list.innerHTML = "<li>ニュース取得失敗</li>";
    return;
  }

  const item = newsItems[Math.floor(Math.random() * newsItems.length)];
  const li = document.createElement("li");
  li.textContent = item.title;
  list.appendChild(li);

  new QRCode(qrContainer, { text: item.link, width: 120, height: 120 });
}

// --- 天気表示（サンプル、APIに置き換え可能） ---
function showWeather() {
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  document.getElementById("weather-panel").classList.add("active");
  document.getElementById("weather").textContent = "東京: 晴れ 23℃ 湿度50%";
}

// --- 地震表示（サンプル、APIに置き換え可能） ---
function showQuake() {
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  document.getElementById("quake-panel").classList.add("active");
  document.getElementById("quake").textContent = "最新地震: M4.5 東京湾 5分前";
}

// --- パネル自動切替 ---
function nextPanel() {
  const fn = [showNews, showWeather, showQuake][panelIndex];
  fn();
  panelIndex = (panelIndex + 1) % 3;
}

// 初回表示
nextPanel();
setInterval(nextPanel, 8000); // 8秒ごとに切替
