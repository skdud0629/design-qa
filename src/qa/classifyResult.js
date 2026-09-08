function classifyResult({ rawText, confidence, matched, severity = 'error' }, threshold) {
  if (!rawText.trim()) return { status: 'WARNING', reason: 'OCR_EMPTY' };
  if (!Number.isFinite(confidence) || confidence < threshold) return { status: 'WARNING', reason: 'LOW_CONFIDENCE' };
  if (matched) return { status: 'PASS', reason: 'MATCH' };
  return { status: severity === 'warning' ? 'WARNING' : 'ERROR', reason: 'MISMATCH' };
}
module.exports = { classifyResult };
