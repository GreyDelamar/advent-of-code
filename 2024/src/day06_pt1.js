import fs from 'bun:fs';

// Constants and Variables
const guardPos = [0, 0];
const obstacles = new Set();
const distinctPos = new Set();
const DEBUG = true;
const display = []; // For debugging

const inputFilePath = 'inputs/day06.txt';

const createSetKey = (x, y) => `${x},${y}`;

const lines = fs.readFileSync(inputFilePath, 'utf8').split('\n');
for (const [y, line] of lines.entries()) {
    const lineSplit = line.split('');
    if (DEBUG) display.push(lineSplit);

    for (const [x, char] of lineSplit.entries()) {
        if (char === '^') {
            guardPos[0] = x;
            guardPos[1] = y;
            distinctPos.add(createSetKey(x, y));
        } else if (char === '#') {
            obstacles.add(createSetKey(x, y));
        }
    }
}

const isWithinBounds = (x, y) => {
    return x >= 0 && x < lines[0].length && y >= 0 && y < lines.length;
};

async function printDisplay() {
    console.clear();

    // Clear previous guard position in display
    for (let lineIdx = 0; lineIdx < display.length; lineIdx++) {
        const line = display[lineIdx];
        for (let charIdx = 0; charIdx < line.length; charIdx++) {
            if (line[charIdx] === 'G') {
                line[charIdx] = 'X';
            }
        }
    }

    if (isWithinBounds(...guardPos)) {
        // Update the display with the current guard position
        display[guardPos[1]][guardPos[0]] = 'G';
    }

    for (const line of display) {
        console.log(line.join(''));
    }

    await new Promise(res => setTimeout(res, 30));
}

// This order is important
const DIRECTIONS = {
    UP: [0, -1],
    RIGHT: [1, 0],
    DOWN: [0, 1],
    LEFT: [-1, 0],
};
const directionKeys = Object.keys(DIRECTIONS);
let currentDirIndex = 0;

async function moveGuard() {
    if (DEBUG) await printDisplay();

    while (isWithinBounds(...guardPos)) {
        const newPos = [
            guardPos[0] + DIRECTIONS[directionKeys[currentDirIndex]][0],
            guardPos[1] + DIRECTIONS[directionKeys[currentDirIndex]][1],
        ];

        // Move guard if the next position is not an obstacle
        if (!obstacles.has(createSetKey(...newPos))) {
            guardPos[0] = newPos[0];
            guardPos[1] = newPos[1];

            distinctPos.add(createSetKey(...guardPos));
            if (DEBUG) await printDisplay();
        } else {
            // Change direction if blocked
            currentDirIndex = (currentDirIndex + 1) % directionKeys.length;
        }
    }
}

// Start the guard movement
await moveGuard();

console.log('\n');
console.log(`Distinct Positions: ${distinctPos.size}`);
