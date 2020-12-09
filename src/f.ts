function rollDice(): 1 | 2 | 3 | 4 | 5 | 6 {
  return (Math.floor(Math.random() * 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
}
let i = 1000000;
console.log(rollDice()); // rollDice()
while (i) console.log(rollDice());
