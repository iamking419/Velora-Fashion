import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
// Palette: obsidian, silk-white, graphite, champagne-gold, blush-shadow
// Type: "Cormorant Garamond" (editorial display) + "Inter" (utility body)
// Signature: The "V" monogram that animates on load and recurs as a watermark

// ─── PRODUCT CATALOG (shared) ────────────────────────────────────────────────
const PRODUCTS = [
  { id:1, name:"Maison Noir Blazer", category:"Women's", price:2890, tag:"Bestseller", color:"#1a1a1a", sizes:["XS","S","M","L","XL"], desc:"A sculpted silhouette in Italian wool-mohair, finished with hand-stitched lapels and horn buttons from a third-generation atelier in Biella." },
  { id:2, name:"Heritage Cashmere Coat", category:"Men's", price:4200, tag:"New", color:"#1c1814", sizes:["S","M","L","XL","XXL"], desc:"Double-faced cashmere from the Scottish Borders, cut for an architectural drape that softens with every wear." },
  { id:3, name:"Silk Evening Gown", category:"Women's", price:6500, tag:"Limited", color:"#140d1a", sizes:["XS","S","M","L"], desc:"Bias-cut mulberry silk that moves like water, with a hand-draped cowl back reserved for our Limited Edition clientele." },
  { id:4, name:"Tailored Wool Suit", category:"Men's", price:3800, tag:"Classic", color:"#0d1118", sizes:["46","48","50","52","54"], desc:"A two-piece suit in Super 150s wool, half-canvassed and finished with pick-stitched edges for a lifetime of re-tailoring." },
  { id:5, name:"Velvet Midi Dress", category:"Women's", price:1950, tag:"New", color:"#1a0d0d", sizes:["XS","S","M","L","XL"], desc:"Devoré velvet with a fluid midi cut, designed to transition from afternoon meetings to evening events." },
  { id:6, name:"Structured Leather Tote", category:"Accessories", price:1200, tag:"Bestseller", color:"#10140d", sizes:["One Size"], desc:"Full-grain Italian leather over a reinforced frame, with an interior structured for a 15-inch laptop and the everyday essentials." },
];

// ─── APP CONTEXT (cart / wishlist / toast / overlays) ────────────────────────
const StoreContext = createContext(null);
function useStore() { return useContext(StoreContext); }

function StoreProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wished, setWished] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const pushToast = useCallback((message) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);

  const addToCart = useCallback((product, size, qty = 1) => {
    setCart(c => {
      const existing = c.find(i => i.id === product.id && i.size === size);
      if (existing) {
        return c.map(i => i.id === product.id && i.size === size ? { ...i, qty: i.qty + qty } : i);
      }
      return [...c, { ...product, size, qty }];
    });
    pushToast(`${product.name} added to bag`);
  }, [pushToast]);

  const removeFromCart = useCallback((id, size) => {
    setCart(c => c.filter(i => !(i.id === id && i.size === size)));
  }, []);

  const updateQty = useCallback((id, size, qty) => {
    setCart(c => qty <= 0
      ? c.filter(i => !(i.id === id && i.size === size))
      : c.map(i => i.id === id && i.size === size ? { ...i, qty } : i));
  }, []);

  const toggleWish = useCallback((product) => {
    setWished(w => {
      const has = w.some(p => p.id === product.id);
      pushToast(has ? "Removed from wishlist" : "Added to wishlist");
      return has ? w.filter(p => p.id !== product.id) : [...w, product];
    });
  }, [pushToast]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.qty * i.price, 0);

  const value = {
    cart, wished, cartCount, cartTotal, toasts,
    addToCart, removeFromCart, updateQty, toggleWish,
    quickViewProduct, setQuickViewProduct,
    cartOpen, setCartOpen, searchOpen, setSearchOpen,
    pushToast,
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const h = () => setY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return y;
}

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function formatPrice(n) {
  return `$${n.toLocaleString("en-US")}`;
}

