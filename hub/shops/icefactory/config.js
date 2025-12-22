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
    phone: "+30 2610 335 415",
    email: "info@ice-factory.gr",
    maps: "",
    site: "https://ice-factory.gr/",
    instagram: "https://www.instagram.com/icefactorygr/",
    facebook: "",
    tiktok: "",
    efood: "",
    wolt: "",
    box: ""
  },

  buttons: [
    
    { id: "phone", enabled: true, order: 0 },
	{ id: "email", enabled: true, order: 1 },
   
    { id: "site", enabled: true, order: 2 },
    { id: "instagram", enabled: true, order: 3}
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
    title: "ICE FACTORY",
    message: "Η ΑΠΟΛΥΤΗ ΕΠΙΛΟΓΗ ΣΤΟΝ ΠΑΓΟ",
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
  shadow: "soft" // soft | strong
},


    background: {
      type: "solid", // solid | gradient | image
      color: "#728b9c",
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
  text: "#000000",
  radius: 14,
  border: { width: 2, color: "#00b4f1" }
},


    primary: {
      background: "#dcdcdc",
      backgroundOpacity: 0.8,
      text: "#ffffff"
    }
  }
  
};

