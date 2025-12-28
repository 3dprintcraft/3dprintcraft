const coffees = 3;
const max = 6;

const progress = document.getElementById("progress");
const counter = document.getElementById("counter");

for (let i = 1; i <= max; i++) {
  const span = document.createElement("span");
  span.textContent = "☕";
  if (i <= coffees) span.classList.add("active");
  progress.appendChild(span);
}

counter.textContent = `Έχεις ${coffees} / ${max} καφέδες`;
