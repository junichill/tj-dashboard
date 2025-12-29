// serverless function for OpenWeatherMap
export default async function handler(req, res) {
  const CITY_ID = '1859140'; // 川崎市
  const API_KEY = process.env.OPENWEATHER_KEY; // Vercel Secretsに登録
  const url = `https://api.openweathermap.org/data/2.5/forecast?id=${CITY_ID}&appid=${API_KEY}&lang=ja&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: '天気取得失敗' });
  }
}
