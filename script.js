function updateFlip(unitId, value) {
  const unit = document.getElementById(unitId);
  const top = unit.querySelector('.top');
  const bottom = unit.querySelector('.bottom');
  const flip = unit.querySelector('.flip');

  const currentValue = parseInt(top.textContent);
  if(currentValue === value) return;

  flip.innerHTML = `<div class="flip-top">${currentValue}</div><div class="flip-bottom">${value}</div>`;
  flip.style.transform = 'rotateX(0deg)';
  flip.style.transition = 'transform 0.6s ease-in-out';
  requestAnimationFrame(() => {
    flip.style.transform = 'rotateX(-180deg)';
  });

  setTimeout(() => {
    top.textContent = value.toString().padStart(2,'0');
    bottom.textContent = value.toString().padStart(2,'0');
    flip.style.transition = 'none';
    flip.style.transform = 'rotateX(0deg)';
    flip.innerHTML = '';
  }, 600);
}

function updateClock() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();

  updateFlip('hours', h);
  updateFlip('minutes', m);
  updateFlip('seconds', s);
}

setInterval(updateClock, 1000);
updateClock();
