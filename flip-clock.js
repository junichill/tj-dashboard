function createDigit(el, value) {
  el.innerHTML = `
    <div class="card current">
      <div class="upper"><span>${value}</span></div>
      <div class="lower"><span>${value}</span></div>
    </div>
    <div class="card next">
      <div class="upper"><span></span></div>
      <div class="lower"><span></span></div>
    </div>
  `;
}

function flip(el, nextValue) {
  const current = el.querySelector(".card.current");
  const next = el.querySelector(".card.next");

  next.querySelector(".upper span").textContent = nextValue;
  next.querySelector(".lower span").textContent = nextValue;

  current.querySelector(".upper").classList.add("flip-upper");
  next.querySelector(".lower").classList.add("flip-lower");

  setTimeout(() => {
    createDigit(el, nextValue);
  }, 400);
}

const digits = document.querySelectorAll(".digit");

// 初期化
digits.forEach(d => createDigit(d, 0));

setInterval(() => {
  const sec = new Date().getSeconds();
  const tens = Math.floor(sec / 10);
  const ones = sec % 10;

  flip(digits[0], tens);
  flip(digits[1], ones);
}, 1000);
