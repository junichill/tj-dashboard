const URL = "/api/nhk-news"; // サーバー経由でNHKニュース取得

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
    console.error(err);
  });
