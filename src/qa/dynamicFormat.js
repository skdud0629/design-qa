const { normalizeText } = require('./normalizeText');
function validateFormat(format) {
  if (!format || typeof format.ignoreWhitespace !== 'boolean') throw new Error('format.ignoreWhitespace must be boolean');
  if (format.kind === 'time_range' && format.pattern === 'HH:mm-HH:mm' && format.hourCycle === 24) return;
  if (format.kind === 'currency' && format.currency === 'KRW' && format.thousandSeparator === ',' && format.suffix === '원' && format.decimalPlaces === 0) return;
  throw new Error('Unsupported format configuration');
}
function dynamicFormat(text, format) {
  validateFormat(format);
  const normalizedText = normalizeText(text, format.ignoreWhitespace);
  const pattern = format.kind === 'time_range'
    ? /^(?:[01][0-9]|2[0-3]):[0-5][0-9]-(?:[01][0-9]|2[0-3]):[0-5][0-9]$/
    : /^(?:0|[1-9][0-9]{0,2}(?:,[0-9]{3})*)원$/;
  return { normalizedText, matched: pattern.test(normalizedText) };
}
module.exports = { validateFormat, dynamicFormat };
