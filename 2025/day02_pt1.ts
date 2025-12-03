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

for (const num of numbers) {
    const numStr = num.toString()

    if (numStr.length % 2 === 1) {
        continue
    }

    const groupLength = numStr.length / 2

    const group1 = numStr.slice(0, groupLength)
    const group2 = numStr.slice(groupLength)

    if (group1 === group2) {
        invalidIds.push(num)
    }
}

console.log(invalidIds.reduce((acc, val) => acc += val))