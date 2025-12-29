const URL = "https://api.allorigins.win/get?url=" +
            encodeURIComponent("https://news.web.nhk/n-data/conf/na/rss/cat0.xml");

fetch(URL)
  .then(res => res.json())
  .then(data => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(data.contents, "application/xml");
    const items = xml.querySelectorAll("item");

    const list = document.getElementById("news-list");
    if (!list) return;

    list.innerHTML = "";

    items.forEach((item, i) => {
      if (i >= 5) return; // 先頭5件だけ表示
      const title = item.querySelector("title").textContent;
      const li = document.createElement("li");
      li.textContent = title;
      list.appendChild(li);
    });
  })
  .catch(err => {
    const list = document.getElementById("news-list");
    if (list) list.innerHTML = "<li>NHKニュース取得失敗</li>";
    console.error(err);
  });
