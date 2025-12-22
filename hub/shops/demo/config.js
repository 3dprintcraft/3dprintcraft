const CONFIG = {
  brand: {
    name: "Macao Café",
    slogan: "Ice • Coffee • Cocktails",
    hours: "Καθημερινά 07:00–23:00"
  },

  logo: {
    src: "/hub/assets/images/macao.svg",
    widthPercent: 28,
    maxWidth: 140,
    mode: "image"
  },

  links: {
    review: "https://g.page/r/XXXX",
    phone: "tel:+302610000000",
    maps: "https://maps.google.com/...",
    site: "https://macao.gr"
  },

  sticky: {
    enabled: true,
    text: "Αξιολόγησέ μας",
    url: "https://g.page/r/XXXX"
  },

  buttons: [
    { id: "review", enabled: true, order: 0 },
    { id: "phone", enabled: true, order: 1 },
    { id: "maps", enabled: true, order: 2 },
    { id: "site", enabled: true, order: 3 }
  ]
};
