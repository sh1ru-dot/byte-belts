/* Byte Belts — Explorers app (ages 7–11): blocks → Java Lens → typed Java, plus the Creator Lab. */
(function () {
  'use strict';
  var BB = window.BB, ui = BB.ui, store = BB.store, engine = BB.engine, java = BB.java, Blockly = window.Blockly;
  var $ = function (id) { return document.getElementById(id); };

  var board = new ui.Board($('board'), { theme: 'explorer' });
  var level = null, ws = null, running = false, lensOn = false, idLine = {}, refreshTimer = null;
  var SPEEDS = [1, 1.9, 3.6];
  // Grown-ups can open a level with its model answer loaded:  explorer.html?answer=1#w3   (nothing is saved)
  var peek = /[?&]answer=1/.test(location.search);
  var RULES = { loop: 'use a loop', 'if': 'use an if', 'while': 'use repeat-until or repeat-while', variable: 'use a variable',
                'function': 'make and use your own function' };

  function show(view) { ['map', 'play', 'lab'].forEach(function (v) { $(v).hidden = v !== view; }); window.scrollTo(0, 0); }
  function disposeWs() { clearTimeout(refreshTimer); if (ws) { ws.dispose(); ws = null; } }
  function beltOf(l) { return BB.explorer.belts.find(function (b) { return b.id === l.belt; }); }

  function showMap() {
    if (peek) { location.href = 'explorer.html'; return; }      // leave the answer-key view completely
    stopRun(); disposeWs(); level = null;
    show('map');
    ui.renderMap($('map'), 'explorer', openLevel);
    var belt = store.currentBelt('explorer');
    $('beltChip').innerHTML = belt ? ui.beltHTML(belt, 44) + '<span>' + belt.name + '</span>' : '';
    history.replaceState(null, '', location.pathname);
  }

  /* ---------------- opening a level ---------------- */
  function openLevel(l) {
    stopRun(); disposeWs();
    level = l;
    show('play');
    var belt = beltOf(l);
    $('levelTitle').textContent = (belt ? belt.name + ' • ' : '') + l.title;
    $('mission').textContent = l.mission;
    var rule = (l.require || [])[0];
    $('rule').hidden = !rule;
    if (rule) $('rule').textContent = 'Rule: ' + (rule === 'function' && l.mode === 'java' ? 'write and use your own method' : RULES[rule]);
    $('scroll').hidden = !l.scroll;
    if (l.scroll) $('scroll').innerHTML = codeLines(l.scroll);
    $('hint').hidden = true; $('hint').textContent = l.hint || '';
    $('hintBtn').hidden = !l.hint;
    hideMessage();
    var n = engine.gridsOf(l).length;
    $('variantNote').hidden = n < 2;
    $('variantNote').textContent = 'This level changes! Your code must work on all ' + n + ' versions.';
    board.load(engine.parseGrid(engine.gridsOf(l)[0], l.dir), { fog: l.fog });
    if (l.mode === 'java') setupEditor(); else setupBlocks();
    if (!l.custom) history.replaceState(null, '', location.search + '#' + l.id);
    if (peek) showMessage('Answer key view for grown-ups.', 'This is one good answer — there are others. Nothing here is saved.', true);
  }

  function codeLines(text, mark) {
    return text.split('\n').map(function (line, i) {
      return '<div class="ln' + (mark && mark.line === i + 1 ? ' ' + mark.cls : '') + '" data-n="' + (i + 1) + '">' + java.highlight(line) + '</div>';
    }).join('');
  }

  /* ---------------- block mode ---------------- */
  function setupBlocks() {
    $('blockWork').hidden = false; $('javaWork').hidden = true;
    $('modeTag').textContent = 'Blocks';
    var allowed = level.java === 'lens' || store.javaLensOpen();
    $('lensBtn').hidden = !allowed;
    lensOn = allowed;
    $('javaPanel').hidden = !lensOn;
    ws = BB.blocks.create($('blockly'), level, peek ? BB.blocks.fromProgram(java.parse(level.answer)) : store.work('explorer', level.id));
    ws.addChangeListener(function (e) {
      if (e.isUiEvent) return;
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(refreshBlocks, 120);
    });
    refreshBlocks();
  }
  function refreshBlocks() {
    if (!ws) return;
    var program = null;
    try { program = BB.blocks.compile(ws); } catch (e) { if (!(e instanceof BB.blocks.Hole)) throw e; }
    if (program) {
      var out = java.toJava(program);
      idLine = out.idLine;
      $('javaView').innerHTML = codeLines(out.text);
      setCounter(engine.countStmts(program));
    } else {
      $('javaView').innerHTML = codeLines('// One block still has an empty hole.\n// Fill it in to see the Java.');
      setCounter(null);
    }
    if (!running && !peek) store.work('explorer', level.id, Blockly.serialization.workspaces.save(ws));
  }
  function setCounter(n) {
    var word = level.mode === 'java' ? 'Commands' : 'Blocks';
    $('counter').innerHTML = word + ': <b>' + (n === null ? '–' : n) + '</b>' +
      (level.par && !level.custom ? ' &nbsp;★★★ = ' + level.par + ' or fewer' : '');
  }

  /* ---------------- Java mode ---------------- */
  var ta = $('editorText'), view = $('editorView');
  function setupEditor() {
    $('blockWork').hidden = true; $('javaWork').hidden = false;
    $('modeTag').textContent = 'Java'; $('lensBtn').hidden = true;
    ta.value = peek ? level.answer : store.work('explorer', level.id) || level.starterJava;
    paintEditor();
    countJava();
  }
  function paintEditor(mark) {
    view.innerHTML = codeLines(ta.value, mark);
    view.scrollTop = ta.scrollTop; view.scrollLeft = ta.scrollLeft;
  }
  function countJava() {
    try { setCounter(engine.countStmts(java.parse(ta.value))); } catch (e) { setCounter(null); }
  }
  function insert(text) {
    if (!document.execCommand || !document.execCommand('insertText', false, text)) ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, 'end');
  }
  ta.addEventListener('input', function () {
    paintEditor(); hideMessage();
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(function () { if (level && level.mode === 'java') { if (!peek) store.work('explorer', level.id, ta.value); countJava(); } }, 250);
  });
  ta.addEventListener('scroll', function () { view.scrollTop = ta.scrollTop; view.scrollLeft = ta.scrollLeft; });
  ta.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') { e.preventDefault(); insert('    '); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      var before = ta.value.slice(0, ta.selectionStart), line = before.slice(before.lastIndexOf('\n') + 1);
      var indent = line.match(/^ */)[0] + (/\{\s*$/.test(line) ? '    ' : '');
      insert('\n' + indent);
    } else if (e.key === '}') {
      var b = ta.value.slice(0, ta.selectionStart), cur = b.slice(b.lastIndexOf('\n') + 1);
      if (/^ {4,}$/.test(cur)) { ta.setSelectionRange(ta.selectionStart - 4, ta.selectionStart); }
    }
  });

  /* ---------------- messages ---------------- */
  function showMessage(text, small, good) {
    var m = $('message');
    m.className = 'message' + (good ? ' good' : '');
    m.innerHTML = '';
    m.appendChild(document.createTextNode(text));
    if (small) { var s = document.createElement('small'); s.textContent = small; m.appendChild(s); }
    m.hidden = false;
  }
  function hideMessage() { $('message').hidden = true; }

  function clearMarks() {
    if (ws) ws.highlightBlock(null);
    Array.prototype.forEach.call(document.querySelectorAll('#javaView .ln.active, #editorView .ln.active'), function (el) { el.classList.remove('active'); });
  }
  function markStep(e) {
    clearMarks();
    if (level.mode === 'java') {
      var el = view.children[Number(String(e.id).slice(1)) - 1];
      if (el) { el.classList.add('active'); }
    } else {
      ws.highlightBlock(String(e.id).split(':')[0]);
      var line = idLine[e.id], lel = line && $('javaView').children[line - 1];
      if (lel) { lel.classList.add('active'); if (lensOn) lel.scrollIntoView({ block: 'nearest' }); }
    }
  }

  /* ---------------- running ---------------- */
  function setRunning(on) {
    running = on;
    $('runBtn').innerHTML = on ? '&#9632; Stop' : '&#9654; Run';
    $('runBtn').className = 'btn ' + (on ? 'btn-stop' : 'btn-go');
  }
  function stopRun() { board.stop(); setRunning(false); }

  async function run() {
    if (running) { stopRun(); clearMarks(); board.reset(); return; }
    hideMessage(); clearMarks();
    BB.sound.play('tap');
    var program;
    try {
      program = level.mode === 'java' ? java.parse(ta.value) : BB.blocks.compile(ws);
    } catch (e) {
      BB.sound.play('fail');
      if (e instanceof java.JavaError) { showMessage(e.message, 'Look at line ' + e.line + '.'); paintEditor({ line: e.line, cls: 'bad' }); return; }
      if (e instanceof BB.blocks.Hole) { showMessage(e.message); ws.highlightBlock(e.blockId); return; }
      throw e;
    }
    if (level.mode === 'java') paintEditor();
    var n = engine.gridsOf(level).length, results = [];
    for (var i = 0; i < n; i++) results.push(engine.run(program, level, i));
    var bad = results.find(function (r) { return r.status !== 'win'; });
    var shown = bad || results[Math.floor(Math.random() * n)];
    board.load(shown.world, { fog: level.fog });
    if (n > 1) $('variantNote').textContent = 'Showing version ' + (shown.variant + 1) + ' of ' + n + '. Your code must work on all of them!';
    setRunning(true);
    var finished = await board.play(shown.events, markStep);
    if (!finished) return;
    setRunning(false);
    if (shown.status === 'win') {
      clearMarks();
      var miss = engine.missingRequirement(program, level);
      if (miss) {
        BB.sound.play('fail');
        showMessage('Bit made it — but this level has a rule: ' + RULES[miss] + '.', 'Try again using it. That is how you earn the belt!');
      } else win(program);
    } else fail(shown, n);
  }

  function fail(r, n) {
    BB.sound.play('fail');
    var java_ = level.mode === 'java', where = java_ ? 'line' : 'block';
    var text, small = '';
    switch (r.reason) {
      case 'empty': text = java_ ? 'main is empty. Type some commands between its curly braces { }.' : 'Snap some blocks under the orange "when Run is pressed" block first.'; break;
      case 'bonk': text = 'Bonk! Bit hit a wall.'; small = 'The glowing ' + where + ' is where it happened. What should Bit have done instead?'; break;
      case 'forever': text = 'Bit got dizzy — this loop never stops!'; small = 'Check the loop: does its question ever change, or is the number too big?'; break;
      case 'gems': text = 'Bit missed ' + r.info.gems + (r.info.gems === 1 ? ' gem.' : ' gems.'); small = r.info.goal ? 'He did not finish on the flag either.' : 'Collect them all, then finish on the flag.'; break;
      case 'paint': text = r.info.paint + (r.info.paint === 1 ? ' square still needs' : ' squares still need') + ' the right colour.'; break;
      case 'goal': text = 'The program finished, but Bit is not on the flag.'; small = 'Where did he stop? What is the next step from there?'; break;
      case 'error': text = r.info.message; small = r.info.line ? 'Look at line ' + r.info.line + '.' : ''; break;
      default: text = 'Not quite — try again!';
    }
    if (n > 1) small = 'This happened on version ' + (r.variant + 1) + ' of ' + n + '. ' + small;
    showMessage(text, small);
    if (r.reason === 'error' && r.info.line && java_) paintEditor({ line: r.info.line, cls: 'bad' });
  }

  function win(program) {
    var count = engine.countStmts(program);
    var stars = level.custom || level.noPar ? 3 : engine.stars(count, level.par);
    ui.confetti(); BB.sound.play('win');
    if (level.custom) {
      ui.modal({ cls: 'modal-win', art: ui.starsHTML(3), title: 'You beat your own level!',
                 html: 'Now challenge someone in your family to solve it.',
                 buttons: [{ label: 'Keep playing' }, { label: 'Back to the Lab', primary: true, onClick: showLab }] });
      return;
    }
    var belt = peek ? null : store.complete('explorer', level.id, stars);
    var list = BB.explorer.levels, next = list[list.indexOf(level) + 1], me = level;
    var word = level.mode === 'java' ? 'commands' : 'blocks';
    var html = level.noPar ? 'Bug fixed. That is real programmer work!'
      : 'You used <b>' + count + '</b> ' + word + '.' + (stars < 3 ? ' Three stars takes <b>' + level.par + '</b> or fewer — can you find a shorter way?' : ' That is as neat as the experts!');
    var go = function (then) {
      return function () {
        if (!belt) return then();
        ui.beltCeremony(belt, store.track('explorer').name, function () {
          if (belt.id === 'blue') ui.modal({ title: 'New power: the Java Lens!', html: 'From now on a panel shows your blocks as real Java code. Blocks and Java say the same thing in two ways.', buttons: [{ label: 'Cool!', primary: true, onClick: then }] });
          else then();
        });
      };
    };
    ui.modal({ cls: 'modal-win', art: ui.starsHTML(stars), title: 'Mission complete!', html: html,
               buttons: [{ label: stars < 3 ? 'Try for fewer' : 'Stay here', onClick: go(function () { if (level !== me) return; board.reset(); }) },
                         next ? { label: 'Next level', primary: true, onClick: go(function () { openLevel(next); }) }
                              : { label: 'Finish', primary: true, onClick: go(showMap) }] });
  }

  /* ---------------- Creator Lab ---------------- */
  var labBoard = new ui.Board($('labBoard'), { theme: 'explorer' });
  var LAB_W = 8, LAB_H = 6;
  var TOOLS = [['#', 'Wall', '#64748b'], ['.', 'Floor', '#e2e8f0'], ['S', 'Bit', '#38bdf8'], ['G', 'Flag', '#ef4444'], ['*', 'Gem', '#22d3ee'],
               ['r', 'Red spot', '#ef4444'], ['b', 'Blue spot', '#3b82f6'], ['y', 'Yellow spot', '#facc15']];
  var lab = null, tool = '#';

  function freshLab() {
    var rows = [];
    for (var y = 0; y < LAB_H; y++) rows.push(new Array(LAB_W + 1).join('.').split(''));
    rows[4][1] = 'S'; rows[1][6] = 'G';
    return { rows: rows, dir: 1 };
  }
  function labRows() { return lab.rows.map(function (r) { return r.join(''); }); }
  function drawLab() {
    labBoard.load(engine.parseGrid(labRows(), lab.dir));
    store.data().custom = { rows: labRows(), dir: lab.dir }; store.save();
  }
  function showLab() {
    stopRun(); disposeWs(); level = null;
    show('lab');
    var saved = store.data().custom;
    lab = saved ? { rows: saved.rows.map(function (r) { return r.split(''); }), dir: saved.dir } : freshLab();
    var host = $('labTools');
    host.innerHTML = '';
    TOOLS.forEach(function (t) {
      var b = ui.h('button', 'tool' + (t[0] === tool ? ' on' : ''), '<i style="background:' + t[2] + '"></i>' + t[1]);
      b.setAttribute('aria-pressed', String(t[0] === tool));
      b.onclick = function () { tool = t[0]; showLab(); };
      host.appendChild(b);
    });
    $('labPlayJava').hidden = !store.javaLensOpen();
    $('labMsg').hidden = true;
    drawLab();
  }
  $('labBoard').addEventListener('click', function (e) {
    var svg = $('labBoard').querySelector('svg'); if (!svg) return;
    var box = svg.getBoundingClientRect();
    var x = Math.floor((e.clientX - box.left) / box.width * LAB_W), y = Math.floor((e.clientY - box.top) / box.height * LAB_H);
    if (x < 0 || y < 0 || x >= LAB_W || y >= LAB_H) return;
    if (lab.rows[y][x] === 'S') return;                       // Bit must always be somewhere
    if (tool === 'S' || tool === 'G') lab.rows.forEach(function (r) { var i = r.indexOf(tool); if (i >= 0) r[i] = '.'; });
    lab.rows[y][x] = tool;
    BB.sound.play('tap');
    drawLab();
  });
  function playLab(mode) {
    var world = engine.parseGrid(labRows(), lab.dir);
    if (!world.goal && !world.gems.size && !world.targets.size) {
      $('labMsg').textContent = 'Add a flag, a gem or a paint spot first — every level needs a goal!';
      $('labMsg').hidden = false; return;
    }
    store.work('explorer', 'custom-' + mode, null);
    openLevel({ id: 'custom-' + mode, custom: true, belt: null, title: 'My own level', dir: lab.dir, grid: labRows(), mode: mode,
                mission: 'You built this level. Now solve it!', hint: 'You are the designer — if it is too hard, go back to the Lab and change it.',
                blocks: BB.explorer.ALL_BLOCKS, vars: ['count'], starterJava: java.scaffold() });
  }

  /* ---------------- wiring ---------------- */
  function soundIcon() {
    var on = store.settings().sound;
    $('soundBtn').innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/>' +
      (on ? '<path d="M16 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
          : '<path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>') + '</svg>';
    $('soundBtn').setAttribute('aria-pressed', String(on));
  }
  $('soundBtn').onclick = function () { store.set('sound', !store.settings().sound); soundIcon(); };
  $('backBtn').onclick = function () { if (level && level.custom) showLab(); else showMap(); };
  $('runBtn').onclick = run;
  $('resetBtn').onclick = function () { stopRun(); clearMarks(); hideMessage(); board.reset(); if (level.mode === 'java') paintEditor(); };
  $('speed').oninput = function () { board.speed = SPEEDS[this.value - 1]; };
  $('hintBtn').onclick = function () { $('hint').hidden = !$('hint').hidden; };
  $('lensBtn').onclick = function () { lensOn = !lensOn; $('javaPanel').hidden = !lensOn; Blockly.svgResize(ws); };
  $('restartBtn').onclick = function () {
    ui.modal({ title: 'Start this level over?', html: 'Your ' + (level.mode === 'java' ? 'code' : 'blocks') + ' for this level will be cleared.',
               buttons: [{ label: 'Keep my work' }, { label: 'Start over', primary: true, onClick: function () {
                 store.work('explorer', level.id, null); openLevel(level); } }] });
  };
  $('labBtn').onclick = showLab;
  $('labBack').onclick = showMap;
  $('labTurn').onclick = function () { lab.dir = (lab.dir + 1) % 4; drawLab(); };
  $('labClear').onclick = function () { lab = freshLab(); drawLab(); };
  $('labPlayBlocks').onclick = function () { playLab('blocks'); };
  $('labPlayJava').onclick = function () { playLab('java'); };
  window.addEventListener('resize', function () { if (ws) Blockly.svgResize(ws); });
  soundIcon();

  function fromHash() {
    var l = BB.explorer.levels.find(function (x) { return x.id === location.hash.slice(1); });
    return l && (peek || store.isUnlocked('explorer', l.id)) ? l : null;
  }
  window.addEventListener('hashchange', function () { var l = fromHash(); if (l && l !== level) openLevel(l); });
  var start = fromHash();
  if (start) openLevel(start); else showMap();
})();
