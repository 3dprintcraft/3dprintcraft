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
  // LOAD CARD STATUS
  // =========================
  async function loadCard() {
  const ts = Date.now();



  try {
    const res = await fetch(
      `https://bigbenloyalty.contactprintcraft3d.workers.dev/api/card?card=${cardId}&t=${ts}`,
      {
        cache: "no-store",
        
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


  renderSkeleton(6);
  loadCard();

  // =========================
  // RENDER UI
  // =========================

  // =========================
  // STAFF ONLY (+1 COFFEE)
  // =========================
 // STAFF
  if (STAFF_TOKEN && addBtn) {
    addBtn.hidden = false;

    addBtn.onclick = async () => {
      addBtn.disabled = true;

      const res = await fetch(
        "https://bigbenloyalty.contactprintcraft3d.workers.dev/api/add-coffee",
        {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + STAFF_TOKEN,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ card: cardId }),
          cache: "no-store"
        }
      );

      addBtn.disabled = false;

      if (!res.ok) {
        alert("Σφάλμα προσθήκης καφέ");
        return;
      }

      const data = await res.json();
      render(data.coffees, 6);
    };
  }
});