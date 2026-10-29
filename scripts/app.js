/* JayCee Trading & Services - site behavior and in-page content editor
   Two strict-mode IIFEs: interaction layer, then state/render/CMS layer. */
(function(){
'use strict';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $  = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));

/* ---------- Year ---------- */
const yearEl = $('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Hero reveal ---------- */
  const hero = $('#hero');
  requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-ready')));

  /* ---------- Nav: scroll shadow + progress bar ---------- */
  const nav = $('#nav'), bar = $('#progressBar');
  let ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      nav.classList.toggle('is-scrolled', y > 8);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
      if (!reduceMotion) updateParallax();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive:true });

  /* ---------- Mobile menu ---------- */
  const burger = $('#burger'), menu = $('#mobileMenu');
  let menuOpen = false;
  function setMenu(open){
    menuOpen = open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', open);
    // The admin panel lives in the state/CMS IIFE below; look it up here instead
    // of referencing an out-of-scope binding (previously threw on every burger tap).
    const adminPanelEl = document.getElementById('adminPanel');
    const adminOpen = !!adminPanelEl && adminPanelEl.classList.contains('is-open');
    document.body.style.overflow = (open || adminOpen) ? 'hidden' : '';
  }
  burger.addEventListener('click', (e) => { e.stopPropagation(); setMenu(!menuOpen); });
  menu.addEventListener('click', e => {
    if (e.target === menu) { setMenu(false); return; }
    if (e.target.closest('a') || e.target.closest('.btn')) setMenu(false);
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 768) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen) setMenu(false); });

  // Body overflow helper used by admin CMS too
  window.__syncBodyOverflow = (locked) => {
    if (locked) { document.body.style.overflow = 'hidden'; }
    else if (!menuOpen) document.body.style.overflow = '';
  };

  /* ---------- Smooth anchor scroll (offset for sticky nav) ---------- */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - (nav.offsetHeight - 1);
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  /* ---------- Flip cards (touch toggle + keyboard) ---------- */
  const isTouch = window.matchMedia('(hover: none)').matches;
  $$('.flip').forEach(card => {
    const toggle = () => {
      const flipped = card.classList.toggle('is-flipped');
      card.setAttribute('aria-pressed', String(flipped));
    };
    card.addEventListener('click', e => {
      // Allow links on the back to work normally; otherwise toggle on touch devices.
      if (e.target.closest('a')) return;
      if (isTouch) toggle();
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      if (e.key === 'Escape') { card.classList.remove('is-flipped'); card.setAttribute('aria-pressed','false'); }
    });
    card.addEventListener('focusout', e => {
      if (!card.contains(e.relatedTarget)) { /* keep state on blur for touch, reset keyboard */ }
    });
  });

  /* ---------- Category carousel ---------- */
  const track = $('#catCarousel'), prev = $('#catPrev'), next = $('#catNext');
  function step(){ const c = track.querySelector('.cat'); return c ? c.getBoundingClientRect().width + 24 : 300; }
  function updateArrows(){
    prev.disabled = track.scrollLeft <= 4;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  }
  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduceMotion ? 'auto' : 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left:  step(), behavior: reduceMotion ? 'auto' : 'smooth' }));
  track.addEventListener('scroll', updateArrows, { passive:true });
  window.addEventListener('resize', updateArrows);
  updateArrows();

  /* ---------- Marquee: duplicate logos for seamless loop ---------- */
  const mTrack = $('#marqueeTrack');
  const clones = Array.from(mTrack.children).map(n => { const c = n.cloneNode(true); c.setAttribute('aria-hidden','true'); return c; });
  clones.forEach(c => mTrack.appendChild(c));

  /* ---------- Scroll reveal ---------- */
  const revealEls = $$('.rv, .rv-stagger');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- Count-up ---------- */
  const counters = $$('[data-count]');
  function animateCount(el){
    const end = parseInt(el.dataset.count, 10);
    if (reduceMotion) { el.textContent = end; return; }
    const dur = 1800, start = performance.now();
    const from = 0;
    const ease = t => 1 - Math.pow(1 - t, 4);
    function tick(now){
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(from + (end - from) * ease(p));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const cio = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); } });
  }, { threshold: 0.5 }) : null;
  function observeCounter(el){ if (cio) cio.observe(el); else animateCount(el); }
  counters.forEach(observeCounter);
  window.__countIO = { observe: observeCounter };

  /* ---------- Parallax (transform only) ---------- */
  function updateParallax(){
    const vh = window.innerHeight;
    const pItems = $$('.parallax'); // query fresh so admin re-renders pick up new images
    pItems.forEach(img => {
      const wrap = img.parentElement;
      const r = wrap.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const speed = parseFloat(img.dataset.speed || '0.1');
      const center = r.top + r.height / 2 - vh / 2;
      const offset = -center * speed;
      img.style.transform = 'translate3d(0,' + offset.toFixed(2) + 'px,0)';
    });
  }
  if (!reduceMotion) { updateParallax(); window.addEventListener('resize', updateParallax); }

  /* ---------- Magnetic buttons ---------- */
  if (!reduceMotion && !isTouch) {
    $$('.magnetic').forEach(btn => {
      const strength = 0.3;
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        btn.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- FAQ accordion (smooth height + typewriter answer) ---------- */
  const faqBtns = $$('.faq-q');

  // Prepare each answer: a ghost copy (reserves height, read by screen readers)
  // and a visible typed overlay that is animated character by character.
  $$('.faq-a > div').forEach(box => {
    const text = box.textContent.trim();
    box.innerHTML = '';
    const wrap = document.createElement('span');
    wrap.className = 'faq-text';
    wrap.dataset.text = text;
    wrap.innerHTML = '<span class="ghost">' + text.replace(/&/g,'&amp;').replace(/</g,'&lt;') + '</span>' +
                     '<span class="typed" aria-hidden="true"><span class="chars"></span><span class="caret"></span></span>';
    box.appendChild(wrap);
  });

  function stopTyping(panel){
    const wrap = panel.querySelector('.faq-text');
    if (wrap && wrap._raf) { cancelAnimationFrame(wrap._raf); wrap._raf = null; }
  }
  function typeAnswer(panel){
    const wrap = panel.querySelector('.faq-text'); if (!wrap) return;
    const chars = wrap.querySelector('.chars');
    const text = wrap.dataset.text;
    stopTyping(panel);
    wrap.classList.remove('is-done');
    if (reduceMotion) { chars.textContent = text; wrap.classList.add('is-done'); return; }
    chars.textContent = '';
    // ~14ms per character, but never longer than ~1.8s for long answers
    const perChar = Math.min(14, 1800 / text.length);
    const start = performance.now() + 180; // small delay so the panel starts opening first
    let shown = 0;
    function tick(now){
      const target = Math.min(text.length, Math.floor((now - start) / perChar));
      if (target > shown) { shown = target; chars.textContent = text.slice(0, shown); }
      if (shown < text.length) wrap._raf = requestAnimationFrame(tick);
      else { wrap._raf = null; setTimeout(() => wrap.classList.add('is-done'), 600); }
    }
    wrap._raf = requestAnimationFrame(tick);
  }

  function closePanel(btn){
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    stopTyping(panel);
    panel.style.height = panel.scrollHeight + 'px';
    requestAnimationFrame(() => { panel.style.height = '0px'; });
    btn.setAttribute('aria-expanded','false');
  }
  function openPanel(btn){
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    panel.style.height = panel.scrollHeight + 'px';
    btn.setAttribute('aria-expanded','true');
    typeAnswer(panel);
    const onEnd = (e) => { if (e.propertyName === 'height' && btn.getAttribute('aria-expanded') === 'true') panel.style.height = 'auto'; panel.removeEventListener('transitionend', onEnd); };
    panel.addEventListener('transitionend', onEnd);
  }
  faqBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      faqBtns.forEach(b => { if (b !== btn && b.getAttribute('aria-expanded') === 'true') closePanel(b); });
      isOpen ? closePanel(btn) : openPanel(btn);
    });
  });
  // Recalculate open panel on resize to avoid clipping
  window.addEventListener('resize', () => {
    faqBtns.forEach(b => { if (b.getAttribute('aria-expanded') === 'true') { const p = document.getElementById(b.getAttribute('aria-controls')); p.style.height = 'auto'; } });
  });

  /* ---------- Open / closed status (Asia/Manila) ---------- */
  (function(){
    const el = $('#openStatus'); if (!el) return;
    try {
      const now = new Date(new Date().toLocaleString('en-US', { timeZone:'Asia/Manila' }));
      const d = now.getDay(), h = now.getHours();
      const open = d >= 1 && d <= 6 && h >= 8 && h < 18;
      el.textContent = open ? 'Open now' : 'Closed now · Opens 8:00 AM';
      if (!open) { el.style.color = 'var(--c-ink-2)'; }
    } catch(e){}
  })();

  /* ---------- Image fallback: hide broken images so bg colour shows ---------- */
  $$('img').forEach(img => {
    img.addEventListener('error', () => { img.style.visibility = 'hidden'; }, { once:true });
  });

  onScroll();
})();

/* =========================================================
   STATE, RENDER + CMS
   ========================================================= */
