/* Byte Belts — shared screen pieces: the game board, sounds, confetti, pop-ups, level map. */
(function (root) {
  'use strict';
  var BB = root.BB = root.BB || {};
  var NS = 'http://www.w3.org/2000/svg';
  var CELL = 64;
  var COLORS = { red: '#ef4444', blue: '#3b82f6', yellow: '#facc15', purple: '#a855f7', orange: '#fb923c' };

  function svg(tag, attrs, parent) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  }
  function h(tag, cls, html) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html !== undefined) el.innerHTML = html;
    return el;
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* ---------------- sprites (all drawn around 0,0) ---------------- */
  var SPRITES = {
    bit: '<rect x="-25" y="-14" width="9" height="28" rx="3" fill="#1e293b"/><rect x="16" y="-14" width="9" height="28" rx="3" fill="#1e293b"/>' +
         '<rect x="-18" y="-20" width="36" height="40" rx="10" fill="#38bdf8" stroke="#0369a1" stroke-width="2.5"/>' +
         '<rect x="-12" y="-15" width="24" height="13" rx="6" fill="#0f172a"/>' +
         '<circle cx="-5" cy="-8.5" r="3" fill="#fef08a"/><circle cx="5" cy="-8.5" r="3" fill="#fef08a"/>' +
         '<path d="M0,-30 L8,-20 L-8,-20 Z" fill="#f97316" stroke="#9a3412" stroke-width="1.5" stroke-linejoin="round"/>' +
         '<circle cx="0" cy="9" r="4" fill="#e0f2fe"/>',
    pip: '<path d="M-19,-6 L-15,-27 L-3,-13 Z" fill="#ea580c"/><path d="M19,-6 L15,-27 L3,-13 Z" fill="#ea580c"/>' +
         '<path d="M-15,-9 L-13.5,-20 L-7,-12 Z" fill="#fed7aa"/><path d="M15,-9 L13.5,-20 L7,-12 Z" fill="#fed7aa"/>' +
         '<ellipse cx="0" cy="3" rx="21" ry="18" fill="#f97316"/>' +
         '<ellipse cx="-9" cy="11" rx="10" ry="8" fill="#fff"/><ellipse cx="9" cy="11" rx="10" ry="8" fill="#fff"/>' +
         '<circle cx="-8" cy="0" r="3.2" fill="#1f2937"/><circle cx="8" cy="0" r="3.2" fill="#1f2937"/>' +
         '<circle cx="-7" cy="-1" r="1" fill="#fff"/><circle cx="9" cy="-1" r="1" fill="#fff"/>' +
         '<ellipse cx="0" cy="8" rx="4" ry="3" fill="#1f2937"/>',
    gem: '<path d="M0,-17 L15,-4 L0,19 L-15,-4 Z" fill="#22d3ee" stroke="#0e7490" stroke-width="2" stroke-linejoin="round"/>' +
         '<path d="M0,-17 L15,-4 L-15,-4 Z" fill="#a5f3fc"/><path d="M-6,-4 L0,19 L6,-4 Z" fill="#67e8f9"/>',
    apple: '<path d="M0,-10 q2,-8 8,-9" stroke="#78350f" stroke-width="3" fill="none" stroke-linecap="round"/>' +
           '<ellipse cx="9" cy="-15" rx="7" ry="3.5" fill="#22c55e" transform="rotate(-25 9 -15)"/>' +
           '<path d="M0,-9 C-22,-18 -22,18 -6,18 C-2,18 -2,16 0,16 C2,16 2,18 6,18 C22,18 22,-18 0,-9 Z" fill="#ef4444" stroke="#991b1b" stroke-width="2"/>' +
           '<ellipse cx="-8" cy="-2" rx="3" ry="5" fill="#fecaca" transform="rotate(20 -8 -2)"/>',
    flag: '<ellipse cx="0" cy="20" rx="14" ry="5" fill="rgba(15,23,42,.25)"/>' +
          '<rect x="-9" y="-24" width="4" height="44" rx="2" fill="#475569"/>' +
          '<path d="M-5,-23 L18,-14 L-5,-5 Z" fill="#ef4444" stroke="#991b1b" stroke-width="1.5" stroke-linejoin="round"/>',
    home: '<rect x="-17" y="-4" width="34" height="24" rx="3" fill="#fde68a" stroke="#92400e" stroke-width="2"/>' +
          '<path d="M-23,-3 L0,-24 L23,-3 Z" fill="#ef4444" stroke="#991b1b" stroke-width="2" stroke-linejoin="round"/>' +
          '<rect x="-5" y="5" width="10" height="15" rx="4" fill="#92400e"/>',
    key: '<circle cx="-8" cy="0" r="9" fill="none" stroke="#eab308" stroke-width="5"/>' +
         '<path d="M1,0 H19 M12,0 V8 M18,0 V6" stroke="#eab308" stroke-width="5" stroke-linecap="round" fill="none"/>',
    door: '<rect x="-24" y="-26" width="48" height="52" rx="8" fill="#92400e" stroke="#451a03" stroke-width="3"/>' +
          '<rect x="-17" y="-19" width="34" height="38" rx="5" fill="#b45309"/>' +
          '<circle cx="0" cy="-3" r="5" fill="#451a03"/><rect x="-2.5" y="-2" width="5" height="12" rx="2" fill="#451a03"/>',
    rock: '<rect x="-28" y="-28" width="56" height="56" rx="12" fill="#475569"/>' +
          '<rect x="-28" y="-28" width="56" height="48" rx="12" fill="#64748b"/>' +
          '<path d="M-16,-14 h12 M4,-2 h14 M-14,8 h9" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>',
    bush: '<circle cx="-12" cy="8" r="16" fill="#15803d"/><circle cx="12" cy="8" r="16" fill="#15803d"/>' +
          '<circle cx="0" cy="-7" r="18" fill="#16a34a"/><circle cx="-12" cy="6" r="12" fill="#22c55e"/><circle cx="11" cy="7" r="11" fill="#22c55e"/>' +
          '<circle cx="-2" cy="-10" r="10" fill="#4ade80"/>'
  };

  /* ---------------- the board ---------------- */
  function Board(host, opts) {
    this.host = host;
    this.theme = (opts && opts.theme) || 'explorer';
    this.speed = 1;
    this.token = 0;
  }
  Board.prototype.load = function (world, opts) {
    this.world = world; this.fog = !!(opts && opts.fog);
    this.token++;
    this.host.innerHTML = '';
    var junior = this.theme === 'junior';
    var W = world.w * CELL, H = world.h * CELL;
    var root = this.svg = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'board board-' + this.theme, role: 'img',
                                       'aria-label': 'Game board' }, this.host);
    // Keep small boards from blowing up huge and big boards from overflowing.
    root.style.maxWidth = Math.min(W * (junior ? 1.9 : 1.35), 860) + 'px';
    svg('rect', { x: 0, y: 0, width: W, height: H, rx: 18, 'class': 'board-bg' }, root);
    var tiles = svg('g', {}, root), paint = this.paintLayer = svg('g', {}, root), items = svg('g', {}, root);
    this.items = {}; this.fogs = {};
    var self = this;
    function sprite(name, x, y, parent, cls) {
      var g = svg('g', { transform: 'translate(' + (x * CELL + CELL / 2) + ',' + (y * CELL + CELL / 2) + ')' }, parent || items);
      var inner = svg('g', { 'class': 'sprite ' + (cls || '') }, g);
      inner.innerHTML = SPRITES[name];
      return inner;
    }
    for (var y = 0; y < world.h; y++) for (var x = 0; x < world.w; x++) {
      var k = BB.engine.key(x, y);
      if (world.walls.has(k)) { sprite(junior ? 'bush' : 'rock', x, y, tiles, 'wall'); continue; }
      svg('rect', { x: x * CELL + 3, y: y * CELL + 3, width: CELL - 6, height: CELL - 6, rx: 10,
                    'class': 'tile ' + ((x + y) % 2 ? 'tile-a' : 'tile-b') }, tiles);
      if (world.targets.has(k)) {
        var c = COLORS[world.targets.get(k)];
        svg('rect', { x: x * CELL + 9, y: y * CELL + 9, width: CELL - 18, height: CELL - 18, rx: 8, fill: 'none',
                      stroke: c, 'stroke-width': 4, 'stroke-dasharray': '7 6' }, tiles);
        svg('circle', { cx: x * CELL + CELL / 2, cy: y * CELL + CELL / 2, r: 6, fill: c }, tiles);
      }
      if (world.goal && world.goal.x === x && world.goal.y === y) sprite(junior ? 'home' : 'flag', x, y, items, 'goal');
      if (world.gems.has(k)) this.items[k] = sprite(junior ? 'apple' : 'gem', x, y, items, 'bob');
      if (world.keys.has(k)) this.items[k] = sprite('key', x, y, items, 'bob');
      if (world.doors.has(k)) this.items[k] = sprite('door', x, y, items, 'door');
    }
    if (this.fog) {
      var fogLayer = svg('g', {}, root);
      for (var fy = 0; fy < world.h; fy++) for (var fx = 0; fx < world.w; fx++) {
        var f = svg('g', { 'class': 'fog' }, fogLayer);
        svg('rect', { x: fx * CELL + 2, y: fy * CELL + 2, width: CELL - 4, height: CELL - 4, rx: 10 }, f);
        var q = svg('text', { x: fx * CELL + CELL / 2, y: fy * CELL + CELL / 2 + 8, 'text-anchor': 'middle' }, f);
        q.textContent = '?';
        this.fogs[BB.engine.key(fx, fy)] = f;
      }
    }
    this.heroPos = svg('g', { 'class': 'hero-pos' }, root);
    this.heroRot = svg('g', { 'class': 'hero-rot' }, this.heroPos);
    this.heroRot.innerHTML = SPRITES[junior ? 'pip' : 'bit'];
    this.place(world.start.x, world.start.y, world.dir, true);
    self.reveal(world.start.x, world.start.y);
  };
  Board.prototype.reveal = function (x, y) {
    var f = this.fogs[BB.engine.key(x, y)];
    if (f) f.classList.add('clear');
  };
  Board.prototype.place = function (x, y, dir, instant) {
    var d = Math.round(380 / this.speed);
    this.heroPos.style.transitionDuration = this.heroRot.style.transitionDuration = (instant ? 0 : d) + 'ms';
    this.heroPos.style.transform = 'translate(' + (x * CELL + CELL / 2) + 'px,' + (y * CELL + CELL / 2) + 'px)';
    if (this.theme !== 'junior') {
      // Turn the short way round instead of spinning back through zero.
      if (instant || this.angle === undefined) this.angle = dir * 90;
      else { var diff = ((dir * 90 - this.angle) % 360 + 540) % 360 - 180; this.angle += diff; }
      this.heroRot.style.transform = 'rotate(' + this.angle + 'deg)';
    }
    this.hx = x; this.hy = y; this.hdir = dir;
  };
  Board.prototype.reset = function () { if (this.world) this.load(this.world, { fog: this.fog }); };
  Board.prototype.stop = function () { this.token++; };

  /* Animate a finished run. onStep(event) lets the page light up the matching block or line. */
  Board.prototype.play = async function (events, onStep) {
    var my = ++this.token, self = this;
    var d = function () { return Math.round(380 / self.speed); };
    for (var i = 0; i < events.length; i++) {
      if (my !== this.token) return false;
      var e = events[i];
      if (onStep && e.id !== undefined) onStep(e);
      if (e.t === 'move') {
        this.place(e.x, e.y, e.dir);
        BB.sound.play('step');
        await wait(d());
        this.reveal(e.x, e.y);
      } else if (e.t === 'turn') {
        this.place(this.hx, this.hy, e.dir);
        BB.sound.play('turn');
        await wait(d());
      } else if (e.t === 'gem' || e.t === 'key' || e.t === 'door') {
        var it = this.items[BB.engine.key(e.x, e.y)];
        if (it) it.classList.add('taken');
        BB.sound.play(e.t === 'door' ? 'door' : 'gem');
      } else if (e.t === 'paint') {
        svg('rect', { x: e.x * CELL + 5, y: e.y * CELL + 5, width: CELL - 10, height: CELL - 10, rx: 9,
                      fill: COLORS[e.color] || '#94a3b8', 'class': 'painted' }, this.paintLayer);
        BB.sound.play('paint');
        await wait(d() * 0.6);
      } else if (e.t === 'bonk') {
        this.heroPos.style.transitionDuration = '90ms';
        if (this.theme !== 'junior') this.place(this.hx, this.hy, e.dir);
        var bx = this.hx * CELL + CELL / 2 + BB.engine.DX[e.dir] * 14, by = this.hy * CELL + CELL / 2 + BB.engine.DY[e.dir] * 14;
        this.heroPos.style.transitionDuration = '90ms';
        this.heroPos.style.transform = 'translate(' + bx + 'px,' + by + 'px)';
        BB.sound.play('bonk');
        await wait(120);
        this.place(this.hx, this.hy, e.dir);
        await wait(300);
      }
    }
    return my === this.token;
  };

  /* ---------------- sound ---------------- */
  var ctx = null;
  var TONES = {
    step: [[330, 0.05]], turn: [[260, 0.05]], tap: [[520, 0.04]], paint: [[440, 0.06], [660, 0.06]],
    gem: [[880, 0.07], [1320, 0.1]], door: [[220, 0.08], [330, 0.12]], bonk: [[140, 0.18, 'sawtooth']],
    win: [[523, 0.11], [659, 0.11], [784, 0.11], [1047, 0.22]], fail: [[300, 0.12], [220, 0.2]],
    belt: [[523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.12], [784, 0.12], [1047, 0.35]]
  };
  BB.sound = {
    play: function (name) {
      if (!BB.store.settings().sound) return;
      try {
        ctx = ctx || new (root.AudioContext || root.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        var t = ctx.currentTime;
        (TONES[name] || []).forEach(function (n) {
          var o = ctx.createOscillator(), g = ctx.createGain();
          o.type = n[2] || 'triangle'; o.frequency.value = n[0];
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.16, t + 0.01);
          g.gain.exponentialRampToValueAtTime(0.0001, t + n[1]);
          o.connect(g); g.connect(ctx.destination);
          o.start(t); o.stop(t + n[1] + 0.02);
          t += n[1];
        });
      } catch (e) { /* no audio available */ }
    }
  };

  function speak(text) {
    try {
      if (!root.speechSynthesis) return;
      root.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.rate = 0.9; u.pitch = 1.1;
      root.speechSynthesis.speak(u);
    } catch (e) { /* no voice available */ }
  }

  function confetti() {
    var box = h('div', 'confetti');
    var colors = ['#f97316', '#facc15', '#22c55e', '#38bdf8', '#a855f7', '#ef4444'];
    for (var i = 0; i < 70; i++) {
      var p = h('i');
      p.style.left = Math.random() * 100 + '%';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = Math.random() * 0.5 + 's';
      p.style.animationDuration = 1.6 + Math.random() * 1.2 + 's';
      p.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(function () { box.remove(); }, 3400);
  }

  /* ---------------- pop-ups ---------------- */
  function modal(opts) {
    closeModal();
    var back = h('div', 'modal-back'), card = h('div', 'modal ' + (opts.cls || ''));
    card.setAttribute('role', 'dialog'); card.setAttribute('aria-modal', 'true');
    if (opts.art) card.appendChild(h('div', 'modal-art', opts.art));
    card.appendChild(h('h2', '', opts.title));
    if (opts.html) card.appendChild(h('div', 'modal-body', opts.html));
    var row = h('div', 'modal-buttons');
    (opts.buttons || [{ label: 'OK', primary: true }]).forEach(function (b) {
      var btn = h('button', 'btn ' + (b.primary ? 'btn-go' : 'btn-plain'), b.label);
      btn.onclick = function () { closeModal(); if (b.onClick) b.onClick(); };
      row.appendChild(btn);
    });
    card.appendChild(row);
    back.appendChild(card);
    document.body.appendChild(back);
    var first = row.querySelector('.btn-go') || row.querySelector('button');
    if (first) first.focus();
    return back;
  }
  function closeModal() { var m = document.querySelector('.modal-back'); if (m) m.remove(); }

  function starsHTML(n, total) {
    var s = '';
    for (var i = 1; i <= (total || 3); i++) s += '<span class="star' + (i <= n ? ' on' : '') + '">★</span>';
    return '<span class="stars" aria-label="' + n + ' of 3 stars">' + s + '</span>';
  }
  function beltHTML(belt, size) {
    var w = size || 64;
    return '<svg class="belt-icon" width="' + w + '" height="' + Math.round(w * 0.5) + '" viewBox="0 0 64 32" aria-hidden="true">' +
      '<rect x="2" y="8" width="60" height="12" rx="4" fill="' + belt.color + '" stroke="#0f172a" stroke-opacity=".35" stroke-width="1.5"/>' +
      '<path d="M27,20 L21,31 L28,31 L32,22 L36,31 L43,31 L37,20 Z" fill="' + belt.color + '" stroke="#0f172a" stroke-opacity=".35" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<rect x="26" y="6" width="12" height="16" rx="4" fill="' + belt.color + '" stroke="#0f172a" stroke-opacity=".45" stroke-width="1.5"/></svg>';
  }

  /* The level map: one row of level buttons per belt. */
  function renderMap(host, track, onPick) {
    var data = track === 'junior' ? BB.junior : BB.explorer, store = BB.store;
    host.innerHTML = '';
    data.belts.forEach(function (belt) {
      var list = data.levels.filter(function (l) { return l.belt === belt.id; });
      var done = list.filter(function (l) { return store.isDone(track, l.id); }).length;
      var sec = h('section', 'belt-row' + (done === list.length ? ' earned' : ''));
      sec.style.setProperty('--belt', belt.color);
      sec.appendChild(h('div', 'belt-head',
        beltHTML(belt, 72) + '<div><h3>' + belt.name + '</h3><p>' + belt.skill + '</p></div>' +
        '<span class="belt-count">' + (done === list.length ? 'Earned!' : done + ' / ' + list.length) + '</span>'));
      var row = h('div', 'level-row');
      list.forEach(function (l, i) {
        var open = store.isUnlocked(track, l.id), stars = store.stars(track, l.id);
        var b = h('button', 'level-btn' + (open ? '' : ' locked') + (stars ? ' done' : '') + (l.test ? ' test' : ''),
          '<span class="level-num">' + (l.test ? '★' : i + 1) + '</span>' + (track === 'junior' ? '' : '<span class="level-name">' + l.title.replace(/^.*Belt Test: /, '') + '</span>') +
          (stars ? starsHTML(stars) : '<span class="stars ghost">' + (open ? (l.test ? 'Belt Test' : 'Play') : 'Locked') + '</span>'));
        b.setAttribute('aria-label', belt.name + ', ' + l.title + (open ? '' : ', locked'));
        if (open) b.onclick = function () { BB.sound.play('tap'); onPick(l); };
        else b.disabled = true;
        row.appendChild(b);
      });
      sec.appendChild(row);
      host.appendChild(sec);
    });
  }

  /* Shown once when the last level of a belt is beaten. */
  function beltCeremony(belt, name, then) {
    confetti(); BB.sound.play('belt');
    modal({ cls: 'modal-belt', art: beltHTML(belt, 180),
            title: (name ? name + ', you' : 'You') + ' earned the ' + belt.name + '!',
            html: '<p class="belt-can">“' + belt.can + '”</p>',
            buttons: [{ label: 'Hooray!', primary: true, onClick: then }] });
  }

  BB.ui = { Board: Board, h: h, wait: wait, speak: speak, confetti: confetti, modal: modal, closeModal: closeModal,
            starsHTML: starsHTML, beltHTML: beltHTML, SPRITES: SPRITES, renderMap: renderMap, beltCeremony: beltCeremony, COLORS: COLORS };
})(window);
