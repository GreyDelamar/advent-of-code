export { }

const inputFilePath = 'inputs/day01.txt'
const file = await Bun.file(inputFilePath).text()
const lines = file.split('\n').filter(line => line.trim())

let position = 50
let zeroCrossedCount = 0

for (const line of lines) {
    const direction = line[0]
    const amount = parseInt(line.slice(1))
    const turn = direction === 'L' ? -amount : amount

    zeroCrossedCount += Math.floor(Math.abs(turn) / 100)

    const turnRemainder = turn % 100
    const newPosition = position + turnRemainder
    const isNotStartingAtZero = position !== 0 ? 1 : 0

    if (newPosition < 0 || newPosition >= 100 || newPosition === 0) {
        zeroCrossedCount += isNotStartingAtZero
    }

    position = (newPosition + 100) % 100
}

console.log('result:', zeroCrossedCount)