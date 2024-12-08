import fs from 'bun:fs';

const inputFilePath = 'inputs/day07.txt';
const lines = fs.readFileSync(inputFilePath, 'utf8')
  .trim()
  .split("\n")
  .map((line) => line.match(/\d+/g).map(Number));

const operators = ['*', '+', '||'];

const evaluateExpression = (numbers, ops) => {
  let result = numbers[0];
  for (let i = 0; i < ops.length; i++) {
    if (ops[i] === '+') {
      result += numbers[i + 1];
    } else if (ops[i] === '*') {
      result *= numbers[i + 1];
    } else if (ops[i] === '||') {
      result = Number(String(result) + String(numbers[i + 1]));
    }
  }
  return result;
};

const generateCombinations = (length) => {
  const results = [];
  const totalCombinations = Math.pow(operators.length, length - 1);
  
  for (let i = 0; i < totalCombinations; i++) {
    const combination = [];
    let num = i;
    for (let j = 0; j < length - 1; j++) {
      combination.push(operators[num % operators.length]);
      num = Math.floor(num / operators.length);
    }
    results.push(combination);
  }
  return results;
};

let sum = 0
lines.map(([target, ...numbers]) => {
  const combinations = generateCombinations(numbers.length);
  for (const ops of combinations ) {
    const result = evaluateExpression(numbers, ops);
    if (result === target) {
      sum += target
      break
    }
  };
});

console.log(sum)