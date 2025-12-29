function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit"
  });
  document.getElementById("clock").textContent = time;
}

updateClock();
setInterval(updateClock, 1000);