(function(){
'use strict';
const LS_KEY = 'jaycee_site_state_v2';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $  = (s,c=document) => c.querySelector(s);
const $$ = (s,c=document) => Array.from(c.querySelectorAll(s));

/* ---------- Icon library (SVG) ---------- */
const ICONS = {
  drag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="15" cy="18" r="1.2"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 15l-6-6-6 6"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>',
  video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="14" height="12" rx="2"/><path d="M22 8l-6 4 6 4V8z"/></svg>'
};

/* ---------- Default state (mirrors current live copy) ---------- */
const DEFAULT = {
  brand: {
    name: 'JayCee Trading',
    tagline: 'Est. 2017 · Palawan',
    phone: '+63 917 123 4567',
    email: 'hello@jayceetrading.ph',
    orderLabel: 'Order Online',
    accent: '#B3261E',
    green: '#1E8E4A',
    fontHead: 'intertight' // intertight | instrument
  },
  logo: {
    src: '', mime: '', name: '', size: 0, analysis: null,
    approved: false, approvedAt: 0,
    headerH: 36,      // desktop + tablet header height (px)
    headerHM: 30,     // mobile header height (px)
    footerH: 40,      // footer height (px)
    heroH: 72,        // hero height (px, scaled 72% on mobile)
    showWordmark: false,
    heroShow: false,
    favicon: false
  },
  nav: [
    { label: 'Products', href: '#products' },
    { label: 'Wholesale', href: '#wholesale' },
    { label: 'Our Story', href: '#story' },
    { label: 'Delivery', href: '#delivery' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#location' }
  ],
  hero: {
    eyebrow: 'Puerto Princesa · Frozen food & imported meats',
    line1: 'Quality food.',
    line2: 'Reliable supply.',
    line3: '<em>Delivered across Palawan.</em>',
    lede: 'Premium imported meats, seafood, dairy and frozen essentials for family kitchens, restaurants, resorts and retailers across the island.',
    cta1Label: 'Explore Products',
    cta1Href: '#products',
    cta2Label: 'Wholesale Enquiry',
    cta2Href: '#wholesale',
    footnote: 'Cold chain · Island-wide delivery · Family owned since 2017',
    proof: 'Serving 200+ Palawan kitchens',
    tag: 'Est. 2017 · Palawan',
    glassTitle: 'Cold chain, never broken',
    glassSub: '−18°C from arrival to your kitchen',
    bg: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1800&q=85',
    bgFallback: '#5a2a24'
  },
  categories: {
    eyebrow: 'What we distribute',
    title: 'Everything your kitchen needs.',
    viewAllLabel: 'View all products',
    items: [
      { title: 'Meats', sub: 'Beef · Pork · Lamb', kicker: 'Category 01', desc: 'US, Australian and local beef, pork cuts, lamb racks and premium steaks, portioned to order.', cta: 'Browse meats', fallback: '#5a2a24', img: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?auto=format&fit=crop&w=900&q=80', alt: 'Raw marbled beef steaks' },
      { title: 'Seafood', sub: 'Salmon · Prawns · Squid', kicker: 'Category 02', desc: 'Norwegian salmon, tiger prawns, scallops, squid rings and fish fillets, flash frozen at source.', cta: 'Browse seafood', fallback: '#c9846b', img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=80', alt: 'Fresh salmon fillet with herbs' },
      { title: 'Dairy & Cheese', sub: 'Butter · Cream · Cheese', kicker: 'Category 03', desc: 'Mozzarella, cheddar, parmesan, cream cheese, butter blocks and whipping cream for kitchens and bakeries.', cta: 'Browse dairy', fallback: '#d9b25a', img: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=900&q=80', alt: 'Assorted cheeses' },
      { title: 'Sausages & Cold Cuts', sub: 'Bacon · Ham · Salami', kicker: 'Category 04', desc: 'Smoked bacon, Hungarian and bratwurst sausages, honey ham, salami and deli slices for breakfast and boards.', cta: 'Browse cold cuts', fallback: '#8c3b32', img: 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?auto=format&fit=crop&w=900&q=80', alt: 'Smoked bacon strips' },
      { title: 'Frozen & Fries', sub: 'Fries · Nuggets · Veg', kicker: 'Category 05', desc: 'Shoestring and crinkle fries, hash browns, nuggets, mixed vegetables and pastry, ready for the fryer or oven.', cta: 'Browse frozen', fallback: '#d7a04a', img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80', alt: 'Golden French fries' }
    ]
  },
  featured: [
    { kicker: 'Our signature', title: 'Imported & specialty meats', cta: 'Explore the range', desc: 'Hand-selected ribeye, striploin, tenderloin, short ribs and brisket from trusted US and Australian suppliers.', bullets: ['USDA Choice & Prime', 'Australian grass-fed', 'Custom portioning available'], btn: 'Explore meats', fallback: '#5a2a24', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80', alt: 'Seared sliced steak' },
    { kicker: 'From the sea', title: 'Frozen seafood', cta: 'Explore the range', desc: 'Flash-frozen within hours of catch so every fillet and prawn arrives with its texture and flavour intact.', bullets: ['Norwegian salmon portions', 'Black tiger prawns', 'Scallops, squid & fish fillets'], btn: 'Explore seafood', fallback: '#c9846b', img: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=1200&q=80', alt: 'Prawns on ice' },
    { kicker: 'Kitchen staples', title: 'Dairy & cheese', cta: 'Explore the range', desc: 'Pizza mozzarella, aged cheddar, cream cheese, butter and cream, stocked for bakeries, cafés and hotel kitchens.', bullets: ['Block & shredded cheeses', 'Unsalted & salted butter', 'Whipping & cooking cream'], btn: 'Explore dairy', fallback: '#d9b25a', img: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=1200&q=80', alt: 'Artisan cheeses' }
  ],
  trusted: {
    eyebrow: 'Trusted by',
    title: 'Trusted by Palawan\u2019s leading kitchens.',
    items: [
      { name: 'Astoria Palawan', color: '#1E6B8C' },
      { name: 'NCCC', color: '#D7261E' },
      { name: 'Robinsons Place Palawan', color: '#1C4C9C' },
      { name: 'Hue Hotels', color: '#E07A1F' },
      { name: 'El Nido Resorts', color: '#1F7A5C' },
      { name: 'Best Western Plus', color: '#B5121B' }
    ]
  },
  goodfood: {
    eyebrow: 'Good food. Great company.',
    title: 'Good food. <em>Great company.</em>',
    rows: [
      { eyebrow: 'For home', title: 'Something good.<br><em>For every table.</em>', desc: 'From weeknight dinners to Sunday feasts, stock your freezer with restaurant-grade steaks, salmon, cheese and cold cuts, in family-sized portions, delivered to your door.', linkLabel: 'Shop for home', linkHref: '#order', fallback: '#6b4a3a', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1400&q=80', alt: 'Family table with grilled meats', reverse: false },
      { eyebrow: 'For business', title: 'Your menu.<br><em>Our commitment.</em>', desc: 'Restaurants, resorts, hotels and retailers across Palawan rely on us for consistent quality, fair wholesale pricing and a supply schedule that never leaves the kitchen short.', linkLabel: 'Wholesale enquiry', linkHref: '#location', fallback: '#3a3a3c', img: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1400&q=80', alt: 'Professional kitchen', reverse: true },
      { eyebrow: 'Delivery', title: 'Carefully stored.<br><em>Personally handled.</em>', desc: 'Every order is kept at temperature from our cold room to your kitchen. We pack it ourselves, drive it ourselves and hand it over ourselves, so nothing is left to chance.', linkLabel: 'Delivery details', linkHref: '#faq', fallback: '#4b5563', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=80', alt: 'Cold storage warehouse', reverse: false }
    ]
  },
  essentials: {
    eyebrow: 'The everyday essentials',
    title: 'The everyday essentials.',
    linkLabel: 'Browse all products',
    linkHref: '#order',
    items: [
      { title: 'Sausages & cold cuts', desc: 'Bacon, ham, salami and sausages for breakfast service and grazing boards.', fallback: '#8c3b32', img: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=1000&q=80', alt: 'Charcuterie', href: '#order' },
      { title: 'Frozen essentials', desc: 'Fries, nuggets, hash browns and vegetables that go from freezer to plate in minutes.', fallback: '#d7a04a', img: 'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?auto=format&fit=crop&w=1000&q=80', alt: 'Fries', href: '#order' },
      { title: 'Baking & pantry', desc: 'Butter, cream, puff pastry and the pantry staples your bakery runs on.', fallback: '#c9a06b', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80', alt: 'Baked loaves', href: '#order' }
    ]
  },
  story: {
    yearEyebrow: 'Since 2017',
    year: 2017,
    yearCap: 'The year a family in Puerto Princesa decided the island deserved better food.',
    copyEyebrow: 'Family owned & operated',
    title: 'A family passion.<br><em>A Palawan story.</em>',
    paragraphs: [
      'JayCee Trading & Services began in 2017 as a small family venture with a simple idea: bring the quality of imported meats, seafood and dairy that we loved to the kitchens of Palawan, without the compromise that distance usually brings.',
      'What started with a single chest freezer and a handful of loyal neighbours has grown into a trusted supplier for the island\u2019s best hotels, restaurants and supermarkets. The values have not changed. We still taste what we sell, we still know our customers by name, and we still pick up the phone ourselves.'
    ],
    tagline: 'Good products. Reliable personal service.',
    services: [
      { title: 'Cold storage', front: 'Temperature-controlled from arrival to dispatch.', backKicker: 'Cold storage', backDesc: 'Our dedicated cold room and blast freezers hold every product at a constant −18°C, logged daily, so the cold chain is never broken.', linkLabel: 'How we store' },
      { title: 'Careful packing', front: 'Insulated, sealed and labelled by hand.', backKicker: 'Careful packing', backDesc: 'Orders are vacuum sealed where needed, packed with ice gel in insulated boxes and checked twice before they leave the warehouse.', linkLabel: 'Packing standards' },
      { title: 'Local delivery', front: 'Puerto Princesa and across the island.', backKicker: 'Local delivery', backDesc: 'Same-day delivery within the city and scheduled runs to El Nido, San Vicente, Coron and beyond with our refrigerated vehicles.', linkLabel: 'Delivery areas' },
      { title: 'Personal service', front: 'Real people who know your order.', backKicker: 'Personal service', backDesc: 'Talk to the family directly. We help you plan menus, manage stock levels and find specialty items that are hard to source on the island.', linkLabel: 'Talk to us' }
    ]
  },
  location: {
    eyebrow: 'Find us',
    title: 'We\u2019ve moved.<br><em>Come find us.</em>',
    intro: 'Our new, larger warehouse and showroom is now open on B.M. Road, with more cold storage, easier parking and a wider range on the shelves.',
    name: 'JayCee Trading & Services',
    addressLine1: 'Dorothy Ave., B.M. Road, Brgy. San Pedro',
    addressLine2: 'Puerto Princesa City, Palawan 5300',
    dirUrl: 'https://maps.app.goo.gl/1891oT84hS5W7Ygz9',
    dirLabel: 'Get Directions',
    callLabel: '+63 917 123 4567',
    stats: [
      { n: 10, unit: 'min', label: 'from city proper' },
      { n: 15, unit: 'min', label: 'from the airport' },
      { n: 20, unit: 'min', label: 'from the sea port' }
    ],
    mapKicker: 'Our new home',
    mapTitle: 'Find us on B.M. Road.',
    mapDesc: 'Look for the red JayCee sign beside the warehouse gate. Parking is available on site for cars and delivery vans.',
    mapBtnLabel: 'Open in Google Maps',
    mapLabel: 'JayCee Trading · B.M. Road',
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3932.022030793975!2d118.7521104!3d9.764201!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33b563000ff94ee5%3A0x361d56d8cceee597!2sJayCee%20Trading%20%26%20Services!5e0!3m2!1sen!2sph!4v1793257309192!5m2!1sen!2sph',
    hours: [
      { dt: 'Store hours', dd: 'Monday – Saturday · 8:00 AM – 6:00 PM' },
      { dt: 'Sunday', dd: 'Closed · Deliveries by arrangement' },
      { dt: 'Wholesale pick-up', dd: 'Weekdays · 7:00 AM – 5:00 PM' }
    ]
  },
  faq: {
    eyebrow: 'Quick answers',
    title: 'Good questions.<br><em>Simple answers.</em>',
    intro: "Can\u2019t find what you\u2019re looking for? Call or message us and a real person will reply.",
    items: [
      { q: 'Do you deliver to Puerto Princesa?', a: 'Yes. We deliver across Puerto Princesa City, usually same day for orders placed before noon. For El Nido, San Vicente, Coron and other municipalities we run scheduled refrigerated deliveries each week.' },
      { q: 'Can I order in bulk for my restaurant or hotel?', a: 'Absolutely. Most of our business is wholesale. We offer tiered pricing, standing weekly orders and dedicated account support for restaurants, resorts, hotels and retailers.' },
      { q: 'How do I place an order?', a: 'Order online through our shop, message us on Facebook or Viber, or call the store directly. Wholesale customers can also send a purchase order by email and we\u2019ll confirm stock and delivery time within the hour.' },
      { q: 'What payment methods do you accept?', a: 'Cash on delivery, GCash, Maya and bank transfer. Approved wholesale accounts may apply for credit terms.' },
      { q: 'How do you ensure product freshness?', a: 'Every product stays frozen at −18°C from the moment it arrives until it reaches you. We monitor temperatures daily, rotate stock strictly by date, and deliver in insulated boxes or refrigerated vehicles.' },
      { q: 'Can I schedule regular deliveries?', a: 'Yes. Many of our business customers have a standing order delivered on fixed days each week. Tell us what you need and how often and we\u2019ll build a schedule around your kitchen.' }
    ]
  },
  midCta: {
    eyebrow: 'Still curious?',
    title: 'Looking for something <em>specific?</em>',
    desc: 'If you can\u2019t find a product on our list, chances are we can source it. Send us an enquiry and we\u2019ll get back to you the same day.',
    btnLabel: 'Send Order Enquiry',
    btnHref: 'mailto:hello@jayceetrading.ph?subject=Order%20Enquiry'
  },
  finalCta: {
    eyebrow: 'Ready when you are',
    title: 'Let\u2019s keep your <em>kitchen supplied.</em>',
    bg: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2000&q=80',
    bgFallback: '#3a3a3c',
    cta1Label: 'Order Online',
    cta1Href: '#products',
    cta2Label: 'Talk to the team',
    cta2Href: '#location'
  },
  footer: {
    brandText: 'Frozen food and imported meats distributor serving homes, restaurants, resorts and retailers across Palawan.',
    cols: [
      { title: 'Explore', links: [
        { label: 'Products', href: '#products' },
        { label: 'Wholesale', href: '#wholesale' },
        { label: 'Our Story', href: '#story' },
        { label: 'Delivery', href: '#delivery' },
        { label: 'FAQ', href: '#faq' }
      ]},
      { title: 'Partner with us', links: [
        { label: 'Restaurants & cafés', href: '#wholesale' },
        { label: 'Hotels & resorts', href: '#wholesale' },
        { label: 'Supermarkets', href: '#wholesale' },
        { label: 'Request a price list', href: '#location' }
      ]},
      { title: 'Contact', links: [
        { label: '+63 917 123 4567', href: 'tel:+639171234567' },
        { label: 'hello@jayceetrading.ph', href: 'mailto:hello@jayceetrading.ph' },
        { label: 'Dorothy Ave., B.M. Road, Puerto Princesa City, Palawan 5300', href: '#location', muted: true },
        { label: 'Mon – Sat · 8:00 AM – 6:00 PM', href: '#location', muted: true }
      ]}
    ],
    copy: '© {year} JayCee Trading & Services. All rights reserved.',
    loc: 'Puerto Princesa, Palawan · Philippines'
  },
  social: {
    items: [
      { label: 'Facebook', url: '#', icon: 'facebook' }
    ]
  }
};

/* ---------- State helpers ---------- */
function clone(o){ return JSON.parse(JSON.stringify(o)); }
let state = loadState();

function loadState(){
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return clone(DEFAULT);
    const s = JSON.parse(raw);
    // deep merge: fall back to defaults for missing keys
    return Object.assign(clone(DEFAULT), s);
  } catch(e){ return clone(DEFAULT); }
}
function saveState(){
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); }
  catch(e){ toast('Storage full — export your JSON to save', true); }
}

/* ---------- Utilities ---------- */
function el(tag, cls, html){ const n = document.createElement(tag); if (cls) n.className = cls; if (html !== undefined) n.innerHTML = html; return n; }
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
function toast(msg, isErr){
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  if (isErr) t.style.background = 'var(--c-accent)'; else t.style.background = 'var(--c-ink)';
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2400);
}
function readFileAsDataURL(file){
  return new Promise((res, rej) => {
    const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file);
  });
}

/* =========================================================
   RENDER FUNCTIONS
   ========================================================= */

function setText(id, html){ const n = document.getElementById(id); if (n) n.innerHTML = html; }
function setAttr(id, attr, val){ const n = document.getElementById(id); if (n) n.setAttribute(attr, val); }
function setImg(id, src, fallback){
  const n = document.getElementById(id); if (!n) return;
  n.src = src || '';
  if (fallback) n.parentElement.style.setProperty('--fallback', fallback);
  else if (n.parentElement) n.parentElement.style.removeProperty('--fallback');
}

/* ---------- Official logo helpers ---------- */
const MARK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c-1 3-5 4.5-5 9a5 5 0 0 0 10 0c0-4.5-4-6-5-9Z"/><path d="M9 13.5c.5 1.5 1.5 2.5 3 3"/></svg>';
function ensureLogoState(){ state.logo = Object.assign(clone(DEFAULT.logo), state.logo || {}); return state.logo; }
function hasLiveLogo(){ const L = state.logo; return !!(L && L.approved && L.src); }
/* Returns the inner markup for a .brand link (header or footer) */
function brandInner(where){
  const word = `<span class="brand-word"><small>${esc(state.brand.tagline)}</small><strong>${esc(state.brand.name)}</strong></span>`;
  if (!hasLiveLogo()) return `<span class="brand-mark" aria-hidden="true">${MARK_SVG}</span>${word}`;
  const showWord = !!state.logo.showWordmark;
  return `<img class="brand-logo brand-logo--${where}" src="${esc(state.logo.src)}" alt="${showWord ? '' : esc(state.brand.name)}" decoding="async">${showWord ? word : ''}`;
}
/* Pushes logo sizes into CSS custom properties (live everywhere) */
function applyLogoVars(){
  const L = ensureLogoState(), r = document.documentElement.style;
  r.setProperty('--logo-h-header', (L.headerH || 36) + 'px');
  r.setProperty('--logo-h-header-m', (L.headerHM || 30) + 'px');
  r.setProperty('--logo-h-footer', (L.footerH || 40) + 'px');
  r.setProperty('--logo-h-hero', (L.heroH || 72) + 'px');
}
/* Optional: use the approved logo as the browser tab icon */
function applyFavicon(){
  const L = state.logo || {};
  let link = document.querySelector('link[rel="icon"][data-cms]');
  if (L.favicon && hasLiveLogo()){
    if (!link){ link = document.createElement('link'); link.rel = 'icon'; link.dataset.cms = '1'; document.head.appendChild(link); }
    link.type = L.mime || 'image/png';
    link.href = L.src;
  } else if (link) link.remove();
}

/* ---------- Nav ---------- */
function renderNav(){
  const ul = $('#navLinks'); ul.innerHTML = '';
  const mm = $('#mobileMenu');
  // remove any previously state-rendered links from mobile menu (leave the Order Online button)
  $$('a[data-nav-cms]', mm).forEach(a => a.remove());
  state.nav.forEach(n => {
    const a = document.createElement('a');
    a.href = n.href; a.textContent = n.label;
    ul.appendChild(a);
    const ma = a.cloneNode(true);
    ma.setAttribute('data-nav-cms','1');
    mm.insertBefore(ma, mm.querySelector('.btn'));
  });
  const tel = $('#navTel');
  tel.href = 'tel:' + state.brand.phone.replace(/\s+/g,'');
  tel.textContent = state.brand.phone;
  $('#navOrderLabel').textContent = state.brand.orderLabel;
  $('#navOrderBtn').href = state.finalCta.cta1Href;
  document.documentElement.style.setProperty('--c-accent', state.brand.accent);
  document.documentElement.style.setProperty('--c-green', state.brand.green);
  document.documentElement.style.setProperty('--c-accent-dark', shade(state.brand.accent, -14));
  document.documentElement.style.setProperty('--c-green-dark', shade(state.brand.green, -14));
  const headFont = state.brand.fontHead === 'instrument'
    ? '"Instrument Serif", Georgia, serif'
    : '"Inter Tight", "Inter", system-ui, sans-serif';
  document.documentElement.style.setProperty('--f-serif', headFont);
  document.documentElement.style.setProperty('--f-display', headFont);
  // brand: official logo (if approved) or default mark + name
  ensureLogoState();
  applyLogoVars();
  const nb = $('#navBrand');
  if (nb){
    nb.innerHTML = brandInner('header');
    nb.classList.toggle('has-logo', hasLiveLogo());
    nb.setAttribute('aria-label', state.brand.name + ' home');
  }
  applyFavicon();
}
function shade(hex, percent){
  const h = hex.replace('#','');
  const num = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16);
  let r = (num >> 16) + Math.round(255 * percent / 100);
  let g = ((num >> 8) & 0xff) + Math.round(255 * percent / 100);
  let b = (num & 0xff) + Math.round(255 * percent / 100);
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/* ---------- Hero ---------- */
function renderHero(){
  const h = state.hero;
  setText('heroEyebrow', esc(h.eyebrow));
  setText('heroLine1', h.line1);
  setText('heroLine2', h.line2);
  setText('heroLine3', h.line3);
  setText('heroLede', esc(h.lede));
  setText('heroCta1Label', esc(h.cta1Label));
  setAttr('heroCta1', 'href', h.cta1Href);
  setText('heroCta2Label', esc(h.cta2Label));
  setAttr('heroCta2', 'href', h.cta2Href);
  setText('heroFootNote', esc(h.footnote));
  setText('heroProof', esc(h.proof || 'Serving 200+ Palawan kitchens'));
  setText('heroTag', esc(h.tag || 'Est. 2017 · Palawan'));
  setText('heroGlassTitle', esc(h.glassTitle || 'Cold chain, never broken'));
  setText('heroGlassSub', esc(h.glassSub || '−18°C from arrival to your kitchen'));
  setImg('heroBgImg', h.bg, h.bgFallback);
  const frame = $('#heroMedia');
  if (frame) frame.style.background = h.bgFallback || 'var(--img-meat)';
  const heroEl = $('#hero'); if (heroEl) heroEl.style.background = '';
  // Optional official logo above the hero headline
  const hl = $('#heroLogo');
  if (hl){
    const on = !!(state.logo && state.logo.heroShow && hasLiveLogo());
    hl.hidden = !on;
    hl.innerHTML = on ? `<img src="${esc(state.logo.src)}" alt="${esc(state.brand.name)} logo" decoding="async">` : '';
  }
}

/* ---------- Categories ---------- */
const ARROW_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
function renderCategories(){
  setText('catEyebrow', esc(state.categories.eyebrow));
  setText('cat-title', state.categories.title);
  $('#catViewAll').innerHTML = esc(state.categories.viewAllLabel) + ' ' + ARROW_SVG;
  const box = $('#catCarousel'); box.innerHTML = '';
  state.categories.items.forEach((c, i) => {
    const art = el('article', 'cat flip');
    art.setAttribute('role','listitem');
    art.setAttribute('tabindex','0');
    art.setAttribute('aria-pressed','false');
    art.setAttribute('aria-label', c.title + '. Press to see details.');
    art.style.setProperty('--fallback', c.fallback || '#5a2a24');
    art.innerHTML = `
      <div class="flip-inner">
        <div class="flip-face flip-front">
          <img src="${esc(c.img || '')}" alt="${esc(c.alt || c.title)}" loading="lazy"
               onerror="this.style.visibility='hidden'">
          <div class="cat-label"><h3>${esc(c.title)}</h3><small>${esc(c.sub || '')}</small></div>
        </div>
        <div class="flip-face flip-back">
          <div>
            <p class="flip-kicker">${esc(c.kicker || '')}</p>
            <h3>${esc(c.title)}</h3>
            <p>${esc(c.desc || '')}</p>
          </div>
          <a href="${esc(c.ctaHref || '#order')}" class="link" tabindex="-1">${esc(c.cta || 'Browse')} ${ARROW_SVG}</a>
        </div>
      </div>`;
    box.appendChild(art);
  });
  wireFlips(box);
  updateCarouselArrows();
}

/* ---------- Featured ---------- */
function renderFeatured(){
  const box = $('#featuredList'); box.innerHTML = '';
  state.featured.forEach((c, i) => {
    const bullets = (c.bullets || []).map(b => `<li>${esc(b)}</li>`).join('');
    const art = el('article','feature-card flip');
    art.tabIndex = 0;
    art.setAttribute('aria-pressed','false');
    art.setAttribute('aria-label', c.title + '. Press to see details.');
    art.style.setProperty('--fallback', c.fallback || '#5a2a24');
    art.innerHTML = `
      <div class="flip-inner">
        <div class="flip-face flip-front">
          <img src="${esc(c.img || '')}" alt="${esc(c.alt || c.title)}" loading="lazy"
               onerror="this.style.visibility='hidden'">
          <div class="fc-body">
            <p class="eyebrow">${esc(c.kicker)}</p>
            <h3>${esc(c.title)}</h3>
            <span class="fc-arrow">${esc(c.cta)} ${ARROW_SVG}</span>
          </div>
        </div>
        <div class="flip-face flip-back">
          <div>
            <p class="flip-kicker">${esc(c.kicker)}</p>
            <h3>${esc(c.title)}</h3>
            <p>${esc(c.desc)}</p>
            <ul>${bullets}</ul>
          </div>
          <a href="#order" class="btn btn-primary btn-sm" tabindex="-1">${esc(c.btn || 'Explore')}</a>
        </div>
      </div>`;
    box.appendChild(art);
  });
  wireFlips(box);
}

/* ---------- Trusted logos ---------- */
function renderTrusted(){
  setText('trustedEyebrow', esc(state.trusted.eyebrow));
  setText('trusted-title', state.trusted.title);
  const track = $('#marqueeTrack'); track.innerHTML = '';
  const buildLogo = (l) => {
    const d = document.createElement('div'); d.className = 'logo';
    d.title = l.name;
    d.innerHTML = `<svg viewBox="0 0 32 32" fill="none" stroke="${esc(l.color)}" stroke-width="1.8"><rect x="5" y="5" width="22" height="22" rx="6" fill="none"/></svg><span class="wm sans" style="color:${esc(l.color)}">${esc(l.name)}</span>`;
    return d;
  };
  state.trusted.items.forEach(l => track.appendChild(buildLogo(l)));
  // duplicate for seamless marquee
  state.trusted.items.forEach(l => { const c = buildLogo(l); c.setAttribute('aria-hidden','true'); track.appendChild(c); });
}

/* ---------- Good food rows ---------- */
function renderRows(){
  setText('gfEyebrow', esc(state.goodfood.eyebrow));
  setText('gf-title', state.goodfood.title);
  const box = $('#rowsList'); box.innerHTML = '';
  state.goodfood.rows.forEach((r, i) => {
    const row = el('div', 'row rv' + (r.reverse ? ' reverse' : ''));
    row.innerHTML = `
      <div class="row-media" style="--fallback:${esc(r.fallback || '#6b4a3a')}">
        <img class="parallax" data-speed="0.12" src="${esc(r.img || '')}" alt="${esc(r.alt || '')}" loading="lazy"
             onerror="this.style.visibility='hidden'">
      </div>
      <div class="row-text">
        <p class="eyebrow">${esc(r.eyebrow)}</p>
        <h3>${r.title}</h3>
        <p>${esc(r.desc)}</p>
        <a href="${esc(r.linkHref || '#')}" class="link">${esc(r.linkLabel)} ${ARROW_SVG}</a>
      </div>`;
    box.appendChild(row);
  });
  wireParallax(box);
  wireReveal(box);
}

/* ---------- Essentials ---------- */
function renderEssentials(){
  setText('essEyebrow', esc(state.essentials.eyebrow));
  setText('ess-title', state.essentials.title);
  const link = $('#essLink'); link.href = state.essentials.linkHref || '#';
  link.innerHTML = esc(state.essentials.linkLabel) + ' ' + ARROW_SVG;
  const box = $('#essList'); box.innerHTML = '';
  state.essentials.items.forEach(e => {
    const a = el('a', 'ess');
    a.href = e.href || '#order';
    a.innerHTML = `
      <div class="ess-media" style="--fallback:${esc(e.fallback || '#8c3b32')}">
        <img src="${esc(e.img || '')}" alt="${esc(e.alt || e.title)}" loading="lazy"
             onerror="this.style.visibility='hidden'">
      </div>
      <h3>${esc(e.title)} ${ARROW_SVG}</h3>
      <p>${esc(e.desc)}</p>`;
    box.appendChild(a);
  });
}

/* ---------- Story ---------- */
function renderStory(){
  setText('storyYearEyebrow', esc(state.story.yearEyebrow));
  setText('storyYearCap', esc(state.story.yearCap));
  const yEl = $('#storyYear');
  yEl.textContent = state.story.year;
  yEl.setAttribute('data-count', state.story.year);
  setText('storyCopyEyebrow', esc(state.story.copyEyebrow));
  setText('story-title', state.story.title);
  const paras = $('#storyParas'); paras.innerHTML = state.story.paragraphs.map(p => `<p>${esc(p)}</p>`).join('');
  setText('storyTagline', esc(state.story.tagline));

  const box = $('#svcList'); box.innerHTML = '';
  state.story.services.forEach(s => {
    const art = el('article','svc flip');
    art.tabIndex = 0; art.setAttribute('aria-pressed','false');
    art.setAttribute('aria-label', s.title + '. Press to see details.');
    art.innerHTML = `
      <div class="flip-inner">
        <div class="flip-face flip-front">
          <div class="icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M4.9 6.5l14.2 11M4.9 17.5l14.2-11"/></svg></div>
          <div><h3>${esc(s.title)}</h3><p>${esc(s.front)}</p></div>
        </div>
        <div class="flip-face flip-back">
          <div>
            <p class="flip-kicker">${esc(s.backKicker || s.title)}</p>
            <p>${esc(s.backDesc || '')}</p>
          </div>
          <a href="#" class="link" tabindex="-1">${esc(s.linkLabel || 'Learn more')} ${ARROW_SVG}</a>
        </div>
      </div>`;
    box.appendChild(art);
  });
  wireFlips(box);
}

/* ---------- Location ---------- */
function renderLocation(){
  const L = state.location;
  setText('locEyebrow', esc(L.eyebrow));
  setText('loc-title', L.title);
  setText('locIntro', esc(L.intro));
  $('#locAddress').innerHTML = `<strong>${esc(L.name)}</strong>${esc(L.addressLine1)}<br>${esc(L.addressLine2)}`;
  const stats = $('#locStats'); stats.innerHTML = '';
  L.stats.forEach(s => {
    const d = el('div','stat');
    d.innerHTML = `<div class="n"><span data-count="${s.n}">0</span><small>${esc(s.unit)}</small></div><div class="l">${esc(s.label)}</div>`;
    stats.appendChild(d);
  });
  setAttr('locDirBtn', 'href', L.dirUrl);
  setText('locDirLabel', esc(L.dirLabel));
  setAttr('locCallBtn', 'href', 'tel:' + (state.brand.phone.replace(/\s+/g,'')));
  setText('locCallLabel', esc(state.brand.phone));
  setText('mapKicker', esc(L.mapKicker));
  setText('mapTitle', esc(L.mapTitle));
  setText('mapDesc', esc(L.mapDesc));
  setAttr('mapDirLink', 'href', L.dirUrl);
  $('#mapDirLink').textContent = L.mapBtnLabel;
  setAttr('mapCallLink', 'href', 'tel:' + state.brand.phone.replace(/\s+/g,''));
  const iframe = $('#mapIframe');
  if (iframe && L.mapEmbed) { iframe.src = L.mapEmbed; }
  const label = $('#mapLabel'); if (label) label.textContent = L.mapLabel || 'Now open · B.M. Road';
  const hours = $('#mapHours'); hours.innerHTML = '';
  L.hours.forEach(h => {
    hours.innerHTML += `<dt>${esc(h.dt)}</dt><dd>${esc(h.dd)}</dd>`;
  });
  hours.innerHTML += `<span class="open" id="openStatus"></span>`;
  initCounters();
  updateOpenStatus();
}

/* ---------- FAQ ---------- */
function renderFAQ(){
  setText('', '');
  const head = document.querySelector('.faq-head');
  head.querySelector('p.eyebrow').id = 'faqEyebrow';
  head.querySelector('h2').id = 'faq-title';
  // eyebrow + title
  const eyebrow = $('#faqEyebrow'); if (eyebrow) eyebrow.textContent = state.faq.eyebrow;
  setText('faq-title', state.faq.title);
  const introP = head.querySelector('p.muted'); if (introP) introP.textContent = state.faq.intro;
  const list = $('#faqList'); list.innerHTML = '';
  state.faq.items.forEach((item, i) => {
    const id = 'faq-a' + i, qid = 'faq-q' + i;
    const wrap = el('div','faq-item');
    wrap.innerHTML = `
      <h3><button class="faq-q" aria-expanded="false" aria-controls="${id}" id="${qid}"><span class="q-text">${esc(item.q)}</span>
        <span class="plus" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span>
      </button></h3>
      <div class="faq-a" id="${id}" role="region" aria-labelledby="${qid}"><div></div></div>`;
    list.appendChild(wrap);
    // prepare text (ghost + typed spans)
    const box = wrap.querySelector('.faq-a > div');
    const text = item.a;
    const s = el('span','faq-text');
    s.dataset.text = text;
    s.innerHTML = '<span class="ghost">' + esc(text) + '</span>' +
                  '<span class="typed" aria-hidden="true"><span class="chars"></span><span class="caret"></span></span>';
    box.appendChild(s);
  });
  wireFAQ();
}

/* ---------- Mid CTA ---------- */
function renderMidCta(){
  setText('midEyebrow', esc(state.midCta.eyebrow));
  setText('mid-title', state.midCta.title);
  setText('midDesc', esc(state.midCta.desc));
  const b = $('#midBtn'); b.href = state.midCta.btnHref;
  b.innerHTML = esc(state.midCta.btnLabel) + ' ' + ARROW_SVG;
}

/* ---------- Final CTA ---------- */
function renderFinal(){
  setText('finalEyebrow', esc(state.finalCta.eyebrow));
  setText('final-title', state.finalCta.title);
  setImg('finalBgImg', state.finalCta.bg, state.finalCta.bgFallback);
  $('.cta-final .bg').style.background = state.finalCta.bgFallback || 'var(--img-kitchen)';
  const c1 = $('#finalCta1'), c2 = $('#finalCta2');
  c1.href = state.finalCta.cta1Href;
  c1.innerHTML = esc(state.finalCta.cta1Label) + ' ' + ARROW_SVG;
  c2.href = state.finalCta.cta2Href;
  c2.textContent = state.finalCta.cta2Label;
}

/* ---------- Footer ---------- */
function renderFooter(){
  const brand = $('#footerBrand');
  brand.innerHTML = `
    <a href="#top" class="brand${hasLiveLogo() ? ' has-logo' : ''}" aria-label="${esc(state.brand.name)} home">${brandInner('footer')}</a>
    <p>${esc(state.footer.brandText)}</p>`;
  const grid = $('#footerGrid');
  // remove any extra cols
  $$('.footer-col', grid).forEach(c => c.remove());
  state.footer.cols.forEach(col => {
    const c = el('div','footer-col');
    c.innerHTML = `<h4>${esc(col.title)}</h4><ul>` +
      col.links.map(l => {
        const cls = l.muted ? ' class="muted"' : '';
        if (l.muted) {
          return `<li><span${cls}>${esc(l.label)}</span></li>`;
        }
        return `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`;
      }).join('') + '</ul>';
    grid.appendChild(c);
  });
  const y = new Date().getFullYear();
  $('#footerCopy').textContent = state.footer.copy.replace('{year}', y);
  $('#footerLoc').textContent = state.footer.loc;
  document.title = state.brand.name + ' — ' + state.hero.line1.replace(/\.|<[^>]+>/g,'').trim() + ' ' + state.hero.line3.replace(/<[^>]+>/g,'').trim();
}

/* =========================================================
   RE-INIT helpers (after re-rendering dynamic lists)
   ========================================================= */
function wireFlips(scope){
  const isTouch = window.matchMedia('(hover: none)').matches;
  $$('.flip', scope || document).forEach(card => {
    if (card._wired) return;
    card._wired = true;
    const toggle = () => {
      const flipped = card.classList.toggle('is-flipped');
      card.setAttribute('aria-pressed', String(flipped));
    };
    card.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      if (isTouch) toggle();
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      if (e.key === 'Escape') { card.classList.remove('is-flipped'); card.setAttribute('aria-pressed','false'); }
    });
  });
}
function wireParallax(scope){
  const imgs = $$('.parallax', scope || document);
  imgs.forEach(i => { if (!i._wiredP) { i._wiredP = true; } });
}
function wireReveal(scope){
  if (!('IntersectionObserver' in window) || reduceMotion) return;
  const items = $$('.rv, .rv-stagger', scope || document);
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  items.forEach(i => io.observe(i));
}
function initCounters(){
  const counters = $$('[data-count]');
  if (window.__countIO) counters.forEach(c => window.__countIO.observe(c));
}
function updateOpenStatus(){
  const el = $('#openStatus'); if (!el) return;
  try {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone:'Asia/Manila' }));
    const d = now.getDay(), h = now.getHours(), m = now.getMinutes();
    const t = h*60 + m;
    const open = d >= 1 && d <= 6 && t >= 8*60 && t < 18*60;
    el.textContent = open ? 'Open now' : 'Closed now · Opens 8:00 AM';
    if (!open) el.style.color = 'var(--c-ink-2)'; else el.style.color = '';
  } catch(e){}
}
function updateCarouselArrows(){
  const track = document.getElementById('catCarousel'); if (!track) return;
  const prev = document.getElementById('catPrev'), next = document.getElementById('catNext');
  if (!prev || !next) return;
  prev.disabled = track.scrollLeft <= 4;
  next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
}

/* FAQ wiring (re-init) — duplicated from main script but scoped to new items */
function wireFAQ(){
  const faqBtns = $$('.faq-q');
  function closePanel(btn){
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    const wrap = panel.querySelector('.faq-text');
    if (wrap && wrap._raf) { cancelAnimationFrame(wrap._raf); wrap._raf = null; }
    panel.style.height = panel.scrollHeight + 'px';
    requestAnimationFrame(() => { panel.style.height = '0px'; });
    btn.setAttribute('aria-expanded','false');
  }
  function typeAnswer(panel){
    const wrap = panel.querySelector('.faq-text'); if (!wrap) return;
    const chars = wrap.querySelector('.chars'); const text = wrap.dataset.text;
    if (wrap._raf) cancelAnimationFrame(wrap._raf);
    wrap.classList.remove('is-done');
    if (reduceMotion) { chars.textContent = text; wrap.classList.add('is-done'); return; }
    chars.textContent = '';
    const perChar = Math.min(14, 1800 / text.length);
    const start = performance.now() + 180; let shown = 0;
    function tick(now){
      const target = Math.min(text.length, Math.floor((now - start) / perChar));
      if (target > shown) { shown = target; chars.textContent = text.slice(0, shown); }
      if (shown < text.length) wrap._raf = requestAnimationFrame(tick);
      else { wrap._raf = null; setTimeout(() => wrap.classList.add('is-done'), 600); }
    }
    wrap._raf = requestAnimationFrame(tick);
  }
  function openPanel(btn){
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    panel.style.height = panel.scrollHeight + 'px';
    btn.setAttribute('aria-expanded','true');
    typeAnswer(panel);
  }
  faqBtns.forEach(btn => {
    if (btn._wired) return; btn._wired = true;
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      faqBtns.forEach(b => { if (b !== btn && b.getAttribute('aria-expanded') === 'true') closePanel(b); });
      isOpen ? closePanel(btn) : openPanel(btn);
    });
  });
}

/* Main render */
function renderAll(){
  renderNav(); renderHero(); renderCategories(); renderFeatured();
  renderTrusted(); renderRows(); renderEssentials(); renderStory();
  renderLocation(); renderFAQ(); renderMidCta(); renderFinal(); renderFooter();
  // global re-init for things that attach to new nodes
  wireFlips();
  wireParallax();
  wireReveal();
  if (window.__onResize) window.__onResize();
}

/* Expose a resize hook for the main script's carousel / parallax */
window.addEventListener('resize', () => { updateCarouselArrows(); });
window.__onResize = () => { updateCarouselArrows(); };

/* =========================================================
   ADMIN PANEL
   ========================================================= */
const panel = $('#adminPanel');

/* --- Open / close panel (no login) --- */
$('#adminLaunch').addEventListener('click', () => {
  if (panel.classList.contains('is-open')) closePanel();
  else openPanel();
});

function openPanel(){
  buildPanel();
  panel.classList.add('is-open');
  panel.setAttribute('aria-hidden','false');
  $('#adminLaunch').classList.add('is-open');
  if (window.__syncBodyOverflow) window.__syncBodyOverflow(true);
  else document.body.style.overflow = 'hidden';
}
function closePanel(){
  panel.classList.remove('is-open');
  panel.setAttribute('aria-hidden','true');
  $('#adminLaunch').classList.remove('is-open');
  if (window.__syncBodyOverflow) window.__syncBodyOverflow(false);
  else document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });
$('#adminClose').addEventListener('click', closePanel);
$('#btnClose').addEventListener('click', closePanel);

// Click outside panel content (on the panel bg) closes it (for mobile the panel is full-screen so this is a no-op; useful on desktop)
panel.addEventListener('click', e => { if (e.target === panel) closePanel(); });
$('#btnReset').addEventListener('click', () => {
  if (confirm('Reset all content, images and settings to defaults? This cannot be undone.')){
    state = clone(DEFAULT); saveState(); renderAll(); buildPanel(); toast('Reset to defaults');
  }
});
$('#btnExport').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'jaycee-site-' + new Date().toISOString().slice(0,10) + '.json';
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});
$('#importFile').addEventListener('change', async (e) => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const text = await f.text();
    const data = JSON.parse(text);
    state = Object.assign(clone(DEFAULT), data);
    saveState(); renderAll(); buildPanel(); toast('Imported settings');
  } catch(err){ toast('Invalid JSON file', true); }
  e.target.value = '';
});

