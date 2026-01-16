const digit = document.getElementById("digit");
const upper = digit.querySelector(".upper span");
const lower = digit.querySelector(".lower span");

let current = 0;

function flipTo(next) {
  const upperDiv = digit.querySelector(".upper");
  const lowerDiv = digit.querySelector(".lower");

  // 上パネル：現在値
  upper.textContent = current;
  upperDiv.classList.add("flip-upper");

  // 下パネル：次の値
  setTimeout(() => {
    lower.textContent = next;
    lowerDiv.classList.add("flip-lower");
  }, 150);

  // アニメーション終了後に確定
  setTimeout(() => {
    upper.textContent = next;
    lower.textContent = next;
    upperDiv.classList.remove("flip-upper");
    lowerDiv.classList.remove("flip-lower");
    current = next;
  }, 350);
}

// デモ用（1秒ごとに加算）
setInterval(() => {
  const next = (current + 1) % 10;
  flipTo(next);
}, 1000);
