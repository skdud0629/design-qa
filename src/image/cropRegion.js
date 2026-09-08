const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
function imageSize(imagePath) {
  const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', imagePath], { encoding: 'utf8' });
  const width = Number(out.match(/pixelWidth:\s*(\d+)/)?.[1]);
  const height = Number(out.match(/pixelHeight:\s*(\d+)/)?.[1]);
  if (!width || !height) throw new Error('Cannot read image dimensions');
  return { width, height };
}
function validateRegion(r, size) {
  if (!r || !['x', 'y', 'width', 'height'].every(k => Number.isInteger(r[k])) ||
      r.x < 0 || r.y < 0 || r.width <= 0 || r.height <= 0 ||
      r.x + r.width > size.width || r.y + r.height > size.height) {
    throw new Error('targetRegion must contain integer coordinates inside the image');
  }
}
function cropRegion(imagePath, region, size) {
  validateRegion(region, size);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'designqa-crop-'));
  const output = path.join(dir, 'crop.png');
  const cleanup = () => fs.rmSync(dir, { recursive: true, force: true });
  try {
    const { x, y, width, height } = region;
    execFileSync('sips', ['-c', String(height), String(width), '--cropOffset', String(y), String(x), imagePath, '--out', output]);
    execFileSync('sips', ['-z', String(height * 3), String(width * 3), output, '--out', output]);
    return { imagePath: output, cleanup };
  } catch (error) { cleanup(); throw error; }
}
module.exports = { imageSize, validateRegion, cropRegion };
