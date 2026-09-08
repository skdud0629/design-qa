function normalizeText(text, ignoreWhitespace = true) {
  const normalized = text.normalize('NFKC');
  return ignoreWhitespace ? normalized.replace(/\s/gu, '') : normalized.trim();
}
module.exports = { normalizeText };
