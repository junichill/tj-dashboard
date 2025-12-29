const weatherPanel = document.getElementById("weather-panel");
const weatherDiv = document.getElementById("weather");

function showWeather() {
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  weatherPanel.classList.add("active");

  // 簡易サンプル。実際は気象庁APIやOpenWeatherMapのJSONをfetchする
  weatherDiv.textContent = "東京: 晴れ 23℃ 湿度50%";
}

setInterval(showWeather, 15000); // 15秒ごと切替
