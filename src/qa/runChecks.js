const { imageSize, validateRegion, cropRegion } = require('../image/cropRegion');
const { recognizeImage } = require('../ocr/tesseractAdapter');
const { fixedCopy } = require('./fixedCopy');
const { dynamicFormat, validateFormat } = require('./dynamicFormat');
const { classifyResult } = require('./classifyResult');
function validateConfig(config, size) {
  if (!config || config.version !== 1 || !Array.isArray(config.rules) || !config.rules.length) throw new Error('Expected version 1 and nonempty rules');
  if (!config.imageSize || config.imageSize.width !== size.width || config.imageSize.height !== size.height) throw new Error('Image size differs from rule coordinate reference');
  if (config.ocr?.upscale !== 3 || config.ocr?.lang !== 'kor+eng' || config.ocr?.psm !== 11) throw new Error('OCR requires 3x, kor+eng, PSM 11');
  if (!Number.isFinite(config.confidenceThreshold) || config.confidenceThreshold < 0 || config.confidenceThreshold > 100) throw new Error('confidenceThreshold must be 0–100');
  const ids = config.rules.map(r => r?.id);
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate rule IDs');
}
function validateRule(rule, size) {
  if (!rule || typeof rule.id !== 'string' || !rule.id.trim() || typeof rule.selector !== 'string' || !rule.selector.trim()) throw new Error('Rule requires id and selector');
  validateRegion(rule.targetRegion, size);
  if (rule.severity !== undefined && !['error', 'warning'].includes(rule.severity)) throw new Error('Invalid severity');
  if (rule.type === 'fixed_copy') {
    const values = [].concat(rule.expected);
    if (!values.length || !values.every(v => typeof v === 'string' && v.trim())) throw new Error('Expected nonempty copy string(s)');
  } else if (rule.type === 'dynamic') validateFormat(rule.format);
  else throw new Error('Unsupported rule type');
}
async function runChecks(imagePath, config) {
  const size = imageSize(imagePath);
  validateConfig(config, size);
  const results = [];
  for (const rule of config.rules) {
    const result = { ruleId: rule?.id ?? null, targetRegion: rule?.targetRegion ?? null, rawText: null, normalizedText: null, confidence: null, matched: null };
    let crop;
    let stage = 'CONFIG_ERROR';
    try {
      validateRule(rule, size);
      stage = 'CROP_ERROR';
      crop = cropRegion(imagePath, rule.targetRegion, size);
      stage = 'OCR_ERROR';
      const ocr = await recognizeImage(crop.imagePath, { upscale: 1, lang: 'kor+eng', psm: 11 });
      result.rawText = ocr.text;
      result.confidence = ocr.words.length ? ocr.words.reduce((sum, w) => sum + w.confidence * 100, 0) / ocr.words.length : 0;
      stage = 'CHECK_ERROR';
      Object.assign(result, rule.type === 'fixed_copy' ? fixedCopy(ocr.text, rule.expected) : dynamicFormat(ocr.text, rule.format));
      Object.assign(result, classifyResult({ ...result, severity: rule.severity }, config.confidenceThreshold));
    } catch (error) {
      Object.assign(result, { status: 'ERROR', reason: stage, message: error.message });
    } finally { if (crop) crop.cleanup(); }
    results.push(result);
  }
  return results;
}
module.exports = { runChecks, validateConfig, validateRule };
