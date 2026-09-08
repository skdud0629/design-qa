const fs = require('fs');
const path = require('path');
const { runChecks } = require('../qa/runChecks');
async function main() {
  const [image, rules] = process.argv.slice(2);
  if (!image || !rules) throw new Error('Usage: node src/cli/qaTest.js <image-path> <rules-json>');
  const results = await runChecks(path.resolve(image), JSON.parse(fs.readFileSync(path.resolve(rules), 'utf8')));
  console.log(JSON.stringify({ results }, null, 2));
  if (results.some(r => r.status === 'ERROR')) process.exitCode = 1;
}
main().catch(error => {
  console.log(JSON.stringify({ status: 'ERROR', reason: 'INPUT_OR_CONFIG_ERROR', message: error.message }, null, 2));
  process.exitCode = 1;
});
