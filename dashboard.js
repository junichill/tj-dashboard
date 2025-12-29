// --- ニュースRSS取得 ---
const RSS_URL = "https://api.allorigins.win/get?url=" +
                encodeURIComponent("https://www3.nhk.or.jp/rss/news/cat0.xml");

let newsItems = [];
let panelIndex = 0;

// --- パネル制御 ---
const panelIds = ["news-panel","weather-panel","quake-panel"];

function activatePanel(id) {
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// --- ニュース表示 ---
function showNews() {
  activatePanel("news-panel");
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

// --- 天気表示（サンプル） ---
function showWeather() {
  activatePanel("weather-panel");
  document.getElementById("weather").textContent = "東京: 晴れ 23℃ 湿度50%";
}

// --- 地震表示（サンプル） ---
function showQuake() {
  activatePanel("quake-panel");
  document.getElementById("quake").textContent = "最新地震: M4.5 東京湾 5分前";
}

// --- パネル切替 ---
function nextPanel() {
  const fns = [showNews, showWeather, showQuake];
  fns[panelIndex]();
  panelIndex = (panelIndex + 1) % 3;
}

// --- ニュース取得 + 自動切替開始 ---
fetch(RSS_URL)
  .then(res => res.json())
  .then(data => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(data.contents,"application/xml");
    const items = xml.querySelectorAll("item");
    newsItems = Array.from(items).slice(0,5).map(item => ({
      title: item.querySelector("title").textContent,
      link: item.querySelector("link").textContent
    }));

    // 初回表示 + 8秒ごと切替
    nextPanel();
    setInterval(nextPanel, 8000);
  })
  .catch(err => {
    console.error("ニュース取得失敗:", err);
    document.getElementById("news-list").innerHTML = "<li>ニュース取得失敗</li>";
    nextPanel();
    setInterval(nextPanel, 8000);
  });
