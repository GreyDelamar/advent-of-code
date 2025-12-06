export { }

const inputFilePath = 'inputs/day04.txt'
const file = await Bun.file(inputFilePath).text()
const row = file.split('\n')
import {setTimeout} from 'timers/promises'

const color = (c: string, t: string) => `${Bun.color(c, "ansi-16m")}${t}\x1b[0m`;

const renderSpeed = 5
const shouldRenderGrid = true

const greenPositions = new Set<string>()


let currentViewport: { startX: number; startY: number; endX: number; endY: number } | null = null;
let previousCellStates: Map<string, string> = new Map();
process.stdout.write('\x1b[?25l');

const getTerminalSize = () => {
    const rows = process.stdout.rows || 24;
    const cols = process.stdout.columns || 80;
    return { rows: Math.max(1, rows - 2), cols: Math.max(1, cols) };
}

const calculateViewport = (centerX: number, centerY: number, gridRows: number, gridCols: number) => {
    const { rows: termRows, cols: termCols } = getTerminalSize();
    const halfRows = Math.floor(termRows / 2);
    const halfCols = Math.floor(termCols / 2);
    
    let viewStartX = Math.max(0, centerX - halfRows);
    let viewStartY = Math.max(0, centerY - halfCols);
    let viewEndX = Math.min(gridRows, viewStartX + termRows);
    let viewEndY = Math.min(gridCols, viewStartY + termCols);
    
    if (viewEndX - viewStartX < termRows) {
        viewStartX = Math.max(0, viewEndX - termRows);
    }
    if (viewEndY - viewStartY < termCols) {
        viewStartY = Math.max(0, viewEndY - termCols);
    }
    
    return { startX: viewStartX, startY: viewStartY, endX: viewEndX, endY: viewEndY };
}

const getCellRender = (x: number, y: number, state: {
    red?: [number, number]
    yellow?: Set<string>
    cyan?: [number, number]
    found?: Set<string>
    checked?: Set<string>
}): string => {
    const char = row[x]?.[y] || ' ';
    const key = `${x},${y}`;
    const isRed = state.red?.[0] === x && state.red[1] === y;
    const isGreen = greenPositions.has(key);
    const isYellow = state.yellow?.has(key) && !state.checked?.has(key);
    const isCyan = state.cyan?.[0] === x && state.cyan[1] === y;
    const isFound = state.found?.has(key);
    
    if (char === '.') {
        return isCyan ? color('cyan', '.') : isYellow ? color('yellow', '.') : '.';
    } else if (char === '@') {
        const c = isCyan ? 'cyan' : isYellow ? 'yellow' : isGreen ? 'green' : isRed ? 'red' : isFound ? 'blue' : '';
        return c ? color(c, '@') : '@';
    } else {
        return ' ';
    }
}

