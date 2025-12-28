// MOCK DATA (αργότερα έρχεται από backend)
const params = new URLSearchParams(window.location.search);
const cardId = params.get("card");

if (!cardId) {
  alert("Δεν βρέθηκε κάρτα");
}


const coffees = 3;
const maxCoffees = 6;
const isStaff = false; // αργότερα από token

const progressEl = document.getElementById("progress");
const counterEl = document.getElementById("counter");
const addBtn = document.getElementById("addCoffeeBtn");

// render progress
for (let i = 1; i <= maxCoffees; i++) {
  const span = document.createElement("span");
  span.textContent = "☕";
  if (i <= coffees) span.classList.add("active");
  progressEl.appendChild(span);
}

counterEl.textContent = `Έχεις ${coffees} / ${maxCoffees} καφέδες`;

// staff only
if (isStaff) {
  addBtn.hidden = false;
  addBtn.addEventListener("click", () => {
    alert("+1 καφές (mock)");
  });
}
