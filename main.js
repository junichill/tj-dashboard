/* ===== TJ Dashboard ===== */

/* 時計 */
function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent =
    now.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}
setInterval(updateClock, 1000);
updateClock();

/* 天気 */
async function loadWeather() {
  const apiKey = "YOUR_OPENWEATHER_API_KEY";
  const city = "Tokyo";

  const url =
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=ja&appid=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  document.getElementById("weather").innerHTML = `
    <h2>天気</h2>
    <div>${data.weather[0].description}</div>
    <div>${Math.round(data.main.temp)}℃</div>
  `;
}
loadWeather();
setInterval(loadWeather, 10 * 60 * 1000);

/* NHKニュース（RSS） */
async function loadNHKNews() {
  const rss = "https://www.nhk.or.jp/rss/news/cat0.xml";
  const proxy = "https://api.allorigins.win/raw?url=" + encodeURIComponent(rss);

  const res = await fetch(proxy);
  const text = await res.text();

  const xml = new DOMParser().parseFromString(text, "text/xml");
  const items = xml.querySelectorAll("item");

  document.getElementById("news").innerHTML =
    "<h2>NHKニュース</h2>" +
    Array.from(items)
      .slice(0, 5)
      .map(item => `<div>${item.querySelector("title").textContent}</div>`)
      .join("");
}
loadNHKNews();
setInterval(loadNHKNews, 30 * 60 * 1000);

/* 為替 */
async function loadMarket() {
  document.getElementById("market").innerHTML = `
    <h2>為替</h2>
    <div class="market-item">
      <span>USD / JPY</span>
      <span>取得中…</span>
    </div>
  `;
}
loadMarket();
