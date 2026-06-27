import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

const PRODUCTS = [
  { id:1, name:"Maison Noir Blazer", category:"Women's", price:2890, tag:"Bestseller", color:"#1a1a1a", sizes:["XS","S","M","L","XL"], desc:"A sculpted silhouette in Italian wool-mohair, finished with hand-stitched lapels and horn buttons from a third-generation atelier in Biella." },
  { id:2, name:"Heritage Cashmere Coat", category:"Men's", price:4200, tag:"New", color:"#1c1814", sizes:["S","M","L","XL","XXL"], desc:"Double-faced cashmere from the Scottish Borders, cut for an architectural drape that softens with every wear." },
  { id:3, name:"Silk Evening Gown", category:"Women's", price:6500, tag:"Limited", color:"#140d1a", sizes:["XS","S","M","L"], desc:"Bias-cut mulberry silk that moves like water, with a hand-draped cowl back reserved for our Limited Edition clientele." },
  { id:4, name:"Tailored Wool Suit", category:"Men's", price:3800, tag:"Classic", color:"#0d1118", sizes:["46","48","50","52","54"], desc:"A two-piece suit in Super 150s wool, half-canvassed and finished with pick-stitched edges for a lifetime of re-tailoring." },
  { id:5, name:"Velvet Midi Dress", category:"Women's", price:1950, tag:"New", color:"#1a0d0d", sizes:["XS","S","M","L","XL"], desc:"Devoré velvet with a fluid midi cut, designed to transition from afternoon meetings to evening events." },
  { id:6, name:"Structured Leather Tote", category:"Accessories", price:1200, tag:"Bestseller", color:"#10140d", sizes:["One Size"], desc:"Full-grain Italian leather over a reinforced frame, with an interior structured for a 15-inch laptop and the everyday essentials." },
];

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

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setInView(true);
        setHasAnimated(true);
      }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, hasAnimated]);
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