const renderGrid = (state: {
    red?: [number, number]
    yellow?: Set<string>
    cyan?: [number, number]
    found?: Set<string>
    checked?: Set<string>
} = {}) => {
    if (!shouldRenderGrid) return
    const { rows: termRows, cols: termCols } = getTerminalSize();
    const gridRows = row.length;
    const gridCols = Math.max(...row.map(r => r.length));
    
    let viewport: { startX: number; startY: number; endX: number; endY: number };
    let viewportChanged = false;
    
    if (state.red) {
        const [centerX, centerY] = state.red;
        const newViewport = calculateViewport(centerX, centerY, gridRows, gridCols);
        
        if (!currentViewport || 
            currentViewport.startX !== newViewport.startX ||
            currentViewport.startY !== newViewport.startY ||
            currentViewport.endX !== newViewport.endX ||
            currentViewport.endY !== newViewport.endY) {
            viewport = newViewport;
            viewportChanged = true;
            currentViewport = viewport;
        } else {
            viewport = currentViewport;
        }
    } else {
        if (!currentViewport) {
            viewport = {
                startX: 0,
                startY: 0,
                endX: Math.min(gridRows, termRows),
                endY: Math.min(gridCols, termCols)
            };
            currentViewport = viewport;
            viewportChanged = true;
        } else {
            viewport = currentViewport;
        }
    }
    
    if (viewportChanged || previousCellStates.size === 0) {
        if (viewportChanged) {
            previousCellStates.clear();
        }
        
        const output: string[] = [];
        for (let x = viewport.startX; x < viewport.endX; x++) {
            let line = '';
            for (let y = viewport.startY; y < viewport.endY; y++) {
                const key = `${x},${y}`;
                const rendered = getCellRender(x, y, state);
                line += rendered;
                previousCellStates.set(key, rendered);
            }
            output.push(line + '\n');
        }
        process.stdout.write(`\x1b[2J\x1b[H${output.join('')}`);
        return;
    }
    
    const updates: string[] = [];
    let needsUpdate = false;
    
    for (let x = viewport.startX; x < viewport.endX; x++) {
        for (let y = viewport.startY; y < viewport.endY; y++) {
            const key = `${x},${y}`;
            const rendered = getCellRender(x, y, state);
            const previous = previousCellStates.get(key);
            
            if (previous !== rendered) {
                const screenRow = x - viewport.startX + 1;
                const screenCol = y - viewport.startY + 1;
                updates.push(`\x1b[${screenRow};${screenCol}H${rendered}`);
                previousCellStates.set(key, rendered);
                needsUpdate = true;
            }
        }
    }
    
    if (needsUpdate) {
        process.stdout.write(updates.join(''));
    }
}

renderGrid();

const neighbors = (x: number, y: number) => [
    [x-1, y-1], [x-1, y], [x-1, y+1], [x, y+1],
    [x+1, y+1], [x+1, y], [x+1, y-1], [x, y-1]
];

for (let x = 0; x < row.length; x++) {
    for (let y = 0; y < row[x].length; y++) {
        if (row[x][y] === '@') {
            const nbs = neighbors(x, y);
            const yellow = new Set(nbs.map(([nx, ny]) => `${nx},${ny}`));
            const found = new Set<string>();
            const checked = new Set<string>();
            
            renderGrid({ red: [x, y], yellow });
            if (renderSpeed) await setTimeout(renderSpeed);
            
            for (const [nx, ny] of nbs) {
                const key = `${nx},${ny}`;
                renderGrid({ red: [x, y], yellow, cyan: [nx, ny], found, checked });
                if (renderSpeed) await setTimeout(renderSpeed);
                
                checked.add(key);
                if (row[nx]?.[ny] === '@') found.add(key);
                
                renderGrid({ red: [x, y], yellow, found, checked });
                if (renderSpeed) await setTimeout(renderSpeed);
            }
            
            if (found.size < 4) {
                greenPositions.add(`${x},${y}`);
            }
             
            renderGrid({ red: [x, y], yellow, found, checked });
            if (renderSpeed) await setTimeout(renderSpeed);
            renderGrid();
            if (renderSpeed) await setTimeout(renderSpeed);
        }
    }
}

const additionalGreenPositions = new Set<string>();
let previousSize = -1;
while (previousSize !== additionalGreenPositions.size) {
    previousSize = additionalGreenPositions.size;
    for (let x = 0; x < row.length; x++) {
        for (let y = 0; y < row[x].length; y++) {
            if (row[x][y] === '@') {
                const key = `${x},${y}`;
                if (greenPositions.has(key) || additionalGreenPositions.has(key)) continue;
                
                const nbs = neighbors(x, y);
                let neighborCount = 0;
                for (const [nx, ny] of nbs) {
                    const k = `${nx},${ny}`;
                    if (row[nx]?.[ny] === '@' && !greenPositions.has(k) && !additionalGreenPositions.has(k)) {
                        neighborCount++;
                    }
                }
                
                if (neighborCount < 4) {
                    additionalGreenPositions.add(key);
                }
            }
        }
    }
}

process.stdout.write('\x1b[?25h');
console.log('\n\n pt.1: ', greenPositions.size)
console.log('pt.2: ', greenPositions.size + additionalGreenPositions.size)