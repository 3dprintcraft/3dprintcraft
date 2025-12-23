const CONFIG = {
	
	meta: {
  title: "ICE FACTORY",
  description: ""
},

	
  brand: {
    name: "",
    slogan: "",
    hours: ""
  },

  logo: {
    mode: "image", // image | text | none
    src: "/hub/shops/icefactory/icefactory.png",
    widthPercent: 100,
    maxWidth: 140
  },

  labels: {
    review: "Αξιολόγησέ μας στο Google",
  
    maps: "Τοποθεσία",
   
    deliveryTitle: "Delivery",
    efood: "efood",
    wolt: "Wolt",
    box: "BOX"
  },

  links: {
    review: "",
   
    maps: "",
    site: "https://ice-factory.gr/",
   
    wolt: "",
    box: ""
  },

  buttons: [
  {
    label: "Τηλέφωνο",
    url: "tel:+302610335415",
    icon: "phone",
    enabled: true,
    order: 0
  },
  {
    label: "Email",
    url: "mailto:info@ice-factory.gr",
    icon: "/hub/assets/images/email.svg",
    enabled: true,
    order: 1
  },
  {
    label: "Ιστοσελίδα",
    url: "https://ice-factory.gr/",
    icon: null,              // ⬅️ ΧΩΡΙΣ ΕΙΚΟΝΑ
    enabled: true,
    order: 2
  },
  {
    label: "Instagram",
    url: "https://www.instagram.com/icefactorygr/",
    icon: "instagram",
    enabled: true,
    order: 3
  }
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

	footer: {
  enabled: true,
  text: "",
  subtext: "Powered by 3DPrintCraft",
  align: "center",   // left | center | right
  color: "#94a3b8",  // διακριτικό γκρι
  size: "small"      // small | normal
}
,


  sticky: {
    enabled: false,
    text: "Άνοιγμα",
    url: "https://www.google.gr/",
    // προαιρετικό custom icon (inline SVG)
    // icon: "<svg ...></svg>"
  },

  popup: {
    enabled: true,
    show: "always", // once | always
    start: "",
    end: "",
    title: "Savilooooo",
    message: "Μπήκαμε λάθος?",
    closeLabel: "",
    ctaLabel: "Κλείσιμο"
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

panel: {
  background: {
    type: "solid", // solid | gradient
    color: "#ffffff",

   /* gradient: {
      direction: "135deg",
      from: "#ffffff",
      to: "#e6f6ff"
    }*/},

  radius: 24,
  shadow: "strong" // soft | strong
},


    background: {
      type: "solid", // solid | gradient | image
      color: "#d4e4e4",
      gradient: "linear-gradient(135deg,#ffffff,#f1f5f9)",
      image: {
        url: "",
        fallbackColor: "#ffffff"
      },
      overlay: "rgba(255,255,255,.72)"
    },

   buttons: {
  variant: "pill",
  background: "#f3f3f3",
  backgroundOpacity: 1,
  text: "#606161",
  radius: 30,
  border: { width: 2, color: "#00B5E2" }
},


    primary: {
      background: "#dcdcdc",
      backgroundOpacity: 0.8,
      text: "#ffffff"
    }
  }
  
};

