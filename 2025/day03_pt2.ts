export {}

const file = await Bun.file('inputs/day03test.txt').text();
const batteryBanks = file.split('\n').filter(line => line.trim());

const getMaxJoltage = (bank: string): number => {
  let result = '';
  let start = 0;

  for (let remaining = 12; remaining > 0; remaining--) {
    const end = bank.length - remaining;

    let maxIdx = start;

    for (let i = start + 1; i <= end; i++) {
      if (bank[i] > bank[maxIdx]) maxIdx = i;
    }

    result += bank[maxIdx];
    
    start = maxIdx + 1;
  }

  return parseInt(result);
};

const result = batteryBanks.reduce((acc, bank) => acc + getMaxJoltage(bank), 0);
console.log(result);