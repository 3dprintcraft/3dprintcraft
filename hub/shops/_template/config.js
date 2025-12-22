const CONFIG = {
	
	meta: {
  title: "3DPrintCraft",
  description: ""
}


  brand: {
    name: "SHOP NAME",
    slogan: "Mini description / tagline",
    hours: "Καθημερινά 07:00–23:00"
  },

  logo: {
    mode: "image", // image | text | none
    src: "/hub/assets/images/logo.svg",
    widthPercent: 28,
    maxWidth: 140
  },

  labels: {
    review: "Αξιολόγησέ μας στο Google",
    phone: "Τηλέφωνο",
    email: "Email",
    maps: "Τοποθεσία",
    site: "Ιστοσελίδα",
    deliveryTitle: "Delivery",
    efood: "efood",
    wolt: "Wolt",
    box: "BOX"
  },

  links: {
    review: "",
    phone: "",
    email: "",
    maps: "",
    site: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    efood: "",
    wolt: "",
    box: ""
  },

  buttons: [
    { id: "review", enabled: true, order: 0 },
    { id: "phone", enabled: true, order: 1 },
    { id: "maps", enabled: true, order: 2 },
    { id: "site", enabled: true, order: 3 },
    { id: "instagram", enabled: false, order: 4 }
  ],

  /* EXTRA LINKS (custom icons) */
  extraLinks: [
    // Παράδειγμα:
    // {
    //   label: "Menu PDF",
    //   url: "/menu.pdf",
    //   enabled: true,
    //   order: 50,
    //   icon: { file: "/hub/assets/icons/custom/menu.svg" }
    // }
  ],

  sticky: {
    enabled: false,
    text: "Άνοιγμα",
    url: "",
    // προαιρετικό custom icon (inline SVG)
    // icon: "<svg ...></svg>"
  },

  popup: {
    enabled: true,
    show: "once", // once | always
    start: "",
    end: "",
    title: "Προσφορά",
    message: "−10% σε όλα τα ροφήματα",
    closeLabel: "Κλείσιμο",
    ctaLabel: "ΟΚ"
  },

  theme: {
    typography: {
      googleFont: "Inter",
      cssFamily: "'Inter', system-ui, -apple-system, Segoe UI, Roboto, Arial",
      weights: [400,600,700],
      weightBase: 400,
      weightStrong: 700,
      h1Size: 32,
      bodySize: 16
    },

    background: {
      type: "solid", // solid | gradient | image
      color: "#ffffff",
      gradient: "linear-gradient(135deg,#ffffff,#f1f5f9)",
      image: {
        url: "",
        fallbackColor: "#ffffff"
      },
      overlay: "rgba(255,255,255,.72)"
    },
buttons: {
  variant: "outline",   // ⬅️ ΟΧΙ filled
  background: "#ffffff",
  backgroundOpacity: 0,
  text: "#111827",
  radius: 14,
  border: { width: 2, color: "#00b4f1" }
},


    primary: {
      background: "#111827",
      backgroundOpacity: 1,
      text: "#ffffff"
    }
  }
};
