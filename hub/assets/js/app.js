
function hexToRgb(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = hex.split("").map(c => c + c).join("");
  }
  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}




(function(){
  const qs = new URLSearchParams(location.search);
  const shop = qs.get("shop") || "demo";

  // Load config as JSON instead of script to avoid execution issues
  fetch(`/hub/shops/${shop}/config.js`)
    .then(resp => {
      if (!resp.ok) throw new Error('Config not found');
      return resp.text();
    })
    .then(text => {
      // Execute the text as JS to set window.CONFIG
      const script = document.createElement('script');
      script.textContent = text;
      document.head.appendChild(script);
      // Wait a bit for execution
      setTimeout(async () => {
        if (!window.CONFIG) throw new Error('CONFIG not set');
        console.log('Config loaded, CONFIG:', window.CONFIG);
        try { 
          await init(window.CONFIG); 
          console.log('Init completed');
        } catch(e) { 
          console.error('Init error:', e);
          document.body.innerHTML = "<p style='padding:20px'>⚠️ Error: " + e.message + "</p>"; 
        }
      }, 10);
    })
    .catch(e => {
      console.error('Config load error:', e);
      document.body.innerHTML = "Shop not found";
    });

  const ICONS = {
    review: svgStar(),
    phone: svgPhone(),
    email: svgMail(),
    maps: svgPin(),
    site: svgGlobe(),
    instagram: svgInstagram(),
    facebook: svgFacebook(),
    tiktok: svgTikTok(),
    efood: svgBag(),
    wolt: svgScooter(),
    box: svgBox()
  };

function applyPanel(C){
	

  const root = document.documentElement;

  const panel = C.theme?.panel || {};

  const bg = panel.background || {};

  // background
  if(bg.type === "solid" && bg.color){
    root.style.setProperty("--panel-bg", bg.color);
  }

  if(bg.type === "gradient" && bg.gradient){
    const g = bg.gradient;
    if(g.direction && g.from && g.to){
      root.style.setProperty(
        "--panel-bg",
        `linear-gradient(${g.direction}, ${g.from}, ${g.to})`
      );
    }
  }

  // radius
  if(typeof panel.radius === "number"){
    root.style.setProperty("--panel-radius", panel.radius + "px");
  }

  // shadow
  if(panel.shadow){
    root.style.setProperty(
      "--panel-shadow",
      panel.shadow === "strong"
        ? "0 30px 80px rgba(0,0,0,.25)"
        : "0 20px 50px rgba(0,0,0,.12)"
    );
  }
}




  async function init(C){
	  
	 

	  
	document.title =
    C.meta?.title ||
    C.brand?.name ||
    "3DPrintCraft";
    
    // Add meta tags for link previews
    const addMeta = (property, content) => {
      if (!content) return;
      const m = document.createElement('meta');
      m.setAttribute('property', property);
      m.content = content;
      document.head.appendChild(m);
    };
    const imageUrl = C.meta?.ogImage ? location.origin + C.meta.ogImage : (C.logo?.src ? location.origin + C.logo.src : '');
    addMeta('og:title', C.meta?.ogTitle || C.meta?.title || C.brand?.name);
    addMeta('og:description', C.meta?.ogDescription || C.meta?.description || C.brand?.slogan);
    addMeta('og:image', imageUrl);
    addMeta('og:url', location.href);
    addMeta('og:type', 'website');
    addMeta('og:site_name', C.meta?.ogSiteName || C.brand?.name || '3DPrintCraft');
    addMeta('twitter:card', C.meta?.twitterCard || 'summary_large_image');
    addMeta('twitter:title', C.meta?.ogTitle || C.meta?.title || C.brand?.name);
    addMeta('twitter:description', C.meta?.ogDescription || C.meta?.description || C.brand?.slogan);
    addMeta('twitter:image', imageUrl);
    
    // Also add standard meta description
    const descMeta = document.createElement('meta');
    descMeta.name = 'description';
    descMeta.content = C.meta?.description || C.brand?.slogan || '';
    if (descMeta.content) document.head.appendChild(descMeta);
    
    applyTypography(C);
    applyBackground(C);
	 applyPanel(C);
    applyButtonsTheme(C);
	

    setText("shop-name", C.brand?.name);
    setText("shop-slogan", C.brand?.slogan);
    setText("shop-hours", C.brand?.hours);

    // Apply custom fonts for brand elements
    if (C.brand?.fonts?.name) {
      document.getElementById('shop-name').style.fontFamily = `'${C.brand.fonts.name}'`;
      console.log('Setting font for shop-name:', `'${C.brand.fonts.name}'`);
    }
    if (C.brand?.fonts?.slogan) document.getElementById('shop-slogan').style.fontFamily = `'${C.brand.fonts.slogan}'`;
    if (C.brand?.fonts?.hours) document.getElementById('shop-hours').style.fontFamily = `'${C.brand.fonts.hours}'`;

    renderLogo(C);
    renderPrimary(C);
    await renderButtons(C);
    renderDelivery(C);
    renderSticky(C);
    maybePopup(C);
	renderFooter(C);

	
	const hasTitle = !!C.brand?.name?.trim();
const hasSlogan = !!C.brand?.slogan?.trim();
const hasHours = !!C.brand?.hours?.trim();

if (!hasTitle && !hasSlogan && !hasHours) {
  document.querySelector(".card.header")?.classList.add("header--logo-only");
}

  }

  function setText(id, v){
  const e = document.getElementById(id);
  if (!e) return;

  if (!v || v.trim() === "") {
    e.style.display = "none";
  } else {
    e.textContent = v;
    e.style.display = "";
  }
}

  function renderLogo(C){
    const el = document.getElementById("logo-container");
    el.innerHTML="";
    const l=C.logo||{};
    if(l.mode==="none") return;
    if(l.mode==="text"){ el.textContent=C.brand?.name||""; return; }
    if(l.src){
      const i=document.createElement("img");
      i.src=l.src; i.style.width=(l.widthPercent??28)+"%"; i.style.maxWidth=(l.maxWidth??140)+"px";
      el.appendChild(i);
    }
  }

function mkBtn({ label, url, variant = "outline", icon, primary = false }) {
  const a = document.createElement("a");
  a.href = url;
  a.className = "btn";

  if (variant === "pill") {
    a.classList.add("btn-pill-brand");
  } else {
    if (primary) a.classList.add("btn--primary");
    if (variant === "outline") a.classList.add("btn--outline");
    if (variant === "soft") a.classList.add("btn--soft");
  }

  // icon (προαιρετικό)
  if (icon) {
    const s = document.createElement("span");
    s.className = "btn-icon";
    s.innerHTML = icon;
    a.appendChild(s);
  } else {
    a.classList.add("no-icon");
  }

  const t = document.createElement("span");
  t.className = "btn-label";
  t.textContent = label;
  a.appendChild(t);

  return a;
}


  function renderPrimary(C){
    const wrap=document.getElementById("primary-action"); wrap.innerHTML="";
    if(!C.links?.review) return;
    wrap.appendChild(mkBtn({
      label:C.labels?.review||"Αξιολόγησέ μας στο Google",
      url:C.links.review,
      icon: ICONS.review,
      primary:true
    }));
  }

 async function renderButtons(C){
  const wrap = document.getElementById("actions");
  wrap.innerHTML = "";

  const variant = C.theme?.buttons?.variant || "outline";

  const buttons = (C.buttons || [])
    .filter(b => b.enabled && b.url)
    .sort((a,b)=>(a.order ?? 999)-(b.order ?? 999));

  for (const b of buttons) {
    let iconSvg = "";
    if (b.icon && ICONS[b.icon]) {
      iconSvg = ICONS[b.icon];
    }

    const a = mkBtn({ label: b.label, url: b.url, variant, icon: iconSvg || null });
    wrap.appendChild(a);

    if (b.icon && b.icon.file) {
      try {
        const resp = await fetch(b.icon.file);
        if (!resp.ok) throw new Error('fetch failed');
        let svg = await resp.text();
        if (!svg.includes('<svg')) throw new Error('not svg');
        svg = svg.replace(/<\?xml[^>]*>/g, '').trim();
        svg = svg.replace(/\s(width|height)="[^"]*"/g, '');
        svg = svg.replace(/(stroke|fill)="[^"]*"/g, '$1="currentColor"');

        let s = a.querySelector('.btn-icon');
        if (!s) {
          s = document.createElement('span');
          s.className = 'btn-icon';
          a.classList.remove('no-icon');
          a.insertBefore(s, a.firstChild);
        }
        s.innerHTML = svg;
      } catch (err) {
        let s = a.querySelector('.btn-icon');
        if (!s) {
          s = document.createElement('span');
          s.className = 'btn-icon';
          a.classList.remove('no-icon');
          a.insertBefore(s, a.firstChild);
        }
        s.innerHTML = `<img src="${b.icon.file}" alt="" />`;
      }
    }
  }
}



  function renderDelivery(C){
    const wrap=document.getElementById("delivery-section"); wrap.innerHTML="";
    const items=[
      {l:C.labels?.efood||"efood", u:C.links?.efood, i:ICONS.efood},
      {l:C.labels?.wolt||"Wolt", u:C.links?.wolt, i:ICONS.wolt},
      {l:C.labels?.box||"BOX", u:C.links?.box, i:ICONS.box}
    ].filter(x=>x.u);
    if(!items.length){ wrap.style.display="none"; return; }
    wrap.style.display="block";
    const h=document.createElement("div"); h.className="section-title"; h.textContent=C.labels?.deliveryTitle||"Delivery";
    wrap.appendChild(h);
    const v=C.theme?.buttons?.variant||"outline";
    items.forEach(it=>wrap.appendChild(mkBtn({label:it.l,url:it.u,variant:v,icon:it.i})));
  }

  function renderSticky(C){
    const s=document.getElementById("sticky"); s.innerHTML="";
    if(!C.sticky?.enabled||!C.sticky?.url) return;
    const a=document.createElement("a"); a.href=C.sticky.url; a.className="sticky-btn";
    a.innerHTML = (C.sticky.icon?`<span class="icon">${C.sticky.icon}</span>`:"") + `<span>${C.sticky.text||"Άνοιγμα"}</span>`;
    s.appendChild(a);
  }

  function applyTypography(C){
    const t=C.theme?.typography; if(!t) return;
    const fonts = new Set();
    if (t.googleFont) fonts.add(t.googleFont);
    if (C.brand?.fonts?.name) fonts.add(C.brand.fonts.name);
    if (C.brand?.fonts?.slogan) fonts.add(C.brand.fonts.slogan);
    if (C.brand?.fonts?.hours) fonts.add(C.brand.fonts.hours);
    const w = (t.weights || []).join(";");
    for (const f of fonts) {
      const href = `http://fonts.googleapis.com/css2?family=${encodeURIComponent(f)}:wght@${w}&display=block`;
      if (!document.querySelector(`link[href="${href}"]`)) {
        const l = document.createElement("link");
        l.rel = "stylesheet";
        l.href = href;
        document.head.appendChild(l);
      }
    }
    const r=document.documentElement;
    t.cssFamily && r.style.setProperty("--font-family", t.cssFamily);
    t.weightBase!=null && r.style.setProperty("--font-weight-base", t.weightBase);
    t.weightStrong!=null && r.style.setProperty("--font-weight-strong", t.weightStrong);
    t.h1Size!=null && r.style.setProperty("--h1-size", t.h1Size+"px");
    t.bodySize!=null && r.style.setProperty("--body-size", t.bodySize+"px");
  }

  function applyBackground(C){
    const b=C.theme?.background; if(!b) return;
    if(b.overlay) document.documentElement.style.setProperty("--bg-overlay", b.overlay);
    if(b.type==="gradient" && b.gradient){ document.body.style.backgroundImage=b.gradient; return; }
    if(b.type==="image" && b.image?.url){
      document.body.style.backgroundImage=`url("${b.image.url}")`;
      document.body.style.backgroundColor=b.image.fallbackColor||"#fff";
      return;
    }
    document.body.style.backgroundImage="none";
    document.body.style.backgroundColor=b.color||"#fff";
  }

  function applyButtonsTheme(C) {
  const t = C.theme?.buttons;
  if (!t) return;

  const r = document.documentElement;

  if (t.background) {
    const { r: rr, g, b } = hexToRgb(t.background);
    r.style.setProperty("--btn-bg-rgb", `${rr}, ${g}, ${b}`);
  }

  if (typeof t.backgroundOpacity === "number") {
    r.style.setProperty("--btn-bg-alpha", t.backgroundOpacity);
  }

  if (t.text) {
    r.style.setProperty("--btn-text", t.text);
  }

  if (t.radius) {
    r.style.setProperty("--btn-radius", t.radius + "px");
  }

  if (t.border?.width !== undefined) {
    r.style.setProperty("--btn-border-width", t.border.width + "px");
  }

  if (t.border?.color) {
    r.style.setProperty("--btn-border-color", t.border.color);
  }
}


  function maybePopup(C){
    const p=C.popup; if(!p?.enabled) return;
    const now=new Date();
    if(p.start && now<new Date(p.start+"T00:00:00")) return;
    if(p.end && now>new Date(p.end+"T23:59:59")) return;
    const k=`hub_popup_seen_${shop}`;
    if(p.show==="once" && localStorage.getItem(k)==="1") return;
    const root=document.getElementById("popup-root");
   root.innerHTML = `
  <div class="popup-backdrop">
    <div class="popup-card">
      ${p.title ? `<div class="popup-title">${p.title}</div>` : ``}
      ${p.message ? `<div class="popup-message">${p.message}</div>` : ``}

      <div class="popup-actions">
        ${p.closeLabel ? `<button class="popup-btn popup-close">${p.closeLabel}</button>` : ``}
        ${p.ctaLabel ? `<button class="popup-btn popup-cta">${p.ctaLabel}</button>` : ``}
      </div>
    </div>
  </div>`;
const closeBtn = root.querySelector(".popup-close");
const ctaBtn = root.querySelector(".popup-cta");

if (closeBtn) closeBtn.onclick = close;
if (ctaBtn) ctaBtn.onclick = close;

    root.querySelector(".popup-backdrop").onclick=e=>{ if(e.target.classList.contains("popup-backdrop")) close(); };
    function close(){ root.innerHTML=""; localStorage.setItem(k,"1"); }
  }
  
  
  function renderFooter(C){
  const f = document.querySelector(".footer");
  if (!f || !C.footer?.enabled) {
    if (f) f.style.display = "none";
    return;
  }

  f.style.display = "block";
  f.style.textAlign = C.footer.align || "center";
  f.style.color = C.footer.color || "#94a3b8";
  f.className = "footer footer--" + (C.footer.size || "small");

  f.innerHTML = `
    ${C.footer.text ? `<div class="footer-main">${C.footer.text}</div>` : ``}
    ${C.footer.subtext ? `<div class="footer-sub">${C.footer.subtext}</div>` : ``}
  `;
}


  function fetchIcon(file){
    // simple fallback: return an <img> for external SVG files
    // (keeps implementation synchronous; could be enhanced to inline-load SVG for color inheritance)
    return `<img src="${file}" alt="" />`;
  }

  /* --- SVG ICONS (inline, color inherits) --- */
  function svgStar(){return `<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6 6.6.6-5 4.3 1.5 6.5L12 16.7 6 19.4l1.5-6.5-5-4.3 6.6-.6z"/></svg>`}
  function svgPhone(){return `<svg viewBox="0 0 24 24"><path d="M6.6 10.8c1.5 3 3.6 5.1 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.2 1 .3 2.1.5 3.2.5.7 0 1.2.5 1.2 1.2V21c0 .7-.5 1.2-1.2 1.2C9.4 22.2 1.8 14.6 1.8 4.2 1.8 3.5 2.3 3 3 3h3.4c.7 0 1.2.5 1.2 1.2 0 1.1.2 2.2.5 3.2.1.4 0 .9-.3 1.2l-2.2 2.2z"/></svg>`}
  function svgMail(){return `<svg viewBox="0 0 24 24"><path d="M2 4h20v16H2z"/><path fill="#fff" d="M2 6l10 7 10-7"/></svg>`}
  function svgPin(){return `<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 00-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 00-7-7z"/></svg>`}
  function svgGlobe(){return `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path fill="#fff" d="M2 12h20M12 2v20"/></svg>`}
  function svgInstagram(){return `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle fill="#fff" cx="12" cy="12" r="4"/><circle fill="#fff" cx="17.5" cy="6.5" r="1"/></svg>`}
  function svgFacebook(){return `<svg viewBox="0 0 24 24"><path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v3H8v3h3v6h3v-6h3l1-3h-4V9z"/></svg>`}
  function svgTikTok(){return `<svg viewBox="0 0 24 24"><path d="M16 3c.6 1.7 2 3 3.7 3.4V10c-1.7-.1-3.3-.7-4.7-1.7V15a5 5 0 11-5-5v3a2 2 0 102 2V3h4z"/></svg>`}
  function svgBag(){return `<svg viewBox="0 0 24 24"><path d="M6 7h12l-1 14H7L6 7z"/><path fill="#fff" d="M9 7a3 3 0 016 0"/></svg>`}
  function svgScooter(){return `<svg viewBox="0 0 24 24"><circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><path d="M6 15h7l3-6h4"/></svg>`}
  function svgBox(){return `<svg viewBox="0 0 24 24"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/></svg>`}
})();


