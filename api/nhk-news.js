import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const response = await fetch("https://www3.nhk.or.jp/news/easy/top-list.json");
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "NHKニュース取得失敗" });
  }
}
