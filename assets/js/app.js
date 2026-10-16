/* Ashna Lab — site logic. No dependencies. Data comes from window.LAB (data.js). */
(() => {
  'use strict';
  const LAB = window.LAB;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n) => (n == null || n === '' ? '—' : Number(n).toLocaleString('en-US'));
  const initials = (name) => { const w = name.replace(/^(Dr|Prof)\.\s*/i, '').split(/\s+/).filter(Boolean); return (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase(); };

  const AREA = Object.fromEntries(LAB.areas.map((a) => [a.id, a]));
  const PEOPLE = LAB.people;
  const PERSON = Object.fromEntries(PEOPLE.map((p) => [p.id, p]));
  const PUBS = LAB.publications.map((p, i) => ({ ...p, _i: i, _hay: `${p.title} ${p.authors} ${p.venue} ${p.year}`.toLowerCase() }));
  const pubsOf = (id) => PUBS.filter((p) => (p.members || []).includes(id));
  const areaVar = (id) => `var(--a-${id || 'ssl'})`;

  /* ── Icons ──────────────────────────────────────────────────────────── */
  const ICON = {
    scholar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="lg" d="M12 3 1 9.5l4 2.4V17c0 1.8 3.1 4 7 4s7-2.2 7-4v-5.1l2-1.2V16h2V9.5L12 3Zm0 2.3 7.2 4.2L12 13.7 4.8 9.5 12 5.3Z"/></svg>',
    orcid: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle class="lg" cx="12" cy="12" r="11"/><text x="12" y="16.2" text-anchor="middle" font-size="10.5" font-weight="700" font-family="Inter,Arial" fill="#fff">iD</text></svg>',
    researchgate: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect class="lg" x="1" y="1" width="22" height="22" rx="4"/><text x="12" y="16" text-anchor="middle" font-size="10" font-weight="700" font-family="Inter,Arial" fill="#fff">RG</text></svg>',
    linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect class="lg" x="1" y="1" width="22" height="22" rx="4"/><path fill="#fff" d="M6 9.5h2.6V18H6zM7.3 5.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM10.3 9.5h2.5v1.2c.4-.7 1.3-1.4 2.7-1.4 2.8 0 3.3 1.8 3.3 4.2V18h-2.6v-4c0-1 0-2.2-1.4-2.2s-1.6 1-1.6 2.1V18h-2.6z"/></svg>',
    github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="lg" d="M12 1.5a10.5 10.5 0 0 0-3.3 20.5c.5.1.7-.2.7-.5v-1.8c-2.9.6-3.5-1.4-3.5-1.4-.5-1.2-1.2-1.5-1.2-1.5-1-.6 0-.6 0-.6 1 .1 1.6 1.1 1.6 1.1.9 1.6 2.5 1.1 3.1.9.1-.7.4-1.1.7-1.4-2.3-.3-4.8-1.2-4.8-5.2 0-1.1.4-2.1 1.1-2.8-.1-.3-.5-1.4.1-2.8 0 0 .9-.3 2.9 1.1a10 10 0 0 1 5.3 0c2-1.4 2.9-1.1 2.9-1.1.6 1.4.2 2.5.1 2.8.7.7 1.1 1.7 1.1 2.8 0 4-2.5 4.9-4.8 5.2.4.3.7 1 .7 1.9v2.9c0 .3.2.6.7.5A10.5 10.5 0 0 0 12 1.5z"/></svg>',
    dblp: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect class="lg" x="1" y="1" width="22" height="22" rx="4"/><text x="12" y="15.5" text-anchor="middle" font-size="7.5" font-weight="700" font-family="Inter,Arial" fill="#fff">dblp</text></svg>',
    semanticscholar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="lg" d="M23 6.5c-.6.4-1.3.7-1.9 1.2-3.5 2.6-6.2 5.9-8.3 9.7l-.7 1.3c-.2-.4-.3-.6-.5-.8-1-2-2.1-3.9-3.5-5.6-.6-.7-1.3-1.4-2.1-2-.6-.4-1.2-.7-1.9-.9L1 8.7c.4-.2.8-.4 1.3-.5 2.5-.6 4.8-.4 6.8 1.4.9.8 1.6 1.7 2.3 2.7l.4.6C14.4 9.7 18.1 7.7 23 6.5z"/></svg>',
    scopus: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle class="lg" cx="12" cy="12" r="11"/><text x="12" y="16.3" text-anchor="middle" font-size="11" font-weight="700" font-family="Inter,Arial" fill="#fff">Sc</text></svg>',
    university: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    homepage: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    email: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    arrow: '<svg class="person__arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  };
  const LINK_LABEL = { scholar: 'Google Scholar', orcid: 'ORCID', researchgate: 'ResearchGate', linkedin: 'LinkedIn', github: 'GitHub', dblp: 'DBLP', semanticscholar: 'Semantic Scholar', scopus: 'Scopus', university: 'University page', homepage: 'Website', email: 'Email' };
  const LINK_ORDER = Object.keys(LINK_LABEL);
  const AREA_ICON = {
    ssl: '<svg viewBox="0 0 24 24"><circle cx="6" cy="7" r="2.2"/><circle cx="18" cy="6" r="2.2"/><circle cx="12" cy="17" r="2.2"/><path d="M8 8l2.8 7.2M16.3 7.5l-3.2 7.6M8.2 7h7.6"/></svg>',
    med: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 7v10M7 12h10"/></svg>',
    ts: '<svg viewBox="0 0 24 24"><path d="M3 17l4-6 4 3 4-8 6 9"/><path d="M3 21h18"/></svg>',
    cv: '<svg viewBox="0 0 24 24"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><circle cx="12" cy="12" r="3.5"/></svg>',
    da: '<svg viewBox="0 0 24 24"><circle cx="7" cy="12" r="4"/><circle cx="17" cy="12" r="4"/><path d="M11 12h2"/></svg>',
    bio: '<svg viewBox="0 0 24 24"><path d="M2 12h4l2-5 4 10 3-7 2 2h5"/></svg>',
  };

  const linkPills = (links = {}, email) => {
    const all = { ...links };
    if (email) all.email = `mailto:${email}`;
    return LINK_ORDER.filter((k) => all[k]).map((k) =>
      `<a class="pill pill--${k}" href="${esc(all[k])}" ${k === 'email' ? '' : 'target="_blank" rel="noopener"'}>${ICON[k]}${LINK_LABEL[k]}</a>`).join('');
  };
  const avatar = (p, lg) => {
    const c = areaVar((p.areas || [])[0]);
    const img = p.photo ? `<img src="${esc(p.photo)}" alt="" onerror="this.parentNode.classList.remove('has-photo');this.remove()">` : '';
    return `<span class="avatar${lg ? ' avatar--lg' : ''}${p.photo ? ' has-photo' : ''}" style="--c:${c}" aria-hidden="true"${p.photo ? ' data-px' : ''}>${initials(p.name)}${img}</span>`;
  };

  /* ── Theme ──────────────────────────────────────────────────────────── */
  const isDark = () => { const r = document.documentElement; return r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; };
  const syncThemeLabel = () => { $('#moreThemeLabel').textContent = isDark() ? 'Light mode' : 'Dark mode'; };
  const toggleTheme = () => {
    const root = document.documentElement;
    root.dataset.theme = isDark() ? 'light' : 'dark';
    try { localStorage.setItem('ashna-theme', root.dataset.theme); } catch (e) {}
    syncThemeLabel();
  };
  $('#themeToggle').addEventListener('click', toggleTheme);
  $('#moreTheme').addEventListener('click', toggleTheme);
  syncThemeLabel();
  const isPhone = matchMedia('(max-width: 699px)');
  const isTouch = matchMedia('(pointer: coarse)').matches;

  /* ── Nav: scrolled material, active section, mobile menu ───────────── */
  const nav = $('#nav');
  const progress = $('#navProgress'), toTop = $('#toTop');
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', scrollY > 12);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.setProperty('--p', max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0);
    toTop.classList.toggle('is-on', scrollY > innerHeight * 1.5);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const navLinks = $$('.nav__links a');
  const TITLE = { top: '', research: 'Research', pi: 'Lab director', people: 'People', network: 'Collaboration', publications: 'Publications', achievements: 'Milestones', contact: 'Contact' };
  const TAB = { top: 'home', research: 'home', pi: 'people', people: 'people', network: 'people', publications: 'papers', achievements: 'more', contact: 'more' };
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const sec = e.target.id, id = sec === 'network' ? 'people' : sec;
      navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
      $('#navTitle').textContent = TITLE[sec] || '';
      nav.classList.toggle('has-title', !!TITLE[sec]);
      $$('#tabbar [data-tab]').forEach((t) => { const on = t.dataset.tab === TAB[sec]; t.classList.toggle('is-active', on); on && t.tagName === 'A' ? t.setAttribute('aria-current', 'page') : t.removeAttribute('aria-current'); });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main > section[id]').forEach((s) => spy.observe(s));

  const menuBtn = $('#menuToggle'), menu = $('#mobileMenu');
  const setMenu = (open) => { menu.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open)); };
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('click', (e) => { if (!menu.hidden && !e.target.closest('#nav')) setMenu(false); });

  /* ── Bottom sheets: shared open/close + swipe-down to dismiss ───────── */
  function swipeToDismiss(panel, body, close) {
    // 1:1 tracking, rubber-band upward, velocity-projected commit.
    let y0 = null, dy = 0, hist = [];
    panel.addEventListener('pointerdown', (e) => {
      if (!isPhone.matches || e.pointerType === 'mouse') return;
      if (body.scrollTop > 0 && !e.target.closest('.sheet__grabber, .fsheet__head')) return;
      if (e.target.closest('.fchips--scroll')) return;
      y0 = e.clientY; dy = 0; hist = [[e.clientY, e.timeStamp]]; panel.style.transition = 'none';
    });
    panel.addEventListener('pointermove', (e) => {
      if (y0 == null) return; dy = e.clientY - y0;
      if (dy < 0) dy = -(-dy * 40) / (40 + -dy);
      panel.style.transform = `translateY(${dy}px)`; hist.push([e.clientY, e.timeStamp]); if (hist.length > 5) hist.shift();
    });
    const end = () => {
      if (y0 == null) return; y0 = null; panel.style.transition = ''; panel.style.transform = '';
      const [a, b] = [hist[0], hist.at(-1)]; const v = (b[0] - a[0]) / Math.max(1, b[1] - a[1]) * 1000;
      if (dy + v * .2 > 140) close();
    };
    panel.addEventListener('pointerup', end); panel.addEventListener('pointercancel', end);
  }
  const anyOpen = () => $$('.sheet, .spot').some((x) => !x.hidden);
  function sheetCtl(root) {
    const panel = $('.sheet__panel', root); let last = null;
    const api = {
      open(from) {
        last = from || document.activeElement; root.hidden = false; document.body.classList.add('is-locked');
        requestAnimationFrame(() => { root.classList.add('is-open'); panel.focus({ preventScroll: true }); });
      },
      close() {
        if (root.hidden) return;
        root.classList.add('is-closing'); root.classList.remove('is-open');
        const done = () => { root.hidden = true; root.classList.remove('is-closing'); if (!anyOpen()) document.body.classList.remove('is-locked'); last?.focus?.({ preventScroll: true }); };
        reduceMotion ? setTimeout(done, 170) : panel.addEventListener('transitionend', done, { once: true });
      },
      get isOpen() { return !root.hidden; },
    };
    root.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) api.close(); });
    swipeToDismiss(panel, $('.sheet__body', root), api.close);
    return api;
  }
  const moreSheet = sheetCtl($('#moreSheet'));
  $('#tabMore').addEventListener('click', (e) => moreSheet.open(e.currentTarget));

  /* ── Reveal on scroll ───────────────────────────────────────────────── */
  const revealer = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); revealer.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  const watchReveal = (root = document) => $$('.reveal:not(.is-in)', root).forEach((el, i) => { el.style.setProperty('--i', el.dataset.i ?? i % 6); revealer.observe(el); });

  /* ── Pixel reveal: a photo assembles block by block, then resolves to full detail ── */
  function pixelize(wrap, img, trigger = wrap) {
    if (wrap._px || reduceMotion) return;
    wrap._px = true; wrap.classList.add('px');
    const cv = document.createElement('canvas'), ctx = cv.getContext('2d');
    cv.setAttribute('aria-hidden', 'true'); wrap.append(cv);
    let raf = 0;
    const cover = (w, h) => { // object-fit: cover source rect
      const ir = img.naturalWidth / img.naturalHeight, r = w / h;
      return ir > r ? [(img.naturalWidth - img.naturalHeight * r) / 2, 0, img.naturalHeight * r, img.naturalHeight]
                    : [0, (img.naturalHeight - img.naturalWidth / r) / 2, img.naturalWidth, img.naturalWidth / r];
    };
    const mosaic = (W, H, b) => { // image downsampled to b-px blocks
      const small = document.createElement('canvas');
      small.width = Math.max(1, Math.ceil(W / b)); small.height = Math.max(1, Math.ceil(H / b));
      small.getContext('2d').drawImage(img, ...cover(W, H), 0, 0, small.width, small.height);
      return small;
    };
    function play() {
      if (!img.complete || !img.naturalWidth) return;
      cancelAnimationFrame(raf);
      const W = wrap.clientWidth, H = wrap.clientHeight, dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.imageSmoothingEnabled = false;
      const B = Math.max(4, Math.round(Math.min(W, H) / 14));
      const steps = [B, Math.round(B / 2), Math.round(B / 4), 2].filter((v, i, a) => v >= 2 && a.indexOf(v) === i);
      const levels = steps.map((b) => [b, mosaic(W, H, b)]);
      const base = levels[0][1], cols = base.width, rows = base.height;
      const order = Array.from({ length: cols * rows }, (_, i) => i);
      for (let i = order.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [order[i], order[j]] = [order[j], order[i]]; }
      const T1 = 520, T2 = 300 * (levels.length - 1) / 3 + 260, t0 = performance.now();
      wrap.classList.add('is-px'); ctx.clearRect(0, 0, W, H);
      let drawn = 0;
      const frame = (now) => {
        const t = now - t0;
        if (t < T1) { // blocks appear in random order
          const k = 1 - Math.pow(1 - t / T1, 2), n = Math.floor(k * order.length);
          for (; drawn < n; drawn++) { const i = order[drawn], x = i % cols, y = (i / cols) | 0; ctx.drawImage(base, x, y, 1, 1, x * B, y * B, B, B); }
        } else if (t < T1 + T2) { // resolve coarse → fine
          const lv = levels[Math.min(levels.length - 1, 1 + Math.floor((t - T1) / T2 * (levels.length - 1)))];
          ctx.clearRect(0, 0, W, H); ctx.drawImage(lv[1], 0, 0, lv[1].width * lv[0], lv[1].height * lv[0]);
        } else { // final sharp frame, then hand over to the real <img> without a gap
          ctx.imageSmoothingEnabled = true; ctx.clearRect(0, 0, W, H); ctx.drawImage(img, ...cover(W, H), 0, 0, W, H);
          wrap.classList.remove('is-px'); raf = requestAnimationFrame(() => ctx.clearRect(0, 0, W, H)); return;
        }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    }
    const ready = () => {
      new IntersectionObserver(([e], io) => { if (e.isIntersecting) { io.disconnect(); play(); } }, { threshold: .4 }).observe(wrap);
      trigger.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') play(); });
    };
    img.complete && img.naturalWidth ? ready() : img.addEventListener('load', ready, { once: true });
  }
  const pixelizeAll = (root = document) => $$('[data-px]', root).forEach((w) => {
    const img = $('img', w); if (img) pixelize(w, img, w.closest('.person, .sheet__hero') || w);
  });

  /* ── Team mosaic (hero) ─────────────────────────────────────────────── */
  function mosaic() {
    const cap = $('#mosaicCap');
    const idle = `<b>${PEOPLE.length + 1} researchers</b><span>${isTouch ? 'Tap a face to open a profile.' : 'Hover over a face to meet the team.'}</span>`;
    const cur = PEOPLE.filter((p) => p.status === 'current'), alu = PEOPLE.filter((p) => p.status === 'alumni');
    const mixed = []; for (let i = 0; i < Math.max(cur.length, alu.length); i++) { if (cur[i]) mixed.push(cur[i]); if (alu[i]) mixed.push(alu[i]); }
    const all = [{ ...LAB.pi, id: 'tanha', areas: ['ssl'], status: 'pi', areaText: 'Lab director' }, ...mixed];
    $('#mosaic').innerHTML = all.map((p, i) => {
      const a = (p.areas || [])[0] || 'ssl';
      const img = p.photo ? `<img src="${esc(p.photo)}" alt="" onerror="this.parentNode.classList.remove('has-photo');this.remove()">` : '';
      return `<button type="button" class="tile${p.status === 'pi' ? ' tile--pi' : ''}${p.status === 'alumni' ? ' tile--alumni' : ''}${p.photo ? ' has-photo' : ''}"
        style="--i:${i};--c:var(--a-${a});--cs:var(--a-${a}-soft)" data-id="${p.id}" ${p.photo ? 'data-px' : ''}
        aria-label="${esc(p.name)}, ${p.status === 'pi' ? 'lab director' : p.status === 'current' ? 'current student' : 'alumni'}">${initials(p.name)}${img}</button>`;
    }).join('');
    cap.innerHTML = idle;
    const show = (t) => {
      const p = t.dataset.id === 'tanha' ? { name: LAB.pi.name, areaText: 'Lab director · ' + LAB.pi.title } : PERSON[t.dataset.id];
      const st = PERSON[t.dataset.id]?.status;
      cap.innerHTML = `<b>${esc(p.name)}</b><span>${st ? (st === 'current' ? 'Current · ' : 'Alumni · ') : ''}${esc(p.areaText)}</span>`;
    };
    const grid = $('#mosaic');
    grid.addEventListener('pointerover', (e) => { const t = e.target.closest('.tile'); if (t) show(t); });
    grid.addEventListener('focusin', (e) => { const t = e.target.closest('.tile'); if (t) show(t); });
    grid.addEventListener('pointerleave', () => (cap.innerHTML = idle));
    grid.addEventListener('focusout', (e) => { if (!grid.contains(e.relatedTarget)) cap.innerHTML = idle; });
    grid.addEventListener('click', (e) => { const t = e.target.closest('.tile'); if (t) openPerson(t.dataset.id, t); });
  }

  /* ── Swipe rows (phone): page dots that follow the scroll position ─── */
  function dots(row) {
    const d = document.createElement('div'); d.className = 'dots'; d.setAttribute('aria-hidden', 'true');
    d.innerHTML = [...row.children].map(() => '<i></i>').join(''); row.after(d);
    const sync = () => {
      const kids = [...row.children], x = row.scrollLeft + 16;
      let k = kids.findIndex((c) => c.offsetLeft + c.offsetWidth / 2 > x + 8); if (k < 0) k = kids.length - 1;
      if (row.scrollLeft + row.clientWidth >= row.scrollWidth - 4) k = kids.length - 1;
      [...d.children].forEach((i, n) => i.classList.toggle('on', n === k));
    };
    row.addEventListener('scroll', sync, { passive: true }); sync();
  }

  /* ── Stats ──────────────────────────────────────────────────────────── */
  function stats() {
    const cur = PEOPLE.filter((p) => p.status === 'current').length;
    const alu = PEOPLE.filter((p) => p.status === 'alumni').length;
    const years = PUBS.map((p) => +p.year).filter(Boolean);
    const items = [
      [PUBS.length, 'Publications indexed'],
      [LAB.pi.metrics?.citations, 'Citations (Director)'],
      [cur, 'Current students'],
      [alu, 'Alumni'],
      [years.length ? `${Math.min(...years)}–` : '—', 'Publishing since'],
    ];
    $('#heroStats').innerHTML = items.filter(([v]) => v != null && v !== '').map(([v, l]) => `<div><dt>${l}</dt><dd data-count="${typeof v === 'number' ? v : ''}">${typeof v === 'number' ? fmt(v) : esc(v)}</dd></div>`).join('');
    if (!reduceMotion) $$('#heroStats [data-count]').forEach((el) => {
      const end = +el.dataset.count; if (!end) return;
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return; io.disconnect();
        const t0 = performance.now(), d = 1200;
        const step = (n) => { const k = Math.min(1, (n - t0) / d), ease = 1 - Math.pow(1 - k, 4); el.textContent = fmt(Math.round(end * ease)); if (k < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      }); io.observe(el);
    });
    $('#dataAsOf').textContent = LAB.asOf;
  }

  /* ── Research areas ─────────────────────────────────────────────────── */
  function areas() {
    $('#areas').innerHTML = LAB.areas.map((a, i) => {
      const ppl = PEOPLE.filter((p) => (p.areas || []).includes(a.id));
      const npubs = PUBS.filter((p) => (p.areas || []).includes(a.id)).length;
      const faces = ppl.slice(0, 5).map((p) => `<span>${initials(p.name)}</span>`).join('');
      const viz = i === 0 ? `<svg class="area__viz" viewBox="0 0 200 140" aria-hidden="true">${miniViz()}</svg>` : '';
      return `<button class="area reveal" data-area="${a.id}" type="button" data-i="${i}">
        ${viz}<span class="area__icon" aria-hidden="true">${AREA_ICON[a.id]}</span>
        <h3>${esc(a.name)}</h3><p>${esc(a.description)}</p>
        <span class="area__keywords">${(a.keywords || []).map((k) => `<span>${esc(k)}</span>`).join('')}</span>
        <span class="area__meta"><span class="area__faces">${faces}</span><span>${ppl.length} people${npubs ? ` · ${npubs} papers` : ''}</span></span>
      </button>`;
    }).join('');
    $('#areas').addEventListener('click', (e) => {
      const b = e.target.closest('.area'); if (!b) return;
      state.area = b.dataset.area; state.status = 'all'; renderPeople(); syncTabs();
      $('#people').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }
  function miniViz() {
    // two-moons style: few labelled, many unlabelled
    let s = '';
    for (let i = 0; i < 46; i++) {
      const a = (i % 23) / 22 * Math.PI, top = i < 23;
      const x = top ? 70 + Math.cos(a) * 55 : 125 - Math.cos(a) * 55, y = top ? 70 - Math.sin(a) * 40 : 80 + Math.sin(a) * 40;
      const seed = i === 4 || i === 30;
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${seed ? 5 : 3}" fill="${seed ? (top ? 'var(--a-ssl)' : 'var(--accent)') : 'none'}" stroke="${top ? 'var(--a-ssl)' : 'var(--accent)'}" stroke-opacity="${seed ? 1 : .5}" stroke-width="1.2"/>`;
    }
    return s;
  }

  /* ── PI ─────────────────────────────────────────────────────────────── */
  function pi() {
    const p = LAB.pi, m = p.metrics || {};
    const portrait = p.photo ? `<img src="${esc(p.photo)}" alt="Portrait of ${esc(p.name)}" onerror="this.parentNode.classList.remove('has-photo');this.remove()">` : '';
    $('#piCard').innerHTML = `
      <div class="reveal"><div class="pi__portrait${p.photo ? ' has-photo' : ''}"${p.photo ? ' data-px' : ''}><span class="pi__initials">${initials(p.name)}</span>${portrait}
        <div class="pi__badge"><strong>${esc(p.name)}</strong>${esc(p.title)}</div></div></div>
      <div>
        <h2 class="pi__name reveal">${esc(p.name)}</h2>
        <p class="pi__role reveal">${esc(p.title)} · ${esc(p.affiliation)}</p>
        <div class="pi__bio reveal" id="piBio">${(p.bio || []).map((t) => `<p>${esc(t)}</p>`).join('')}</div>
        <button class="read-more" type="button" id="piMore" aria-controls="piBio" aria-expanded="false">Read more</button>
        ${p.honor ? `<a class="honor reveal" href="${esc(p.honor.url)}" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"/><path d="m8.2 13.8-1.7 7.2 5.5-3 5.5 3-1.7-7.2"/></svg>
          <span><strong>${esc(p.honor.title)}</strong><small>${esc(p.honor.detail)}</small></span><span class="honor__go" aria-hidden="true">↗</span></a>` : ''}
        <div class="pi__metrics reveal">
          <div class="metric"><b>${fmt(m.citations)}</b><span>Citations</span></div>
          <div class="metric"><b>${fmt(m.hindex)}</b><span>h-index</span></div>
          <div class="metric"><b>${fmt(m.i10)}</b><span>i10-index</span></div>
        </div>
        ${m.source ? `<p class="note reveal" style="margin:-.75rem 0 1.5rem;max-width:34rem">Metrics: ${esc(m.source)}${m.asOf ? `, ${esc(m.asOf)}` : ''}.</p>` : ''}
        <div class="links reveal">${linkPills(p.links, p.email)}</div>
        <div class="pi__cols">
          ${[['Education', p.education], ['Research interests', p.interests], ['Roles &amp; recognition', p.achievements, true]].filter(([, xs]) => xs?.length).map(([h, xs, wide]) =>
            `<details class="acc reveal" open${wide ? ' style="grid-column:1/-1"' : ''}><summary><h4>${h}</h4></summary><ul>${xs.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></details>`).join('')}
        </div>
        <div class="hero__cta reveal" style="margin-top:2rem"><button class="btn btn--ghost" type="button" data-pubs-of="tanha">View all ${pubsOf('tanha').length} publications</button></div>
      </div>`;
  }

  function piPhone() {
    const bio = $('#piBio'), more = $('#piMore');
    const apply = () => {
      const phone = isPhone.matches;
      bio.classList.toggle('is-clamped', phone && more.getAttribute('aria-expanded') !== 'true');
      more.hidden = !phone || bio.scrollHeight <= bio.clientHeight + 4 && more.getAttribute('aria-expanded') !== 'true';
      $$('#piCard .acc').forEach((d, i) => { d.open = !phone || i === 0; });
    };
    more.addEventListener('click', () => {
      const open = more.getAttribute('aria-expanded') !== 'true';
      more.setAttribute('aria-expanded', String(open)); more.textContent = open ? 'Show less' : 'Read more';
      bio.classList.toggle('is-clamped', !open);
    });
    isPhone.addEventListener('change', apply); apply();
  }

  /* ── People ─────────────────────────────────────────────────────────── */
  const state = { status: 'all', area: '' };
  function syncTabs() {
    const tabs = $$('#peopleTabs button'), thumb = $('#peopleTabs .segmented__thumb');
    tabs.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.filter === state.status)));
    const on = tabs.find((b) => b.dataset.filter === state.status);
    thumb.style.width = `${on.offsetWidth}px`; thumb.style.transform = `translateX(${on.offsetLeft - 4}px)`;
    $$('#areaChips .chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.area === state.area)));
  }
  function peopleUI() {
    $('#areaChips').innerHTML = `<button class="chip" type="button" data-area="" aria-pressed="true">All areas</button>` +
      LAB.areas.map((a) => `<button class="chip" type="button" data-area="${a.id}" aria-pressed="false" style="--c:var(--a-${a.id});--cs:var(--a-${a.id}-soft)"><i></i>${esc(a.short || a.name)}</button>`).join('');
    $('#areaChips').addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (!c) return; state.area = c.dataset.area; renderPeople(); syncTabs(); });
    $('#peopleTabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; state.status = b.dataset.filter; renderPeople(); syncTabs(); });
    $('#peopleTabs').addEventListener('keydown', (e) => {
      const tabs = $$('#peopleTabs button'), i = tabs.findIndex((b) => b.dataset.filter === state.status);
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
      const n = tabs[(i + d + tabs.length) % tabs.length]; state.status = n.dataset.filter; n.focus(); renderPeople(); syncTabs();
    });
    $('#peopleGrid').addEventListener('click', (e) => { const c = e.target.closest('.person'); if (c) openPerson(c.dataset.id, c); });
    addEventListener('resize', syncTabs);
    renderPeople(); requestAnimationFrame(syncTabs);
  }
  function renderPeople() {
    const list = PEOPLE.filter((p) => p.id !== 'tanha' && (state.status === 'all' || p.status === state.status) && (!state.area || (p.areas || []).includes(state.area)))
      .sort((a, b) => (a.status === b.status ? 0 : a.status === 'current' ? -1 : 1) || pubsOf(b.id).length - pubsOf(a.id).length);
    $('#peopleGrid').innerHTML = list.length ? list.map((p, i) => {
      const n = pubsOf(p.id).length;
      const icons = LINK_ORDER.filter((k) => p.links?.[k]).slice(0, 4).map((k) => ICON[k]).join('');
      return `<button class="person" type="button" data-id="${p.id}" data-status="${p.status}" style="--i:${i}" aria-label="${esc(p.name)}, ${p.status === 'current' ? 'current student' : 'alumni'}. Open profile">
        <span class="person__top">${avatar(p)}<span><p class="person__name">${esc(p.name)}</p>
          <span class="person__status"><i></i>${p.status === 'current' ? (p.degree ? `${esc(p.degree)} student` : 'Current student') : (p.degree ? `${esc(p.degree)} alumni` : 'Alumni')}</span></span></span>
        <p class="person__area">${esc(p.areaText)}</p>
        ${p.position ? `<p class="person__area" style="font-size:.84rem;color:var(--ink-3)">${esc(p.position)}</p>` : ''}
        <span class="person__foot"><span>${n ? `${n} paper${n > 1 ? 's' : ''}` : 'Profile'}</span><span class="person__icons">${icons}</span>${ICON.arrow}</span>
      </button>`;
    }).join('') : '<p class="empty">No one matches this filter.</p>';
    pixelizeAll($('#peopleGrid'));
  }

  /* ── Person sheet ───────────────────────────────────────────────────── */
  const sheet = $('#sheet'), panel = $('.sheet__panel', sheet);
  let lastFocus = null;
  function openPerson(id, from) {
    const p = id === 'tanha' ? { ...LAB.pi, id: 'tanha', areas: ['ssl'], status: 'pi' } : PERSON[id];
    if (!p) return;
    lastFocus = from || document.activeElement;
    const pubs = pubsOf(id).sort((a, b) => b.year - a.year);
    const m = p.metrics || {};
    const statusTxt = p.status === 'pi' ? p.title : p.status === 'current' ? `${p.degree ? p.degree + ' student' : 'Current student'}` : `${p.degree ? p.degree + ' · ' : ''}Alumni`;
    const cites = pubs.reduce((s, x) => s + (+x.citations || 0), 0);
    $('#sheetBody').innerHTML = `
      <div class="sheet__hero">${avatar(p, true)}<div><h2 id="sheetTitle">${esc(p.name)}</h2><p>${esc(statusTxt)} · Ashna Lab</p></div></div>
      <div class="chips" style="margin:0">${(p.areas || []).map((a) => `<span class="chip" aria-pressed="true" style="--c:var(--a-${a});--cs:var(--a-${a}-soft);cursor:default"><i></i>${esc(AREA[a]?.short || a)}</span>`).join('')}</div>
      ${p.areaText ? `<p class="sheet__bio" style="margin-top:1rem"><strong>Research focus:</strong> ${esc(p.areaText)}</p>` : ''}
      ${p.position ? `<p class="sheet__bio" style="margin-top:.5rem"><strong>Now:</strong> ${esc(p.position)}</p>` : ''}
      ${p.bio ? `<div class="sheet__section"><h3>About</h3><p class="sheet__bio">${esc(Array.isArray(p.bio) ? p.bio[0] : p.bio)}</p></div>` : ''}
      <div class="sheet__section"><h3>At a glance</h3><div class="sheet__metrics">
        <div class="metric"><b>${pubs.length}</b><span>Papers listed</span></div>
        <div class="metric"><b>${fmt(m.citations ?? cites)}</b><span>Citations</span></div>
        <div class="metric"><b>${fmt(m.hindex)}</b><span>h-index</span></div></div></div>
      ${Object.keys(p.links || {}).some((k) => p.links[k]) || p.email ? `<div class="sheet__section"><h3>Profiles</h3><div class="links">${linkPills(p.links, p.email)}</div></div>` : ''}
      ${p.achievements?.length ? `<div class="sheet__section"><h3>Achievements</h3><ul class="sheet__bio" style="padding-left:1.1rem;margin:0">${p.achievements.map((a) => `<li>${esc(a)}</li>`).join('')}</ul></div>` : ''}
      ${pubs.length ? `<div class="sheet__section"><h3>Publications</h3><ol class="pubs">${pubs.map((x, i) => pubItem(x, '', i, id)).join('')}</ol></div>` : ''}`;
    sheet.hidden = false; document.body.classList.add('is-locked'); pixelizeAll(sheet);
    requestAnimationFrame(() => { sheet.classList.add('is-open'); panel.focus(); });
    $('.sheet__body', sheet).scrollTop = 0;
    if (location.hash !== `#person/${id}`) history.pushState(null, '', `#person/${id}`);
  }
  function closeSheet(fromPop) {
    if (sheet.hidden) return;
    sheet.classList.add('is-closing'); sheet.classList.remove('is-open');
    const done = () => { sheet.hidden = true; sheet.classList.remove('is-closing'); if (!anyOpen()) document.body.classList.remove('is-locked'); lastFocus?.focus?.({ preventScroll: true }); };
    reduceMotion ? setTimeout(done, 170) : panel.addEventListener('transitionend', done, { once: true });
    if (!fromPop && location.hash.startsWith('#person/')) history.pushState(null, '', location.pathname + location.search);
  }
  sheet.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) closeSheet();
    const me = e.target.closest('[data-person]'); if (me && me.dataset.person) openPerson(me.dataset.person);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (spot.isOpen) spot.close(); else if (filterSheet.isOpen) filterSheet.close(); else if (moreSheet.isOpen) moreSheet.close(); else closeSheet(); setMenu(false); }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); spot.isOpen ? spot.close() : spot.open(); return; }
    const top = [...$$('.spot:not([hidden]) .spot__panel'), ...$$('.sheet:not([hidden]) .sheet__panel')][0];
    if (e.key === 'Tab' && top) { // focus trap
      const f = $$('a[href],button:not([disabled]),input,[tabindex]:not([tabindex="-1"])', top).filter((x) => x.offsetParent); if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
    }
    if (e.key === '/' && !top && !/input|select|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); $('#pubSearch').focus(); }
  });
  swipeToDismiss(panel, $('.sheet__body', sheet), () => closeSheet());
  addEventListener('popstate', () => { const m = location.hash.match(/^#person\/(.+)$/); m ? openPerson(m[1]) : closeSheet(true); });

  /* ── Publications ───────────────────────────────────────────────────── */
  const PAGE = matchMedia('(max-width: 599px)').matches ? 12 : 25;
  const pstate = { q: '', member: '', year: '', type: '', sort: 'year', shown: PAGE };
  function markAuthors(authors, focusId) {
    let out = esc(authors);
    PEOPLE.concat([{ id: 'tanha', name: LAB.pi.name, aliases: LAB.pi.aliases }]).forEach((p) => {
      const names = [p.name.replace(/^(Dr|Prof)\.\s*/, ''), ...(p.aliases || [])];
      names.forEach((n) => {
        const re = new RegExp(`(${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i');
        if (re.test(out) && !out.includes(`data-person="${p.id}"`)) out = out.replace(re, `<span class="me" data-person="${p.id}"${p.id === focusId ? ' style="text-decoration-color:var(--accent)"' : ''}>$1</span>`);
      });
    });
    return out;
  }
  function hl(text, q) {
    const s = esc(text); if (!q) return s;
    const terms = q.split(/\s+/).filter((t) => t.length > 1).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return terms.length ? s.replace(new RegExp(`(${terms.join('|')})`, 'gi'), '<mark>$1</mark>') : s;
  }
  function pubItem(p, q, i, focusId) {
    const type = p.type === 'journal' ? ['j', 'Journal'] : p.type === 'conference' ? ['c', 'Conference'] : ['p', p.type === 'preprint' ? 'Preprint' : (p.type || 'Other')];
    const url = p.url || (p.doi ? `https://doi.org/${p.doi}` : '');
    const title = url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${hl(p.title, q)}</a>` : hl(p.title, q);
    return `<li class="pub" style="--i:${Math.min(i, 20)}">
      <span class="pub__year">${esc(p.year || '—')}</span>
      <div><p class="pub__title">${title}</p>
        <p class="pub__authors">${markAuthors(p.authors, focusId)}</p>
        ${p.venue ? `<p class="pub__venue">${hl(p.venue, q)}</p>` : ''}
        <div class="pub__tags"><span class="tag tag--${type[0]}">${esc(type[1])}</span>${(p.areas || []).slice(0, 2).map((a) => `<span class="tag">${esc(AREA[a]?.short || a)}</span>`).join('')}${p.doi ? `<span class="tag">DOI</span>` : ''}${p.highlight ? '<span class="tag tag--p">Highlight</span>' : ''}</div></div>
      <div class="pub__cites">${p.citations != null ? fmt(p.citations) : '—'}<small>citations</small></div></li>`;
  }
  function pubsUI() {
    const years = [...new Set(PUBS.map((p) => p.year).filter(Boolean))].sort((a, b) => b - a);
    $('#pubYear').innerHTML += years.map((y) => `<option>${y}</option>`).join('');
    const members = [{ id: 'tanha', name: LAB.pi.name }, ...PEOPLE.filter((p) => pubsOf(p.id).length)].map((p) => ({ ...p, n: pubsOf(p.id).length }));
    $('#pubMember').innerHTML += members.map((p) => `<option value="${p.id}">${esc(p.name)} (${p.n})</option>`).join('');
    // per-year chart
    const counts = {}; PUBS.forEach((p) => p.year && (counts[p.year] = (counts[p.year] || 0) + 1));
    const ys = Object.keys(counts).map(Number), lo = Math.min(...ys), hi = Math.max(...ys), mx = Math.max(...Object.values(counts));
    const bars = []; for (let y = lo; y <= hi; y++) bars.push(y);
    $('#pubChart').innerHTML = bars.map((y, i) => `<button class="bar" type="button" style="height:${Math.max(4, (counts[y] || 0) / mx * 100)}%;--i:${i}" data-year="${y}" data-label="${y}: ${counts[y] || 0}" aria-label="${y}: ${counts[y] || 0} publications"></button>`).join('');
    $('#pubChart').addEventListener('click', (e) => { const b = e.target.closest('.bar'); if (!b) return; pstate.year = pstate.year === b.dataset.year ? '' : b.dataset.year; $('#pubYear').value = pstate.year; pstate.shown = PAGE; renderPubs(); });
    $('#pubSummary').textContent = `${PUBS.length} publications by Prof. Tanha and lab members, ${fmt(PUBS.reduce((s, p) => s + (+p.citations || 0), 0))} citations in total. Indexed from Google Scholar, Semantic Scholar, OpenAlex and DBLP.`;
    let tq; $('#pubSearch').addEventListener('input', (e) => { clearTimeout(tq); tq = setTimeout(() => { pstate.q = e.target.value.trim().toLowerCase(); pstate.shown = PAGE; renderPubs(); }, 120); });
    [['#pubMember', 'member'], ['#pubYear', 'year'], ['#pubType', 'type'], ['#pubSort', 'sort']].forEach(([s, k]) => $(s).addEventListener('change', (e) => { pstate[k] = e.target.value; pstate.shown = PAGE; renderPubs(); }));
    filterSheetUI(members, years);
    $('#pubCount').addEventListener('click', (e) => {
      if (!e.target.closest('[data-clear]')) return;
      Object.assign(pstate, { q: '', member: '', year: '', type: '', shown: PAGE });
      ['#pubSearch', '#pubMember', '#pubYear', '#pubType'].forEach((s) => ($(s).value = ''));
      renderPubs();
    });
    $('#pubMore').addEventListener('click', () => { pstate.shown += PAGE; renderPubs(true); });
    $('#pubList').addEventListener('click', (e) => { const m = e.target.closest('[data-person]'); if (m) openPerson(m.dataset.person, m); });
    document.addEventListener('click', (e) => { const b = e.target.closest('[data-pubs-of]'); if (!b) return; pstate.member = b.dataset.pubsOf; $('#pubMember').value = pstate.member; renderPubs(); $('#publications').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); });
    renderPubs();
  }
  let filterSheet;
  function filterSheetUI(members, years) {
    filterSheet = sheetCtl($('#filterSheet'));
    $('#filtersBtn').addEventListener('click', (e) => filterSheet.open(e.currentTarget));
    const chip = (k, v, label) => `<button class="fchip" type="button" data-k="${k}" data-v="${esc(v)}" aria-pressed="false">${esc(label)}</button>`;
    $('#fsBody').innerHTML = `
      <section class="fgroup"><h3>Sort by</h3><div class="fchips">${chip('sort', 'year', 'Newest')}${chip('sort', 'cites', 'Most cited')}${chip('sort', 'title', 'Title A–Z')}</div></section>
      <section class="fgroup"><h3>Type</h3><div class="fchips">${chip('type', '', 'All')}${chip('type', 'journal', 'Journal')}${chip('type', 'conference', 'Conference')}${chip('type', 'preprint', 'Preprint / other')}</div></section>
      <section class="fgroup"><h3>Year</h3><div class="fchips fchips--scroll">${chip('year', '', 'All years')}${years.map((y) => chip('year', String(y), y)).join('')}</div></section>
      <section class="fgroup"><h3>Member</h3><div class="fmembers">
        <button class="fmember" type="button" data-k="member" data-v="" aria-pressed="false"><span class="avatar" style="--c:var(--ink-3)" aria-hidden="true">All</span>Everyone<small>${PUBS.length}</small></button>
        ${members.map((p) => `<button class="fmember" type="button" data-k="member" data-v="${p.id}" aria-pressed="false">${avatar(p.id === 'tanha' ? { ...LAB.pi, areas: ['ssl'] } : p)}${esc(p.name)}<small>${p.n}</small></button>`).join('')}
      </div></section>`;
    $('#fsBody').addEventListener('click', (e) => {
      const b = e.target.closest('[data-k]'); if (!b) return;
      const { k, v } = b.dataset; pstate[k] = v; pstate.shown = PAGE;
      const sel = { member: '#pubMember', year: '#pubYear', type: '#pubType', sort: '#pubSort' }[k]; $(sel).value = v;
      renderPubs();
    });
    $('#fsReset').addEventListener('click', () => {
      Object.assign(pstate, { member: '', year: '', type: '', sort: 'year', shown: PAGE });
      ['#pubMember', '#pubYear', '#pubType'].forEach((x) => ($(x).value = '')); $('#pubSort').value = 'year'; renderPubs();
    });
  }
  function syncFilterSheet(n) {
    $$('#fsBody [data-k]').forEach((b) => b.setAttribute('aria-pressed', String((pstate[b.dataset.k] || '') === b.dataset.v)));
    $('#fsShow').textContent = n ? `Show ${n} result${n === 1 ? '' : 's'}` : 'No results';
  }
  function renderPubs(append) {
    const { q, member, year, type, sort } = pstate;
    let list = PUBS.filter((p) => (!q || q.split(/\s+/).every((t) => p._hay.includes(t))) && (!member || (p.members || []).includes(member)) && (!year || String(p.year) === year) &&
      (!type || (type === 'preprint' ? !['journal', 'conference'].includes(p.type) : p.type === type)));
    list.sort(sort === 'cites' ? (a, b) => (b.citations || 0) - (a.citations || 0) : sort === 'title' ? (a, b) => a.title.localeCompare(b.title) : (a, b) => (b.year || 0) - (a.year || 0) || (b.citations || 0) - (a.citations || 0));
    const shown = list.slice(0, pstate.shown);
    $('#pubList').innerHTML = shown.length ? shown.map((p, i) => pubItem(p, q, append ? 0 : i)).join('') : '<li class="empty">No publications match these filters.</li>';
    const active = [member, year, type].filter(Boolean).length;
    if (filterSheet) syncFilterSheet(list.length);
    $('#filtersCount').textContent = active || '';
    $('#pubCount').innerHTML = `<span>Showing ${shown.length} of ${list.length}</span>${active || q ? '<button type="button" data-clear>Clear filters</button>' : ''}`;
    $('#pubMore').hidden = list.length <= pstate.shown;
    $$('#pubChart .bar').forEach((b) => b.classList.toggle('is-on', b.dataset.year === year));
  }

  /* ── Collaboration graph (tiny force layout, draggable) ─────────────── */
  function graph() {
    const svg = $('#graph'), wrap = $('#graphWrap'), tip = $('#graphTip');
    const NS = 'http://www.w3.org/2000/svg';
    const ids = ['tanha', ...PEOPLE.map((p) => p.id)];
    const nodes = ids.map((id) => {
      const p = id === 'tanha' ? { name: LAB.pi.name, areas: ['ssl'] } : PERSON[id];
      return { id, name: p.name, area: (p.areas || [])[0] || 'ssl', n: pubsOf(id).length, x: 0, y: 0, vx: 0, vy: 0, pi: id === 'tanha', status: p.status };
    });
    const N = Object.fromEntries(nodes.map((n) => [n.id, n]));
    const w = {}; // co-author weights
    PUBS.forEach((p) => { const m = [...new Set(p.members || [])]; for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) { const k = [m[i], m[j]].sort().join('|'); w[k] = (w[k] || 0) + 1; } });
    const links = Object.entries(w).map(([k, v]) => { const [a, b] = k.split('|'); return { a: N[a], b: N[b], w: v, sup: false }; }).filter((l) => l.a && l.b);
    // supervision edges keep members without co-authored papers in the picture
    nodes.forEach((n) => { if (!n.pi && !links.some((l) => (l.a === n || l.b === n))) links.push({ a: N.tanha, b: n, w: 0, sup: true }); });

    let W = svg.clientWidth, H = svg.clientHeight;
    nodes.forEach((n, i) => { const a = i / nodes.length * 6.283; n.x = W / 2 + Math.cos(a) * W * .3; n.y = H / 2 + Math.sin(a) * H * .3; });
    N.tanha.x = W / 2; N.tanha.y = H / 2;
    const r = (n) => (n.pi ? 18 : 6 + Math.sqrt(n.n) * 2.4);

    svg.innerHTML = '';
    const gE = document.createElementNS(NS, 'g'), gN = document.createElementNS(NS, 'g'); svg.append(gE, gN);
    links.forEach((l) => { l.el = document.createElementNS(NS, 'line'); l.el.setAttribute('class', 'edge'); l.el.setAttribute('stroke-width', l.sup ? 1 : Math.min(6, 1 + Math.log2(1 + l.w) * 1.4)); if (l.sup) l.el.setAttribute('stroke-dasharray', '3 4'); gE.append(l.el); });
    nodes.forEach((n) => {
      const g = document.createElementNS(NS, 'g'); g.setAttribute('class', `node${n.pi ? ' is-pi' : ''}`); g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', `${n.name}, ${n.n} papers`);
      const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', r(n)); c.setAttribute('fill', n.pi ? 'var(--accent)' : `var(--a-${n.area})`); if (n.status === 'alumni') c.setAttribute('fill-opacity', '.6');
      const t = document.createElementNS(NS, 'text'); t.textContent = n.pi ? 'Jafar Tanha' : n.name.split(' ').slice(-1)[0]; t.setAttribute('text-anchor', 'middle'); t.setAttribute('dy', r(n) + 14);
      g.append(c, t); gN.append(g); n.el = g;
      g.addEventListener('pointerenter', () => focus(n)); g.addEventListener('pointerleave', () => focus(null));
      g.addEventListener('focus', () => focus(n)); g.addEventListener('blur', () => focus(null));
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPerson(n.id, g); } });
    });
    $('#graphLegend').innerHTML = `<span><i style="background:var(--accent)"></i>Director</span>` + LAB.areas.map((a) => `<span><i style="background:var(--a-${a.id})"></i>${esc(a.short)}</span>`).join('') + '<span style="opacity:.8">— co-authored · ┄ supervised</span>';

    function focus(n) {
      wrap.classList.toggle('is-focus', !!n);
      if (!n) { tip.hidden = true; nodes.forEach((m) => m.el.classList.remove('on')); links.forEach((l) => l.el.classList.remove('on')); return; }
      const nb = new Set([n]);
      links.forEach((l) => { const on = l.a === n || l.b === n; l.el.classList.toggle('on', on); if (on) { nb.add(l.a); nb.add(l.b); } });
      nodes.forEach((m) => m.el.classList.toggle('on', nb.has(m)));
      tip.hidden = false; tip.innerHTML = `<b>${esc(n.name)}</b>${n.n} paper${n.n === 1 ? '' : 's'} · ${nb.size - 1} connection${nb.size === 2 ? '' : 's'}`;
      tip.style.left = `${n.x}px`; tip.style.top = `${n.y - r(n)}px`;
    }

    // drag with pointer capture, respecting grab offset
    let drag = null, moved = false, alpha = 1;
    svg.addEventListener('pointerdown', (e) => {
      const g = e.target.closest('.node'); if (!g) return;
      const n = nodes.find((m) => m.el === g); const b = svg.getBoundingClientRect();
      if (e.pointerType === 'touch') { drag = { n, touch: true, x: e.clientX, y: e.clientY }; moved = false; focus(n); return; }
      drag = { n, ox: e.clientX - b.left - n.x, oy: e.clientY - b.top - n.y }; moved = false; svg.setPointerCapture(e.pointerId); alpha = Math.max(alpha, .5); kick();
    });
    svg.addEventListener('pointermove', (e) => {
      if (!drag) return;
      if (drag.touch) { if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) moved = true; return; }
      const b = svg.getBoundingClientRect();
      const nx = e.clientX - b.left - drag.ox, ny = e.clientY - b.top - drag.oy;
      if (Math.hypot(nx - drag.n.x, ny - drag.n.y) > 2) moved = true;
      drag.n.x = nx; drag.n.y = ny; drag.n.vx = drag.n.vy = 0; alpha = Math.max(alpha, .3); kick(); focus(drag.n);
    });
    const up = () => { if (drag && !moved) openPerson(drag.n.id, drag.n.el); if (drag?.touch) focus(null); drag = null; };
    svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', () => { if (drag?.touch) focus(null); drag = null; });

    let running = false;
    function tick() {
      const cx = W / 2, cy = H / 2;
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j]; let dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy || 1;
        const f = 4200 / d2 * alpha, d = Math.sqrt(d2); dx /= d; dy /= d;
        a.vx -= dx * f; a.vy -= dy * f; b.vx += dx * f; b.vy += dy * f;
        const min = r(a) + r(b) + 14; if (d < min) { const push = (min - d) / 2; a.x -= dx * push; a.y -= dy * push; b.x += dx * push; b.y += dy * push; }
      }
      links.forEach((l) => {
        const dx = l.b.x - l.a.x, dy = l.b.y - l.a.y, d = Math.hypot(dx, dy) || 1, target = l.sup ? Math.min(W, H) * .36 : 70 + 40 / (1 + l.w);
        const k = (d - target) / d * (l.sup ? .012 : .05) * alpha; l.a.vx += dx * k; l.a.vy += dy * k; l.b.vx -= dx * k; l.b.vy -= dy * k;
      });
      nodes.forEach((n) => {
        n.vx += (cx - n.x) * .004 * alpha; n.vy += (cy - n.y) * .004 * alpha;
        if (drag && drag.n === n) return; if (n.pi && !n.moved) { n.vx += (cx - n.x) * .05; n.vy += (cy - n.y) * .05; }
        n.vx *= .82; n.vy *= .82; n.x += n.vx; n.y += n.vy;
        const pad = 28, padX = W < 560 ? 46 : pad; n.x = Math.max(padX, Math.min(W - padX, n.x)); n.y = Math.max(pad, Math.min(H - pad - 40, n.y));
      });
      links.forEach((l) => { l.el.setAttribute('x1', l.a.x); l.el.setAttribute('y1', l.a.y); l.el.setAttribute('x2', l.b.x); l.el.setAttribute('y2', l.b.y); });
      nodes.forEach((n) => n.el.setAttribute('transform', `translate(${n.x},${n.y})`));
      alpha *= .985;
    }
    function loop() { tick(); if (alpha > .02 || drag) requestAnimationFrame(loop); else running = false; }
    function kick() { if (!running) { running = true; requestAnimationFrame(loop); } }
    if (reduceMotion) { for (let i = 0; i < 400; i++) tick(); alpha = 0; } else {
      for (let i = 0; i < 60; i++) tick();
      new IntersectionObserver(([e]) => { if (e.isIntersecting) { alpha = Math.max(alpha, .6); kick(); } }, { threshold: .2 }).observe(wrap);
    }
    addEventListener('resize', () => { W = svg.clientWidth; H = svg.clientHeight; alpha = .5; kick(); });
  }

  /* ── Search palette (⌘K / tab bar) ──────────────────────────────────── */
  const spot = (() => {
    const root = $('#spot'), input = $('#spotInput'), list = $('#spotList');
    const ICO = { area: (id) => AREA_ICON[id], paper: '<svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h7M9 16h7"/></svg>',
      go: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' };
    const ppl = [{ ...LAB.pi, id: 'tanha', areas: ['ssl'], areaText: 'Lab director' }, ...PEOPLE];
    const norm = (t) => String(t || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    const score = (hay, terms) => terms.every((t) => hay.includes(t)) ? terms.reduce((s, t) => s + (hay.startsWith(t) ? 3 : hay.includes(' ' + t) ? 2 : 1), 0) : 0;
    let items = [], sel = 0, last = null;
    function build(q) {
      const terms = norm(q).split(/\s+/).filter(Boolean);
      const people = (terms.length ? ppl.map((p) => [p, score(norm(`${p.name} ${p.areaText} ${(p.aliases || []).join(' ')}`), terms)]).filter(([, s]) => s).sort((a, b) => b[1] - a[1]).map(([p]) => p) : ppl.slice(0, 1)).slice(0, 6);
      const areas = (terms.length ? LAB.areas.filter((a) => score(norm(`${a.name} ${a.short} ${a.description} ${(a.keywords || []).join(' ')}`), terms)) : LAB.areas).slice(0, terms.length ? 3 : 6);
      const papers = terms.length ? PUBS.map((p) => [p, score(norm(p._hay), terms)]).filter(([, s]) => s).sort((a, b) => b[1] - a[1] || (b[0].citations || 0) - (a[0].citations || 0)).map(([p]) => p).slice(0, 8)
        : [...PUBS].sort((a, b) => (b.citations || 0) - (a.citations || 0)).slice(0, 4);
      items = [];
      const group = (title, arr, fn) => arr.length ? `<p class="spot__group">${title}</p>` + arr.map((x) => { items.push(x); return fn(x, items.length - 1); }).join('') : '';
      const row = (i, inner, kind, id) => `<div class="spot__item" role="option" id="sp${i}" data-i="${i}" data-kind="${kind}" data-id="${esc(id)}" aria-selected="false">${inner}</div>`;
      list.innerHTML =
        group(terms.length ? 'People' : 'Lab director', people.map((p) => ({ k: 'person', p })), (x, i) => row(i, `${avatar(x.p)}<span class="spot__txt"><b>${hl(x.p.name, q)}</b><small>${x.p.status === 'alumni' ? 'Alumni · ' : x.p.status === 'current' ? 'Current · ' : ''}${esc(x.p.areaText || '')}</small></span><span class="spot__go">${ICO.go.replace('<svg', '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"')}</span>`, 'person', x.p.id)) +
        group('Research areas', areas.map((a) => ({ k: 'area', a })), (x, i) => row(i, `<span class="spot__ico" style="--c:var(--a-${x.a.id});--cs:var(--a-${x.a.id}-soft)">${ICO.area(x.a.id)}</span><span class="spot__txt"><b>${hl(x.a.name, q)}</b><small>${PEOPLE.filter((p) => (p.areas || []).includes(x.a.id)).length} people</small></span>`, 'area', x.a.id)) +
        group(terms.length ? 'Publications' : 'Most cited', papers.map((p) => ({ k: 'paper', p })), (x, i) => row(i, `<span class="spot__ico">${ICO.paper}</span><span class="spot__txt"><b>${hl(x.p.title, q)}</b><small>${esc(x.p.year || '')} · ${esc(x.p.venue || x.p.authors)} · ${fmt(x.p.citations || 0)} cites</small></span>`, 'paper', x.p._i));
      if (!items.length) list.innerHTML = `<p class="spot__empty">No matches for “${esc(q)}”.</p>`;
      pixelizeAll(list); select(0);
    }
    function select(i) {
      const rows = $$('.spot__item', list); if (!rows.length) { input.removeAttribute('aria-activedescendant'); return; }
      sel = (i + rows.length) % rows.length;
      rows.forEach((r, n) => r.setAttribute('aria-selected', String(n === sel)));
      input.setAttribute('aria-activedescendant', rows[sel].id);
      rows[sel].scrollIntoView({ block: 'nearest' });
    }
    function go(i) {
      const r = $$('.spot__item', list)[i]; if (!r) return;
      const { kind, id } = r.dataset;
      api.close(true);
      if (kind === 'person') openPerson(id);
      else if (kind === 'area') { state.area = id; state.status = 'all'; renderPeople(); syncTabs(); $('#people').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); }
      else {
        const p = PUBS[+id], url = p.url || (p.doi ? `https://doi.org/${p.doi}` : '');
        if (url) window.open(url, '_blank', 'noopener');
        else { $('#pubSearch').value = p.title; pstate.q = p.title.toLowerCase(); pstate.shown = PAGE; renderPubs(); $('#publications').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); }
      }
    }
    let tq; input.addEventListener('input', () => { clearTimeout(tq); tq = setTimeout(() => build(input.value.trim()), 60); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); select(sel + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); select(sel - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); go(sel); }
    });
    list.addEventListener('pointermove', (e) => { const r = e.target.closest('.spot__item'); if (r && e.pointerType === 'mouse' && +r.dataset.i !== sel) select(+r.dataset.i); });
    list.addEventListener('click', (e) => { const r = e.target.closest('.spot__item'); if (r) go(+r.dataset.i); });
    root.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) api.close(); });
    const api = {
      open(from) {
        last = from || document.activeElement; root.hidden = false; document.body.classList.add('is-locked');
        input.value = ''; build('');
        requestAnimationFrame(() => { root.classList.add('is-open'); input.focus(); });
      },
      close(keepLock) {
        if (root.hidden) return; root.classList.remove('is-open');
        setTimeout(() => { root.hidden = true; if (!anyOpen()) document.body.classList.remove('is-locked'); if (!keepLock) last?.focus?.({ preventScroll: true }); }, reduceMotion ? 0 : 200);
      },
      get isOpen() { return !root.hidden; },
    };
    $('#searchOpen').addEventListener('click', (e) => api.open(e.currentTarget));
    $('#tabSearch').addEventListener('click', (e) => api.open(e.currentTarget));
    return api;
  })();

  /* ── Milestones & contact ───────────────────────────────────────────── */
  function milestones() {
    $('#timeline').innerHTML = [...(LAB.milestones || [])].sort((a, b) => (b.feature ? 1 : 0) - (a.feature ? 1 : 0) || parseInt(b.year) - parseInt(a.year)).map((m, i) => `
      <article class="milestone reveal${m.feature ? ' milestone--feature' : ''}" data-i="${i % 3}">
        <span class="milestone__year">${esc(m.year)}</span><h3>${esc(m.title)}</h3><p>${esc(m.text)}</p>
        ${m.who || m.url ? `<span class="milestone__who">${esc(m.who || '')}${m.url ? ` · <a class="link" href="${esc(m.url)}" target="_blank" rel="noopener">Source ↗</a>` : ''}</span>` : ''}</article>`).join('');
  }
  function contact() {
    const p = LAB.pi;
    $('#contactActions').innerHTML = (p.email ? `<a class="btn btn--primary" href="mailto:${esc(p.email)}">Email Prof. Tanha ${'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'}</a>` : '') +
      (p.links?.university ? `<a class="btn btn--ghost" href="${esc(p.links.university)}" target="_blank" rel="noopener">University profile</a>` : '') +
      (p.links?.scholar ? `<a class="btn btn--ghost" href="${esc(p.links.scholar)}" target="_blank" rel="noopener">Google Scholar</a>` : '');
  }

  /* ── Boot ───────────────────────────────────────────────────────────── */
  mosaic(); stats(); areas(); pi(); piPhone(); peopleUI(); pubsUI(); graph(); milestones(); contact();
  dots($('#areas')); dots($('#timeline'));
  $('#piCard').addEventListener('click', () => {});
  watchReveal(); pixelizeAll();
  const m = location.hash.match(/^#person\/(.+)$/); if (m) openPerson(m[1]);
})();
