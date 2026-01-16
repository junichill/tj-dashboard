class FlipDigit {
constructor(el) {
this.el = el;
this.value = "0";


el.innerHTML = `
<div class="upper"><span>0</span></div>
<div class="lower"><span>0</span></div>
`;


this.upper = el.querySelector('.upper span');
this.lower = el.querySelector('.lower span');
}


flip(next) {
if (this.value === next) return;


this.upper.textContent = this.value;
this.lower.textContent = next;


this.el.classList.remove('flip');
void this.el.offsetWidth; // 強制reflow
this.el.classList.add('flip');


this.value = next;
}
}


const ids = ['h1','h2','m1','m2','s1','s2'];
const digits = ids.map(id => new FlipDigit(document.getElementById(id)));


function updateClock() {
const now = new Date();
const timeStr =
now.getHours().toString().padStart(2,'0') +
now.getMinutes().toString().padStart(2,'0') +
now.getSeconds().toString().padStart(2,'0');


[...timeStr].forEach((v, i) => digits[i].flip(v));
}


updateClock();
setInterval(updateClock, 1000);
