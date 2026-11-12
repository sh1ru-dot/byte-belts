/* Byte Belts — lesson plans and the mastery scale shown in the Grown-ups guide. */
(function (root) {
  'use strict';
  var BB = root.BB = root.BB || {};

  /* The 4-point scale used to decide when a belt has really been earned. */
  var scale = [
    { score: 1, name: 'Starting', look: 'Needs a grown-up to show each step. Guesses and presses Run to see what happens.',
      next: 'Do the unplugged warm-up again. Solve the first level together, taking turns placing blocks.' },
    { score: 2, name: 'Getting there', look: 'Solves levels with a hint or two. Can say what went wrong after watching the hero.',
      next: 'Ask "what did you expect to happen?" before giving any hint. Replay earlier levels for 3 stars.' },
    { score: 3, name: 'Got it', look: 'Passes the Belt Test alone and can explain the program in their own words.',
      next: 'Award the belt! Move to the next belt.' },
    { score: 4, name: 'Flying', look: 'Earns 3 stars on most levels, spots shorter answers, and can teach a sibling.',
      next: 'Offer the stretch challenge, or let them build puzzles in the Creator Lab.' }
  ];

  /* What we watch for across every belt. */
  var strands = [
    { name: 'Sequencing', q: 'Are the steps in the right order?' },
    { name: 'Patterns & loops', q: 'Do they notice repeats and wrap them in a loop?' },
    { name: 'Decisions', q: 'Can the program react to what is around it?' },
    { name: 'Breaking it down', q: 'Do they split a big job into named pieces?' },
    { name: 'Debugging', q: 'When it fails, do they look for the cause instead of starting over?' },
    { name: 'Typed code', q: 'Can they read, then fix, then write real Java?' }
  ];

  var explorerPlans = {
    white: {
      sessions: '2 sessions of 20–30 minutes', idea: 'A program is a list of exact steps, and the computer does them in order — nothing more, nothing less.',
      words: ['command', 'sequence', 'program', 'bug'],
      warmup: 'Robot Parent: you are the robot, your child is the programmer. They may only say "forward", "turn left" and "turn right" to get you from the sofa to the fridge. Do exactly what is said — walk into the wall if told to. Laugh, then let them fix it.',
      teach: ['Open level 1 together. Read the mission aloud, then let your child drag the blocks. Hands off the mouse!',
              'On level 2, have them stand up and face the same way as Bit before choosing left or right.',
              'From level 3 on, ask them to trace the path with a finger and say the steps before building.'],
      ask: ['What will Bit do first? What will he do last?', 'Bit bumped — which block was glowing when it happened?', 'Does turning move Bit to a new square?'],
      watch: 'Left/right mix-ups are normal. The glowing block during a run shows exactly where the program is.',
      mastery: 'Passes "Around the Pond" alone and can point to the block that makes each turn.',
      stretch: 'Replay Zig Zag and predict out loud how many blocks it needs before building it.',
      java: 'Each block is one line of Java, e.g. hero.moveForward(); — do not teach this yet, just know it is coming.'
    },
    yellow: {
      sessions: '2–3 sessions', idea: 'When steps repeat, a loop does the repeating for you. Programmers are happily lazy.',
      words: ['loop', 'repeat', 'pattern', 'nested loop'],
      warmup: 'Clap Patterns: clap-clap-stomp, clap-clap-stomp. Ask "how could I tell you to do that 10 times without saying it 10 times?" Then: "Repeat 3 times: jump, spin."',
      teach: ['The Long Road: let them start stacking eight move blocks, then show the repeat block as a short-cut.',
              'Square Dance and Staircase: find the "chunk" that repeats first, and circle it with a finger on the screen.',
              'Loop the Loop: build one side, test it, then wrap the whole side in a second repeat.'],
      ask: ['Which part happens over and over?', 'How many times does the pattern repeat?', 'What would change if the number was 5 instead of 4?'],
      watch: 'Kids often put the turn outside the loop. Run it and watch — let the hero show the mistake.',
      mastery: 'Passes "Loop the Loop" using a loop inside a loop, and can say which blocks are "inside".',
      stretch: 'Go back and earn 3 stars on Gem Rows. Is there more than one way?',
      java: 'A repeat block becomes: for (int i = 0; i < 4; i++) { … }'
    },
    orange: {
      sessions: '3 sessions', idea: 'Programs can ask yes/no questions and choose what to do. That lets one program solve paths it has never seen.',
      words: ['condition', 'if', 'else', 'until', 'true / false'],
      warmup: 'If–Else Simon Says: "IF I touch my nose, you jump, ELSE you sit." Then: "Keep hopping UNTIL I say banana."',
      teach: ['Until the Flag: compare with The Long Road — no counting needed.',
              'Feel the Way: read the if/else block aloud like a sentence. Have them act it out with a hand on a wall.',
              'Maze Runner: walk a real room with the right hand on the wall before trying it on screen.'],
      ask: ['What question is Bit asking here?', 'What happens when the answer is no?', 'Would this same program work on a different path? Why?'],
      watch: 'Programs here can loop forever. The game stops them gently — talk about why the loop never finished.',
      mastery: 'Passes "Maze Runner" and can explain the right-hand rule in their own words.',
      stretch: 'Can the Left or Right? program also solve Feel the Way? Try it and explain why.',
      java: 'if (hero.pathAhead()) { … } else { … }   and   while (!hero.atGoal()) { … } — the ! means "not".'
    },
    green: {
      sessions: '3 sessions', idea: 'A variable is a named box that remembers a value. The program can look in the box and change what is inside.',
      words: ['variable', 'value', 'set', 'change by', 'count'],
      warmup: 'Score Box: put a sticky note labelled "score" on a cup. Play any quick game; each point, your child rubs out the number and writes the new one. "The name stays the same; what is inside changes."',
      teach: ['One Number to Rule Them: change just one number and see three sides of the path fix themselves.',
              'Growing Spiral: before coding, write the side lengths 1, 2, 3, 4, 5 on paper and ask what changes each time.',
              'Mystery Hallway: run it several times so they see the hallway change — counting by hand cannot work.'],
      ask: ['What is in the box right now?', 'Where does the program change the box?', 'Why can\'t we just type the number 5 here?'],
      watch: 'A common bug is setting the variable inside the loop, which resets it every time round.',
      mastery: 'Passes "Giant Steps" and can tell you the value of the variable at each stair.',
      stretch: 'Change Growing Spiral so the sides grow by 2 each time. Predict where Bit ends up.',
      java: 'int steps = 1;   and   steps = steps + 1;   ("int" means a whole number).'
    },
    blue: {
      sessions: '3 sessions', idea: 'A function is a new command you invent. Name it once, use it anywhere — big problems become small named pieces.',
      words: ['function', 'define', 'call', 'decompose'],
      warmup: 'Invent a Move: make up a dance move called "the wobble" (3 actions). Now just say "wobble!" in the middle of other instructions. You taught a new word.',
      teach: ['Teach a Trick: build the "grab" function first and test it on the first pocket before using it three times.',
              'Three Ponds and Flag Poles: ask "what would you name this piece?" Good names matter.',
              'Flower Garden: draw one flower on paper and number the petals in the order Bit paints them.'],
      ask: ['What job does this function do?', 'How many times do we call it?', 'If the trick needs to change, how many places do we fix?'],
      watch: 'Blocks in a function do nothing until the function is called from the main stack.',
      mastery: 'Passes "Flower Garden" with a function that has a loop inside it.',
      stretch: 'In the Creator Lab, design a level that needs the grab function five times.',
      java: 'A function is called a method in Java: static void grab() { … }  and you call it with grab();'
    },
    purple: {
      sessions: '2–3 sessions', idea: 'Blocks and Java are two ways of writing the same thing. If you can read one, you can read the other.',
      words: ['Java', 'syntax', 'semicolon', 'curly braces', 'method'],
      warmup: 'Code Match: write 4 Java lines on cards (from the Java Lens) and 4 block names on other cards. Match them. Then act out a for loop written on paper.',
      teach: ['The Java Lens: add blocks one at a time and watch the Java panel grow. Ask them to guess the line before it appears.',
              'The Dark Cave: the path is hidden, so the scroll is the only map. Compare their Java panel to the scroll line by line.',
              'Point out the punctuation: ( ) after every command, ; at the end, { } around what is inside.'],
      ask: ['Which block made this line?', 'What do the curly braces hug?', 'What does the ! in front mean?'],
      watch: 'This belt is about reading, not typing. Let them move slowly and compare carefully.',
      mastery: 'Passes "Scroll of Hops" and can read a short Java program aloud in plain English.',
      stretch: 'Cover the blocks with a sheet of paper, read only the Java panel of an old level, and predict where Bit goes.',
      java: 'Everything from here on is real Java, runnable in any Java tool with a small Hero class.'
    },
    brown: {
      sessions: '2–3 sessions', idea: 'Typed code must be exact. Error messages are clues from the computer, not a telling-off.',
      words: ['edit', 'error message', 'typo', 'case-sensitive'],
      warmup: 'Spot the Typo: write "hero.moveForwrd()" and "hero.turnleft();" on paper. Who can find the mistakes fastest? Introduce the idea that capitals matter.',
      teach: ['Change the Number: show how to click into the code and change one character.',
              'Wrong Turn: read each line aloud while tracing the path. Type the missing lines slowly — brackets, then semicolon.',
              'Bug Squash: fix one bug at a time and press Run after each. Read every red message together.'],
      ask: ['What is the message trying to tell us?', 'Which line number does it point to?', 'What did you change, and did it help?'],
      watch: 'Typing is slow at this age and that is fine. Short sessions. Celebrate each fixed bug.',
      mastery: 'Passes "Bug Squash" by reading the error messages without help.',
      stretch: 'Swap seats: you add a bug to working code and they hunt it down. Then they bug yours.',
      java: 'Real programmers spend more time fixing code than writing it. This belt is the real job.'
    },
    red: {
      sessions: '4 sessions', idea: 'You can now write whole programs in Java: sequences, loops, decisions, variables and methods.',
      words: ['for loop', 'while loop', 'int', 'method', 'parameter'],
      warmup: 'Paper Programmer: give a tiny maze on squared paper. They write the Java by hand; you "run" it with a coin as the hero, obeying it exactly.',
      teach: ['First Words: type slowly; press Run after every line or two.',
              'For Real: say the three parts of the for loop as a sentence: "start at 0; while less than 4; add 1".',
              'Method Master: explain a parameter as a blank the caller fills in — walk(5) puts 5 in the box called n.'],
      ask: ['What will this line do?', 'Where does the loop end — which } closes it?', 'What number is n this time?'],
      watch: 'Missing } and ; are the big two. Indenting lines inside braces makes missing ones easy to see.',
      mastery: 'Passes "Method Master", writing a method that takes a number.',
      stretch: 'Rewrite an old Blue Belt level in the Creator Lab using Java instead of blocks.',
      java: 'These are the same building blocks used in school Java courses and Minecraft mods.'
    },
    black: {
      sessions: '3+ sessions', idea: 'A real programmer designs a general answer — an algorithm — and creates things for other people.',
      words: ['algorithm', 'remainder (%)', 'general solution', 'design'],
      warmup: 'Odd or Even: count round the room, clapping on even numbers. That is what i % 2 == 0 means. Then draw a 4-row pyramid and count the tiles per row.',
      teach: ['Maze Master: one program must beat two mazes. Test ideas on paper first.',
              'Checkerboard: write i and i % 2 in two columns for i = 0…7 to see the pattern.',
              'The Golden Pyramid: plan in words before typing. What does one row need? What changes each row?'],
      ask: ['Will your idea still work if the puzzle changes?', 'What stays the same every time, and what changes?', 'How did you test it?'],
      watch: 'Expect this belt to take a while. Struggle here is the point — hold back hints.',
      mastery: 'Passes "The Golden Pyramid" and builds a Creator Lab level that a family member can solve.',
      stretch: 'Graduate to a real Java tool (BlueJ or Greenfoot are free and made for learners) or to Scratch for bigger games.',
      java: 'They can now read and write real Java. The next step is a proper Java editor.'
    }
  };

  var juniorPlans = {
    white: {
      sessions: '2 sessions of 10–15 minutes', idea: 'Arrows are instructions. Pip does them one at a time, in order, from left to right.',
      words: ['arrow', 'first', 'next', 'last', 'go'],
      warmup: 'Arrow Walk: put 4 paper arrows on the floor in a row. Your child stands still while you "read" them and walk. Swap roles.',
      teach: ['Tap the speaker so the mission is read aloud. Let your child tap the arrows — even wrong ones.',
              'Count squares together by touching the screen: "one, two, three".',
              'Before Go, point to each arrow and say what Pip will do.'],
      ask: ['Which way does Pip need to go first?', 'How many squares?', 'What happened? Where did Pip stop?'],
      watch: 'Some children tap Go after every arrow. That is fine — they are testing!',
      mastery: 'Passes the Belt Test with you watching silently.',
      stretch: 'Make a floor maze with cushions and "program" a toy with paper arrows.'
    },
    yellow: {
      sessions: '2 sessions', idea: 'Sometimes there are jobs to do on the way. A good plan gets everything.',
      words: ['collect', 'path', 'plan', 'back'],
      warmup: 'Shopping Trip: put 2 toys around the room. Plan a walk that picks up both and ends at the door. Draw it with a finger in the air first.',
      teach: ['Ask "where are the apples?" before any arrows are tapped.',
              'On level 3, show that Pip can go back the way he came.',
              'Trace the whole path with a finger, then build it.'],
      ask: ['Did Pip get every apple?', 'Which apple should we get first?', 'Is there a shorter way?'],
      watch: 'Going "backwards" is a new idea — the path is allowed to cross itself.',
      mastery: 'Passes the Belt Test and can show the path with a finger before pressing Go.',
      stretch: 'Count the arrows used. Can you do it with fewer?'
    },
    orange: {
      sessions: '2–3 sessions', idea: 'A number can tell an arrow to happen many times. That is a loop!',
      words: ['times', 'repeat', 'number', 'how many'],
      warmup: 'Jump Numbers: hold up a card with a number and say "jump!" — they jump that many times. Then "clap 4", "spin 2".',
      teach: ['Level 1: let them run out of boxes first. Then show: tap the arrow, then tap the number.',
              'Say it as a sentence: "Right, five times."',
              'Count squares aloud and match the count to the number tile.'],
      ask: ['How many squares until the corner?', 'Which number do we need?', 'What does the little number on the arrow mean?'],
      watch: 'The number goes with the arrow that is glowing (or the last one tapped).',
      mastery: 'Passes the Belt Test using numbers on at least two arrows.',
      stretch: 'Replay White and Yellow levels using as few boxes as possible.'
    },
    green: {
      sessions: '2 sessions', idea: 'Mistakes are called bugs, and everyone makes them. Finding and fixing bugs is what coders do all day.',
      words: ['bug', 'fix', 'debug', 'oops'],
      warmup: 'Silly Sandwich: "tell me" how to make a sandwich and follow the steps with one deliberately wrong (jam on the plate!). They spot it and fix just that step.',
      teach: ['Always press Go first to watch the buggy program run.',
              'Ask where Pip went wrong, then tap that arrow — it glows — and pick the right one.',
              'Praise the hunting, not the speed.'],
      ask: ['Where did it go wrong?', 'Which arrow is the bug?', 'Do we need to change it, add one, or take one away?'],
      watch: 'Resist clearing everything and starting again — the skill is fixing only the broken part.',
      mastery: 'Passes the Belt Test and says "I found the bug" with pride.',
      stretch: 'You build a program with one bug for them to fix. Then swap.'
    },
    blue: {
      sessions: '2–3 sessions', idea: 'Some things must happen before others. Planning the order is thinking like a coder.',
      words: ['key', 'door', 'before', 'after', 'order'],
      warmup: 'Getting Dressed: socks before shoes! Mix up the order of morning steps on cards and put them right.',
      teach: ['Ask "what does Pip need before the door will open?"',
              'Find the key with a finger first, then the door, then home.',
              'Use numbers to save boxes on the long walks.'],
      ask: ['What must we do first?', 'What happens if Pip goes to the door without the key?', 'How can we use fewer boxes?'],
      watch: 'A locked door acts like a bush. Let them bump into it once to see.',
      mastery: 'Passes the Belt Test. They are now ready for the Explorer track with a grown-up reading the missions.',
      stretch: 'Move up to Explorer White Belt together — you read, they build.'
    }
  };

  BB.curriculum = { scale: scale, strands: strands, explorerPlans: explorerPlans, juniorPlans: juniorPlans };
})(typeof window !== 'undefined' ? window : globalThis);
