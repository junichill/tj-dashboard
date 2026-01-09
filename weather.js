const apiKey = 'YOUR_API_KEY';  // OpenWeatherMap の API キー
const lat = '35.6895';  // 東京
const lon = '139.6917';

fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`)
  .then(res => res.json())
  .then(data => {
    const iconCode = data.weather[0].icon;
    const desc = data.weather[0].description;
    const temp = Math.round(data.main.temp);

    document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    document.getElementById('weather-desc').textContent = `${desc} ${temp}℃`;
  })
  .catch(err => {
    console.error('天気情報取得失敗', err);
    document.getElementById('weather-desc').textContent = '天気情報取得失敗';
  });
