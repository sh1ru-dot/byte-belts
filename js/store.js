/* Byte Belts — saved progress (kept in this browser only; nothing is sent anywhere). */
(function (root) {
  'use strict';
  var BB = root.BB = root.BB || {};
  var KEY = 'bytebelts.v1';
  var mem = null;

  function blank() {
    return { junior: { name: '', done: {}, work: {} }, explorer: { name: '', done: {}, work: {} },
             settings: { sound: true, unlockAll: false, javaLens: false, voice: true }, custom: null };
  }
  function load() {
    if (mem) return mem;
    mem = blank();
    try {
      var raw = JSON.parse(root.localStorage.getItem(KEY) || 'null');
      if (raw) ['junior', 'explorer', 'settings'].forEach(function (k) { Object.assign(mem[k], raw[k] || {}); });
      if (raw && raw.custom) mem.custom = raw.custom;
    } catch (e) { /* private mode or blocked storage: progress just lasts for this visit */ }
    return mem;
  }
  function save() { try { root.localStorage.setItem(KEY, JSON.stringify(load())); } catch (e) { /* ignore */ } }

  function levelsOf(track) { return track === 'junior' ? BB.junior : BB.explorer; }

  var store = {
    data: load,
    save: save,
    track: function (t) { return load()[t]; },
    settings: function () { return load().settings; },
    set: function (k, v) { load().settings[k] = v; save(); },
    stars: function (t, id) { var d = load()[t].done[id]; return d ? d.stars : 0; },
    isDone: function (t, id) { return !!load()[t].done[id]; },
    isUnlocked: function (t, id) {
      if (load().settings.unlockAll) return true;
      var list = levelsOf(t).levels, i = list.findIndex(function (l) { return l.id === id; });
      return i <= 0 || store.isDone(t, list[i - 1].id);
    },
    beltDone: function (t, beltId) {
      return levelsOf(t).levels.filter(function (l) { return l.belt === beltId; })
        .every(function (l) { return store.isDone(t, l.id); });
    },
    /* The highest belt fully earned so far (or null). */
    currentBelt: function (t) {
      var best = null, belts = levelsOf(t).belts;
      for (var i = 0; i < belts.length; i++) { if (store.beltDone(t, belts[i].id)) best = belts[i]; else break; }
      return best;
    },
    /* Record a win. Returns the belt if this win just completed it. */
    complete: function (t, id, stars) {
      var tr = load()[t], level = levelsOf(t).levels.find(function (l) { return l.id === id; });
      var had = level && store.beltDone(t, level.belt);
      var old = tr.done[id];
      tr.done[id] = { stars: Math.max(stars, old ? old.stars : 0), when: old ? old.when : Date.now() };
      save();
      if (level && !had && store.beltDone(t, level.belt)) return levelsOf(t).belts.find(function (b) { return b.id === level.belt; });
      return null;
    },
    work: function (t, id, value) {
      var tr = load()[t];
      if (value === undefined) return tr.work[id];
      tr.work[id] = value; save();
    },
    reset: function (t) { var d = load(); d[t] = blank()[t]; save(); },
    javaLensOpen: function () { return load().settings.javaLens || store.beltDone('explorer', 'blue'); }
  };
  BB.store = store;
})(typeof window !== 'undefined' ? window : globalThis);
