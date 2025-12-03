export { }

const inputFilePath = 'inputs/day02.txt'
const file = await Bun.file(inputFilePath).text()
const numbers = file.split(',').filter(line => line.trim()).flatMap(
    (str) => {
        const [start, end] = str.split('-').map(n => parseInt(n))
        return Array.from({ length: (end - start) + 1 }, (_, i) => start + i)
    }
)

const invalidIds: Array<number> = []

function strChunk(str: string, size: number) {
    return Array.from({length: Math.ceil(str.length / size) }, (_, i) => str.slice(i * size, i * size + size))
}

for (const num of numbers) {
    const numStr = num.toString()

    if (numStr.length === 1) continue

    let i = 1
    do {
        const strChunks = strChunk(numStr, i)
        const hasDuplicates = strChunks.every(c => c === strChunks[0])

        if(hasDuplicates) {
            invalidIds.push(num)
            break
        }
        i++
    } while (i <= numStr.length - 1);
}

console.log(invalidIds)
console.log(invalidIds.reduce((acc, val) => acc += val)) 