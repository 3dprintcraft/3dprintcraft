document.addEventListener("DOMContentLoaded", () => {

  const params = new URLSearchParams(window.location.search);
  const cardId = params.get("card");

  if (!cardId) {
    alert("Δεν βρέθηκε κάρτα");
    return;
  }

  const progress = document.getElementById("progress");
  const counter = document.getElementById("counter");
  const addBtn = document.getElementById("addCoffeeBtn");

  const STAFF_TOKEN = localStorage.getItem("STAFF_TOKEN");

  // =========================
  // LOAD CARD STATUS
  // =========================
  async function loadCard() {
    const res = await fetch(
      `https://bigbenloyalty.contactprintcraft3d.workers.dev/api/card?card=${cardId}`
    );

    if (!res.ok) {
      counter.textContent = "Σφάλμα φόρτωσης κάρτας";
      return;
    }

    const data = await res.json();
    render(data.coffees, data.max);
  }

  // =========================
  // RENDER UI
  // =========================
  function render(coffees, max) {
    progress.innerHTML = "";

    for (let i = 1; i <= max; i++) {
      const span = document.createElement("span");
      span.textContent = "☕";
      if (i <= coffees) span.classList.add("active");
      progress.appendChild(span);
    }

    counter.textContent = `Έχεις ${coffees} / ${max} καφέδες`;
  }

  // =========================
  // STAFF ONLY (+1 COFFEE)
  // =========================
  if (STAFF_TOKEN && addBtn) {
    addBtn.hidden = false;

    addBtn.addEventListener("click", async () => {
      const res = await fetch(
        "https://bigbenloyalty.contactprintcraft3d.workers.dev/api/add-coffee",
        {  { cache: "no-store" }
          method: "POST",
          headers: {
            "Authorization": "Bearer " + STAFF_TOKEN,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ card: cardId })
        }
      );

      if (res.status === 403) {
        alert("Έληξε το staff login");
        localStorage.removeItem("STAFF_TOKEN");
        location.reload();
        return;
      }

      const data = await res.json();
      render(data.coffees, 6);
    });
  }

  loadCard();
});
