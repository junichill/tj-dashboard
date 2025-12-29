function updateClock() {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const clockEl = document.getElementById("clock");
  const dateEl = document.getElementById("date");

  if (clockEl) {
    clockEl.textContent = `${hours}:${minutes}`;
  }

  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short"
    });
  }
}

updateClock();
setInterval(updateClock, 1000);
