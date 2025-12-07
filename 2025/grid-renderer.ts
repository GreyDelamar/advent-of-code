export type Viewport = { startX: number; startY: number; endX: number; endY: number };

/**
 * @returns String representation of the cell (may include ANSI color codes)
 */
export type CellRenderer<T = any> = (x: number, y: number, state: T) => string;

export type GridRendererOptions<T = any> = {
    cellRenderer: CellRenderer<T>;
    gridRows: number;
    gridCols: number;
    centerPosition?: [number, number]; // If provided, viewport will follow this position
};


export const color = (c: string, t: string) => `${Bun.color(c, "ansi-16m")}${t}\x1b[0m`;

export const getTerminalSize = () => {
    const rows = process.stdout.rows || 24;
    const cols = process.stdout.columns || 80;
    return { rows: Math.max(1, rows - 2), cols: Math.max(1, cols) };
};

export const calculateViewport = (centerX: number, centerY: number, gridRows: number, gridCols: number): Viewport => {
    const { rows: termRows, cols: termCols } = getTerminalSize();
    const halfRows = Math.floor(termRows / 2);
    const halfCols = Math.floor(termCols / 2);

    let viewStartX = Math.max(0, centerX - halfCols);
    let viewStartY = Math.max(0, centerY - halfRows);
    let viewEndX = Math.min(gridCols, viewStartX + termCols);
    let viewEndY = Math.min(gridRows, viewStartY + termRows);

    if (viewEndX - viewStartX < termCols) {
        viewStartX = Math.max(0, viewEndX - termCols);
    }
    if (viewEndY - viewStartY < termRows) {
        viewStartY = Math.max(0, viewEndY - termRows);
    }

    return { startX: viewStartX, startY: viewStartY, endX: viewEndX, endY: viewEndY };
};

export class GridRenderer<T = any> {
    private currentViewport: Viewport | null = null;
    private previousCellStates: Map<string, string> = new Map();
    private initialized = false;
    private cleanupRegistered = false;
    private options: GridRendererOptions<T> | null = null;

    constructor() {
        // hide cursor
        process.stdout.write('\x1b[?25l');
        this.registerCleanup();
    }

    init(options: GridRendererOptions<T>) {
        this.options = options;
    }

    updateState(state: T, centerPosition?: [number, number]) {
        if (!this.options) {
            throw new Error('GridRenderer.init() must be called before updateState()');
        }

        if (centerPosition) {
            this.options.centerPosition = centerPosition;
        }
        this.render(state, this.options);
    }

    render(state: T, options: GridRendererOptions<T>) {
        const { cellRenderer, gridRows, gridCols, centerPosition } = options;
        const { rows: termRows, cols: termCols } = getTerminalSize();

        let viewport: Viewport;
        let viewportChanged = false;

        if (centerPosition) {
            const [centerX, centerY] = centerPosition;
            const newViewport = calculateViewport(centerX, centerY, gridRows, gridCols);

            if (!this.currentViewport ||
                this.currentViewport.startX !== newViewport.startX ||
                this.currentViewport.startY !== newViewport.startY ||
                this.currentViewport.endX !== newViewport.endX ||
                this.currentViewport.endY !== newViewport.endY) {
                viewport = newViewport;
                viewportChanged = true;
                this.currentViewport = viewport;
            } else {
                viewport = this.currentViewport;
            }
        } else {
            if (!this.currentViewport) {
                viewport = {
                    startX: 0,
                    startY: 0,
                    endX: Math.min(gridCols, termCols),
                    endY: Math.min(gridRows, termRows)
                };
                this.currentViewport = viewport;
                viewportChanged = true;
            } else {
                viewport = this.currentViewport;
            }
        }

        if (viewportChanged || this.previousCellStates.size === 0 || !this.initialized) {
            if (viewportChanged) {
                this.previousCellStates.clear();
            }

            const output: string[] = [];
            // Y is vertical (rows), X is horizontal (columns)
            for (let y = viewport.startY; y < viewport.endY; y++) {
                let line = '';
                for (let x = viewport.startX; x < viewport.endX; x++) {
                    const key = `${x},${y}`;
                    const rendered = cellRenderer(x, y, state);
                    line += rendered;
                    this.previousCellStates.set(key, rendered);
                }
                output.push(line + '\n');
            }
            process.stdout.write(`\x1b[2J\x1b[H${output.join('')}`);
            this.initialized = true;
            return;
        }

        const updates: string[] = [];
        let needsUpdate = false;

        // Y is vertical (rows), X is horizontal (columns)
        for (let y = viewport.startY; y < viewport.endY; y++) {
            for (let x = viewport.startX; x < viewport.endX; x++) {
                const key = `${x},${y}`;
                const rendered = cellRenderer(x, y, state);
                const previous = this.previousCellStates.get(key);

                if (previous !== rendered) {
                    const screenRow = y - viewport.startY + 1;
                    const screenCol = x - viewport.startX + 1;
                    updates.push(`\x1b[${screenRow};${screenCol}H${rendered}`);
                    this.previousCellStates.set(key, rendered);
                    needsUpdate = true;
                }
            }
        }

        if (needsUpdate) {
            process.stdout.write(updates.join(''));
        }
    }

    private registerCleanup() {
        if (this.cleanupRegistered) return;
        this.cleanupRegistered = true;

        const cleanup = () => {
            // restore cursor
            process.stdout.write('\x1b[?25h');
            process.stdout.write('\n');
        };

        process.on('exit', cleanup);
        process.on('SIGINT', () => {
            cleanup();
            process.exit(0);
        });
        process.on('SIGTERM', () => {
            cleanup();
            process.exit(0);
        });
        process.on('uncaughtException', (err) => {
            cleanup();
            throw err;
        });

        const originalExit = process.exit;
        process.exit = ((code?: number) => {
            cleanup();
            originalExit(code);
        }) as typeof process.exit;
    }
}
