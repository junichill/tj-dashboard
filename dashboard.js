// --- ニュース取得 (CORS対応) ---
const RSS_URL = "https://api.allorigins.win/get?url=" +
                encodeURIComponent("https://www3.nhk.or.jp/rss/news/cat0.xml");

let newsItems = [];
let panelIndex = 0;
const panels = ["news-panel", "weather-panel", "quake-panel"];

// --- ニュース表示関数 ---
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

  // ランダムに1件表示
  const item = newsItems[Math.floor(Math.random() * newsItems.length)];
  const li = document.createElement("li");
  li.textContent = item.title;
  list.appendChild(li);

  // QRコード生成
  new QRCode(qrContainer, { text: item.link, width: 120, height: 120 });
}

// --- 天気表示関数（サンプル） ---
function showWeather() {
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  document.getElementById("weather-panel").classList.add("active");

  // ここを天気APIに置き換え可能
  document.getElementById("weather").textContent = "東京: 晴れ 23℃ 湿度50%";
}

// --- 地震表示関数（サンプル） ---
function showQuake() {
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  document.getElementById("quake-panel").classList.add("active");

  // ここを地震APIに置き換え可能
  document.getElementById("quake").textContent = "最新地震: M4.5 東京湾 5分前";
}

// --- パネル自動切替 ---
function nextPanel() {
  const fn = [showNews, showWeather, showQuake][panelIndex];
  fn();
  panelIndex = (panelIndex + 1) % 3;
}

// --- ニュース取得と初回表示 ---
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

    // 初回表示
    nextPanel();
    setInterval(nextPanel, 8000); // 8秒ごとに切替
  })
  .catch(err => {
    console.error("ニュース取得失敗:", err);
    document.getElementById("news-list").innerHTML = "<li>ニュース取得失敗</li>";
    // ニュース取得失敗でも自動切替開始
    nextPanel();
    setInterval(nextPanel, 8000);
  });