// ─── FONTS ───────────────────────────────────────────────────────────────────
const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: #0a0a0a; color: #f5f0eb; font-family: 'Inter', sans-serif; overflow-x: hidden; }
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: #0a0a0a; }
    ::-webkit-scrollbar-thumb { background: #C9A96E; border-radius: 2px; }
    .serif { font-family: 'Cormorant Garamond', serif; }
    .gold { color: #C9A96E; }
    .gold-border { border-color: #C9A96E; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes scaleIn { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
    @keyframes slideRight { from { transform:scaleX(0); } to { transform:scaleX(1); } }
    @keyframes float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-12px);} }
    @keyframes spin { to { transform:rotate(360deg); } }
    @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
    .anim-fade-up { animation: fadeUp 0.8s cubic-bezier(.23,1,.32,1) both; }
    .anim-fade-in { animation: fadeIn 1s ease both; }
    .anim-scale { animation: scaleIn 0.9s cubic-bezier(.23,1,.32,1) both; }
    .delay-1 { animation-delay: 0.1s; }
    .delay-2 { animation-delay: 0.25s; }
    .delay-3 { animation-delay: 0.4s; }
    .delay-4 { animation-delay: 0.55s; }
    .delay-5 { animation-delay: 0.7s; }
    .marquee-track { display:flex; width:max-content; animation: marquee 28s linear infinite; }
    .card-hover { transition: transform 0.5s cubic-bezier(.23,1,.32,1), box-shadow 0.5s ease; }
    .card-hover:hover { transform: translateY(-8px); box-shadow: 0 32px 64px rgba(0,0,0,0.5); }
    .img-zoom img { transition: transform 0.8s cubic-bezier(.23,1,.32,1); }
    .img-zoom:hover img { transform: scale(1.06); }
    .btn-primary { 
      background: #C9A96E; color: #0a0a0a; border: none; padding: 14px 36px;
      font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 2.5px;
      text-transform: uppercase; cursor: pointer; transition: all 0.3s ease; display: inline-block;
      min-height: 44px; -webkit-tap-highlight-color: transparent;
    }
    .btn-primary:hover { background: #e4c48a; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(201,169,110,0.3); }
    .btn-primary:active { transform: translateY(0) scale(0.98); }
    .btn-primary:disabled { opacity:0.4; cursor:not-allowed; transform:none; }
    .btn-outline { 
      background: transparent; color: #f5f0eb; border: 1px solid rgba(245,240,235,0.4); padding: 14px 36px;
      font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 2.5px;
      text-transform: uppercase; cursor: pointer; transition: all 0.3s ease; display: inline-block;
      min-height: 44px; -webkit-tap-highlight-color: transparent;
    }
    .btn-outline:hover { border-color: #C9A96E; color: #C9A96E; transform: translateY(-2px); }
    .btn-outline:active { transform: translateY(0) scale(0.98); }
    .section-label {
      font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 4px;
      text-transform: uppercase; color: #C9A96E;
    }
    .glass { 
      background: rgba(10,10,10,0.75); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
      border-bottom: 1px solid rgba(201,169,110,0.12);
    }
    .glass-card {
      background: rgba(255,255,255,0.03); backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.06);
    }
    input, textarea {
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
      color: #f5f0eb; padding: 14px 18px; width: 100%; font-family: 'Inter', sans-serif;
      font-size: 14px; outline: none; transition: border-color 0.3s ease; border-radius: 0;
    }
    input:focus, textarea:focus { border-color: #C9A96E; }
    input::placeholder, textarea::placeholder { color: rgba(245,240,235,0.35); font-size: 13px; }
    .divider { width: 48px; height: 1px; background: #C9A96E; }
    .nav-link {
      font-size: 11px; font-weight: 500; letter-spacing: 2.5px; text-transform: uppercase;
      color: rgba(245,240,235,0.8); text-decoration: none; position: relative; transition: color 0.3s;
    }
    .nav-link::after {
      content:''; position:absolute; bottom:-2px; left:0; width:0; height:1px;
      background:#C9A96E; transition: width 0.3s ease;
    }
    .nav-link:hover { color: #C9A96E; }
    .nav-link:hover::after { width: 100%; }
    .floating { animation: float 4s ease-in-out infinite; }
    .section-padding { padding: 120px 0; }
    @media (max-width: 768px) { .section-padding { padding: 80px 0; } }

    /* ── Responsive layout fixes ───────────────────────────────────────── */
    .grid-2col { display:grid; grid-template-columns: 1fr 1fr; }
    .grid-stats-4 { display:grid; grid-template-columns: repeat(4,1fr); }
    .grid-footer { display:grid; grid-template-columns: 2fr 1fr 1fr 1fr; }
    @media (max-width: 900px) {
      .grid-2col { grid-template-columns: 1fr !important; gap: 56px !important; }
      .grid-stats-4 { grid-template-columns: repeat(2,1fr) !important; }
      .grid-footer { grid-template-columns: 1fr 1fr !important; row-gap: 40px !important; }
    }
    @media (max-width: 540px) {
      .grid-stats-4 { grid-template-columns: 1fr 1fr !important; }
      .grid-footer { grid-template-columns: 1fr !important; }
    }

    /* ── Overlay system: toasts, modal, drawers ────────────────────────── */
    .icon-btn {
      background:none; border:none; cursor:pointer; color:rgba(245,240,235,0.7);
      display:flex; align-items:center; justify-content:center;
      width:40px; height:40px; transition:color 0.3s ease, transform 0.2s ease;
    }
    .icon-btn:hover { color:#C9A96E; }
    .icon-btn:active { transform: scale(0.92); }
    .cart-badge {
      position:absolute; top:-2px; right:-2px; background:#C9A96E; color:#0a0a0a;
      font-size:9px; font-weight:700; min-width:16px; height:16px; border-radius:50%;
      display:flex; align-items:center; justify-content:center; line-height:1; padding:0 3px;
    }
    @keyframes toastIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    @keyframes overlayIn { from { opacity:0; } to { opacity:1; } }
    @keyframes drawerIn { from { transform:translateX(100%); } to { transform:translateX(0); } }
    @keyframes modalIn { from { opacity:0; transform:translate(-50%,-50%) scale(0.95); } to { opacity:1; transform:translate(-50%,-50%) scale(1); } }
    .toast-stack {
      position:fixed; bottom:24px; right:24px; z-index:300; display:flex; flex-direction:column; gap:10px;
    }
    @media (max-width: 540px) {
      .toast-stack { left:24px; right:24px; bottom:16px; align-items:stretch; }
    }
    .toast {
      background:#141210; border:1px solid rgba(201,169,110,0.35); color:#f5f0eb;
      padding:14px 22px; font-size:12px; letter-spacing:1px; box-shadow:0 16px 40px rgba(0,0,0,0.5);
      animation: toastIn 0.35s cubic-bezier(.23,1,.32,1) both; display:flex; align-items:center; gap:10px;
      max-width: calc(100vw - 48px);
    }
    .modal-overlay, .drawer-overlay {
      position:fixed; inset:0; background:rgba(5,5,5,0.7); backdrop-filter:blur(4px); z-index:250;
      animation: overlayIn 0.3s ease both;
    }
    .modal-box {
      position:fixed; top:50%; left:50%; z-index:251; background:#0d0c0a;
      border:1px solid rgba(201,169,110,0.2); width:min(880px, 92vw); max-height:88vh; overflow:auto;
      animation: modalIn 0.35s cubic-bezier(.23,1,.32,1) both;
    }
    .drawer-box {
      position:fixed; top:0; right:0; bottom:0; z-index:251; background:#0d0c0a;
      border-left:1px solid rgba(201,169,110,0.15); width:min(440px, 100vw);
      animation: drawerIn 0.4s cubic-bezier(.23,1,.32,1) both; display:flex; flex-direction:column;
    }
    .tap-target { min-height:44px; }
    .container-px { padding-left:48px; padding-right:48px; }
    @media (max-width: 640px) {
      .container-px { padding-left:24px !important; padding-right:24px !important; }
    }
    @media (max-width: 380px) {
      .container-px { padding-left:18px !important; padding-right:18px !important; }
    }
    @media (max-width: 600px) {
      .hero-stats-row { gap:24px !important; }
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: 0.001s !important; animation-iteration-count: 1 !important; transition-duration: 0.001s !important; scroll-behavior:auto !important; }
    }
    @media (max-width: 540px) {
      .modal-box { width:94vw; max-height:90vh; }
    }
  `}</style>
);

// ─── LOADING SCREEN ───────────────────────────────────────────────────────────
function LoadingScreen({ done }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(timer); return 100; }
        return p + 2;
      });
    }, 28);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    document.body.style.overflow = done ? "" : "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [done]);
  return (
    <div style={{
      position:"fixed", inset:0, background:"#0a0a0a", zIndex:9999,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      opacity: done ? 0 : 1, pointerEvents: done ? "none" : "all",
      transition: "opacity 0.8s ease 0.2s"
    }}>
      <div style={{ position:"relative", marginBottom:40 }}>
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="32" stroke="rgba(201,169,110,0.15)" strokeWidth="1" fill="none"/>
          <circle cx="36" cy="36" r="32" stroke="#C9A96E" strokeWidth="1" fill="none"
            strokeDasharray={`${progress * 2.01} 201`} strokeLinecap="round"
            style={{ transform:"rotate(-90deg)", transformOrigin:"center", transition:"stroke-dasharray 0.1s" }}/>
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span className="serif" style={{ fontSize:28, fontWeight:300, color:"#C9A96E", letterSpacing:2 }}>V</span>
        </div>
      </div>
      <p className="serif" style={{ fontSize:24, fontWeight:300, letterSpacing:8, color:"#f5f0eb", marginBottom:8 }}>VELORA</p>
      <p style={{ fontSize:10, letterSpacing:4, color:"rgba(201,169,110,0.6)", textTransform:"uppercase" }}>Luxury Fashion</p>
    </div>
  );
}

// ─── TOASTS ──────────────────────────────────────────────────────────────────
function ToastStack() {
  const { toasts } = useStore();
  if (!toasts.length) return null;
  return (
    <div className="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className="toast">
          <span style={{ color:"#C9A96E" }}>✦</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ─── QUICK VIEW MODAL ────────────────────────────────────────────────────────
function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart, toggleWish, wished } = useStore();
  const [size, setSize] = useState(null);

  useEffect(() => {
    if (quickViewProduct) {
      setSize(quickViewProduct.sizes[0]);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [quickViewProduct]);

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") setQuickViewProduct(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setQuickViewProduct]);

  if (!quickViewProduct) return null;
  const p = quickViewProduct;
  const isWished = wished.some(w => w.id === p.id);

  return (
    <>
      <div className="modal-overlay" onClick={() => setQuickViewProduct(null)} />
      <div className="modal-box" role="dialog" aria-modal="true" aria-label={`${p.name} quick view`}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr" }} className="qv-grid">
          <div style={{
            background:p.color, minHeight:320, display:"flex", alignItems:"center", justifyContent:"center",
            position:"relative", padding:40
          }}>
            <div style={{ width:90, height:90, border:"1px solid rgba(201,169,110,0.25)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span className="serif" style={{ fontSize:40, color:"rgba(201,169,110,0.3)", fontWeight:300 }}>V</span>
            </div>
            <button onClick={() => setQuickViewProduct(null)} className="icon-btn" style={{
              position:"absolute", top:12, left:12, background:"rgba(10,10,10,0.5)", color:"#f5f0eb"
            }} aria-label="Close quick view">✕</button>
          </div>
          <div style={{ padding:"40px 40px 40px 8px" }}>
            <p style={{ fontSize:10, letterSpacing:2.5, textTransform:"uppercase", color:"rgba(245,240,235,0.4)", marginBottom:10 }}>{p.category}</p>
            <h3 className="serif" style={{ fontSize:30, fontWeight:400, marginBottom:10, paddingRight:30 }}>{p.name}</h3>
            <p style={{ fontSize:20, color:"#C9A96E", fontWeight:500, marginBottom:20 }}>{formatPrice(p.price)}</p>
            <p style={{ fontSize:13, lineHeight:1.8, color:"rgba(245,240,235,0.55)", marginBottom:28, fontWeight:300 }}>{p.desc}</p>
            <p style={{ fontSize:10, letterSpacing:2, textTransform:"uppercase", color:"rgba(245,240,235,0.5)", marginBottom:10 }}>Size</p>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:28 }}>
              {p.sizes.map(s => (
                <button key={s} onClick={() => setSize(s)} className="tap-target" style={{
                  padding:"0 16px", minWidth:44, background: size===s ? "#C9A96E" : "transparent",
                  color: size===s ? "#0a0a0a" : "rgba(245,240,235,0.7)",
                  border:`1px solid ${size===s ? "#C9A96E" : "rgba(255,255,255,0.15)"}`,
                  fontSize:12, cursor:"pointer", transition:"all 0.25s ease"
                }}>{s}</button>
              ))}
            </div>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              <button className="btn-primary" style={{ flex:1, minWidth:160 }}
                onClick={() => { addToCart(p, size); setQuickViewProduct(null); }}>
                Add to Bag
              </button>
              <button className="btn-outline tap-target" style={{ width:52, padding:0, flex:"0 0 auto" }}
                onClick={() => toggleWish(p)} aria-label="Toggle wishlist">
                {isWished ? "♥" : "♡"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:700px){ .qv-grid{ grid-template-columns:1fr !important; } }`}</style>
    </>
  );
}

// ─── CART DRAWER ─────────────────────────────────────────────────────────────
function CartDrawer() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQty, cartTotal, pushToast } = useStore();

  useEffect(() => {
    document.body.style.overflow = cartOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen]);

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") setCartOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCartOpen]);

  if (!cartOpen) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={() => setCartOpen(false)} />
      <div className="drawer-box" role="dialog" aria-modal="true" aria-label="Shopping bag">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"24px 28px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <span className="serif" style={{ fontSize:20, letterSpacing:2 }}>Your Bag ({cart.reduce((s,i)=>s+i.qty,0)})</span>
          <button className="icon-btn" onClick={() => setCartOpen(false)} aria-label="Close bag">✕</button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"8px 28px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign:"center", padding:"80px 0", color:"rgba(245,240,235,0.4)" }}>
              <span style={{ fontSize:32, display:"block", marginBottom:16 }}>◇</span>
              <p style={{ fontSize:13, marginBottom:24 }}>Your bag is currently empty.</p>
              <button className="btn-outline" onClick={() => { setCartOpen(false); scrollToId("bestsellers"); }}>
                Browse Best Sellers
              </button>
            </div>
          ) : cart.map(item => (
            <div key={`${item.id}-${item.size}`} style={{ display:"flex", gap:16, padding:"20px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ width:72, height:88, background:item.color, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span className="serif" style={{ fontSize:22, color:"rgba(201,169,110,0.3)" }}>V</span>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p className="serif" style={{ fontSize:15, marginBottom:4 }}>{item.name}</p>
                <p style={{ fontSize:11, color:"rgba(245,240,235,0.4)", marginBottom:8 }}>Size {item.size}</p>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <button onClick={() => updateQty(item.id, item.size, item.qty - 1)} className="icon-btn" style={{ width:28, height:28, border:"1px solid rgba(255,255,255,0.1)" }}>−</button>
                  <span style={{ fontSize:13, minWidth:16, textAlign:"center" }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.size, item.qty + 1)} className="icon-btn" style={{ width:28, height:28, border:"1px solid rgba(255,255,255,0.1)" }}>+</button>
                </div>
              </div>
              <div style={{ textAlign:"right", display:"flex", flexDirection:"column", justifyContent:"space-between", alignItems:"flex-end" }}>
                <span style={{ fontSize:13, color:"#C9A96E" }}>{formatPrice(item.price * item.qty)}</span>
                <button onClick={() => removeFromCart(item.id, item.size)} style={{ background:"none", border:"none", color:"rgba(245,240,235,0.3)", fontSize:11, cursor:"pointer", textDecoration:"underline" }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div style={{ padding:"24px 28px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:18 }}>
              <span style={{ fontSize:12, color:"rgba(245,240,235,0.5)", letterSpacing:1, textTransform:"uppercase" }}>Subtotal</span>
              <span className="serif" style={{ fontSize:20, color:"#C9A96E" }}>{formatPrice(cartTotal)}</span>
            </div>
            <button className="btn-primary" style={{ width:"100%" }}
              onClick={() => { pushToast("This is a demo — checkout isn't connected to payment."); }}>
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── SEARCH OVERLAY ──────────────────────────────────────────────────────────
function SearchOverlay() {
  const { searchOpen, setSearchOpen, setQuickViewProduct } = useStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = searchOpen ? "hidden" : "";
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 60);
    return () => { document.body.style.overflow = ""; };
  }, [searchOpen]);

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") setSearchOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  if (!searchOpen) return null;
  const results = query.trim()
    ? PRODUCTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="modal-overlay" style={{ zIndex:260 }} onClick={() => setSearchOpen(false)}>
      <div onClick={e => e.stopPropagation()} style={{
        maxWidth:680, margin:"80px auto 0", padding:"0 24px"
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:16, borderBottom:"1px solid rgba(201,169,110,0.3)", paddingBottom:16, marginBottom:24 }}>
          <span style={{ color:"#C9A96E", fontSize:18 }}>⊙</span>
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search products, categories..." autoFocus
            style={{ background:"none", border:"none", padding:0, fontSize:20, fontFamily:"'Cormorant Garamond',serif" }}/>
          <button className="icon-btn" onClick={() => setSearchOpen(false)} aria-label="Close search">✕</button>
        </div>
        {query.trim() && (
          <div style={{ maxHeight:"60vh", overflowY:"auto" }}>
            {results.length === 0 ? (
              <p style={{ color:"rgba(245,240,235,0.4)", fontSize:13, textAlign:"center", padding:"32px 0" }}>
                No pieces found for "{query}". Try "blazer", "coat", or "Women's".
              </p>
            ) : results.map(p => (
              <div key={p.id} style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", cursor:"pointer" }}
                onClick={() => { setQuickViewProduct(p); setSearchOpen(false); }}>
                <div style={{ width:48, height:60, background:p.color, flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <p className="serif" style={{ fontSize:16 }}>{p.name}</p>
                  <p style={{ fontSize:11, color:"rgba(245,240,235,0.4)" }}>{p.category}</p>
                </div>
                <span style={{ fontSize:13, color:"#C9A96E" }}>{formatPrice(p.price)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
function Nav({ scrollY }) {
  const [open, setOpen] = useState(false);
  const [wishOpen, setWishOpen] = useState(false);
  const scrolled = scrollY > 60;
  const links = ["Collections","Lookbook","About","Testimonials","Contact"];
  const { wished, toggleWish, setSearchOpen, setCartOpen, cartCount, setQuickViewProduct } = useStore();

  return (
    <>
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        padding: scrolled ? "16px 48px" : "28px 48px",
        transition: "all 0.5s ease",
        ...(scrolled ? { background:"rgba(10,10,10,0.85)", backdropFilter:"blur(24px)", borderBottom:"1px solid rgba(201,169,110,0.1)" } : {})
      }} className="nav-padding">
        <div style={{ maxWidth:1400, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          {/* Logo */}
          <button onClick={() => window.scrollTo({ top:0, behavior:"smooth" })} style={{
            textDecoration:"none", display:"flex", alignItems:"center", gap:10,
            background:"none", border:"none", cursor:"pointer", padding:0
          }} aria-label="VELORA — back to top">
            <span style={{
              width:32, height:32, border:"1px solid #C9A96E", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0
            }}>
              <span className="serif" style={{ fontSize:18, color:"#C9A96E", fontWeight:300 }}>V</span>
            </span>
            <span className="serif" style={{ fontSize:18, letterSpacing:6, color:"#f5f0eb", fontWeight:300 }}>VELORA</span>
          </button>
          {/* Desktop Links */}
          <div style={{ display:"flex", gap:40, alignItems:"center" }} className="desktop-nav">
            {links.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="nav-link"
                onClick={e => { e.preventDefault(); scrollToId(l.toLowerCase()); }}>{l}</a>
            ))}
          </div>
          {/* Right actions */}
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ position:"relative" }}>
              <button className="icon-btn" style={{ fontSize:18 }} onClick={() => setWishOpen(w => !w)}
                aria-label="Wishlist" aria-expanded={wishOpen}>
                {wished.length > 0 ? "♥" : "♡"}
              </button>
              {wished.length > 0 && <span className="cart-badge">{wished.length}</span>}
              {wishOpen && (
                <>
                  <div style={{ position:"fixed", inset:0, zIndex:149 }} onClick={() => setWishOpen(false)} />
                  <div className="glass-card" style={{
                    position:"absolute", top:"calc(100% + 16px)", right:0, width:300, zIndex:150,
                    padding:20, animation:"scaleIn 0.25s cubic-bezier(.23,1,.32,1) both", transformOrigin:"top right"
                  }}>
                    <p style={{ fontSize:10, letterSpacing:2.5, textTransform:"uppercase", color:"#C9A96E", marginBottom:14 }}>
                      Wishlist {wished.length > 0 && `(${wished.length})`}
                    </p>
                    {wished.length === 0 ? (
                      <p style={{ fontSize:13, color:"rgba(245,240,235,0.4)" }}>Nothing saved yet. Tap the heart on any piece.</p>
                    ) : (
                      <div style={{ display:"flex", flexDirection:"column", gap:12, maxHeight:280, overflowY:"auto" }}>
                        {wished.map(p => (
                          <div key={p.id} style={{ display:"flex", gap:10, alignItems:"center", cursor:"pointer" }}
                            onClick={() => { setQuickViewProduct(p); setWishOpen(false); }}>
                            <div style={{ width:38, height:46, background:p.color, flexShrink:0 }} />
                            <div style={{ flex:1, minWidth:0 }}>
                              <p style={{ fontSize:12.5, color:"#f5f0eb" }}>{p.name}</p>
                              <p style={{ fontSize:11, color:"#C9A96E" }}>{formatPrice(p.price)}</p>
                            </div>
                            <button onClick={e => { e.stopPropagation(); toggleWish(p); }} style={{ background:"none", border:"none", color:"rgba(245,240,235,0.3)", cursor:"pointer", fontSize:14 }} aria-label="Remove from wishlist">✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <button className="icon-btn" style={{ fontSize:16 }} onClick={() => setSearchOpen(true)} aria-label="Search">⊙</button>
            <div style={{ position:"relative" }} className="desktop-nav">
              <button className="icon-btn" style={{ fontSize:17 }} onClick={() => setCartOpen(true)} aria-label="Shopping bag">⚭</button>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </div>
            <button className="btn-primary" style={{ padding:"10px 24px", fontSize:11 }}
              onClick={() => scrollToId("bestsellers")}>Shop Now</button>
            {/* Hamburger */}
            <button onClick={() => setOpen(!open)} style={{
              background:"none", border:"none", cursor:"pointer", display:"none", flexDirection:"column",
              gap:5, padding:4, width:36, height:36, alignItems:"center", justifyContent:"center"
            }} className="hamburger" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
              {[0,1,2].map(i => (
                <span key={i} style={{
                  width:24, height:1, background:"#f5f0eb", display:"block",
                  transition:"all 0.3s ease",
                  transform: open ? (i===0?"rotate(45deg) translate(4px,4px)":i===2?"rotate(-45deg) translate(4px,-4px)":"scale(0)") : "none",
                  opacity: open && i===1 ? 0 : 1
                }}/>
              ))}
            </button>
          </div>
        </div>
      </nav>
      {/* Mobile Menu */}
      <div style={{
        position:"fixed", inset:0, zIndex:99, background:"rgba(10,10,10,0.98)",
        backdropFilter:"blur(32px)", display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", gap:32, transition:"all 0.5s ease",
        opacity: open ? 1 : 0, pointerEvents: open ? "all" : "none",
        transform: open ? "translateY(0)" : "translateY(-20px)"
      }}>
        {links.map((l,i) => (
          <a key={l} href={`#${l.toLowerCase()}`} onClick={e => { e.preventDefault(); setOpen(false); setTimeout(() => scrollToId(l.toLowerCase()), 350); }} style={{
            textDecoration:"none", color:"#f5f0eb", fontSize:32, fontFamily:"'Cormorant Garamond',serif",
            fontWeight:300, letterSpacing:6, transition:`all 0.4s ease ${i*0.06}s`,
            opacity: open ? 1 : 0, transform: open ? "translateY(0)" : "translateY(20px)"
          }}>{l}</a>
        ))}
        <div style={{ display:"flex", gap:16, marginTop:12 }}>
          <button className="btn-outline tap-target" style={{ padding:"14px 28px" }}
            onClick={() => { setOpen(false); setTimeout(() => setCartOpen(true), 350); }}>
            Bag {cartCount > 0 && `(${cartCount})`}
          </button>
          <button className="btn-primary tap-target" style={{ padding:"14px 28px" }}
            onClick={() => { setOpen(false); setTimeout(() => scrollToId("bestsellers"), 350); }}>
            Shop Now
          </button>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display:none !important; }
          .hamburger { display:flex !important; }
        }
        @media (max-width: 540px) {
          .nav-padding { padding: 16px 20px !important; }
        }
      `}</style>
    </>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);
  return (
    <section className="hero-section" style={{ position:"relative", height:"100vh", minHeight:700, overflow:"hidden", display:"flex", alignItems:"center" }}>
      <style>{`@supports (height: 100dvh) { .hero-section { height: 100dvh; } }`}</style>
      {/* Background gradient / pattern */}
      <div style={{
        position:"absolute", inset:0,
        background:"linear-gradient(135deg, #0a0a0a 0%, #141410 50%, #0d0d08 100%)"
      }}/>
      {/* Decorative elements */}
      <div style={{
        position:"absolute", right:"-5%", top:"10%", width:"60%", height:"90%",
        background:"linear-gradient(135deg, rgba(201,169,110,0.04) 0%, transparent 60%)",
        border:"1px solid rgba(201,169,110,0.06)", borderRadius:2
      }} className="hero-deco-1"/>
      <div style={{
        position:"absolute", right:"8%", top:"20%", width:"42%", height:"70%",
        background:"linear-gradient(180deg, rgba(201,169,110,0.05) 0%, rgba(10,10,10,0.2) 100%)",
        overflow:"hidden", borderRadius:2
      }} className="hero-deco-2">
        {/* Fashion image placeholder — editorial grid pattern */}
        <div style={{ width:"100%", height:"100%", position:"relative" }}>
          <div style={{
            position:"absolute", inset:0,
            background:`
              repeating-linear-gradient(0deg, rgba(201,169,110,0.03) 0, rgba(201,169,110,0.03) 1px, transparent 1px, transparent 80px),
              repeating-linear-gradient(90deg, rgba(201,169,110,0.03) 0, rgba(201,169,110,0.03) 1px, transparent 1px, transparent 80px)
            `
          }}/>
          <div style={{
            position:"absolute", inset:0, display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center", gap:16
          }}>
            <div style={{
              width:120, height:120, border:"1px solid rgba(201,169,110,0.3)",
              display:"flex", alignItems:"center", justifyContent:"center"
            }} className="floating">
              <span className="serif" style={{ fontSize:64, color:"rgba(201,169,110,0.4)", fontWeight:300 }}>V</span>
            </div>
            <p style={{ fontSize:10, letterSpacing:5, color:"rgba(201,169,110,0.4)", textTransform:"uppercase" }}>
              Fashion Imagery
            </p>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="container-px" style={{ position:"relative", zIndex:2, maxWidth:1400, margin:"0 auto", padding:"0 48px", width:"100%" }}>
        <div style={{ maxWidth:580 }}>
          {loaded && <>
            <p className="section-label anim-fade-up" style={{ marginBottom:24 }}>
              SS 2025 Collection
            </p>
            <h1 className="serif anim-fade-up delay-1" style={{
              fontSize:"clamp(56px, 8vw, 110px)", lineHeight:0.95, fontWeight:300,
              letterSpacing:"-1px", marginBottom:32, color:"#f5f0eb"
            }}>
              Redefining<br/>
              <em style={{ color:"#C9A96E" }}>Modern</em><br/>
              Fashion
            </h1>
            <div className="divider anim-fade-in delay-2" style={{ marginBottom:28 }}/>
            <p className="anim-fade-up delay-2" style={{
              fontSize:15, lineHeight:1.8, color:"rgba(245,240,235,0.6)", maxWidth:400, marginBottom:44, fontWeight:300
            }}>
              Where heritage craftsmanship meets contemporary vision. Each piece a statement, every silhouette a story told in the finest materials the world offers.
            </p>
            <div className="anim-fade-up delay-3" style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
              <button className="btn-primary" onClick={() => scrollToId("collections")}>Explore Collection</button>
              <button className="btn-outline" onClick={() => scrollToId("about")}>Our Story</button>
            </div>
          </>}
        </div>
      </div>
      {/* Stats bar */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0,
        borderTop:"1px solid rgba(255,255,255,0.06)",
        background:"rgba(10,10,10,0.6)", backdropFilter:"blur(12px)"
      }}>
        <div className="container-px hero-stats-row" style={{ maxWidth:1400, margin:"0 auto", padding:"24px 48px", display:"flex", gap:48, flexWrap:"wrap" }}>
          {[["12+","Years of Excellence"],["48K+","Global Clients"],["200+","Unique Designs"],["94%","Satisfaction Rate"]].map(([n,l]) => (
            <div key={l} style={{ display:"flex", alignItems:"baseline", gap:10 }}>
              <span className="serif" style={{ fontSize:28, color:"#C9A96E", fontWeight:300 }}>{n}</span>
              <span style={{ fontSize:11, color:"rgba(245,240,235,0.4)", letterSpacing:1.5, textTransform:"uppercase" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Scroll indicator */}
      <div className="hero-scroll-indicator" style={{
        position:"absolute", bottom:90, right:48, display:"flex", flexDirection:"column",
        alignItems:"center", gap:8, opacity:0.5
      }}>
        <div style={{ width:1, height:60, background:"linear-gradient(to bottom, #C9A96E, transparent)", animation:"float 2s ease-in-out infinite" }}/>
        <span style={{ fontSize:9, letterSpacing:3, textTransform:"uppercase", writingMode:"vertical-rl", color:"#C9A96E" }}>Scroll</span>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .hero-scroll-indicator { display:none; }
        }
        @media (max-width: 900px) {
          .hero-deco-1, .hero-deco-2 { opacity: 0.35; }
        }
        @media (max-width: 640px) {
          .hero-deco-1, .hero-deco-2 { display:none; }
        }
      `}</style>
    </section>
  );
}

// ─── MARQUEE ─────────────────────────────────────────────────────────────────
function Marquee() {
  const words = ["New Arrivals","Limited Edition","Sustainable","Handcrafted","Premium","Exclusive","Luxury","SS 2025"];
  const doubled = [...words,...words];
  return (
    <div style={{ overflow:"hidden", borderTop:"1px solid rgba(255,255,255,0.05)", borderBottom:"1px solid rgba(255,255,255,0.05)", padding:"18px 0", background:"rgba(201,169,110,0.03)" }}>
      <div className="marquee-track">
        {doubled.map((w,i) => (
          <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:40, padding:"0 40px", whiteSpace:"nowrap" }}>
            <span style={{ fontSize:11, letterSpacing:4, textTransform:"uppercase", color:"rgba(245,240,235,0.4)", fontWeight:500 }}>{w}</span>
            <span style={{ color:"#C9A96E", fontSize:14 }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── COLLECTIONS ─────────────────────────────────────────────────────────────
function Collections() {
  const [ref, inView] = useInView();
  const { pushToast } = useStore();
  const cats = [
    { label:"Women's", tag:"New Season", bg:"linear-gradient(160deg,#1a1510,#0d0c0a)", accent:"#C9A96E", items:"84 Pieces" },
    { label:"Men's", tag:"Essentials", bg:"linear-gradient(160deg,#0d0f14,#0a0a0a)", accent:"#8ba8c9", items:"62 Pieces" },
    { label:"Limited Edition", tag:"Exclusive Drop", bg:"linear-gradient(160deg,#14100a,#0a0a0a)", accent:"#c98080", items:"12 Pieces" },
    { label:"Accessories", tag:"Complete the Look", bg:"linear-gradient(160deg,#0e140e,#0a0a0a)", accent:"#8ab89e", items:"36 Pieces" },
  ];
  const goToCategory = (label) => {
    pushToast(`Showing ${label}`);
    scrollToId("bestsellers");
  };
  return (
    <section id="collections" className="section-padding" style={{ background:"#0a0a0a" }}>
      <div className="container-px" style={{ maxWidth:1400, margin:"0 auto", padding:"0 48px" }}>
        <div ref={ref} style={{ marginBottom:72, display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:24 }}>
          <div>
            <p className={`section-label ${inView?"anim-fade-up":""}`}>Curated For You</p>
            <h2 className={`serif ${inView?"anim-fade-up delay-1":""}`} style={{ fontSize:"clamp(36px,5vw,72px)", fontWeight:300, marginTop:16 }}>
              Our Collections
            </h2>
          </div>
          <button className={`btn-outline ${inView?"anim-fade-up delay-2":""}`} onClick={() => scrollToId("bestsellers")}>View All</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:2 }}>
          {cats.map((c,i) => (
            <div key={c.label} className={`card-hover img-zoom ${inView?`anim-scale delay-${i+1}`:""}`}
              role="button" tabIndex={0} onClick={() => goToCategory(c.label)}
              onKeyDown={e => { if (e.key === "Enter") goToCategory(c.label); }}
              style={{ cursor:"pointer", position:"relative", overflow:"hidden" }}>
              <div style={{
                background:c.bg, height:480, display:"flex", flexDirection:"column",
                justifyContent:"flex-end", padding:36, position:"relative"
              }}>
                {/* Pattern overlay */}
                <div style={{
                  position:"absolute", inset:0, opacity:0.4,
                  background:`radial-gradient(circle at 30% 30%, ${c.accent}08 0%, transparent 60%)`
                }}/>
                {/* Center monogram */}
                <div style={{
                  position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-60%)",
                  width:140, height:140, border:`1px solid ${c.accent}20`,
                  display:"flex", alignItems:"center", justifyContent:"center"
                }}>
                  <span className="serif" style={{ fontSize:64, color:`${c.accent}25`, fontWeight:300 }}>V</span>
                </div>
                <div style={{ position:"relative", zIndex:1 }}>
                  <span style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:c.accent, marginBottom:8, display:"block" }}>{c.tag}</span>
                  <h3 className="serif" style={{ fontSize:32, fontWeight:300, marginBottom:4 }}>{c.label}</h3>
                  <p style={{ fontSize:11, color:"rgba(245,240,235,0.4)", letterSpacing:1 }}>{c.items}</p>
                </div>
                <div style={{
                  position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)",
                  pointerEvents:"none"
                }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── BEST SELLERS ─────────────────────────────────────────────────────────────
function BestSellers() {
  const [ref, inView] = useInView();
  const [hoveredCard, setHoveredCard] = useState(null);
  const { wished, toggleWish, setQuickViewProduct, pushToast } = useStore();
  const products = PRODUCTS;
  const isWished = (id) => wished.some(w => w.id === id);

  return (
    <section id="bestsellers" className="section-padding" style={{ background:"#080808" }}>
      <div className="container-px" style={{ maxWidth:1400, margin:"0 auto", padding:"0 48px" }}>
        <div ref={ref} style={{ textAlign:"center", marginBottom:72 }}>
          <p className={`section-label ${inView?"anim-fade-up":""}`}>Most Loved</p>
          <h2 className={`serif ${inView?"anim-fade-up delay-1":""}`} style={{ fontSize:"clamp(36px,5vw,72px)", fontWeight:300, marginTop:16, marginBottom:20 }}>
            Best Sellers
          </h2>
          <p className={`${inView?"anim-fade-up delay-2":""}`} style={{ color:"rgba(245,240,235,0.4)", fontSize:14, maxWidth:460, margin:"0 auto" }}>
            Pieces that define the season — selected by our global clientele.
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:24 }}>
          {products.map((p,i) => (
            <div key={p.id}
              className={`product-card ${inView?`anim-fade-up delay-${(i%4)+1}`:""}`}
              onMouseEnter={() => setHoveredCard(p.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ cursor:"pointer" }}>
              <div style={{
                background:p.color, height:380, position:"relative", overflow:"hidden",
                transition:"all 0.5s cubic-bezier(.23,1,.32,1)",
                transform: hoveredCard===p.id ? "translateY(-8px)" : "translateY(0)",
                boxShadow: hoveredCard===p.id ? "0 32px 64px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.3)"
              }} onClick={() => setQuickViewProduct(p)}>
                {/* Product visual */}
                <div style={{
                  position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
                  background:`radial-gradient(circle at 50% 40%, rgba(201,169,110,0.06), transparent 65%)`
                }}>
                  <div style={{ textAlign:"center" }}>
                    <div style={{
                      width:80, height:80, border:"1px solid rgba(201,169,110,0.2)",
                      display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px"
                    }}>
                      <span className="serif" style={{ fontSize:36, color:"rgba(201,169,110,0.25)", fontWeight:300 }}>V</span>
                    </div>
                    <span style={{ fontSize:9, letterSpacing:4, color:"rgba(201,169,110,0.3)", textTransform:"uppercase" }}>Product Photo</span>
                  </div>
                </div>
                {/* Tag */}
                <div style={{
                  position:"absolute", top:20, left:20,
                  background: p.tag==="Limited"?"rgba(201,128,128,0.15)":"rgba(201,169,110,0.1)",
                  border: `1px solid ${p.tag==="Limited"?"rgba(201,128,128,0.3)":"rgba(201,169,110,0.25)"}`,
                  padding:"4px 12px"
                }}>
                  <span style={{ fontSize:9, letterSpacing:2.5, textTransform:"uppercase", color: p.tag==="Limited"?"#c98080":"#C9A96E" }}>{p.tag}</span>
                </div>
                {/* Wishlist */}
                <button onClick={e => { e.stopPropagation(); toggleWish(p); }} style={{
                  position:"absolute", top:16, right:16, background:"rgba(10,10,10,0.5)",
                  border:"none", cursor:"pointer", width:38, height:38, display:"flex",
                  alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)",
                  fontSize:16, transition:"all 0.3s", color: isWished(p.id)?"#c98080":"rgba(245,240,235,0.5)"
                }} aria-label="Toggle wishlist">
                  {isWished(p.id) ? "♥" : "♡"}
                </button>
                {/* Quick view */}
                <div className="qv-reveal" style={{
                  position:"absolute", bottom:0, left:0, right:0, padding:"16px 20px",
                  background:"rgba(10,10,10,0.9)", backdropFilter:"blur(12px)",
                  transform: hoveredCard===p.id ? "translateY(0)" : "translateY(100%)",
                  transition:"transform 0.4s cubic-bezier(.23,1,.32,1)"
                }}>
                  <button style={{
                    width:"100%", background:"transparent", border:"1px solid rgba(201,169,110,0.4)",
                    color:"#C9A96E", padding:"10px", fontSize:10, letterSpacing:3,
                    textTransform:"uppercase", cursor:"pointer", fontFamily:"Inter,sans-serif",
                    transition:"all 0.3s", minHeight:40
                  }} onClick={e => { e.stopPropagation(); setQuickViewProduct(p); }}>Quick View</button>
                </div>
              </div>
              <div style={{ padding:"20px 4px 8px" }}>
                <p style={{ fontSize:10, letterSpacing:2, textTransform:"uppercase", color:"rgba(245,240,235,0.35)", marginBottom:6 }}>{p.category}</p>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <h3 className="serif" style={{ fontSize:20, fontWeight:400 }}>{p.name}</h3>
                  <span style={{ fontSize:15, color:"#C9A96E", fontWeight:500 }}>{formatPrice(p.price)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:64 }}>
          <button className="btn-outline" onClick={() => { pushToast("You're viewing all 6 available pieces"); scrollToId("lookbook"); }}>
            View All Products
          </button>
        </div>
      </div>
      <style>{`
        @media (hover: none) {
          .qv-reveal { transform: translateY(0) !important; }
        }
      `}</style>
    </section>
  );
}

// ─── ABOUT ───────────────────────────────────────────────────────────────────
function About() {
  const [ref, inView] = useInView();
  const stats = [["2012","Founded in Paris"],["48K+","Clients Worldwide"],["200+","Signature Designs"],["32","Countries Served"]];
  return (
    <section id="about" className="section-padding" style={{ background:"#0d0c0a", position:"relative", overflow:"hidden" }}>
      {/* Background V watermark */}
      <div style={{
        position:"absolute", right:"-5%", top:"50%", transform:"translateY(-50%)",
        fontSize:"45vw", color:"rgba(201,169,110,0.018)", fontFamily:"'Cormorant Garamond',serif",
        fontWeight:300, lineHeight:1, pointerEvents:"none", userSelect:"none"
      }}>V</div>
      <div className="container-px" style={{ maxWidth:1400, margin:"0 auto", padding:"0 48px", position:"relative", zIndex:1 }}>
        <div ref={ref} className="grid-2col" style={{ gap:80, alignItems:"center" }}>
          <div>
            <p className={`section-label ${inView?"anim-fade-up":""}`}>Our Heritage</p>
            <h2 className={`serif ${inView?"anim-fade-up delay-1":""}`} style={{ fontSize:"clamp(36px,4.5vw,64px)", fontWeight:300, lineHeight:1.05, marginTop:20, marginBottom:32 }}>
              A Decade of<br/><em style={{ color:"#C9A96E" }}>Uncompromising</em><br/>Elegance
            </h2>
            <div className={`divider ${inView?"anim-fade-in delay-2":""}`} style={{ marginBottom:32 }}/>
            <p className={`${inView?"anim-fade-up delay-2":""}`} style={{ fontSize:15, lineHeight:1.9, color:"rgba(245,240,235,0.55)", marginBottom:24, fontWeight:300 }}>
              Born in the ateliers of Paris in 2012, VELORA was founded on a single conviction: that true luxury is not worn, it is experienced. Every stitch carries the weight of tradition; every silhouette, the precision of tomorrow.
            </p>
            <p className={`${inView?"anim-fade-up delay-3":""}`} style={{ fontSize:15, lineHeight:1.9, color:"rgba(245,240,235,0.55)", marginBottom:44, fontWeight:300 }}>
              We collaborate with the world's finest mills in Italy and Scotland, partnering with artisans whose families have practiced their craft for generations. The result is clothing that transcends season — investments in self-expression.
            </p>
            <button className={`btn-primary ${inView?"anim-fade-up delay-4":""}`} onClick={() => scrollToId("contact")}>Our Story</button>
          </div>
          <div>
            {/* Visual panel */}
            <div className={`${inView?"anim-scale delay-2":""}`} style={{
              position:"relative", height:560,
              background:"linear-gradient(160deg, #1a1510, #0d0c0a)",
              border:"1px solid rgba(201,169,110,0.1)"
            }}>
              <div style={{
                position:"absolute", inset:0,
                background:`repeating-linear-gradient(45deg, rgba(201,169,110,0.015) 0, rgba(201,169,110,0.015) 1px, transparent 1px, transparent 40px)`
              }}/>
              <div style={{
                position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center"
              }}>
                <div style={{
                  width:200, height:200, border:"1px solid rgba(201,169,110,0.15)",
                  display:"flex", alignItems:"center", justifyContent:"center"
                }} className="floating">
                  <span className="serif" style={{ fontSize:96, color:"rgba(201,169,110,0.2)", fontWeight:300 }}>V</span>
                </div>
              </div>
              {/* Corner accents */}
              {[[0,0],[0,"auto"],["auto",0],["auto","auto"]].map(([t,b,l,r],i) => (
                <div key={i} style={{
                  position:"absolute",
                  top: i<2?"16px":"auto", bottom: i>=2?"16px":"auto",
                  left: i%2===0?"16px":"auto", right: i%2===1?"16px":"auto",
                  width:16, height:16,
                  borderTop: i<2?"1px solid #C9A96E":"none",
                  borderBottom: i>=2?"1px solid #C9A96E":"none",
                  borderLeft: i%2===0?"1px solid #C9A96E":"none",
                  borderRight: i%2===1?"1px solid #C9A96E":"none",
                }}/>
              ))}
            </div>
          </div>
        </div>
        {/* Stats */}
        <div className={`grid-stats-4 ${inView?"anim-fade-up delay-3":""}`} style={{
          gap:2, marginTop:80
        }}>
          {stats.map(([n,l]) => (
            <div key={l} style={{
              padding:"40px 32px", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)",
              textAlign:"center"
            }}>
              <p className="serif" style={{ fontSize:48, fontWeight:300, color:"#C9A96E", marginBottom:8 }}>{n}</p>
              <p style={{ fontSize:11, letterSpacing:2, textTransform:"uppercase", color:"rgba(245,240,235,0.4)" }}>{l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── WHY CHOOSE US ────────────────────────────────────────────────────────────
function WhyUs() {
  const [ref, inView] = useInView();
  const features = [
    { icon:"◈", title:"Artisan Craftsmanship", desc:"Each garment passes through 47 quality checkpoints and is hand-finished by master craftspeople." },
    { icon:"◉", title:"Sustainable Luxury", desc:"100% ethically sourced materials. Carbon-neutral shipping. Responsible beauty without compromise." },
    { icon:"◎", title:"White Glove Delivery", desc:"Complimentary express delivery in signature packaging. Returns accepted within 30 days, no questions asked." },
    { icon:"◇", title:"Personal Styling", desc:"Every client receives access to a dedicated VELORA stylist for bespoke guidance, in-person or remote." },
  ];
  return (
    <section className="section-padding" style={{ background:"#0a0a0a" }}>
      <div className="container-px" style={{ maxWidth:1400, margin:"0 auto", padding:"0 48px" }}>
        <div ref={ref} style={{ textAlign:"center", marginBottom:80 }}>
          <p className={`section-label ${inView?"anim-fade-up":""}`}>The VELORA Standard</p>
          <h2 className={`serif ${inView?"anim-fade-up delay-1":""}`} style={{ fontSize:"clamp(36px,5vw,72px)", fontWeight:300, marginTop:16 }}>
            Why Choose Us
          </h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:2 }}>
          {features.map((f,i) => (
            <div key={f.title} className={`glass-card ${inView?`anim-fade-up delay-${i+1}`:""}`}
              style={{ padding:"52px 36px", transition:"all 0.4s ease", cursor:"default" }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(201,169,110,0.05)";
                e.currentTarget.style.borderColor = "rgba(201,169,110,0.2)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              }}>
              <div style={{
                width:52, height:52, border:"1px solid rgba(201,169,110,0.25)",
                display:"flex", alignItems:"center", justifyContent:"center",
                marginBottom:28, color:"#C9A96E", fontSize:20
              }}>{f.icon}</div>
              <h3 className="serif" style={{ fontSize:24, fontWeight:400, marginBottom:16 }}>{f.title}</h3>
              <p style={{ fontSize:14, lineHeight:1.8, color:"rgba(245,240,235,0.45)", fontWeight:300 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
function Testimonials() {
  const [ref, inView] = useInView();
  const [idx, setIdx] = useState(0);
  const reviews = [
    { name:"Isabelle Laurent", role:"Creative Director, Paris", text:"VELORA transformed my wardrobe. The craftsmanship is unlike anything I've encountered at this price point — and I've spent considerable time in Parisian ateliers. Simply extraordinary.", rating:5 },
    { name:"Marcus Chen", role:"Investment Banker, Hong Kong", text:"I purchased the Heritage Cashmere Coat for a board meeting and have received more compliments than I can count. The tailoring is impeccable. VELORA has earned a client for life.", rating:5 },
    { name:"Sofia Andreou", role:"Architect, Milan", text:"As someone obsessed with proportion and material, VELORA speaks my language. The attention to detail in the Silk Evening Gown was breathtaking. It moved like water.", rating:5 },
  ];
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i+1)%reviews.length), 5000);
    return () => clearInterval(t);
  }, []);
  const r = reviews[idx];
  return (
    <section id="testimonials" className="section-padding" style={{ background:"#0d0c0a", overflow:"hidden" }}>
      <div className="container-px" style={{ maxWidth:1400, margin:"0 auto", padding:"0 48px" }}>
        <div ref={ref} style={{ textAlign:"center", marginBottom:72 }}>
          <p className={`section-label ${inView?"anim-fade-up":""}`}>Client Stories</p>
          <h2 className={`serif ${inView?"anim-fade-up delay-1":""}`} style={{ fontSize:"clamp(36px,5vw,72px)", fontWeight:300, marginTop:16 }}>
            What They Say
          </h2>
        </div>
        <div className={`testimonial-card ${inView?"anim-scale delay-2":""}`} style={{
          maxWidth:800, margin:"0 auto",
          background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)",
          padding:"64px 72px", textAlign:"center", position:"relative", minHeight:300
        }}>
          {/* Quote mark */}
          <div style={{
            position:"absolute", top:-24, left:"50%", transform:"translateX(-50%)",
            width:48, height:48, background:"#0d0c0a", border:"1px solid rgba(201,169,110,0.3)",
            display:"flex", alignItems:"center", justifyContent:"center"
          }}>
            <span className="serif" style={{ fontSize:28, color:"#C9A96E", lineHeight:1 }}>"</span>
          </div>
          <div style={{ transition:"all 0.5s ease" }} key={idx}>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:28, gap:4 }}>
              {Array(r.rating).fill(0).map((_,i) => <span key={i} style={{ color:"#C9A96E", fontSize:14 }}>★</span>)}
            </div>
            <p className="serif" style={{ fontSize:"clamp(18px,2.5vw,26px)", fontWeight:300, lineHeight:1.65, color:"rgba(245,240,235,0.85)", marginBottom:40, fontStyle:"italic" }}>
              "{r.text}"
            </p>
            <div className="divider" style={{ margin:"0 auto 28px" }}/>
            <p style={{ fontWeight:600, fontSize:13, letterSpacing:2, textTransform:"uppercase" }}>{r.name}</p>
            <p style={{ fontSize:12, color:"rgba(245,240,235,0.35)", marginTop:4, letterSpacing:1 }}>{r.role}</p>
          </div>
        </div>
        {/* Dots */}
        <div style={{ display:"flex", justifyContent:"center", gap:10, marginTop:40 }}>
          {reviews.map((_,i) => (
            <button key={i} onClick={() => setIdx(i)} style={{
              width: i===idx?28:8, height:2, border:"none", cursor:"pointer",
              background: i===idx?"#C9A96E":"rgba(245,240,235,0.2)",
              transition:"all 0.4s ease", padding:0
            }}/>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .testimonial-card { padding:48px 28px !important; }
        }
      `}</style>
    </section>
  );
}

// ─── LOOKBOOK ─────────────────────────────────────────────────────────────────
function Lookbook() {
  const [ref, inView] = useInView();
  const [filter, setFilter] = useState("All");
  const filters = ["All","Women's","Men's","Accessories","Campaign"];
  const items = [
    { tag:"Women's", h:480, accent:"#1a1510" },
    { tag:"Campaign", h:320, accent:"#0d0f14" },
    { tag:"Men's", h:420, accent:"#14100a" },
    { tag:"Accessories", h:280, accent:"#0e140e" },
    { tag:"Women's", h:360, accent:"#140d1a" },
    { tag:"Campaign", h:500, accent:"#0d1118" },
  ];
  const visible = items.filter(i => filter==="All" || i.tag===filter);
  return (
    <section id="lookbook" className="section-padding" style={{ background:"#080808" }}>
      <div className="container-px" style={{ maxWidth:1400, margin:"0 auto", padding:"0 48px" }}>
        <div ref={ref} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:24, marginBottom:52 }}>
          <div>
            <p className={`section-label ${inView?"anim-fade-up":""}`}>Visual Stories</p>
            <h2 className={`serif ${inView?"anim-fade-up delay-1":""}`} style={{ fontSize:"clamp(36px,5vw,72px)", fontWeight:300, marginTop:16 }}>
              Lookbook
            </h2>
          </div>
          <div className={inView?"anim-fade-up delay-2":""} style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)} className="tap-target" style={{
                background: f===filter?"#C9A96E":"transparent",
                border:`1px solid ${f===filter?"#C9A96E":"rgba(255,255,255,0.1)"}`,
                color: f===filter?"#0a0a0a":"rgba(245,240,235,0.5)",
                padding:"8px 20px", fontSize:10, letterSpacing:2.5, textTransform:"uppercase",
                cursor:"pointer", fontFamily:"Inter,sans-serif", transition:"all 0.3s ease"
              }}>{f}</button>
            ))}
          </div>
        </div>
        <div style={{ columns:"3 280px", columnGap:"16px" }}>
          {visible.map((item,i) => (
            <div key={i} className="card-hover img-zoom lookbook-item" style={{
              breakInside:"avoid", marginBottom:16, cursor:"pointer",
              position:"relative", overflow:"hidden",
              background:`linear-gradient(160deg, ${item.accent}, #0a0a0a)`,
              height:item.h, display:"flex", alignItems:"center", justifyContent:"center",
              animation: inView ? `fadeIn 0.6s ease ${i*0.1}s both` : "none"
            }}>
              <div style={{ textAlign:"center" }}>
                <span className="serif" style={{ fontSize:48, color:"rgba(201,169,110,0.15)", fontWeight:300 }}>V</span>
              </div>
              <div style={{
                position:"absolute", bottom:0, left:0, right:0, padding:"20px",
                background:"linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                opacity:0, transition:"opacity 0.4s ease"
              }} className="lookbook-overlay">
                <span style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:"#C9A96E" }}>{item.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .lookbook-item:hover .lookbook-overlay { opacity:1 !important; }
        @media (hover: none) {
          .lookbook-item .lookbook-overlay { opacity:1 !important; background:linear-gradient(to top, rgba(0,0,0,0.75), transparent) !important; }
        }
      `}</style>
    </section>
  );
}

// ─── NEWSLETTER ──────────────────────────────────────────────────────────────
function Newsletter() {
  const [ref, inView] = useInView();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const { pushToast } = useStore();

  const handleSubscribe = () => {
    const trimmed = email.trim();
    if (!trimmed) { setError("Please enter your email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setError("That email doesn't look quite right."); return; }
    setError("");
    setSent(true);
    pushToast("You're on the list");
  };

  return (
    <section className="section-padding" style={{ background:"#0d0c0a", position:"relative", overflow:"hidden" }}>
      <div style={{
        position:"absolute", inset:0,
        background:"radial-gradient(ellipse at 50% 50%, rgba(201,169,110,0.04) 0%, transparent 65%)"
      }}/>
      <div ref={ref} className="container-px" style={{ maxWidth:700, margin:"0 auto", padding:"0 48px", textAlign:"center", position:"relative" }}>
        <p className={`section-label ${inView?"anim-fade-up":""}`}>Stay in the Conversation</p>
        <h2 className={`serif ${inView?"anim-fade-up delay-1":""}`} style={{ fontSize:"clamp(36px,5vw,64px)", fontWeight:300, marginTop:20, marginBottom:20 }}>
          Join the Inner Circle
        </h2>
        <p className={`${inView?"anim-fade-up delay-2":""}`} style={{ fontSize:14, color:"rgba(245,240,235,0.45)", lineHeight:1.8, marginBottom:48, fontWeight:300 }}>
          First access to new collections, private sale invitations, and styling notes from our creative director — delivered to your inbox, never your spam.
        </p>
        {sent ? (
          <div className="anim-scale" style={{ padding:"32px", border:"1px solid rgba(201,169,110,0.3)" }}>
            <span className="serif" style={{ fontSize:28, color:"#C9A96E" }}>Welcome to VELORA.</span>
          </div>
        ) : (
          <div className={`${inView?"anim-fade-up delay-3":""}`}>
            <div className="newsletter-row" style={{ display:"flex", gap:0, maxWidth:520, margin:"0 auto" }}>
              <input
                type="email" placeholder="Your email address" value={email}
                onChange={e => { setEmail(e.target.value); if (error) setError(""); }}
                onKeyDown={e => { if (e.key === "Enter") handleSubscribe(); }}
                aria-invalid={!!error} aria-describedby="newsletter-error"
                style={{ flex:1, borderRight:"none", borderColor: error ? "#c98080" : undefined }}
              />
              <button className="btn-primary" onClick={handleSubscribe}
                style={{ whiteSpace:"nowrap", borderLeft:"none" }}>
                Subscribe
              </button>
            </div>
            {error && <p id="newsletter-error" style={{ marginTop:12, fontSize:12, color:"#c98080" }}>{error}</p>}
          </div>
        )}
        <p className={`${inView?"anim-fade-up delay-4":""}`} style={{ marginTop:20, fontSize:11, color:"rgba(245,240,235,0.25)", letterSpacing:1 }}>
          Unsubscribe at any time. We respect your privacy.
        </p>
      </div>
      <style>{`
        @media (max-width: 540px) {
          .newsletter-row { flex-direction:column; gap:12px !important; }
          .newsletter-row input { border-right:1px solid rgba(255,255,255,0.1) !important; }
          .newsletter-row button { border-left:1px solid #C9A96E !important; width:100%; }
        }
      `}</style>
    </section>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
function FAQ() {
  const [ref, inView] = useInView();
  const [open, setOpen] = useState(null);
  const faqs = [
    { q:"What materials does VELORA use?", a:"We source exclusively from certified mills in Italy and Scotland, using organic cottons, hand-combed cashmere, and Lyocell-blend silks. All materials carry OEKO-TEX and GOTS certifications." },
    { q:"How do I determine my size?", a:"Each product page includes a detailed size guide with body measurements. Our client concierge is also available via chat or phone to provide personalized sizing recommendations." },
    { q:"What is your returns policy?", a:"We accept returns within 30 days of delivery. Items must be unworn with tags attached. Complimentary return labels are provided. Refunds are processed within 5 business days." },
    { q:"Do you offer international shipping?", a:"Yes. VELORA ships to 32 countries via DHL Express. Delivery typically takes 2–5 business days. Duties and taxes are calculated at checkout and included in the final price." },
    { q:"Can I request bespoke alterations?", a:"Absolutely. Our atelier team accepts alteration requests on select pieces. Contact our styling team with your measurements and we will guide you through the bespoke process." },
  ];
  return (
    <section className="section-padding" style={{ background:"#0a0a0a" }}>
      <div className="container-px" style={{ maxWidth:820, margin:"0 auto", padding:"0 48px" }}>
        <div ref={ref} style={{ textAlign:"center", marginBottom:72 }}>
          <p className={`section-label ${inView?"anim-fade-up":""}`}>Common Questions</p>
          <h2 className={`serif ${inView?"anim-fade-up delay-1":""}`} style={{ fontSize:"clamp(36px,5vw,64px)", fontWeight:300, marginTop:16 }}>
            FAQ
          </h2>
        </div>
        <div>
          {faqs.map((f,i) => (
            <div key={i} className={inView?`anim-fade-up delay-${(i%4)+1}`:""} style={{
              borderBottom:"1px solid rgba(255,255,255,0.06)", overflow:"hidden"
            }}>
              <button onClick={() => setOpen(open===i?null:i)} style={{
                width:"100%", background:"none", border:"none", cursor:"pointer",
                padding:"28px 0", display:"flex", justifyContent:"space-between", alignItems:"center",
                color:"#f5f0eb", textAlign:"left"
              }}>
                <span className="serif" style={{ fontSize:20, fontWeight:400, paddingRight:24 }}>{f.q}</span>
                <span style={{
                  width:28, height:28, border:"1px solid rgba(201,169,110,0.3)", flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color:"#C9A96E", fontSize:16, transition:"transform 0.4s ease",
                  transform: open===i?"rotate(45deg)":"rotate(0)"
                }}>+</span>
              </button>
              <div style={{
                maxHeight: open===i?300:0, overflow:"hidden",
                transition:"max-height 0.5s cubic-bezier(.23,1,.32,1)"
              }}>
                <p style={{ fontSize:14, lineHeight:1.9, color:"rgba(245,240,235,0.5)", paddingBottom:28, fontWeight:300 }}>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CONTACT ─────────────────────────────────────────────────────────────────
function Contact() {
  const [ref, inView] = useInView();
  const [form, setForm] = useState({ name:"", email:"", message:"" });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const { pushToast } = useStore();

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Please enter your name.";
    if (!form.email.trim()) errs.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = "That email doesn't look quite right.";
    if (!form.message.trim()) errs.message = "Tell us a little about how we can help.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSend = () => {
    if (!validate()) return;
    setSent(true);
    pushToast("Message sent — we'll reply within 24 hours");
  };

  return (
    <section id="contact" className="section-padding" style={{ background:"#080808" }}>
      <div className="container-px" style={{ maxWidth:1400, margin:"0 auto", padding:"0 48px" }}>
        <div ref={ref} className="grid-2col" style={{ gap:96, alignItems:"start" }}>
          <div>
            <p className={`section-label ${inView?"anim-fade-up":""}`}>Get in Touch</p>
            <h2 className={`serif ${inView?"anim-fade-up delay-1":""}`} style={{ fontSize:"clamp(36px,4vw,56px)", fontWeight:300, marginTop:20, marginBottom:32 }}>
              We'd Love to<br/><em style={{ color:"#C9A96E" }}>Hear From You</em>
            </h2>
            <div className={`divider ${inView?"anim-fade-in delay-2":""}`} style={{ marginBottom:40 }}/>
            {[
              ["Location","8 Rue du Faubourg Saint-Honoré, 75008 Paris, France"],
              ["Email","contact@velora-fashion.com"],
              ["Phone","+33 1 42 65 91 00"],
              ["Hours","Mon–Sat 10:00 – 19:00 CET"],
            ].map(([label, val], i) => (
              <div key={label} className={inView?`anim-fade-up delay-${i+2}`:""} style={{ marginBottom:28 }}>
                <p style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:"#C9A96E", marginBottom:6 }}>{label}</p>
                <p style={{ fontSize:14, color:"rgba(245,240,235,0.6)", lineHeight:1.6 }}>{val}</p>
              </div>
            ))}
            {/* Map placeholder */}
            <div className={inView?"anim-scale delay-4":""} style={{
              marginTop:40, height:220, background:"rgba(255,255,255,0.02)",
              border:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center",
              justifyContent:"center", position:"relative", overflow:"hidden"
            }}>
              <div style={{
                position:"absolute", inset:0,
                background:`repeating-linear-gradient(0deg,rgba(201,169,110,0.03) 0,rgba(201,169,110,0.03) 1px,transparent 1px,transparent 40px),
                  repeating-linear-gradient(90deg,rgba(201,169,110,0.03) 0,rgba(201,169,110,0.03) 1px,transparent 1px,transparent 40px)`
              }}/>
              <div style={{ textAlign:"center", position:"relative", zIndex:1 }}>
                <span style={{ fontSize:28, marginBottom:8, display:"block" }}>◉</span>
                <p style={{ fontSize:10, letterSpacing:3, color:"rgba(201,169,110,0.5)", textTransform:"uppercase" }}>
                  Paris, France
                </p>
              </div>
            </div>
          </div>
          {/* Form */}
          <div className={`contact-form-col ${inView?"anim-fade-up delay-3":""}`}>
            {sent ? (
              <div className="anim-scale" style={{
                padding:"64px 48px", border:"1px solid rgba(201,169,110,0.2)",
                textAlign:"center", marginTop:80
              }}>
                <span className="serif" style={{ fontSize:36, color:"#C9A96E", display:"block", marginBottom:16 }}>Thank You.</span>
                <p style={{ color:"rgba(245,240,235,0.5)", fontSize:14 }}>We'll be in touch within 24 hours.</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:4, marginTop:80 }} className="contact-form-fields">
                {[["Your Name","name","text"],["Email Address","email","email"]].map(([ph, key, type]) => (
                  <div key={key} style={{ marginBottom:12 }}>
                    <input type={type} placeholder={ph} value={form[key]}
                      onChange={e => { setForm({...form,[key]:e.target.value}); if (errors[key]) setErrors({...errors, [key]:null}); }}
                      style={{ borderColor: errors[key] ? "#c98080" : undefined }}
                      aria-invalid={!!errors[key]}/>
                    {errors[key] && <p style={{ fontSize:12, color:"#c98080", marginTop:6 }}>{errors[key]}</p>}
                  </div>
                ))}
                <div style={{ marginBottom:8 }}>
                  <textarea placeholder="Tell us how we can help..." rows={6} value={form.message}
                    onChange={e => { setForm({...form,message:e.target.value}); if (errors.message) setErrors({...errors, message:null}); }}
                    style={{ resize:"vertical", borderColor: errors.message ? "#c98080" : undefined }}
                    aria-invalid={!!errors.message}/>
                  {errors.message && <p style={{ fontSize:12, color:"#c98080", marginTop:6 }}>{errors.message}</p>}
                </div>
                <button className="btn-primary" style={{ marginTop:8, width:"100%", padding:"18px" }}
                  onClick={handleSend}>
                  Send Message
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .contact-form-fields { margin-top: 0 !important; }
          .contact-form-col .anim-scale { margin-top: 0 !important; }
        }
      `}</style>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function Footer() {
  const year = new Date().getFullYear();
  const { pushToast } = useStore();
  const cols = [
    { title:"Shop", links:["New Arrivals","Women's","Men's","Accessories","Limited Edition","Sale"] },
    { title:"Company", links:["About VELORA","Sustainability","Careers","Press","Partnerships","Investors"] },
    { title:"Support", links:["Size Guide","Returns & Exchanges","Shipping","Contact Us","FAQs","Gift Cards"] },
  ];
  const notify = (label) => pushToast(`${label} — demo project, no live page`);
  return (
    <footer style={{ background:"#060606", borderTop:"1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ maxWidth:1400, margin:"0 auto", padding:"80px 48px 40px" }}>
        <div className="grid-footer" style={{ gap:64, marginBottom:80 }}>
          <div>
            <button onClick={() => window.scrollTo({ top:0, behavior:"smooth" })} style={{
              display:"flex", alignItems:"center", gap:12, marginBottom:24,
              background:"none", border:"none", cursor:"pointer", padding:0
            }} aria-label="Back to top">
              <span style={{ width:36, height:36, border:"1px solid #C9A96E", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span className="serif" style={{ fontSize:20, color:"#C9A96E" }}>V</span>
              </span>
              <span className="serif" style={{ fontSize:20, letterSpacing:6, fontWeight:300, color:"#f5f0eb" }}>VELORA</span>
            </button>
            <p style={{ fontSize:13, lineHeight:1.9, color:"rgba(245,240,235,0.35)", maxWidth:300, marginBottom:32, fontWeight:300 }}>
              Luxury fashion for those who understand that true elegance is never about what you wear — it's about who you become wearing it.
            </p>
            <div style={{ display:"flex", gap:16 }}>
              {["Instagram","Pinterest","Twitter","LinkedIn"].map(s => (
                <button key={s} className="icon-btn tap-target" onClick={() => notify(s)} aria-label={`VELORA on ${s} (opens in new tab in a real site)`} style={{
                  background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)",
                  color:"rgba(245,240,235,0.4)", width:38, height:38,
                  fontSize:11, transition:"all 0.3s", letterSpacing:0
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="#C9A96E"; e.currentTarget.style.color="#C9A96E"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"; e.currentTarget.style.color="rgba(245,240,235,0.4)"; }}>
                  {s[0]}
                </button>
              ))}
            </div>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <p style={{ fontSize:10, letterSpacing:3.5, textTransform:"uppercase", color:"#C9A96E", marginBottom:24 }}>{col.title}</p>
              <ul style={{ listStyle:"none" }}>
                {col.links.map(l => (
                  <li key={l} style={{ marginBottom:12 }}>
                    <button onClick={() => notify(l)} style={{
                      fontSize:13, color:"rgba(245,240,235,0.4)", textDecoration:"none",
                      transition:"color 0.3s", fontWeight:300, background:"none", border:"none",
                      padding:0, cursor:"pointer", textAlign:"left", fontFamily:"'Inter',sans-serif", minHeight:24
                    }}
                    onMouseEnter={e => e.target.style.color="#C9A96E"}
                    onMouseLeave={e => e.target.style.color="rgba(245,240,235,0.4)"}>
                      {l}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* Bottom bar */}
        <div style={{
          borderTop:"1px solid rgba(255,255,255,0.05)", paddingTop:32,
          display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16
        }}>
          <p style={{ fontSize:11, color:"rgba(245,240,235,0.25)", letterSpacing:1 }}>
            © {year} VELORA. All rights reserved. A demonstration project.
          </p>
          <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
            {["Privacy Policy","Terms of Service","Cookie Settings"].map(l => (
              <button key={l} onClick={() => notify(l)} style={{
                fontSize:11, color:"rgba(245,240,235,0.25)", textDecoration:"none",
                letterSpacing:0.5, transition:"color 0.3s", background:"none", border:"none",
                padding:0, cursor:"pointer", fontFamily:"'Inter',sans-serif"
              }}
              onMouseEnter={e => e.target.style.color="#C9A96E"}
              onMouseLeave={e => e.target.style.color="rgba(245,240,235,0.25)"}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [loading, setLoading] = useState(true);
  const scrollY = useScrollY();
  useEffect(() => { const t = setTimeout(() => setLoading(false), 2800); return () => clearTimeout(t); }, []);
  return (
    <StoreProvider>
      <FontLink/>
      <LoadingScreen done={!loading}/>
      <Nav scrollY={scrollY}/>
      <main>
        <Hero/>
        <Marquee/>
        <Collections/>
        <BestSellers/>
        <About/>
        <WhyUs/>
        <Testimonials/>
        <Lookbook/>
        <Newsletter/>
        <FAQ/>
        <Contact/>
      </main>
      <Footer/>
      <ToastStack/>
      <QuickViewModal/>
      <CartDrawer/>
      <SearchOverlay/>
    </StoreProvider>
  );
}
