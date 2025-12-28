document.addEventListener("DOMContentLoaded", () => {
renderSkeleton(6);

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

  function renderSkeleton(max = 6) {
  progress.innerHTML = "";

  for (let i = 1; i <= max; i++) {
    const span = document.createElement("span");
    span.textContent = "☕";
    span.style.opacity = "0.15";
    progress.appendChild(span);
  }

  counter.textContent = "Φόρτωση...";
  
}

loadCard();
  // =========================
  // LOAD CARD STATUS
  // =========================
  async function loadCard() {
  const ts = Date.now();

  const controller = new AbortController();
  setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(
      `https://bigbenloyalty.contactprintcraft3d.workers.dev/api/card?card=${cardId}&t=${ts}`,
      {
        cache: "no-store",
        signal: controller.signal
      }
    );

    if (!res.ok) {
      counter.textContent = "Σφάλμα φόρτωσης";
      return;
    }

    const data = await res.json();
    render(data.coffees, data.max);
  } catch {
    counter.textContent = "Δοκίμασε ξανά";
  }
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
