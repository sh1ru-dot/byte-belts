/* Byte Belts — game engine.
   Runs a program (a small tree of commands) on a grid world and returns the
   list of things that happened, so the page can animate them afterwards.
   Works in the browser and in Node (for the level tests). */
(function (root) {
  'use strict';
  var BB = root.BB = root.BB || {};

  var DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];          // N, E, S, W
  var DIRS = { N: 0, E: 1, S: 2, W: 3 };
  var PAINT = { r: 'red', b: 'blue', y: 'yellow', p: 'purple', o: 'orange' };
  var MAX_ACTIONS = 600, MAX_OPS = 30000, MAX_DEPTH = 60;

  function key(x, y) { return x + ',' + y; }

  /* Grid letters:  # wall   . floor   S start   G goal   * gem
                    K key    D door    r b y p o = tile that must be painted */
  function parseGrid(rows, dir) {
    var w = { w: 0, h: rows.length, walls: new Set(), gems: new Set(), keys: new Set(),
              doors: new Set(), targets: new Map(), start: { x: 0, y: 0 }, goal: null,
              dir: typeof dir === 'number' ? dir : DIRS[dir || 'E'] };
    rows.forEach(function (row, y) {
      w.w = Math.max(w.w, row.length);
      for (var x = 0; x < row.length; x++) {
        var c = row[x], k = key(x, y);
        if (c === '#') w.walls.add(k);
        else if (c === 'S') w.start = { x: x, y: y };
        else if (c === 'G') w.goal = { x: x, y: y };
        else if (c === '*') w.gems.add(k);
        else if (c === 'K') w.keys.add(k);
        else if (c === 'D') w.doors.add(k);
        else if (PAINT[c]) w.targets.set(k, PAINT[c]);
      }
    });
    return w;
  }

  function gridsOf(level) { return level.grids || [level.grid]; }

  function Halt(reason, info) { this.reason = reason; this.info = info || {}; }

  function run(program, level, variant) {
    var world = parseGrid(gridsOf(level)[variant || 0], level.dir);
    var st = { x: world.start.x, y: world.start.y, dir: world.dir, gems: new Set(world.gems),
               keys: new Set(world.keys), hasKey: false, open: new Set(), painted: new Map() };
    var events = [], ops = 0, actions = 0, depth = 0;
    var funcs = program.funcs || {};

    function tick() { if (++ops > MAX_OPS) throw new Halt('forever'); }
    function act() { if (++actions > MAX_ACTIONS) throw new Halt('forever'); }

    function passable(x, y) {
      if (x < 0 || y < 0 || x >= world.w || y >= world.h) return false;
      var k = key(x, y);
      if (world.walls.has(k)) return false;
      if (world.doors.has(k) && !st.open.has(k) && !st.hasKey) return false;
      return true;
    }
    function ahead(turn) {
      var d = (st.dir + turn + 4) % 4;
      return passable(st.x + DX[d], st.y + DY[d]);
    }
    function step(id) {
      act();
      var nx = st.x + DX[st.dir], ny = st.y + DY[st.dir];
      if (!passable(nx, ny)) {
        events.push({ t: 'bonk', dir: st.dir, id: id, door: world.doors.has(key(nx, ny)) });
        throw new Halt('bonk', { door: world.doors.has(key(nx, ny)) });
      }
      st.x = nx; st.y = ny;
      events.push({ t: 'move', x: nx, y: ny, dir: st.dir, id: id });
      var k = key(nx, ny);
      if (st.gems.has(k)) { st.gems.delete(k); events.push({ t: 'gem', x: nx, y: ny }); }
      if (st.keys.has(k)) { st.keys.delete(k); st.hasKey = true; events.push({ t: 'key', x: nx, y: ny }); }
      if (world.doors.has(k) && !st.open.has(k)) { st.open.add(k); events.push({ t: 'door', x: nx, y: ny }); }
    }
    function turn(delta, id) {
      act();
      st.dir = (st.dir + delta + 4) % 4;
      events.push({ t: 'turn', dir: st.dir, delta: delta, id: id });
    }
    function paint(color, id) {
      act();
      st.painted.set(key(st.x, st.y), color);
      events.push({ t: 'paint', x: st.x, y: st.y, color: color, id: id });
    }

    function lookup(env, name) {
      for (var e = env; e; e = e.parent) if (e.vars.has(name)) return e;
      return null;
    }
    function child(env) { return { vars: new Map(), parent: env }; }
    function fail(msg, node) { throw new Halt('error', { message: msg, line: node && node.line, id: node && node.id }); }

    function ev(e, env) {
      tick();
      switch (e.t) {
        case 'num': case 'bool': case 'str': return e.v;
        case 'var': {
          var s = lookup(env, e.name);
          if (!s) fail('I can\'t find a variable called "' + e.name + '". Did you create it first?', e);
          return s.vars.get(e.name);
        }
        case 'sense':
          if (e.name === 'pathAhead') return ahead(0);
          if (e.name === 'pathLeft') return ahead(-1);
          if (e.name === 'pathRight') return ahead(1);
          if (e.name === 'atGoal') return !!world.goal && st.x === world.goal.x && st.y === world.goal.y;
          fail('Unknown question "' + e.name + '".', e); break;
        case 'not': return !ev(e.e, env);
        case 'neg': return -ev(e.e, env);
        case 'bin': {
          if (e.op === '&&') return !!ev(e.l, env) && !!ev(e.r, env);
          if (e.op === '||') return !!ev(e.l, env) || !!ev(e.r, env);
          var a = ev(e.l, env), b = ev(e.r, env);
          switch (e.op) {
            case '+': return a + b;
            case '-': return a - b;
            case '*': return a * b;
            case '/': if (b === 0) fail('Oops — you can\'t divide by zero!', e); return Math.trunc(a / b);
            case '%': if (b === 0) fail('Oops — you can\'t divide by zero!', e); return a % b;
            case '<': return a < b;
            case '<=': return a <= b;
            case '>': return a > b;
            case '>=': return a >= b;
            case '==': return a === b;
            case '!=': return a !== b;
          }
          fail('Unknown math sign ' + e.op, e); break;
        }
      }
      fail('I don\'t understand part of this code.', e);
    }

    function block(list, env) { for (var i = 0; i < list.length; i++) exec(list[i], env); }

    function exec(s, env) {
      tick();
      switch (s.t) {
        case 'call':
          if (s.name === 'moveForward') step(s.id);
          else if (s.name === 'turnLeft') turn(-1, s.id);
          else if (s.name === 'turnRight') turn(1, s.id);
          else if (s.name === 'paint') paint(String(ev(s.args[0], env)), s.id);
          else fail('Unknown command "' + s.name + '".', s);
          return;
        case 'go':                     // junior track: walk one tile in a compass direction
          st.dir = s.d; step(s.id); return;
        case 'repeat': {
          var n = Math.floor(Number(ev(s.count, env))) || 0;
          for (var i = 0; i < n; i++) { tick(); block(s.body, child(env)); }
          return;
        }
        case 'while':
          while (ev(s.cond, env)) { tick(); block(s.body, child(env)); }
          return;
        case 'for': {
          var fe = child(env);
          if (s.init) exec(s.init, fe);
          while (!s.cond || ev(s.cond, fe)) { tick(); block(s.body, child(fe)); if (s.update) exec(s.update, fe); }
          return;
        }
        case 'if':
          if (ev(s.cond, env)) block(s.then, child(env));
          else if (s.else) block(s.else, child(env));
          return;
        case 'block': block(s.body, child(env)); return;
        case 'decl': env.vars.set(s.name, ev(s.value, env)); return;
        case 'set': {
          var scope = lookup(env, s.name);
          if (!scope) fail('I can\'t find a variable called "' + s.name + '". Start it with:  int ' + s.name + ' = 0;', s);
          scope.vars.set(s.name, ev(s.value, env));
          return;
        }
        case 'invoke': {
          var f = funcs[s.name];
          if (!f) fail('I don\'t know how to "' + s.name + '" yet. Teach me by making a function with that name!', s);
          if (++depth > MAX_DEPTH) throw new Halt('forever');
          var fenv = child(globals);
          (f.params || []).forEach(function (p, idx) {
            fenv.vars.set(p, s.args && s.args[idx] ? ev(s.args[idx], env) : 0);
          });
          try { block(f.body, fenv); }
          catch (r) { if (r !== RETURN) throw r; }
          depth--;
          return;
        }
        case 'return': throw RETURN;
      }
      fail('I don\'t understand one of the commands.', s);
    }
    var RETURN = {};

    var globals = { vars: new Map(), parent: null };
    var result = { status: 'win', reason: null, info: {}, events: events, world: world, variant: variant || 0 };
    try {
      (program.globals || []).forEach(function (g) { globals.vars.set(g.name, g.value ? ev(g.value, globals) : 0); });
      if (!program.main || !program.main.length) throw new Halt('empty');
      try { block(program.main, child(globals)); }
      catch (r) { if (r !== RETURN) throw r; }
    } catch (e) {
      if (!(e instanceof Halt)) throw e;
      result.status = 'fail'; result.reason = e.reason; result.info = e.info;
    }

    if (result.status === 'win') {
      var unpainted = 0;
      world.targets.forEach(function (color, k) { if (st.painted.get(k) !== color) unpainted++; });
      var atGoal = !world.goal || (st.x === world.goal.x && st.y === world.goal.y);
      var missing = { gems: st.gems.size, paint: unpainted, goal: !atGoal };
      if (missing.gems || missing.paint || missing.goal) {
        result.status = 'fail';
        result.reason = missing.gems ? 'gems' : missing.paint ? 'paint' : 'goal';
        result.info = missing;
      }
    }
    result.actions = actions;
    return result;
  }

  /* Run on every version of a level (some levels change each time). The first
     failure is returned so the page can show what went wrong. */
  function runAll(program, level) {
    var n = gridsOf(level).length, first = null;
    for (var i = 0; i < n; i++) {
      var r = run(program, level, i);
      if (!first) first = r;
      if (r.status !== 'win') return r;
    }
    return first;
  }

  function walk(list, fn) {
    (list || []).forEach(function (s) {
      fn(s);
      if (s.body) walk(s.body, fn);
      if (s.then) walk(s.then, fn);
      if (s.else) walk(s.else, fn);
    });
  }
  function eachStmt(program, fn) {
    walk(program.main, fn);
    Object.keys(program.funcs || {}).forEach(function (n) { walk(program.funcs[n].body, fn); });
  }

  /* How many blocks / statements a program uses (for the star rating). */
  function countStmts(program) {
    var n = Object.keys(program.funcs || {}).length;
    eachStmt(program, function (s) { if (s.t !== 'block') n++; });
    return n;
  }

  /* Which big ideas a program uses, so a level can insist on e.g. a loop. */
  function uses(program) {
    var u = { loop: false, 'if': false, variable: false, 'function': false, 'while': false };
    eachStmt(program, function (s) {
      if (s.t === 'repeat' || s.t === 'for' || s.t === 'while') u.loop = true;
      if (s.t === 'while') u['while'] = true;
      if (s.t === 'if') u['if'] = true;
      if (s.t === 'decl' || s.t === 'set') u.variable = true;
      if (s.t === 'invoke') u['function'] = true;
    });
    if ((program.globals || []).length) u.variable = u.variable || false;
    return u;
  }
  function missingRequirement(program, level) {
    var u = uses(program), req = level.require || [];
    for (var i = 0; i < req.length; i++) if (!u[req[i]]) return req[i];
    return null;
  }

  function stars(count, par) {
    if (!par) return 3;
    return count <= par ? 3 : count <= par + 2 ? 2 : 1;
  }

  /* Junior track: a program is a row of tiles like "E2 S E3" (direction + how many times). */
  function juniorProgram(tiles) {
    return { main: tiles.map(function (t, i) {
      var go = { t: 'go', d: t.d, id: i };
      return t.n > 1 ? { t: 'repeat', count: { t: 'num', v: t.n }, body: [go], id: i } : go;
    }), funcs: {} };
  }
  function parseTiles(text) {
    return (text || '').trim().split(/\s+/).filter(Boolean).map(function (tok) {
      return { d: DIRS[tok[0]], n: tok.length > 1 ? parseInt(tok.slice(1), 10) : 1 };
    });
  }

  BB.engine = { DX: DX, DY: DY, DIRS: DIRS, PAINT: PAINT, key: key, parseGrid: parseGrid, gridsOf: gridsOf,
                run: run, runAll: runAll, countStmts: countStmts, uses: uses,
                missingRequirement: missingRequirement, stars: stars,
                juniorProgram: juniorProgram, parseTiles: parseTiles };
  if (typeof module !== 'undefined' && module.exports) module.exports = BB;
})(typeof window !== 'undefined' ? window : globalThis);