const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; -webkit-tap-highlight-color: transparent; }
    body { background: #0a0a0a; color: #f5f0eb; font-family: 'Inter', sans-serif; overflow-x: hidden; }
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: #0a0a0a; }
    ::-webkit-scrollbar-thumb { background: #C9A96E; border-radius: 2px; }
    .serif { font-family: 'Cormorant Garamond', serif; }
    .gold { color: #C9A96E; }

    @keyframes fadeUp { from { opacity:0; transform:translateY(50px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes scaleIn { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
    @keyframes slideInLeft { from { opacity:0; transform:translateX(-40px); } to { opacity:1; transform:translateX(0); } }
    @keyframes slideInRight { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
    @keyframes float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
    @keyframes shimmer { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
    @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
    @keyframes pulse-glow { 0%,100%{box-shadow:0 0 0 0 rgba(201,169,110,0);} 50%{box-shadow:0 0 20px 2px rgba(201,169,110,0.15);} }
    @keyframes rotate-slow { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }

    .anim-fade-up { animation: fadeUp 0.9s cubic-bezier(.23,1,.32,1) both; }
    .anim-fade-in { animation: fadeIn 1.2s ease both; }
    .anim-scale { animation: scaleIn 0.8s cubic-bezier(.23,1,.32,1) both; }
    .anim-slide-left { animation: slideInLeft 0.8s cubic-bezier(.23,1,.32,1) both; }
    .anim-slide-right { animation: slideInRight 0.8s cubic-bezier(.23,1,.32,1) both; }
    .delay-1 { animation-delay: 0.15s; }
    .delay-2 { animation-delay: 0.3s; }
    .delay-3 { animation-delay: 0.45s; }
    .delay-4 { animation-delay: 0.6s; }
    .delay-5 { animation-delay: 0.75s; }
    .delay-6 { animation-delay: 0.9s; }

    .marquee-track { display:flex; width:max-content; animation: marquee 30s linear infinite; }
    .card-hover { transition: transform 0.6s cubic-bezier(.23,1,.32,1), box-shadow 0.6s ease; }
    .card-hover:hover { transform: translateY(-10px); box-shadow: 0 40px 80px rgba(0,0,0,0.6); }
    .img-zoom { overflow: hidden; }
    .img-zoom img, .img-zoom > div:first-child { transition: transform 1s cubic-bezier(.23,1,.32,1); }
    .img-zoom:hover img, .img-zoom:hover > div:first-child { transform: scale(1.08); }

    .btn-primary { 
      background: #C9A96E; color: #0a0a0a; border: none; padding: 14px 36px;
      font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 3px;
      text-transform: uppercase; cursor: pointer; transition: all 0.4s cubic-bezier(.23,1,.32,1); 
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      min-height: 48px; position: relative; overflow: hidden;
    }
    .btn-primary::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transform: translateX(-100%);
      transition: transform 0.6s ease;
    }
    .btn-primary:hover::before { transform: translateX(100%); }
    .btn-primary:hover { background: #d4b87a; transform: translateY(-3px); box-shadow: 0 16px 40px rgba(201,169,110,0.35); }
    .btn-primary:active { transform: translateY(-1px) scale(0.98); }

    .btn-outline { 
      background: transparent; color: #f5f0eb; border: 1px solid rgba(245,240,235,0.25); padding: 14px 36px;
      font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 3px;
      text-transform: uppercase; cursor: pointer; transition: all 0.4s cubic-bezier(.23,1,.32,1); 
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      min-height: 48px; position: relative; overflow: hidden;
    }
    .btn-outline:hover { border-color: #C9A96E; color: #C9A96E; transform: translateY(-3px); box-shadow: 0 12px 32px rgba(201,169,110,0.1); }
    .btn-outline:active { transform: translateY(-1px) scale(0.98); }

    .section-label {
      font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 4.5px;
      text-transform: uppercase; color: #C9A96E;
    }
    .glass { 
      background: rgba(10,10,10,0.8); backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px);
      border-bottom: 1px solid rgba(201,169,110,0.08);
    }
    .glass-card {
      background: rgba(255,255,255,0.025); backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.06);
      transition: all 0.4s ease;
    }
    .glass-card:hover {
      background: rgba(201,169,110,0.04);
      border-color: rgba(201,169,110,0.15);
    }
    input, textarea {
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
      color: #f5f0eb; padding: 16px 20px; width: 100%; font-family: 'Inter', sans-serif;
      font-size: 14px; outline: none; transition: all 0.3s ease; border-radius: 0;
      -webkit-appearance: none; appearance: none;
    }
    input:focus, textarea:focus { border-color: #C9A96E; background: rgba(201,169,110,0.03); }
    input::placeholder, textarea::placeholder { color: rgba(245,240,235,0.3); font-size: 13px; }
    .divider { width: 48px; height: 1px; background: linear-gradient(90deg, #C9A96E, transparent); }
    .nav-link {
      font-size: 11px; font-weight: 500; letter-spacing: 2.5px; text-transform: uppercase;
      color: rgba(245,240,235,0.7); text-decoration: none; position: relative; transition: all 0.3s ease;
      padding: 8px 0;
    }
    .nav-link::after {
      content:''; position:absolute; bottom:0; left:0; width:0; height:1px;
      background:#C9A96E; transition: width 0.35s cubic-bezier(.23,1,.32,1);
    }
    .nav-link:hover { color: #C9A96E; }
    .nav-link:hover::after { width: 100%; }
    .floating { animation: float 5s ease-in-out infinite; }
    .section-padding { padding: 120px 0; }
    .container-px { padding-left: 48px; padding-right: 48px; }
    .tap-target { min-height:44px; min-width:44px; }
    .icon-btn {
      background:none; border:none; cursor:pointer; color:rgba(245,240,235,0.6);
      display:flex; align-items:center; justify-content:center;
      width:44px; height:44px; border-radius: 50%;
      transition: all 0.3s ease;
    }
    .icon-btn:hover { color:#C9A96E; background: rgba(201,169,110,0.08); }
    .icon-btn:active { transform: scale(0.92); }
    .cart-badge {
      position:absolute; top:-4px; right:-4px; background:#C9A96E; color:#0a0a0a;
      font-size:9px; font-weight:700; min-width:18px; height:18px; border-radius:50%;
      display:flex; align-items:center; justify-content:center; line-height:1; padding:0 4px;
    }

    @keyframes toastIn { from { opacity:0; transform:translateY(16px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }
    @keyframes overlayIn { from { opacity:0; } to { opacity:1; } }
    @keyframes drawerIn { from { transform:translateX(100%); } to { transform:translateX(0); } }
    @keyframes modalIn { from { opacity:0; transform:translate(-50%,-48%) scale(0.96); } to { opacity:1; transform:translate(-50%,-50%) scale(1); } }
    .toast-stack {
      position:fixed; bottom:28px; right:28px; z-index:300; display:flex; flex-direction:column; gap:12px;
    }
    .toast {
      background:#141210; border:1px solid rgba(201,169,110,0.3); color:#f5f0eb;
      padding:16px 24px; font-size:12px; letter-spacing:1px; box-shadow:0 20px 50px rgba(0,0,0,0.6);
      animation: toastIn 0.4s cubic-bezier(.23,1,.32,1) both; display:flex; align-items:center; gap:12px;
      max-width: calc(100vw - 56px); border-radius: 2px;
    }
    .modal-overlay, .drawer-overlay {
      position:fixed; inset:0; background:rgba(3,3,3,0.75); backdrop-filter:blur(8px); z-index:250;
      animation: overlayIn 0.35s ease both;
    }
    .modal-box {
      position:fixed; top:50%; left:50%; z-index:251; background:#0d0c0a;
      border:1px solid rgba(201,169,110,0.15); width:min(900px, 94vw); max-height:90vh; overflow:auto;
      animation: modalIn 0.4s cubic-bezier(.23,1,.32,1) both; border-radius: 2px;
    }
    .drawer-box {
      position:fixed; top:0; right:0; bottom:0; z-index:251; background:#0d0c0a;
      border-left:1px solid rgba(201,169,110,0.12); width:min(440px, 100vw);
      animation: drawerIn 0.45s cubic-bezier(.23,1,.32,1) both; display:flex; flex-direction:column;
    }
    .grid-2col { display:grid; grid-template-columns: 1fr 1fr; }
    .grid-stats-4 { display:grid; grid-template-columns: repeat(4,1fr); }
    .grid-footer { display:grid; grid-template-columns: 2fr 1fr 1fr 1fr; }

    .anim-fade-up, .anim-fade-in, .anim-scale, .anim-slide-left, .anim-slide-right {
      opacity: 0;
    }
    .anim-fade-up[class*="delay-"], .anim-fade-in[class*="delay-"], .anim-scale[class*="delay-"], .anim-slide-left[class*="delay-"], .anim-slide-right[class*="delay-"] {
      opacity: 0;
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: 0.001s !important; animation-iteration-count: 1 !important; transition-duration: 0.001s !important; scroll-behavior:auto !important; }
      .anim-fade-up, .anim-fade-in, .anim-scale, .anim-slide-left, .anim-slide-right { opacity: 1 !important; }
    }
  `}</style>
);

function LoadingScreen({ done }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(timer); return 100; }
        return p + 1.5;
      });
    }, 32);
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
      transition: "opacity 1s ease 0.3s"
    }}>
      <div style={{ position:"relative", marginBottom:48 }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" stroke="rgba(201,169,110,0.1)" strokeWidth="1" fill="none"/>
          <circle cx="40" cy="40" r="36" stroke="#C9A96E" strokeWidth="1" fill="none"
            strokeDasharray={`${progress * 2.26} 226`} strokeLinecap="round"
            style={{ transform:"rotate(-90deg)", transformOrigin:"center", transition:"stroke-dasharray 0.15s" }}/>
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span className="serif" style={{ fontSize:32, fontWeight:300, color:"#C9A96E", letterSpacing:2 }}>V</span>
        </div>
      </div>
      <p className="serif" style={{ fontSize:28, fontWeight:300, letterSpacing:10, color:"#f5f0eb", marginBottom:10 }}>VELORA</p>
      <p style={{ fontSize:10, letterSpacing:5, color:"rgba(201,169,110,0.5)", textTransform:"uppercase" }}>Luxury Fashion</p>
      <div style={{ position:"absolute", bottom:60, width:120, height:1, background:"linear-gradient(90deg, transparent, rgba(201,169,110,0.3), transparent)" }}/>
    </div>
  );
}

function ToastStack() {
  const { toasts } = useStore();
  if (!toasts.length) return null;
  return (
    <div className="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className="toast">
          <span style={{ color:"#C9A96E", fontSize:14 }}>✦</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

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
        <div className="qv-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr" }}>
          <div style={{
            background:`linear-gradient(135deg, ${p.color}, #0a0a0a)`, minHeight:340, display:"flex", alignItems:"center", justifyContent:"center",
            position:"relative", padding:48, overflow:"hidden"
          }}>
            <div style={{
              position:"absolute", inset:0,
              background:`repeating-linear-gradient(45deg, rgba(201,169,110,0.02) 0, rgba(201,169,110,0.02) 1px, transparent 1px, transparent 60px)`
            }}/>
            <div style={{ position:"relative", zIndex:1, textAlign:"center" }}>
              <div style={{
                width:100, height:100, border:"1px solid rgba(201,169,110,0.2)",
                display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px"
              }} className="floating">
                <span className="serif" style={{ fontSize:48, color:"rgba(201,169,110,0.35)", fontWeight:300 }}>V</span>
              </div>
              <p style={{ fontSize:9, letterSpacing:4, color:"rgba(201,169,110,0.3)", textTransform:"uppercase" }}>Product Image</p>
            </div>
            <button onClick={() => setQuickViewProduct(null)} className="icon-btn" style={{
              position:"absolute", top:16, left:16, background:"rgba(10,10,10,0.6)", color:"#f5f0eb"
            }} aria-label="Close quick view">✕</button>
          </div>
          <div style={{ padding:"48px 44px 48px 12px" }}>
            <p style={{ fontSize:10, letterSpacing:2.5, textTransform:"uppercase", color:"rgba(245,240,235,0.35)", marginBottom:12 }}>{p.category}</p>
            <h3 className="serif" style={{ fontSize:32, fontWeight:400, marginBottom:12, paddingRight:20, lineHeight:1.1 }}>{p.name}</h3>
            <p style={{ fontSize:22, color:"#C9A96E", fontWeight:500, marginBottom:24, letterSpacing:0.5 }}>{formatPrice(p.price)}</p>
            <p style={{ fontSize:14, lineHeight:1.85, color:"rgba(245,240,235,0.5)", marginBottom:32, fontWeight:300 }}>{p.desc}</p>
            <p style={{ fontSize:10, letterSpacing:2.5, textTransform:"uppercase", color:"rgba(245,240,235,0.4)", marginBottom:12 }}>Select Size</p>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:32 }}>
              {p.sizes.map(s => (
                <button key={s} onClick={() => setSize(s)} className="tap-target" style={{
                  padding:"0 18px", minWidth:48, minHeight:40, background: size===s ? "#C9A96E" : "transparent",
                  color: size===s ? "#0a0a0a" : "rgba(245,240,235,0.7)",
                  border:`1px solid ${size===s ? "#C9A96E" : "rgba(255,255,255,0.12)"}`,
                  fontSize:12, cursor:"pointer", transition:"all 0.3s ease", fontFamily:"Inter,sans-serif",
                  fontWeight: size===s ? 600 : 400
                }}>{s}</button>
              ))}
            </div>
            <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
              <button className="btn-primary" style={{ flex:1, minWidth:180 }}
                onClick={() => { addToCart(p, size); setQuickViewProduct(null); }}>
                Add to Bag
              </button>
              <button className="btn-outline tap-target" style={{ width:56, padding:0, flex:"0 0 auto", fontSize:20 }}
                onClick={() => toggleWish(p)} aria-label="Toggle wishlist">
                {isWished ? "♥" : "♡"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

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
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"28px 32px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <span className="serif" style={{ fontSize:22, letterSpacing:2 }}>Your Bag ({cart.reduce((s,i)=>s+i.qty,0)})</span>
          <button className="icon-btn" onClick={() => setCartOpen(false)} aria-label="Close bag" style={{ width: 44, height: 44 }}>✕</button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"12px 32px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign:"center", padding:"100px 0", color:"rgba(245,240,235,0.35)" }}>
              <span style={{ fontSize:36, display:"block", marginBottom:20, color:"rgba(201,169,110,0.2)" }}>◇</span>
              <p style={{ fontSize:14, marginBottom:28, fontWeight:300 }}>Your bag is currently empty.</p>
              <button className="btn-outline" onClick={() => { setCartOpen(false); scrollToId("bestsellers"); }}>
                Browse Best Sellers
              </button>
            </div>
          ) : cart.map(item => (
            <div key={`${item.id}-${item.size}`} style={{ display:"flex", gap:18, padding:"24px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ width:76, height:96, background:item.color, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:2 }}>
                <span className="serif" style={{ fontSize:24, color:"rgba(201,169,110,0.25)" }}>V</span>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p className="serif" style={{ fontSize:16, marginBottom:4, fontWeight:400 }}>{item.name}</p>
                <p style={{ fontSize:11, color:"rgba(245,240,235,0.35)", marginBottom:10 }}>Size {item.size}</p>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <button onClick={() => updateQty(item.id, item.size, item.qty - 1)} className="icon-btn" style={{ width:30, height:30, border:"1px solid rgba(255,255,255,0.08)", borderRadius:2 }}>−</button>
                  <span style={{ fontSize:14, minWidth:20, textAlign:"center", fontWeight:500 }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.size, item.qty + 1)} className="icon-btn" style={{ width:30, height:30, border:"1px solid rgba(255,255,255,0.08)", borderRadius:2 }}>+</button>
                </div>
              </div>
              <div style={{ textAlign:"right", display:"flex", flexDirection:"column", justifyContent:"space-between", alignItems:"flex-end" }}>
                <span style={{ fontSize:14, color:"#C9A96E", fontWeight:500 }}>{formatPrice(item.price * item.qty)}</span>
                <button onClick={() => removeFromCart(item.id, item.size)} style={{ background:"none", border:"none", color:"rgba(245,240,235,0.25)", fontSize:11, cursor:"pointer", textDecoration:"underline", transition:"color 0.3s" }}
                  onMouseEnter={e => e.target.style.color="#c98080"}
                  onMouseLeave={e => e.target.style.color="rgba(245,240,235,0.25)"}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div style={{ padding:"28px 32px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20, alignItems:"center" }}>
              <span style={{ fontSize:12, color:"rgba(245,240,235,0.4)", letterSpacing:1.5, textTransform:"uppercase" }}>Subtotal</span>
              <span className="serif" style={{ fontSize:24, color:"#C9A96E", fontWeight:300 }}>{formatPrice(cartTotal)}</span>
            </div>
            <button className="btn-primary" style={{ width:"100%", padding:"16px" }}
              onClick={() => { pushToast("This is a demo — checkout isn't connected to payment."); }}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function SearchOverlay() {
  const { searchOpen, setSearchOpen, setQuickViewProduct } = useStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = searchOpen ? "hidden" : "";
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 80);
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
      <div onClick={e => e.stopPropagation()} style={{ maxWidth:720, margin:"100px auto 0", padding:"0 28px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:20, borderBottom:"1px solid rgba(201,169,110,0.25)", paddingBottom:20, marginBottom:28 }}>
          <span style={{ color:"#C9A96E", fontSize:20 }}>⊙</span>
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search products, categories..." autoFocus
            style={{ background:"none", border:"none", padding:0, fontSize:22, fontFamily:"'Cormorant Garamond',serif", color:"#f5f0eb", flex:1 }}/>
          <button className="icon-btn" onClick={() => setSearchOpen(false)} aria-label="Close search">✕</button>
        </div>
        {query.trim() && (
          <div style={{ maxHeight:"65vh", overflowY:"auto" }}>
            {results.length === 0 ? (
              <p style={{ color:"rgba(245,240,235,0.35)", fontSize:14, textAlign:"center", padding:"40px 0" }}>
                No pieces found for "{query}". Try "blazer", "coat", or "Women's".
              </p>
            ) : results.map(p => (
              <div key={p.id} style={{ display:"flex", alignItems:"center", gap:18, padding:"16px 0", borderBottom:"1px solid rgba(255,255,255,0.04)", cursor:"pointer", transition:"background 0.3s" }}
                onClick={() => { setQuickViewProduct(p); setSearchOpen(false); }}
                onMouseEnter={e => e.currentTarget.style.background="rgba(201,169,110,0.03)"}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                <div style={{ width:52, height:68, background:p.color, flexShrink:0, borderRadius:2, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span className="serif" style={{ fontSize:20, color:"rgba(201,169,110,0.2)" }}>V</span>
                </div>
                <div style={{ flex:1 }}>
                  <p className="serif" style={{ fontSize:17, marginBottom:2 }}>{p.name}</p>
                  <p style={{ fontSize:11, color:"rgba(245,240,235,0.35)" }}>{p.category}</p>
                </div>
                <span style={{ fontSize:14, color:"#C9A96E", fontWeight:500 }}>{formatPrice(p.price)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Nav({ scrollY }) {
  const [open, setOpen] = useState(false);
  const [wishOpen, setWishOpen] = useState(false);
  const scrolled = scrollY > 50;
  const links = ["Collections","Lookbook","About","Testimonials","Contact"];
  const { wished, toggleWish, setSearchOpen, setCartOpen, cartCount, setQuickViewProduct } = useStore();

  return (
    <>
      <nav className={`main-nav ${scrolled ? 'nav-scrolled' : ''}`} style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        padding: scrolled ? "14px 48px" : "24px 48px",
        transition: "all 0.5s cubic-bezier(.23,1,.32,1)",
        ...(scrolled ? { background:"rgba(8,8,8,0.9)", backdropFilter:"blur(32px)", WebkitBackdropFilter:"blur(32px)", borderBottom:"1px solid rgba(201,169,110,0.08)" } : {})
      }}>
        <div style={{ maxWidth:1440, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <button onClick={() => window.scrollTo({ top:0, behavior:"smooth" })} style={{
            textDecoration:"none", display:"flex", alignItems:"center", gap:12,
            background:"none", border:"none", cursor:"pointer", padding:0
          }} aria-label="VELORA — back to top">
            <span style={{
              width:34, height:34, border:"1px solid rgba(201,169,110,0.5)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0
            }}>
              <span className="serif" style={{ fontSize:20, color:"#C9A96E", fontWeight:300 }}>V</span>
            </span>
            <span className="serif nav-logo-text" style={{ fontSize:17, letterSpacing:7, color:"#f5f0eb", fontWeight:300 }}>VELORA</span>
          </button>
          <div style={{ display:"flex", gap:36, alignItems:"center" }} className="desktop-nav">
            {links.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="nav-link"
                onClick={e => { e.preventDefault(); scrollToId(l.toLowerCase()); }}>{l}</a>
            ))}
          </div>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <div style={{ position:"relative" }} className="wishlist-container">
              <button className="icon-btn" style={{ fontSize:18 }} onClick={() => setWishOpen(w => !w)}
                aria-label="Wishlist" aria-expanded={wishOpen}>
                {wished.length > 0 ? "♥" : "♡"}
              </button>
              {wished.length > 0 && <span className="cart-badge">{wished.length}</span>}
              {wishOpen && (
                <>
                  <div className="wishlist-overlay" style={{ position:"fixed", inset:0, zIndex:149 }} onClick={() => setWishOpen(false)} />
                  <div className="glass-card wishlist-dropdown" style={{
                    position:"absolute", top:"calc(100% + 14px)", right:0, width:320, zIndex:150,
                    padding:24, animation:"scaleIn 0.3s cubic-bezier(.23,1,.32,1) both", transformOrigin:"top right",
                    borderRadius:2
                  }}>
                    <p style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:"#C9A96E", marginBottom:16, fontWeight:600 }}>
                      Wishlist {wished.length > 0 && `(${wished.length})`}
                    </p>
                    {wished.length === 0 ? (
                      <p style={{ fontSize:13, color:"rgba(245,240,235,0.35)" }}>Nothing saved yet. Tap the heart on any piece.</p>
                    ) : (
                      <div style={{ display:"flex", flexDirection:"column", gap:14, maxHeight:300, overflowY:"auto" }}>
                        {wished.map(p => (
                          <div key={p.id} style={{ display:"flex", gap:12, alignItems:"center", cursor:"pointer", padding:"4px 0" }}
                            onClick={() => { setQuickViewProduct(p); setWishOpen(false); }}>
                            <div style={{ width:42, height:52, background:p.color, flexShrink:0, borderRadius:2, display:"flex", alignItems:"center", justifyContent:"center" }}>
                              <span className="serif" style={{ fontSize:16, color:"rgba(201,169,110,0.2)" }}>V</span>
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <p style={{ fontSize:13, color:"#f5f0eb", marginBottom:2 }}>{p.name}</p>
                              <p style={{ fontSize:11, color:"#C9A96E", fontWeight:500 }}>{formatPrice(p.price)}</p>
                            </div>
                            <button onClick={e => { e.stopPropagation(); toggleWish(p); }} style={{ background:"none", border:"none", color:"rgba(245,240,235,0.25)", cursor:"pointer", fontSize:14, transition:"color 0.3s" }}
                              onMouseEnter={e => e.target.style.color="#c98080"}
                              onMouseLeave={e => e.target.style.color="rgba(245,240,235,0.25)"}
                              aria-label="Remove from wishlist">✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <button className="icon-btn" style={{ fontSize:17 }} onClick={() => setSearchOpen(true)} aria-label="Search">⊙</button>
            <div style={{ position:"relative" }}>
              <button className="icon-btn" style={{ fontSize:18 }} onClick={() => setCartOpen(true)} aria-label="Shopping bag">⚭</button>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </div>
            <button className="btn-primary desktop-shop-btn" style={{ padding:"12px 28px", fontSize:10, marginLeft:8 }}
              onClick={() => scrollToId("bestsellers")}>Shop Now</button>
            <button onClick={() => setOpen(!open)} className="hamburger" style={{
              background:"none", border:"none", cursor:"pointer", display:"none", flexDirection:"column",
              gap:5, padding:4, width:40, height:40, alignItems:"center", justifyContent:"center", marginLeft:4
            }} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
              {[0,1,2].map(i => (
                <span key={i} style={{
                  width:22, height:1.5, background:"#f5f0eb", display:"block",
                  transition:"all 0.35s cubic-bezier(.23,1,.32,1)",
                  transform: open ? (i===0?"rotate(45deg) translate(4px,4px)":i===2?"rotate(-45deg) translate(4px,-4px)":"scale(0)") : "none",
                  opacity: open && i===1 ? 0 : 1
                }}/>
              ))}
            </button>
          </div>
        </div>
      </nav>
      <div className="mobile-menu" style={{
        position:"fixed", inset:0, zIndex:99, background:"rgba(5,5,5,0.98)",
        backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)", display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", gap:28, transition:"all 0.6s cubic-bezier(.23,1,.32,1)",
        opacity: open ? 1 : 0, pointerEvents: open ? "all" : "none",
        transform: open ? "translateY(0)" : "translateY(-30px)"
      }}>
        {links.map((l,i) => (
          <a key={l} href={`#${l.toLowerCase()}`} onClick={e => { e.preventDefault(); setOpen(false); setTimeout(() => scrollToId(l.toLowerCase()), 400); }} style={{
            textDecoration:"none", color:"#f5f0eb", fontSize:36, fontFamily:"'Cormorant Garamond',serif",
            fontWeight:300, letterSpacing:8, transition:`all 0.6s cubic-bezier(0.23,1,0.32,1) ${i*0.06}s`,
            opacity: open ? 1 : 0, transform: open ? "translateY(0)" : "translateY(40px)",
            display: "block", padding: "6px 0"
          }}>{l}</a>
        ))}
        <div style={{ display:"flex", gap:16, marginTop:16, flexWrap:"wrap", justifyContent:"center" }}>
          <button className="btn-outline tap-target" style={{ padding:"14px 28px" }}
            onClick={() => { setOpen(false); setTimeout(() => setCartOpen(true), 400); }}>
            Bag {cartCount > 0 && `(${cartCount})`}
          </button>
          <button className="btn-primary tap-target" style={{ padding:"14px 28px" }}
            onClick={() => { setOpen(false); setTimeout(() => scrollToId("bestsellers"), 400); }}>
            Shop Now
          </button>
        </div>
      </div>
    </>
  );
}

function Hero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    // Wait for loading screen to finish before starting hero animations
    const t = setTimeout(() => setLoaded(true), 3200);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="hero-section" style={{ 
      position:"relative", minHeight:"100vh", minHeight:"100dvh", overflow:"hidden", 
      display:"flex", flexDirection:"column", justifyContent:"center",
      background:"linear-gradient(135deg, #0a0a0a 0%, #12100e 40%, #0d0b08 100%)"
    }}>
      <div style={{
        position:"absolute", inset:0,
        background:`
          radial-gradient(ellipse at 20% 50%, rgba(201,169,110,0.03) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(201,169,110,0.02) 0%, transparent 40%)
        `,
        pointerEvents:"none"
      }}/>

      <div style={{
        position:"absolute", right:"5%", top:"50%", transform:"translateY(-50%)",
        width:"38%", maxWidth:520, aspectRatio:"3/4",
        display:"flex", alignItems:"center", justifyContent:"center",
        pointerEvents:"none"
      }} className="hero-deco-panel">
        <div style={{
          position:"absolute", inset:0,
          border:"1px solid rgba(201,169,110,0.08)",
          background:"linear-gradient(160deg, rgba(201,169,110,0.02) 0%, transparent 60%)"
        }}/>
        <div style={{
          position:"relative", width:"70%", aspectRatio:"1/1",
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          gap:20
        }}>
          <div style={{
            position:"absolute", inset:0,
            background:`
              repeating-linear-gradient(0deg, rgba(201,169,110,0.025) 0, rgba(201,169,110,0.025) 1px, transparent 1px, transparent 60px),
              repeating-linear-gradient(90deg, rgba(201,169,110,0.025) 0, rgba(201,169,110,0.025) 1px, transparent 1px, transparent 60px)
            `
          }}/>
          <div style={{
            width:100, height:100, border:"1px solid rgba(201,169,110,0.2)",
            display:"flex", alignItems:"center", justifyContent:"center"
          }} className="floating">
            <span className="serif" style={{ fontSize:52, color:"rgba(201,169,110,0.3)", fontWeight:300 }}>V</span>
          </div>
          <p style={{ fontSize:9, letterSpacing:5, color:"rgba(201,169,110,0.3)", textTransform:"uppercase" }}>
            Fashion Imagery
          </p>
        </div>
      </div>

      <div className="container-px hero-content" style={{ 
        position:"relative", zIndex:2, maxWidth:1440, margin:"0 auto", 
        padding:"0 48px", width:"100%", paddingTop:100 
      }}>
        <div style={{ maxWidth:560, width: "100%", opacity: loaded ? 1 : 0, transition: "opacity 0.6s ease" }}>
          {loaded && <>
            <p className="section-label anim-fade-up" style={{ marginBottom:28, opacity:0.8 }}>
              SS 2025 Collection
            </p>
            <h1 className="serif anim-fade-up delay-1" style={{
              fontSize:"clamp(36px, 6vw, 80px)", lineHeight:0.98, fontWeight:300,
              letterSpacing:"-0.5px", marginBottom:36, color:"#f5f0eb"
            }}>
              Redefining<br/>
              <em style={{ color:"#C9A96E", fontStyle:"italic" }}>Modern</em><br/>
              Fashion
            </h1>
            <div className="divider anim-fade-in delay-2" style={{ marginBottom:28 }}/>
            <p className="anim-fade-up delay-2" style={{
              fontSize:15, lineHeight:1.85, color:"rgba(245,240,235,0.55)", maxWidth:420, marginBottom:44, fontWeight:300
            }}>
              Where heritage craftsmanship meets contemporary vision. Each piece a statement, every silhouette a story told in the finest materials the world offers.
            </p>
            <div className="anim-fade-up delay-3 hero-buttons" style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
              <button className="btn-primary" onClick={() => scrollToId("collections")}>
                Explore Collection
              </button>
              <button className="btn-outline" onClick={() => scrollToId("about")}>
                Our Story
              </button>
            </div>
          </>}
        </div>
      </div>

      <div style={{
        position:"absolute", bottom:0, left:0, right:0,
        borderTop:"1px solid rgba(255,255,255,0.06)",
        background:"rgba(8,8,8,0.7)", backdropFilter:"blur(16px)",
        zIndex:3
      }}>
        <div className="container-px hero-stats-row" style={{ 
          maxWidth:1440, margin:"0 auto", padding:"28px 48px", 
          display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:24
        }}>
          {[
            ["12+","Years of Excellence"],
            ["48K+","Global Clients"],
            ["200+","Unique Designs"],
            ["94%","Satisfaction Rate"]
          ].map(([n,l]) => (
            <div key={l} style={{ display:"flex", alignItems:"baseline", gap:10, flex:"1 1 auto", justifyContent:"center", minWidth:160 }}>
              <span className="serif" style={{ fontSize:26, color:"#C9A96E", fontWeight:300 }}>{n}</span>
              <span style={{ fontSize:10, color:"rgba(245,240,235,0.35)", letterSpacing:1.5, textTransform:"uppercase", fontWeight:500 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-scroll-indicator" style={{
        position:"absolute", bottom:120, right:48, display:"flex", flexDirection:"column",
        alignItems:"center", gap:10, opacity:0.4, zIndex: 3
      }}>
        <div style={{ width:1, height:50, background:"linear-gradient(to bottom, #C9A96E, transparent)" }}/>
        <span style={{ fontSize:9, letterSpacing:3, textTransform:"uppercase", writingMode:"vertical-rl", color:"#C9A96E" }}>Scroll</span>
      </div>
    </section>
  );
}

function Marquee() {
  const words = ["New Arrivals","Limited Edition","Sustainable","Handcrafted","Premium","Exclusive","Luxury","SS 2025"];
  const doubled = [...words,...words];
  return (
    <div style={{ overflow:"hidden", borderTop:"1px solid rgba(255,255,255,0.04)", borderBottom:"1px solid rgba(255,255,255,0.04)", padding:"20px 0", background:"rgba(201,169,110,0.02)" }}>
      <div className="marquee-track">
        {doubled.map((w,i) => (
          <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:48, padding:"0 48px", whiteSpace:"nowrap" }}>
            <span style={{ fontSize:11, letterSpacing:4.5, textTransform:"uppercase", color:"rgba(245,240,235,0.3)", fontWeight:500 }}>{w}</span>
            <span style={{ color:"rgba(201,169,110,0.4)", fontSize:12 }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

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
    <section id="collections" className="section-padding" style={{ background:"#0a0a0a", position:"relative" }}>
      <div style={{
        position:"absolute", inset:0,
        background:"radial-gradient(ellipse at 50% 0%, rgba(201,169,110,0.015) 0%, transparent 60%)",
        pointerEvents:"none"
      }}/>
      <div className="container-px" style={{ maxWidth:1440, margin:"0 auto", padding:"0 48px", position:"relative", zIndex:1 }}>
        <div ref={ref} style={{ marginBottom:80, display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:24 }}>
          <div>
            <p className={`section-label ${inView?"anim-fade-up":""}`}>Curated For You</p>
            <h2 className={`serif ${inView?"anim-fade-up delay-1":""}`} style={{ fontSize:"clamp(32px,5vw,68px)", fontWeight:300, marginTop:18, lineHeight:1.05 }}>
              Our Collections
            </h2>
          </div>
          <button className={`btn-outline ${inView?"anim-fade-up delay-2":""}`} onClick={() => scrollToId("bestsellers")}>View All</button>
        </div>
        <div className="collections-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:3 }}>
          {cats.map((c,i) => (
            <div key={c.label} className={`card-hover img-zoom collection-card ${inView?`anim-scale delay-${i+1}`:""}`}
              role="button" tabIndex={0} onClick={() => goToCategory(c.label)}
              onKeyDown={e => { if (e.key === "Enter") goToCategory(c.label); }}
              style={{ cursor:"pointer", position:"relative", overflow:"hidden", borderRadius:2 }}>
              <div style={{
                background:c.bg, height:520, display:"flex", flexDirection:"column",
                justifyContent:"flex-end", padding:40, position:"relative"
              }}>
                <div style={{
                  position:"absolute", inset:0, opacity:0.5,
                  background:`radial-gradient(circle at 30% 30%, ${c.accent}08 0%, transparent 60%)`
                }}/>
                <div style={{
                  position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-60%)",
                  width:140, height:140, border:`1px solid ${c.accent}18`,
                  display:"flex", alignItems:"center", justifyContent:"center"
                }}>
                  <span className="serif" style={{ fontSize:64, color:`${c.accent}20`, fontWeight:300 }}>V</span>
                </div>
                <div style={{ position:"relative", zIndex:1 }}>
                  <span style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:c.accent, marginBottom:10, display:"block", fontWeight:500 }}>{c.tag}</span>
                  <h3 className="serif" style={{ fontSize:30, fontWeight:300, marginBottom:6, lineHeight:1.1 }}>{c.label}</h3>
                  <p style={{ fontSize:11, color:"rgba(245,240,235,0.35)", letterSpacing:1 }}>{c.items}</p>
                </div>
                <div style={{
                  position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)",
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

function BestSellers() {
  const [ref, inView] = useInView();
  const [hoveredCard, setHoveredCard] = useState(null);
  const { wished, toggleWish, setQuickViewProduct, pushToast } = useStore();
  const isWished = (id) => wished.some(w => w.id === id);

  return (
    <section id="bestsellers" className="section-padding" style={{ background:"#080808", position:"relative" }}>
      <div style={{
        position:"absolute", inset:0,
        background:"radial-gradient(ellipse at 30% 50%, rgba(201,169,110,0.01) 0%, transparent 50%)",
        pointerEvents:"none"
      }}/>
      <div className="container-px" style={{ maxWidth:1440, margin:"0 auto", padding:"0 48px", position:"relative", zIndex:1 }}>
        <div ref={ref} style={{ textAlign:"center", marginBottom:80 }}>
          <p className={`section-label ${inView?"anim-fade-up":""}`}>Most Loved</p>
          <h2 className={`serif ${inView?"anim-fade-up delay-1":""}`} style={{ fontSize:"clamp(32px,5vw,68px)", fontWeight:300, marginTop:18, marginBottom:20, lineHeight:1.05 }}>
            Best Sellers
          </h2>
          <p className={`${inView?"anim-fade-up delay-2":""}`} style={{ color:"rgba(245,240,235,0.35)", fontSize:15, maxWidth:480, margin:"0 auto", lineHeight:1.7, fontWeight:300 }}>
            Pieces that define the season — selected by our global clientele.
          </p>
        </div>
        <div className="products-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:20 }}>
          {PRODUCTS.map((p,i) => (
            <div key={p.id}
              className={`product-card ${inView?`anim-fade-up delay-${(i%4)+1}`:""}`}
              onMouseEnter={() => setHoveredCard(p.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ cursor:"pointer" }}>
              <div className="product-card-inner" style={{
                background:`linear-gradient(135deg, ${p.color}, #0a0a0a)`, height:380, position:"relative", overflow:"hidden",
                transition:"all 0.6s cubic-bezier(.23,1,.32,1)", borderRadius:2,
                transform: hoveredCard===p.id ? "translateY(-10px)" : "translateY(0)",
                boxShadow: hoveredCard===p.id ? "0 40px 80px rgba(0,0,0,0.55)" : "0 4px 20px rgba(0,0,0,0.3)",
              }} onClick={() => setQuickViewProduct(p)}>
                <div style={{
                  position:"absolute", inset:0, opacity:0.3,
                  background:`repeating-linear-gradient(45deg, rgba(201,169,110,0.015) 0, rgba(201,169,110,0.015) 1px, transparent 1px, transparent 50px)`
                }}/>
                <div style={{
                  position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
                  background:`radial-gradient(circle at 50% 40%, rgba(201,169,110,0.05), transparent 65%)`
                }}>
                  <div style={{ textAlign:"center" }}>
                    <div style={{
                      width:90, height:90, border:"1px solid rgba(201,169,110,0.15)",
                      display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px"
                    }}>
                      <span className="serif" style={{ fontSize:40, color:"rgba(201,169,110,0.25)", fontWeight:300 }}>V</span>
                    </div>
                    <span style={{ fontSize:9, letterSpacing:4, color:"rgba(201,169,110,0.25)", textTransform:"uppercase" }}>Product Photo</span>
                  </div>
                </div>
                <div style={{
                  position:"absolute", top:20, left:20,
                  background: p.tag==="Limited"?"rgba(201,128,128,0.12)":"rgba(201,169,110,0.08)",
                  border: `1px solid ${p.tag==="Limited"?"rgba(201,128,128,0.25)":"rgba(201,169,110,0.2)"}`,
                  padding:"5px 14px", borderRadius:1
                }}>
                  <span style={{ fontSize:9, letterSpacing:2.5, textTransform:"uppercase", color: p.tag==="Limited"?"#c98080":"#C9A96E", fontWeight:600 }}>{p.tag}</span>
                </div>
                <button onClick={e => { e.stopPropagation(); toggleWish(p); }} style={{
                  position:"absolute", top:16, right:16, background:"rgba(10,10,10,0.5)",
                  border:"none", cursor:"pointer", width:44, height:44, display:"flex",
                  alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)",
                  fontSize:18, transition:"all 0.3s", color: isWished(p.id)?"#c98080":"rgba(245,240,235,0.5)",
                  borderRadius: "50%"
                }} aria-label="Toggle wishlist">
                  {isWished(p.id) ? "♥" : "♡"}
                </button>
                <div style={{
                  position:"absolute", bottom:0, left:0, right:0, padding:"18px 22px",
                  background:"rgba(10,10,10,0.85)", backdropFilter:"blur(12px)",
                  transform: hoveredCard===p.id ? "translateY(0)" : "translateY(100%)",
                  transition:"transform 0.5s cubic-bezier(.23,1,.32,1)"
                }}>
                  <button style={{
                    width:"100%", background:"transparent", border:"1px solid rgba(201,169,110,0.35)",
                    color:"#C9A96E", padding:"14px", fontSize:11, letterSpacing:3,
                    textTransform:"uppercase", cursor:"pointer", fontFamily:"Inter,sans-serif",
                    transition:"all 0.3s", minHeight:44, borderRadius:1
                  }} onClick={e => { e.stopPropagation(); setQuickViewProduct(p); }}>Quick View</button>
                </div>
              </div>
              <div style={{ padding:"22px 6px 10px" }}>
                <p style={{ fontSize:10, letterSpacing:2, textTransform:"uppercase", color:"rgba(245,240,235,0.3)", marginBottom:6 }}>{p.category}</p>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <h3 className="serif" style={{ fontSize:20, fontWeight:400 }}>{p.name}</h3>
                  <span style={{ fontSize:15, color:"#C9A96E", fontWeight:500 }}>{formatPrice(p.price)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:72 }}>
          <button className="btn-outline" onClick={() => { pushToast("You're viewing all 6 available pieces"); scrollToId("lookbook"); }}>
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
}

function About() {
  const [ref, inView] = useInView();
  const stats = [["2012","Founded in Paris"],["48K+","Clients Worldwide"],["200+","Signature Designs"],["32","Countries Served"]];
  return (
    <section id="about" className="section-padding" style={{ background:"#0d0c0a", position:"relative", overflow:"hidden" }}>
      <div style={{
        position:"absolute", right:"-8%", top:"50%", transform:"translateY(-50%)",
        fontSize:"42vw", color:"rgba(201,169,110,0.015)", fontFamily:"'Cormorant Garamond',serif",
        fontWeight:300, lineHeight:1, pointerEvents:"none", userSelect:"none"
      }}>V</div>
      <div className="container-px" style={{ maxWidth:1440, margin:"0 auto", padding:"0 48px", position:"relative", zIndex:1 }}>
        <div ref={ref} className="grid-2col about-grid" style={{ gap:96, alignItems:"center", width: "100%" }}>
          <div>
            <p className={`section-label ${inView?"anim-fade-up":""}`}>Our Heritage</p>
            <h2 className={`serif ${inView?"anim-fade-up delay-1":""}`} style={{ fontSize:"clamp(32px,4.5vw,64px)", fontWeight:300, lineHeight:1.05, marginTop:20, marginBottom:32 }}>
              A Decade of<br/><em style={{ color:"#C9A96E", fontStyle:"italic" }}>Uncompromising</em><br/>Elegance
            </h2>
            <div className={`divider ${inView?"anim-fade-in delay-2":""}`} style={{ marginBottom:32 }}/>
            <p className={`${inView?"anim-fade-up delay-2":""}`} style={{ fontSize:15, lineHeight:1.9, color:"rgba(245,240,235,0.5)", marginBottom:24, fontWeight:300 }}>
              Born in the ateliers of Paris in 2012, VELORA was founded on a single conviction: that true luxury is not worn, it is experienced. Every stitch carries the weight of tradition; every silhouette, the precision of tomorrow.
            </p>
            <p className={`${inView?"anim-fade-up delay-3":""}`} style={{ fontSize:15, lineHeight:1.9, color:"rgba(245,240,235,0.5)", marginBottom:44, fontWeight:300 }}>
              We collaborate with the world's finest mills in Italy and Scotland, partnering with artisans whose families have practiced their craft for generations. The result is clothing that transcends season — investments in self-expression.
            </p>
            <button className={`btn-primary ${inView?"anim-fade-up delay-4":""}`} onClick={() => scrollToId("contact")}>Our Story</button>
          </div>
          <div>
            <div className={`${inView?"anim-scale delay-2":""}`} style={{
              position:"relative", height:560, minHeight: 400,
              background:"linear-gradient(160deg, #1a1510, #0d0c0a)",
              border:"1px solid rgba(201,169,110,0.08)", borderRadius:2
            }}>
              <div style={{
                position:"absolute", inset:0,
                background:`repeating-linear-gradient(45deg, rgba(201,169,110,0.012) 0, rgba(201,169,110,0.012) 1px, transparent 1px, transparent 40px)`
              }}/>
              <div style={{
                position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center"
              }}>
                <div style={{
                  width:180, height:180, border:"1px solid rgba(201,169,110,0.12)",
                  display:"flex", alignItems:"center", justifyContent:"center"
                }} className="floating">
                  <span className="serif" style={{ fontSize:80, color:"rgba(201,169,110,0.18)", fontWeight:300 }}>V</span>
                </div>
              </div>
              {[[0,0],[0,"auto"],["auto",0],["auto","auto"]].map(([t,b,l,r],i) => (
                <div key={i} style={{
                  position:"absolute",
                  top: i<2?"20px":"auto", bottom: i>=2?"20px":"auto",
                  left: i%2===0?"20px":"auto", right: i%2===1?"20px":"auto",
                  width:20, height:20,
                  borderTop: i<2?"1px solid rgba(201,169,110,0.25)":"none",
                  borderBottom: i>=2?"1px solid rgba(201,169,110,0.25)":"none",
                  borderLeft: i%2===0?"1px solid rgba(201,169,110,0.25)":"none",
                  borderRight: i%2===1?"1px solid rgba(201,169,110,0.25)":"none",
                }}/>
              ))}
            </div>
          </div>
        </div>
        <div className={`grid-stats-4 ${inView?"anim-fade-up delay-3":""}`} style={{ gap:3, marginTop:80 }}>
          {stats.map(([n,l]) => (
            <div key={l} style={{
              padding:"44px 32px", background:"rgba(255,255,255,0.015)", border:"1px solid rgba(255,255,255,0.04)",
              textAlign:"center", borderRadius:2, transition:"all 0.4s ease"
            }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(201,169,110,0.03)"; e.currentTarget.style.borderColor="rgba(201,169,110,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.015)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.04)"; }}>
              <p className="serif" style={{ fontSize:44, fontWeight:300, color:"#C9A96E", marginBottom:10 }}>{n}</p>
              <p style={{ fontSize:11, letterSpacing:2, textTransform:"uppercase", color:"rgba(245,240,235,0.35)", fontWeight:500 }}>{l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  const [ref, inView] = useInView();
  const features = [
    { icon:"◈", title:"Artisan Craftsmanship", desc:"Each garment passes through 47 quality checkpoints and is hand-finished by master craftspeople." },
    { icon:"◉", title:"Sustainable Luxury", desc:"100% ethically sourced materials. Carbon-neutral shipping. Responsible beauty without compromise." },
    { icon:"◎", title:"White Glove Delivery", desc:"Complimentary express delivery in signature packaging. Returns accepted within 30 days, no questions asked." },
    { icon:"◇", title:"Personal Styling", desc:"Every client receives access to a dedicated VELORA stylist for bespoke guidance, in-person or remote." },
  ];
  return (
    <section className="section-padding" style={{ background:"#0a0a0a", position:"relative" }}>
      <div style={{
        position:"absolute", inset:0,
        background:"radial-gradient(ellipse at 50% 100%, rgba(201,169,110,0.01) 0%, transparent 60%)",
        pointerEvents:"none"
      }}/>
      <div className="container-px" style={{ maxWidth:1440, margin:"0 auto", padding:"0 48px", position:"relative", zIndex:1 }}>
        <div ref={ref} style={{ textAlign:"center", marginBottom:80 }}>
          <p className={`section-label ${inView?"anim-fade-up":""}`}>The VELORA Standard</p>
          <h2 className={`serif ${inView?"anim-fade-up delay-1":""}`} style={{ fontSize:"clamp(32px,5vw,68px)", fontWeight:300, marginTop:18, lineHeight:1.05 }}>
            Why Choose Us
          </h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:3 }}>
          {features.map((f,i) => (
            <div key={f.title} className={`glass-card ${inView?`anim-fade-up delay-${i+1}`:""}`}
              style={{ padding:"56px 40px", cursor:"default", borderRadius:2 }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(201,169,110,0.04)";
                e.currentTarget.style.borderColor = "rgba(201,169,110,0.15)";
                e.currentTarget.style.transform = "translateY(-6px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.025)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.transform = "translateY(0)";
              }}>
              <div style={{
                width:56, height:56, border:"1px solid rgba(201,169,110,0.2)",
                display:"flex", alignItems:"center", justifyContent:"center",
                marginBottom:32, color:"#C9A96E", fontSize:22, borderRadius:2
              }}>{f.icon}</div>
              <h3 className="serif" style={{ fontSize:24, fontWeight:400, marginBottom:16 }}>{f.title}</h3>
              <p style={{ fontSize:14, lineHeight:1.85, color:"rgba(245,240,235,0.4)", fontWeight:300 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const [ref, inView] = useInView();
  const [idx, setIdx] = useState(0);
  const reviews = [
    { name:"Isabelle Laurent", role:"Creative Director, Paris", text:"VELORA transformed my wardrobe. The craftsmanship is unlike anything I've encountered at this price point — and I've spent considerable time in Parisian ateliers. Simply extraordinary.", rating:5 },
    { name:"Marcus Chen", role:"Investment Banker, Hong Kong", text:"I purchased the Heritage Cashmere Coat for a board meeting and have received more compliments than I can count. The tailoring is impeccable. VELORA has earned a client for life.", rating:5 },
    { name:"Sofia Andreou", role:"Architect, Milan", text:"As someone obsessed with proportion and material, VELORA speaks my language. The attention to detail in the Silk Evening Gown was breathtaking. It moved like water.", rating:5 },
  ];
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i+1)%reviews.length), 6000);
    return () => clearInterval(t);
  }, []);
  const r = reviews[idx];
  return (
    <section id="testimonials" className="section-padding" style={{ background:"#0d0c0a", overflow:"hidden", position:"relative" }}>
      <div style={{
        position:"absolute", inset:0,
        background:"radial-gradient(ellipse at 50% 50%, rgba(201,169,110,0.015) 0%, transparent 60%)",
        pointerEvents:"none"
      }}/>
      <div className="container-px" style={{ maxWidth:1440, margin:"0 auto", padding:"0 48px", position:"relative", zIndex:1 }}>
        <div ref={ref} style={{ textAlign:"center", marginBottom:72 }}>
          <p className={`section-label ${inView?"anim-fade-up":""}`}>Client Stories</p>
          <h2 className={`serif ${inView?"anim-fade-up delay-1":""}`} style={{ fontSize:"clamp(32px,5vw,68px)", fontWeight:300, marginTop:18, lineHeight:1.05 }}>
            What They Say
          </h2>
        </div>
        <div className={`testimonial-card ${inView?"anim-scale delay-2":""}`} style={{
          maxWidth:820, margin:"0 auto",
          background:"rgba(255,255,255,0.015)", border:"1px solid rgba(255,255,255,0.04)",
          padding:"72px 80px", textAlign:"center", position:"relative", minHeight:320, borderRadius:2
        }}>
          <div style={{
            position:"absolute", top:-28, left:"50%", transform:"translateX(-50%)",
            width:56, height:56, background:"#0d0c0a", border:"1px solid rgba(201,169,110,0.25)",
            display:"flex", alignItems:"center", justifyContent:"center", borderRadius:2
          }}>
            <span className="serif" style={{ fontSize:32, color:"#C9A96E", lineHeight:1 }}>"</span>
          </div>
          <div style={{ transition:"all 0.6s ease" }} key={idx}>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:32, gap:5 }}>
              {Array(r.rating).fill(0).map((_,i) => <span key={i} style={{ color:"#C9A96E", fontSize:14 }}>★</span>)}
            </div>
            <p className="serif" style={{ fontSize:"clamp(18px,2.5vw,26px)", fontWeight:300, lineHeight:1.65, color:"rgba(245,240,235,0.8)", marginBottom:44, fontStyle:"italic" }}>
              "{r.text}"
            </p>
            <div className="divider" style={{ margin:"0 auto 28px" }}/>
            <p style={{ fontWeight:600, fontSize:13, letterSpacing:2, textTransform:"uppercase" }}>{r.name}</p>
            <p style={{ fontSize:12, color:"rgba(245,240,235,0.3)", marginTop:6, letterSpacing:1 }}>{r.role}</p>
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"center", gap:10, marginTop:44 }}>
          {reviews.map((_,i) => (
            <button key={i} onClick={() => setIdx(i)} style={{
              width: i===idx?32:8, height:3, border:"none", cursor:"pointer",
              background: i===idx?"#C9A96E":"rgba(245,240,235,0.15)",
              transition:"all 0.4s ease", padding:0, borderRadius:2
            }}/>
          ))}
        </div>
      </div>
    </section>
  );
}

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
    <section id="lookbook" className="section-padding" style={{ background:"#080808", position:"relative" }}>
      <div style={{
        position:"absolute", inset:0,
        background:"radial-gradient(ellipse at 70% 30%, rgba(201,169,110,0.01) 0%, transparent 50%)",
        pointerEvents:"none"
      }}/>
      <div className="container-px" style={{ maxWidth:1440, margin:"0 auto", padding:"0 48px", position:"relative", zIndex:1 }}>
        <div ref={ref} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:24, marginBottom:56 }}>
          <div>
            <p className={`section-label ${inView?"anim-fade-up":""}`}>Visual Stories</p>
            <h2 className={`serif ${inView?"anim-fade-up delay-1":""}`} style={{ fontSize:"clamp(32px,5vw,68px)", fontWeight:300, marginTop:18, lineHeight:1.05 }}>
              Lookbook
            </h2>
          </div>
          <div className={inView?"anim-fade-up delay-2":""} style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)} className="tap-target" style={{
                background: f===filter?"#C9A96E":"transparent",
                border:`1px solid ${f===filter?"#C9A96E":"rgba(255,255,255,0.08)"}`,
                color: f===filter?"#0a0a0a":"rgba(245,240,235,0.4)",
                padding:"10px 22px", fontSize:10, letterSpacing:2.5, textTransform:"uppercase",
                cursor:"pointer", fontFamily:"Inter,sans-serif", transition:"all 0.3s ease", borderRadius:2, fontWeight: f===filter?600:400
              }}>{f}</button>
            ))}
          </div>
        </div>
        <div style={{ columns:"3 280px", columnGap:"16px" }} className="lookbook-grid">
          {visible.map((item,i) => (
            <div key={i} className="card-hover img-zoom lookbook-item" style={{
              breakInside:"avoid", marginBottom:16, cursor:"pointer",
              position:"relative", overflow:"hidden", borderRadius:2,
              background:`linear-gradient(160deg, ${item.accent}, #0a0a0a)`,
              height:item.h, display:"flex", alignItems:"center", justifyContent:"center",
              animation: inView ? `fadeIn 0.7s ease ${i*0.1}s both` : "none"
            }}>
              <div style={{ textAlign:"center" }}>
                <span className="serif" style={{ fontSize:48, color:"rgba(201,169,110,0.12)", fontWeight:300 }}>V</span>
              </div>
              <div style={{
                position:"absolute", bottom:0, left:0, right:0, padding:"24px",
                background:"linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                opacity:0, transition:"opacity 0.4s ease"
              }} className="lookbook-overlay">
                <span style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:"#C9A96E", fontWeight:500 }}>{item.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


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
    <section className="section-padding" style={{
      background:"#0d0c0a", position:"relative", overflow:"hidden"
    }}>
      <div style={{
        position:"absolute", inset:0,
        background:"radial-gradient(ellipse at 50% 50%, rgba(201,169,110,0.04) 0%, transparent 65%)"
      }}/>
      <div ref={ref} className="container-px" style={{ maxWidth:720, margin:"0 auto", padding:"0 48px", textAlign:"center", position:"relative" }}>
        <p className={`section-label ${inView?"anim-fade-up":""}`}>Stay in the Conversation</p>
        <h2 className={`serif ${inView?"anim-fade-up delay-1":""}`} style={{ fontSize:"clamp(32px,5vw,64px)", fontWeight:300, marginTop:20, marginBottom:20, lineHeight:1.05 }}>
          Join the Inner Circle
        </h2>
        <p className={`${inView?"anim-fade-up delay-2":""}`} style={{ fontSize:14, color:"rgba(245,240,235,0.4)", lineHeight:1.85, marginBottom:52, fontWeight:300 }}>
          First access to new collections, private sale invitations, and styling notes from our creative director — delivered to your inbox, never your spam.
        </p>
        {sent ? (
          <div className={inView?"anim-scale":""} style={{ padding:"36px", border:"1px solid rgba(201,169,110,0.25)", borderRadius:2 }}>
            <span className="serif" style={{ fontSize:28, color:"#C9A96E" }}>Welcome to VELORA.</span>
          </div>
        ) : (
          <div className={`${inView?"anim-fade-up delay-3":""}`}>
            <div className="newsletter-row" style={{ display:"flex", gap:0, maxWidth:540, margin:"0 auto" }}>
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
            {error && <p id="newsletter-error" style={{ marginTop:14, fontSize:12, color:"#c98080" }}>{error}</p>}
          </div>
        )}
        <p className={`${inView?"anim-fade-up delay-4":""}`} style={{ marginTop:24, fontSize:11, color:"rgba(245,240,235,0.2)", letterSpacing:1 }}>
          Unsubscribe at any time. We respect your privacy.
        </p>
      </div>
    </section>
  );
}

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
    <section className="section-padding" style={{ background:"#0a0a0a", position:"relative" }}>
      <div style={{
        position:"absolute", inset:0,
        background:"radial-gradient(ellipse at 30% 50%, rgba(201,169,110,0.01) 0%, transparent 50%)",
        pointerEvents:"none"
      }}/>
      <div className="container-px" style={{ maxWidth:860, margin:"0 auto", padding:"0 48px", position:"relative", zIndex:1 }}>
        <div ref={ref} style={{ textAlign:"center", marginBottom:72 }}>
          <p className={`section-label ${inView?"anim-fade-up":""}`}>Common Questions</p>
          <h2 className={`serif ${inView?"anim-fade-up delay-1":""}`} style={{ fontSize:"clamp(32px,5vw,64px)", fontWeight:300, marginTop:18, lineHeight:1.05 }}>
            FAQ
          </h2>
        </div>
        <div>
          {faqs.map((f,i) => (
            <div key={i} className={inView?`anim-fade-up delay-${(i%4)+1}`:""} style={{
              borderBottom:"1px solid rgba(255,255,255,0.05)", overflow:"hidden"
            }}>
              <button onClick={() => setOpen(open===i?null:i)} style={{
                width:"100%", background:"none", border:"none", cursor:"pointer",
                padding:"28px 0", display:"flex", justifyContent:"space-between", alignItems:"center",
                color:"#f5f0eb", textAlign:"left", transition:"color 0.3s"
              }}
              onMouseEnter={e => e.currentTarget.style.color="#C9A96E"}
              onMouseLeave={e => e.currentTarget.style.color="#f5f0eb"}>
                <span className="serif" style={{ fontSize:20, fontWeight:400, paddingRight:24, lineHeight:1.3 }}>{f.q}</span>
                <span style={{
                  width:32, height:32, border:"1px solid rgba(201,169,110,0.2)", flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color:"#C9A96E", fontSize:18, transition:"all 0.4s ease",
                  transform: open===i?"rotate(45deg)":"rotate(0)", borderRadius:2
                }}>+</span>
              </button>
              <div style={{
                maxHeight: open===i?300:0, overflow:"hidden",
                transition:"max-height 0.5s cubic-bezier(.23,1,.32,1)"
              }}>
                <p style={{ fontSize:14, lineHeight:1.9, color:"rgba(245,240,235,0.45)", paddingBottom:28, fontWeight:300 }}>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


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
    <section id="contact" className="section-padding" style={{ background:"#080808", position:"relative" }}>
      <div style={{
        position:"absolute", inset:0,
        background:"radial-gradient(ellipse at 70% 50%, rgba(201,169,110,0.01) 0%, transparent 50%)",
        pointerEvents:"none"
      }}/>
      <div className="container-px" style={{ maxWidth:1440, margin:"0 auto", padding:"0 48px", position:"relative", zIndex:1 }}>
        <div ref={ref} className="grid-2col contact-grid" style={{ gap:96, alignItems:"start", width: "100%" }}>
          <div>
            <p className={`section-label ${inView?"anim-fade-up":""}`}>Get in Touch</p>
            <h2 className={`serif ${inView?"anim-fade-up delay-1":""}`} style={{ fontSize:"clamp(32px,4vw,56px)", fontWeight:300, marginTop:20, marginBottom:32, lineHeight:1.05 }}>
              We'd Love to<br/><em style={{ color:"#C9A96E", fontStyle:"italic" }}>Hear From You</em>
            </h2>
            <div className={`divider ${inView?"anim-fade-in delay-2":""}`} style={{ marginBottom:40 }}/>
            {[
              ["Location","8 Rue du Faubourg Saint-Honoré, 75008 Paris, France"],
              ["Email","contact@velora-fashion.com"],
              ["Phone","+33 1 42 65 91 00"],
              ["Hours","Mon–Sat 10:00 – 19:00 CET"],
            ].map(([label, val], i) => (
              <div key={label} className={inView?`anim-fade-up delay-${i+2}`:""} style={{ marginBottom:28 }}>
                <p style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:"#C9A96E", marginBottom:8, fontWeight:600 }}>{label}</p>
                <p style={{ fontSize:14, color:"rgba(245,240,235,0.55)", lineHeight:1.6, fontWeight:300 }}>{val}</p>
              </div>
            ))}
            <div className={inView?"anim-scale delay-4":""} style={{
              marginTop:44, height:240, background:"rgba(255,255,255,0.015)",
              border:"1px solid rgba(255,255,255,0.04)", display:"flex", alignItems:"center",
              justifyContent:"center", position:"relative", overflow:"hidden", borderRadius:2
            }}>
              <div style={{
                position:"absolute", inset:0,
                background:`repeating-linear-gradient(0deg,rgba(201,169,110,0.02) 0,rgba(201,169,110,0.02) 1px,transparent 1px,transparent 40px),
                  repeating-linear-gradient(90deg,rgba(201,169,110,0.02) 0,rgba(201,169,110,0.02) 1px,transparent 1px,transparent 40px)`
              }}/>
              <div style={{ textAlign:"center", position:"relative", zIndex:1 }}>
                <span style={{ fontSize:28, marginBottom:10, display:"block", color:"rgba(201,169,110,0.3)" }}>◉</span>
                <p style={{ fontSize:10, letterSpacing:3, color:"rgba(201,169,110,0.4)", textTransform:"uppercase", fontWeight:500 }}>
                  Paris, France
                </p>
              </div>
            </div>
          </div>
          <div className={`contact-form-col ${inView?"anim-fade-up delay-3":""}`}>
            {sent ? (
              <div className={inView?"anim-scale":""} style={{
                padding:"72px 56px", border:"1px solid rgba(201,169,110,0.15)",
                textAlign:"center", marginTop:48, borderRadius:2
              }}>
                <span className="serif" style={{ fontSize:36, color:"#C9A96E", display:"block", marginBottom:20 }}>Thank You.</span>
                <p style={{ color:"rgba(245,240,235,0.45)", fontSize:14, fontWeight:300 }}>We'll be in touch within 24 hours.</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:4, marginTop:48 }} className="contact-form-fields">
                {[["Your Name","name","text"],["Email Address","email","email"]].map(([ph, key, type]) => (
                  <div key={key} style={{ marginBottom:14 }}>
                    <input type={type} placeholder={ph} value={form[key]}
                      onChange={e => { setForm({...form,[key]:e.target.value}); if (errors[key]) setErrors({...errors, [key]:null}); }}
                      style={{ borderColor: errors[key] ? "#c98080" : undefined }}
                      aria-invalid={!!errors[key]}/>
                    {errors[key] && <p style={{ fontSize:12, color:"#c98080", marginTop:8 }}>{errors[key]}</p>}
                  </div>
                ))}
                <div style={{ marginBottom:10 }}>
                  <textarea placeholder="Tell us how we can help..." rows={6} value={form.message}
                    onChange={e => { setForm({...form,message:e.target.value}); if (errors.message) setErrors({...errors, message:null}); }}
                    style={{ resize:"vertical", borderColor: errors.message ? "#c98080" : undefined }}
                    aria-invalid={!!errors.message}/>
                  {errors.message && <p style={{ fontSize:12, color:"#c98080", marginTop:8 }}>{errors.message}</p>}
                </div>
                <button className="btn-primary" style={{ marginTop:10, width:"100%", padding:"18px" }}
                  onClick={handleSend}>
                  Send Message
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

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
    <footer style={{ background:"#060606", borderTop:"1px solid rgba(255,255,255,0.03)", position:"relative" }}>
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:1,
        background:"linear-gradient(90deg, transparent, rgba(201,169,110,0.1), transparent)"
      }}/>
      <div style={{ maxWidth:1440, margin:"0 auto", padding:"72px 24px 48px" }} className="footer-inner">
        <div className="grid-footer" style={{ gap:72, marginBottom:80 }}>
          <div>
            <button onClick={() => window.scrollTo({ top:0, behavior:"smooth" })} style={{
              display:"flex", alignItems:"center", gap:14, marginBottom:28,
              background:"none", border:"none", cursor:"pointer", padding:0
            }} aria-label="Back to top">
              <span style={{ width:38, height:38, border:"1px solid rgba(201,169,110,0.4)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span className="serif" style={{ fontSize:22, color:"#C9A96E" }}>V</span>
              </span>
              <span className="serif" style={{ fontSize:22, letterSpacing:7, fontWeight:300, color:"#f5f0eb" }}>VELORA</span>
            </button>
            <p style={{ fontSize:13, lineHeight:1.9, color:"rgba(245,240,235,0.3)", maxWidth:320, marginBottom:36, fontWeight:300 }}>
              Luxury fashion for those who understand that true elegance is never about what you wear — it's about who you become wearing it.
            </p>
            <div style={{ display:"flex", gap:14 }}>
              {["Instagram","Pinterest","Twitter","LinkedIn"].map(s => (
                <button key={s} className="icon-btn tap-target" onClick={() => notify(s)} aria-label={`VELORA on ${s}`} style={{
                  background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)",
                  color:"rgba(245,240,235,0.35)", width:40, height:40,
                  fontSize:12, transition:"all 0.3s", letterSpacing:0, borderRadius:2
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(201,169,110,0.3)"; e.currentTarget.style.color="#C9A96E"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"; e.currentTarget.style.color="rgba(245,240,235,0.35)"; }}>
                  {s[0]}
                </button>
              ))}
            </div>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <p style={{ fontSize:10, letterSpacing:4, textTransform:"uppercase", color:"#C9A96E", marginBottom:28, fontWeight:600 }}>{col.title}</p>
              <ul style={{ listStyle:"none" }}>
                {col.links.map(l => (
                  <li key={l} style={{ marginBottom:14 }}>
                    <button onClick={() => notify(l)} style={{
                      fontSize:13, color:"rgba(245,240,235,0.35)", textDecoration:"none",
                      transition:"all 0.3s", fontWeight:300, background:"none", border:"none",
                      padding:0, cursor:"pointer", textAlign:"left", fontFamily:"'Inter',sans-serif", minHeight:24
                    }}
                    onMouseEnter={e => { e.target.style.color="#C9A96E"; }}
                    onMouseLeave={e => { e.target.style.color="rgba(245,240,235,0.35)"; }}>
                      {l}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{
          borderTop:"1px solid rgba(255,255,255,0.04)", paddingTop:36,
          display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:18
        }}>
          <p style={{ fontSize:11, color:"rgba(245,240,235,0.2)", letterSpacing:1 }}>
            © {year} VELORA. All rights reserved. A demonstration project.
          </p>
          <div style={{ display:"flex", gap:28, flexWrap:"wrap" }}>
            {["Privacy Policy","Terms of Service","Cookie Settings"].map(l => (
              <button key={l} onClick={() => notify(l)} style={{
                fontSize:11, color:"rgba(245,240,235,0.2)", textDecoration:"none",
                letterSpacing:0.5, transition:"color 0.3s", background:"none", border:"none",
                padding:0, cursor:"pointer", fontFamily:"'Inter',sans-serif"
              }}
              onMouseEnter={e => e.target.style.color="#C9A96E"
              }
              onMouseLeave={e => e.target.style.color="rgba(245,240,235,0.2)"}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}


function MobileStyles() {
  return (
    <style>{`
      @media (max-width: 1024px) {
        .desktop-nav { display:none !important; }
        .hamburger { display:flex !important; }
        .grid-2col { grid-template-columns: 1fr !important; gap: 60px !important; }
        .grid-stats-4 { grid-template-columns: repeat(2,1fr) !important; }
        .grid-footer { grid-template-columns: 1fr 1fr !important; row-gap: 48px !important; }
        .hero-deco-panel { opacity: 0.25; width: 42% !important; }
        .qv-grid { grid-template-columns: 1fr !important; }
        .contact-grid { gap: 56px !important; }
      }

      @media (max-width: 768px) {
        .section-padding { padding: 80px 0 !important; }
        .container-px { padding-left: 24px !important; padding-right: 24px !important; }
        .main-nav { padding: 14px 24px !important; }
        .nav-logo-text { font-size: 15px !important; letter-spacing: 5px !important; }
        .hero-section { padding-top: 80px !important; }
        .hero-content { padding-top: 20px !important; }
        .hero-section h1 { font-size: clamp(34px, 10vw, 52px) !important; line-height: 0.98 !important; }
        .hero-buttons { flex-direction: column !important; gap: 12px !important; }
        .hero-buttons .btn-primary, .hero-buttons .btn-outline { width: 100% !important; justify-content: center !important; }
        .hero-stats-row { 
          display: grid !important; 
          grid-template-columns: 1fr 1fr !important; 
          gap: 16px !important; 
          padding: 24px 24px !important;
        }
        .hero-stats-row > div { justify-content: flex-start !important; min-width: auto !important; }
        .hero-stats-row .serif { font-size: 22px !important; }
        .hero-stats-row span:last-child { font-size: 9px !important; }
        .hero-scroll-indicator { display:none !important; }
        .hero-deco-panel { display:none !important; }
        .collections-grid { grid-template-columns: 1fr 1fr !important; }
        .collection-card > div { height: 400px !important; padding: 28px !important; }
        .collection-card h3 { font-size: 22px !important; }
        .products-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 14px !important; }
        .product-card-inner { height: 300px !important; }
        .about-grid { gap: 44px !important; }
        .about-grid > div:last-child > div { height: 400px !important; min-height: 300px !important; }
        .testimonial-card { padding: 52px 32px !important; }
        .lookbook-grid { columns: 2 200px !important; }
        .drawer-box { width: 100vw !important; max-width: 100vw !important; }
        .modal-box { width: 96vw !important; max-height: 92vh !important; }
        .qv-details { padding: 32px 28px !important; }
        .qv-image { min-height: 260px !important; padding: 32px !important; }
        .footer-inner { padding: 48px 20px 32px !important; }
        .toast-stack { left: 20px !important; right: 20px !important; bottom: 20px !important; align-items: stretch !important; }
        .wishlist-dropdown { 
          width: calc(100vw - 48px) !important; 
          max-width: 340px !important;
          right: -10px !important;
        }
      }

      @media (max-width: 480px) {
        .section-padding { padding: 64px 0 !important; }
        .container-px { padding-left: 16px !important; padding-right: 16px !important; }
        .main-nav { padding: 12px 16px !important; }
        .hero-section h1 { font-size: 32px !important; }
        .hero-section p { font-size: 13px !important; line-height: 1.75 !important; }
        .hero-stats-row { gap: 12px !important; padding: 20px 16px !important; }
        .hero-stats-row .serif { font-size: 20px !important; }
        .collections-grid { grid-template-columns: 1fr !important; }
        .collection-card > div { height: 340px !important; }
        .products-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
        .product-card-inner { height: 340px !important; }
        .grid-stats-4 { grid-template-columns: 1fr 1fr !important; }
        .grid-footer { grid-template-columns: 1fr !important; row-gap: 36px !important; }
        .lookbook-grid { columns: 1 !important; }
        .newsletter-row { flex-direction: column !important; gap: 12px !important; }
        .newsletter-row input { border-right: 1px solid rgba(255,255,255,0.1) !important; }
        .newsletter-row button { border-left: 1px solid #C9A96E !important; width: 100% !important; }
        .contact-form-fields { margin-top: 0 !important; }
        .contact-form-col .anim-scale { margin-top: 0 !important; }
        .testimonial-card { padding: 44px 24px !important; min-height: 380px !important; }
        .testimonial-card p.serif { font-size: 16px !important; }
        .mobile-menu a { font-size: 32px !important; letter-spacing: 5px !important; }
        .modal-box { width: 94vw !important; }
        .qv-image { min-height: 220px !important; }
        .qv-details h3 { font-size: 26px !important; }
        .qv-details p { font-size: 12px !important; }
        .btn-primary, .btn-outline { padding: 12px 28px !important; font-size: 10px !important; letter-spacing: 2.5px !important; }
      }

      @media (max-width: 380px) {
        .container-px { padding-left: 12px !important; padding-right: 12px !important; }
        .hero-section h1 { font-size: 28px !important; }
        .hero-stats-row { grid-template-columns: 1fr 1fr !important; }
        .hero-stats-row .serif { font-size: 18px !important; }
        .collection-card h3 { font-size: 20px !important; }
        .product-card-inner { height: 280px !important; }
      }

      @media (hover: none) {
        .qv-reveal { transform: translateY(0) !important; opacity: 0.85; }
        .lookbook-item .lookbook-overlay { opacity:1 !important; background:linear-gradient(to top, rgba(0,0,0,0.75), transparent) !important; }
        .card-hover:hover { transform: none !important; box-shadow: none !important; }
        .card-hover:active { transform: scale(0.98) !important; }
        .product-card-inner { transform: none !important; }
        .product-card-inner:active { transform: scale(0.98) !important; }
        .glass-card { transform: none !important; }
      }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { animation-duration: 0.001s !important; animation-iteration-count: 1 !important; transition-duration: 0.001s !important; scroll-behavior:auto !important; }
      }
    `}</style>
  );
}


export default function App() {
  const [loading, setLoading] = useState(true);
  const scrollY = useScrollY();
  useEffect(() => { const t = setTimeout(() => setLoading(false), 3000); return () => clearTimeout(t); }, []);
  return (
    <StoreProvider>
      <FontLink/>
      <MobileStyles/>
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
