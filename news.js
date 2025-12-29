const NEWS_URL =
  "https://www3.nhk.or.jp/news/easy/top-list.json";

fetch(NEWS_URL)
  .then((res) => res.json())
  .then((data) => {
    const list = document.getElementById("news-list");
    list.innerHTML = "";

    data.slice(0, 5).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item.title;
      list.appendChild(li);
    });
  })
  .catch(() => {
    document.getElementById("news-list").innerHTML =
      "<li>ニュース取得失敗</li>";
  });
