const URL = "https://www3.nhk.or.jp/news/easy/top-list.json";

fetch(URL)
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById("news-list");
    if (!list) return;

    list.innerHTML = "";

    data.slice(0, 5).forEach(item => {
      const li = document.createElement("li");
      li.textContent = item.title;
      list.appendChild(li);
    });
  })
  .catch(err => {
    const list = document.getElementById("news-list");
    if (list) list.innerHTML = "<li>NHKニュース取得失敗</li>";
  });
