(function () {
  const params = new URLSearchParams(window.location.search);
  const shop = params.get("shop") || "demo";

  const script = document.createElement("script");
  script.src = `/hub/shops/${shop}/config.js`;
  script.onload = () => init(CONFIG);
  script.onerror = () => {
    document.body.innerHTML = "Shop not found";
  };
  document.head.appendChild(script);

  function init(CONFIG) {
    document.title = CONFIG.brand.name;

    document.getElementById("shop-name").textContent = CONFIG.brand.name;
    document.getElementById("shop-slogan").textContent = CONFIG.brand.slogan;
    document.getElementById("shop-hours").textContent = CONFIG.brand.hours;

    // Logo
    const logoContainer = document.getElementById("logo-container");
    if (CONFIG.logo?.mode === "image") {
      const img = document.createElement("img");
      img.src = CONFIG.logo.src;
      img.style.width = CONFIG.logo.widthPercent + "%";
      img.style.maxWidth = CONFIG.logo.maxWidth + "px";
      logoContainer.appendChild(img);
    }

    // Primary Google Review
    const primary = CONFIG.buttons.find(b => b.id === "review" && b.enabled);
    if (primary && CONFIG.links.review) {
      const a = document.createElement("a");
      a.href = CONFIG.links.review;
      a.textContent = "Αξιολόγησέ μας στο Google";
      document.getElementById("primary-action").appendChild(a);
    }

    // Other buttons
    const map = {
      phone: ["Τηλέφωνο", CONFIG.links.phone],
      maps: ["Τοποθεσία", CONFIG.links.maps],
      site: ["Ιστοσελίδα", CONFIG.links.site]
    };

    CONFIG.buttons
      .filter(b => b.enabled && b.id !== "review")
      .sort((a,b) => a.order - b.order)
      .forEach(b => {
        const def = map[b.id];
        if (!def || !def[1]) return;
        const a = document.createElement("a");
        a.href = def[1];
        a.textContent = def[0];
        document.getElementById("actions").appendChild(a);
      });

    // Sticky
    if (CONFIG.sticky?.enabled) {
      const s = document.createElement("a");
      s.href = CONFIG.sticky.url;
      s.textContent = CONFIG.sticky.text;
      document.getElementById("sticky").appendChild(s);
    }
  }
})();
