export { }

type Position3D = [
    number, // x
    number, // y
    number, // z
]

type PositionPair = {
    firstIndex: number
    secondIndex: number
    distance: number
}

const inputFilePath = 'inputs/day08.txt'
const fileContent = await Bun.file(inputFilePath).text()
const lines = fileContent.trim().split('\n')
const positions = lines.map(line => {
    return line.split(',').map(num => parseInt(num)) as Position3D
})

/**
 * Union-Find
 */
class UnionFind {
    // parent[i] points to the parent of element i in the tree structure
    parent: number[]
     // size[i] is the size of the tree rooted at i
    size: number[]

    constructor(numberOfElements: number) {
        this.parent = Array.from({ length: numberOfElements }, (_, index) => index)
        this.size = Array(numberOfElements).fill(1)
    }

    find(x: number): number {
        if (this.parent[x] !== x) {
            // Path compression: point directly to root
            this.parent[x] = this.find(this.parent[x])
        }
        return this.parent[x]
    }

    union(x: number, y: number): boolean {
        const rootX = this.find(x)
        const rootY = this.find(y)
        
        // Already in the same circuit
        if (rootX === rootY) {
            return false
        }

        // Union by size: attach smaller tree under larger tree
        if (this.size[rootX] < this.size[rootY]) {
            // move rootX under rootY
            this.parent[rootX] = rootY
            this.size[rootY] += this.size[rootX]
        } else {
            // move rootY under rootX
            this.parent[rootY] = rootX
            this.size[rootX] += this.size[rootY]
        }

        return true
    }
}

const getCircuitSizes = (uf: UnionFind): number[] => {
    const sizeMap = new Map<number, number>()
    
    for (let i = 0; i < uf.parent.length; i++) {
        const root = uf.find(i)
        sizeMap.set(root, uf.size[root])
    }
    
    return Array.from(sizeMap.values())
}

const calculateDistance3D = ([x1, y1, z1]: Position3D, [x2, y2, z2]: Position3D): number => {
    return Math.hypot(x2 - x1, y2 - y1, z2 - z1)
}

const allPositionPairs: PositionPair[] = []

for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
        const distance = calculateDistance3D(positions[i], positions[j])
        allPositionPairs.push({ 
            firstIndex: i, 
            secondIndex: j, 
            distance 
        })
    }
}

allPositionPairs.sort((a, b) => a.distance - b.distance)

// Part 1
const unionFindPt1 = new UnionFind(positions.length)
const maxAttemptsForPt1 = 1000

for (let attempt = 0; attempt < maxAttemptsForPt1; attempt++) {
    const pair = allPositionPairs[attempt]
    // const wasConnected = 
    unionFindPt1.union(pair.firstIndex, pair.secondIndex)
    
    // console.log(
    //     wasConnected
    //         ? `Attempt ${attempt + 1}: Connected box ${pair.firstIndex} to ${pair.secondIndex} - distance: ${pair.distance.toFixed(2)}`
    //         : `Attempt ${attempt + 1}: Boxes ${pair.firstIndex} and ${pair.secondIndex} already in same circuit`
    // )
}

const circuitSizesPt1 = getCircuitSizes(unionFindPt1)
const sortedSizesPt1 = circuitSizesPt1.sort((a, b) => b - a)
const threeLargestCircuits = sortedSizesPt1.slice(0, 3)
const pt1Result = threeLargestCircuits.reduce((product, size) => product * size, 1)

console.log('\nCircuit sizes:', sortedSizesPt1)
console.log('Three largest circuits:', threeLargestCircuits)
console.log('Part 1 Result (product of three largest):', pt1Result)

// Part 2
const unionFindPt2 = new UnionFind(positions.length)
let pt2Result = 0

for (let attempt = 0; attempt < allPositionPairs.length; attempt++) {
    const pair = allPositionPairs[attempt]
    const wasConnected = unionFindPt2.union(pair.firstIndex, pair.secondIndex)
    
    if (wasConnected) {
        // Update pt2Result with the product of x-coordinates of the last connected pair
        pt2Result = positions[pair.firstIndex][0] * positions[pair.secondIndex][0]
        // console.log(
        //     `Attempt ${attempt + 1}: Connected box ${pair.firstIndex} ` +
        //     `(${positions[pair.firstIndex]}) to ${pair.secondIndex} ` +
        //     `(${positions[pair.secondIndex]}) - pt2Result: ${pt2Result}`
        // )
    }
}

console.log('\nPart 2 Result:', pt2Result)