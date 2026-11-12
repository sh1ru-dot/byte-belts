/* Byte Belts — the block editor (built on Google's free Blockly library, the same
   family of blocks Scratch uses). Defines our blocks, the toolbox for each level,
   and turns a workspace of blocks into a program the engine can run. */
(function () {
  'use strict';
  var BB = window.BB, Blockly = window.Blockly;

  var PLAY_ICON = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#16a34a"/><path d="M9.5 7v10l8-5z" fill="#fff"/></svg>');

  Blockly.common.defineBlocksWithJsonArray([
    { type: 'bb_start', message0: 'when %1 Run is pressed',
      args0: [{ type: 'field_image', src: PLAY_ICON, width: 22, height: 22, alt: 'Run' }],
      nextStatement: null, style: 'bb_hat', tooltip: 'Your program starts here. Snap blocks underneath.' },
    { type: 'bb_move', message0: 'move forward', previousStatement: null, nextStatement: null, style: 'bb_action',
      tooltip: 'Bit rolls one square the way he is facing.' },
    { type: 'bb_turn_left', message0: 'turn left ↺', previousStatement: null, nextStatement: null, style: 'bb_action',
      tooltip: 'Bit turns to his left without leaving his square.' },
    { type: 'bb_turn_right', message0: 'turn right ↻', previousStatement: null, nextStatement: null, style: 'bb_action',
      tooltip: 'Bit turns to his right without leaving his square.' },
    { type: 'bb_paint', message0: 'paint %1',
      args0: [{ type: 'field_dropdown', name: 'COLOR',
                options: [['red', 'red'], ['blue', 'blue'], ['yellow', 'yellow'], ['purple', 'purple'], ['orange', 'orange']] }],
      previousStatement: null, nextStatement: null, style: 'bb_paint', tooltip: 'Paint the square Bit is standing on.' },
    { type: 'bb_path', message0: 'path %1 ?',
      args0: [{ type: 'field_dropdown', name: 'DIR', options: [['ahead', 'pathAhead'], ['to the left', 'pathLeft'], ['to the right', 'pathRight']] }],
      output: 'Boolean', style: 'bb_sense', tooltip: 'Yes if Bit could roll that way.' },
    { type: 'bb_at_goal', message0: 'at flag ?', output: 'Boolean', style: 'bb_sense', tooltip: 'Yes when Bit is on the flag.' }
  ]);

  var font = { family: 'ui-rounded, "SF Pro Rounded", "Nunito", "Segoe UI", system-ui, sans-serif', weight: '700', size: 12 };
  var theme = Blockly.Theme.defineTheme('bytebelts', {
    name: 'bytebelts',
    base: Blockly.Themes.Zelos || Blockly.Themes.Classic,
    blockStyles: {
      bb_hat: { colourPrimary: '#f59e0b', colourTertiary: '#b45309', hat: 'cap' },
      bb_action: { colourPrimary: '#3b82f6', colourTertiary: '#1d4ed8' },
      bb_paint: { colourPrimary: '#ec4899', colourSecondary: '#f9a8d4', colourTertiary: '#be185d' },
      bb_sense: { colourPrimary: '#06b6d4', colourSecondary: '#67e8f9', colourTertiary: '#0e7490' },
      loop_blocks: { colourPrimary: '#f97316', colourTertiary: '#c2410c' },
      logic_blocks: { colourPrimary: '#8b5cf6', colourTertiary: '#6d28d9' },
      math_blocks: { colourPrimary: '#22c55e', colourTertiary: '#15803d' },
      variable_blocks: { colourPrimary: '#ef4444', colourTertiary: '#b91c1c' },
      procedure_blocks: { colourPrimary: '#d946ef', colourTertiary: '#a21caf' }
    },
    categoryStyles: {
      c_action: { colour: '#3b82f6' }, c_loop: { colour: '#f97316' }, c_logic: { colour: '#8b5cf6' },
      c_math: { colour: '#22c55e' }, c_var: { colour: '#ef4444' }, c_func: { colour: '#d946ef' }
    },
    componentStyles: { workspaceBackgroundColour: '#f8fafc', toolboxBackgroundColour: '#1e293b', toolboxForegroundColour: '#ffffff',
                       flyoutBackgroundColour: '#e2e8f0', flyoutForegroundColour: '#1e293b', flyoutOpacity: 1,
                       scrollbarColour: '#94a3b8', scrollbarOpacity: 0.5 },
    fontStyle: font
  });

  var num = function (n) { return { shadow: { type: 'math_number', fields: { NUM: n } } }; };
  var DEFS = {
    move: { kind: 'block', type: 'bb_move' },
    left: { kind: 'block', type: 'bb_turn_left' },
    right: { kind: 'block', type: 'bb_turn_right' },
    paint: { kind: 'block', type: 'bb_paint' },
    repeat: { kind: 'block', type: 'controls_repeat_ext', inputs: { TIMES: num(4) } },
    untilgoal: { kind: 'block', type: 'controls_whileUntil', fields: { MODE: 'UNTIL' }, inputs: { BOOL: { block: { type: 'bb_at_goal' } } } },
    'while': { kind: 'block', type: 'controls_whileUntil', fields: { MODE: 'WHILE' }, inputs: { BOOL: { block: { type: 'bb_path' } } } },
    'if': { kind: 'block', type: 'controls_if' },
    ifelse: { kind: 'block', type: 'controls_ifelse' },
    path: { kind: 'block', type: 'bb_path' },
    atgoal: { kind: 'block', type: 'bb_at_goal' },
    not: { kind: 'block', type: 'logic_negate' },
    compare: { kind: 'block', type: 'logic_compare', inputs: { A: num(0), B: num(0) } },
    number: { kind: 'block', type: 'math_number', fields: { NUM: 1 } },
    math: { kind: 'block', type: 'math_arithmetic', inputs: { A: num(1), B: num(1) } }
  };
  var CATS = [
    { name: 'Actions', style: 'c_action', keys: ['move', 'left', 'right', 'paint'] },
    { name: 'Loops', style: 'c_loop', keys: ['repeat', 'untilgoal', 'while'] },
    { name: 'Questions', style: 'c_logic', keys: ['if', 'ifelse', 'path', 'atgoal', 'not', 'compare'] },
    { name: 'Numbers', style: 'c_math', keys: ['number', 'math'] }
  ];

  function varBlocks(names) {
    var out = [];
    names.forEach(function (n) {
      var v = { VAR: { id: 'var_' + n } };
      out.push({ kind: 'block', type: 'variables_set', fields: v, inputs: { VALUE: num(1) } });
      out.push({ kind: 'block', type: 'math_change', fields: v, inputs: { DELTA: num(1) } });
      out.push({ kind: 'block', type: 'variables_get', fields: v });
    });
    return out;
  }

  /* Early levels get a simple always-open tray; once functions arrive we switch to drawers. */
  function toolboxFor(level) {
    var keys = level.blocks || [], vars = level.vars || [];
    if (keys.indexOf('functions') < 0) {
      var contents = keys.filter(function (k) { return DEFS[k]; }).map(function (k) { return DEFS[k]; });
      if (keys.indexOf('vars') >= 0) contents = contents.concat(varBlocks(vars));
      return { kind: 'flyoutToolbox', contents: contents };
    }
    var cats = CATS.map(function (c) {
      return { kind: 'category', name: c.name, categorystyle: c.style,
               contents: c.keys.filter(function (k) { return keys.indexOf(k) >= 0; }).map(function (k) { return DEFS[k]; }) };
    }).filter(function (c) { return c.contents.length; });
    cats.push({ kind: 'category', name: 'Variables', categorystyle: 'c_var', custom: 'VARIABLE' });
    cats.push({ kind: 'category', name: 'Functions', categorystyle: 'c_func', custom: 'BB_FUNCS' });
    return { kind: 'categoryToolbox', contents: cats };
  }

  /* Our own Functions drawer: just "make a function" plus a call block for each one made so far. */
  function funcsFlyout(ws) {
    var list = [{ kind: 'block', type: 'procedures_defnoreturn', fields: { NAME: 'my trick' } }];
    Blockly.Procedures.allProcedures(ws)[0].forEach(function (p) {
      list.push({ kind: 'block', type: 'procedures_callnoreturn', extraState: { name: p[0], params: p[1] } });
    });
    return list;
  }

  var START = { blocks: { languageVersion: 0, blocks: [{ type: 'bb_start', x: 30, y: 30 }] } };

  function create(host, level, saved) {
    var ws = Blockly.inject(host, {
      toolbox: toolboxFor(level), theme: theme, renderer: 'zelos', media: 'vendor/blockly/media/',
      trashcan: true, sounds: BB.store.settings().sound,
      zoom: { controls: true, wheel: false, startScale: 0.85, maxScale: 1.4, minScale: 0.5, scaleSpeed: 1.15 },
      move: { scrollbars: true, drag: true, wheel: true }
    });
    ws.registerToolboxCategoryCallback('BB_FUNCS', funcsFlyout);
    (level.vars || []).forEach(function (n) {
      if (!ws.getVariableMap().getVariableById('var_' + n)) ws.getVariableMap().createVariable(n, '', 'var_' + n);
    });
    var state = saved || (level.starter && BB.explorer.starters[level.starter]) || START;
    try { Blockly.serialization.workspaces.load(state, ws); }
    catch (e) { ws.clear(); Blockly.serialization.workspaces.load(START, ws); }
    if (!ws.getBlocksByType('bb_start', false).length) Blockly.serialization.blocks.append({ type: 'bb_start', x: 30, y: 30 }, ws);
    ws.getBlocksByType('bb_start', false).forEach(function (b) { b.setDeletable(false); });
    if (state.tidy) ws.cleanUp();
    // With drawers, an open drawer covers the left edge — start the program clear of it.
    if ((!saved || state.tidy) && (level.blocks || []).indexOf('functions') >= 0)
      ws.getTopBlocks(false).forEach(function (b) { b.moveBy(190, 0); });
    ws.clearUndo();
    return ws;
  }

  /* ---------- blocks -> program ---------- */
  function Hole(message, blockId) { this.message = message; this.blockId = blockId; }

  var COMPARE = { EQ: '==', NEQ: '!=', LT: '<', LTE: '<=', GT: '>', GTE: '>=' };
  var MATH = { ADD: '+', MINUS: '-', MULTIPLY: '*', DIVIDE: '/' };

  function compile(ws) {
    var used = {}, params = {};
    function varName(b) { var n = b.getField('VAR').getText(); used[n] = true; return n; }
    function value(b, input, kind) {
      var t = b.getInputTargetBlock(input);
      if (!t) throw new Hole('One of your blocks has an empty hole. Drop ' + (kind === 'bool' ? 'a question block' : 'a number') + ' into it.', b.id);
      return ex(t);
    }
    function ex(b) {
      switch (b.type) {
        case 'math_number': return { t: 'num', v: Number(b.getFieldValue('NUM')) };
        case 'logic_boolean': return { t: 'bool', v: b.getFieldValue('BOOL') === 'TRUE' };
        case 'variables_get': return { t: 'var', name: varName(b) };
        case 'bb_path': return { t: 'sense', name: b.getFieldValue('DIR') };
        case 'bb_at_goal': return { t: 'sense', name: 'atGoal' };
        case 'logic_negate': return { t: 'not', e: value(b, 'BOOL', 'bool') };
        case 'logic_operation': return { t: 'bin', op: b.getFieldValue('OP') === 'AND' ? '&&' : '||', l: value(b, 'A', 'bool'), r: value(b, 'B', 'bool') };
        case 'logic_compare': return { t: 'bin', op: COMPARE[b.getFieldValue('OP')], l: value(b, 'A'), r: value(b, 'B') };
        case 'math_arithmetic':
          if (!MATH[b.getFieldValue('OP')]) throw new Hole('That maths sign is not ready yet — use + - × or ÷.', b.id);
          return { t: 'bin', op: MATH[b.getFieldValue('OP')], l: value(b, 'A'), r: value(b, 'B') };
      }
      throw new Hole('I don\'t know how to use that block here.', b.id);
    }
    function chain(b) {
      var out = [];
      for (; b; b = b.getNextBlock()) if (b.isEnabled()) out.push(st(b));
      return out;
    }
    function st(b) {
      var id = b.id;
      switch (b.type) {
        case 'bb_move': return { t: 'call', name: 'moveForward', args: [], id: id };
        case 'bb_turn_left': return { t: 'call', name: 'turnLeft', args: [], id: id };
        case 'bb_turn_right': return { t: 'call', name: 'turnRight', args: [], id: id };
        case 'bb_paint': return { t: 'call', name: 'paint', args: [{ t: 'str', v: b.getFieldValue('COLOR') }], id: id };
        case 'controls_repeat_ext':
          return { t: 'repeat', count: value(b, 'TIMES'), body: chain(b.getInputTargetBlock('DO')), id: id };
        case 'controls_whileUntil': {
          var c = value(b, 'BOOL', 'bool');
          if (b.getFieldValue('MODE') === 'UNTIL') c = { t: 'not', e: c };
          return { t: 'while', cond: c, body: chain(b.getInputTargetBlock('DO')), id: id };
        }
        case 'controls_if': case 'controls_ifelse': {
          var first = null, last = null;
          for (var i = 0; b.getInput('IF' + i); i++) {
            var node = { t: 'if', cond: value(b, 'IF' + i, 'bool'), then: chain(b.getInputTargetBlock('DO' + i)), 'else': null, id: id };
            if (last) { node.chained = true; node.id = id + ':' + i; last['else'] = [node]; } else first = node;
            last = node;
          }
          if (b.getInput('ELSE')) last['else'] = chain(b.getInputTargetBlock('ELSE'));
          return first;
        }
        case 'variables_set': return { t: 'set', name: varName(b), value: value(b, 'VALUE'), id: id };
        case 'math_change': {
          var name = varName(b), d = value(b, 'DELTA'), op = '+';
          if (d.t === 'num' && d.v < 0) { d = { t: 'num', v: -d.v }; op = '-'; }
          return { t: 'set', name: name, value: { t: 'bin', op: op, l: { t: 'var', name: name }, r: d }, id: id };
        }
        case 'procedures_callnoreturn': {
          var args = [];
          for (var a = 0; b.getInput('ARG' + a); a++) {
            var t = b.getInputTargetBlock('ARG' + a);
            args.push(t ? ex(t) : { t: 'num', v: 0 });
          }
          return { t: 'invoke', name: b.getProcedureCall(), args: args, id: id };
        }
      }
      throw new Hole('That block can\'t be used as a command.', id);
    }

    var program = { globals: [], main: [], funcs: {} };
    var start = ws.getBlocksByType('bb_start', false)[0];
    program.main = start ? chain(start.getNextBlock()) : [];
    ws.getBlocksByType('procedures_defnoreturn', false).forEach(function (d) {
      var def = d.getProcedureDef();
      def[1].forEach(function (p) { params[p] = true; });
      program.funcs[def[0]] = { params: def[1], body: chain(d.getInputTargetBlock('STACK')), id: d.id };
    });
    program.globals = Object.keys(used).filter(function (n) { return !params[n]; })
      .map(function (n) { return { name: n, value: { t: 'num', v: 0 } }; });
    return program;
  }

  /* ---------- program -> blocks (used to show a model answer as blocks) ---------- */
  function fromProgram(program) {
    var vars = {};
    function v(name) { vars[name] = true; return { VAR: { id: 'var_' + name } }; }
    function opKey(map, op) { return Object.keys(map).find(function (k) { return map[k] === op; }); }
    function ex(e) {
      switch (e.t) {
        case 'num': return { type: 'math_number', fields: { NUM: e.v } };
        case 'bool': return { type: 'logic_boolean', fields: { BOOL: e.v ? 'TRUE' : 'FALSE' } };
        case 'var': return { type: 'variables_get', fields: v(e.name) };
        case 'sense': return e.name === 'atGoal' ? { type: 'bb_at_goal' } : { type: 'bb_path', fields: { DIR: e.name } };
        case 'not': return { type: 'logic_negate', inputs: { BOOL: { block: ex(e.e) } } };
        case 'bin':
          if (e.op === '&&' || e.op === '||') return { type: 'logic_operation', fields: { OP: e.op === '&&' ? 'AND' : 'OR' }, inputs: { A: { block: ex(e.l) }, B: { block: ex(e.r) } } };
          if (opKey(COMPARE, e.op)) return { type: 'logic_compare', fields: { OP: opKey(COMPARE, e.op) }, inputs: { A: numIn(e.l), B: numIn(e.r) } };
          return { type: 'math_arithmetic', fields: { OP: opKey(MATH, e.op) || 'ADD' }, inputs: { A: numIn(e.l), B: numIn(e.r) } };
      }
      return { type: 'math_number', fields: { NUM: 0 } };
    }
    function numIn(e) { return e.t === 'num' ? num(e.v) : { shadow: num(1).shadow, block: ex(e) }; }
    function chain(list) {
      var first = null, last = null;
      (list || []).forEach(function (s) {
        var b = st(s);
        if (!b) return;
        if (last) last.next = { block: b }; else first = b;
        last = b;
      });
      return first;
    }
    function stack(list) { var c = chain(list); return c ? { block: c } : undefined; }
    function clean(inputs) { Object.keys(inputs).forEach(function (k) { if (!inputs[k]) delete inputs[k]; }); return inputs; }
    function st(s) {
      switch (s.t) {
        case 'call':
          if (s.name === 'paint') return { type: 'bb_paint', fields: { COLOR: s.args[0].v } };
          return { type: { moveForward: 'bb_move', turnLeft: 'bb_turn_left', turnRight: 'bb_turn_right' }[s.name] };
        case 'repeat': return { type: 'controls_repeat_ext', inputs: clean({ TIMES: numIn(s.count), DO: stack(s.body) }) };
        case 'for':      // the usual counting loop becomes a repeat block
          return { type: 'controls_repeat_ext', inputs: clean({ TIMES: numIn(s.cond && s.cond.r ? s.cond.r : { t: 'num', v: 1 }), DO: stack(s.body) }) };
        case 'while': {
          var until = s.cond.t === 'not';
          return { type: 'controls_whileUntil', fields: { MODE: until ? 'UNTIL' : 'WHILE' },
                   inputs: clean({ BOOL: { block: ex(until ? s.cond.e : s.cond) }, DO: stack(s.body) }) };
        }
        case 'if':
          return { type: s['else'] ? 'controls_ifelse' : 'controls_if',
                   inputs: clean({ IF0: { block: ex(s.cond) }, DO0: stack(s.then), ELSE: s['else'] ? stack(s['else']) : undefined }) };
        case 'decl': case 'set': {
          var val = s.value;
          if (s.t === 'set' && val.t === 'bin' && val.l.t === 'var' && val.l.name === s.name && val.r.t === 'num' && (val.op === '+' || val.op === '-'))
            return { type: 'math_change', fields: v(s.name), inputs: { DELTA: num(val.op === '-' ? -val.r.v : val.r.v) } };
          return { type: 'variables_set', fields: v(s.name), inputs: { VALUE: numIn(val) } };
        }
        case 'invoke': return { type: 'procedures_callnoreturn', extraState: { name: s.name } };
      }
      return null;
    }
    var top = [{ type: 'bb_start', x: 30, y: 30 }], y = 30;
    var main = chain(program.main);
    if (main) top[0].next = { block: main };
    Object.keys(program.funcs || {}).forEach(function (name) {
      top.push({ type: 'procedures_defnoreturn', x: 30, y: (y += 400), fields: { NAME: name }, inputs: clean({ STACK: stack(program.funcs[name].body) }) });
    });
    (program.globals || []).forEach(function (g) { vars[g.name] = true; });
    return { tidy: true, blocks: { languageVersion: 0, blocks: top },
             variables: Object.keys(vars).map(function (n) { return { name: n, id: 'var_' + n }; }) };
  }

  BB.blocks = { create: create, compile: compile, fromProgram: fromProgram, Hole: Hole, START: START };
})();
