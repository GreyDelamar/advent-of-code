export { }

const inputFilePath = 'inputs/day01.txt'
const file = await Bun.file(inputFilePath).text()
const lines = file.split('\n').filter(line => line.trim())

let position = 50
let zeroCount = 0

for (const line of lines) {
    const direction = line[0]
    const amount = parseInt(line.slice(1))
    const turn = direction === 'L' ? -amount : amount

    position = ((position + turn) + 100) % 100

    if (position === 0) {
        zeroCount++
    }
}

console.log('result:', zeroCount)