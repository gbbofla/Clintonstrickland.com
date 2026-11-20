/* Growth & Content Health Check. Scored in the browser; nothing is sent anywhere unless the visitor emails it. */
(function () {
  'use strict';
  var EMAIL = 'clinton.strickland3@gmail.com';
  var AREAS = {
    strategy: { name: 'Strategy', col: '#FFD23F', next: 'LV5 · Fractional Head of Growth', why: 'Someone needs to own the plan and the number it moves.' },
    content: { name: 'Content engine', col: '#2EE6FF', next: 'LV2 · Content Engine Sprint', why: 'A repeatable format and a weekly cadence will do more than more ideas.' },
    distribution: { name: 'Distribution', col: '#FF2E88', next: 'LV3 · Short-form & Microdrama Production', why: 'Good work isn’t reaching people; short-form and series fix that.' },
    measurement: { name: 'Measurement', col: '#39FF88', next: 'LV4 · Hypergrowth Retainer', why: 'You need to know what’s working before you pour money on it.' },
    conversion: { name: 'Conversion', col: '#A78BFA', next: 'LV4 · Hypergrowth Retainer', why: 'Attention isn’t turning into customers yet.' }
  };
  var QS = [
    ['strategy', 'Can you name the one number your marketing is supposed to move this quarter?'],
    ['strategy', 'Can you describe the customer you’re trying to reach in one sentence?'],
    ['content', 'Do you publish on a set weekly schedule?'],
    ['content', 'Do you have a repeatable format your audience recognizes?'],
    ['distribution', 'Are you posting short-form vertical video every week?'],
    ['distribution', 'Does each long piece get cut into short posts for other channels?'],
    ['measurement', 'Can you say which posts or channels brought in customers last month?'],
    ['measurement', 'Have you run a test that changed where you spend money?'],
    ['conversion', 'Does every post point people to one clear next step?'],
    ['conversion', 'Do you capture contact details from people who aren’t ready to buy yet?']
  ];
  var OPTS = [['Yes', 2], ['Sometimes', 1], ['No', 0]];

  var qBox = document.getElementById('hc-questions');
  qBox.innerHTML = QS.map(function (q, i) {
    var a = AREAS[q[0]];
    return '<fieldset class="hc-q"><legend><span class="hc-area" style="color:' + a.col + '">' + (i + 1) + ' / 10 · ' + a.name.toUpperCase() + '</span>' + q[1] + '</legend><div class="hc-opts">' +
      OPTS.map(function (o) { return '<label><input type="radio" name="q' + i + '" value="' + o[1] + '"> ' + o[0] + '</label>'; }).join('') + '</div></fieldset>';
  }).join('');

  var form = document.getElementById('hc'), err = document.getElementById('hc-err'), out = document.getElementById('hc-result');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var answers = [], missing = [];
    QS.forEach(function (q, i) {
      var c = form.querySelector('input[name="q' + i + '"]:checked');
      if (!c) missing.push(i + 1); else answers.push(+c.value);
    });
    if (missing.length) {
      err.textContent = 'Please answer question' + (missing.length > 1 ? 's ' : ' ') + missing.join(', ') + '.';
      var first = form.querySelector('input[name="q' + (missing[0] - 1) + '"]');
      if (first) first.focus();
      return;
    }
    err.textContent = '';
    var total = 0, by = {};
    QS.forEach(function (q, i) { total += answers[i]; by[q[0]] = (by[q[0]] || 0) + answers[i]; });
    var weakest = Object.keys(AREAS).sort(function (a, b) { return by[a] - by[b]; })[0];
    var tier = total >= 16 ? 'Strong engine. You’re ready to scale what works.' : total >= 10 ? 'Solid start with clear gaps. Fixing one area will move the rest.' : 'Early game. The biggest wins are still on the table.';
    document.getElementById('hc-score').textContent = total + ' / 20';
    document.getElementById('hc-summary').textContent = tier;
    document.getElementById('hc-rows').innerHTML = Object.keys(AREAS).map(function (k) {
      var a = AREAS[k], pct = by[k] / 4 * 100;
      return '<div class="hc-row"><span>' + a.name + '</span><div class="bar" role="img" aria-label="' + a.name + ': ' + by[k] + ' out of 4"><span style="width:' + pct + '%;background:' + a.col + '"></span></div><span class="mono">' + by[k] + '/4</span></div>';
    }).join('');
    var w = AREAS[weakest];
    document.getElementById('hc-next').innerHTML = '<strong>Weakest area: ' + w.name + '.</strong> ' + w.why + ' Everyone starts with <strong>LV1 · Growth &amp; Content Audit</strong>; from your answers, the likely next level is <strong>' + w.next + '</strong>.';
    var body = 'Hi Clinton,\n\nI took the Growth & Content Health Check.\n\nScore: ' + total + '/20\n' +
      Object.keys(AREAS).map(function (k) { return AREAS[k].name + ': ' + by[k] + '/4'; }).join('\n') +
      '\nWeakest area: ' + w.name + '\n\nCompany / website:\nBest time to talk:\n\nThanks,\n';
    document.getElementById('hc-send').href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('My Health Check results') + '&body=' + encodeURIComponent(body);
    out.hidden = false;
    out.focus();
  });
  document.getElementById('hc-reset').addEventListener('click', function () {
    form.reset(); out.hidden = true; err.textContent = '';
    var f = form.querySelector('input'); if (f) f.focus();
  });
})();
