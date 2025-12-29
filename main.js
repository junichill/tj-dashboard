function updateClock() {
  const now = new Date();

  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");

  document.getElementById("clock").textContent = `${h}:${m}`;
  document.getElementById("date").textContent =
    now.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
}

updateClock();
setInterval(updateClock, 1000);
