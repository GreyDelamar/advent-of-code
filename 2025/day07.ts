import { GridRenderer, color } from "./grid-renderer"

export { }

const inputFilePath = 'inputs/day07.txt'
const file = await Bun.file(inputFilePath).text()
const lines = file.trim().split('\n')

type position = { x: number, y: number }
type GridState = { startingPos: position, beamPositions: Set<string>, addOrnaments?: boolean }
const renderer = new GridRenderer<GridState>()


const cellRenderer = (x: number, y: number, state: GridState) => {
    const char = lines[y]?.[x] || ' '

    if (state.startingPos.x === x && state.startingPos.y === y) {
        return color('yellow', '*');
    }

    if (state.beamPositions.has(`${x},${y}`)) {
        return color('green', '|');
    }

    if (state.addOrnaments && char === '^') {
        const ornamentColors = ['red', 'blue', 'magenta', 'cyan', 'white'];
        const colorIndex = (x + y * 1000) % ornamentColors.length;
        return color(ornamentColors[colorIndex], 'o');
    }

    return char;
}

const startingPointX = lines[0].split('').findIndex(c => c === 'S')
const startingPos = { x: startingPointX, y: 0 }
const beamPositions = new Set<string>([`${startingPos.x},${startingPos.y}`])
const splitPositions = new Set<string>()

let timelines = new Map<number, number>()
timelines.set(startingPointX, 1)

renderer.init({
    cellRenderer,
    gridRows: lines.length,
    gridCols: lines[0].length,
    centerPosition: [startingPos.x, startingPos.y]
})


renderer.updateState({ startingPos, beamPositions })
await new Promise(resolve => setTimeout(resolve, 50))

for (let y = 1; y < lines.length; y++) {
    const line = lines[y];
    const nextTimelines = new Map<number, number>()

    for (let x = 0; x < line.length; x++) {
        // check for beam above
        if (beamPositions.has(`${x},${y - 1}`)) {
            const char = line[x]

            if (char === '^') {
                splitPositions.add(`${y},${x}`)
                const leftX = x - 1
                const rightX = x + 1
                beamPositions.add(`${leftX},${y}`)
                beamPositions.add(`${rightX},${y}`)

                const timelineCount = timelines.get(x) || 0
                if (timelineCount > 0) {
                    nextTimelines.set(leftX, (nextTimelines.get(leftX) || 0) + timelineCount)
                    nextTimelines.set(rightX, (nextTimelines.get(rightX) || 0) + timelineCount)
                }
            } else {
                beamPositions.add(`${x},${y}`)

                const timelineCount = timelines.get(x) || 0
                if (timelineCount > 0) {
                    nextTimelines.set(x, (nextTimelines.get(x) || 0) + timelineCount)
                }
            }
        }
    }

    timelines = nextTimelines
    renderer.updateState({ startingPos, beamPositions }, [Math.floor(line.length / 2), y])
    await new Promise(resolve => setTimeout(resolve, 50))
}

const scrollDelay = 100
const scrollSteps = 50

for (let step = 0; step < scrollSteps; step++) {
    const scrollY = Math.floor((step / scrollSteps) * lines.length)
    const centerX = Math.floor(lines[0].length / 2)

    renderer.updateState({ startingPos, beamPositions, addOrnaments: true }, [centerX, scrollY])
    await new Promise(resolve => setTimeout(resolve, scrollDelay))
}

console.log(`\n\nTotal splits: ${splitPositions.size}`)
console.log(`Total timelines: ${[...timelines.values()].reduce((acc, count) => acc+=count,0)}`)
