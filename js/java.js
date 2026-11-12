/* Byte Belts — the Java bridge.
   toJava(program)  turns a block program into real Java text.
   parse(text)      reads kid-typed Java (a friendly subset) into a program.
   highlight(text)  colours Java for display. */
(function (root) {
  'use strict';
  var BB = root.BB = root.BB || {};

  var ACTIONS = ['moveForward', 'turnLeft', 'turnRight', 'paint'];
  var SENSORS = ['pathAhead', 'pathLeft', 'pathRight', 'atGoal'];
  var TYPES = ['int', 'boolean', 'String', 'double', 'long', 'void', 'Hero'];
  var MODS = ['public', 'private', 'protected', 'static', 'final'];
  var RESERVED = ['int', 'boolean', 'String', 'double', 'long', 'void', 'class', 'public', 'private', 'static',
    'final', 'if', 'else', 'while', 'for', 'return', 'new', 'true', 'false', 'hero', 'do', 'switch', 'case', 'break'];

  /* ---------- names ---------- */
  function javaName(raw) {
    var parts = String(raw).split(/[^A-Za-z0-9]+/).filter(Boolean);
    if (!parts.length) return 'thing';
    var name = parts.map(function (p, i) {
      return i === 0 ? p.charAt(0).toLowerCase() + p.slice(1) : p.charAt(0).toUpperCase() + p.slice(1);
    }).join('');
    if (/^[0-9]/.test(name)) name = 'n' + name;
    if (RESERVED.indexOf(name) >= 0) name += '_';
    return name;
  }

  /* ---------- program -> Java text ---------- */
  var PREC = { '||': 1, '&&': 2, '==': 3, '!=': 3, '<': 4, '<=': 4, '>': 4, '>=': 4, '+': 5, '-': 5, '*': 6, '/': 6, '%': 6 };

  function expr(e, parentPrec) {
    switch (e.t) {
      case 'num': return String(e.v);
      case 'bool': return e.v ? 'true' : 'false';
      case 'str': return '"' + e.v + '"';
      case 'var': return javaName(e.name);
      case 'sense': return 'hero.' + e.name + '()';
      case 'not': return '!' + expr(e.e, 7);
      case 'neg': return '-' + expr(e.e, 7);
      case 'bin': {
        var p = PREC[e.op] || 0;
        var s = expr(e.l, p) + ' ' + e.op + ' ' + expr(e.r, p + 1);
        return p < (parentPrec || 0) ? '(' + s + ')' : s;
      }
    }
    return '0';
  }

  function toJava(program, opts) {
    opts = opts || {};
    var lines = [], idLine = {};
    var taken = {};
    (program.globals || []).forEach(function (g) { taken[javaName(g.name)] = true; });
    function emit(indent, text, id) {
      lines.push(new Array(indent + 1).join('    ') + text);
      if (id !== undefined && id !== null && idLine[id] === undefined) idLine[id] = lines.length;
    }
    function inline(s) {             // a statement without its semicolon (for the for-header)
      if (!s) return '';
      if (s.t === 'decl') return 'int ' + javaName(s.name) + ' = ' + expr(s.value);
      if (s.t === 'set') {       // i++ is the usual spelling inside a for-header
        var v = s.value;
        if (v.t === 'bin' && v.l.t === 'var' && v.l.name === s.name && v.r.t === 'num' && v.r.v === 1 && (v.op === '+' || v.op === '-'))
          return javaName(s.name) + v.op + v.op;
        return assign(s);
      }
      return '';
    }
    function assign(s) { return javaName(s.name) + ' = ' + expr(s.value); }
    function body(list, indent, loopVars) {
      (list || []).forEach(function (s) { stmt(s, indent, loopVars); });
    }
    function stmt(s, ind, loopVars) {
      switch (s.t) {
        case 'call':
          emit(ind, 'hero.' + s.name + '(' + (s.args || []).map(function (a) { return expr(a); }).join(', ') + ');', s.id);
          break;
        case 'repeat': {
          var v = ['i', 'j', 'k', 'a', 'b', 'c', 'd', 'e'].filter(function (c) {
            return !taken[c] && loopVars.indexOf(c) < 0;
          })[0] || 'n' + loopVars.length;
          emit(ind, 'for (int ' + v + ' = 0; ' + v + ' < ' + expr(s.count, 5) + '; ' + v + '++) {', s.id);
          body(s.body, ind + 1, loopVars.concat(v));
          emit(ind, '}');
          break;
        }
        case 'for':
          emit(ind, 'for (' + inline(s.init) + '; ' + (s.cond ? expr(s.cond) : '') + '; ' + inline(s.update) + ') {', s.id);
          body(s.body, ind + 1, loopVars);
          emit(ind, '}');
          break;
        case 'while':
          emit(ind, 'while (' + expr(s.cond) + ') {', s.id);
          body(s.body, ind + 1, loopVars);
          emit(ind, '}');
          break;
        case 'if':
          emit(ind, 'if (' + expr(s.cond) + ') {', s.id);
          body(s.then, ind + 1, loopVars);
          var e = s.else;
          while (e && e.length === 1 && e[0].t === 'if' && e[0].chained) {
            emit(ind, '} else if (' + expr(e[0].cond) + ') {', e[0].id);
            body(e[0].then, ind + 1, loopVars);
            e = e[0].else;
          }
          if (e && e.length) { emit(ind, '} else {'); body(e, ind + 1, loopVars); }
          emit(ind, '}');
          break;
        case 'block': emit(ind, '{'); body(s.body, ind + 1, loopVars); emit(ind, '}'); break;
        case 'decl': emit(ind, 'int ' + javaName(s.name) + ' = ' + expr(s.value) + ';', s.id); break;
        case 'set': emit(ind, assign(s) + ';', s.id); break;
        case 'invoke':
          emit(ind, javaName(s.name) + '(' + (s.args || []).map(function (a) { return expr(a); }).join(', ') + ');', s.id);
          break;
        case 'return': emit(ind, 'return;', s.id); break;
      }
    }

    emit(0, 'public class Mission {');
    emit(1, 'static Hero hero = new Hero();');
    (program.globals || []).forEach(function (g) {
      emit(1, 'static int ' + javaName(g.name) + ' = ' + (g.value ? expr(g.value) : '0') + ';');
    });
    emit(0, '');
    emit(1, 'public static void main(String[] args) {');
    if (program.main && program.main.length) body(program.main, 2, []);
    else emit(2, opts.emptyHint || '// Snap blocks under "when Run is pressed"');
    emit(1, '}');
    Object.keys(program.funcs || {}).forEach(function (name) {
      var f = program.funcs[name];
      emit(0, '');
      emit(1, 'static void ' + javaName(name) + '(' + (f.params || []).map(function (p) { return 'int ' + javaName(p); }).join(', ') + ') {', f.id);
      body(f.body, 2, []);
      emit(1, '}');
    });
    emit(0, '}');
    return { text: lines.join('\n'), idLine: idLine };
  }

  /* ---------- Java text -> program ---------- */
  function JavaError(message, line) { this.message = message; this.line = line; }

  function lex(src) {
    var toks = [], i = 0, line = 1, n = src.length;
    var ops = ['++', '--', '+=', '-=', '*=', '/=', '%=', '==', '!=', '<=', '>=', '&&', '||',
               '{', '}', '(', ')', '[', ']', ';', ',', '.', '=', '<', '>', '+', '-', '*', '/', '%', '!'];
    while (i < n) {
      var c = src[i];
      if (c === '\n') { line++; i++; continue; }
      if (/\s/.test(c)) { i++; continue; }
      if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
      if (c === '/' && src[i + 1] === '*') {
        var end = src.indexOf('*/', i + 2);
        if (end < 0) throw new JavaError('A comment starts with /* but never ends with */', line);
        line += src.slice(i, end).split('\n').length - 1; i = end + 2; continue;
      }
      if (/[A-Za-z_$]/.test(c)) {
        var j = i; while (j < n && /[A-Za-z0-9_$]/.test(src[j])) j++;
        toks.push({ k: 'id', v: src.slice(i, j), line: line }); i = j; continue;
      }
      if (/[0-9]/.test(c)) {
        var m = i; while (m < n && /[0-9]/.test(src[m])) m++;
        toks.push({ k: 'num', v: parseInt(src.slice(i, m), 10), line: line }); i = m; continue;
      }
      if (c === '"' || c === '“' || c === '”') {
        var q = i + 1; while (q < n && src[q] !== '"' && src[q] !== '”' && src[q] !== '\n') q++;
        if (q >= n || src[q] === '\n') throw new JavaError('Words in "quotes" need a closing quote mark.', line);
        toks.push({ k: 'str', v: src.slice(i + 1, q), line: line }); i = q + 1; continue;
      }
      var op = null;
      for (var o = 0; o < ops.length; o++) if (src.substr(i, ops[o].length) === ops[o]) { op = ops[o]; break; }
      if (!op) throw new JavaError('I don\'t know what "' + c + '" means here.', line);
      toks.push({ k: 'op', v: op, line: line }); i += op.length;
    }
    toks.push({ k: 'eof', v: '(end)', line: line });
    return toks;
  }

  function closest(word, list) {
    function dist(a, b) {
      var d = [], i, j;
      for (i = 0; i <= a.length; i++) { d[i] = [i]; }
      for (j = 1; j <= b.length; j++) d[0][j] = j;
      for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++)
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      return d[a.length][b.length];
    }
    var best = null, bd = 99;
    list.forEach(function (w) { var x = dist(word.toLowerCase(), w.toLowerCase()); if (x < bd) { bd = x; best = w; } });
    return bd <= 4 ? best : null;
  }

  function parse(src) {
    var toks = lex(src), p = 0;
    var program = { globals: [], main: null, funcs: {} };
    var loose = [];

    function peek(o) { return toks[Math.min(p + (o || 0), toks.length - 1)]; }
    function next() { return toks[p++]; }
    function is(v, o) { var t = peek(o); return (t.k === 'op' || t.k === 'id') && t.v === v; }
    function prevLine() { return p > 0 ? toks[p - 1].line : 1; }
    function err(msg, line) { throw new JavaError(msg, line || peek().line); }
    function expect(v) {
      if (is(v)) return next();
      var got = peek();
      if (v === ';') err('Java commands end with a semicolon  ;  — add one at the end of line ' + prevLine() + '.', prevLine());
      if (v === '}') err('A curly brace { was opened but never closed. Add a } to match it.', got.k === 'eof' ? prevLine() : got.line);
      if (v === ')') err('A round bracket ( needs a matching ) on line ' + prevLine() + '.', prevLine());
      if (v === '(') err('Put round brackets ( ) after "' + toks[p - 1].v + '".', prevLine());
      if (v === '{') err('Put a curly brace { here to start the block.', prevLine());
      err('I expected "' + v + '" but found "' + got.v + '".');
    }
    function ident(what) {
      var t = peek();
      if (t.k !== 'id') err('I expected ' + what + ' here but found "' + t.v + '".');
      if (t.v === '____') err('Fill in the blank ____ on line ' + t.line + ' first!');
      return next().v;
    }
    function isType(o) { var t = peek(o); return t.k === 'id' && TYPES.indexOf(t.v) >= 0; }
    function skipMods() { var any = false; while (peek().k === 'id' && MODS.indexOf(peek().v) >= 0) { next(); any = true; } return any; }

    /* expressions */
    function primary() {
      var t = peek();
      if (t.k === 'num') { next(); return { t: 'num', v: t.v, line: t.line }; }
      if (t.k === 'str') { next(); return { t: 'str', v: t.v, line: t.line }; }
      if (is('(')) { next(); var e = expression(); expect(')'); return e; }
      if (t.k === 'id') {
        if (t.v === 'true' || t.v === 'false') { next(); return { t: 'bool', v: t.v === 'true', line: t.line }; }
        if (t.v === '____') err('Fill in the blank ____ on line ' + t.line + ' first!');
        if (is('.', 1)) {
          var call = heroCall();
          if (SENSORS.indexOf(call.name) < 0) err('hero.' + call.name + '() is a command, not a question. Questions are: ' + SENSORS.join('(), ') + '().', call.line);
          return { t: 'sense', name: call.name, line: call.line };
        }
        if (is('(', 1)) err('"' + t.v + '()" can\'t be used as a number or a yes/no answer here.');
        next();
        return { t: 'var', name: t.v, line: t.line };
      }
      err('I expected a number, a variable or a question here but found "' + t.v + '".');
    }
    function unary() {
      if (is('!')) { var l = next().line; return { t: 'not', e: unary(), line: l }; }
      if (is('-')) { var l2 = next().line; return { t: 'neg', e: unary(), line: l2 }; }
      return primary();
    }
    function binary(level) {
      var groups = [['||'], ['&&'], ['==', '!='], ['<', '<=', '>', '>='], ['+', '-'], ['*', '/', '%']];
      if (level >= groups.length) return unary();
      var left = binary(level + 1);
      while (peek().k === 'op' && groups[level].indexOf(peek().v) >= 0) {
        var op = next();
        left = { t: 'bin', op: op.v, l: left, r: binary(level + 1), line: op.line };
      }
      if (level === 0 && is('=')) err('To compare two things use  ==  (two equals signs). One = means "set".');
      return left;
    }
    function expression() { return binary(0); }
    function args() {
      var list = [];
      expect('(');
      if (!is(')')) { do { list.push(expression()); } while (is(',') && next()); }
      expect(')');
      return list;
    }
    function heroCall() {
      var who = next();
      if (who.v !== 'hero') err('Commands go to your hero, written in lowercase:  hero.' + peek(1).v + '()  — not "' + who.v + '".', who.line);
      expect('.');
      var name = ident('a command like moveForward');
      var all = ACTIONS.concat(SENSORS);
      if (all.indexOf(name) < 0) {
        var guess = closest(name, all);
        err('Bit doesn\'t know hero.' + name + '().' + (guess ? ' Did you mean ' + guess + '?' : ''), who.line);
      }
      if (!is('(')) err('Put round brackets after the command:  hero.' + name + '()', who.line);
      var a = args();
      if (name === 'paint' && (a.length !== 1)) err('paint needs one colour in quotes, like hero.paint("red");', who.line);
      if (name !== 'paint' && a.length) err('hero.' + name + '() doesn\'t need anything inside the brackets.', who.line);
      return { name: name, args: a, line: who.line };
    }

    /* statements */
    function simple() {             // a statement without its ; (so it also fits in a for-header)
      var t = peek(), line = t.line, id = 'L' + line;
      if (isType() && peek(1).k === 'id' && !is('(', 2)) {
        var type = next().v;
        if (type === 'void' || type === 'Hero') err('You can\'t make a variable of type ' + type + ' here.', line);
        var name = ident('a variable name');
        var value = { t: type === 'boolean' ? 'bool' : type === 'String' ? 'str' : 'num', v: type === 'boolean' ? false : type === 'String' ? '' : 0 };
        if (is('=')) { next(); value = expression(); }
        return { t: 'decl', name: name, value: value, line: line, id: id };
      }
      if (t.k !== 'id') err('I expected a command here but found "' + t.v + '".');
      if (t.v === '____') err('Fill in the blank ____ on line ' + t.line + ' first!');
      if (is('.', 1)) {
        var call = heroCall();
        if (ACTIONS.indexOf(call.name) < 0) err('hero.' + call.name + '() is a question — use it inside if ( ) or while ( ).', line);
        return { t: 'call', name: call.name, args: call.args, line: line, id: id };
      }
      if (is('(', 1)) {
        var fn = next().v;
        if (ACTIONS.concat(SENSORS).indexOf(fn) >= 0) err('Tell your hero to do it:  hero.' + fn + '()', line);
        return { t: 'invoke', name: fn, args: args(), line: line, id: id };
      }
      var v = next().v, ref = { t: 'var', name: v, line: line };
      if (is('++') || is('--')) {
        var o = next().v[0];
        return { t: 'set', name: v, value: { t: 'bin', op: o, l: ref, r: { t: 'num', v: 1 } }, line: line, id: id };
      }
      if (is('=')) { next(); return { t: 'set', name: v, value: expression(), line: line, id: id }; }
      if (peek().k === 'op' && /^[-+*\/%]=$/.test(peek().v)) {
        var op2 = next().v[0];
        return { t: 'set', name: v, value: { t: 'bin', op: op2, l: ref, r: expression() }, line: line, id: id };
      }
      var guess = closest(v, ['hero', 'for', 'while', 'if', 'int']);
      err('I don\'t understand "' + v + '" on line ' + line + '.' + (guess ? ' Did you mean ' + guess + '?' : ''), line);
    }
    function bodyOf() { var s = statement(); return s.t === 'block' ? s.body : [s]; }
    function blockStmts() {
      expect('{');
      var list = [];
      while (!is('}')) {
        if (peek().k === 'eof') expect('}');
        list.push(statement());
      }
      expect('}');
      return list;
    }
    function statement() {
      var t = peek(), line = t.line, id = 'L' + line;
      if (is('{')) return { t: 'block', body: blockStmts(), line: line };
      if (is(';')) { next(); return { t: 'block', body: [], line: line }; }
      if (t.k === 'id') {
        if (t.v === 'if') {
          next(); expect('('); var cond = expression(); expect(')');
          var node = { t: 'if', cond: cond, then: bodyOf(), 'else': null, line: line, id: id };
          if (is('else')) {
            next();
            var chained = is('if');
            node['else'] = bodyOf();
            if (chained && node['else'].length === 1) node['else'][0].chained = true;
          }
          return node;
        }
        if (t.v === 'while') {
          next(); expect('('); var c = expression(); expect(')');
          return { t: 'while', cond: c, body: bodyOf(), line: line, id: id };
        }
        if (t.v === 'for') {
          next(); expect('(');
          var init = is(';') ? null : simple(); expect(';');
          var fc = is(';') ? null : expression(); expect(';');
          var upd = is(')') ? null : simple(); expect(')');
          return { t: 'for', init: init, cond: fc, update: upd, body: bodyOf(), line: line, id: id };
        }
        if (t.v === 'return') { next(); expect(';'); return { t: 'return', line: line, id: id }; }
        if (t.v === 'else') err('"else" must come right after the } of an if.');
        if (t.v === 'repeat') err('Java has no "repeat". Use a for loop:  for (int i = 0; i < 4; i++) { }');
      }
      var s = simple();
      expect(';');
      return s;
    }

    /* methods, fields and the class wrapper */
    function member() {
      var line = peek().line;
      skipMods();
      if (!isType()) err('I expected a method or a variable here but found "' + peek().v + '".');
      var type = next().v;
      var name = ident('a name');
      if (is('(')) {
        next();
        var params = [];
        if (!is(')')) {
          do {
            if (!isType()) err('Each thing in the brackets needs a type first, like  int n');
            next();
            if (is('[')) { next(); expect(']'); }
            params.push(ident('a name'));
          } while (is(',') && next());
        }
        expect(')');
        var b = blockStmts();
        if (name === 'main') program.main = (program.main || []).concat(b);
        else program.funcs[name] = { params: params, body: b, line: line, id: 'L' + line };
        return;
      }
      var value = null;
      if (is('=')) {
        next();
        if (is('new')) { next(); ident('Hero'); expect('('); expect(')'); expect(';'); return; }
        value = expression();
      }
      expect(';');
      if (type !== 'Hero') program.globals.push({ name: name, value: value || { t: 'num', v: 0 } });
    }
    function looksLikeMember() {
      var o = 0, mods = false;
      while (peek(o).k === 'id' && MODS.indexOf(peek(o).v) >= 0) { o++; mods = true; }
      if (!isType(o) || peek(o + 1).k !== 'id') return false;
      return mods || is('(', o + 2);
    }
    function looksLikeClass() {
      var o = 0;
      while (peek(o).k === 'id' && MODS.indexOf(peek(o).v) >= 0) o++;
      return is('class', o);
    }

    while (peek().k !== 'eof') {
      if (looksLikeClass()) {
        skipMods(); next(); ident('a class name'); expect('{');
        while (!is('}')) {
          if (peek().k === 'eof') expect('}');
          if (!looksLikeMember()) err('Commands must go inside main\'s curly braces { }.');
          member();
        }
        expect('}');
      } else if (looksLikeMember()) member();
      else if (is('}')) err('There is one } too many on line ' + peek().line + '.');
      else loose.push(statement());
    }
    if (!program.main) program.main = loose;
    else if (loose.length) err('Some commands are outside main\'s curly braces { }.', loose[0].line);
    return program;
  }

  /* ---------- colouring ---------- */
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function highlight(src) {
    var re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("[^"\n]*"?)|\b(public|private|static|final|class|void|int|boolean|String|new|if|else|while|for|return|true|false)\b|\b(hero)\b|\b(\d+)\b|\b([A-Za-z_]\w*)(?=\s*\()/g;
    var out = '', last = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      var cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'k' : m[4] ? 'h' : m[5] ? 'n' : 'f';
      out += '<span class="j' + cls + '">' + esc(m[0]) + '</span>';
      last = m.index + m[0].length;
    }
    return out + esc(src.slice(last));
  }

  var SCAFFOLD_TOP = 'public class Mission {\n    static Hero hero = new Hero();\n\n    public static void main(String[] args) {\n';
  var SCAFFOLD_END = '    }\n}\n';
  function scaffold(bodyText) {
    var inner = (bodyText || '// Type your code here\n').replace(/\n$/, '').split('\n')
      .map(function (l) { return l ? '        ' + l : l; }).join('\n');
    return SCAFFOLD_TOP + inner + '\n' + SCAFFOLD_END;
  }

  BB.java = { toJava: toJava, parse: parse, highlight: highlight, javaName: javaName, scaffold: scaffold,
              JavaError: JavaError, ACTIONS: ACTIONS, SENSORS: SENSORS };
})(typeof window !== 'undefined' ? window : globalThis);
