window.CONFIG = {
	
	meta: {
  title: "MILU",
  description: "milu.is.attitude",
  ogTitle: "MILU",
  ogDescription: "milu.is.attitude",
  ogImage: "/hub/shops/icefactory/milu.jpg",
  ogSiteName: "Milu",
  twitterCard: "summary_large_image"
},

	
  brand: {
    name: "",
    slogan: "@milu.is.attitude",
    hours: ""
  },

  logo: {
    mode: "image", // image | text | none
    src: "/hub/shops/milu/milu.jpg",
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
   icon: {
      file: "/hub/assets/icons/email1.svg"
    },
    enabled: true,
    order: 1
  },
  {
    label: "Ιστοσελίδα",
    url: "https://ice-factory.gr/",
     icon: {
      file: "/hub/assets/icons/website.svg"
    },
    enabled: true,
    order: 2
  },
  {
    label: "Instagram",
    url: "https://www.instagram.com/icefactorygr/",
    icon: {
      file: "/hub/assets/icons/instagram.svg"
    },
    enabled: true,
    order: 3
  },
  {
    label: "Χάρτης",
    url: "https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=/maps/place//data%3D!4m2!3m1!1s0x135e372d7f6ecd67:0xd26c3d7796457646%3Fsa%3DX%26ved%3D1t:8290%26ictx%3D111&ved=2ahUKEwjfxoGb69aRAxWmQPEDHX-QKJ4Q4kB6BAgjEAM&usg=AOvVaw2F3TfqVXky5c6iOc2AH5qm",
    icon: {
      file: "/hub/assets/icons/maps.svg"
    },
    enabled: true,
    order: 4
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
    enabled: false,
    show: "once", // once | always
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
    color: "#F3C091",

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
  text: "#75655A",
  radius: 30,
  border: { width: 2, color: "#75655A" }
},


    primary: {
      background: "#dcdcdc",
      backgroundOpacity: 0.8,
      text: "#ffffff"
    }
  }
  
};

