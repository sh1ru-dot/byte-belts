/* Proves every level can be solved:  node tests/run.js  */
'use strict';
const path = require('path');
const js = f => path.join(__dirname, '..', 'js', f);
require(js('engine.js'));
require(js('java.js'));
require(js('levels-explorer.js'));
require(js('levels-junior.js'));
const BB = globalThis.BB;
const { engine, java } = BB;

let failed = 0, checked = 0;
function check(ok, label, detail) {
  checked++;
  if (!ok) { failed++; console.log('  FAIL  ' + label + (detail ? '  -> ' + detail : '')); }
}
function describe(r) { return r.status + (r.reason ? ' (' + r.reason + ' ' + JSON.stringify(r.info) + ')' : ''); }

console.log('Explorer track');
BB.explorer.levels.forEach(l => {
  let program;
  try { program = java.parse(l.answer); }
  catch (e) { check(false, l.id + ' answer parses', 'line ' + e.line + ': ' + e.message); return; }
  const n = engine.gridsOf(l).length;
  for (let v = 0; v < n; v++) {
    const r = engine.run(program, l, v);
    check(r.status === 'win', l.id + ' answer wins (version ' + (v + 1) + '/' + n + ')', describe(r));
  }
  check(!engine.missingRequirement(program, l), l.id + ' answer meets the level rule', String(engine.missingRequirement(program, l)));

  // Java printed from the program must mean the same thing when read back in.
  try {
    const again = java.parse(java.toJava(program).text);
    check(engine.runAll(again, l).status === 'win', l.id + ' printed Java still wins');
    check(engine.countStmts(again) === engine.countStmts(program), l.id + ' printed Java has same size');
  } catch (e) { check(false, l.id + ' printed Java parses', 'line ' + e.line + ': ' + e.message); }

  // An empty program must not win, and typing levels must not start out solved.
  check(engine.runAll({ main: [], funcs: {} }, l).status !== 'win', l.id + ' is not solved by doing nothing');
  if (l.mode === 'java') {
    let solved = false;
    try { solved = engine.runAll(java.parse(l.starterJava), l).status === 'win'; } catch (e) { /* a parse error is fine */ }
    check(!solved, l.id + ' starter code is not already solved');
  }
  console.log('  ' + l.id.padEnd(4) + (l.par ? 'par ' + String(l.par).padStart(2) : 'fix   ') + '  ' + l.title);
});

console.log('\nCubs track');
BB.junior.levels.forEach(l => {
  const tiles = engine.parseTiles(l.solution);
  const r = engine.run(engine.juniorProgram(tiles), l, 0);
  check(r.status === 'win', l.id + ' answer wins', describe(r));
  if (l.max) check(tiles.length <= l.max, l.id + ' answer fits in ' + l.max + ' boxes', tiles.length + ' tiles');
  if (l.starter) check(engine.run(engine.juniorProgram(engine.parseTiles(l.starter)), l, 0).status !== 'win', l.id + ' buggy starter fails');
  console.log('  ' + l.id.padEnd(4) + 'par ' + String(l.par).padStart(2) + '  ' + l.belt + ' ' + l.title);
});

console.log('\nFriendly Java error messages');
[
  ['hero.moveForward()', 'semicolon'],
  ['hero.moveForwrd();', 'moveForward'],
  ['Hero.moveForward();', 'lowercase'],
  ['for (int i = 0; i < 3; i++) { hero.moveForward();', 'never closed'],
  ['if (hero.____()) { }', 'blank'],
  ['repeat (3) { }', 'for loop'],
  ['int x = 1; if (x = 1) { }', '=='],
  ['moveForward();', 'hero.moveForward'],
].forEach(([src, expect]) => {
  let msg = '(no error)';
  try { java.parse(java.scaffold(src)); } catch (e) { msg = e.message; }
  check(msg.indexOf(expect) >= 0, 'error for `' + src + '` mentions "' + expect + '"', msg);
});

console.log('\n' + (checked - failed) + ' of ' + checked + ' checks passed.');
process.exit(failed ? 1 : 0);
