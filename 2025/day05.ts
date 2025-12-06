export { }

const inputFilePath = 'inputs/day05.txt'
const file = await Bun.file(inputFilePath).text()
const lines = file.split('\n')
const split = lines.findIndex(l => l === '')
const ranges = lines.slice(0, split).map(s => {
    const [min, max] = s.split('-')
    return { min: +min, max: +max }
})
const ingredients = lines.slice(split + 1)

let spoiledCount = 0
for (let idx = 0; idx < ingredients.length; idx++) {
    const ingredient = +ingredients[idx];

    const check = ranges.some(range => {
        if (ingredient >= range.min && ingredient <= range.max) return true
        return false
    })

    if (!check) {
        spoiledCount++
    }

}

const claimedRange: Array<{
    min: number;
    max: number;
}> = []
for (const range of ranges) {
    let currentRange: { min: number; max: number } | null = { min: range.min, max: range.max }
    const rangesToRemove: number[] = []
    const rangesToAdd: Array<{ min: number; max: number }> = []
    
    for (let i = 0; i < claimedRange.length; i++) {
        const cr = claimedRange[i]
        
        if (!currentRange || currentRange.min > currentRange.max) {
            continue
        }
        
        if (currentRange.min <= cr.min && currentRange.max >= cr.max) {
            rangesToRemove.push(i)
            continue
        }
        
        if (cr.min <= currentRange.min && cr.max >= currentRange.max) {
            currentRange = null
            break
        }
        
        if (currentRange.min >= cr.min && currentRange.min <= cr.max) {
            currentRange.min = cr.max + 1
        }
        
        if (currentRange.max >= cr.min && currentRange.max <= cr.max) {
            currentRange.max = cr.min - 1
        }
        
        if (currentRange && currentRange.min < cr.min && currentRange.max > cr.max) {
            rangesToAdd.push({ min: cr.max + 1, max: currentRange.max })
            currentRange.max = cr.min - 1
        }
    }
    
    rangesToRemove.sort((a, b) => b - a)
    for (const idx of rangesToRemove) {
        claimedRange.splice(idx, 1)
    }
    
    if (currentRange && currentRange.min <= currentRange.max) {
        claimedRange.push(currentRange)
    }
    
    claimedRange.push(...rangesToAdd)
}



console.log('freshCount', ingredients.length - spoiledCount)
console.log('ids', claimedRange.reduce((acc, r) => acc += (r.max - r.min) + 1 , 0))

