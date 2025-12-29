function updateClock() {
  const now = new Date();

  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");

  document.getElementById("clock").textContent = `${hh}:${mm}`;

  const dateText = now.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  document.getElementById("date").textContent = dateText;
}

updateClock();
setInterval(updateClock, 1000);
