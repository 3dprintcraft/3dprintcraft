window.addEventListener("error", e => {
  document.body.innerHTML = "<p style='padding:20px'>⚠️ Σφάλμα φόρτωσης σελίδας</p>";
});


(function(){
  const qs = new URLSearchParams(location.search);
  const shop = qs.get("shop") || "demo";

  const cfg = document.createElement("script");
  cfg.src = `/hub/shops/${shop}/config.js`;
  cfg.onload = () => init(CONFIG);
  cfg.onerror = () => document.body.innerHTML = "Shop not found";
  document.head.appendChild(cfg);

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
  const panel = C.panel || {};
const bg = panel.background || {};

if(!bg.type) return;


  const bg = C.panel.background;
  const r = document.documentElement;

  // 🔴 ΣΒΗΝΟΥΜΕ ΠΑΝΤΑ Ο,ΤΙ ΥΠΗΡΧΕ
  r.style.removeProperty("--panel-bg");

 if(bg.type === "solid"){
  root.style.setProperty("--panel-bg", bg.color);
}

  if(bg.type === "gradient"){
    r.style.setProperty(
      "--panel-bg",
      `linear-gradient(${bg.gradient.direction},
        ${bg.gradient.from},
        ${bg.gradient.to})`
    );
  }

  r.style.setProperty("--panel-radius", C.panel.radius + "px");

  r.style.setProperty(
    "--panel-shadow",
    C.panel.shadow === "strong"
      ? "0 30px 80px rgba(0,0,0,.25)"
      : "0 20px 50px rgba(0,0,0,.12)"
  );
  
}



  function init(C){
	  
	 

	  
	document.title =
    C.meta?.title ||
    C.brand?.name ||
    "3DPrintCraft";
    
    applyTypography(C);
    applyBackground(C);
	 applyPanel(C);
    applyButtonsTheme(C);
	

    setText("shop-name", C.brand?.name);
    setText("shop-slogan", C.brand?.slogan);
    setText("shop-hours", C.brand?.hours);

    renderLogo(C);
    renderPrimary(C);
    renderButtons(C);
    renderDelivery(C);
    renderSticky(C);
    maybePopup(C);
	
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

  function mkBtn({label,url,variant="outline",icon,primary=false}){
    const a=document.createElement("a");
    a.href=url; a.className="btn"+(primary?" btn--primary":"");
    if(!primary){
      if(variant==="outline") a.classList.add("btn--outline");
      if(variant==="soft") a.classList.add("btn--soft");
    }
    if(icon){
      const s=document.createElement("span"); s.className="icon"; s.innerHTML=icon; a.appendChild(s);
    }
    const t=document.createElement("span"); t.textContent=label; a.appendChild(t);
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

  function renderButtons(C){
    const wrap=document.getElementById("actions"); wrap.innerHTML="";
    const v=C.theme?.buttons?.variant||"outline";

    const defs={
      phone:{l:C.labels?.phone||"Τηλέφωνο", u:C.links?.phone, i:ICONS.phone},
      email:{l:C.labels?.email||"Email", u:C.links?.email, i:ICONS.email},
      maps:{l:C.labels?.maps||"Τοποθεσία", u:C.links?.maps, i:ICONS.maps},
      site:{l:C.labels?.site||"Ιστοσελίδα", u:C.links?.site, i:ICONS.site},
      instagram:{l:"Instagram", u:C.links?.instagram, i:ICONS.instagram},
      facebook:{l:"Facebook", u:C.links?.facebook, i:ICONS.facebook},
      tiktok:{l:"TikTok", u:C.links?.tiktok, i:ICONS.tiktok}
    };

    (C.buttons||[])
      .filter(b=>b.enabled && b.id!=="review")
      .sort((a,b)=>(a.order??999)-(b.order??999))
      .forEach(b=>{
        if(defs[b.id]?.u){
          wrap.appendChild(mkBtn({label:defs[b.id].l,url:defs[b.id].u,variant:v,icon:defs[b.id].i}));
        }
      });

    // EXTRA custom links
    (C.extraLinks||[]).filter(x=>x.enabled).sort((a,b)=>(a.order??999)-(b.order??999)).forEach(x=>{
      const icon = x.icon?.svg
        ? x.icon.svg
        : (x.icon?.file ? fetchIcon(x.icon.file) : "");
      wrap.appendChild(mkBtn({label:x.label,url:x.url,variant:v,icon}));
    });
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
    if(t.googleFont){
      const w=(t.weights||[]).join(";"); const href=`https://fonts.googleapis.com/css2?family=${encodeURIComponent(t.googleFont)}:wght@${w}&display=swap`;
      if(!document.querySelector(`link[href="${href}"]`)){
        const l=document.createElement("link"); l.rel="stylesheet"; l.href=href; document.head.appendChild(l);
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

  function applyButtonsTheme(C){
    const t=C.theme?.buttons||{}, p=C.theme?.primary||{}, r=document.documentElement;
    t.background && r.style.setProperty("--btn-bg", t.background);
    typeof t.backgroundOpacity==="number" && r.style.setProperty("--btn-bg-alpha", t.backgroundOpacity);
    t.text && r.style.setProperty("--btn-text", t.text);
    t.radius!=null && r.style.setProperty("--btn-radius", t.radius+"px");
    t.border?.width!=null && r.style.setProperty("--btn-border-width", t.border.width+"px");
    t.border?.color && r.style.setProperty("--btn-border-color", t.border.color);
    p.background && r.style.setProperty("--primary-bg", p.background);
    typeof p.backgroundOpacity==="number" && r.style.setProperty("--primary-bg-alpha", p.backgroundOpacity);
    p.text && r.style.setProperty("--primary-text", p.text);
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

    root.querySelector(".popup-close").onclick=close;
    root.querySelector(".popup-cta").onclick=close;
    root.querySelector(".popup-backdrop").onclick=e=>{ if(e.target.classList.contains("popup-backdrop")) close(); };
    function close(){ root.innerHTML=""; localStorage.setItem(k,"1"); }
  }

  function fetchIcon(file){
    // inline fetch once; simple sync fallback via <img> is avoided to keep color inherit
    return `<svg viewBox="0 0 24 24"><use href="${file}#icon"/></svg>`;
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


