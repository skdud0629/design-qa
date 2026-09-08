const { normalizeText } = require('./normalizeText');
function fixedCopy(text, expected) {
  const normalizedText = normalizeText(text);
  return { normalizedText, matched: [].concat(expected).some(value => normalizeText(value) === normalizedText) };
}
module.exports = { fixedCopy };
