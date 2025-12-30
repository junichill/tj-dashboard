// =================================================
// CLOCK
// =================================================
const clock = Tick.DOM.create(document.getElementById("flip-clock"), {
  value: new Date()
});

setInterval(() => {
  clock.value = new Date();
}, 1000);

// =================================================
// DATE
// =================================================
const dateEl = document.getElementById("date");
function updateDate() {
  const d = new Date();
  const w = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  dateEl.textContent = `${w[d.getDay()]}, ${m[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
updateDate();
setInterval(updateDate, 60000);

// =================================================
// WEATHER
// =================================================
const weatherEl = document.getElementById("weather");
const API_KEY = "eed3942fcebd430b2e32dfff2c611b11";
const LAT = 35.5309;
const LON = 139.7033;

async function fetchWeather() {
  try {
    const r = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`
    );
    const d = await r.json();
    weatherEl.innerHTML =
      `Today: ${d.list[0].main.temp.toFixed(1)}℃<br>` +
      `Tomorrow: ${d.list[8].main.temp.toFixed(1)}℃`;
  } catch {
    weatherEl.textContent = "Weather unavailable";
  }
}
fetchWeather();
setInterval(fetchWeather, 600000);

// =================================================
// NEWS (Swipe + Indicator)
// =================================================
const newsCard = document.getElementById("news-card");
const indicator = document.getElementById("news-indicator");
let items = [];
let index = 0;
let timer;

async function fetchNews() {
  const r = await fetch(
    "https://api.rss2json.com/v1/api.json?rss_url=https://news.web.nhk/n-data/conf/na/rss/cat0.xml"
  );
  const d = await r.json();
  items = d.items;
  renderIndicators();
  showNews(0, false);
  startAuto();
}

function renderIndicators() {
  indicator.innerHTML = "";
  items.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.className = "indicator-dot" + (i === 0 ? " active" : "");
    dot.onclick = () => showNews(i, true);
    indicator.appendChild(dot);
  });
}

function showNews(newIndex, animate) {
  clearInterval(timer);

  const direction =
    newIndex > index || (index === items.length - 1 && newIndex === 0)
      ? "from-right"
      : "from-left";

  newsCard.innerHTML = "";
  const item = items[newIndex];
  const div = document.createElement("div");
  div.className = `news-item show ${animate ? direction : ""}`;
  div.innerHTML = `
    <a class="news-title" href="${item.link}" target="_blank">${item.title}</a>
    <div class="news-pubdate">${item.pubDate}</div>
    <div class="news-description">${item.description}</div>
  `;
  newsCard.appendChild(div);

  [...indicator.children].forEach((d, i) =>
    d.classList.toggle("active", i === newIndex)
  );

  index = newIndex;
  startAuto();
}

function startAuto() {
  timer = setInterval(() => {
    showNews((index + 1) % items.length, true);
  }, 7000);
}

// スワイプ
let startX = 0;
newsCard.addEventListener("touchstart", e => startX = e.touches[0].clientX);
newsCard.addEventListener("touchend", e => {
  const dx = e.changedTouches[0].clientX - startX;
  if (dx > 50) showNews((index - 1 + items.length) % items.length, true);
  if (dx < -50) showNews((index + 1) % items.length, true);
});

fetchNews();
