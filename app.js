/* Clinton Strickland — arcade site. Plain JS, no dependencies. */
(function () {
  'use strict';

  var ACCENT = '#FFD23F', HOODIE = '#6F8FAA', SKIN = '#B9784A'; // faded whale-blue sweatshirt
  var BOOKING_URL = 'https://calendly.com/clinton-strickland3/30min'; // paste a Calendly or Google booking link here; until then the button opens a prefilled email
  var VCARD = 'clintonstrickland.vcf';
  var CLIFFHANGER_BETA = ''; // public beta link; the PLAY THE BETA button appears once this is set
  // Real quotes only. Each: { q: 'quote', name: 'Full Name', role: 'Title, Company' }. The REVIEWS stage appears once this has entries.
  var REVIEWS = [];
  var GLOW = ACCENT + '59';
  var NEON = ['#FF2E88', '#2EE6FF', '#FFD23F', '#39FF88', '#8B5CFF'];
  var REDUCE = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var UC = document.body.getAttribute('data-mode') === 'construction' || /[?&]mode=construction\b/.test(location.search);
  var EMAIL = 'clinton.strickland3@gmail.com';
  var LINKEDIN = 'https://www.linkedin.com/in/csiii';
  var GITHUB = 'https://github.com/gbbofla';
  var RESUME = 'company.html'; // plain, fully accessible version of the whole site
  var CALL = BOOKING_URL || ('mailto:' + EMAIL + '?subject=' + encodeURIComponent('15-minute call') + '&body=' + encodeURIComponent('Hi Clinton,\n\nI found your site and would like to set up a 15-minute call. A few times that work for me:\n\n- \n- \n\nThanks,\n'));
  var CALL_EXT = !!BOOKING_URL;
  if (window.__previewReviews) REVIEWS = window.__previewReviews; // used only by local design previews

  var viewport = document.getElementById('viewport');
  var stage = document.getElementById('stage');
  var st = { stage: 0, app: null, scan: null, tick: 0, typed: false };
  // Pause control for everything that moves on its own (WCAG 2.2.2). Starts paused for reduced-motion users.
  var STILL = REDUCE;
  try { var pref = localStorage.getItem('cs-motion'); if (pref === 'off') STILL = true; else if (pref === 'on') STILL = false; } catch (e) { /* storage unavailable */ }
  var device = null, L = null, els = {}, screenKey = null, timers = [], wheelLock = false, touchY = null;

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* ------------------------------------------------------------------ data */
  var LAYOUTS = {
    'desktop-site': { W: 1280, H: 800, floorY: 560, figX: 560, figY: 360, origin: '640px 485px',
      cabs: [[300, 340, 100, 220, .7], [420, 340, 100, 220, .7], [760, 340, 100, 220, .7], [880, 340, 100, 220, .7], [150, 340, 140, 330, .85], [990, 340, 140, 330, .85], [-40, 300, 170, 460, 1], [1150, 300, 170, 460, 1]] },
    'desktop-construction': { W: 1280, H: 800, floorY: 560, figX: 640, figY: 360, origin: '720px 485px',
      cabs: [[560, 340, 100, 220, .7], [680, 340, 100, 220, .7], [800, 340, 100, 220, .7], [1150, 300, 170, 460, 1]] },
    'mobile-site': { W: 390, H: 844, floorY: 600, figX: 115, figY: 400, origin: '195px 525px',
      cabs: [[18, 400, 80, 200, .7], [292, 400, 80, 200, .7], [-62, 470, 130, 330, 1], [322, 470, 130, 330, 1]] },
    'mobile-construction': { W: 390, H: 844, floorY: 640, figX: 95, figY: 450, origin: '175px 575px',
      cabs: [[10, 460, 80, 180, .7], [300, 460, 80, 180, .7]] }
  };

  var S = [
    { world: 'scale(1)', blur: 0, bright: 1, fig: 'scale(1)', figO: 1, vig: 'inset 0 0 0 0 rgba(5,3,10,.95)', vigM: 'inset 0 0 0 0 rgba(5,3,10,.95)', bar: 0, pov: 0, povT: 'translateY(80px) scale(0.94)', povTm: 'translateY(60px) scale(0.92)', hud: 1, where: 'INSERT COIN' },
    { world: 'scale(1.12)', blur: 3, bright: 0.9, fig: 'scale(2.8)', figO: 0.85, vig: 'inset 0 0 160px 60px rgba(5,3,10,.95)', vigM: 'inset 0 0 90px 30px rgba(5,3,10,.95)', bar: 36, pov: 0, povT: 'translateY(80px) scale(0.94)', povTm: 'translateY(60px) scale(0.92)', hud: 0, where: 'LOADING' },
    { world: 'scale(1.3)', blur: 9, bright: 0.75, fig: 'scale(7)', figO: 0, vig: 'inset 0 0 220px 150px rgba(5,3,10,.95)', vigM: 'inset 0 0 140px 70px rgba(5,3,10,.95)', bar: 64, pov: 1, povT: 'none', povTm: 'none', hud: 0, where: 'PLAYER 1' }
  ];

  // ---- Company content. The company name lives in ONE place: COMPANY. ----
  var COMPANY = '[COMPANY NAME]';
  var CHECK = 'health-check.html';

  // The offer ladder, shown as arcade levels. Prices confirmed November 20, 2026.
  var LEVELS = [
    { lv: 'LV1', tag: 'START HERE', name: 'Growth & Content Audit', short: 'Audit', term: '3 weeks', len: '3 weeks', price: 'From $7,500', col: '#FFD23F',
      d: 'We review your channels, content, funnel and measurement, then hand you a ranked list of what to fix and a 90-day test plan. Fixed fee, credited toward any retainer signed within 60 days.' },
    { lv: 'LV2', tag: 'BUILD THE ENGINE', name: 'Content Engine Sprint', short: 'Sprint', term: '6 to 8 weeks', len: '6 to 8 weeks', price: 'From $15,000', col: '#2EE6FF',
      d: 'We find the format that already works in your space, lock its structure, and build your weekly cadence: one long piece, short posts and a short video, every week, judged by pipeline, not likes.' },
    { lv: 'LV3', tag: 'MAKE THE SHOW', name: 'Short-form & Microdrama Production', short: 'Production', term: 'per series', len: 'Per series of 10 to 20 episodes', price: 'From $25,000', col: '#FF2E88',
      d: 'Vertical short-form and episodic microdrama series made for phones, written to end every episode on a hook. Produced by the studio behind Cliffhanger.' },
    { lv: 'LV4', tag: 'SCALE WHAT WORKS', name: 'Hypergrowth Retainer', short: 'Retainer', len: 'Monthly · 3-month minimum', price: 'From $10,000/mo', col: '#39FF88',
      d: 'Ongoing strategy, content and paid growth with a testing roadmap: find what works, prove it, then pour fuel on it. Monthly reviews against the numbers you care about.' },
    { lv: 'LV5', tag: 'LEAD THE TEAM', name: 'Fractional Head of Growth', short: 'Fractional', len: 'Monthly · about 10 hours a week', price: 'From $8,000/mo', col: '#A78BFA',
      d: 'About 10 hours a week: owns your growth plan, sets the KPIs, manages vendors and creators, and coaches your in-house team.' }
  ];

  var APPS = [
    { id: 'pitch', n: '01', label: 'THE PITCH', col: ACCENT, title: 'Growth you can see coming.',
      body: COMPANY + ' is a hypergrowth and content studio founded by Clinton Strickland. Most brands don’t have a content problem; they have a system problem. We start with a fixed-fee audit that finds where your growth is leaking, then build the engine that fixes it: a repeatable format, a weekly cadence, short-form and microdrama series, and measurement that judges every post by pipeline, not likes.',
      rows: [{ t: 'Prove what works before you scale it.' }, { t: 'Copy the structure, change the story.' }, { t: 'Packaging is half the work: the hook decides whether anyone sees the rest.' }, { t: 'Judge content like media: by what it moves.' }, { t: 'Founder-led: you work with Clinton directly.' }] },
    { id: 'levels', n: '02', label: 'LEVELS', col: '#2EE6FF' },
    { id: 'fit', n: '03', label: 'WHO WE HELP', col: '#39FF88', title: 'Who we play for',
      body: 'We do our best work where one person can say yes, the product already works, and the next step is getting seen by the right people, fast.',
      rows: [{ t: 'Founder-led startups and consumer brands with a product people love and no content engine yet' }, { t: 'Creators and personalities turning an audience into a business' }, { t: 'Local and multi-location businesses that need to be seen in their market' }, { t: 'Agencies whose clients want short-form video and have no one to make it' }] },
    { id: 'how', n: '04', label: 'HOW IT WORKS', col: '#FF2E88' },
    { id: 'proof', n: '05', label: 'PROOF', col: '#FF8A3D', title: 'Proof, built in public',
      body: 'We’re new, so we show our work instead of a logo wall. Every result we publish will be measured and signed off by the client.',
      rows: [{ t: 'Cliffhanger — our own microdrama studio and app, in public beta. The same playbook we sell, run on ourselves.' }, { t: 'Founding clients — a few first audits at a founding rate, in exchange for a named case study.' }, { t: 'Case studies will appear here as founding clients finish their audits.' }] },
    { id: 'check', n: '06', label: 'HEALTH CHECK', col: '#FFD23F' },
    { id: 'contact', n: '07', label: 'CONTACT', col: '#A78BFA', title: 'Let’s grow something.',
      body: 'Book a 30-minute call. We’ll ask about your goals, your numbers and what you’ve already tried, and tell you honestly whether we’re the right fit.',
      rows: [{ t: 'Book a 30-minute call', href: CALL }, { t: 'Take the free Growth & Content Health Check', href: CHECK }, { t: EMAIL, href: 'mailto:' + EMAIL }, { t: 'Add Clinton to your contacts', href: VCARD }, { t: 'linkedin.com/in/csiii', href: LINKEDIN }, { t: 'Know someone who needs this? Send them our way. Referrals are how we grow too.' }, { t: 'Port St. Lucie, FL · working with clients everywhere' }] }
  ];
  if (REVIEWS.length) APPS.push({ id: 'reviews', n: '08', label: 'REVIEWS', col: '#FFD23F' });

  var FIT_TRIGGERS = ['You just raised, launched or hired your first marketer', 'You’re posting every week and the numbers aren’t moving', 'You’re starting short-form video or vertical series', 'Your agency treats you like a small account'];
  var NOT_FIT = ['You want likes, not customers', 'No one owns the outcome on your side', 'You need the cheapest posting service in town'];
  var STEPS = [
    { t: 'First call', len: '30 min', d: 'Your goals, your numbers, what you’ve tried and what changes in the next two quarters.' },
    { t: 'Data look', len: '1 week', d: 'Read-only access to your analytics and channels. We come back with three specific observations.' },
    { t: 'Proposal', len: 'Same week', d: 'One page: the problem in your words, the scope, the price, and what a good outcome looks like.' },
    { t: 'Audit', len: '3 weeks', d: 'A 20-minute check-in every week, so the readout has no surprises.' },
    { t: 'Readout', len: '1 meeting', d: 'Ranked fixes, a 90-day test plan, and the next step on the last page.' },
    { t: 'Level up', len: 'Ongoing', d: 'Content Engine Sprint, production, a retainer or a fractional Head of Growth.' }
  ];

  var NOTIFS = [
    { from: 'NOW BOOKING · JANUARY 2027', text: 'Founding-client audits are open. Start at Level 1.', app: 'levels', n: '02', col: '#2EE6FF' },
    { from: 'FREE · 10 QUESTIONS', text: 'How healthy is your growth and content engine?', app: 'check', n: '06', col: '#FFD23F' },
    { from: 'OUR STUDIO · CLIFFHANGER', text: 'Our microdrama studio and app, in public beta.', app: 'proof', n: '05', col: '#FF8A3D' }
  ];
  REVIEWS.slice(0, 2).forEach(function (r, i) {
    var short = r.q.length > 90 ? r.q.slice(0, 87).replace(/\s+\S*$/, '') + '…' : r.q;
    NOTIFS.splice(1 + i * 2, 0, { from: '2P SAYS · ' + r.name.toUpperCase(), text: '“' + short + '”', app: 'reviews', n: '08', col: '#FFD23F' });
  });

  var LINES = [
    'Most brands don’t have a content problem. They have a system problem.',
    'A post that gets likes and no customers is a cost, not content.',
    'Find what works. Prove it. Then pour fuel on it.',
    'Every episode should end on a hook. So should your funnel.'
  ];

  var RESULTS = [
    { t: 'Your first four chords: G, C, D and Em', s: 'Beginner lesson' },
    { t: 'How to tune a guitar by ear', s: 'Video' },
    { t: 'Easy strumming patterns for absolute beginners', s: 'Guide' }
  ];

  /* ------------------------------------------------------------------ helpers */
  function chip(col, size) {
    return 'flex-shrink:0;display:flex;align-items:center;justify-content:center;width:' + size + 'px;height:' + size + 'px;border-radius:6px;font-family:var(--pixel);font-size:12px;background:' + col + ';color:#0B0614;box-shadow:0 0 14px ' + col + '66';
  }
  var ICON = {
    back: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
    up: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>',
    play: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4l14 8-14 8z"/></svg>',
    scan: '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8V6a2 2 0 0 1 2-2h2"/><path d="M16 4h2a2 2 0 0 1 2 2v2"/><path d="M20 16v2a2 2 0 0 1-2 2h-2"/><path d="M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M9 10v1"/><path d="M15 10v1"/><path d="M9.5 15a3.5 3.5 0 0 0 5 0"/></svg>',
    check: '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
    file: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>',
    mail: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    brief: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>',
    code: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 8l-4 4 4 4"/><path d="M16 8l4 4-4 4"/></svg>',
    check16: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/></svg>',
    cal: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/></svg>',
    save: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M19 8v6"/><path d="M16 11h6"/></svg>',
    search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F2EEF8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>'
  };

  /* ------------------------------------------------------------------ build */
  function cabHTML(c, i) {
    var x = c[0], y = c[1], w = c[2], h = c[3], dim = c[4];
    var col = NEON[i % NEON.length];
    var k = Math.max(6, Math.round(w * 0.07));
    var side = 'border-left:4px solid #241B3D;border-right:4px solid #241B3D;';
    return '<div class="abs" style="left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px;display:flex;flex-direction:column;filter:brightness(' + dim + ')">' +
      '<div style="height:13%;border-radius:8px 8px 0 0;background:' + col + ';box-shadow:0 0 22px ' + col + '88"></div>' +
      '<div style="height:40%;padding:9%;background:#1B1430;' + side + '"><div class="cab-screen" data-i="' + i + '" style="width:100%;height:100%;border-radius:6px;background-image:linear-gradient(rgba(0,0,0,.32) 50%,transparent 50%),radial-gradient(circle at 30% 40%,rgba(255,255,255,.75) 0 3px,transparent 4px),radial-gradient(circle at 68% 64%,rgba(11,6,20,.7) 0 5px,transparent 6px);background-size:100% 4px,100% 100%,100% 100%"></div></div>' +
      '<div style="height:9%;display:flex;align-items:center;gap:' + k + 'px;padding:0 14%;background:#2A2142;border-top:3px solid ' + col + '">' +
        '<span style="flex-shrink:0;width:' + k + 'px;height:' + k + 'px;border-radius:50%;background:#FF2E88"></span>' +
        '<span style="flex-shrink:0;width:' + k + 'px;height:' + k + 'px;border-radius:50%;background:#FFD23F"></span>' +
        '<span style="flex-shrink:0;width:' + k + 'px;height:' + k + 'px;border-radius:50%;background:#2EE6FF"></span></div>' +
      '<div style="flex-grow:1;display:flex;justify-content:center;padding-top:12%;background:#1B1430;' + side + '"><span style="width:28%;height:' + Math.round(h * 0.07) + 'px;border-radius:3px;background:#120C22;box-shadow:inset 0 0 0 2px #3A2E5A,0 0 10px rgba(255,90,31,.55)"></span></div>' +
      '</div>';
  }

  function figureHTML() {
    var p = function (l, t, w, h, r, bg, extra) { return '<span class="abs" style="left:' + l + 'px;top:' + t + 'px;width:' + w + 'px;height:' + h + 'px;border-radius:' + r + ';background-color:' + bg + ';' + (extra || '') + '"></span>'; };
    // long black afro with grey flecks
    var fleck = 'background-image:radial-gradient(circle,rgba(170,170,178,.75) 0 .8px,transparent 1.2px),radial-gradient(circle,rgba(120,120,128,.7) 0 .7px,transparent 1.1px),radial-gradient(circle,rgba(150,150,158,.6) 0 .7px,transparent 1.1px);background-size:17px 13px,11px 19px,23px 17px;background-position:3px 4px,8px 1px,14px 10px';
    // white / grey / infrared runner, drawn blocky, no logos
    var shoe = function (x, heelLeft) {
      return p(x, 283, 44, 19, '8px 9px 3px 3px', '#F4F2EC') +
        p(x, 293, 44, 6, '0', '#9AA0A8') +
        p(x - 1, 299, 46, 6, '2px', '#E4E1D8', 'box-shadow:inset 0 -2px 0 #FF3B5C') +
        p(heelLeft ? x + 2 : x + 30, 286, 12, 9, '3px', '#FF3B5C') +
        p(heelLeft ? x + 30 : x + 4, 286, 10, 4, '2px', '#FF3B5C') +
        p(heelLeft ? x + 4 : x + 31, 296, 8, 4, '1px', '#2A2F3A', 'box-shadow:0 0 0 1px #FF3B5C');
    };
    return p(24, -30, 112, 100, '48px 48px 34px 34px', '#141012', fleck + ';box-shadow:0 0 0 1.5px rgba(143,243,255,.35),0 -2px 18px rgba(46,230,255,.38)') +
      p(40, 184, 38, 104, '4px', '#22252D') + p(82, 184, 38, 104, '4px', '#22252D') +
      shoe(35, true) + shoe(81, false) +
      p(38, 170, 84, 16, '3px', '#16181E') +
      p(34, 72, 92, 104, '14px 14px 8px 8px', HOODIE) + p(60, 72, 40, 12, '0 0 12px 12px', 'rgba(0,0,0,.22)') +
      p(16, 80, 26, 72, '10px', HOODIE, 'transform:rotate(16deg)') + p(118, 80, 26, 72, '10px', HOODIE, 'transform:rotate(-16deg)') +
      p(34, 128, 44, 22, '10px', HOODIE, 'filter:brightness(.88)') + p(82, 128, 44, 22, '10px', HOODIE, 'filter:brightness(.88)') +
      p(66, 100, 28, 46, '6px', '#0D0F13', 'box-sizing:border-box;border:2px solid #2A2F3A;box-shadow:0 0 26px 6px ' + GLOW) +
      p(70, 104, 20, 38, '3px', '#2EE6FF') +
      p(56, 122, 16, 20, '6px', SKIN) + p(88, 122, 16, 20, '6px', SKIN) +
      p(50, 8, 60, 60, '12px', SKIN, 'box-shadow:inset 0 -16px 18px ' + GLOW) +
      p(46, -4, 68, 22, '14px 14px 6px 6px', '#141012', fleck) +
      p(66, 42, 7, 6, '3px', '#1A1410') + p(87, 42, 7, 6, '3px', '#1A1410') + p(73, 56, 14, 3, '2px', '#1A1410');
  }

  function guitarHTML() {
    return '<div class="abs" aria-hidden="true" style="left:166px;top:104px;width:74px;height:200px;transform:rotate(12deg);transform-origin:50% 100%">' +
      '<div class="abs" style="left:0;top:120px;width:74px;height:80px;border-radius:50%;background:#C7772F;border:3px solid #7A3F14"></div>' +
      '<div class="abs" style="left:9px;top:86px;width:56px;height:54px;border-radius:50%;background:#C7772F;border:3px solid #7A3F14"></div>' +
      '<div class="abs" style="left:12px;top:112px;width:50px;height:26px;background:#C7772F"></div>' +
      '<div class="abs" style="left:27px;top:118px;width:20px;height:20px;border-radius:50%;background:#1A0F08"></div>' +
      '<div class="abs" style="left:31px;top:0;width:12px;height:120px;background-color:#3B2414;background-image:repeating-linear-gradient(180deg,transparent 0 14px,#C9B48A 14px 15px)"></div>' +
      '<div class="abs" style="left:27px;top:-16px;width:20px;height:22px;border-radius:4px;background:#2A190D"></div>' +
      '<div class="abs" style="left:25px;top:168px;width:24px;height:5px;background:#3B2414"></div>' +
      '<div class="abs" style="left:32px;top:-6px;width:10px;height:176px;background:repeating-linear-gradient(90deg,rgba(232,225,207,.85) 0 1px,transparent 1px 2px)"></div>' +
      '</div>';
  }

  function build() {
    var mobile = device === 'mobile';
    var g = L;
    stage.style.width = g.W + 'px';
    stage.style.height = g.H + 'px';
    var h = [];

    // world
    h.push('<div class="abs t-world" data-el="world" aria-hidden="true" style="inset:0;transform-origin:' + g.origin + '">');
    h.push('<div class="abs" style="left:0;top:0;width:100%;height:' + g.floorY + 'px;background-color:#3B2D66;background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 2px,transparent 2px 96px)"></div>');
    // soft spotlight on the wall behind the head so the hair reads as a silhouette
    h.push('<div class="abs" style="left:' + (g.figX - 90) + 'px;top:' + (g.figY - 150) + 'px;width:340px;height:340px;border-radius:50%;background:radial-gradient(circle,rgba(255,226,150,.30) 0,rgba(255,170,190,.14) 38%,transparent 68%)"></div>');
    h.push('<div class="abs" style="left:0;top:46px;width:100%;height:3px;background:#FF2E88;box-shadow:0 0 14px 2px rgba(255,46,136,.7)"></div>');
    h.push('<div class="abs" style="left:0;top:56px;width:100%;height:3px;background:#2EE6FF;box-shadow:0 0 14px 2px rgba(46,230,255,.6)"></div>');
    h.push('<div class="abs" style="left:0;top:' + g.floorY + 'px;width:100%;height:400px;background-color:#0E0A24;background-image:radial-gradient(circle at 20% 30%,#2EE6FF 0 3px,transparent 4px),radial-gradient(circle at 70% 60%,#FF2E88 0 3px,transparent 4px),radial-gradient(circle at 45% 85%,#FFD23F 0 2px,transparent 3px),radial-gradient(circle at 85% 15%,#8B5CFF 0 4px,transparent 5px);background-size:64px 64px"></div>');
    h.push('<div class="abs" style="left:0;top:' + g.floorY + 'px;width:100%;height:3px;background:#2A1F4A"></div>');
    g.cabs.forEach(function (c, i) { h.push(cabHTML(c, i)); });
    h.push('</div>');

    // figure
    h.push('<div class="abs t-fig" data-el="fig" style="inset:0;transform-origin:' + g.origin + '">');
    h.push('<div class="abs" style="left:' + g.figX + 'px;top:' + g.figY + 'px;width:160px;height:320px">');
    h.push('<div class="abs" aria-hidden="true" style="left:16px;top:296px;width:128px;height:16px;border-radius:50%;background:rgba(0,0,0,.55)"></div>');
    h.push('<div class="abs" aria-hidden="true" style="left:36px;top:80px;width:90px;height:90px;border-radius:50%;background:' + ACCENT + ';opacity:.25;filter:blur(14px)"></div>');
    if (UC) {
      h.push('<div class="abs" role="img" aria-label="Clinton, looking up guitar lessons on his phone" style="left:0;top:0;width:160px;height:312px">' + figureHTML() + '</div>');
      h.push(guitarHTML());
    } else {
      h.push('<button type="button" class="abs" data-act="enter" aria-label="Press start: see it through my eyes" style="left:0;top:0;width:160px;height:312px;padding:0;border:0;background:transparent;cursor:pointer">' + figureHTML() + '</button>');
    }
    h.push('</div></div>');

    // crop
    h.push('<div class="abs t-vig" data-el="vig" aria-hidden="true" style="inset:0;pointer-events:none"></div>');
    h.push('<div class="abs t-bar" data-el="barTop" aria-hidden="true" style="left:0;top:0;width:100%;height:0;background:#05030A"></div>');
    h.push('<div class="abs t-bar" data-el="barBot" aria-hidden="true" style="left:0;bottom:0;width:100%;height:0;background:#05030A"></div>');

    // POV
    if (!UC) {
      h.push('<div class="abs t-pov" data-el="pov" style="inset:0">');
      if (!mobile) {
        h.push('<div class="abs t-fade" data-el="mono" style="left:80px;top:190px;width:330px;display:flex;flex-direction:column;gap:16px" aria-live="off">');
        h.push('<div class="px" style="font-size:10px;letter-spacing:.06em;color:#2EE6FF">P1 THOUGHTS</div>');
        LINES.forEach(function (t, i) { h.push('<div class="line" data-line="' + i + '" style="line-height:1.3">' + esc(t) + '</div>'); });
        h.push('</div>');
      }
      // hands + phone move together when the phone tilts to project
      h.push('<div class="abs t-hold" data-el="hold" style="inset:0;transform-origin:' + (mobile ? '195px 64px' : '640px 420px') + '">');
      if (!mobile) {
        h.push('<div class="abs" aria-hidden="true" style="left:350px;top:650px;width:160px;height:240px;border-radius:30px;background:' + HOODIE + ';transform:rotate(14deg)"></div>');
        h.push('<div class="abs" aria-hidden="true" style="left:770px;top:650px;width:160px;height:240px;border-radius:30px;background:' + HOODIE + ';transform:rotate(-14deg)"></div>');
        h.push('<div class="abs" aria-hidden="true" style="left:424px;top:470px;width:84px;height:230px;border-radius:26px;background:' + SKIN + ';transform:rotate(-6deg)"></div>');
        h.push('<div class="abs" aria-hidden="true" style="left:772px;top:470px;width:84px;height:230px;border-radius:26px;background:' + SKIN + ';transform:rotate(6deg)"></div>');
      }
      var frame = mobile
        ? 'left:12px;top:64px;width:366px;height:700px;border-radius:34px;box-shadow:0 20px 60px rgba(0,0,0,.5),0 0 90px ' + GLOW
        : 'left:480px;top:64px;width:320px;height:700px;padding:12px;border-radius:46px;background:#0D0F13;box-shadow:0 0 0 2px #2A2F3A,0 30px 80px rgba(0,0,0,.6),0 0 140px ' + GLOW;
      h.push('<div class="abs" style="' + frame + '">');
      h.push('<section aria-label="My phone" data-el="screen" tabindex="-1" style="position:relative;width:100%;height:100%;border-radius:34px;border:2px solid #2A1F4A;background:#0B0614;color:#F2EEF8;overflow:hidden;display:flex;flex-direction:column;outline:none">');
      h.push('<div class="abs" aria-hidden="true" style="left:calc(50% - 5px);top:12px;width:10px;height:10px;border-radius:50%;background:#2A1F4A"></div>');
      h.push('<div data-el="screenBody" style="flex-grow:1;min-height:0;display:flex;flex-direction:column"></div>');
      h.push('<div aria-hidden="true" style="align-self:center;flex-shrink:0;width:110px;height:5px;margin:8px 0 10px;border-radius:3px;background:#F2EEF8;opacity:.6"></div>');
      h.push('<div class="abs" aria-hidden="true" style="inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 1px,transparent 1px 3px)"></div>');
      h.push('</section></div>');
      if (!mobile) {
        h.push('<div class="abs" aria-hidden="true" style="left:462px;top:548px;width:34px;height:92px;border-radius:17px;background:' + SKIN + ';transform:rotate(-22deg);box-shadow:-2px 4px 10px rgba(0,0,0,.25)"></div>');
        h.push('<div class="abs" aria-hidden="true" style="left:784px;top:548px;width:34px;height:92px;border-radius:17px;background:' + SKIN + ';transform:rotate(22deg);box-shadow:2px 4px 10px rgba(0,0,0,.25)"></div>');
      }
      h.push('</div>'); // end hold

      // hologram: light beam + projected panel
      var beam = mobile
        ? 'left:30px;top:414px;width:330px;height:48px;clip-path:polygon(0% 0%,100% 0%,74% 100%,26% 100%);background:linear-gradient(0deg,rgba(46,230,255,.55),rgba(46,230,255,.04))'
        : 'left:536px;top:60px;width:120px;height:690px;clip-path:polygon(0% 14%,100% 0%,100% 100%,0% 84%);background:linear-gradient(90deg,rgba(46,230,255,.5),rgba(46,230,255,.04))';
      h.push('<div class="abs beam" data-el="beam" aria-hidden="true" style="' + beam + '"></div>');
      var panel = mobile
        ? 'left:14px;top:62px;width:362px;height:352px;transform-origin:50% 100%'
        : 'left:650px;top:72px;width:570px;height:664px;transform-origin:0% 50%';
      h.push('<section class="holo" data-el="holo" tabindex="-1" aria-label="Hologram" style="' + panel + '"><div class="holo-inner">' +
        '<div style="flex-shrink:0;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 10px 10px 16px;border-bottom:1px solid rgba(46,230,255,.35)">' +
        '<span class="px holo-label" data-el="holoLabel" style="font-size:10px;color:#8FF3FF"></span>' +
        '<button type="button" data-act="home" style="display:flex;align-items:center;gap:6px;min-height:40px;padding:0 12px;border-radius:6px;border:1px solid rgba(143,243,255,.6);background:rgba(46,230,255,.08);color:#CFFBFF;font-family:var(--pixel);font-size:9px;cursor:pointer">✕ CLOSE</button></div>' +
        '<div class="holo-content" data-el="holoBody"></div>' +
        '<div class="holo-scan" aria-hidden="true"></div><div class="holo-sweep" aria-hidden="true"></div>' +
        '</div><div class="holo-base" aria-hidden="true"></div></section>');
      var look = 'display:flex;align-items:center;gap:8px;min-height:46px;padding:0 16px 0 12px;border-radius:6px;border:2px solid rgba(242,238,248,.5);background:rgba(11,6,20,.7);color:#F2EEF8;font-family:var(--pixel);font-size:10px;cursor:pointer;' + (mobile ? 'right:12px;top:10px' : 'left:80px;top:640px');
      h.push('<button type="button" class="abs" data-act="exit" style="' + look + '">' + ICON.up + 'LOOK UP</button>');
      if (mobile) h.push('<div class="abs t-fade" data-el="caption" style="left:24px;top:776px;width:342px;font-size:14px;line-height:1.4;font-weight:600;color:#F2EEF8"></div>');
      h.push('</div>');
    }

    // HUDs
    var chipBox = 'display:flex;align-items:center;gap:10px;min-height:32px;padding:0 14px;border-radius:6px;border:2px solid rgba(57,255,136,.5);background:rgba(11,6,20,.7);font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#F2EEF8';
    var dot = '<span aria-hidden="true" style="width:8px;height:8px;background:#39FF88;box-shadow:0 0 8px #39FF88"></span>';
    var startBtn = function (size) {
      return '<button type="button" data-act="enter" style="display:flex;align-items:center;gap:10px;min-height:52px;padding:0 26px;border-radius:6px;border:0;background:' + ACCENT + ';color:#0B0614;font-family:var(--pixel);font-size:' + size + 'px;cursor:pointer;box-shadow:inset 0 -5px 0 rgba(0,0,0,.25),0 0 24px ' + GLOW + '">' + ICON.play + 'PRESS START</button>';
    };
    var sideBtn = function (href, label, col, icon, ext, size, h) {
      return '<a href="' + href + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + ' style="display:flex;align-items:center;justify-content:center;gap:8px;min-height:' + h + 'px;padding:0 16px;border-radius:6px;border:2px solid ' + col + ';background:rgba(11,6,20,.75);color:' + col + ';font-family:var(--pixel);font-size:' + size + 'px;text-decoration:none;box-shadow:0 0 14px ' + col + '33">' + icon + '<span style="color:#F2EEF8">' + label + '</span></a>';
    };
    if (!UC && !mobile) {
      h.push('<div class="abs t-fade" data-el="hud" style="left:0;top:70px;width:1280px;display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center">');
      h.push('<div style="' + chipBox + ';font-size:13px">' + dot + 'Now booking founding clients · January 2027</div>');
      h.push('<h1 class="px" style="margin:0;font-size:34px;line-height:1.3;color:#FF7AB8;text-shadow:0 0 6px rgba(255,46,136,.9),0 0 24px rgba(255,46,136,.6)">LEVEL UP YOUR GROWTH</h1>');
      h.push('<p style="margin:0;max-width:600px;font-size:17px;line-height:1.45;color:#D9D2EA">' + esc(COMPANY) + ' is a hypergrowth and content studio founded by Clinton Strickland. Press start to step inside and see how we play.</p>');
      h.push('<div style="display:flex;align-items:center;gap:14px">' + startBtn(13) + sideBtn(CALL, 'BOOK A CALL', '#2EE6FF', ICON.cal, CALL_EXT, 11, 52) + sideBtn(CHECK, 'FREE HEALTH CHECK', '#FF2E88', ICON.check16, false, 11, 52) + '</div>');
      h.push('</div>');
    }
    if (!UC && mobile) {
      h.push('<div class="abs t-fade" data-el="hud" style="left:24px;top:74px;width:342px;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center">');
      h.push('<div style="' + chipBox + ';font-size:12px;min-height:30px;padding:0 12px">' + dot + 'Now booking · Jan 2027</div>');
      h.push('<h1 class="px" style="margin:0;font-size:24px;line-height:1.45;color:#FF7AB8;text-shadow:0 0 6px rgba(255,46,136,.9),0 0 20px rgba(255,46,136,.6)">LEVEL UP<br>YOUR GROWTH</h1>');
      h.push('<p style="margin:0;font-size:15px;line-height:1.4;color:#D9D2EA">That’s me, Clinton, on my phone in the arcade. Tap me or swipe up to see what I see.</p>');
      h.push(startBtn(12));
      h.push('<div style="display:flex;gap:10px;width:100%">' + sideBtn(CALL, 'BOOK CALL', '#2EE6FF', ICON.cal, CALL_EXT, 9, 44).replace('display:flex', 'flex:1 1 0;display:flex') + sideBtn(CHECK, 'HEALTH CHECK', '#FF2E88', ICON.check16, false, 9, 44).replace('display:flex', 'flex:1 1 0;display:flex') + '</div>');
      h.push('</div>');
    }
    if (UC) {
      var contactBtns = function (size, stretch) {
        var f = stretch ? 'flex:1 1 0;justify-content:center;' : '';
        return '<a href="' + LINKEDIN + '" target="_blank" rel="noopener" style="' + f + 'display:flex;align-items:center;min-height:48px;padding:0 20px;border-radius:6px;background:' + ACCENT + ';color:#0B0614;font-family:var(--pixel);font-size:' + size + 'px;text-decoration:none;box-shadow:inset 0 -4px 0 rgba(0,0,0,.25)">LINKEDIN</a>' +
          '<a href="mailto:' + EMAIL + '" style="' + f + 'display:flex;align-items:center;min-height:48px;padding:0 20px;border-radius:6px;border:2px solid #F2EEF8;color:#F2EEF8;font-family:var(--pixel);font-size:' + size + 'px;text-decoration:none">EMAIL</a>';
      };
      if (!mobile) {
        h.push('<div class="abs" style="left:80px;top:104px;width:460px;display:flex;flex-direction:column;align-items:flex-start;gap:18px">');
        h.push('<div class="px" style="font-size:10px;color:#2EE6FF">STAGE 2 · COMING SOON</div>');
        h.push('<h1 class="px" style="margin:0;font-size:34px;line-height:1.35;color:#FFD23F;text-shadow:0 0 6px rgba(255,210,63,.8),0 0 26px rgba(255,210,63,.45)">UNDER<br>CONSTRUCTION</h1>');
        h.push('<p style="margin:0;font-size:18px;line-height:1.45;color:#D9D2EA">The site’s getting a new level. While it loads, I’m teaching myself guitar.</p>');
        h.push('<div style="display:flex;flex-direction:column;gap:8px;width:360px"><div class="px" style="display:flex;justify-content:space-between;font-size:10px;color:#A79FBF"><span>LOADING NEXT LEVEL</span><span>60%</span></div><div style="height:24px;padding:3px;border:3px solid #F2EEF8"><div style="width:60%;height:100%;background:repeating-linear-gradient(90deg,' + ACCENT + ' 0 14px,transparent 14px 18px)"></div></div></div>');
        h.push('<div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-top:4px"><span style="font-size:15px;font-weight:600;color:#D9D2EA">Need me now?</span>' + contactBtns(11) + '</div>');
        h.push('</div>');
        h.push('<div class="abs" aria-hidden="true" style="left:790px;top:470px;width:135px;height:0;border-top:2px dashed #2EE6FF;transform:rotate(-42deg);transform-origin:0 0"></div>');
      } else {
        h.push('<div class="abs" style="left:24px;top:78px;width:342px;display:flex;flex-direction:column;align-items:flex-start;gap:12px">');
        h.push('<div class="px" style="font-size:10px;color:#2EE6FF">STAGE 2 · COMING SOON</div>');
        h.push('<h1 class="px" style="margin:0;font-size:18px;line-height:1.4;color:#FFD23F;text-shadow:0 0 6px rgba(255,210,63,.8),0 0 20px rgba(255,210,63,.45)">UNDER CONSTRUCTION</h1>');
        h.push('<p style="margin:0;font-size:15px;line-height:1.4;color:#D9D2EA">New level loading. Meanwhile, I’m learning guitar.</p>');
        h.push('</div>');
        h.push('<div class="abs" style="left:24px;top:784px;width:342px;display:flex;gap:10px">' + contactBtns(10, true) + '</div>');
      }
      var card = mobile
        ? 'left:24px;top:174px;width:342px;gap:8px;padding:12px 14px;border-radius:22px;box-shadow:0 0 50px rgba(46,230,255,.16)'
        : 'left:880px;top:120px;width:340px;gap:12px;padding:16px;border-radius:28px;box-shadow:0 0 0 2px #000,0 0 60px rgba(46,230,255,.18)';
      h.push('<div class="abs" style="' + card + ';display:flex;flex-direction:column;border:3px solid #2A1F4A;background:#120B22">');
      h.push('<div class="px" style="font-size:10px;color:#2EE6FF">ZOOM ×8 · MY SCREEN</div>');
      h.push('<div style="display:flex;align-items:center;gap:8px;min-height:44px;padding:0 12px;border-radius:10px;border:2px solid ' + ACCENT + ';background:#16102A">' + ICON.search +
        '<span class="query mono" data-el="query" style="display:inline-block;overflow:hidden;white-space:nowrap;width:0;font-size:' + (mobile ? 12 : 11) + 'px;color:#F2EEF8">how to play guitar for beginners</span><span aria-hidden="true" style="width:2px;height:18px;background:' + ACCENT + '"></span></div>');
      h.push('<div class="results" data-el="results" style="display:flex;flex-direction:column;opacity:0">');
      RESULTS.forEach(function (r) {
        h.push('<div style="display:flex;flex-direction:column;gap:3px;padding:' + (mobile ? 7 : 10) + 'px 0;border-top:2px dashed #2A1F4A"><span style="font-size:' + (mobile ? 13 : 14) + 'px;font-weight:700;line-height:1.3">' + esc(r.t) + '</span><span class="mono" style="font-size:11px;color:#A79FBF">' + esc(r.s) + '</span></div>');
      });
      h.push('</div></div>');
      h.push('<div class="abs" aria-hidden="true" style="left:0;top:0;width:100%;height:10px;background:repeating-linear-gradient(45deg,#FFD23F 0 14px,#0B0614 14px 28px)"></div>');
      h.push('<div class="abs" aria-hidden="true" style="left:0;bottom:0;width:100%;height:10px;background:repeating-linear-gradient(45deg,#FFD23F 0 14px,#0B0614 14px 28px)"></div>');
    }

    // level select board: the offer ladder, with prices
    var lvPrice = function (l) { return l.price.indexOf('[') === 0 ? 'Price on call' : l.price; };
    if (!mobile) {
      h.push('<div class="abs t-fade" data-el="scores" style="left:120px;top:676px;width:1040px;display:flex;flex-direction:column;gap:10px;padding:12px 18px;border-radius:10px;border:2px solid #2A1F4A;background:rgba(11,6,20,.88)">');
      h.push('<h2 class="px" style="margin:0;font-size:10px;color:#FFD23F">SELECT YOUR LEVEL</h2><ol style="list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px">');
      LEVELS.forEach(function (l) {
        h.push('<li style="display:flex;flex-direction:column;gap:4px"><span class="px" style="font-size:10px;color:' + l.col + '">' + l.lv + '</span><span style="font-size:15px;font-weight:800;line-height:1.2">' + esc(l.name) + '</span><span class="mono" style="font-size:11px;line-height:1.35;color:#A79FBF">' + esc(lvPrice(l)) + (l.term ? ' \u00b7 ' + esc(l.term) : '') + '</span></li>');
      });
      h.push('</ol></div>');
    } else if (!UC) {
      h.push('<div class="abs t-fade hscroll" data-el="scores" tabindex="0" role="region" aria-label="Levels and prices, scroll sideways" style="left:0;top:722px;width:390px;display:flex;gap:10px;padding:0 24px">');
      h.push('<h2 class="sr-only">Select your level</h2>');
      LEVELS.forEach(function (l) {
        h.push('<div style="flex-shrink:0;width:160px;display:flex;flex-direction:column;gap:6px;padding:12px;border-radius:10px;border:2px solid #2A1F4A;background:rgba(11,6,20,.9)"><span class="px" style="font-size:10px;color:' + l.col + '">' + l.lv + ' \u00b7 ' + esc(l.short.toUpperCase()) + '</span><span style="font-size:14px;font-weight:800;line-height:1.2">' + esc(l.name) + '</span><span class="mono" style="font-size:11px;line-height:1.35;color:#A79FBF">' + esc(lvPrice(l)) + '</span></div>');
      });
      h.push('<div style="flex-shrink:0;width:1px"></div></div>');
    }

    // chrome: placed FIRST in the DOM so "Skip intro" is the first stop for keyboard and screen-reader users
    var chrome = [];
    chrome.push('<a href="' + RESUME + '" class="abs px t-fade" data-el="skip" aria-label="Skip intro: read the plain version of the site" style="z-index:6;right:' + (mobile ? 14 : 80) + 'px;top:' + (mobile ? 14 : 16) + 'px;display:flex;align-items:center;min-height:32px;padding:0 10px;border-radius:6px;border:2px solid rgba(242,238,248,.6);background:rgba(11,6,20,.75);color:#F2EEF8;font-size:9px;text-decoration:none">SKIP INTRO \u203a</a>');
    chrome.push('<button type="button" class="abs px" data-act="motion" data-el="motion" aria-pressed="false" aria-label="Pause animations" style="z-index:6;right:' + (mobile ? 146 : 250) + 'px;top:' + (mobile ? 14 : 16) + 'px;font-family:var(--pixel);display:flex;align-items:center;justify-content:center;gap:8px;min-width:32px;min-height:32px;padding:0 ' + (mobile ? 0 : 10) + 'px;border-radius:6px;border:2px solid rgba(242,238,248,.6);background:rgba(11,6,20,.75);color:#F2EEF8;font-size:9px;cursor:pointer"><span data-el="motionIcon" aria-hidden="true"></span>' + (mobile ? '' : '<span data-el="motionText" aria-hidden="true"></span>') + '</button>');
    chrome.push('<a href="./" class="abs px" style="z-index:6;left:' + (mobile ? 20 : 80) + 'px;top:24px;font-size:' + (mobile ? 10 : 11) + 'px;color:#F2EEF8;text-decoration:none;text-shadow:0 0 8px rgba(242,238,248,.4)">CLINTON STRICKLAND</a>');
    if (!mobile) chrome.push('<div class="abs px" data-el="where" aria-hidden="true" style="z-index:6;right:430px;top:26px;font-size:10px;color:#A79FBF"></div>');
    h.unshift(chrome.join(''));

    stage.innerHTML = h.join('');
    els = {};
    Array.prototype.forEach.call(stage.querySelectorAll('[data-el]'), function (n) { els[n.getAttribute('data-el')] = n; });
    els.cabScreens = stage.querySelectorAll('.cab-screen');
    els.lines = stage.querySelectorAll('[data-line]');
    screenKey = null;
    holoKey = null;
    update();
  }

  /* ------------------------------------------------------------------ phone screen */
  function backBtn() {
    return '<button type="button" data-act="home" style="align-self:flex-start;display:flex;align-items:center;gap:8px;min-height:44px;padding:0 16px 0 10px;border-radius:8px;border:2px solid #2A1F4A;background:#16102A;color:#F2EEF8;font-family:var(--pixel);font-size:10px;cursor:pointer">' + ICON.back + 'BACK</button>';
  }
  function dockHTML() {
    var item = function (href, label, col, icon, ext) {
      return '<a href="' + href + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + ' style="display:flex;flex-direction:column;align-items:center;gap:4px;min-height:54px;color:#F2EEF8;text-decoration:none;font-size:10.5px;font-weight:600;white-space:nowrap"><span style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;background:#16102A;border:2px solid ' + col + ';color:' + col + '">' + icon + '</span>' + label + '</a>';
    };
    return '<nav aria-label="Quick links" style="flex-shrink:0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;padding:10px 10px 0;border-top:2px solid #2A1F4A">' +
      item(CALL, 'Call', '#2EE6FF', ICON.cal, CALL_EXT) + item(VCARD, 'Save', '#FF2E88', ICON.save) +
      item(CHECK, 'Check', '#FFD23F', ICON.check16) + item('mailto:' + EMAIL, 'Email', '#A78BFA', ICON.mail) +
      item(LINKEDIN, 'LinkedIn', '#39FF88', ICON.brief, true) + '</nav>';
  }
  function lockHTML(scan) {
    var ok = scan === 'ok';
    var box = 'display:flex;align-items:center;justify-content:center;width:88px;height:88px;border-radius:10px;' + (ok ? 'background:' + ACCENT + ';color:#0B0614;border:3px solid ' + ACCENT + ';box-shadow:0 0 30px ' + GLOW : 'color:' + ACCENT + ';border:3px dashed ' + ACCENT);
    return '<button type="button" data-act="skiplock" aria-label="Skip to the menu" style="flex-grow:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;padding:24px;border:0;background:#0B0614;color:#F2EEF8;cursor:pointer">' +
      '<span style="' + box + '">' + (ok ? ICON.check : ICON.scan) + '</span>' +
      '<span class="px" role="status" style="font-size:14px;line-height:1.7;text-align:center;color:' + ACCENT + '">' + (ok ? 'WELCOME TO THE STUDIO' : 'SCANNING PLAYER…') + '</span>' +
      '<span class="px" style="font-size:10px;color:#A79FBF">' + (ok ? 'PLAYER 1 READY' : 'TAP TO SKIP') + '</span></button>';
  }
  function homeHTML() {
    var nf = NOTIFS[st.tick % NOTIFS.length];
    var h = '<div class="scroll" style="padding:36px 18px 14px;display:flex;flex-direction:column;gap:14px">' +
      '<div style="display:flex;flex-direction:column;gap:8px"><div class="px" style="font-size:10px;color:#2EE6FF">PLAYER 1</div>' +
      '<h2 style="margin:0;font-size:28px;font-weight:800;line-height:1;letter-spacing:-.02em">Clinton Strickland</h2>' +
      '<div style="font-size:13px;line-height:1.35;color:#A79FBF">Founder · ' + esc(COMPANY) + ' · hypergrowth &amp; content studio</div></div>' +
      '<button type="button" data-act="open" data-app="' + nf.app + '" style="display:flex;gap:12px;align-items:center;width:100%;padding:12px;border-radius:10px;border:2px solid ' + nf.col + ';background:#120B22;text-align:left;cursor:pointer;box-shadow:0 0 18px ' + nf.col + '33">' +
      '<span style="' + chip(nf.col, 38) + '">' + nf.n + '</span><span style="display:flex;flex-direction:column;gap:6px;min-width:0"><span class="px" style="font-size:10px;line-height:1.4;color:' + nf.col + '">' + esc(nf.from) + '</span><span style="font-size:14px;font-weight:600;line-height:1.3;color:#F2EEF8">' + esc(nf.text) + '</span></span></button>' +
      '<div class="px" style="font-size:10px;color:#A79FBF">SELECT STAGE</div>' +
      '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">';
    APPS.forEach(function (a) {
      h += '<button type="button" data-act="open" data-app="' + a.id + '" style="display:flex;flex-direction:column;align-items:flex-start;gap:12px;min-height:92px;padding:12px;border-radius:10px;border:2px solid ' + a.col + '66;background:#16102A;text-align:left;cursor:pointer">' +
        '<span style="' + chip(a.col, 36) + '">' + a.n + '</span><span class="px" style="font-size:11px;line-height:1.3;color:#F2EEF8">' + a.label + '</span></button>';
    });
    return h + '</div></div>';
  }
  function bar(label, pct, col, strong, labelBg) {
    return '<div style="display:flex;flex-direction:column;gap:4px"><span style="position:relative;align-self:flex-start;padding-right:4px;background:' + (labelBg || 'transparent') + ';font-size:12px;' + (strong ? 'font-weight:700;color:#F2EEF8' : 'color:#A79FBF') + '">' + label + '</span>' +
      '<div style="height:10px;background:#2A2340"><div style="width:' + pct + '%;height:10px;background:' + col + (strong ? ';box-shadow:0 0 10px ' + col + '80' : '') + '"></div></div></div>';
  }
  function remoteHTML() {
    var cur = APPS.filter(function (a) { return a.id === st.app; })[0];
    var h = '<div class="scroll" style="padding:32px 16px 12px;display:flex;flex-direction:column;gap:12px">' +
      '<div class="px" style="font-size:10px;color:#2EE6FF">▲ PROJECTING</div>' +
      '<div style="font-size:22px;font-weight:800;line-height:1.1">' + esc(cur.n + ' · ' + cur.label.charAt(0) + cur.label.slice(1).toLowerCase()) + '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">';
    APPS.forEach(function (a) {
      var on = a.id === st.app;
      h += '<button type="button" data-act="open" data-app="' + a.id + '"' + (on ? ' aria-current="true"' : '') + ' style="display:flex;flex-direction:column;align-items:flex-start;gap:6px;min-height:54px;padding:6px 8px;border-radius:8px;border:2px solid ' + (on ? a.col : a.col + '55') + ';background:' + (on ? a.col + '26' : '#16102A') + ';text-align:left;cursor:pointer">' +
        '<span style="' + chip(a.col, 22).replace('font-size:12px', 'font-size:9px') + '">' + a.n + '</span><span class="px" style="font-size:8px;line-height:1.3;color:#F2EEF8">' + a.label + '</span></button>';
    });
    return h + '</div><button type="button" data-act="home" style="display:flex;align-items:center;justify-content:center;gap:8px;min-height:44px;border-radius:8px;border:2px solid #2A1F4A;background:#16102A;color:#F2EEF8;font-family:var(--pixel);font-size:10px;cursor:pointer">■ STOP PROJECTION</button></div>';
  }
  function holoWrap(n, label, col, title, intro) {
    return '<div class="scroll" style="padding:18px 20px 24px;display:flex;flex-direction:column;gap:14px">' +
      '<div class="px" style="font-size:10px;color:' + col + '">' + n + ' · ' + label + '</div>' +
      '<h2 class="px" style="margin:0;font-size:18px;line-height:1.5;color:' + col + '">' + title + '</h2>' +
      (intro ? '<p style="margin:0;font-size:14px;line-height:1.45;color:#D9D2EA">' + intro + '</p>' : '');
  }
  function priceHTML(p) {
    return p.indexOf('[') === 0 ? '<span style="color:#FFB08A">' + esc(p) + '</span>' : esc(p);
  }
  function levelsHTML() {
    var h = holoWrap('02', 'LEVELS', '#2EE6FF', 'SELECT YOUR LEVEL', 'Everyone starts at Level 1. Every level after it is scoped from what the audit finds.') + '<ol style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px">';
    LEVELS.forEach(function (l) {
      h += '<li style="display:flex;flex-direction:column;gap:8px;padding:14px;border-radius:12px;background:#16102A;border:2px solid #2A1F4A">' +
        '<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px"><span class="px" style="font-size:10px;color:' + l.col + '">' + l.lv + ' · ' + l.tag + '</span><span style="font-size:15px;font-weight:800">' + priceHTML(l.price) + '</span></div>' +
        '<span style="font-size:18px;font-weight:800;line-height:1.2">' + esc(l.name) + '</span>' +
        '<span class="mono" style="font-size:12px;color:#A79FBF">' + esc(l.len) + '</span>' +
        '<span style="font-size:14px;line-height:1.45;color:#D9D2EA">' + esc(l.d) + '</span></li>';
    });
    return h + '</ol><a href="' + CALL + '"' + (CALL_EXT ? ' target="_blank" rel="noopener"' : '') + ' style="align-self:flex-start;display:flex;align-items:center;min-height:44px;padding:0 16px;border-radius:6px;background:#FFD23F;color:#0B0614;font-family:var(--pixel);font-size:10px;text-decoration:none">▶ BOOK A CALL</a></div>';
  }
  function howHTML() {
    var h = holoWrap('04', 'HOW IT WORKS', '#FF2E88', 'HOW A GAME GOES', 'Six steps from first call to scaling what works.') + '<ol style="list-style:none;margin:0;padding:0">';
    STEPS.forEach(function (s, i) {
      h += '<li style="display:grid;grid-template-columns:40px 1fr;gap:2px 12px;padding:12px 0;border-top:2px dashed #2A1F4A"><span class="px" aria-hidden="true" style="grid-row:span 2;font-size:14px;color:#FF2E88">0' + (i + 1) + '</span>' +
        '<span style="font-size:16px;font-weight:800">' + esc(s.t) + ' <span class="mono" style="font-size:12px;font-weight:500;color:#A79FBF">· ' + esc(s.len) + '</span></span>' +
        '<span style="font-size:14px;line-height:1.45;color:#D9D2EA">' + esc(s.d) + '</span></li>';
    });
    return h + '</ol></div>';
  }
  function fitHTML(a) {
    var list = function (title, items, col) {
      return '<div class="px" style="font-size:10px;color:' + col + ';margin-top:6px">' + title + '</div><ul style="margin:0;padding-left:18px">' + items.map(function (t) { return '<li style="font-size:14px;line-height:1.45;color:#D9D2EA;margin:4px 0">' + esc(t) + '</li>'; }).join('') + '</ul>';
    };
    var g = genericHTML(a, true);
    return g.replace(/<\/ul><\/div>$/, '</ul>' + list('GOOD TIME TO CALL', FIT_TRIGGERS, '#39FF88') + list('NOT A FIT', NOT_FIT, '#FFB08A') + '</div>');
  }
  function checkHTML() {
    return holoWrap('06', 'HEALTH CHECK', '#FFD23F', 'FREE HEALTH CHECK', 'Ten quick questions about your strategy, content, distribution, measurement and conversion. You get a score, your weakest area and the level we’d start you on. Your answers stay on your device.') +
      '<a href="' + CHECK + '" style="align-self:flex-start;display:flex;align-items:center;min-height:48px;padding:0 18px;border-radius:6px;background:#FFD23F;color:#0B0614;font-family:var(--pixel);font-size:11px;text-decoration:none">▶ START THE CHECK</a>' +
      '<p class="mono" style="margin:0;font-size:12px;color:#A79FBF">About 2 minutes · no sign-up</p></div>';
  }
  function reviewsHTML() {
    var h = '<div class="scroll" style="padding:18px 20px 24px;display:flex;flex-direction:column;gap:14px">' +
      '<div class="px" style="font-size:10px;color:#FFD23F">07 · REVIEWS</div>' +
      '<h2 class="px" style="margin:0;font-size:18px;line-height:1.5;color:#FFD23F">2P SAYS</h2>' +
      '<p style="margin:0;font-size:14px;line-height:1.45;color:#D9D2EA">From people I’ve built with.</p>';
    REVIEWS.forEach(function (r) {
      h += '<figure style="margin:0;display:flex;flex-direction:column;gap:10px;padding:16px;border-radius:14px;background:#16102A;border:2px solid #2A1F4A">' +
        '<blockquote style="margin:0;font-size:17px;font-weight:600;line-height:1.45;color:#F2EEF8">“' + esc(r.q) + '”</blockquote>' +
        '<figcaption style="display:flex;flex-direction:column;gap:2px"><span style="font-size:14px;font-weight:800">' + esc(r.name) + '</span><span class="mono" style="font-size:12px;color:#A79FBF">' + esc(r.role) + '</span></figcaption></figure>';
    });
    return h + '</div>';
  }
  function genericHTML(a, holo) {
    var h = '<div class="scroll" style="padding:' + (holo ? '18px 20px 24px' : '32px 18px 16px') + ';display:flex;flex-direction:column;gap:14px">' + (holo ? '' : backBtn()) +
      '<div class="px" aria-hidden="true" style="display:flex;align-items:flex-end;height:84px;padding:0 14px 12px;border-radius:10px;font-size:32px;line-height:1;background-color:' + a.col + ';background-image:linear-gradient(rgba(0,0,0,.12) 50%,transparent 50%);background-size:100% 4px;color:#0B0614;box-shadow:0 0 24px ' + a.col + '55">' + a.n + '</div>' +
      '<div class="px" style="font-size:10px;color:' + a.col + '">' + a.n + ' · ' + a.label + '</div>' +
      '<h2 style="margin:0;font-size:28px;font-weight:800;line-height:1.05;letter-spacing:-.02em">' + esc(a.title) + '</h2>' +
      '<p style="margin:0;font-size:14px;line-height:1.45;color:#D9D2EA">' + esc(a.body) + '</p><ul style="list-style:none;margin:0;padding:0">';
    a.rows.forEach(function (r) {
      var inner = r.href ? '<a href="' + r.href + '"' + (r.href.indexOf('http') === 0 ? ' target="_blank" rel="noopener"' : '') + ' style="color:#2EE6FF;font-weight:600">' + esc(r.t) + '</a>' : esc(r.t);
      h += '<li style="padding:12px 0;border-top:2px dashed #2A1F4A;font-size:14px;line-height:1.35">' + inner + '</li>';
    });
    return h + '</ul></div>';
  }
  function renderScreen() {
    if (!els.screenBody) return;
    var scan = st.stage === 2 ? st.scan : null;
    renderHolo();
    var key = scan ? 'lock:' + scan : (st.app ? 'remote:' + st.app : 'home:' + (st.tick % NOTIFS.length));
    if (key === screenKey) return;
    // Keep focus position sane when the notification card rotates under a keyboard user.
    var active = document.activeElement;
    var hadFocusInside = active && els.screenBody.contains(active);
    if (key.indexOf('home:') === 0 && screenKey && screenKey.indexOf('home:') === 0 && hadFocusInside) {
      return; // don't swap content out from under someone tabbing through the menu
    }
    var scroller = els.screenBody.querySelector('.scroll');
    var keepScroll = scroller && screenKey && screenKey.split(':')[0] === key.split(':')[0] && key.indexOf('home') === 0 ? scroller.scrollTop : 0;
    screenKey = key;
    var body;
    if (scan) body = lockHTML(scan);
    else if (st.app) body = remoteHTML() + (device === 'mobile' ? '' : dockHTML()); // on phones the tilted phone pushes the dock offscreen
    else body = homeHTML() + dockHTML();
    els.screenBody.innerHTML = body;
    var sc = els.screenBody.querySelector('.scroll');
    if (sc) sc.scrollTop = keepScroll;
  }

  /* ------------------------------------------------------------------ hologram */
  var holoKey = null, glitchTimer = null;
  function renderHolo() {
    if (!els.holoBody) return;
    var key = st.stage === 2 && st.app ? st.app : null;
    if (key === holoKey) return;
    var switching = holoKey && key;
    holoKey = key;
    if (!key) return; // keep old content while the panel collapses
    var a = APPS.filter(function (x) { return x.id === key; })[0];
    els.holoBody.innerHTML = key === 'levels' ? levelsHTML() : key === 'how' ? howHTML() : key === 'check' ? checkHTML() : key === 'fit' ? fitHTML(a) : key === 'reviews' ? reviewsHTML() : genericHTML(a, true);
    els.holoLabel.textContent = 'HOLO · ' + a.n + ' ' + a.label;
    var nice = a.label.charAt(0) + a.label.slice(1).toLowerCase();
    els.holo.setAttribute('aria-label', 'Hologram: ' + nice);
    var hs = els.holoBody.querySelector('.scroll');
    if (hs) { hs.setAttribute('tabindex', '0'); hs.setAttribute('role', 'region'); hs.setAttribute('aria-label', nice + ' details'); }
    if (switching) glitch();
  }
  function glitch() {
    if (REDUCE || STILL || !els.holo) return;
    els.holo.classList.remove('glitch');
    void els.holo.offsetWidth; // restart the animation
    els.holo.classList.add('glitch');
    setTimeout(function () { if (els.holo) els.holo.classList.remove('glitch'); }, 260);
  }
  function scheduleGlitch() {
    clearTimeout(glitchTimer);
    if (REDUCE) return;
    glitchTimer = setTimeout(function () {
      if (holoKey) glitch();
      scheduleGlitch();
    }, 1800 + Math.random() * 2600);
  }

  /* ------------------------------------------------------------------ update */
  function setInert(node, on) {
    if (!node) return;
    if (on) { node.setAttribute('inert', ''); node.setAttribute('aria-hidden', 'true'); }
    else { node.removeAttribute('inert'); node.removeAttribute('aria-hidden'); }
  }
  function update() {
    var mobile = device === 'mobile';
    var s = S[st.stage];
    var blur = s.blur, bright = s.bright, vig = mobile ? s.vigM : s.vig;
    if (st.stage === 2 && st.app) { blur = 16; bright = 0.6; vig = mobile ? 'inset 0 0 180px 100px rgba(5,3,10,.96)' : 'inset 0 0 260px 220px rgba(5,3,10,.96)'; }
    els.world.style.transform = s.world;
    els.world.style.filter = 'blur(' + blur + 'px) brightness(' + bright + ')';
    els.fig.style.transform = s.fig;
    els.fig.style.opacity = s.figO;
    els.fig.style.pointerEvents = st.stage === 0 && !UC ? 'auto' : 'none';
    setInert(els.fig, st.stage !== 0);
    els.vig.style.boxShadow = vig;
    els.barTop.style.height = els.barBot.style.height = (mobile ? 0 : s.bar) + 'px';
    if (els.pov) {
      els.pov.style.opacity = s.pov;
      els.pov.style.transform = mobile ? s.povTm : s.povT;
      els.pov.style.pointerEvents = st.stage === 2 ? 'auto' : 'none';
      setInert(els.pov, st.stage !== 2);
    }
    if (els.hud) { els.hud.style.opacity = s.hud; els.hud.style.pointerEvents = st.stage === 0 ? 'auto' : 'none'; setInert(els.hud, st.stage !== 0); }
    if (els.scores) { els.scores.style.opacity = s.hud; setInert(els.scores, st.stage !== 0); }
    if (els.skip && mobile) { els.skip.style.opacity = st.stage === 0 ? 1 : 0; setInert(els.skip, st.stage !== 0); }
    if (els.where) els.where.textContent = '1UP · ' + (UC ? 'STAGE 2' : s.where);

    Array.prototype.forEach.call(els.cabScreens, function (n) {
      var i = +n.getAttribute('data-i');
      var c = NEON[(i + st.tick + 2) % NEON.length];
      n.style.backgroundColor = c;
      n.style.boxShadow = '0 0 26px ' + c + '77';
    });

    var li = st.tick % LINES.length;
    Array.prototype.forEach.call(els.lines, function (n) {
      var on = +n.getAttribute('data-line') === li;
      n.style.fontSize = (on ? 22 : 17) + 'px';
      n.style.fontWeight = on ? 700 : 500;
      n.style.color = on ? '#F2EEF8' : 'rgba(242,238,248,.55)';
    });
    if (els.caption) els.caption.textContent = LINES[li];
    stage.classList.toggle('still', STILL);
    if (els.motion) {
      els.motion.setAttribute('aria-pressed', STILL ? 'true' : 'false');
      els.motion.setAttribute('aria-label', STILL ? 'Play animations' : 'Pause animations');
      els.motionIcon.innerHTML = STILL ? ICON.play : '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="5" y="4" width="5" height="16"/><rect x="14" y="4" width="5" height="16"/></svg>';
      if (els.motionText) els.motionText.textContent = STILL ? 'MOTION OFF' : 'MOTION ON';
    }

    // projection: phone tilts away, beam + hologram panel appear
    var proj = st.stage === 2 && !!st.app;
    if (els.hold) els.hold.style.transform = proj ? (mobile ? 'translateY(392px) perspective(900px) rotateX(12deg)' : 'translateX(-250px) perspective(1200px) rotateY(18deg)') : 'none';
    if (els.beam) els.beam.classList.toggle('on', proj);
    if (els.holo) { els.holo.classList.toggle('on', proj); setInert(els.holo, !proj); }
    if (els.mono) els.mono.style.opacity = proj ? 0 : 1;
    if (els.caption) els.caption.style.opacity = proj ? 0 : 1;

    if (els.query) {
      var typed = STILL || REDUCE || (st.typed && st.tick % 4 !== 3);
      els.query.style.width = typed ? '33ch' : '0ch';
      els.results.style.opacity = typed ? 1 : 0;
    }
    renderScreen();
  }

  /* ------------------------------------------------------------------ flow */
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function go(dir) {
    if (UC) return;
    clearTimers();
    if (REDUCE) {
      st.stage = dir === 'in' ? 2 : 0; st.app = null; st.scan = null; update();
      if (dir === 'in') focusScreen(); else focusStart();
      return;
    }
    st.stage = 1; st.app = null; st.scan = null; update();
    if (dir === 'in') {
      later(function () { st.stage = 2; st.scan = 'scan'; update(); focusScreen(); }, 650);
      later(function () { st.scan = 'ok'; update(); }, 1700);
      later(function () { st.scan = null; update(); focusScreen(); }, 2600);
    } else {
      later(function () { st.stage = 0; update(); focusStart(); }, 650);
    }
  }
  function focusScreen() {
    if (!els.screen) return;
    var first = els.screen.querySelector('button, a');
    (first || els.screen).focus({ preventScroll: true });
  }
  function focusStart() {
    var b = els.hud && els.hud.querySelector('[data-act="enter"]');
    if (b) b.focus({ preventScroll: true });
  }

  stage.addEventListener('click', function (e) {
    var t = e.target.closest('[data-act]');
    if (!t) return;
    var act = t.getAttribute('data-act');
    if (act === 'enter') go('in');
    else if (act === 'exit') go('out');
    else if (act === 'motion') {
      STILL = !STILL;
      try { localStorage.setItem('cs-motion', STILL ? 'off' : 'on'); } catch (err) { /* storage unavailable */ }
      update();
    }
    else if (act === 'home') { st.app = null; update(); focusScreen(); }
    else if (act === 'skiplock') { clearTimers(); st.scan = null; update(); focusScreen(); }
    else if (act === 'open') {
      var fromRemote = !!st.app;
      st.app = t.getAttribute('data-app'); st.scan = null; update();
      if (fromRemote) { var b = els.screen && els.screen.querySelector('[aria-current="true"]'); if (b) b.focus({ preventScroll: true }); }
      else if (els.holo) els.holo.focus({ preventScroll: true });
    }
  });

  viewport.addEventListener('wheel', function (e) {
    if (wheelLock || UC) return;
    if (e.deltaY > 10 && st.stage === 0) go('in');
    else if (e.deltaY < -10 && st.stage === 2 && !st.app) {
      var sc = els.screenBody && els.screenBody.querySelector('.scroll');
      if (sc && sc.contains(e.target) && sc.scrollTop > 0) return;
      go('out');
    } else return;
    wheelLock = true;
    setTimeout(function () { wheelLock = false; }, 1400);
  }, { passive: true });
  viewport.addEventListener('touchstart', function (e) { touchY = e.touches && e.touches[0] ? e.touches[0].clientY : null; }, { passive: true });
  viewport.addEventListener('touchend', function (e) {
    var t = e.changedTouches && e.changedTouches[0];
    if (touchY == null || !t) return;
    var dy = t.clientY - touchY; touchY = null;
    if (dy < -50 && st.stage === 0 && !UC) go('in');
  }, { passive: true });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || UC) return;
    if (st.stage === 2 && st.app) { st.app = null; update(); focusScreen(); }
    else if (st.stage === 2) go('out');
  });

  /* ------------------------------------------------------------------ fit */
  function pickDevice() {
    var w = window.innerWidth, h = window.innerHeight;
    return (w < 760 || w / h < 0.8) ? 'mobile' : 'desktop';
  }
  function fit() {
    var d = pickDevice();
    if (d !== device) {
      device = d;
      L = LAYOUTS[d + '-' + (UC ? 'construction' : 'site')];
      build();
    }
    var s = Math.min(window.innerWidth / L.W, window.innerHeight / L.H);
    stage.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
  }
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
  fit();

  setInterval(function () { if (!STILL) { st.tick++; update(); } }, 3800);
  scheduleGlitch();
  setTimeout(function () { st.typed = true; update(); }, 500);
})();
