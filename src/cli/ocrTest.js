const path = require('path');
const { recognizeImage } = require('../ocr/tesseractAdapter');

async function main() {
  const img = process.argv[2];
  if (!img) {
    console.error('Usage: node src/cli/ocrTest.js <image-path>');
    process.exit(2);
  }

  const imgPath = path.resolve(process.cwd(), img);
  console.log('Recognizing:', imgPath);
  try {
    const result = await recognizeImage(imgPath, { lang: 'kor+eng' });
    console.log(JSON.stringify({
      text: result.text,
      words: result.words.slice(0, 30),
      confidence: result.confidence,
    }, null, 2));
  } catch (err) {
    console.error('OCR failed:', err);
    process.exit(1);
  }
}

if (require.main === module) main();
