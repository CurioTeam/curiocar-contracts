const metrics = {
  total: 0
};

const tokens = require('./sell_tokens.json');

for (let token of tokens) {
  console.log(`[${ token.id }] -> ${ token.name }`);
}

metrics.total += tokens.length;

console.log('\n');

console.log(`-------------------------`);
console.log(`Total tokens: ${ metrics.total }`);
