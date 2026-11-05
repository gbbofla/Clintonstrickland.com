/* Tour Room: one poster per place. Edit PLACES only. */
(function () {
  'use strict';

  // city + state + a one-line memory. Keep it to 12 or fewer for the single wall.
  var PLACES = [
    { city: 'Port St. Lucie', state: 'FL', memory: '' },
    { city: 'Boston', state: 'MA', memory: '' }
  ];

  if (window.__previewPlaces) PLACES = window.__previewPlaces; // local design previews only

  var PALETTES = [
    { bg: '#FFD23F', ink: '#0B0614', acc: '#FF2E88' },
    { bg: '#2EE6FF', ink: '#0B0614', acc: '#5B21B6' },
    { bg: '#FF2E88', ink: '#FFF4D6', acc: '#FFD23F' },
    { bg: '#0B0614', ink: '#FFD23F', acc: '#39FF88' },
    { bg: '#FF8A3D', ink: '#1B1430', acc: '#FFF4D6' },
    { bg: '#A78BFA', ink: '#0B0614', acc: '#FFF4D6' }
  ];
  var VARIANTS = ['v-sun', 'v-rings', 'v-stripes', 'v-grid'];
  var STATES = { AL: 'ALABAMA', AK: 'ALASKA', AZ: 'ARIZONA', AR: 'ARKANSAS', CA: 'CALIFORNIA', CO: 'COLORADO', CT: 'CONNECTICUT', DE: 'DELAWARE', DC: 'WASHINGTON, DC', FL: 'FLORIDA', GA: 'GEORGIA', HI: 'HAWAII', ID: 'IDAHO', IL: 'ILLINOIS', IN: 'INDIANA', IA: 'IOWA', KS: 'KANSAS', KY: 'KENTUCKY', LA: 'LOUISIANA', ME: 'MAINE', MD: 'MARYLAND', MA: 'MASSACHUSETTS', MI: 'MICHIGAN', MN: 'MINNESOTA', MS: 'MISSISSIPPI', MO: 'MISSOURI', MT: 'MONTANA', NE: 'NEBRASKA', NV: 'NEVADA', NH: 'NEW HAMPSHIRE', NJ: 'NEW JERSEY', NM: 'NEW MEXICO', NY: 'NEW YORK', NC: 'NORTH CAROLINA', ND: 'NORTH DAKOTA', OH: 'OHIO', OK: 'OKLAHOMA', OR: 'OREGON', PA: 'PENNSYLVANIA', RI: 'RHODE ISLAND', SC: 'SOUTH CAROLINA', SD: 'SOUTH DAKOTA', TN: 'TENNESSEE', TX: 'TEXAS', UT: 'UTAH', VT: 'VERMONT', VA: 'VIRGINIA', WA: 'WASHINGTON', WV: 'WEST VIRGINIA', WI: 'WISCONSIN', WY: 'WYOMING' };
  // tile-grid map of the US: [state, col, row]
  var TILES = [['AK',0,0],['ME',11,0],['WI',6,1],['VT',10,1],['NH',11,1],
    ['WA',1,2],['ID',2,2],['MT',3,2],['ND',4,2],['MN',5,2],['IL',6,2],['MI',7,2],['NY',9,2],['MA',10,2],
    ['OR',1,3],['NV',2,3],['WY',3,3],['SD',4,3],['IA',5,3],['IN',6,3],['OH',7,3],['PA',8,3],['NJ',9,3],['CT',10,3],['RI',11,3],
    ['CA',1,4],['UT',2,4],['CO',3,4],['NE',4,4],['MO',5,4],['KY',6,4],['WV',7,4],['VA',8,4],['MD',9,4],['DE',10,4],
    ['AZ',2,5],['NM',3,5],['KS',4,5],['AR',5,5],['TN',6,5],['NC',7,5],['SC',8,5],['DC',9,5],
    ['OK',4,6],['LA',5,6],['MS',6,6],['AL',7,6],['GA',8,6],['HI',0,7],['TX',4,7],['FL',9,7]];

  var HALL = /[?&]view=hallway\b/.test(location.search);
  var root = document.getElementById('tour');

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  function posterHTML(p, i, tag) {
    var pal = PALETTES[i % PALETTES.length], v = VARIANTS[i % VARIANTS.length];
    var memo = p.memory ? esc(p.memory) : '[One-line memory]';
    var tilt = ((i * 37) % 5 - 2) * 0.8;
    return '<' + tag + (tag === 'button' ? ' type="button" data-i="' + i + '"' : '') + ' class="poster ' + v + '" style="--p-bg:' + pal.bg + ';--p-ink:' + pal.ink + ';--p-acc:' + pal.acc + ';transform:rotate(' + tilt + 'deg)" aria-label="' + esc(p.city + ', ' + p.state + (p.memory ? ': ' + p.memory : '')) + '">' +
      '<span class="art" aria-hidden="true"></span>' +
      '<span class="p-band" aria-hidden="true"><span>CLINTON STRICKLAND</span><span>ON TOUR</span></span>' +
      '<span class="p-live" aria-hidden="true">LIVE IN</span>' +
      '<span class="p-city" aria-hidden="true">' + esc(p.city) + '</span>' +
      '<span class="p-foot" aria-hidden="true"><span class="p-state">' + esc(STATES[p.state] || p.state) + '</span>' +
      '<span class="p-memo">' + memo + '</span></span></' + tag + '>';
  }
  function slotHTML(p, i) {
    return '<li class="slot"><span class="lamp" aria-hidden="true"></span><span class="tape l" aria-hidden="true"></span><span class="tape r" aria-hidden="true"></span>' + posterHTML(p, i, 'button') + '</li>';
  }
  function emptyHTML(label) {
    return '<li class="slot"><span class="lamp" aria-hidden="true"></span><div class="poster empty"><span class="p-next">' + label + '</span></div></li>';
  }

  // shrink each city name until it fits on one line
  function fit(scope) {
    Array.prototype.forEach.call(scope.querySelectorAll('.p-city'), function (el) {
      el.style.fontSize = '';
      var size = parseFloat(getComputedStyle(el).fontSize);
      var guard = 40;
      while (el.scrollWidth > el.clientWidth + 1 && size > 8 && guard--) { size *= 0.93; el.style.fontSize = size + 'px'; }
    });
  }

  var dlg = document.getElementById('zoom');
  function openZoom(i) {
    var p = PLACES[i];
    dlg.querySelector('.zoom-poster').innerHTML = posterHTML(p, i, 'div');
    dlg.showModal();
    fit(dlg);
  }

  function renderRoom() {
    var h = PLACES.map(slotHTML);
    if (PLACES.length < 12) h.push(emptyHTML('NEXT<br>STOP?'));
    root.innerHTML = '<ul class="wall" role="list" style="list-style:none;margin:0 auto">' + h.join('') + '</ul>';
  }
  function renderHall() {
    var visited = {};
    PLACES.forEach(function (p) { visited[p.state] = true; });
    var map = '<div class="tilemap" role="img" aria-label="States visited: ' + esc(Object.keys(visited).map(function (s) { return STATES[s] || s; }).join(', ')) + '">';
    var grid = {};
    TILES.forEach(function (t) { grid[t[1] + ',' + t[2]] = t[0]; });
    for (var r = 0; r < 8; r++) for (var c = 0; c < 12; c++) {
      var s = grid[c + ',' + r];
      map += s ? '<span class="tile' + (visited[s] ? ' on' : '') + '" aria-hidden="true">' + s + '</span>' : '<span aria-hidden="true"></span>';
    }
    map += '</div>';
    var intro = '<div class="hall-intro"><p class="tour-sub" style="margin:0;text-align:left">' + Object.keys(visited).length + ' of 50 states lit. Every poster is a city I’ve played.</p>' + map + '<p class="hall-hint">SCROLL →</p></div>';
    var slots = PLACES.map(slotHTML);
    for (var k = PLACES.length; k < 12; k++) slots.push(emptyHTML('NEXT<br>STOP?'));
    root.innerHTML = '<div class="hall" tabindex="0" aria-label="Poster hallway, scroll sideways"><ul class="hall-track" role="list" style="list-style:none;margin:0">' + '<li>' + intro + '</li>' + slots.join('') + '</ul></div>';
    var hall = root.querySelector('.hall');
    hall.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { hall.scrollLeft += e.deltaY; e.preventDefault(); }
    }, { passive: false });
  }

  if (HALL) { document.body.classList.add('is-hall'); renderHall(); } else renderRoom();
  root.addEventListener('click', function (e) {
    var b = e.target.closest('button.poster');
    if (b) openZoom(+b.getAttribute('data-i'));
  });
  dlg.querySelector('.zoom-close').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });

  var go = function () { fit(root); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('resize', go);
})();
