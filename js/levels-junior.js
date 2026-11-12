/* Byte Belts — Cubs track (about ages 4–6): no reading needed.
   Kids tap arrow tiles to guide Pip the fox. "solution" and "starter" are rows
   of tiles written like "E2 S E3" (compass direction + how many times). */
(function (root) {
  'use strict';
  var BB = root.BB = root.BB || {};

  var belts = [
    { id: 'white',  name: 'White Belt',  color: '#f8fafc', ink: '#334155', skill: 'Arrows',
      can: 'I can put arrows in order to get Pip home.' },
    { id: 'yellow', name: 'Yellow Belt', color: '#fde047', ink: '#713f12', skill: 'Collecting',
      can: 'I can plan a path that picks up every apple.' },
    { id: 'orange', name: 'Orange Belt', color: '#fb923c', ink: '#7c2d12', skill: 'Repeating',
      can: 'I can use a number to repeat an arrow.' },
    { id: 'green',  name: 'Green Belt',  color: '#4ade80', ink: '#14532d', skill: 'Bug Hunting',
      can: 'I can find a mistake in a program and fix it.' },
    { id: 'blue',   name: 'Blue Belt',   color: '#60a5fa', ink: '#1e3a8a', skill: 'Planning Ahead',
      can: 'I can plan steps in the right order: key first, then the door.' }
  ];

  var ALL = ['N', 'E', 'S', 'W'];
  var levels = [
    /* WHITE — arrows in order */
    { id: 'jw1', belt: 'white', arrows: ['E'], say: 'Help Pip the fox get home! Tap the arrow three times. Then tap the green Go button.',
      grid: ['S..G'], solution: 'E E E' },
    { id: 'jw2', belt: 'white', arrows: ['E', 'S'], say: 'Pip\'s home is down below. Which arrow points down?',
      grid: ['#S#', '#.#', '#G#'], solution: 'S S' },
    { id: 'jw3', belt: 'white', arrows: ['E', 'S'], say: 'Go across, then go down.',
      grid: ['S..', '##.', '##G'], solution: 'E E S S' },
    { id: 'jw4', belt: 'white', arrows: ALL, say: 'Now you have all four arrows. Go around the bushes to get home.',
      grid: ['G..', '##.', 'S..'], solution: 'E E N N W W' },
    { id: 'jw5', belt: 'white', arrows: ALL, test: true, say: 'White belt test! Zig zag down the steps to get Pip home.',
      grid: ['S.##', '#..#', '##.G'], solution: 'E S E S E' },

    /* YELLOW — collect everything */
    { id: 'jy1', belt: 'yellow', arrows: ALL, say: 'Yum, an apple! Walk over the apple to pick it up, then go home.',
      grid: ['S*.G'], solution: 'E E E' },
    { id: 'jy2', belt: 'yellow', arrows: ALL, say: 'Get the apple in the corner, then find the way home.',
      grid: ['S.*', '##.', 'G..'], solution: 'E E S S W W' },
    { id: 'jy3', belt: 'yellow', arrows: ALL, say: 'The apple is hiding below the path. Go down to get it, then come back up.',
      grid: ['S.G', '#*#'], solution: 'E S N E' },
    { id: 'jy4', belt: 'yellow', arrows: ALL, say: 'Two apples! One on each side. Get them both before you go home.',
      grid: ['*S*', '#G#'], solution: 'W E E W S' },
    { id: 'jy5', belt: 'yellow', arrows: ALL, test: true, say: 'Yellow belt test! Pick up both apples, then go home. Plan your path first.',
      grid: ['S.*', '*#.', '..G'], solution: 'S N E E S S' },

    /* ORANGE — repeat with numbers */
    { id: 'jo1', belt: 'orange', arrows: ALL, numbers: true, max: 2,
      say: 'It is a long way home, and you only have two boxes! Tap the arrow, then tap the number five. That means go five times.',
      grid: ['S....G'], solution: 'E5' },
    { id: 'jo2', belt: 'orange', arrows: ALL, numbers: true, max: 3, say: 'Go across three, then down three. Use the numbers!',
      grid: ['S...', '###.', '###.', '###G'], solution: 'E3 S3' },
    { id: 'jo3', belt: 'orange', arrows: ALL, numbers: true, max: 4, say: 'Get three apples, then come all the way back.',
      grid: ['S***', 'G###'], solution: 'E3 W3 S' },
    { id: 'jo4', belt: 'orange', arrows: ALL, numbers: true, max: 5, say: 'Giant steps! Each step is two squares long.',
      grid: ['S..##', '##.##', '##...', '####.', '####G'], solution: 'E2 S2 E2 S2' },
    { id: 'jo5', belt: 'orange', arrows: ALL, numbers: true, max: 5, test: true, say: 'Orange belt test! Go all the way around the pond and pick up every apple.',
      grid: ['S.*', 'G#.', '*.*'], solution: 'E2 S2 W2 N' },

    /* GREEN — find and fix the bug */
    { id: 'jg1', belt: 'green', arrows: ALL, numbers: true, debug: true,
      say: 'Uh oh! This program has a bug. One arrow is wrong. Tap Go to watch, then tap the wrong arrow and pick the right one.',
      grid: ['S..G'], starter: 'E E S', solution: 'E E E' },
    { id: 'jg2', belt: 'green', arrows: ALL, numbers: true, debug: true, say: 'Find the bug! Watch where Pip bumps.',
      grid: ['S.#', '#.#', '#.G'], starter: 'E S E E', solution: 'E S S E' },
    { id: 'jg3', belt: 'green', arrows: ALL, numbers: true, debug: true, say: 'Pip stops too early. Something is missing!',
      grid: ['S...G'], starter: 'E E E', solution: 'E E E E' },
    { id: 'jg4', belt: 'green', arrows: ALL, numbers: true, debug: true, say: 'Pip runs right past his home! There is one arrow too many. Tap it, then tap the bin.',
      grid: ['S.G..'], starter: 'E E E', solution: 'E E' },
    { id: 'jg5', belt: 'green', arrows: ALL, numbers: true, debug: true, test: true, say: 'Green belt test! One of the numbers is wrong. Can you fix it?',
      grid: ['S....', '####.', '####G'], starter: 'E3 S2', solution: 'E4 S2' },

    /* BLUE — plan ahead with keys and doors */
    { id: 'jb1', belt: 'blue', arrows: ALL, numbers: true, max: 3, say: 'The door is locked! Walk over the key first, and the door will open.',
      grid: ['SKDG'], solution: 'E3' },
    { id: 'jb2', belt: 'blue', arrows: ALL, numbers: true, max: 3, say: 'The key is the other way. Get the key first, then go to the door.',
      grid: ['K.S.DG'], solution: 'W2 E5' },
    { id: 'jb3', belt: 'blue', arrows: ALL, numbers: true, max: 5, say: 'The key is hiding under the path.',
      grid: ['S.D.G', '#K###'], solution: 'E S N E3' },
    { id: 'jb4', belt: 'blue', arrows: ALL, numbers: true, max: 6, say: 'Get the apple and the key. Then open the door and go home.',
      grid: ['*.S.D', 'K###G'], solution: 'W2 S N E4 S' },
    { id: 'jb5', belt: 'blue', arrows: ALL, numbers: true, max: 6, test: true, say: 'Blue belt test! Two apples, one key, one door. You can do it!',
      grid: ['S.*#G', '.###D', 'K..*.'], solution: 'E2 W2 S2 E4 N2' }
  ];

  levels.forEach(function (l, i) {
    var inBelt = levels.filter(function (x) { return x.belt === l.belt; });
    l.title = l.test ? 'Belt Test' : 'Level ' + (inBelt.indexOf(l) + 1);
    l.par = BB.engine.parseTiles(l.solution).length;
    l.dir = 'S';
  });

  BB.junior = { belts: belts, levels: levels };
})(typeof window !== 'undefined' ? window : globalThis);
