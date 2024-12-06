import fs from 'bun:fs';

const inputFilePath = 'inputs/day05.txt';
const [rules, updates] = fs.readFileSync(inputFilePath, 'utf8')
  .split('\n\n')
  .map((data, idx) => {
    if (idx === 0) {
      return data.split('\n')
    }
    return data.split('\n').map(update => update.split(',').map(Number))
  })


const ruleSet = new Set(rules);

let total1 = 0;
let total2 = 0;
for (const update of updates) {
  const sortedUpdate = [...update].sort((a, b) => {
    return ruleSet.has(`${a}|${b}`) ? -1 : 1
  })

  if (update.join() == sortedUpdate.join()) {
    total1 += update[Math.floor(update.length / 2)]
  } else {
    total2 += sortedUpdate[Math.floor(sortedUpdate.length / 2)]
  }
}

console.log('total pt1 ' + total1)
console.log('total pt2 ' + total2)
