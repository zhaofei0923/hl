const OcrClient = require('tencentcloud-sdk-nodejs-ocr').ocr.v20181119.Client;
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

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
async function extractPhoto(imageBuffer) {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    const { width, height } = metadata;
    if (!width || !height) return null;

    // Get text positions from OCR
    const detections = await recognizeImage(imageBuffer);
    if (detections.length === 0) return null;

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

// ==================== Text Parsing Logic ====================

/**
 * Get constellation from birth month/day
 */
function getConstellation(month, day) {
  const dates = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 23, 22];
  const signs = ['水瓶', '双鱼', '白羊', '金牛', '双子', '巨蟹', '狮子', '处女', '天秤', '天蝎', '射手', '摩羯'];
  if (day >= dates[month - 1]) {
    return signs[month - 1];
  }
  return signs[(month - 2 + 12) % 12];
}

/**
 * Map income text to standard income range options
 * e.g. "25w+" → "20-50万", "100w" → "100万+"
 */
function mapIncomeRange(raw) {
  if (!raw) return '';
  const options = ['5万以下', '5-10万', '10-20万', '20-50万', '50-100万', '100万+'];

  // Direct match
  for (const opt of options) {
    if (raw.includes(opt)) return opt;
  }

  // Extract numeric value (in 万)
  let amount = null;
  // Match patterns like "25w+", "25W+", "25万+"
  const wMatch = raw.match(/([\d.]+)\s*[wW万]/);
  if (wMatch) {
    amount = parseFloat(wMatch[1]);
  }
  // Match patterns like "年薪30万"
  if (amount === null) {
    const numMatch = raw.match(/([\d.]+)\s*万/);
    if (numMatch) amount = parseFloat(numMatch[1]);
  }

  if (amount !== null) {
    if (amount < 5) return '5万以下';
    if (amount < 10) return '5-10万';
    if (amount < 20) return '10-20万';
    if (amount < 50) return '20-50万';
    if (amount < 100) return '50-100万';
    return '100万+';
  }
  return '';
}

/**
 * Map education text to standard options
 */
function mapEducation(raw) {
  if (!raw) return '';
  const mapping = {
    '博士': '博士',
    '硕士': '硕士',
    '研究生': '硕士',
    'MBA': '硕士',
    '本科': '本科',
    '大学': '本科',
    '大专': '专科',
    '专科': '专科',
    '高中': '高中及以下',
    '中专': '高中及以下',
    '初中': '高中及以下',
  };
  for (const [keyword, value] of Object.entries(mapping)) {
    if (raw.includes(keyword)) return value;
  }
  return '';
}

/**
 * Map marital status text
 */
function mapMaritalStatus(raw) {
  if (!raw) return '';
  if (raw.includes('未婚')) return '未婚';
  if (raw.includes('离异') || raw.includes('离婚')) return '离异';
  if (raw.includes('丧偶')) return '丧偶';
  return '';
}

/**
 * Map house status text
 */
function mapHouseStatus(raw) {
  if (!raw) return '';
  // 如果明确以“有”开头（如“有，叠拼”），优先判定为“有”
  if (/^有/.test(raw.trim()) || raw.includes('叠拼') || raw.includes('别墅') || raw.includes('套')) return '有';
  if (raw.includes('按揭') || raw.includes('月供')) return '按揭中';
  if (raw.includes('无') || raw.includes('没有') || raw.includes('租')) return '无';
  if (raw.includes('有')) return '有';
  return '';
}

/**
 * Map car status text
 */
function mapCarStatus(raw) {
  if (!raw) return '';
  if (raw.includes('有') || raw.includes('特斯拉') || raw.includes('奔驰') || raw.includes('宝马') ||
      raw.includes('奥迪') || raw.includes('保时捷') || raw.includes('BBA')) return '有';
  if (raw.includes('无') || raw.includes('没有')) return '无';
  return '';
}

/**
 * Parse OCR text lines into structured member card fields
 * @param {Array<{text: string}>} detections - OCR text detections
 * @returns {Object} Structured member data
 */
