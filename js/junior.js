/* Byte Belts — Cubs app (ages 4–6). Tap arrows into a row, press Go, watch Pip. */
(function () {
  'use strict';
  var BB = window.BB, ui = BB.ui, store = BB.store, engine = BB.engine;
  var $ = function (id) { return document.getElementById(id); };
  var NAMES = ['up', 'right', 'down', 'left'];
  var ARROW_COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f97316'];
  var ORDER = { W: 0, N: 1, S: 2, E: 3 };                 // palette order: left, up, down, right

  var board = new ui.Board($('board'), { theme: 'junior' });
  var level = null, tiles = [], sel = -1, running = false, glow = -1;

  function arrowSVG(d, size) {
    return '<svg viewBox="-22 -22 44 44" width="' + size + '" height="' + size + '" aria-hidden="true">' +
      '<path d="M0,-17 L15,0 H6 V16 H-6 V0 H-15 Z" transform="rotate(' + d * 90 + ')" fill="#fff" stroke="rgba(15,23,42,.35)" stroke-width="2" stroke-linejoin="round"/></svg>';
  }

  /* ---------- screens ---------- */
  function showMap() {
    board.stop(); running = false;
    window.speechSynthesis && window.speechSynthesis.cancel();
    $('play').hidden = true; $('map').hidden = false;
    ui.renderMap($('map'), 'junior', openLevel);
    var belt = store.currentBelt('junior');
    $('beltChip').innerHTML = belt ? ui.beltHTML(belt, 44) + '<span>' + belt.name + '</span>' : '';
    history.replaceState(null, '', location.pathname);
  }

  function openLevel(l) {
    level = l; sel = -1; glow = -1; running = false;
    tiles = l.starter ? engine.parseTiles(l.starter) : [];
    $('map').hidden = true; $('play').hidden = false;
    $('say').textContent = l.say;
    board.load(engine.parseGrid(l.grid, l.dir));
    buildPalette();
    renderStrip();
    hideToast();
    history.replaceState(null, '', '#' + l.id);
    if (store.settings().voice) ui.speak(l.say);
    window.scrollTo(0, 0);
  }

  function buildPalette() {
    var arrows = $('arrows'), numbers = $('numbers');
    arrows.innerHTML = ''; numbers.innerHTML = '';
    level.arrows.slice().sort(function (a, b) { return ORDER[a] - ORDER[b]; }).forEach(function (letter) {
      var d = engine.DIRS[letter];
      var b = ui.h('button', 'tile-btn arrow', arrowSVG(d, 46));
      b.style.background = ARROW_COLORS[d];
      b.setAttribute('aria-label', 'Go ' + NAMES[d]);
      b.onclick = function () { tapArrow(d); };
      arrows.appendChild(b);
    });
    numbers.hidden = !level.numbers;
    if (level.numbers) [1, 2, 3, 4, 5].forEach(function (n) {
      var b = ui.h('button', 'tile-btn number', String(n));
      b.setAttribute('aria-label', n + ' times');
      b.onclick = function () { tapNumber(n); };
      numbers.appendChild(b);
    });
  }

  function renderStrip() {
    var strip = $('strip');
    strip.innerHTML = '';
    tiles.forEach(function (t, i) {
      var b = ui.h('button', 'tile-btn arrow in-strip' + (i === sel ? ' selected' : '') + (i === glow ? ' glow' : ''),
        arrowSVG(t.d, 40) + (t.n > 1 ? '<span class="times">×' + t.n + '</span>' : ''));
      b.style.background = ARROW_COLORS[t.d];
      b.setAttribute('aria-label', 'Step ' + (i + 1) + ': ' + NAMES[t.d] + (t.n > 1 ? ' ' + t.n + ' times' : '') + (i === sel ? ', selected' : ''));
      b.onclick = function () { if (running) return; sel = sel === i ? -1 : i; BB.sound.play('tap'); renderStrip(); };
      strip.appendChild(b);
    });
    var empty = level.max ? level.max - tiles.length : (tiles.length < 12 ? 1 : 0);
    for (var e = 0; e < empty; e++) strip.appendChild(ui.h('span', 'slot'));
    $('goBtn').classList.toggle('ready', tiles.length > 0 && !running);
  }

  /* ---------- building the program ---------- */
  function tapArrow(d) {
    if (running) return;
    resetBoard();
    if (sel >= 0) { tiles[sel].d = d; sel = -1; }
    else if (tiles.length >= (level.max || 12)) {
      BB.sound.play('fail');
      $('strip').classList.remove('shake'); void $('strip').offsetWidth; $('strip').classList.add('shake');
      toast(level.numbers ? 'No more boxes! Tap a number to repeat an arrow.' : 'No more boxes!', true);
      return;
    } else tiles.push({ d: d, n: 1 });
    BB.sound.play('tap');
    renderStrip();
  }
  function tapNumber(n) {
    if (running || !tiles.length) return;
    resetBoard();
    tiles[sel >= 0 ? sel : tiles.length - 1].n = n;
    sel = -1;
    BB.sound.play('tap');
    renderStrip();
  }
  function trash() {
    if (running || !tiles.length) return;
    resetBoard();
    tiles.splice(sel >= 0 ? sel : tiles.length - 1, 1);
    sel = -1;
    BB.sound.play('turn');
    renderStrip();
  }
  function resetBoard() { glow = -1; hideToast(); board.reset(); }

  /* ---------- running ---------- */
  var toastTimer = null;
  function toast(text, say) {
    var t = $('toast');
    t.textContent = text; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 6000);
    if (say && store.settings().voice) ui.speak(text);
  }
  function hideToast() { $('toast').hidden = true; }

  async function go() {
    if (running) return;
    if (!tiles.length) { toast('Tap an arrow first!', true); return; }
    window.speechSynthesis && window.speechSynthesis.cancel();
    running = true; sel = -1; hideToast();
    board.reset();
    var result = engine.run(engine.juniorProgram(tiles), level, 0);
    var finished = await board.play(result.events, function (e) { if (glow !== e.id) { glow = e.id; renderStrip(); } });
    running = false; glow = -1;
    if (!finished) return;
    renderStrip();
    if (result.status === 'win') return win();
    BB.sound.play('fail');
    var why = result.reason === 'bonk' ? (result.info.door ? 'The door is locked! Get the key first.' : 'Bump! Pip can\'t go that way.')
            : result.reason === 'gems' ? 'Pip missed an apple! Try again.'
            : 'Pip is not home yet. Keep going!';
    toast(why, true);
    setTimeout(function () { if (!running) board.reset(); }, 1500);
  }

  function win() {
    var stars = engine.stars(tiles.length, level.par);
    var belt = store.complete('junior', level.id, stars);
    var list = BB.junior.levels, next = list[list.indexOf(level) + 1];
    ui.confetti(); BB.sound.play('win');
    if (store.settings().voice) ui.speak('You did it!');
    var buttons = [{ label: 'Again', onClick: function () { openLevel(level); } }];
    if (next) buttons.push({ label: 'Next', primary: true, onClick: function () { after(belt, function () { openLevel(next); }); } });
    else buttons.push({ label: 'Finish', primary: true, onClick: function () { after(belt, showMap); } });
    ui.modal({ cls: 'modal-win', art: ui.starsHTML(stars), title: 'You did it!', buttons: buttons });
  }
  function after(belt, then) {
    if (belt) ui.beltCeremony(belt, store.track('junior').name, then); else then();
  }

  /* ---------- wiring ---------- */
  function soundIcon() {
    var on = store.settings().sound;
    $('soundBtn').innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/>' +
      (on ? '<path d="M16 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
          : '<path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>') + '</svg>';
    $('soundBtn').setAttribute('aria-pressed', String(on));
  }
  $('soundBtn').onclick = function () { store.set('sound', !store.settings().sound); store.set('voice', store.settings().sound); soundIcon(); };
  $('backBtn').onclick = showMap;
  $('speakBtn').onclick = function () { ui.speak(level.say); };
  $('goBtn').onclick = go;
  $('trashBtn').onclick = trash;
  soundIcon();

  function fromHash() {
    var l = BB.junior.levels.find(function (x) { return x.id === location.hash.slice(1); });
    return l && store.isUnlocked('junior', l.id) ? l : null;
  }
  window.addEventListener('hashchange', function () { var l = fromHash(); if (l && l !== level) openLevel(l); });
  var start = fromHash();
  if (start) openLevel(start); else showMap();
})();
