const { createWorker } = require('tesseract.js');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Recognize text from an image using tesseract.js
 * @param {string} imagePath - Path to the image file
 * @param {object} [opts] - Options { lang }
 * @returns {Promise<Array<{text:string,bbox:{x,y,w,h},confidence:number}>>}
 */
async function recognizeImage(imagePath, opts = {}) {
  const lang = opts.lang || 'kor+eng';
  const upscale = typeof opts.upscale === 'number' ? opts.upscale : 3; // default 3x
  const psm = typeof opts.psm === 'number' ? String(opts.psm) : '11'; // default PSM 11

  let tempPath = null;
  try {
    // If upscale requested and sips is available, create upscaled temp image
    if (upscale && upscale > 1) {
      const { imageSize } = require('../image/cropRegion');
        const size = imageSize(imagePath);
        tempPath = path.join(fs.mkdtempSync(path.join(require('os').tmpdir(), 'designqa-up-')), 'up.png');
        execFileSync('sips', ['-z', String(Math.round(size.height * upscale)), String(Math.round(size.width * upscale)), imagePath, '--out', tempPath]);
      imagePath = tempPath;
    }

    const worker = await createWorker({ logger: () => {}, cachePath: path.resolve(__dirname, '../..'), cacheMethod: 'readOnly' });
    try {
      await worker.loadLanguage(lang);
      await worker.initialize(lang);
      // set PSM
      await worker.setParameters({ tessedit_pageseg_mode: psm });

      const { data } = await worker.recognize(imagePath);

      const words = (data.words || []).map((w) => {
        const x = w.bbox.x0;
        const y = w.bbox.y0;
        const wdt = w.bbox.x1 - w.bbox.x0;
        const hgt = w.bbox.y1 - w.bbox.y0;
        return {
          text: String(w.text ?? '').trim(),
          bbox: { x, y, w: wdt, h: hgt },
          confidence: Number((w.confidence || 0) / 100),
        };
      }).filter((item) => item.text.length > 0);

      return {
        text: data.text || '',
        words,
        confidence: Number(data.confidence || 0),
      };
    } finally {
      await worker.terminate();
    }
  } finally {
    if (tempPath) {
      try { fs.rmSync(path.dirname(tempPath), { recursive: true, force: true }); } catch (e) { /* ignore */ }
    }
  }
}

module.exports = { recognizeImage };
