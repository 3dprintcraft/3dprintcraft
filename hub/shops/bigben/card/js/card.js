const params = new URLSearchParams(window.location.search);
const cardId = params.get("card");

const progress = document.getElementById("progress");
const counter = document.getElementById("counter");

async function loadCard() {
  const res = await fetch(
    `https://bigben-loyalty-api.XXXX.workers.dev/api/card?card=${cardId}`
  );
  const data = await res.json();

  progress.innerHTML = "";

  for (let i = 1; i <= data.max; i++) {
    const span = document.createElement("span");
    span.textContent = "☕";
    if (i <= data.coffees) span.classList.add("active");
    progress.appendChild(span);
  }

  counter.textContent = `Έχεις ${data.coffees} / ${data.max} καφέδες`;
}

loadCard();
