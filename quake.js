const quakePanel = document.getElementById("quake-panel");
const quakeDiv = document.getElementById("quake");

function showQuake() {
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  quakePanel.classList.add("active");

  // 簡易サンプル。実際は気象庁地震速報JSONをfetchする
  quakeDiv.textContent = "最新地震: M4.5 東京湾 5分前";
}

setInterval(showQuake, 15000); // 15秒ごと切替