/* =========================================================
   Build the admin panel UI
   ========================================================= */
const TABS = [
  { id: 'brand',    label: 'Brand & Contact' },
  { id: 'logo',     label: 'Logo' },
  { id: 'theme',    label: 'Theme' },
  { id: 'nav',      label: 'Navigation' },
  { id: 'hero',     label: 'Hero' },
  { id: 'cats',     label: 'Categories' },
  { id: 'feat',     label: 'Featured' },
  { id: 'logos',    label: 'Trusted By' },
  { id: 'rows',     label: 'Three Stories' },
  { id: 'ess',      label: 'Essentials' },
  { id: 'story',    label: 'Our Story' },
  { id: 'loc',      label: 'Location' },
  { id: 'faq',      label: 'FAQ' },
  { id: 'mid',      label: 'Mid CTA' },
  { id: 'final',    label: 'Final CTA' },
  { id: 'footer',   label: 'Footer' }
];

let activeTab = 'brand';

function buildPanel(){
  const tabsEl = $('#adminTabs'); tabsEl.innerHTML = '';
  TABS.forEach(t => {
    const b = el('button', 'admin-tab' + (t.id === activeTab ? ' active' : ''), t.label);
    b.setAttribute('role','tab');
    b.addEventListener('click', () => { activeTab = t.id; buildPanel(); });
    tabsEl.appendChild(b);
  });
  const body = $('#adminBody');
  body.innerHTML = '';
  const section = el('div','admin-section active');
  body.appendChild(section);
  const render = {
    brand: renderBrandTab, logo: renderLogoTab, theme: renderThemeTab, nav: renderNavTab, hero: renderHeroTab,
    cats: renderCatsTab, feat: renderFeatTab, logos: renderLogosTab, rows: renderRowsTab,
    ess: renderEssTab, story: renderStoryTab, loc: renderLocTab, faq: renderFaqTab,
    mid: renderMidTab, final: renderFinalTab, footer: renderFooterTab
  }[activeTab];
  render(section);
  body.scrollTop = 0;
}

