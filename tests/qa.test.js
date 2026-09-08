const { test } = require('node:test');
const assert = require('node:assert/strict');
const { fixedCopy } = require('../src/qa/fixedCopy');
const { dynamicFormat } = require('../src/qa/dynamicFormat');
const { classifyResult } = require('../src/qa/classifyResult');
const { validateRegion } = require('../src/image/cropRegion');
const { validateConfig, validateRule } = require('../src/qa/runChecks');
const config = require('../rules/sample-rules.json');
test('fixed copy normalizes compatibility characters and spaces, preserves punctuation/case', () => {
  assert.equal(fixedCopy('ＫＯＩＮ 전 용\n이벤트', 'KOIN 전용 이벤트').matched, true);
  assert.equal(fixedCopy('KOIN!', ['KOIN', '코인']).matched, false);
  assert.equal(fixedCopy('koin', 'KOIN').matched, false);
});
test('dynamic time validates punctuation and time ranges', () => {
  const format = config.rules[1].format;
  for (const text of ['07:30 - 09:00', '23:59-00:00']) assert.equal(dynamicFormat(text, format).matched, true);
  for (const text of ['0730-09:00', '24:00-09:00', '07:60-09:00', 'x07:30-09:00']) assert.equal(dynamicFormat(text, format).matched, false);
  assert.equal(dynamicFormat('07:30 - 09:00', { ...format, ignoreWhitespace: false }).matched, false);
});
test('currency requires grouping and suffix, never repairs OCR errors', () => {
  const format = config.rules[2].format;
  for (const text of ['5,000 원', '0원', '999원', '1,000,000원']) assert.equal(dynamicFormat(text, format).matched, true);
  for (const text of ['5000원', '5,00원', '5,000뭔', '5,000.0원', '01원']) assert.equal(dynamicFormat(text, format).matched, false);
});
test('confidence gates matching and mismatch severity', () => {
  const base = { rawText: 'text', confidence: 90, matched: true };
  assert.equal(classifyResult(base, 85).status, 'PASS');
  assert.equal(classifyResult({ ...base, confidence: 84 }, 85).status, 'WARNING');
  assert.equal(classifyResult({ ...base, rawText: '' }, 85).status, 'WARNING');
  assert.equal(classifyResult({ ...base, matched: false }, 85).status, 'ERROR');
  assert.equal(classifyResult({ ...base, matched: false, severity: 'warning' }, 85).status, 'WARNING');
});
test('invalid coordinates and unsupported configurations are rejected', () => {
  validateConfig(config, config.imageSize);
  config.rules.forEach(r => validateRule(r, config.imageSize));
  assert.throws(() => validateRegion({ x: 380, y: 0, width: 20, height: 10 }, config.imageSize));
  assert.throws(() => validateRegion({ x: 0.5, y: 0, width: 20, height: 10 }, config.imageSize));
  assert.throws(() => validateConfig(config, { width: 780, height: 1916 }));
  assert.throws(() => validateRule({ ...config.rules[1], format: { kind: 'unknown' } }, config.imageSize));
});