function parseMemberCard(detections) {
  const result = {};
  // Join all text into a single string for multi-line field extraction
  const fullText = detections.map(d => d.text).join('\n');
  const lines = detections.map(d => d.text);

  // Helper: extract value by key pattern (supports【】brackets and various separators)
  function extractField(pattern) {
    const regex = new RegExp('(?:' + pattern + ')' + '[】\\]]*\\s*[:：]\\s*(.+)', 'i');
    for (const line of lines) {
      const m = line.match(regex);
      if (m) return m[1].trim();
    }
    return '';
  }

  // Birth date → age + constellation
  const birthRaw = extractField('出生年月日?');
  if (birthRaw) {
    const dateMatch = birthRaw.match(/(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})/);
    if (dateMatch) {
      const year = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]);
      const day = parseInt(dateMatch[3]);
      const now = new Date();
      let age = now.getFullYear() - year;
      if (now.getMonth() + 1 < month || (now.getMonth() + 1 === month && now.getDate() < day)) {
        age--;
      }
      if (age >= 18 && age <= 80) result.age = String(age);
      result.constellation = getConstellation(month, day);
    }
  }

  // Height
  const heightRaw = extractField('身高');
  if (heightRaw) {
    const hMatch = heightRaw.match(/(\d{2,3})/);
    if (hMatch) {
      const h = parseInt(hMatch[1]);
      if (h >= 140 && h <= 200) result.height = String(h);
    }
  }

  // Education
  const educationRaw = extractField('学历');
  const edu = mapEducation(educationRaw);
  if (edu) result.education = edu;

  // School (append to occupation or selfIntro)
  const schoolRaw = extractField('毕业学校|毕业院校|学校');

  // Occupation
  const occupationRaw = extractField('职业');
  if (occupationRaw) {
    result.occupation = occupationRaw;
  }

  // Income
  const incomeRaw = extractField('收入|年收入|年薪');
  const income = mapIncomeRange(incomeRaw);
  if (income) result.incomeRange = income;

  // Native place
  const nativePlaceRaw = extractField('籍贯|祖籍|老家');
  if (nativePlaceRaw) result.nativePlace = nativePlaceRaw;

  // City (常住地)
  const cityRaw = extractField('常住|工作地|所在城市|城市');
  if (cityRaw) result.city = cityRaw;

  // Marital status
  const maritalRaw = extractField('婚姻状[态况]?|婚姻');
  const marital = mapMaritalStatus(maritalRaw);
  if (marital) result.maritalStatus = marital;

  // House status
  const houseRaw = extractField('是否有房|有无房产|房产|有房');
  const house = mapHouseStatus(houseRaw);
  if (house) result.houseStatus = house;

  // Car status
  const carRaw = extractField('是否有车|有无车|有车');
  const car = mapCarStatus(carRaw);
  if (car) result.carStatus = car;

  // Family situation
  const familyRaw = extractField('家庭情况|家庭');
  // Also check for children info
  const childrenRaw = extractField('有无小孩|小孩|子女|孩子');
  const familyParts = [];
  if (familyRaw) familyParts.push(familyRaw);
  if (childrenRaw) familyParts.push(`子女：${childrenRaw}`);
  if (familyParts.length) result.familySituation = familyParts.join('；');

  // Hobbies / interests
  const hobbiesRaw = extractField('爱好|兴趣|爱好特长');

  // Matchmaker impression → selfIntro
  const impressionMatch = fullText.match(/红娘印象[：:]\s*([\s\S]+?)$/m);
  if (impressionMatch) {
    // Grab everything after "红娘印象:" until end
    const impressionStart = fullText.indexOf('红娘印象');
    if (impressionStart !== -1) {
      const impressionText = fullText.substring(impressionStart).replace(/^红娘印象[：:\s]*/, '').trim();
      result.selfIntro = impressionText;
    }
  }

  // Build remark with extra info
  const remarkParts = [];
  if (schoolRaw) remarkParts.push(`毕业学校：${schoolRaw}`);
  if (hobbiesRaw) remarkParts.push(`爱好：${hobbiesRaw}`);
  // Weight
  const weightRaw = extractField('体重');
  if (weightRaw) remarkParts.push(`体重：${weightRaw}`);
  if (remarkParts.length) result.remark = remarkParts.join('｜');

  return result;
}

/**
 * Full OCR recognition pipeline: text extraction + photo extraction
 * @param {Buffer} imageBuffer
 * @returns {{ fields: Object, photos: string[] }}
 */
async function recognizeMemberCard(imageBuffer) {
  // Run OCR and photo extraction in parallel
  const [detections, photoUrl] = await Promise.all([
    recognizeImage(imageBuffer),
    extractPhoto(imageBuffer),
  ]);

  const fields = parseMemberCard(detections);
  const photos = photoUrl ? [photoUrl] : [];

  return { fields, photos };
}

module.exports = {
  recognizeImage,
  extractPhoto,
  parseMemberCard,
  recognizeMemberCard,
};
