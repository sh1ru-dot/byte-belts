# Byte Belts

A free, belt-based coding course for kids that runs in a web browser.
No accounts, no adverts, no fees, and it works without the internet.

| Track | Ages | What they do | Levels |
|---|---|---|---|
| **Cubs** | 4–6 | Tap arrows to guide Pip the fox. Missions are read aloud. | 25 (5 belts) |
| **Explorers** | 7–11 | Snap Scratch-style blocks to program Bit the robot, then read, fix and write real Java. | 42 (9 belts) |

## Start it

**Online (any device):** https://sh1ru-dot.github.io/byte-belts/

**On the Mac:** double-click `start.command`. A browser tab opens at `http://localhost:8642`.

**On an iPad or another computer (same Wi-Fi):** start it on the Mac as above, then on the
other device open the second address the window prints (something like `http://192.168.1.20:8642`).

Progress is saved in the browser on each device, so each child should keep using the same device and browser.

## What is where

- `index.html` – home page (pick Cubs or Explorers)
- `junior.html` – Cubs app (age 5)
- `explorer.html` – Explorers app (age 8)
- `parents.html` – **Grown-ups guide**: lesson plans, belt scale, mastery scale, answer key, progress, settings
- `js/levels-junior.js`, `js/levels-explorer.js` – every level (edit these to add your own)
- `js/curriculum.js` – lesson plans and the mastery scale
- `tests/run.js` – proves every level can be solved: `node tests/run.js`

## The path from blocks to Java

1. **White → Blue belt:** blocks only (sequences, loops, decisions, variables, functions).
2. **Purple belt:** the *Java Lens* shows the blocks as real Java, live, side by side.
3. **Brown belt:** blocks go away; children change and fix typed Java.
4. **Red and Black belts:** children write Java themselves, then design their own levels in the Creator Lab.

Grown-ups can show the Java Lens from day one in the guide's Settings.

## Credits

Blocks are powered by [Blockly](https://developers.google.com/blockly) (Apache 2.0 licence, in `vendor/blockly`),
the open-source library from the same family as Scratch's blocks. Everything else here is original.
