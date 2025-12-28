const params = new URLSearchParams(window.location.search);
const cardId = params.get("card");

const progress = document.getElementById("progress");
const counter = document.getElementById("counter");
const addBtn = document.getElementById("addCoffeeBtn");

const STAFF_TOKEN = localStorage.getItem("STAFF_TOKEN");

async function loadCard() {
  const res = await fetch(
    `https://YOUR-WORKER.workers.dev/api/card?card=${cardId}`
  );
  const data = await res.json();
  render(data.coffees, data.max);
}

function render(coffees, max) {
  progress.innerHTML = "";
  for (let i = 1; i <= max; i++) {
    const s = document.createElement("span");
    s.textContent = "☕";
    if (i <= coffees) s.classList.add("active");
    progress.appendChild(s);
  }
  counter.textContent = `Έχεις ${coffees} / ${max} καφέδες`;
}

if (STAFF_TOKEN) {
  addBtn.hidden = false;
  addBtn.onclick = async () => {
    const res = await fetch(
      "https://YOUR-WORKER.workers.dev/api/add-coffee",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + STAFF_TOKEN,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ card: cardId })
      }
    );

    if (res.status === 403) {
      alert("Λήξη login");
      localStorage.removeItem("STAFF_TOKEN");
      location.reload();
      return;
    }

    const data = await res.json();
    render(data.coffees, 6);
  };
}

loadCard();
