// ---------------- CLOCK & DATE ----------------
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  const s = String(now.getSeconds()).padStart(2,'0');
  clockEl.textContent = `${h}:${m}:${s}`;

  // 日付を右寄せ（CSSで右寄せしている想定）
  const year = now.getFullYear();
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const month = monthNames[now.getMonth()];
  const date = now.getDate();
  const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const day = weekdays[now.getDay()];
  dateEl.textContent = `${day}, ${month} ${date}, ${year}`;
  dateEl.style.textAlign = 'right';
}

// ---------------- WEATHER ----------------
async function fetchWeather() {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&lang=en&units=metric`
    );
    const data = await res.json();

    const now = new Date();
    const todayDate = now.getDate();
    const tomorrowDate = new Date(now.getTime() + 24*60*60*1000).getDate();

    const todayWeather = data.list.find(item => new Date(item.dt_txt).getDate() === todayDate);
    const tomorrowWeather = data.list.find(item => new Date(item.dt_txt).getDate() === tomorrowDate);

    if(todayWeather && tomorrowWeather){
      weatherEl.innerHTML =
        `Today: ${todayWeather.main.temp.toFixed(1)}℃ / ${todayWeather.weather[0].description}<br>` +
        `Tomorrow: ${tomorrowWeather.main.temp.toFixed(1)}℃ / ${tomorrowWeather.weather[0].description}`;
      weatherEl.style.textAlign = 'left'; // 天気は左寄せ
    } else {
      weatherEl.textContent = 'Weather info unavailable';
    }
  } catch(err) {
    weatherEl.textContent = 'Weather fetch failed';
    console.error(err);
  }
}
