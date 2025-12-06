export { }

const inputFilePath = 'inputs/day06.txt'
const file = await Bun.file(inputFilePath).text()
const lines = file.trim().split('\n')


const operatorIndexes: Array<number> = []
const operatorRow = lines[lines.length - 1]
const operatorRowSplit = operatorRow.split(' ').filter(x => x)
for (let idx = 0; idx < operatorRow.length; idx++) {
  if (['*', '+'].includes(operatorRow[idx])) operatorIndexes.push(idx)
}

const columns: string[][] = []
for (const row of lines.slice(0, lines.length - 1)) {
  const col: Array<string> = []

  // split by the index of the operator
  let prev = 0
  for (const index of operatorIndexes) {
    if (index > 0) col.push(row.slice(prev, index - 1))
    prev = index
  }

  // grab the last number
  col.push(row.slice(prev))

  columns.push(col)
}


interface ColumnData {
  operator: string
  numbers: string[]
  numbersColumns: string[][]
}

const verticalSlices: ColumnData[] = []

for (let x = 0; x < columns[0].length; x++) {
  const slice: string[] = []
  for (let y = 0; y < columns.length; y++) {
    slice.push(columns[y][x])
  }

  verticalSlices.push({
    operator: operatorRowSplit[x],
    numbers: slice.map(x => x.trim()),
    numbersColumns: slice.map(x => x.split(''))
  })
}


let pt1 = 0
let pt2 = 0
for (const { operator, numbers, numbersColumns } of verticalSlices) {
  pt1 += numbers.reduce((acc, x) => {
    if (acc === 0) return x
    return eval(`${acc} ${operator} ${x}`)
  }, 0)



  let nums: string[] = []
  for (let x = numbersColumns[0].length - 1; x >= 0; x--) {
    let str = ''
    for (let y = 0; y < numbersColumns.length; y++) {
      str += numbersColumns[y][x];
    }

    nums.push(str)
  }


  const evalString = nums.reduce((acc, v) => {
    if (!acc) return acc = v.trim()
    return acc += operator + v.trim()
  }, '')

  pt2 += eval(evalString)
}

console.log('pt1', pt1)
console.log('pt2', pt2)