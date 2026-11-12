/* Byte Belts — Grown-ups guide: belt scale, mastery scale, lesson plans, answer key, progress. */
(function () {
  'use strict';
  var BB = window.BB, store = BB.store, ui = BB.ui, cur = BB.curriculum;
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function levelsIn(data, belt) { return data.levels.filter(function (l) { return l.belt === belt.id; }); }
  var ARROWS = { N: '↑', E: '→', S: '↓', W: '←' };

  /* ---------- progress ---------- */
  function progress() {
    $('progressGrid').innerHTML = [['junior', 'Cubs', BB.junior], ['explorer', 'Explorers', BB.explorer]].map(function (t) {
      var tr = store.track(t[0]), total = t[2].levels.length;
      var done = t[2].levels.filter(function (l) { return store.isDone(t[0], l.id); });
      var stars = done.reduce(function (n, l) { return n + store.stars(t[0], l.id); }, 0);
      var belt = store.currentBelt(t[0]);
      var rows = t[2].belts.map(function (b) {
        var list = levelsIn(t[2], b), d = list.filter(function (l) { return store.isDone(t[0], l.id); }).length;
        return '<div>' + ui.beltHTML(b, 34) + '<span>' + b.name + '</span><span>' + (d === list.length ? 'Earned' : d + ' / ' + list.length) + '</span></div>';
      }).join('');
      return '<div class="card progress-card"><h3>' + esc(tr.name || t[1]) + (tr.name ? ' <small>(' + t[1] + ')</small>' : '') + '</h3>' +
        '<p><b>' + (belt ? belt.name : 'No belt yet') + '</b> &bull; ' + done.length + ' of ' + total + ' levels &bull; ' + stars + ' of ' + total * 3 + ' stars</p>' +
        '<div class="bar"><i style="width:' + Math.round(done.length / total * 100) + '%"></i></div><div class="mini-belts">' + rows + '</div></div>';
    }).join('');
  }

  /* ---------- belt scale ---------- */
  function beltTable(host, data, plans, track) {
    var tool = { purple: 'Blocks + Java side by side', brown: 'Typed Java (edit)', red: 'Typed Java (write)', black: 'Typed Java + Creator Lab' };
    $(host).innerHTML = '<thead><tr><th>Belt</th><th>Big idea</th><th>"I can…"</th><th>Levels</th><th>' + (track === 'explorer' ? 'Written in' : 'Time') + '</th></tr></thead><tbody>' +
      data.belts.map(function (b) {
        return '<tr><td><span class="belt-tag">' + ui.beltHTML(b, 40) + b.name.replace(' Belt', '') + '</span></td><td><b>' + b.skill + '</b></td><td>' + esc(b.can) +
          '</td><td class="num">' + levelsIn(data, b).length + '</td><td>' + (track === 'explorer' ? (tool[b.id] || 'Blocks') : plans[b.id].sessions) + '</td></tr>';
      }).join('') + '</tbody>';
  }

  /* ---------- lesson plans ---------- */
  function list(items) { return '<ul>' + items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul>'; }
  function code(text) {
    return '<div class="answer code">' + text.split('\n').map(function (l) { return '<div class="ln">' + BB.java.highlight(l) + '</div>'; }).join('') + '</div>';
  }
  function answerKey(data, belt, track) {
    return '<div class="answer-key">' + levelsIn(data, belt).map(function (l) {
      var body;
      if (track === 'junior') {
        body = '<p><b>' + BB.engine.parseTiles(l.solution).map(function (t) { return ARROWS['NESW'[t.d]] + (t.n > 1 ? '×' + t.n : ''); }).join('&nbsp; ') + '</b></p>';
      } else {
        // Show just the inside of the class so the answer is quick to read.
        var inner = l.answer.split('\n').slice(2, -2).map(function (x) { return x.replace(/^ {4}/, ''); }).join('\n').replace(/^\n+/, '');
        body = code(inner) + '<p class="no-print"><a href="explorer.html?answer=1#' + l.id + '">Open this level with the answer loaded' + (l.mode === 'blocks' ? ' as blocks' : '') + '</a></p>';
      }
      return '<details><summary>' + esc(l.title) + (l.par ? ' <small>(3 stars: ' + l.par + (track === 'junior' ? ' arrows' : l.mode === 'java' ? ' commands' : ' blocks') + ')</small>' : '') + '</summary>' +
        (l.mission || l.say ? '<p><i>' + esc(l.mission || l.say) + '</i></p>' : '') + body + '</details>';
    }).join('') + '</div>';
  }
  function plans(host, data, set, track) {
    $(host).innerHTML = data.belts.map(function (b) {
      var p = set[b.id];
      return '<details class="plan" style="--belt:' + b.color + '"><summary>' + ui.beltHTML(b, 48) + '<span>' + b.name + ' — ' + b.skill + '</span><small>' + p.sessions + '</small></summary>' +
        '<div class="plan-body">' +
        '<h4>Big idea</h4><p class="big-idea">' + esc(p.idea) + '</p>' +
        '<h4>Goal</h4><p>' + esc(b.can) + '</p>' +
        '<h4>New words</h4><p class="words">' + p.words.map(function (w) { return '<span>' + esc(w) + '</span>'; }).join('') + '</p>' +
        '<h4>Warm-up away from the screen</h4><p>' + esc(p.warmup) + '</p>' +
        '<h4>On the screen</h4>' + list(p.teach) +
        '<h4>Questions to ask</h4>' + list(p.ask) +
        '<h4>Watch out for</h4><p>' + esc(p.watch) + '</p>' +
        '<h4>Belt earned when</h4><p>' + esc(p.mastery) + '</p>' +
        '<h4>Stretch</h4><p>' + esc(p.stretch) + '</p>' +
        (p.java ? '<h4>The Java connection</h4><p>' + esc(p.java) + '</p>' : '') +
        '<h4>Answer key</h4>' + answerKey(data, b, track) +
        '</div></details>';
    }).join('');
  }

  /* ---------- build the page ---------- */
  progress();
  beltTable('beltTableExplorer', BB.explorer, cur.explorerPlans, 'explorer');
  beltTable('beltTableJunior', BB.junior, cur.juniorPlans, 'junior');
  $('scaleTable').innerHTML = '<thead><tr><th>Score</th><th>What it looks like</th><th>What to do next</th></tr></thead><tbody>' +
    cur.scale.map(function (s) { return '<tr><td class="num">' + s.score + ' &bull; ' + s.name + '</td><td>' + esc(s.look) + '</td><td>' + esc(s.next) + '</td></tr>'; }).join('') + '</tbody>';
  $('strandTable').innerHTML = '<thead><tr><th>Skill</th><th>Ask yourself</th></tr></thead><tbody>' +
    cur.strands.map(function (s) { return '<tr><td><b>' + s.name + '</b></td><td>' + esc(s.q) + '</td></tr>'; }).join('') + '</tbody>';
  plans('plansJunior', BB.junior, cur.juniorPlans, 'junior');
  plans('plansExplorer', BB.explorer, cur.explorerPlans, 'explorer');

  /* ---------- settings ---------- */
  [['setUnlock', 'unlockAll'], ['setLens', 'javaLens'], ['setSound', 'sound']].forEach(function (p) {
    $(p[0]).checked = !!store.settings()[p[1]];
    $(p[0]).onchange = function () { store.set(p[1], this.checked); if (p[1] === 'sound') store.set('voice', this.checked); };
  });
  [['resetJunior', 'junior', 'Cubs'], ['resetExplorer', 'explorer', 'Explorers']].forEach(function (r) {
    $(r[0]).onclick = function () {
      ui.modal({ title: 'Reset ' + r[2] + ' progress?', html: 'All belts, stars and saved work for ' + r[2] + ' will be erased. This cannot be undone.',
                 buttons: [{ label: 'Keep it', primary: true }, { label: 'Erase', onClick: function () { store.reset(r[1]); progress(); } }] });
    };
  });

  // Printing should include every lesson plan, not just the open ones.
  window.addEventListener('beforeprint', function () {
    Array.prototype.forEach.call(document.querySelectorAll('details.plan'), function (d) { d.open = true; });
  });
})();
