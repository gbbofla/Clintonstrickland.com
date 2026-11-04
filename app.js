/* Clinton Strickland — arcade site. Plain JS, no dependencies. */
(function () {
  'use strict';

  var ACCENT = '#FFD23F', HOODIE = '#2F5BEA', SKIN = '#B9784A';
  var GLOW = ACCENT + '59';
  var NEON = ['#FF2E88', '#2EE6FF', '#FFD23F', '#39FF88', '#8B5CFF'];
  var REDUCE = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var UC = document.body.getAttribute('data-mode') === 'construction' || /[?&]mode=construction\b/.test(location.search);
  var EMAIL = 'clinton.strickland3@gmail.com';
  var LINKEDIN = 'https://www.linkedin.com/in/csiii';
  var GITHUB = 'https://github.com/gbbofla';
  var RESUME = 'resume.html';

  var viewport = document.getElementById('viewport');
  var stage = document.getElementById('stage');
  var st = { stage: 0, app: null, scan: null, tick: 0, typed: false };
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

  var APPS = [
    { id: 'about', n: '01', label: 'ABOUT', col: ACCENT, title: 'I get schedules home.',
      body: 'I’m a schedule and project controls lead with eight years across data center, advanced manufacturing and industrial programs. I find what’s really driving the finish date, so owners see risk early and act before it reaches the critical path. Off the clock I build worlds: novels, comics, concept albums.',
      rows: [{ t: 'Based in Port St. Lucie, FL' }, { t: 'Founder, Ironline Planning Co. (2019)' }, { t: 'PMP · Certified ScrumMaster · OSHA 30' }, { t: 'MBA, Pepperdine University' }, { t: 'My rule: find the real constraint first.' }, { t: 'Express risk as days and dollars, not color codes.' }] },
    { id: 'work', n: '02', label: 'WORK', col: '#2EE6FF' },
    { id: 'ventures', n: '03', label: 'VENTURES', col: '#39FF88', title: 'Things I’m building',
      body: 'I build independent businesses alongside client work.',
      rows: [{ t: 'Ironline Planning Co. — owner’s-side planning, scheduling and project controls for owners, developers and GCs, est. 2019' }, { t: 'Data center schedule controls research — see the LAB stage' }] },
    { id: 'stories', n: '04', label: 'STORIES', col: '#FF2E88', title: 'Worlds I’m writing',
      body: 'Fiction, comics and sound: the other half of how I think.',
      rows: [{ t: 'Blacktop Dust — novella, Baltimore’s underground bike scene' }, { t: 'Sun & Steel — solarpunk Afro-futurist comic' }, { t: 'Shreddy Ruxpin — doom metal concept album series' }] },
    { id: 'contact', n: '05', label: 'CONTACT', col: '#A78BFA', title: 'Let’s build something.',
      body: 'Open to data center schedule, project controls and pre-construction roles, and to good collaborators.',
      rows: [{ t: EMAIL, href: 'mailto:' + EMAIL }, { t: 'linkedin.com/in/csiii', href: LINKEDIN }, { t: 'github.com/gbbofla', href: GITHUB }, { t: 'Web résumé', href: RESUME, same: true }, { t: 'Port St. Lucie, FL' }] },
    { id: 'lab', n: '06', label: 'LAB', col: '#FF8A3D', title: 'Data center lab',
      body: 'Independent planning work applying owner’s-side schedule controls to hyperscale data center programs. Campus A figures are planning estimates for a hypothetical program. The Excel model and a P6-importable schedule are available on request.',
      rows: [{ t: 'Campus A: integrated master schedule for a 400 MW AI campus (hypothetical)' }, { t: 'Utility, entitlement, design, long-lead electrical gear, shell, fit-out and commissioning linked; a 110-week transformer lead sets the date, and reserving it early saves 12 weeks' }, { t: 'Schedule risk: 3,000-iteration Monte Carlo, P50 Nov 2029, P80 Jan 2030' }, { t: 'Capacity: 963 IT MW and 1,204 MW of facility load, delivery paths priced at $0.5M per MW-month of delay' }, { t: 'White paper: Recovering 126 Days' }, { t: 'White paper: Pre-Construction for Hyperscale AI Data Centers' }, { t: 'White paper: The Pandemic That Rewired the Construction Schedule' }] }
  ];

  var NOTIFS = [
    { from: 'NEW HIGH SCORE · CAMPUS C', text: 'Handed over 4 weeks ahead of the approved baseline.', app: 'work', n: '02', col: '#2EE6FF' },
    { from: 'COMEBACK · CAMPUS B', text: '206 days late at takeover. Delivered 126 days ahead of that forecast.', app: 'work', n: '02', col: '#2EE6FF' },
    { from: 'COST CONTROL · CAMPUS B', text: 'Overrun held to $630K against a ~$1.2M forecast.', app: 'work', n: '02', col: '#2EE6FF' },
    { from: 'NEW RESEARCH', text: 'A 400 MW AI campus, scheduled from utility to commissioning.', app: 'lab', n: '06', col: '#FF8A3D' }
  ];

  var LINES = [
    'I took over a $650M data center campus forecasting 206 days late.',
    'We delivered it 126 days ahead of that forecast.',
    'I held the cost overrun to $630K. The forecast said $1.2M.',
    'Then I brought a 28-month build home four weeks early.'
  ];

  var PROOF = [
    { rank: '1ST', col: '#FFD23F', v: '$150M+', l: 'construction directed in a $500M+ portfolio' },
    { rank: '2ND', col: '#2EE6FF', v: '126 days', l: 'recovered on a $650M data center campus' },
    { rank: '3RD', col: '#FF2E88', v: '4 wks early', l: 'Campus C, 110,000 sf advanced manufacturing' },
    { rank: '4TH', col: '#39FF88', v: '75%', l: 'of projects ahead of baseline, zero lost-time incidents' }
  ];

  var ROLES = [
    { org: 'Ironline Planning Co.', role: 'Founder · Port St. Lucie, FL · 2019–now' },
    { org: 'BMRed', role: 'Senior Project Manager · Boston, MA · 2019–2021' },
    { org: 'Strickland Demo and Build', role: 'Construction Scheduler / Preconstruction Planning Leader · 2018–2019' }
  ];
  var METHODS = ['Primavera P6', 'Critical-path & delay analysis', 'Time-impact evaluation', 'Takt & Last Planner', 'Monte Carlo (P50/P80)', 'Earned value', 'Commissioning prerequisites', 'Cost-schedule alignment'];

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
    var p = function (l, t, w, h, r, bg, extra) { return '<span class="abs" style="left:' + l + 'px;top:' + t + 'px;width:' + w + 'px;height:' + h + 'px;border-radius:' + r + ';background:' + bg + ';' + (extra || '') + '"></span>'; };
    return p(40, 184, 38, 104, '4px', '#2B3A55') + p(82, 184, 38, 104, '4px', '#2B3A55') +
      p(36, 286, 44, 18, '6px 6px 4px 4px', '#EDEAE3') + p(80, 286, 44, 18, '6px 6px 4px 4px', '#EDEAE3') +
      p(38, 170, 84, 16, '3px', '#1E2A3A') +
      p(34, 72, 92, 104, '14px 14px 8px 8px', HOODIE) + p(60, 72, 40, 12, '0 0 12px 12px', 'rgba(0,0,0,.22)') +
      p(16, 80, 26, 72, '10px', HOODIE, 'transform:rotate(16deg)') + p(118, 80, 26, 72, '10px', HOODIE, 'transform:rotate(-16deg)') +
      p(34, 128, 44, 22, '10px', HOODIE, 'filter:brightness(.88)') + p(82, 128, 44, 22, '10px', HOODIE, 'filter:brightness(.88)') +
      p(66, 100, 28, 46, '6px', '#0D0F13', 'box-sizing:border-box;border:2px solid #2A2F3A;box-shadow:0 0 26px 6px ' + GLOW) +
      p(70, 104, 20, 38, '3px', '#2EE6FF') +
      p(56, 122, 16, 20, '6px', SKIN) + p(88, 122, 16, 20, '6px', SKIN) +
      p(50, 8, 60, 60, '12px', SKIN, 'box-shadow:inset 0 -16px 18px ' + GLOW) +
      p(47, 0, 66, 20, '10px 10px 3px 3px', '#1A1410') +
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
    h.push('<div class="abs" style="left:0;top:0;width:100%;height:' + g.floorY + 'px;background-color:#160D2A;background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.03) 0 2px,transparent 2px 96px)"></div>');
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
        h.push('<div class="abs" style="left:80px;top:190px;width:330px;display:flex;flex-direction:column;gap:16px" aria-live="off">');
        h.push('<div class="px" style="font-size:10px;letter-spacing:.06em;color:#2EE6FF">P1 THOUGHTS</div>');
        LINES.forEach(function (t, i) { h.push('<div class="line" data-line="' + i + '" style="line-height:1.3">' + esc(t) + '</div>'); });
        h.push('</div>');
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
      var look = 'display:flex;align-items:center;gap:8px;min-height:46px;padding:0 16px 0 12px;border-radius:6px;border:2px solid rgba(242,238,248,.5);background:rgba(11,6,20,.7);color:#F2EEF8;font-family:var(--pixel);font-size:10px;cursor:pointer;' + (mobile ? 'right:12px;top:10px' : 'left:80px;top:640px');
      h.push('<button type="button" class="abs" data-act="exit" style="' + look + '">' + ICON.up + 'LOOK UP</button>');
      if (mobile) h.push('<div class="abs" data-el="caption" style="left:24px;top:776px;width:342px;font-size:14px;line-height:1.4;font-weight:600;color:#F2EEF8"></div>');
      h.push('</div>');
    }

    // HUDs
    var chipBox = 'display:flex;align-items:center;gap:10px;min-height:32px;padding:0 14px;border-radius:6px;border:2px solid rgba(57,255,136,.5);background:rgba(11,6,20,.7);font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#F2EEF8';
    var dot = '<span aria-hidden="true" style="width:8px;height:8px;background:#39FF88;box-shadow:0 0 8px #39FF88"></span>';
    var startBtn = function (size) {
      return '<button type="button" data-act="enter" style="display:flex;align-items:center;gap:10px;min-height:52px;padding:0 26px;border-radius:6px;border:0;background:' + ACCENT + ';color:#0B0614;font-family:var(--pixel);font-size:' + size + 'px;cursor:pointer;box-shadow:inset 0 -5px 0 rgba(0,0,0,.25),0 0 24px ' + GLOW + '">' + ICON.play + 'PRESS START</button>';
    };
    if (!UC && !mobile) {
      h.push('<div class="abs t-fade" data-el="hud" style="left:0;top:70px;width:1280px;display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center">');
      h.push('<div style="' + chipBox + ';font-size:13px">' + dot + 'Open to data center schedule, project controls &amp; pre-construction roles</div>');
      h.push('<h1 class="px" style="margin:0;font-size:34px;line-height:1.3;color:#FF2E88;text-shadow:0 0 6px rgba(255,46,136,.9),0 0 24px rgba(255,46,136,.6)">BE ME FOR A MINUTE</h1>');
      h.push('<p style="margin:0;max-width:600px;font-size:17px;line-height:1.45;color:#D9D2EA">That’s me, Clinton Strickland, on my phone in the arcade. Schedule &amp; project controls lead, founder, world-builder. Step inside and see what I see.</p>');
      h.push('<div style="display:flex;align-items:center;gap:18px">' + startBtn(13) + '<span class="px" style="font-size:10px;color:#A79FBF">OR SCROLL</span></div>');
      h.push('</div>');
    }
    if (!UC && mobile) {
      h.push('<div class="abs t-fade" data-el="hud" style="left:24px;top:74px;width:342px;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center">');
      h.push('<div style="' + chipBox + ';font-size:12px;min-height:30px;padding:0 12px">' + dot + 'Open to data center roles</div>');
      h.push('<h1 class="px" style="margin:0;font-size:24px;line-height:1.45;color:#FF2E88;text-shadow:0 0 6px rgba(255,46,136,.9),0 0 20px rgba(255,46,136,.6)">BE ME FOR<br>A MINUTE</h1>');
      h.push('<p style="margin:0;font-size:15px;line-height:1.4;color:#D9D2EA">That’s me, Clinton, on my phone in the arcade. Tap me or swipe up to see what I see.</p>');
      h.push(startBtn(12));
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

    // high scores
    if (!mobile) {
      h.push('<div class="abs t-fade" data-el="scores" style="left:160px;top:680px;width:960px;display:flex;flex-direction:column;gap:10px;padding:12px 18px;border-radius:10px;border:2px solid #2A1F4A;background:rgba(11,6,20,.85)">');
      h.push('<h2 class="px" style="margin:0;font-size:10px;color:#FFD23F">HIGH SCORES</h2><div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px">');
      PROOF.forEach(function (p) {
        h.push('<div style="display:flex;flex-direction:column;gap:4px"><span style="display:flex;align-items:baseline;gap:8px"><span class="px" style="font-size:10px;color:' + p.col + '">' + p.rank + '</span><span style="font-size:20px;font-weight:800">' + esc(p.v) + '</span></span><span class="mono" style="font-size:11px;line-height:1.35;color:#A79FBF">' + esc(p.l) + '</span></div>');
      });
      h.push('</div></div>');
    } else if (!UC) {
      h.push('<div class="abs t-fade hscroll" data-el="scores" style="left:0;top:722px;width:390px;display:flex;gap:10px;padding:0 24px">');
      h.push('<h2 class="sr-only">High scores</h2>');
      PROOF.forEach(function (p) {
        h.push('<div style="flex-shrink:0;width:156px;display:flex;flex-direction:column;gap:6px;padding:12px;border-radius:10px;border:2px solid #2A1F4A;background:rgba(11,6,20,.88)"><span class="px" style="font-size:10px;color:' + p.col + '">' + p.rank + '</span><span style="font-size:19px;font-weight:800">' + esc(p.v) + '</span><span class="mono" style="font-size:11px;line-height:1.35;color:#A79FBF">' + esc(p.l) + '</span></div>');
      });
      h.push('<div style="flex-shrink:0;width:1px"></div></div>');
    }

    // chrome
    h.push('<a href="./" class="abs px" style="left:' + (mobile ? 20 : 80) + 'px;top:24px;font-size:' + (mobile ? 10 : 11) + 'px;color:#F2EEF8;text-decoration:none;text-shadow:0 0 8px rgba(242,238,248,.4)">CLINTON STRICKLAND</a>');
    if (!mobile) h.push('<div class="abs px" data-el="where" aria-hidden="true" style="right:250px;top:26px;font-size:10px;color:#A79FBF"></div>');
    h.push('<a href="' + RESUME + '" class="abs px t-fade" data-el="skip" style="right:' + (mobile ? 14 : 80) + 'px;top:' + (mobile ? 14 : 16) + 'px;display:flex;align-items:center;min-height:32px;padding:0 10px;border-radius:6px;border:2px solid rgba(242,238,248,.45);background:rgba(11,6,20,.6);color:#F2EEF8;font-size:9px;text-decoration:none">SKIP INTRO ›</a>');

    stage.innerHTML = h.join('');
    els = {};
    Array.prototype.forEach.call(stage.querySelectorAll('[data-el]'), function (n) { els[n.getAttribute('data-el')] = n; });
    els.cabScreens = stage.querySelectorAll('.cab-screen');
    els.lines = stage.querySelectorAll('[data-line]');
    screenKey = null;
    update();
  }

  /* ------------------------------------------------------------------ phone screen */
  function backBtn() {
    return '<button type="button" data-act="home" style="align-self:flex-start;display:flex;align-items:center;gap:8px;min-height:44px;padding:0 16px 0 10px;border-radius:8px;border:2px solid #2A1F4A;background:#16102A;color:#F2EEF8;font-family:var(--pixel);font-size:10px;cursor:pointer">' + ICON.back + 'BACK</button>';
  }
  function dockHTML() {
    var item = function (href, label, col, icon, ext) {
      return '<a href="' + href + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + ' style="display:flex;flex-direction:column;align-items:center;gap:4px;min-height:54px;color:#F2EEF8;text-decoration:none;font-size:11px;font-weight:600"><span style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:8px;background:#16102A;border:2px solid ' + col + ';color:' + col + '">' + icon + '</span>' + label + '</a>';
    };
    return '<nav aria-label="Quick links" style="flex-shrink:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;padding:10px 14px 0;border-top:2px solid #2A1F4A">' +
      item(RESUME, 'Résumé', '#FFD23F', ICON.file) + item('mailto:' + EMAIL, 'Email', '#FF2E88', ICON.mail) +
      item(LINKEDIN, 'LinkedIn', '#2EE6FF', ICON.brief, true) + item(GITHUB, 'GitHub', '#39FF88', ICON.code, true) + '</nav>';
  }
  function lockHTML(scan) {
    var ok = scan === 'ok';
    var box = 'display:flex;align-items:center;justify-content:center;width:88px;height:88px;border-radius:10px;' + (ok ? 'background:' + ACCENT + ';color:#0B0614;border:3px solid ' + ACCENT + ';box-shadow:0 0 30px ' + GLOW : 'color:' + ACCENT + ';border:3px dashed ' + ACCENT);
    return '<button type="button" data-act="skiplock" aria-label="Skip to the menu" style="flex-grow:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;padding:24px;border:0;background:#0B0614;color:#F2EEF8;cursor:pointer">' +
      '<span style="' + box + '">' + (ok ? ICON.check : ICON.scan) + '</span>' +
      '<span class="px" role="status" style="font-size:14px;line-height:1.7;text-align:center;color:' + ACCENT + '">' + (ok ? 'WELCOME BACK, CLINTON' : 'SCANNING PLAYER…') + '</span>' +
      '<span class="px" style="font-size:10px;color:#A79FBF">' + (ok ? 'YOU’RE ME NOW' : 'TAP TO SKIP') + '</span></button>';
  }
  function homeHTML() {
    var nf = NOTIFS[st.tick % NOTIFS.length];
    var h = '<div class="scroll" style="padding:36px 18px 14px;display:flex;flex-direction:column;gap:14px">' +
      '<div style="display:flex;flex-direction:column;gap:8px"><div class="px" style="font-size:10px;color:#2EE6FF">PLAYER 1</div>' +
      '<h2 style="margin:0;font-size:28px;font-weight:800;line-height:1;letter-spacing:-.02em">Clinton Strickland</h2>' +
      '<div style="font-size:13px;line-height:1.35;color:#A79FBF">Schedule &amp; project controls lead · Founder, Ironline Planning Co.</div></div>' +
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
  function workHTML() {
    var card = 'display:flex;flex-direction:column;gap:12px;padding:14px;border-radius:14px;background:#16102A;border:2px solid #2A1F4A';
    var h = '<div class="scroll" style="padding:32px 18px 16px;display:flex;flex-direction:column;gap:14px">' + backBtn() +
      '<div class="px" style="font-size:10px;color:#2EE6FF">02 · WORK</div>' +
      '<h2 class="px" style="margin:0;font-size:18px;line-height:1.5;color:#FFD23F;text-shadow:0 0 10px rgba(255,210,63,.45)">HI-SCORE TABLE</h2>' +
      '<p style="margin:0;font-size:14px;line-height:1.45;color:#D9D2EA">Schedule and project controls since 2018: $150M+ directed as owner’s representative within a $500M+ portfolio, 75% of projects ahead of baseline, zero lost-time incidents.</p>' +
      '<div style="' + card + '"><div class="mono" style="font-size:11px;line-height:1.4;color:#A79FBF">CAMPUS B · DATA CENTER · 300,000 SF · $650M</div>' +
      '<h3 style="margin:0;font-size:16px;font-weight:700;line-height:1.3">Took over forecasting 206 days late. Delivered 126 days ahead of that forecast.</h3>' +
      '<div style="position:relative;display:flex;flex-direction:column;gap:10px;padding-top:20px">' +
      '<div aria-hidden="true" style="position:absolute;left:46.8%;top:0;bottom:0;width:2px;background:#FFD23F"></div>' +
      '<div class="mono" style="position:absolute;left:46.8%;top:0;padding-left:6px;font-size:10px;font-weight:500;color:#FFD23F;white-space:nowrap">I joined · May 2021</div>' +
      bar('Original plan · Feb 2022', 77.4, '#8C85A3', false, '#16102A') +
      bar('Forecast at takeover · Sep 2022 (+206 days)', 100, '#FF4D6D', false, '#16102A') +
      bar('Delivered · May 2022 (+80 days)', 86.1, '#2EE6FF', true, '#16102A') +
      '</div><div class="mono" style="display:flex;justify-content:space-between;font-size:10px;color:#A79FBF"><span>Feb 2020</span><span>Sep 2022</span></div>' +
      '<p style="margin:0;font-size:13px;line-height:1.4;color:#D9D2EA">61% of the slip recovered. Cost overrun held to $630K against a ~$1.2M forecast.</p></div>' +
      '<div style="' + card + '"><div class="mono" style="font-size:11px;line-height:1.4;color:#A79FBF">CAMPUS C · ADVANCED MANUFACTURING · 110,000 SF</div>' +
      '<h3 style="margin:0;font-size:16px;font-weight:700;line-height:1.3">28-month ground-up build. Delivered 4 weeks ahead of the approved baseline.</h3>' +
      bar('Baseline', 100, '#8C85A3', false) + bar('Delivered · Jul 2026 · −4 weeks', 96.6, '#39FF88', true) +
      '<div class="mono" style="font-size:10px;color:#A79FBF">Mar 2024 → Jul 2026</div>' +
      '<p style="margin:0;font-size:13px;line-height:1.4;color:#D9D2EA">20 subcontractors, 170 peak workforce. $150K of rework avoided through resequencing, zero lost-time incidents.</p></div>' +
      '<div style="display:flex;flex-direction:column">';
    ROLES.forEach(function (r) {
      h += '<div style="display:flex;flex-direction:column;gap:2px;padding:11px 0;border-top:2px dashed #2A1F4A"><span style="font-size:14px;font-weight:700">' + esc(r.org) + '</span><span style="font-size:13px;color:#A79FBF">' + esc(r.role) + '</span></div>';
    });
    h += '</div><ul style="list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:6px">';
    METHODS.forEach(function (m) { h += '<li style="padding:6px 10px;border-radius:6px;border:2px solid #2A1F4A;background:#16102A;font-size:12px;font-weight:600">' + esc(m) + '</li>'; });
    h += '</ul><div style="display:flex;flex-direction:column;gap:6px;padding-top:4px"><div class="px" style="font-size:10px;color:#FFD23F">POWER-UPS</div>' +
      '<div style="font-size:13px;line-height:1.5;color:#D9D2EA">PMP · Certified ScrumMaster · OSHA 30 · Procore Certified (Project Manager, Superintendent, Field Productivity)</div>' +
      '<div style="font-size:13px;line-height:1.5;color:#A79FBF">MBA, Pepperdine · CM Certificate, Florida Atlantic University · BA, Political Science, Xavier University of Louisiana</div></div>' +
      '<a href="' + RESUME + '" style="align-self:flex-start;font-weight:700">Full web résumé ›</a></div>';
    return h;
  }
  function genericHTML(a) {
    var h = '<div class="scroll" style="padding:32px 18px 16px;display:flex;flex-direction:column;gap:14px">' + backBtn() +
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
    var key = scan ? 'lock:' + scan : (st.app ? 'app:' + st.app : 'home:' + (st.tick % NOTIFS.length));
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
    else if (st.app === 'work') body = workHTML() + dockHTML();
    else if (st.app) body = genericHTML(APPS.filter(function (a) { return a.id === st.app; })[0]) + dockHTML();
    else body = homeHTML() + dockHTML();
    els.screenBody.innerHTML = body;
    var sc = els.screenBody.querySelector('.scroll');
    if (sc) sc.scrollTop = keepScroll;
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

    if (els.query) {
      var typed = (st.typed || REDUCE) && (REDUCE || st.tick % 4 !== 3);
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
    else if (act === 'home') { st.app = null; update(); focusScreen(); }
    else if (act === 'skiplock') { clearTimers(); st.scan = null; update(); focusScreen(); }
    else if (act === 'open') { st.app = t.getAttribute('data-app'); st.scan = null; update(); focusScreen(); }
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

  setInterval(function () { st.tick++; update(); }, 3800);
  setTimeout(function () { st.typed = true; update(); }, 500);
})();
