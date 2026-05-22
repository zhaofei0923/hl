const OcrClient = require('tencentcloud-sdk-nodejs-ocr').ocr.v20181119.Client;
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const { parseMemberCard } = require('./ocr.parser');

// Tencent Cloud OCR client (lazy init)
let ocrClient = null;

function getOcrClient() {
  if (!ocrClient) {
    const secretId = process.env.TENCENT_SECRET_ID;
    const secretKey = process.env.TENCENT_SECRET_KEY;
    if (!secretId || !secretKey) {
      throw new Error('腾讯云 OCR 配置缺失，请设置 TENCENT_SECRET_ID 和 TENCENT_SECRET_KEY');
    }
    ocrClient = new OcrClient({
      credential: { secretId, secretKey },
      region: process.env.TENCENT_OCR_REGION || 'ap-guangzhou',
      profile: {
        httpProfile: { endpoint: 'ocr.tencentcloudapi.com' },
      },
    });
  }
  return ocrClient;
}

/**
 * Call Tencent Cloud GeneralAccurateOCR to recognize text from image
 * Returns array of { text, polygon } objects
 */
async function recognizeImage(imageBuffer) {
  const client = getOcrClient();
  const imageBase64 = imageBuffer.toString('base64');
  const resp = await client.GeneralAccurateOCR({
    ImageBase64: imageBase64,
  });
  return (resp.TextDetections || []).map(item => ({
    text: item.DetectedText,
    polygon: item.Polygon || [],
  }));
}

/**
 * Extract person photo from member card image by detecting the text-free region.
 * Heuristic: if all text is concentrated in the right portion, crop the left as the photo.
 * Returns the saved photo URL or null.
 */
async function extractPhoto(imageBuffer, detections) {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    const { width, height } = metadata;
    if (!width || !height) return null;

    if (!detections || detections.length === 0) return null;

    // Find the leftmost X of all text polygons
    let minTextX = width;
    for (const det of detections) {
      for (const point of det.polygon) {
        if (point.X < minTextX) minTextX = point.X;
      }
    }

    // If text starts after 25% of the image width, there's likely a photo on the left
    const photoWidthRatio = minTextX / width;
    if (photoWidthRatio < 0.2) return null; // Text is too far left, no distinct photo area

    // Crop the left portion (with a small margin inward)
    const cropWidth = Math.floor(minTextX * 0.95);
    if (cropWidth < 100) return null; // Too narrow to be a meaningful photo

    const croppedBuffer = await sharp(imageBuffer)
      .extract({ left: 0, top: 0, width: cropWidth, height })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Save to uploads/photos/
    const filename = `ocr_${uuidv4()}.jpg`;
    const photosDir = path.join(__dirname, '../../uploads/photos');
    if (!fs.existsSync(photosDir)) {
      fs.mkdirSync(photosDir, { recursive: true });
    }
    const filePath = path.join(photosDir, filename);
    fs.writeFileSync(filePath, croppedBuffer);

    return `/uploads/photos/${filename}`;
  } catch (err) {
    logger.warn('Photo extraction failed:', err.message);
    return null;
  }
}

async function saveSourceImage(imageBuffer) {
  const filename = `ocr_card_${uuidv4()}.jpg`;
  const photosDir = path.join(__dirname, '../../uploads/photos');
  if (!fs.existsSync(photosDir)) {
    fs.mkdirSync(photosDir, { recursive: true });
  }

  const normalizedBuffer = await sharp(imageBuffer)
    .rotate()
    .jpeg({ quality: 90 })
    .toBuffer();

  fs.writeFileSync(path.join(photosDir, filename), normalizedBuffer);
  return `/uploads/photos/${filename}`;
}

/**
 * Full OCR recognition pipeline: text extraction + photo extraction
 * @param {Buffer} imageBuffer
 * @returns {{ fields: Object, photos: string[] }}
 */
async function recognizeMemberCard(imageBuffer) {
  const sourceImageUrl = await saveSourceImage(imageBuffer);
  let detections = [];

  try {
    detections = await recognizeImage(imageBuffer);
    logger.info(`OCR returned ${detections.length} text detections`);
  } catch (err) {
    logger.warn(`OCR unavailable, saved source image only: ${err.message}`);
  }

  const fields = parseMemberCard(detections);

  logger.info(`Parsed ${Object.keys(fields).length} basic fields, saved source image ${sourceImageUrl}`);

  return { fields, sourceImageUrl, photos: [sourceImageUrl] };
}

module.exports = {
  recognizeImage,
  extractPhoto,
  parseMemberCard,
  saveSourceImage,
  recognizeMemberCard,
};