/* ---- Field helpers ---- */
function field(label, control, hint){
  const w = el('div','admin-field');
  w.innerHTML = `<label>${esc(label)}</label>`;
  if (typeof control === 'string') w.insertAdjacentHTML('beforeend', control);
  else w.appendChild(control);
  if (hint) w.insertAdjacentHTML('beforeend', `<div class="hint">${esc(hint)}</div>`);
  return w;
}
function input(type, val, onInput, attrs){
  const i = document.createElement('input');
  i.type = type; i.value = val == null ? '' : val;
  if (attrs) for (const k in attrs) i.setAttribute(k, attrs[k]);
  i.addEventListener('input', () => { onInput(i.value); });
  return i;
}
function textarea(val, onInput, rows){
  const t = document.createElement('textarea'); t.value = val || '';
  if (rows) t.rows = rows;
  t.addEventListener('input', () => onInput(t.value));
  return t;
}
/* HTML-enabled textarea for fields that allow <em> etc. */
function htmlInput(val, onInput, rows){
  const t = document.createElement('textarea'); t.value = val || '';
  if (rows) t.rows = rows;
  t.addEventListener('input', () => onInput(t.value));
  return t;
}
function uploadField(currentVal, fallbackVal, onDone, currentFallbackChange){
  const wrap = el('div','upload');
  const thumb = el('div','upload-thumb');
  if (currentVal && /^data:|^https?:/.test(currentVal)) {
    thumb.innerHTML = '<img src="' + esc(currentVal) + '" alt="">';
  } else {
    thumb.innerHTML = ICONS.image;
  }
  const ctrl = el('div','upload-ctrl');
  const lbl = el('label','upload-btn');
  lbl.innerHTML = ICONS.image + ' Upload image/video';
  const fi = document.createElement('input'); fi.type='file'; fi.accept='image/*,video/*';
  fi.addEventListener('change', async () => {
    const f = fi.files[0]; if (!f) return;
    const dataUrl = await readFileAsDataURL(f);
    onDone(dataUrl, f.type);
    // update thumb
    thumb.innerHTML = f.type.startsWith('video/') ? ICONS.video : '<img src="' + dataUrl + '" alt="">';
  });
  lbl.appendChild(fi);
  const urlInput = document.createElement('input');
  urlInput.type='text'; urlInput.placeholder='Or paste an image/video URL'; urlInput.className='upload-url';
  urlInput.value = (currentVal && /^https?:/.test(currentVal)) ? currentVal : '';
  urlInput.addEventListener('change', () => {
    onDone(urlInput.value, null);
    thumb.innerHTML = urlInput.value ? '<img src="'+esc(urlInput.value)+'" alt="">' : ICONS.image;
  });
  const clearBtn = el('button', 'upload-clear', 'Remove');
  clearBtn.addEventListener('click', () => { onDone('', null); thumb.innerHTML = ICONS.image; urlInput.value = ''; });
  // fallback colour
  const fallbackInput = input('text', fallbackVal || '', v => { if (currentFallbackChange) currentFallbackChange(v); }, { placeholder: '#5a2a24' });
  fallbackInput.style.marginTop = '6px';
  fallbackInput.style.fontSize = '12px';
  const fbLabel = el('div','hint','Fallback colour (#hex)');
  ctrl.append(lbl, urlInput, clearBtn, fbLabel, fallbackInput);
  wrap.append(thumb, ctrl);
  return wrap;
}
function colorSwatch(currentVal, onDone){
  const w = el('input'); w.type = 'color'; w.value = currentVal;
  w.style.width = '44px'; w.style.height = '36px'; w.style.padding = '0'; w.style.border = '1px solid var(--c-hairline)'; w.style.borderRadius = '10px'; w.style.background = 'transparent';
  w.addEventListener('input', () => onDone(w.value));
  const hex = input('text', currentVal, v => onDone(v), { placeholder:'#B3261E' });
  hex.style.maxWidth = '140px';
  const wrap = el('div'); wrap.style.display = 'flex'; wrap.style.gap = '8px'; wrap.style.alignItems = 'center';
  wrap.append(w, hex);
  w.addEventListener('input', () => hex.value = w.value);
  hex.addEventListener('input', () => { if (/^#[0-9a-fA-F]{6}$/.test(hex.value)) w.value = hex.value; });
  return wrap;
}

/* ---- Section helpers ---- */
function sectionHeader(title, desc){
  const w = document.createElement('div'); w.style.marginBottom = 'var(--s-4)';
  w.innerHTML = `<h3 class="admin-section-title">${esc(title)}</h3>${desc?`<p class="admin-section-desc">${esc(desc)}</p>`:''}`;
  return w;
}

function bind(){ saveState(); renderAll(); }

function listEditor({ items, renderItem, add, onReorder, labelHint }){
  const wrap = el('div','admin-list');
  let dragSrc = null;
  function render(){
    wrap.innerHTML = '';
    items.forEach((it, idx) => {
      const head = el('div','admin-item-head');
      head.draggable = true;
      head.innerHTML = `<span class="admin-drag" title="Drag to reorder">${ICONS.drag}</span>`;
      const titleSpan = el('span','admin-item-title');
      titleSpan.textContent = (typeof renderItem.title === 'function' ? renderItem.title(it) : renderItem.title) + ' #' + (idx+1);
      head.appendChild(titleSpan);
      const toggle = el('button','admin-item-toggle');
      toggle.innerHTML = '<span class="chev">' + ICONS.down + '</span>';
      head.appendChild(toggle);
      const del = el('button','btn-danger');
      del.innerHTML = ICONS.trash;
      del.title = 'Delete item';
      del.addEventListener('click', (e) => { e.stopPropagation();
        if (confirm('Delete this item?')) { items.splice(idx,1); onReorder && onReorder(); buildPanel(); bind(); }
      });
      head.appendChild(del);
      const item = el('div','admin-item');
      item.appendChild(head);
      const body = el('div','admin-item-body');
      body.appendChild(renderItem.body(it, idx, () => { buildPanel(); }));
      item.appendChild(body);
      head.addEventListener('click', (e) => {
        if (e.target.closest('.btn-danger, .admin-drag')) return;
        item.classList.toggle('open');
        head.querySelector('.chev').innerHTML = item.classList.contains('open') ? ICONS.up : ICONS.down;
      });
      // drag & drop
      head.addEventListener('dragstart', (e) => { dragSrc = idx; item.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
      head.addEventListener('dragend', () => { item.classList.remove('dragging'); $$('.admin-item', wrap).forEach(n => n.classList.remove('drag-over')); });
      head.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
      head.addEventListener('drop', (e) => {
        e.preventDefault();
        if (dragSrc === null || dragSrc === idx) return;
        const moved = items.splice(dragSrc, 1)[0];
        items.splice(idx, 0, moved); dragSrc = null;
        onReorder && onReorder(); render(); bind();
      });
      wrap.appendChild(item);
    });
  }
  render();
  const addBtn = el('button','btn-add');
  addBtn.type = 'button';
  addBtn.innerHTML = ICONS.plus + ' Add item';
  addBtn.addEventListener('click', () => { add(items); buildPanel(); bind(); });
  const container = el('div');
  if (labelHint) container.appendChild(el('div','admin-section-desc', labelHint));
  container.appendChild(wrap);
  container.appendChild(addBtn);
  return container;
}

/* =========================================================
   TAB RENDERERS
   ========================================================= */

function renderBrandTab(s){
  s.appendChild(sectionHeader('Brand & contact', 'These appear in the nav, footer, contact buttons and browser tab.'));
  const b = state.brand;
  s.appendChild(field('Brand name', input('text', b.name, v => { b.name = v; })));
  s.appendChild(field('Tagline', input('text', b.tagline, v => { b.tagline = v; }), 'Sits under the logo (e.g. \u201cEst. 2017 · Palawan\u201d).'));
  s.appendChild(field('Phone', input('tel', b.phone, v => { b.phone = v; }), 'Updates nav, location, footer and call buttons on save.'));
  s.appendChild(field('Email', input('email', ((state.footer.cols.reduce((a,c)=>a.concat(c.links),[]).find(l => l.href && l.href.startsWith('mailto:')) || {}).label) || b.email || 'hello@jayceetrading.ph', v => {
    state.footer.cols.forEach(c => c.links.forEach(l => { if (l.href && l.href.startsWith('mailto:')) { l.label = v; l.href = 'mailto:' + v; } }));
    state.midCta.btnHref = 'mailto:' + v + '?subject=Order%20Enquiry';
    b.email = v;
  }), 'Updates footer mailto link and mid-CTA on save.'));
  s.appendChild(field('"Order Online" button label', input('text', b.orderLabel, v => { b.orderLabel = v; })));
  const save = el('button','btn-save','Save changes');
  save.addEventListener('click', () => { bind(); flashSaved(save); });
  s.appendChild(save);
}

function renderThemeTab(s){
  s.appendChild(sectionHeader('Theme', 'Colours and heading font update instantly across the site.'));
  s.appendChild(field('Accent color (crimson)', colorSwatch(state.brand.accent, v => { state.brand.accent = v; document.documentElement.style.setProperty('--c-accent', v); document.documentElement.style.setProperty('--c-accent-dark', shade(v, -14)); })));
  s.appendChild(field('"Order Online" green', colorSwatch(state.brand.green, v => { state.brand.green = v; document.documentElement.style.setProperty('--c-green', v); document.documentElement.style.setProperty('--c-green-dark', shade(v, -14)); })));

  const fontRow = el('div','admin-field');
  fontRow.innerHTML = '<label>Heading font</label>';
  const sel = document.createElement('select');
  sel.innerHTML = `<option value="intertight">Inter Tight — modern sans (recommended)</option><option value="instrument">Instrument Serif — editorial accent</option>`;
  sel.value = state.brand.fontHead === 'instrument' ? 'instrument' : 'intertight';
  sel.addEventListener('change', () => {
    state.brand.fontHead = sel.value;
    const stack = sel.value === 'instrument' ? '"Instrument Serif", Georgia, serif' : '"Inter Tight", "Inter", system-ui, sans-serif';
    document.documentElement.style.setProperty('--f-serif', stack);
    document.documentElement.style.setProperty('--f-display', stack);
    document.documentElement.style.setProperty('--f-head-weight', sel.value === 'instrument' ? '400' : '500');
  });
  fontRow.appendChild(sel);
  s.appendChild(fontRow);

  const save = el('button','btn-save','Save theme');
  save.addEventListener('click', () => { bind(); flashSaved(save); });
  s.appendChild(save);
}

function renderNavTab(s){
  s.appendChild(sectionHeader('Navigation links', 'Add, remove, reorder and relabel menu items. Drag handles to reorder.'));
  const add = (items) => items.push({ label: 'New link', href: '#' });
  s.appendChild(listEditor({
    items: state.nav,
    add,
    onReorder: () => {},
    renderItem: {
      title: (it) => it.label,
      body: (it, idx, refresh) => {
        const w = el('div');
        w.appendChild(field('Label', input('text', it.label, v => { it.label = v; })));
        w.appendChild(field('Link (href)', input('text', it.href, v => { it.href = v; }), 'Use #section-id or a full URL.'));
        return w;
      }
    }
  }));
  const save = el('button','btn-save','Save navigation');
  save.addEventListener('click', () => { bind(); flashSaved(save); });
  s.appendChild(save);
}

function renderHeroTab(s){
  s.appendChild(sectionHeader('Hero section', 'The big section at the top. Italics are supported via <em>text</em> in the third line.'));
  const h = state.hero;
  s.appendChild(field('Eyebrow', input('text', h.eyebrow, v => h.eyebrow = v)));
  s.appendChild(field('Line 1 (solid)', htmlInput(h.line1, v => h.line1 = v, 1), 'Plain text only (no <em>).'));
  s.appendChild(field('Line 2 (solid)', htmlInput(h.line2, v => h.line2 = v, 1)));
  s.appendChild(field('Line 3 (with optional italics)', htmlInput(h.line3, v => h.line3 = v, 1), 'Wrap words in <em>…</em> to italicize.'));
  s.appendChild(field('Subtitle / lede', textarea(h.lede, v => h.lede = v, 3)));
  const c1 = el('div','admin-field'); c1.innerHTML = '<label>Primary CTA</label>';
  const c1r = el('div','row2');
  c1r.appendChild(input('text', h.cta1Label, v => h.cta1Label = v, { placeholder: 'Label' }));
  c1r.appendChild(input('text', h.cta1Href, v => h.cta1Href = v, { placeholder: '#products' }));
  c1.appendChild(c1r); s.appendChild(c1);
  const c2 = el('div','admin-field'); c2.innerHTML = '<label>Secondary CTA</label>';
  const c2r = el('div','row2');
  c2r.appendChild(input('text', h.cta2Label, v => h.cta2Label = v));
  c2r.appendChild(input('text', h.cta2Href, v => h.cta2Href = v));
  c2.appendChild(c2r); s.appendChild(c2);
  s.appendChild(field('Footnote (bottom of copy)', input('text', h.footnote, v => h.footnote = v)));
  s.appendChild(field('Social proof line', input('text', h.proof || 'Serving 200+ Palawan kitchens', v => h.proof = v)));
  s.appendChild(field('Photo badge (top-right of image)', input('text', h.tag || 'Est. 2017 · Palawan', v => h.tag = v)));
  s.appendChild(field('Glass card title', input('text', h.glassTitle || 'Cold chain, never broken', v => h.glassTitle = v)));
  s.appendChild(field('Glass card subtitle', input('text', h.glassSub || '−18°C from arrival to your kitchen', v => h.glassSub = v)));
  s.appendChild(field('Hero image / video', uploadField(h.bg, h.bgFallback, (dataUrl) => h.bg = dataUrl, (fb) => h.bgFallback = fb)));
  const save = el('button','btn-save','Save hero');
  save.addEventListener('click', () => { bind(); flashSaved(save); });
  s.appendChild(save);
}

function renderCatsTab(s){
  s.appendChild(sectionHeader('Product categories', 'The small horizontal carousel. Drag to reorder.'));
  const add = (items) => items.push({ title: 'New category', sub: 'Subtitle', kicker: 'Category', desc: 'Description.', cta: 'Browse', fallback: '#5a2a24', img: '', alt: '' });
  s.appendChild(listEditor({
    items: state.categories.items,
    add,
    renderItem: {
      title: it => it.title,
      body: (it, idx, refresh) => {
        const w = el('div');
        w.appendChild(field('Title', input('text', it.title, v => it.title = v)));
        w.appendChild(field('Subtitle (under title)', input('text', it.sub, v => it.sub = v)));
        w.appendChild(field('Kicker (back)', input('text', it.kicker, v => it.kicker = v)));
        w.appendChild(field('Back description', textarea(it.desc, v => it.desc = v, 3)));
        w.appendChild(field('Back CTA label', input('text', it.cta, v => it.cta = v)));
        w.appendChild(field('CTA link', input('text', it.ctaHref || '#order', v => it.ctaHref = v)));
        w.appendChild(field('Alt text', input('text', it.alt, v => it.alt = v)));
        w.appendChild(field('Image / video', uploadField(it.img, it.fallback, d => it.img = d, fb => it.fallback = fb)));
        return w;
      }
    }
  }));
  s.appendChild(field('Section eyebrow', input('text', state.categories.eyebrow, v => state.categories.eyebrow = v)));
  s.appendChild(field('Section title (HTML allowed)', htmlInput(state.categories.title, v => state.categories.title = v, 1)));
  s.appendChild(field('"View all" label', input('text', state.categories.viewAllLabel, v => state.categories.viewAllLabel = v)));
  const save = el('button','btn-save','Save categories');
  save.addEventListener('click', () => { bind(); flashSaved(save); });
  s.appendChild(save);
}

function renderFeatTab(s){
  s.appendChild(sectionHeader('Featured cards', 'The three large flip cards. Drag to reorder.'));
  const add = items => items.push({ kicker:'New', title:'New featured', cta:'Explore', desc:'', bullets:[], btn:'Explore', fallback:'#5a2a24', img:'' });
  s.appendChild(listEditor({
    items: state.featured,
    add,
    renderItem: {
      title: it => it.title,
      body: (it) => {
        const w = el('div');
        w.appendChild(field('Eyebrow / kicker', input('text', it.kicker, v => it.kicker = v)));
        w.appendChild(field('Title', input('text', it.title, v => it.title = v)));
        w.appendChild(field('Front CTA text', input('text', it.cta, v => it.cta = v)));
        w.appendChild(field('Back description', textarea(it.desc, v => it.desc = v, 3)));
        w.appendChild(field('Back button label', input('text', it.btn, v => it.btn = v)));
        const bLab = el('label'); bLab.textContent = 'Bullet points (one per line)'; bLab.style.cssText='display:block;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--c-ink-2);margin:20px 0 8px';
        w.appendChild(bLab);
        const bTa = textarea((it.bullets || []).join('\n'), v => it.bullets = v.split('\n').map(x => x.trim()).filter(Boolean), 4);
        w.appendChild(bTa);
        w.appendChild(field('Image', uploadField(it.img, it.fallback, d => it.img = d, fb => it.fallback = fb)));
        return w;
      }
    }
  }));
  const save = el('button','btn-save','Save featured');
  save.addEventListener('click', () => { bind(); flashSaved(save); });
  s.appendChild(save);
}

function renderLogosTab(s){
  s.appendChild(sectionHeader('Trusted-by logos', 'Simple brand-name list. Colour is used for the icon and name.'));
  s.appendChild(field('Section eyebrow', input('text', state.trusted.eyebrow, v => state.trusted.eyebrow = v)));
  s.appendChild(field('Section title (HTML allowed)', htmlInput(state.trusted.title, v => state.trusted.title = v, 1)));
  const add = items => items.push({ name:'New client', color:'#B3261E' });
  s.appendChild(listEditor({
    items: state.trusted.items,
    add,
    renderItem: {
      title: it => it.name,
      body: (it) => {
        const w = el('div');
        w.appendChild(field('Name', input('text', it.name, v => it.name = v)));
        w.appendChild(field('Brand colour', colorSwatch(it.color, v => it.color = v)));
        return w;
      }
    }
  }));
  const save = el('button','btn-save','Save logos');
  save.addEventListener('click', () => { bind(); flashSaved(save); });
  s.appendChild(save);
}

function renderRowsTab(s){
  s.appendChild(sectionHeader('Three stories', 'Alternating image/text rows. Toggle reverse to flip image side.'));
  s.appendChild(field('Section eyebrow', input('text', state.goodfood.eyebrow, v => state.goodfood.eyebrow = v)));
  s.appendChild(field('Section title (HTML)', htmlInput(state.goodfood.title, v => state.goodfood.title = v, 1)));
  const add = items => items.push({ eyebrow:'New', title:'New title', desc:'Description.', linkLabel:'Learn more', linkHref:'#', fallback:'#6b4a3a', img:'', reverse:false });
  s.appendChild(listEditor({
    items: state.goodfood.rows,
    add,
    renderItem: {
      title: it => it.eyebrow,
      body: (it) => {
        const w = el('div');
        w.appendChild(field('Eyebrow', input('text', it.eyebrow, v => it.eyebrow = v)));
        w.appendChild(field('Headline (HTML, use <em> for italics)', htmlInput(it.title, v => it.title = v, 2)));
        w.appendChild(field('Body', textarea(it.desc, v => it.desc = v, 3)));
        w.appendChild(field('Link label', input('text', it.linkLabel, v => it.linkLabel = v)));
        w.appendChild(field('Link href', input('text', it.linkHref, v => it.linkHref = v)));
        const revLabel = el('label'); revLabel.style.cssText='display:flex;align-items:center;gap:10px;margin:10px 0;cursor:pointer;font-size:var(--t-sm);font-weight:500';
        const cb = document.createElement('input'); cb.type='checkbox'; cb.checked = !!it.reverse;
        cb.addEventListener('change', () => it.reverse = cb.checked);
        revLabel.append(cb, document.createTextNode(' Reverse layout (image on right)'));
        w.appendChild(revLabel);
        w.appendChild(field('Image', uploadField(it.img, it.fallback, d => it.img = d, fb => it.fallback = fb)));
        return w;
      }
    }
  }));
  const save = el('button','btn-save','Save rows');
  save.addEventListener('click', () => { bind(); flashSaved(save); });
  s.appendChild(save);
}

function renderEssTab(s){
  s.appendChild(sectionHeader('Everyday essentials', 'Three smaller product cards below the story rows.'));
  s.appendChild(field('Eyebrow', input('text', state.essentials.eyebrow, v => state.essentials.eyebrow = v)));
  s.appendChild(field('Title (HTML)', htmlInput(state.essentials.title, v => state.essentials.title = v, 1)));
  s.appendChild(field('Link label', input('text', state.essentials.linkLabel, v => state.essentials.linkLabel = v)));
  s.appendChild(field('Link href', input('text', state.essentials.linkHref, v => state.essentials.linkHref = v)));
  const add = items => items.push({ title:'New', desc:'', fallback:'#8c3b32', img:'', href:'#order' });
  s.appendChild(listEditor({
    items: state.essentials.items,
    add,
    renderItem: {
      title: it => it.title,
      body: (it) => {
        const w = el('div');
        w.appendChild(field('Title', input('text', it.title, v => it.title = v)));
        w.appendChild(field('Description', textarea(it.desc, v => it.desc = v, 2)));
        w.appendChild(field('Link href', input('text', it.href, v => it.href = v)));
        w.appendChild(field('Image', uploadField(it.img, it.fallback, d => it.img = d, fb => it.fallback = fb)));
        return w;
      }
    }
  }));
  const save = el('button','btn-save','Save essentials');
  save.addEventListener('click', () => { bind(); flashSaved(save); });
  s.appendChild(save);
}

function renderStoryTab(s){
  s.appendChild(sectionHeader('Our story', 'The 2017 section with the four service flip cards.'));
  const st = state.story;
  s.appendChild(field('Year eyebrow', input('text', st.yearEyebrow, v => st.yearEyebrow = v)));
  s.appendChild(field('Year (number)', input('number', st.year, v => st.year = parseInt(v,10) || 2017)));
  s.appendChild(field('Year caption', textarea(st.yearCap, v => st.yearCap = v, 2)));
  s.appendChild(field('Copy eyebrow', input('text', st.copyEyebrow, v => st.copyEyebrow = v)));
  s.appendChild(field('Title (HTML)', htmlInput(st.title, v => st.title = v, 2)));
  const pLab = el('label'); pLab.textContent='Paragraphs (one per block)'; pLab.style.cssText='display:block;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--c-ink-2);margin:16px 0 8px';
  s.appendChild(pLab);
  const pTa = textarea(st.paragraphs.join('\n\n'), v => st.paragraphs = v.split(/\n{2,}/).map(x => x.trim()).filter(Boolean), 8);
  s.appendChild(pTa);
  s.appendChild(field('Tagline', input('text', st.tagline, v => st.tagline = v)));

  s.appendChild(el('h4', 'admin-section-title', 'Service cards'));
  s.appendChild(el('p', 'admin-section-desc', 'Four flip cards below the story. Each has a front title/line and a back description.'));
  const add = items => items.push({ title:'New', front:'Front line.', backKicker:'', backDesc:'Back description.', linkLabel:'Learn more' });
  s.appendChild(listEditor({
    items: st.services,
    add,
    renderItem: {
      title: it => it.title,
      body: (it) => {
        const w = el('div');
        w.appendChild(field('Title', input('text', it.title, v => it.title = v)));
        w.appendChild(field('Front line', input('text', it.front, v => it.front = v)));
        w.appendChild(field('Back kicker', input('text', it.backKicker, v => it.backKicker = v)));
        w.appendChild(field('Back description', textarea(it.backDesc, v => it.backDesc = v, 3)));
        w.appendChild(field('Back link label', input('text', it.linkLabel, v => it.linkLabel = v)));
        return w;
      }
    }
  }));
  const save = el('button','btn-save','Save story');
  save.addEventListener('click', () => { bind(); flashSaved(save); });
  s.appendChild(save);
}

function renderLocTab(s){
  s.appendChild(sectionHeader('Location', 'The moved section with the map card, stats and hours.'));
  const L = state.location;
  s.appendChild(field('Eyebrow', input('text', L.eyebrow, v => L.eyebrow = v)));
  s.appendChild(field('Title (HTML)', htmlInput(L.title, v => L.title = v, 2)));
  s.appendChild(field('Intro', textarea(L.intro, v => L.intro = v, 2)));
  s.appendChild(field('Business name', input('text', L.name, v => L.name = v)));
  s.appendChild(field('Address line 1', input('text', L.addressLine1, v => L.addressLine1 = v)));
  s.appendChild(field('Address line 2', input('text', L.addressLine2, v => L.addressLine2 = v)));
  s.appendChild(field('Directions button label', input('text', L.dirLabel, v => L.dirLabel = v)));
  s.appendChild(field('Map card kicker', input('text', L.mapKicker, v => L.mapKicker = v)));
  s.appendChild(field('Map card title', input('text', L.mapTitle, v => L.mapTitle = v)));
  s.appendChild(field('Map card description', textarea(L.mapDesc, v => L.mapDesc = v, 2)));
  s.appendChild(field('Map card button label', input('text', L.mapBtnLabel, v => L.mapBtnLabel = v)));
  s.appendChild(field('Map label (pill over map)', input('text', L.mapLabel || 'JayCee Trading · B.M. Road', v => L.mapLabel = v)));
  s.appendChild(field('Google Maps embed URL', textarea(L.mapEmbed || '', v => L.mapEmbed = v, 4), 'Paste the full URL from Google Maps "Embed a map" share, e.g. https://www.google.com/maps/embed?pb=…'));
  s.appendChild(field('Directions URL (open in app)', input('url', L.dirUrl, v => L.dirUrl = v), 'Short share link or https://maps.app.goo.gl/... link.'));

  s.appendChild(el('h4','admin-section-title','Travel-time stats'));
  const addStat = items => items.push({ n:5, unit:'min', label:'from somewhere' });
  s.appendChild(listEditor({
    items: L.stats, add: addStat,
    renderItem: {
      title: it => it.n + ' ' + it.unit + ' · ' + it.label,
      body: (it) => {
        const w = el('div');
        const r = el('div','row2');
        r.appendChild(field('Number', input('number', it.n, v => it.n = parseInt(v,10) || 0)));
        r.appendChild(field('Unit', input('text', it.unit, v => it.unit = v)));
        w.appendChild(r);
        w.appendChild(field('Label', input('text', it.label, v => it.label = v)));
        return w;
      }
    }
  }));

  s.appendChild(el('h4','admin-section-title','Hours'));
  const addHour = items => items.push({ dt: 'New section', dd: 'Hours text' });
  s.appendChild(listEditor({
    items: L.hours, add: addHour,
    renderItem: {
      title: it => it.dt,
      body: (it) => {
        const w = el('div');
        w.appendChild(field('Day / section', input('text', it.dt, v => it.dt = v)));
        w.appendChild(field('Hours', input('text', it.dd, v => it.dd = v)));
        return w;
      }
    }
  }));

  const save = el('button','btn-save','Save location');
  save.addEventListener('click', () => { bind(); flashSaved(save); });
  s.appendChild(save);
}

function renderFaqTab(s){
  s.appendChild(sectionHeader('Frequently asked questions', 'Answers type out when a visitor opens a question.'));
  s.appendChild(field('Eyebrow', input('text', state.faq.eyebrow, v => state.faq.eyebrow = v)));
  s.appendChild(field('Title (HTML)', htmlInput(state.faq.title, v => state.faq.title = v, 1)));
  s.appendChild(field('Intro text', textarea(state.faq.intro, v => state.faq.intro = v, 2)));
  const add = items => items.push({ q: 'New question?', a: 'New answer.' });
  s.appendChild(listEditor({
    items: state.faq.items, add,
    renderItem: {
      title: it => it.q,
      body: (it) => {
        const w = el('div');
        w.appendChild(field('Question', input('text', it.q, v => it.q = v)));
        w.appendChild(field('Answer', textarea(it.a, v => it.a = v, 4)));
        return w;
      }
    }
  }));
  const save = el('button','btn-save','Save FAQ');
  save.addEventListener('click', () => { bind(); flashSaved(save); });
  s.appendChild(save);
}

function renderMidTab(s){
  s.appendChild(sectionHeader('Mid-page CTA', 'The "Looking for something specific?" band.'));
  const m = state.midCta;
  s.appendChild(field('Eyebrow', input('text', m.eyebrow, v => m.eyebrow = v)));
  s.appendChild(field('Title (HTML)', htmlInput(m.title, v => m.title = v, 1)));
  s.appendChild(field('Description', textarea(m.desc, v => m.desc = v, 2)));
  s.appendChild(field('Button label', input('text', m.btnLabel, v => m.btnLabel = v)));
  s.appendChild(field('Button href (mailto: or URL)', input('text', m.btnHref, v => m.btnHref = v)));
  const save = el('button','btn-save','Save CTA');
  save.addEventListener('click', () => { bind(); flashSaved(save); });
  s.appendChild(save);
}

function renderFinalTab(s){
  s.appendChild(sectionHeader('Final CTA', 'The dark image band above the footer.'));
  const f = state.finalCta;
  s.appendChild(field('Eyebrow', input('text', f.eyebrow, v => f.eyebrow = v)));
  s.appendChild(field('Title (HTML)', htmlInput(f.title, v => f.title = v, 2)));
  s.appendChild(field('Primary button label', input('text', f.cta1Label, v => f.cta1Label = v)));
  s.appendChild(field('Primary button href', input('text', f.cta1Href, v => f.cta1Href = v)));
  s.appendChild(field('Secondary button label', input('text', f.cta2Label, v => f.cta2Label = v)));
  s.appendChild(field('Secondary button href', input('text', f.cta2Href, v => f.cta2Href = v)));
  s.appendChild(field('Background image / video', uploadField(f.bg, f.bgFallback, d => f.bg = d, fb => f.bgFallback = fb)));
  const save = el('button','btn-save','Save final CTA');
  save.addEventListener('click', () => { bind(); flashSaved(save); });
  s.appendChild(save);
}

function renderFooterTab(s){
  s.appendChild(sectionHeader('Footer', 'Brand paragraph and columns of links. Add or remove columns as needed.'));
  s.appendChild(field('Brand paragraph', textarea(state.footer.brandText, v => state.footer.brandText = v, 3)));
  s.appendChild(field('Copyright line', input('text', state.footer.copy, v => state.footer.copy = v), 'Use {year} to auto-insert the current year.'));
  s.appendChild(field('Bottom-right line', input('text', state.footer.loc, v => state.footer.loc = v)));

  const addCol = items => items.push({ title: 'New column', links: [{ label: 'Link', href: '#' }] });
  s.appendChild(listEditor({
    items: state.footer.cols, add: addCol,
    renderItem: {
      title: it => it.title,
      body: (col) => {
        const w = el('div');
        w.appendChild(field('Column title', input('text', col.title, v => col.title = v)));
        w.appendChild(el('div','hint','Links for this column (one per line, use label|url format, or just label for muted/non-link items).'));
        const initial = col.links.map(l => (l.muted ? '!! ' : '') + l.label + (l.href ? '|' + l.href : '')).join('\n');
        const ta = textarea(initial, v => {
          col.links = v.split('\n').map(line => {
            line = line.trim(); if (!line) return null;
            const muted = line.startsWith('!! '); if (muted) line = line.slice(3);
            const [label, href] = line.split('|').map(x => (x||'').trim());
            return { label, href: href || '#', muted };
          }).filter(Boolean);
        }, 5);
        w.appendChild(ta);
        return w;
      }
    }
  }));

  const save = el('button','btn-save','Save footer');
  save.addEventListener('click', () => { bind(); flashSaved(save); });
  s.appendChild(save);
}

/* =========================================================
   LOGO MANAGER TAB
   Upload → automatic checks → previews → Approve & publish
   ========================================================= */
let pendingLogo = null; // session-only until approved (never shown on the live site)
const UPLOAD_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>';

function loadImg(src){
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('This image could not be opened. Try exporting it again.')); i.src = src; });
}

/* Reads any logo file, normalises SVG, auto-optimises huge rasters and inspects transparency */
async function readLogoFile(file){
  const name = file.name || 'logo';
  let mime = (file.type || '').toLowerCase();
  const isSvg = /svg/.test(mime) || /\.svg$/i.test(name);
  let src, w = 0, h = 0;

  if (isSvg){
    const text = await file.text();
    if (!/<svg[\s>]/i.test(text)) throw new Error('This SVG file looks invalid.');
    const vb = text.match(/viewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
    if (vb){ w = parseFloat(vb[1]); h = parseFloat(vb[2]); }
    else {
      const mw = text.match(/<svg[^>]*\swidth\s*=\s*["']([\d.]+)/i), mh = text.match(/<svg[^>]*\sheight\s*=\s*["']([\d.]+)/i);
      if (mw && mh){ w = +mw[1]; h = +mh[1]; }
    }
    src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(text)));
    mime = 'image/svg+xml';
  } else {
    src = await readFileAsDataURL(file);
  }

  const img = await loadImg(src);
  if (!isSvg || !w || !h){ w = img.naturalWidth || w; h = img.naturalHeight || h; }
  if (!w || !h){ w = w || 300; h = h || 100; }

  // Auto-optimise very large raster files for fast mobile loading
  let optimized = false, outName = name, size = file.size;
  if (!isSvg && w > 1600){
    const c = document.createElement('canvas');
    c.width = 1600; c.height = Math.round(h * (1600 / w));
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const isJpg = /jpe?g/.test(mime);
    src = c.toDataURL(isJpg ? 'image/jpeg' : 'image/png', .9);
    if (!isJpg){ mime = 'image/png'; outName = name.replace(/\.\w+$/, '') + '.png'; }
    w = c.width; h = c.height; optimized = true;
    size = Math.round((src.length - src.indexOf(',') - 1) * 0.75);
  }

  // Inspect pixels: transparency, solid white box, all-white artwork
  const a = { isSvg, w: Math.round(w), h: Math.round(h), ratio: w / h, transparent: null, whiteBg: false, lightLogo: false, size, mime };
  try {
    const scale = Math.min(1, 480 / Math.max(w, h));
    const sw = Math.max(1, Math.round(w * scale)), sh = Math.max(1, Math.round(h * scale));
    const c = document.createElement('canvas'); c.width = sw; c.height = sh;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, sw, sh);
    const d = ctx.getImageData(0, 0, sw, sh).data;
    let clear = 0, lum = 0, cnt = 0;
    for (let i = 0; i < d.length; i += 4){
      if (d[i + 3] < 245) clear++;
      if (d[i + 3] > 200){ lum += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; cnt++; }
    }
    a.transparent = clear / (sw * sh) > 0.01;
    const px = (x, y) => { const k = (y * sw + x) * 4; return [d[k], d[k + 1], d[k + 2], d[k + 3]]; };
    a.whiteBg = [px(0, 0), px(sw - 1, 0), px(0, sh - 1), px(sw - 1, sh - 1)].every(p => p[3] > 245 && p[0] > 235 && p[1] > 235 && p[2] > 235);
    a.lightLogo = a.transparent && cnt > 0 && (lum / cnt) > 228;
  } catch(e){ /* leave as "not verified" */ }

  return { src, mime, name: outName, size, a, optimized };
}

/* Plain-language quality checks shown to the client */
function logoChecks(a){
  const out = [], m = (a.mime || '').toLowerCase();
  if (a.isSvg) out.push({ l:'pass', t:'SVG vector', x:'Perfectly sharp on every screen and at every size. Best choice.' });
  else if (/png|webp|avif/.test(m)) out.push({ l:'pass', t:(m.split('/')[1] || 'PNG').toUpperCase() + ' image', x:'Supports transparency. Great for logos.' });
  else if (/jpe?g/.test(m)) out.push({ l:'fail', t:'JPG image', x:'JPG cannot be transparent, so it shows a solid box behind the logo. Please send PNG or SVG.' });
  else out.push({ l:'warn', t:(m.replace('image/','') || 'Unknown').toUpperCase() + ' image', x:'This format works, but PNG or SVG is recommended.' });

  if (a.transparent === true) out.push({ l:'pass', t:'Transparent background', x:'Blends cleanly into the header, footer and hero.' });
  else if (a.transparent === false) out.push({ l:'fail', t:'No transparency detected', x: a.whiteBg ? 'The logo sits on a solid white box. Export it again with a transparent background.' : 'The logo has a solid background. Export it again with a transparent background.' });
  else out.push({ l:'warn', t:'Transparency not verified', x:'This file could not be inspected. Check the Dark preview below for a visible box.' });

  if (a.isSvg) out.push({ l:'pass', t:'Resolution', x:'Vector, so there is no resolution limit.' });
  else if (a.w >= 800 || a.h >= 400) out.push({ l:'pass', t:`Resolution ${a.w}×${a.h}px`, x:'Crisp on Retina and high-density screens.' });
  else if (a.w >= 400) out.push({ l:'warn', t:`Resolution ${a.w}×${a.h}px`, x:'Acceptable, but may look soft on Retina screens. 1000px+ wide is recommended.' });
  else out.push({ l:'fail', t:`Resolution ${a.w}×${a.h}px`, x:'Too small and will look blurry. Send at least 1000px wide, or an SVG.' });

  if (a.ratio){
    const r = a.ratio.toFixed(1);
    if (a.ratio >= 2 && a.ratio <= 7) out.push({ l:'pass', t:`Horizontal shape (${r}:1)`, x:'Ideal for the header on desktop, tablet and mobile.' });
    else if (a.ratio > 7) out.push({ l:'warn', t:`Very wide (${r}:1)`, x:'Width is capped on mobile, so it may look small. Consider a more compact version.' });
    else if (a.ratio >= 1.2) out.push({ l:'warn', t:`Compact shape (${r}:1)`, x:'Works, but appears smaller in the header. A horizontal lockup reads better.' });
    else out.push({ l:'warn', t:`Square / stacked mark (${r}:1)`, x:'“Show brand name next to logo” will be switched on so the business name stays readable.' });
  }

  const kb = Math.max(1, Math.round(a.size / 1024));
  if (kb <= 300) out.push({ l:'pass', t:`File size ${kb} KB`, x:'Lightweight, so it loads instantly on mobile data.' });
  else if (kb <= 1200) out.push({ l:'warn', t:`File size ${kb} KB`, x:'A little heavy. Under 300 KB is ideal for fast mobile loading.' });
  else out.push({ l:'fail', t:`File size ${kb} KB`, x:'Too large for fast loading and browser storage. Please compress it or send an SVG.' });

  if (a.lightLogo) out.push({ l:'warn', t:'Very light artwork', x:'Mostly white logos disappear on the white header and footer. Use a dark or full-colour version.' });
  return out;
}

/* Built-in guide so the client knows exactly what to send */
function logoHelp(){
  const d = document.createElement('details');
  d.className = 'lp-help';
  d.innerHTML = `
    <summary>Help: preparing a logo that looks right on every device</summary>
    <div class="lp-help-body">
      <h5>1 · Best file types</h5>
      <ul>
        <li><b>SVG</b> is the first choice. It's vector, razor-sharp on every screen, and tiny.</li>
        <li><b>Transparent PNG</b> is the second choice. Export at 2× or 3× (at least 1000px wide).</li>
        <li><b>WebP / AVIF</b> are fine if the background is transparent.</li>
        <li><b>Avoid JPG</b>. It can't be transparent and will show a white box.</li>
      </ul>
      <h5>2 · Transparent background</h5>
      <ul>
        <li>Remove the background completely, with no white or coloured box.</li>
        <li>Check the <b>Dark</b> preview: if you can see a rectangle around the logo, the background isn't transparent.</li>
      </ul>
      <h5>3 · Shape &amp; trimming</h5>
      <ul>
        <li>A <b>horizontal lockup</b> (icon + name side by side, about 3:1 to 5:1) reads best in a header.</li>
        <li><b>Trim empty space</b> around the artwork. Extra transparent padding makes the logo look smaller.</li>
        <li>Square or stacked logos work too. Turn on “Show brand name next to logo”.</li>
      </ul>
      <h5>4 · Colour &amp; contrast</h5>
      <ul>
        <li>The header, footer and hero are white, so use a dark or full-colour version.</li>
        <li>An all-white logo will be invisible on white.</li>
      </ul>
      <h5>5 · Recommended display heights</h5>
      <table class="lp-table">
        <thead><tr><th>Placement</th><th>Device</th><th>Height</th></tr></thead>
        <tbody>
          <tr><td>Header</td><td>Desktop &amp; tablet</td><td>32–44px</td></tr>
          <tr><td>Header</td><td>Mobile</td><td>26–34px</td></tr>
          <tr><td>Footer</td><td>All devices</td><td>36–48px</td></tr>
          <tr><td>Hero</td><td>All devices</td><td>64–96px (72% on mobile)</td></tr>
        </tbody>
      </table>
      <h5>6 · Approval workflow</h5>
      <ul>
        <li>Upload → review the automatic checks and previews → <b>Approve &amp; publish</b>.</li>
        <li>Nothing changes on the live site until you approve.</li>
        <li>Files wider than 1600px are optimised automatically for fast mobile loading.</li>
      </ul>
    </div>`;
  return d;
}

function rangeField(label, val, min, max, onInput){
  const w = el('div', 'admin-field');
  w.innerHTML = `<label>${esc(label)} <output>${val}px</output></label>`;
  const r = document.createElement('input');
  r.type = 'range'; r.min = min; r.max = max; r.step = 1; r.value = val; r.className = 'admin-range';
  r.setAttribute('aria-label', label);
  r.addEventListener('input', () => { w.querySelector('output').textContent = r.value + 'px'; onInput(+r.value); });
  w.appendChild(r);
  return w;
}
function toggleField(title, help, checked, onChange){
  const lab = el('label', 'lp-toggle');
  const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = !!checked;
  cb.addEventListener('change', () => onChange(cb.checked));
  const txt = el('span', '', `${esc(title)}<small>${esc(help)}</small>`);
  lab.append(cb, txt);
  return lab;
}

function renderLogoTab(s){
  const L = ensureLogoState();
  s.appendChild(sectionHeader('Official logo', 'Upload, preview and approve the logo used in the header, footer and (optionally) the hero. Nothing goes live until you approve it.'));
  s.appendChild(logoHelp());

  const status = el('div', 'lp-status');
  const drop = el('label', 'lp-drop');
  drop.innerHTML = UPLOAD_SVG + '<b>Upload logo</b><span>SVG or transparent PNG recommended · WebP, AVIF, GIF and JPG also accepted · drag &amp; drop or tap to browse</span>';
  const fi = document.createElement('input');
  fi.type = 'file';
  fi.accept = 'image/svg+xml,image/png,image/webp,image/avif,image/gif,image/jpeg,.svg,.png,.webp,.avif,.gif,.jpg,.jpeg';
  drop.appendChild(fi);
  const meta = el('p', 'lp-meta');
  const checksBox = el('div', 'lp-checks');
  const stage = el('div', 'lp-stage');
  const devices = el('div', 'lp-devices');
  const actions = el('div', 'lp-actions');

  s.append(status, drop, meta, checksBox);
  s.appendChild(el('h4', 'admin-section-title', 'Preview'));
  s.appendChild(el('p', 'admin-section-desc', 'Check the logo on light, dark and transparent backgrounds, then in the real header, footer and hero on each device.'));
  s.append(stage, devices, actions);

  s.appendChild(el('h4', 'admin-section-title', 'Display size'));
  s.appendChild(el('p', 'admin-section-desc', 'Height in pixels; width scales automatically. The previews and live site update instantly.'));
  s.appendChild(rangeField('Header · desktop & tablet', L.headerH, 20, 60, v => { L.headerH = v; applyLogoVars(); }));
  s.appendChild(rangeField('Header · mobile', L.headerHM, 18, 48, v => { L.headerHM = v; applyLogoVars(); }));
  s.appendChild(rangeField('Footer', L.footerH, 20, 80, v => { L.footerH = v; applyLogoVars(); }));
  s.appendChild(rangeField('Hero', L.heroH, 40, 160, v => { L.heroH = v; applyLogoVars(); }));

  s.appendChild(el('h4', 'admin-section-title', 'Placement'));
  s.appendChild(toggleField('Show brand name next to logo', 'Turn on for icon-only or square logos. Leave off if the logo already includes the business name.', L.showWordmark, v => { L.showWordmark = v; renderNav(); renderFooter(); refresh(); }));
  s.appendChild(toggleField('Show logo in the hero', 'Displays the logo above the hero headline. Useful for launches and brand campaigns.', L.heroShow, v => { L.heroShow = v; renderHero(); refresh(); }));
  s.appendChild(toggleField('Use logo as browser tab icon (favicon)', 'Works best with a square mark.', L.favicon, v => { L.favicon = v; applyFavicon(); }));

  const save = el('button', 'btn-save', 'Save logo settings');
  save.type = 'button';
  save.style.marginTop = '8px';
  save.addEventListener('click', () => { bind(); flashSaved(save); });
  s.appendChild(save);

  function currentSrc(){ return pendingLogo ? pendingLogo.src : (hasLiveLogo() ? L.src : ''); }

  function refresh(){
    const src = currentSrc() ? esc(currentSrc()) : '';

    // Status banner
    if (pendingLogo){ status.className = 'lp-status pending'; status.innerHTML = '<i></i>New upload, previewing only. Approve to publish it to the live site.'; }
    else if (hasLiveLogo()){ status.className = 'lp-status live'; status.innerHTML = '<i></i>Live logo' + (L.approvedAt ? ' · approved ' + new Date(L.approvedAt).toLocaleDateString() : ''); }
    else { status.className = 'lp-status none'; status.innerHTML = '<i></i>No logo uploaded yet. The site shows the default mark and brand name.'; }

    // File meta + checks
    const info = pendingLogo || (hasLiveLogo() ? { name: L.name, mime: L.mime, size: L.size, a: L.analysis } : null);
    meta.hidden = !info;
    meta.textContent = info ? [
      info.name || 'logo',
      (info.mime || '').replace('image/', '').replace('+xml', '').toUpperCase(),
      Math.max(1, Math.round((info.size || 0) / 1024)) + ' KB',
      info.a && info.a.w ? info.a.w + '×' + info.a.h + (info.a.isSvg ? ' (vector)' : 'px') : '',
      pendingLogo && pendingLogo.optimized ? 'auto-optimised' : ''
    ].filter(Boolean).join(' · ') : '';
    checksBox.innerHTML = info && info.a ? logoChecks(info.a).map(c =>
      `<div class="lp-check ${c.l}"><span class="ico" aria-hidden="true">${c.l === 'pass' ? '✓' : c.l === 'warn' ? '!' : '×'}</span><div><b>${esc(c.t)}</b><span>${esc(c.x)}</span></div></div>`
    ).join('') : '';

    // Background swatches
    stage.innerHTML = src
      ? ['light', 'dark', 'checker'].map(k => `<div class="lp-swatch ${k}"><img src="${src}" alt=""><em>${k === 'checker' ? 'Transparent' : k}</em></div>`).join('')
      : `<div class="lp-swatch checker" style="grid-column:1/-1"><em>Upload a logo to preview it here</em></div>`;

    // Device mockups (heights use the same live CSS variables as the site)
    const name = esc(state.brand.name);
    const mark = (hVar, maxW) => src
      ? `<span class="lp-mark"><img src="${src}" alt="" style="height:var(${hVar});max-width:${maxW}px">${L.showWordmark ? `<span class="lp-word">${name}</span>` : ''}</span>`
      : `<span class="lp-mark"><span class="lp-default" aria-hidden="true"></span><span class="lp-word">${name}</span></span>`;
    devices.innerHTML = `
      <div class="lp-device"><div class="lp-device-label"><span>Desktop · header</span><span>≥1025px</span></div>
        <div class="lp-bar" style="height:72px">${mark('--logo-h-header', 240)}<span class="lp-links"><i></i><i></i><i></i><i></i></span><span class="lp-cta"></span></div></div>
      <div class="lp-device lp-tablet"><div class="lp-device-label"><span>Tablet · header</span><span>769–1024px</span></div>
        <div class="lp-bar" style="height:72px">${mark('--logo-h-header', 220)}<span class="lp-links"><i></i><i></i><i></i></span></div></div>
      <div class="lp-device lp-phone"><div class="lp-device-label"><span>Mobile · header</span><span>≤768px</span></div>
        <div class="lp-bar" style="height:60px">${mark('--logo-h-header-m', 190)}<span class="lp-burger" aria-hidden="true"></span></div></div>
      <div class="lp-device"><div class="lp-device-label"><span>Footer</span><span>All devices</span></div>
        <div class="lp-foot-mock">${src ? `<img src="${src}" alt="" style="height:var(--logo-h-footer);max-width:260px">` : mark('--logo-h-footer', 260)}<i></i><i style="width:46%"></i></div></div>
      <div class="lp-device"><div class="lp-device-label"><span>Hero</span><span>${L.heroShow ? 'On' : 'Off'}</span></div>
        <div class="lp-hero-mock">${src && L.heroShow ? `<img src="${src}" alt="" style="height:var(--logo-h-hero);max-width:320px">` : '<em>Hero logo is off. Turn it on under Placement.</em>'}<i></i><i style="width:60%"></i></div></div>`;

    // Actions
    actions.innerHTML = '';
    if (pendingLogo){
      const ok = el('button', 'btn-save', 'Approve & publish'); ok.type = 'button'; ok.addEventListener('click', approve);
      const no = el('button', 'btn-sec', 'Discard upload'); no.type = 'button'; no.addEventListener('click', () => { pendingLogo = null; refresh(); });
      actions.append(ok, no);
    }
    if (hasLiveLogo()){
      const dl = document.createElement('a');
      dl.className = 'btn-sec'; dl.href = L.src; dl.download = L.name || 'official-logo'; dl.textContent = 'Download live logo';
      const rm = el('button', 'btn-dan', 'Remove logo'); rm.type = 'button';
      rm.addEventListener('click', () => {
        if (!confirm('Remove the live logo and return to the default mark?')) return;
        Object.assign(L, { src:'', mime:'', name:'', size:0, analysis:null, approved:false, approvedAt:0 });
        bind(); applyFavicon(); refresh(); toast('Logo removed');
      });
      actions.append(dl, rm);
    }
    actions.hidden = !actions.children.length;
  }

  function approve(){
    if (!pendingLogo) return;
    const fails = logoChecks(pendingLogo.a).filter(c => c.l === 'fail');
    if (fails.length && !confirm('This logo has ' + fails.length + ' issue(s):\n\n• ' + fails.map(f => f.t).join('\n• ') + '\n\nPublish it anyway?')) return;
    Object.assign(L, { src: pendingLogo.src, mime: pendingLogo.mime, name: pendingLogo.name, size: pendingLogo.size, analysis: pendingLogo.a, approved: true, approvedAt: Date.now() });
    if (pendingLogo.a.ratio && pendingLogo.a.ratio < 1.2) L.showWordmark = true;
    pendingLogo = null;
    bind(); applyFavicon();
    buildPanel();
    toast('Logo approved and live in the header and footer');
  }

  async function handleFile(file){
    if (!file) return;
    if (!/^image\//.test(file.type) && !/\.(svg|png|webp|avif|gif|jpe?g)$/i.test(file.name)){ toast('Please upload an image file (SVG, PNG, WebP, JPG…)', true); return; }
    if (file.size > 8 * 1024 * 1024){ toast('File is over 8 MB. Please compress it first.', true); return; }
    drop.classList.add('is-busy');
    try {
      pendingLogo = await readLogoFile(file);
      refresh();
      toast('Logo loaded. Review the checks and preview, then approve.');
    } catch(err){
      toast(err.message || 'Could not read that file', true);
    } finally {
      drop.classList.remove('is-busy');
      fi.value = '';
    }
  }
  fi.addEventListener('change', () => handleFile(fi.files[0]));
  ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('is-over'); }));
  drop.addEventListener('drop', e => handleFile(e.dataTransfer && e.dataTransfer.files[0]));

  refresh();
}

function flashSaved(btn){
  const old = btn.textContent; btn.textContent = 'Saved ✓'; btn.classList.add('is-saved');
  setTimeout(() => { btn.textContent = old; btn.classList.remove('is-saved'); }, 1400);
}

/* =========================================================
   Initial render
   ========================================================= */
document.fonts && document.fonts.ready && document.fonts.ready.then(() => {
  renderAll();
});
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(renderAll, 0);
} else {
  window.addEventListener('DOMContentLoaded', renderAll);
}

// Keyboard shortcut: Ctrl/⌘+Shift+A to open admin
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
    e.preventDefault();
    $('#adminLaunch').click();
  }
});

})();
