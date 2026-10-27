(() => {
  document.documentElement.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const wait = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const esc = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const WA = '201101216597';
  const LEADS_HOOK = 'https://ahmadbadryy.duckdns.org/webhook/wiyak-website-lead';

  /* ---------- i18n: Arabic is in the HTML, English comes from i18n.js ---------- */
  const AR = {}, AR_ATTR = {};
  $$('[data-i18n]').forEach(el => { const k = el.dataset.i18n; if (!(k in AR)) AR[k] = el.hasAttribute('data-html') ? el.innerHTML : el.textContent; });
  $$('[data-i18n-attr]').forEach(el => el.dataset.i18nAttr.split(';').forEach(p => { const [a, k] = p.split(':'); if (!(k in AR_ATTR)) AR_ATTR[k] = el.getAttribute(a); }));
  let lang = document.documentElement.lang === 'en' ? 'en' : 'ar';
  const T = () => window.I18N_JS[lang];
  const tr = k => (lang === 'en' ? window.I18N_EN[k] : AR[k] ?? AR_ATTR[k]) ?? '';
  const langHooks = [];
  const page = document.body.dataset.page || 'home', sub = page !== 'home';

  function applyLang(l, initial){
    lang = l;
    const html = document.documentElement;
    html.lang = l; html.dir = l === 'en' ? 'ltr' : 'rtl';
    $$('[data-i18n]').forEach(el => {
      const v = l === 'en' ? window.I18N_EN[el.dataset.i18n] : AR[el.dataset.i18n];
      if (v == null) return;
      if (el.hasAttribute('data-html')) el.innerHTML = v; else el.textContent = v;
    });
    $$('[data-i18n-attr]').forEach(el => el.dataset.i18nAttr.split(';').forEach(p => {
      const [a, k] = p.split(':'); const v = l === 'en' ? window.I18N_EN[k] : AR_ATTR[k]; if (v != null) el.setAttribute(a, v);
    }));
    document.title = (T().pages || {})[page] || T().title;
    $('meta[name=description]').setAttribute('content', T().desc);
    try { localStorage.setItem('wiyak-lang', l); } catch(e) {}
    const u = new URL(location.href); if (l === 'en') u.searchParams.set('lang','en'); else u.searchParams.delete('lang');
    history.replaceState(null, '', u);
    html.classList.remove('i18n-pending');
    if (!initial) langHooks.forEach(f => f());
  }
  applyLang(lang, true);
  $$('[data-lang-toggle]').forEach(b => b.addEventListener('click', () => {
    applyLang(lang === 'en' ? 'ar' : 'en');
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }));

  /* ---------- Nav ---------- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', sub || scrollY > 40);
  onScroll(); addEventListener('scroll', onScroll, {passive:true});
  const burger = $('.nav-burger'), menu = $('#mobile-menu');
  const closeMenu = () => { burger.setAttribute('aria-expanded','false'); menu.hidden = true; onScroll(); };
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') === 'true';
    if (open) return closeMenu();
    burger.setAttribute('aria-expanded','true'); menu.hidden = false; nav.classList.add('scrolled');
  });
  $$('#mobile-menu a, #mobile-menu button').forEach(a => a.addEventListener('click', closeMenu));

  /* scroll progress, active nav link, mobile sticky CTA */
  const prog = $('.nav-progress'), mcta = $('#m-cta'), hero = $('.hero'), contact = $('#contact');
  $$('.nav-links a, #mobile-menu a').forEach(a => { if (sub && a.dataset.nav === page){ a.classList.add('active'); a.setAttribute('aria-current', 'page'); } });
  const spy = sub ? [] : $$('.nav-links a').filter(a => /^#./.test(a.getAttribute('href'))).map(a => [a, $(a.getAttribute('href'))]).filter(([, s]) => s);
  let ticking = false;
  function scrollFx(){
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    if (spy.length){
      let cur = null;
      spy.forEach(([a, s]) => { if (s.getBoundingClientRect().top < 140) cur = a; });
      spy.forEach(([a]) => a.classList.toggle('active', a === cur));
    }
    const show = scrollY > (hero ? hero.offsetHeight * .7 : 300) && contact.getBoundingClientRect().top > innerHeight * .5;
    mcta.classList.toggle('show', show); mcta.inert = !show;
  }
  scrollFx();
  addEventListener('scroll', () => { if (!ticking){ ticking = true; requestAnimationFrame(scrollFx); } }, {passive:true});
  addEventListener('resize', scrollFx);

  /* arrow keys move between tabs (direction follows the page language) */
  $$('[role=tablist]').forEach(list => list.addEventListener('keydown', e => {
    const tabs = $$('[role=tab]', list), i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const rtl = document.documentElement.dir === 'rtl';
    const step = {ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1}[e.key];
    const j = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : step ? (i + step + tabs.length) % tabs.length : -1;
    if (j < 0) return;
    e.preventDefault(); tabs[j].focus(); tabs[j].click();
  }));

  /* ---------- Ribbon canvas (flowing bands from the logo ribbon) ---------- */
  const PRESETS = {
    hero: [
      {y:.86, amp:.09, len:1.3, thick:.20, speed:.18, tilt:-.10, stops:['rgba(11,61,58,0)','#16A085','#9fe3d1','#16A085','rgba(11,61,58,0)'], op:.55},
      {y:.95, amp:.06, len:1.0, thick:.13, speed:-.12, tilt:-.06, stops:['rgba(7,43,41,0)','#11524d','#16A085','#CFEFE7'], op:.7},
      {y:.18, amp:.05, len:1.6, thick:.004, speed:.1, tilt:.02, lines:7, gap:.016, stroke:'rgba(207,239,231,.12)'}
    ],
    sec: [
      {y:.92, amp:.07, len:1.4, thick:.16, speed:.12, tilt:-.08, stops:['rgba(11,61,58,0)','#16A085','#CFEFE7','#16A085'], op:.35},
      {y:.10, amp:.04, len:1.8, thick:.004, speed:.08, tilt:.01, lines:6, gap:.014, stroke:'rgba(207,239,231,.08)'}
    ]
  };
  function ribbon(canvas, preset){
    const ctx = canvas.getContext('2d'); let w, h, t = 0, run = false, raf;
    const size = () => { const d = Math.min(devicePixelRatio || 1, 2); w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = w*d; canvas.height = h*d; ctx.setTransform(d,0,0,d,0,0); draw(); };
    function band(b){
      const N = 90, top = [], bot = [];
      for (let i = 0; i <= N; i++){
        const x = -40 + (w + 80) * i / N, k = x / (w * b.len) * Math.PI * 2 + t * b.speed;
        const c = h * b.y + b.tilt * (x - w/2) * (h/w) * 2 + Math.sin(k) * h * b.amp;
        const th = h * b.thick * (.65 + .35 * Math.abs(Math.cos(k * .5)));
        top.push([x, c - th/2]); bot.push([x, c + th/2]);
      }
      if (b.lines){
        ctx.strokeStyle = b.stroke; ctx.lineWidth = 1;
        for (let l = 0; l < b.lines; l++){
          ctx.beginPath();
          top.forEach(([x,y], i) => { const yy = y + l * h * b.gap + Math.sin(i/9 + l*.4 + t*.2) * 3; i ? ctx.lineTo(x,yy) : ctx.moveTo(x,yy); });
          ctx.stroke();
        }
        return;
      }
      const g = ctx.createLinearGradient(0, 0, w, h * .3);
      b.stops.forEach((s, i) => g.addColorStop(i / (b.stops.length - 1), s));
      ctx.globalAlpha = b.op; ctx.fillStyle = g; ctx.beginPath();
      top.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
      for (let i = bot.length - 1; i >= 0; i--) ctx.lineTo(bot[i][0], bot[i][1]);
      ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    }
    function draw(){ ctx.clearRect(0,0,w,h); preset.forEach(band); }
    function loop(){ t += .016; draw(); if (run) raf = requestAnimationFrame(loop); }
    size(); addEventListener('resize', size);
    if (reduce) return;
    new IntersectionObserver(([e]) => { if (e.isIntersecting && !run){ run = true; loop(); } else if (!e.isIntersecting){ run = false; cancelAnimationFrame(raf); } }).observe(canvas);
  }
  if ($('.hero-ribbon')) ribbon($('.hero-ribbon'), PRESETS.hero);
  $$('.sec-ribbon').forEach(c => ribbon(c, PRESETS.sec));

  /* ---------- Chat engine ---------- */
  function bubble(m){
    const el = document.createElement('div');
    if (m.vn){ el.className = 'bub me'; el.innerHTML = `<div class="vn"><svg class="ic"><use href="#i-mic"/></svg><i></i><span>${m.vn}</span></div><small>${m.time||''}</small>`; return el; }
    if (m.img){ el.className = 'bub img ' + (m.from||'me'); el.innerHTML = `<div class="ph"><svg class="ic"><use href="#${m.icon||'i-card'}"/></svg>${esc(m.img)}</div><small>${m.time||''}</small>`; return el; }
    el.className = 'bub ' + m.from;
    el.innerHTML = esc(m.text).replace(/\n/g,'<br>') + (m.chips ? `<div class="chips">${m.chips.map(c=>`<span>${esc(c)}</span>`).join('')}</div>` : '') + `<small>${m.time||''}</small>`;
    return el;
  }
  function teamMsg(m){
    const el = document.createElement('div');
    el.className = 'tgm' + (m.urgent ? ' urgent' : '');
    el.innerHTML = `<div class="ttl"><svg class="ic"><use href="#${m.icon||'i-bell'}"/></svg>${esc(m.title)}</div>` +
      (m.rows||[]).map(r => `<div class="row">${esc(r)}</div>`).join('') +
      (m.btns ? `<div class="tbtns">${m.btns.map(b=>`<span>${esc(b)}</span>`).join('')}</div>` : '');
    return el;
  }
  function pop(el){
    if (reduce || !window.gsap) return;
    gsap.from(el, {y:14, opacity:0, scale:.96, duration:.45, ease:'back.out(1.6)'});
  }
  async function play(chat, team, script, token){
    for (const m of script){
      if (token.dead) return;
      if (m.team){ if (team){ const el = teamMsg(m.team); team.appendChild(el); pop(el); while (team.children.length > 4) team.firstElementChild.remove(); } await wait(m.after ?? 700); continue; }
      if (m.from === 'bot'){
        const ty = document.createElement('div'); ty.className = 'typing'; ty.innerHTML = '<i></i><i></i><i></i>';
        chat.appendChild(ty); await wait(m.think ?? 1000); ty.remove(); if (token.dead) return;
      }
      const el = bubble(m); chat.appendChild(el); pop(el);
      while (chat.children.length > 12) chat.firstElementChild.remove();
      await wait(m.after ?? 900);
    }
  }

  /* hero: looping short conversation */
  const heroChat = $('#hero-chat');
  let heroTok = {dead:true};
  function startHero(){
    heroTok.dead = true; const tok = heroTok = {};
    (async () => {
      await wait(900);
      while (!tok.dead){
        heroChat.innerHTML = '';
        await play(heroChat, null, T().scn.store.script.filter(m => !m.team).slice(0, 8), tok);
        await wait(3200);
        if (reduce) break;
      }
    })();
  }
  if (heroChat){ startHero(); langHooks.push(startHero); }

  /* demo tabs */
  const demoChat = $('#demo-chat'), demoTeam = $('#demo-team'), notes = $('#demo-notes');
  if (demoChat){
  let demoTok = {dead:true}, demoStarted = false, demoKey = 'store';
  function runScn(key){
    demoTok.dead = true; demoTok = {}; demoKey = key;
    const s = T().scn[key];
    $('#demo-name').textContent = s.name;
    demoTeam.dataset.empty = T().empty;
    demoChat.innerHTML = ''; demoTeam.innerHTML = '';
    notes.innerHTML = s.notes.map(([b,t]) => `<li><b>${esc(b)}</b>${esc(t)}</li>`).join('');
    play(demoChat, demoTeam, s.script, demoTok);
  }
  $$('.tab').forEach(t => t.addEventListener('click', () => {
    if (t.getAttribute('aria-selected') === 'true' && demoStarted) return;
    $$('.tab').forEach(x => x.setAttribute('aria-selected', String(x === t)));
    demoStarted = true; runScn(t.dataset.scn);
  }));
  demoTeam.dataset.empty = T().empty;
  $('#demo-name').textContent = T().scn.store.name;
  new IntersectionObserver(([e], o) => { if (e.isIntersecting){ demoStarted = true; runScn('store'); o.disconnect(); } }, {threshold:.35}).observe($('#demo'));
  langHooks.push(() => { if (demoStarted) runScn(demoKey); else { demoTeam.dataset.empty = T().empty; $('#demo-name').textContent = T().scn.store.name; } });
  }

  /* ---------- Dashboard tabs ---------- */
  const img = $('#dash-img'), cap = $('#dash-cap');
  if (img){
  let shot = 'home';
  const setCap = () => { const [lbl, c] = T().dash[shot]; cap.textContent = c; img.alt = T().dashAlt + lbl; };
  setCap(); langHooks.push(setCap);
  // warm the other screenshots only when the dashboard section gets close
  new IntersectionObserver(([e], o) => { if (!e.isIntersecting) return; o.disconnect();
    Object.keys(T().dash).forEach(k => { const i = new Image(); i.src = `assets/shots/${k}.webp`; });
  }, {rootMargin:'600px'}).observe($('#dashboard'));
  $$('.dtab').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.shot; if (shot === k) return;
    $$('.dtab').forEach(x => x.setAttribute('aria-selected', String(x === b)));
    shot = k; img.classList.add('swap');
    setTimeout(() => { img.src = `assets/shots/${k}.webp`; setCap(); img.onload = () => img.classList.remove('swap'); }, reduce ? 0 : 220);
  }));
  }

  /* ---------- Pricing toggle ---------- */
  const sw = $('#billing');
  if (sw) sw.addEventListener('click', () => {
    const y = sw.getAttribute('aria-checked') !== 'true';
    sw.setAttribute('aria-checked', String(y));
    $('#lbl-m').classList.toggle('on', !y); $('#lbl-y').classList.toggle('on', y);
    $('#annual-note').hidden = !y;
    $$('.price b[data-m]').forEach(b => {
      const to = b.dataset[y ? 'y' : 'm'];
      if (reduce || !window.gsap){ b.textContent = to; return; }
      const from = +b.textContent.replace(/,/g,''), target = +to.replace(/,/g,''), o = {v:from};
      if (b._tw) b._tw.kill();
      b._tw = gsap.to(o, {v:target, duration:.6, ease:'power2.out', onUpdate:() => b.textContent = Math.round(o.v).toLocaleString('en-US')});
    });
  });

  /* ---------- Lead form → WhatsApp ---------- */
  const form = $('#lead-form'), done = $('#lead-done');
  const ind = $('#f-ind'), otherWrap = $('#other-wrap');
  ind.addEventListener('change', () => { otherWrap.hidden = ind.value !== 'other'; });
  $$('[data-plan]').forEach(a => a.addEventListener('click', () => { $('#f-plan').value = a.dataset.plan; }));
  $$('[data-ind]').forEach(a => a.addEventListener('click', () => { ind.value = a.dataset.ind; ind.dispatchEvent(new Event('change')); setErr(ind, 'e-ind', false); }));

  const digits = s => s.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  function normPhone(v){
    let p = digits(v).replace(/[\s\-().]/g, '');
    p = p.replace(/^(\+|00)?20(?=1)/, '0');
    return /^01[0125]\d{8}$/.test(p) ? p : null;
  }
  function setErr(input, errId, bad){
    const e = $('#' + errId); e.hidden = !bad;
    if (input) input.setAttribute('aria-invalid', String(bad));
    return bad;
  }
  [['#f-name','e-name'],['#f-phone','e-phone'],['#f-ind','e-ind']].forEach(([s, id]) => $(s).addEventListener('input', () => setErr($(s), id, false)));
  form.addEventListener('change', e => { if (e.target.name === 'need') setErr(null, 'e-need', false); });

  function buildMessage(){
    const L = T().wa, opt = sel => sel.value ? sel.options[sel.selectedIndex].textContent.trim() : '';
    const needs = $$('input[name=need]:checked').map(c => c.closest('label').querySelector('b').textContent.trim());
    const indTxt = ind.value === 'other' && $('#f-other').value.trim() ? `${opt(ind)}: ${$('#f-other').value.trim()}` : opt(ind);
    const biz = $('#f-biz').value.trim(), notesTxt = $('#f-notes').value.trim();
    return [L.hello, '',
      `• ${L.name}: ${$('#f-name').value.trim()}`,
      `• ${L.phone}: ${normPhone($('#f-phone').value)}`,
      biz ? `• ${L.biz}: ${biz}` : null,
      `• ${L.ind}: ${indTxt}`,
      `• ${L.need}: ${needs.join(lang === 'en' ? ', ' : '، ')}`,
      $('#f-plan').value ? `• ${L.plan}: ${opt($('#f-plan'))}` : null,
      notesTxt ? `• ${L.notes}: ${notesTxt}` : null,
      '', L.lang].filter(x => x !== null).join('\n');
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const bad = [
      setErr($('#f-name'), 'e-name', !$('#f-name').value.trim()) && $('#f-name'),
      setErr($('#f-phone'), 'e-phone', !normPhone($('#f-phone').value)) && $('#f-phone'),
      setErr(ind, 'e-ind', !ind.value) && ind,
      setErr(null, 'e-need', !$$('input[name=need]:checked').length) && $('input[name=need]')
    ].filter(Boolean);
    if (bad.length){ bad[0].focus(); return; }
    // save to the leads sheet in the background; WhatsApp opens either way
    const data = new URLSearchParams({
      name: $('#f-name').value.trim(), phone: normPhone($('#f-phone').value), business: $('#f-biz').value.trim(),
      industry: ind.value, industry_other: $('#f-other').value.trim(),
      needs: $$('input[name=need]:checked').map(c => c.value).join(','),
      plan: $('#f-plan').value, notes: $('#f-notes').value.trim(), lang, company_site: $('#f-company-site').value
    });
    fetch(LEADS_HOOK, {method:'POST', body:data, keepalive:true}).catch(() => {});
    const url = `https://wa.me/${WA}?text=${encodeURIComponent(buildMessage())}`;
    $('#lead-again').href = url;
    window.open(url, '_blank', 'noopener');
    form.classList.add('is-done'); done.hidden = false; done.focus();
  });
  $('#lead-edit').addEventListener('click', () => { form.classList.remove('is-done'); done.hidden = true; $('#f-name').focus(); });

  /* ---------- Spotlight + magnetic ---------- */
  $$('.spot').forEach(el => el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));
  if (!reduce && matchMedia('(hover:hover)').matches){
    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX - r.left - r.width/2) * .18}px,${(e.clientY - r.top - r.height/2) * .28}px)`; });
      el.addEventListener('pointerleave', () => el.style.transform = '');
    });
  }

  /* ---------- 3D tilt (mouse only; CSS reads --rx/--ry) ---------- */
  if (!reduce && matchMedia('(hover:hover) and (pointer:fine)').matches){
    const tilt = (el, area, max) => {
      let raf = 0, x = 0, y = 0;
      area.addEventListener('pointermove', e => {
        const r = area.getBoundingClientRect(); x = (e.clientX - r.left) / r.width - .5; y = (e.clientY - r.top) / r.height - .5;
        if (!raf) raf = requestAnimationFrame(() => { raf = 0; el.style.setProperty('--rx', (-y * max).toFixed(2) + 'deg'); el.style.setProperty('--ry', (x * max).toFixed(2) + 'deg'); });
      });
      area.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    };
    $$('[data-tilt3d]').forEach(el => tilt(el, el, 5));
    if (hero) tilt($('.hero-phone'), hero, 10);
  }

  /* ---------- Clinic story: light up each step as it scrolls in ---------- */
  const csSteps = $$('.cs-step');
  if (reduce || !('IntersectionObserver' in window)) csSteps.forEach(s => s.classList.add('in'));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }), {rootMargin:'0px 0px -35% 0px'});
    csSteps.forEach(s => io.observe(s));
    if ($('#clinic')) new IntersectionObserver(([e]) => $('#clinic').classList.toggle('live', e.isIntersecting)).observe($('#clinic'));
  }

  /* ---------- GSAP scroll animations ---------- */
  if (!window.gsap || reduce){ $$('.j-step').forEach(s => s.classList.add('on')); return; }
  gsap.registerPlugin(ScrollTrigger);

  // hero entrance: whole words rise in (so Arabic letters stay joined)
  const title = $('[data-split]');
  if (title){
  [...title.childNodes].forEach(n => {
    if (n.nodeType === 1){ if (n.classList.contains('hl')) n.classList.add('w'); return; }
    const frag = document.createDocumentFragment();
    n.textContent.split(/(\s+)/).forEach(p => {
      if (!p) return;
      if (/^\s+$/.test(p)) frag.append(p); else { const s = document.createElement('span'); s.className = 'w'; s.textContent = p; frag.append(s); }
    });
    n.replaceWith(frag);
  });
  const tl = gsap.timeline({defaults:{ease:'power3.out'}});
  tl.from('[data-split] .w', {y:40, opacity:0, duration:.9, stagger:.06})
    .from('[data-hero]', {y:24, opacity:0, duration:.8, stagger:.12}, '-=.6')
    .from('.hero-visual .phone', {y:60, opacity:0, rotate:-4, duration:1.1, clearProps:'transform'}, '-=1')
    .from('[data-float]', {scale:.8, opacity:0, duration:.7, stagger:.15, ease:'back.out(1.7)'}, '-=.5');
  gsap.to('.fc-tg', {y:-12, duration:3, repeat:-1, yoyo:true, ease:'sine.inOut'});
  gsap.to('.fc-sales', {y:10, duration:3.6, repeat:-1, yoyo:true, ease:'sine.inOut', delay:.5});
  gsap.to('.hero-visual', {yPercent:12, ease:'none', scrollTrigger:{trigger:'.hero', start:'top top', end:'bottom top', scrub:true}});
  }

  // reveals (grouped so siblings stagger)
  ScrollTrigger.batch('[data-reveal]', {start:'top 88%', once:true,
    onEnter: els => gsap.fromTo(els, {y:40, opacity:0}, {y:0, opacity:1, duration:.9, stagger:.09, ease:'power3.out', overwrite:true, clearProps:'transform'})});
  gsap.set('[data-reveal]', {opacity:0});

  // dashboard: 3D tilt flattens as it scrolls in
  if ($('.browser')) gsap.fromTo('.browser', {rotateX:22, scale:.92, y:40}, {rotateX:0, scale:1, y:0, ease:'none',
    scrollTrigger:{trigger:'.browser-wrap', start:'top 95%', end:'top 25%', scrub:.6}});

  // journey: progress line fills and steps light up
  const mobile = matchMedia('(max-width:760px)').matches;
  const steps = $$('.j-step');
  if (steps.length){
  gsap.fromTo('.j-fill', mobile ? {scaleY:0} : {scaleX:0}, {...(mobile ? {scaleY:1} : {scaleX:1}), ease:'none',
    scrollTrigger:{trigger:'#journey-track', start:'top 75%', end:'bottom 55%', scrub:.5,
      onUpdate: s => steps.forEach((st, i) => st.classList.toggle('on', s.progress >= i / steps.length + .02))}});
  gsap.from(steps, {y:30, opacity:0, duration:.8, stagger:.12, ease:'power3.out', scrollTrigger:{trigger:'#journey-track', start:'top 80%', once:true}});
  }

  // CTA symbol gentle float
  gsap.to('.cta-symbol', {y:-14, rotate:-3, duration:3.2, repeat:-1, yoyo:true, ease:'sine.inOut'});
})();
