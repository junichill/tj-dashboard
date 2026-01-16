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

  const currentValue =
    current.querySelector(".upper span").textContent;

  if (currentValue === String(nextValue)) return;

  next.querySelector(".upper span").textContent = nextValue;
  next.querySelector(".lower span").textContent = nextValue;

  current.querySelector(".upper").classList.add("flip-upper");
  next.querySelector(".lower").classList.add("flip-lower");

  setTimeout(() => {
    createDigit(el, nextValue);
  }, 400);
}

const ids = ["h1","h2","m1","m2","s1","s2"];
const digits = ids.map(id => document.getElementById(id));

digits.forEach(d => createDigit(d, 0));

function updateClock() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2,"0");
  const m = now.getMinutes().toString().padStart(2,"0");
  const s = now.getSeconds().toString().padStart(2,"0");

  const values = [...h, ...m, ...s];

  values.forEach((v, i) => flip(digits[i], v));
}

updateClock();
setInterval(updateClock, 1000);
