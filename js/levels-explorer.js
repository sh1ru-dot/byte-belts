/* Byte Belts — Explorer track (about ages 7–11): blocks first, Java by the end.
   Every level carries its own answer ("solution", written as Java) which the
   tests run to prove the level can be solved, and which parents see as the answer key. */
(function (root) {
  'use strict';
  var BB = root.BB = root.BB || {};

  var BASIC = ['move', 'left', 'right'];
  var LOOPS = BASIC.concat(['repeat']);
  var PAINTER = LOOPS.concat(['paint']);
  var THINK = PAINTER.concat(['untilgoal', 'while', 'if', 'ifelse', 'path', 'atgoal', 'not']);
  var VARS = THINK.concat(['vars', 'number', 'math', 'compare']);
  var FUNCS = VARS.concat(['functions']);

  // Wrap the inside of main() in the standard Java class so kids always see whole, real Java.
  function J(body, methods) {
    var text = BB.java.scaffold(body);
    if (methods) {
      var m = methods.replace(/\n$/, '').split('\n').map(function (l) { return l ? '    ' + l : l; }).join('\n');
      text = text.replace(/\}\n$/, '\n' + m + '\n}\n');
    }
    return text;
  }

  var belts = [
    { id: 'white',  name: 'White Belt',  color: '#f8fafc', ink: '#334155', skill: 'Sequences',
      can: 'I can put commands in the right order to reach a goal.' },
    { id: 'yellow', name: 'Yellow Belt', color: '#fde047', ink: '#713f12', skill: 'Loops',
      can: 'I can use a repeat loop instead of stacking the same blocks again and again.' },
    { id: 'orange', name: 'Orange Belt', color: '#fb923c', ink: '#7c2d12', skill: 'Decisions',
      can: 'I can use if / else and repeat-until so my hero makes its own decisions.' },
    { id: 'green',  name: 'Green Belt',  color: '#4ade80', ink: '#14532d', skill: 'Variables',
      can: 'I can keep a number in a variable and change it while the program runs.' },
    { id: 'blue',   name: 'Blue Belt',   color: '#60a5fa', ink: '#1e3a8a', skill: 'Functions',
      can: 'I can teach the computer a new command and use it again and again.' },
    { id: 'purple', name: 'Purple Belt', color: '#c084fc', ink: '#581c87', skill: 'Reading Java',
      can: 'I can read Java code and build the same program with blocks.' },
    { id: 'brown',  name: 'Brown Belt',  color: '#b45309', ink: '#fff7ed', skill: 'Fixing Java',
      can: 'I can change and repair typed Java code.' },
    { id: 'red',    name: 'Red Belt',    color: '#ef4444', ink: '#fff1f2', skill: 'Writing Java',
      can: 'I can type my own Java with loops, ifs, variables and methods.' },
    { id: 'black',  name: 'Black Belt',  color: '#1f2937', ink: '#f9fafb', skill: 'Mastery',
      can: 'I can invent an algorithm that works on puzzles I have never seen, and build my own.' }
  ];

  var levels = [
    /* ------------------------- WHITE: sequences ------------------------- */
    { id: 'w1', belt: 'white', title: 'First Steps', dir: 'E', blocks: BASIC,
      mission: 'Bit the robot wants to reach the flag. Snap three "move forward" blocks under the orange block, then press Run.',
      hint: 'Count the squares between Bit and the flag. Each "move forward" is one square.',
      grid: ['#####', 'S..G#', '#####'],
      solution: 'hero.moveForward();\nhero.moveForward();\nhero.moveForward();' },
    { id: 'w2', belt: 'white', title: 'Turn the Corner', dir: 'E', blocks: BASIC,
      mission: 'The path bends! Bit turns on the spot — a turn does not move him to a new square.',
      hint: 'Pretend you are Bit. Is the bend on his right hand or his left hand?',
      grid: ['####', 'S..#', '##.#', '##G#'],
      solution: 'hero.moveForward();\nhero.moveForward();\nhero.turnRight();\nhero.moveForward();\nhero.moveForward();' },
    { id: 'w3', belt: 'white', title: 'Gem Grab', dir: 'E', blocks: BASIC,
      mission: 'Collect both gems, then park on the flag. Bit picks up a gem just by rolling over it.',
      hint: 'Trace the path with your finger first and say each step out loud.',
      grid: ['G.*#', '##.#', 'S.*#'],
      solution: 'hero.moveForward();\nhero.moveForward();\nhero.turnLeft();\nhero.moveForward();\nhero.moveForward();\nhero.turnLeft();\nhero.moveForward();\nhero.moveForward();' },
    { id: 'w4', belt: 'white', title: 'Zig Zag', dir: 'E', blocks: BASIC,
      mission: 'Climb the zig-zag stairs to the flag. It takes a lot of blocks — keep the order right!',
      hint: 'The pattern is: move, turn left, move, turn right… over and over.',
      grid: ['###G', '##..', '#..#', 'S.##'],
      solution: 'hero.moveForward();\nhero.turnLeft();\nhero.moveForward();\nhero.turnRight();\nhero.moveForward();\nhero.turnLeft();\nhero.moveForward();\nhero.turnRight();\nhero.moveForward();\nhero.turnLeft();\nhero.moveForward();' },
    { id: 'w5', belt: 'white', title: 'Belt Test: Around the Pond', dir: 'E', blocks: BASIC, test: true,
      mission: 'White Belt test! Grab both gems and finish on the flag. No hints from a grown-up this time.',
      hint: 'If Bit bumps, look at which block was glowing — that is where the bug is.',
      grid: ['S..*', '###.', 'G*..'],
      solution: 'hero.moveForward();\nhero.moveForward();\nhero.moveForward();\nhero.turnRight();\nhero.moveForward();\nhero.moveForward();\nhero.turnRight();\nhero.moveForward();\nhero.moveForward();\nhero.moveForward();' },

    /* ------------------------- YELLOW: loops ------------------------- */
    { id: 'y1', belt: 'yellow', title: 'The Long Road', dir: 'E', blocks: LOOPS, require: ['loop'],
      mission: 'Eight squares is a lot of blocks. Use the new "repeat" block: put ONE move inside it and change the number.',
      hint: 'repeat 8 times → move forward. Two blocks do the work of eight!',
      grid: ['#########', 'S.......G', '#########'],
      solution: 'for (int i = 0; i < 8; i++) {\n    hero.moveForward();\n}' },
    { id: 'y2', belt: 'yellow', title: 'Square Dance', dir: 'E', blocks: LOOPS, require: ['loop'],
      mission: 'Collect the gems on the corners. A loop can repeat a whole little dance, not just one block.',
      hint: 'One side of the square is: move, move, turn right. How many sides have gems?',
      grid: ['S.*', '.#.', '*.*'],
      solution: 'for (int i = 0; i < 3; i++) {\n    hero.moveForward();\n    hero.moveForward();\n    hero.turnRight();\n}' },
    { id: 'y3', belt: 'yellow', title: 'Staircase', dir: 'E', blocks: LOOPS, require: ['loop'],
      mission: 'Remember Zig Zag? Now do a bigger staircase with only 5 blocks.',
      hint: 'One stair is: move, turn left, move, turn right. Repeat it 4 times.',
      grid: ['####G', '###..', '##..#', '#..##', 'S.###'],
      solution: 'for (int i = 0; i < 4; i++) {\n    hero.moveForward();\n    hero.turnLeft();\n    hero.moveForward();\n    hero.turnRight();\n}' },
    { id: 'y4', belt: 'yellow', title: 'Paint the Bridge', dir: 'E', blocks: PAINTER, require: ['loop'],
      mission: 'New block: paint! Every tile with a blue dot must be painted blue, then roll on to the flag.',
      hint: 'Inside the loop: move forward, then paint blue. After the loop, one more move.',
      grid: ['#######', 'SbbbbbG', '#######'],
      solution: 'for (int i = 0; i < 5; i++) {\n    hero.moveForward();\n    hero.paint("blue");\n}\nhero.moveForward();' },
    { id: 'y5', belt: 'yellow', title: 'Gem Rows', dir: 'E', blocks: PAINTER, require: ['loop'],
      mission: 'Two rows of gems. You can use more than one loop in a program.',
      hint: 'Loop along the top, walk down the side, then loop back along the bottom.',
      grid: ['S***.', '####.', 'G***.'],
      solution: 'for (int i = 0; i < 4; i++) {\n    hero.moveForward();\n}\nhero.turnRight();\nhero.moveForward();\nhero.moveForward();\nhero.turnRight();\nfor (int i = 0; i < 4; i++) {\n    hero.moveForward();\n}' },
    { id: 'y6', belt: 'yellow', title: 'Belt Test: Loop the Loop', dir: 'E', blocks: PAINTER, require: ['loop'], test: true,
      mission: 'Yellow Belt test! Collect every gem around the pond. Secret move: put a loop INSIDE a loop.',
      hint: 'One side = repeat 4 { move } then turn right. Now repeat that whole thing 4 times.',
      grid: ['S****', '*###*', '*###*', '*###*', '*****'],
      solution: 'for (int i = 0; i < 4; i++) {\n    for (int j = 0; j < 4; j++) {\n        hero.moveForward();\n    }\n    hero.turnRight();\n}' },

    /* ------------------------- ORANGE: decisions ------------------------- */
    { id: 'o1', belt: 'orange', title: 'Until the Flag', dir: 'E', blocks: ['move', 'left', 'right', 'untilgoal'], require: ['while'],
      mission: 'No counting this time! The "repeat until at flag" block keeps going until Bit arrives.',
      hint: 'Put one "move forward" inside "repeat until at flag".',
      grid: ['###########', 'S.........G', '###########'],
      solution: 'while (!hero.atGoal()) {\n    hero.moveForward();\n}' },
    { id: 'o2', belt: 'orange', title: 'Feel the Way', dir: 'E', blocks: ['move', 'left', 'right', 'untilgoal', 'ifelse', 'path'], require: ['if'],
      mission: 'Let Bit decide! IF there is a path ahead, move. ELSE (otherwise), turn left.',
      hint: 'Put the "if / else" block inside "repeat until at flag". The question block "path ahead?" clicks into the if.',
      grid: ['#G...', '####.', '####.', 'S....'],
      solution: 'while (!hero.atGoal()) {\n    if (hero.pathAhead()) {\n        hero.moveForward();\n    } else {\n        hero.turnLeft();\n    }\n}' },
    { id: 'o3', belt: 'orange', title: 'Left or Right?', dir: 'E', blocks: ['move', 'left', 'right', 'untilgoal', 'if', 'ifelse', 'path'], require: ['if'],
      mission: 'This path bends both ways. When the way ahead is blocked, Bit must check: is there a path to the left?',
      hint: 'In the "else" part, put a second if / else: if path left → turn left, else → turn right.',
      grid: ['S..##', '##.##', '##...', '####.', 'G....'],
      solution: 'while (!hero.atGoal()) {\n    if (hero.pathAhead()) {\n        hero.moveForward();\n    } else {\n        if (hero.pathLeft()) {\n            hero.turnLeft();\n        } else {\n            hero.turnRight();\n        }\n    }\n}' },
    { id: 'o4', belt: 'orange', title: 'Wall to Wall', dir: 'E', blocks: ['move', 'left', 'right', 'repeat', 'while', 'path'], require: ['while'],
      mission: 'The room is not square, so counting is tricky. "repeat while path ahead" drives until Bit meets a wall.',
      hint: 'repeat 4 times: (repeat while path ahead → move), then turn right.',
      grid: ['S....*', '.####.', '.####.', '*....*'],
      solution: 'for (int i = 0; i < 4; i++) {\n    while (hero.pathAhead()) {\n        hero.moveForward();\n    }\n    hero.turnRight();\n}' },
    { id: 'o5', belt: 'orange', title: 'Belt Test: Maze Runner', dir: 'E', blocks: ['move', 'left', 'right', 'untilgoal', 'if', 'ifelse', 'path'], require: ['if'], test: true,
      mission: 'Orange Belt test! A real maze with dead ends and hidden gems. Trick: keep your right hand on the wall.',
      hint: 'Until at flag: IF path right → turn right and move. ELSE IF path ahead → move. ELSE → turn left.',
      grid: ['S.#...G', '#.#.###', '#...#.*', '###.#.#', '*.....#'],
      solution: 'while (!hero.atGoal()) {\n    if (hero.pathRight()) {\n        hero.turnRight();\n        hero.moveForward();\n    } else {\n        if (hero.pathAhead()) {\n            hero.moveForward();\n        } else {\n            hero.turnLeft();\n        }\n    }\n}' },

    /* ------------------------- GREEN: variables ------------------------- */
    { id: 'g1', belt: 'green', title: 'One Number to Rule Them', dir: 'E', blocks: VARS, vars: ['steps'], require: ['variable'],
      mission: 'A variable is a box with a name that holds a number. This program is almost right — fix ONE number so Bit reaches the flag.',
      hint: 'Each side of the path is 4 squares long. Change what goes into the "steps" box.',
      grid: ['S....', '####.', '####.', '####.', 'G....'],
      starter: 'g1',
      solution: 'int steps = 4;\nfor (int i = 0; i < 3; i++) {\n    for (int j = 0; j < steps; j++) {\n        hero.moveForward();\n    }\n    hero.turnRight();\n}' },
    { id: 'g2', belt: 'green', title: 'Growing Spiral', dir: 'E', blocks: VARS, vars: ['steps'], require: ['variable'],
      mission: 'Each side of this spiral is one square longer than the last: 1, 2, 3, 4, 5. Make the number in the box grow!',
      hint: 'set steps to 1. Then repeat 5: (repeat steps → move), turn left, change steps by 1.',
      grid: ['######', '*..*##', '.##.##', '.#S.##', '.#####', '*....G'],
      solution: 'int steps = 1;\nfor (int i = 0; i < 5; i++) {\n    for (int j = 0; j < steps; j++) {\n        hero.moveForward();\n    }\n    hero.turnLeft();\n    steps = steps + 1;\n}' },
    { id: 'g3', belt: 'green', title: 'Shrinking Spiral', dir: 'E', blocks: VARS, vars: ['steps'], require: ['variable'],
      mission: 'Now the spiral winds inward: 4, 3, 2, 1. Variables can count down as well as up.',
      hint: 'Start steps at 4 and "change steps by -1" each time round.',
      grid: ['S....', '####.', '##G#.', '##...'],
      solution: 'int steps = 4;\nfor (int i = 0; i < 4; i++) {\n    for (int j = 0; j < steps; j++) {\n        hero.moveForward();\n    }\n    hero.turnRight();\n    steps = steps - 1;\n}' },
    { id: 'g4', belt: 'green', title: 'Mystery Hallway', dir: 'E', blocks: ['move', 'left', 'right', 'repeat', 'while', 'path', 'vars', 'number', 'math'], vars: ['count'], require: ['variable'],
      mission: 'The hallway changes length every time! Count your steps to the wall, turn right, then walk the SAME number of steps to land on the flag.',
      hint: 'set count to 0. While path ahead: move, change count by 1. Turn right. Repeat count times: move.',
      grids: [['S...', '###.', '###.', '###G', '###.', '###.'],
              ['S.....', '#####.', '#####.', '#####.', '#####.', '#####G', '#####.', '#####.'],
              ['S....', '####.', '####.', '####.', '####G', '####.', '####.']],
      solution: 'int count = 0;\nwhile (hero.pathAhead()) {\n    hero.moveForward();\n    count = count + 1;\n}\nhero.turnRight();\nfor (int i = 0; i < count; i++) {\n    hero.moveForward();\n}' },
    { id: 'g5', belt: 'green', title: 'Belt Test: Giant Steps', dir: 'E', blocks: VARS, vars: ['steps'], require: ['variable'], test: true,
      mission: 'Green Belt test! Each stair is one square wider than the last. Collect the gems on the way to the flag.',
      hint: 'Each round: walk "steps" squares, turn left, move up, turn right, then make steps bigger.',
      grid: ['######G', '###*...', '#*..###', 'S.#####'],
      solution: 'int steps = 1;\nfor (int i = 0; i < 3; i++) {\n    for (int j = 0; j < steps; j++) {\n        hero.moveForward();\n    }\n    hero.turnLeft();\n    hero.moveForward();\n    hero.turnRight();\n    steps = steps + 1;\n}' },

    /* ------------------------- BLUE: functions ------------------------- */
    { id: 'b1', belt: 'blue', title: 'Teach a Trick', dir: 'E', blocks: FUNCS, require: ['function'],
      mission: 'Gems hide in side pockets. Teach Bit a new command called "grab" in the Functions drawer, then use it three times.',
      hint: 'grab = turn left, move, turn right, turn right, move, turn left. Build it once inside "to grab".',
      grid: ['#*##*#*#', 'S......G'],
      solution: 'hero.moveForward();\ngrab();\nfor (int i = 0; i < 3; i++) {\n    hero.moveForward();\n}\ngrab();\nhero.moveForward();\nhero.moveForward();\ngrab();\nhero.moveForward();',
      methods: 'static void grab() {\n    hero.turnLeft();\n    hero.moveForward();\n    hero.turnRight();\n    hero.turnRight();\n    hero.moveForward();\n    hero.turnLeft();\n}' },
    { id: 'b2', belt: 'blue', title: 'Three Ponds', dir: 'E', blocks: FUNCS, require: ['function'],
      mission: 'Walk around each pond to collect the gems. Make a "square" function and call it once per pond.',
      hint: 'square = repeat 4 { move, move, turn right }. Between ponds, move 4 squares.',
      grid: ['S.*.*.*.*.G', '.#.#.#.#.#.', '*.*#*.*#*.*'],
      solution: 'for (int i = 0; i < 2; i++) {\n    square();\n    for (int j = 0; j < 4; j++) {\n        hero.moveForward();\n    }\n}\nsquare();\nhero.moveForward();\nhero.moveForward();',
      methods: 'static void square() {\n    for (int i = 0; i < 4; i++) {\n        hero.moveForward();\n        hero.moveForward();\n        hero.turnRight();\n    }\n}' },
    { id: 'b3', belt: 'blue', title: 'Flag Poles', dir: 'E', blocks: FUNCS, require: ['function'],
      mission: 'Paint three blue poles. A function can have loops inside it. Name yours "pole".',
      hint: 'pole = turn left, repeat 3 { move, paint blue }, turn around, repeat 3 { move }, turn left.',
      grid: ['#b#b#b#', '#b#b#b#', '#b#b#b#', 'S.....G'],
      solution: 'for (int i = 0; i < 3; i++) {\n    hero.moveForward();\n    pole();\n    hero.moveForward();\n}',
      methods: 'static void pole() {\n    hero.turnLeft();\n    for (int i = 0; i < 3; i++) {\n        hero.moveForward();\n        hero.paint("blue");\n    }\n    hero.turnRight();\n    hero.turnRight();\n    for (int i = 0; i < 3; i++) {\n        hero.moveForward();\n    }\n    hero.turnLeft();\n}' },
    { id: 'b4', belt: 'blue', title: 'Snake Path', dir: 'N', blocks: FUNCS, require: ['function'],
      mission: 'This snake bends right, right, left, left… Make TWO functions and give them good names.',
      hint: 'hopRight = move, move, turn right. hopLeft = move, move, turn left. Then call them in the right order.',
      grid: ['*..#*..', '.#.#.#.', 'S#*..#G'],
      solution: 'hopRight();\nhopRight();\nhopLeft();\nhopLeft();\nhopRight();\nhopRight();\nhero.moveForward();\nhero.moveForward();',
      methods: 'static void hopRight() {\n    hero.moveForward();\n    hero.moveForward();\n    hero.turnRight();\n}\n\nstatic void hopLeft() {\n    hero.moveForward();\n    hero.moveForward();\n    hero.turnLeft();\n}' },
    { id: 'b5', belt: 'blue', title: 'Belt Test: Flower Garden', dir: 'E', blocks: FUNCS, require: ['function'], test: true,
      mission: 'Blue Belt test! Paint three red flowers. Each flower has four petals around its middle. Bit starts in the middle of the first one.',
      hint: 'flower = repeat 4 { move, paint red, turn right, turn right, move, turn right }. Flower middles are 3 squares apart.',
      grid: ['#r##r##r#', 'rSrr.rr.r', '#r##r##r#'],
      solution: 'for (int i = 0; i < 2; i++) {\n    flower();\n    for (int j = 0; j < 3; j++) {\n        hero.moveForward();\n    }\n}\nflower();',
      methods: 'static void flower() {\n    for (int i = 0; i < 4; i++) {\n        hero.moveForward();\n        hero.paint("red");\n        hero.turnRight();\n        hero.turnRight();\n        hero.moveForward();\n        hero.turnRight();\n    }\n}' },

    /* ------------------------- PURPLE: reading Java ------------------------- */
    { id: 'p1', belt: 'purple', title: 'The Java Lens', dir: 'E', blocks: FUNCS, java: 'lens',
      mission: 'You unlocked the Java Lens! Solve this with blocks and watch the panel: every block you snap writes a line of real Java.',
      hint: 'A repeat block becomes a "for" line. Curly braces { } hug the blocks that were inside it.',
      grid: ['S..*', '###.', 'G...'],
      solution: 'for (int i = 0; i < 3; i++) {\n    hero.moveForward();\n}\nhero.turnRight();\nhero.moveForward();\nhero.moveForward();\nhero.turnRight();\nfor (int i = 0; i < 3; i++) {\n    hero.moveForward();\n}' },
    { id: 'p2', belt: 'purple', title: 'The Dark Cave', dir: 'E', blocks: FUNCS, java: 'lens', fog: true,
      mission: 'It is too dark to see the path! But an old scroll shows the way — in Java. Read it and build the same program with blocks.',
      hint: '"for (int i = 0; i < 3; i++)" means repeat 3 times. Match your Java panel to the scroll line by line.',
      scroll: 'for (int i = 0; i < 3; i++) {\n    hero.moveForward();\n}\nhero.turnLeft();\nfor (int i = 0; i < 2; i++) {\n    hero.moveForward();\n}\nhero.turnRight();\nhero.moveForward();',
      grid: ['###.G', '###.#', 'S...#'],
      solution: 'for (int i = 0; i < 3; i++) {\n    hero.moveForward();\n}\nhero.turnLeft();\nfor (int i = 0; i < 2; i++) {\n    hero.moveForward();\n}\nhero.turnRight();\nhero.moveForward();' },
    { id: 'p3', belt: 'purple', title: 'Cave of Questions', dir: 'E', blocks: FUNCS, java: 'lens', fog: true,
      mission: 'Another dark cave, another scroll. This one uses "while" and "if". The ! sign means NOT.',
      hint: '"while (!hero.atGoal())" is the "repeat until at flag" block. "else" is the bottom half of the if / else block.',
      scroll: 'while (!hero.atGoal()) {\n    if (hero.pathAhead()) {\n        hero.moveForward();\n    } else {\n        hero.turnRight();\n    }\n}',
      grid: ['S...', '###.', '###.', '#G..'],
      solution: 'while (!hero.atGoal()) {\n    if (hero.pathAhead()) {\n        hero.moveForward();\n    } else {\n        hero.turnRight();\n    }\n}' },
    { id: 'p4', belt: 'purple', title: 'Belt Test: Scroll of Hops', dir: 'E', blocks: FUNCS, java: 'lens', fog: true, vars: ['steps'], test: true,
      mission: 'Purple Belt test! This scroll has a variable AND a function. Build it with blocks and light up the cave.',
      hint: 'Make the function "hop" first. In Java a function is called a method: "static void hop() { … }".',
      scroll: 'static int steps = 0;\n\npublic static void main(String[] args) {\n    steps = 2;\n    for (int i = 0; i < 3; i++) {\n        hop();\n        steps = steps + 1;\n    }\n}\n\nstatic void hop() {\n    for (int i = 0; i < steps; i++) {\n        hero.moveForward();\n    }\n    hero.turnRight();\n}',
      grid: ['##S..', '####.', '####.', 'G....'],
      globals: 'static int steps = 0;',
      solution: 'steps = 2;\nfor (int i = 0; i < 3; i++) {\n    hop();\n    steps = steps + 1;\n}',
      methods: 'static void hop() {\n    for (int i = 0; i < steps; i++) {\n        hero.moveForward();\n    }\n    hero.turnRight();\n}' },

    /* ------------------------- BROWN: fixing Java ------------------------- */
    { id: 'n1', belt: 'brown', title: 'Change the Number', dir: 'E', mode: 'java', noPar: true,
      mission: 'No blocks now — this is real typed Java! The loop is too short. Click in the code, change one number, and press Run.',
      hint: 'Find "i < 3". The flag is 6 squares away.',
      grid: ['#######', 'S.....G', '#######'],
      starterBody: 'for (int i = 0; i < 3; i++) {\n    hero.moveForward();\n}',
      solution: 'for (int i = 0; i < 6; i++) {\n    hero.moveForward();\n}' },
    { id: 'n2', belt: 'brown', title: 'Wrong Turn', dir: 'E', mode: 'java', noPar: true,
      mission: 'This code has a bug: Bit turns the wrong way. Fix it, then type the missing lines to reach the flag.',
      hint: 'Every command ends with ( ) and a semicolon ;  Capital letters matter: turnRight, not turnright.',
      grid: ['S..##', '##.##', '##..G'],
      starterBody: 'hero.moveForward();\nhero.moveForward();\nhero.turnLeft();\nhero.moveForward();\nhero.moveForward();\n// Bit is not at the flag yet. Type the missing lines below!\n',
      solution: 'hero.moveForward();\nhero.moveForward();\nhero.turnRight();\nhero.moveForward();\nhero.moveForward();\nhero.turnLeft();\nhero.moveForward();\nhero.moveForward();' },
    { id: 'n3', belt: 'brown', title: 'Fill the Blanks', dir: 'E', mode: 'java', noPar: true,
      mission: 'Two words are missing. Replace each ____ with the right word so Bit can feel his way to the flag.',
      hint: 'The question is pathAhead. When the way is blocked on this path, Bit should turnLeft.',
      grid: ['G...', '###.', 'S...'],
      starterBody: 'while (!hero.atGoal()) {\n    if (hero.____()) {\n        hero.moveForward();\n    } else {\n        hero.____();\n    }\n}',
      solution: 'while (!hero.atGoal()) {\n    if (hero.pathAhead()) {\n        hero.moveForward();\n    } else {\n        hero.turnLeft();\n    }\n}' },
    { id: 'n4', belt: 'brown', title: 'Belt Test: Bug Squash', dir: 'E', mode: 'java', noPar: true, test: true,
      mission: 'Brown Belt test! There are THREE bugs hiding in this code. Read the red messages — they are clues, not scolding.',
      hint: 'Bug 1: a spelling mistake. Bug 2: a missing semicolon. Bug 3: a number that is too small.',
      grid: ['S....', '####.', '####.', '####G'],
      starterBody: 'for (int i = 0; i < 4; i++) {\n    hero.moveForwrd();\n}\nhero.turnRight()\nfor (int i = 0; i < 2; i++) {\n    hero.moveForward();\n}',
      solution: 'for (int i = 0; i < 4; i++) {\n    hero.moveForward();\n}\nhero.turnRight();\nfor (int i = 0; i < 3; i++) {\n    hero.moveForward();\n}' },

    /* ------------------------- RED: writing Java ------------------------- */
    { id: 'r1', belt: 'red', title: 'First Words', dir: 'E', mode: 'java',
      mission: 'Your turn to write! Type the commands yourself between the curly braces of main. The cheat sheet shows every spelling.',
      hint: 'hero.moveForward(); twice, then hero.turnLeft(); then one more move.',
      grid: ['##G', 'S..'],
      solution: 'hero.moveForward();\nhero.moveForward();\nhero.turnLeft();\nhero.moveForward();' },
    { id: 'r2', belt: 'red', title: 'For Real', dir: 'E', mode: 'java', require: ['loop'],
      mission: 'Type a for loop to climb the staircase. The three parts mean: start i at 0; keep going while i is less than 4; add 1 to i each time.',
      hint: 'for (int i = 0; i < 4; i++) {  then the four stair commands, then  }',
      grid: ['####G', '###*.', '##*.#', '#*.##', 'S.###'],
      solution: 'for (int i = 0; i < 4; i++) {\n    hero.moveForward();\n    hero.turnLeft();\n    hero.moveForward();\n    hero.turnRight();\n}' },
    { id: 'r3', belt: 'red', title: 'While Wise', dir: 'E', mode: 'java', require: ['if'],
      mission: 'This cave changes each time you press Run, so you cannot count squares. Write a while loop with if / else so Bit feels the way.',
      hint: 'while not at goal: if pathAhead move; else if pathLeft turnLeft; else turnRight.',
      grids: [['S..##', '##.##', '##...', '####.', 'G....'], ['S.###', '#.###', '#...G']],
      solution: 'while (!hero.atGoal()) {\n    if (hero.pathAhead()) {\n        hero.moveForward();\n    } else if (hero.pathLeft()) {\n        hero.turnLeft();\n    } else {\n        hero.turnRight();\n    }\n}' },
    { id: 'r4', belt: 'red', title: 'Count On It', dir: 'E', mode: 'java', require: ['variable'],
      mission: 'The Mystery Hallway is back — in Java. Make an int variable, count your steps to the wall, turn right, and walk the same number again.',
      hint: 'int count = 0;  Inside the while loop: count = count + 1;  Then a for loop that goes while i < count.',
      grids: [['S...', '###.', '###.', '###G', '###.', '###.'],
              ['S.....', '#####.', '#####.', '#####.', '#####.', '#####G', '#####.', '#####.'],
              ['S....', '####.', '####.', '####.', '####G', '####.', '####.']],
      solution: 'int count = 0;\nwhile (hero.pathAhead()) {\n    hero.moveForward();\n    count = count + 1;\n}\nhero.turnRight();\nfor (int i = 0; i < count; i++) {\n    hero.moveForward();\n}' },
    { id: 'r5', belt: 'red', title: 'Belt Test: Method Master', dir: 'E', mode: 'java', require: ['function'], test: true,
      mission: 'Red Belt test! Finish the walk method. The "int n" in its brackets is a number you hand over each time: walk(5) means n is 5.',
      hint: 'Inside walk: for (int i = 0; i < n; i++) { hero.moveForward(); }  In main: walk(5); turn right; walk(3); turn right; walk(4); turn right; walk(2);',
      grid: ['S.....', '#G###.', '#.###.', '#.....'],
      starterBody: '// Use walk( ) with different numbers to reach the flag\n',
      starterMethods: 'static void walk(int n) {\n    // Make Bit move forward n times\n}',
      solution: 'walk(5);\nhero.turnRight();\nwalk(3);\nhero.turnRight();\nwalk(4);\nhero.turnRight();\nwalk(2);',
      methods: 'static void walk(int n) {\n    for (int i = 0; i < n; i++) {\n        hero.moveForward();\n    }\n}' },

    /* ------------------------- BLACK: mastery ------------------------- */
    { id: 'k1', belt: 'black', title: 'Maze Master', dir: 'E', mode: 'java', require: ['if'],
      mission: 'Two different mazes, one program. Write Java that solves BOTH and collects every gem. Remember the right-hand rule from Orange Belt.',
      hint: 'while not at goal: if pathRight → turnRight + move; else if pathAhead → move; else turnLeft.',
      grids: [['S.#...G', '#.#.###', '#...#.*', '###.#.#', '*.....#'], ['S....#', '#.##.#', '#.#G.#', '#.####', '#....*']],
      solution: 'while (!hero.atGoal()) {\n    if (hero.pathRight()) {\n        hero.turnRight();\n        hero.moveForward();\n    } else if (hero.pathAhead()) {\n        hero.moveForward();\n    } else {\n        hero.turnLeft();\n    }\n}' },
    { id: 'k2', belt: 'black', title: 'Checkerboard', dir: 'E', mode: 'java', require: ['if'],
      mission: 'Paint the path red, blue, red, blue… New tool: % gives the remainder after dividing. i % 2 is 0 for even numbers and 1 for odd numbers.',
      hint: 'for i from 0 to 7: move; if (i % 2 == 0) paint "red"; else paint "blue".',
      grid: ['#########', 'Srbrbrbrb', '#########'],
      solution: 'for (int i = 0; i < 8; i++) {\n    hero.moveForward();\n    if (i % 2 == 0) {\n        hero.paint("red");\n    } else {\n        hero.paint("blue");\n    }\n}' },
    { id: 'k3', belt: 'black', title: 'Black Belt Test: The Golden Pyramid', dir: 'E', mode: 'java', require: ['function'], test: true,
      mission: 'The final test! Paint the golden pyramid: row 1 has 1 tile, row 2 has 2, row 3 has 3, row 4 has 4. Use a method with a number in its brackets, and a loop that calls it.',
      hint: 'paintRow(int n): move + paint yellow n times, turn around, walk back n, turn left. main: for row 1 to 4: paintRow(row); move down; turn left.',
      grid: ['Sy###', '.yy##', '.yyy#', '.yyyy', '.####'],
      starterBody: '// Call your method once for each row\n',
      starterMethods: 'static void paintRow(int n) {\n    // Paint n tiles yellow, then come back\n}',
      solution: 'for (int row = 1; row <= 4; row++) {\n    paintRow(row);\n    hero.moveForward();\n    hero.turnLeft();\n}',
      methods: 'static void paintRow(int n) {\n    for (int i = 0; i < n; i++) {\n        hero.moveForward();\n        hero.paint("yellow");\n    }\n    hero.turnLeft();\n    hero.turnLeft();\n    for (int i = 0; i < n; i++) {\n        hero.moveForward();\n    }\n    hero.turnLeft();\n}' }
  ];

  /* Starter block programs (Blockly's saved-workspace format). */
  var num = function (n) { return { shadow: { type: 'math_number', fields: { NUM: n } } }; };
  var starters = {
    g1: { blocks: { languageVersion: 0, blocks: [{ type: 'bb_start', x: 30, y: 30, next: { block: {
      type: 'variables_set', fields: { VAR: { id: 'var_steps' } }, inputs: { VALUE: num(2) }, next: { block: {
        type: 'controls_repeat_ext', inputs: { TIMES: num(3), DO: { block: {
          type: 'controls_repeat_ext',
          inputs: { TIMES: { shadow: { type: 'math_number', fields: { NUM: 1 } }, block: { type: 'variables_get', fields: { VAR: { id: 'var_steps' } } } },
                    DO: { block: { type: 'bb_move' } } },
          next: { block: { type: 'bb_turn_right' } } } } } } } } } }] } }
  };

  levels.forEach(function (l) {
    // Full Java text of the answer, and (for typing levels) of what the editor starts with.
    var answer = J(l.solution, l.methods);
    if (l.globals) answer = answer.replace('static Hero hero = new Hero();', 'static Hero hero = new Hero();\n    ' + l.globals);
    l.answer = answer;
    // "Par" = how many blocks the model answer uses; matching it earns 3 stars.
    if (!l.noPar) l.par = BB.engine.countStmts(BB.java.parse(answer));
    if (l.mode === 'java') l.starterJava = J(l.starterBody || '// Type your code here\n', l.starterMethods);
    l.mode = l.mode || 'blocks';
  });

  BB.explorer = { belts: belts, levels: levels, starters: starters, ALL_BLOCKS: FUNCS };
})(typeof window !== 'undefined' ? window : globalThis);
