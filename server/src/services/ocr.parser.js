function cleanValue(value) {
  if (!value) return '';
  return String(value)
    .replace(/^[\s:：,，;；]+/, '')
    .replace(/[\s。.]+$/, '')
    .trim();
}

function getLines(detections) {
  return (detections || [])
    .map((item) => cleanValue(item.text))
    .filter(Boolean);
}

function extractField(lines, keyPattern) {
  const matches = [];
  const regex = new RegExp(`^[\\s【\\[]*(?:${keyPattern})[】\\]]*\\s*[:：]?\\s*(.+)$`, 'i');

  for (const line of lines) {
    const match = line.match(regex);
    if (match) {
      const value = cleanValue(match[1]);
      if (value) matches.push(value);
    }
  }

  return matches.length ? matches[matches.length - 1] : '';
}

function inferGender(realName, explicitGender) {
  const raw = `${explicitGender || ''} ${realName || ''}`;
  if (/男|先生/.test(raw)) return 1;
  if (/女|女士|小姐/.test(raw)) return 2;
  return undefined;
}

function getAgeFromDate(year, month = 1, day = 1) {
  const now = new Date();
  let age = now.getFullYear() - year;
  const currentMonth = now.getMonth() + 1;
  if (currentMonth < month || (currentMonth === month && now.getDate() < day)) {
    age -= 1;
  }
  return age;
}

function parseAge(raw) {
  if (!raw) return undefined;

  const dateMatch = raw.match(/(\d{4})\s*(?:年|[.\-/])\s*(\d{1,2})?(?:\s*(?:月|[.\-/])\s*(\d{1,2})?)?/);
  if (dateMatch) {
    const year = Number(dateMatch[1]);
    const month = dateMatch[2] ? Number(dateMatch[2]) : 1;
    const day = dateMatch[3] ? Number(dateMatch[3]) : 1;
    const age = getAgeFromDate(year, month, day);
    if (age >= 18 && age <= 80) return String(age);
  }

  const ageMatch = raw.match(/(\d{2})\s*岁?/);
  if (ageMatch) {
    const age = Number(ageMatch[1]);
    if (age >= 18 && age <= 80) return String(age);
  }

  return undefined;
}

function parseHeight(raw) {
  if (!raw) return undefined;
  const match = raw.match(/(\d{2,3})/);
  if (!match) return undefined;

  const height = Number(match[1]);
  return height >= 140 && height <= 220 ? String(height) : undefined;
}

function mapIncomeRange(raw) {
  if (!raw) return undefined;
  const options = ['5万以下', '5-10万', '10-20万', '20-50万', '50-100万', '100万+'];

  for (const option of options) {
    if (raw.includes(option)) return option;
  }

  const match = raw.match(/([\d.]+)\s*(?:w|W|万)/);
  if (!match) return undefined;

  const amount = Number(match[1]);
  if (Number.isNaN(amount)) return undefined;
  if (amount < 5) return '5万以下';
  if (amount < 10) return '5-10万';
  if (amount < 20) return '10-20万';
  if (amount < 50) return '20-50万';
  if (amount < 100) return '50-100万';
  return '100万+';
}

function mapEducation(raw) {
  if (!raw) return undefined;
  if (raw.includes('博士')) return '博士';
  if (raw.includes('硕士') || raw.includes('研究生') || raw.includes('MBA')) return '硕士';
  if (raw.includes('本科') || raw.includes('大学')) return '本科';
  if (raw.includes('大专') || raw.includes('专科')) return '专科';
  if (raw.includes('高中') || raw.includes('中专') || raw.includes('初中')) return '高中及以下';
  return undefined;
}

function mapMaritalStatus(raw) {
  if (!raw) return undefined;
  if (raw.includes('未婚')) return '未婚';
  if (raw.includes('离异') || raw.includes('离婚')) return '离异';
  if (raw.includes('丧偶')) return '丧偶';
  return undefined;
}

function mapHouseStatus(raw) {
  if (!raw) return undefined;
  const value = raw.trim();
  if (/暂无|无|没有|租/.test(value)) return '无';
  if (/按揭|月供/.test(value)) return '按揭中';
  if (/^有/.test(value) || /有房|房产|商铺|别墅|套|平/.test(value)) return '有';
  return undefined;
}

function mapCarStatus(raw) {
  if (!raw) return undefined;
  const value = raw.trim();
  if (/暂无|无|没有/.test(value)) return '无';
  if (/有|车|特斯拉|奔驰|宝马|奥迪|保时捷|BBA/i.test(value)) return '有';
  return undefined;
}

function setIfPresent(target, key, value) {
  if (value !== undefined && value !== '') {
    target[key] = value;
  }
}

function parseMemberCard(detections) {
  const lines = getLines(detections);
  const fields = {};

  const realName = extractField(lines, '姓名');
  const explicitGender = extractField(lines, '性别|男女');
  const birthOrAge = extractField(lines, '出生年月日|出生日期|出生|生日|年龄');
  const height = parseHeight(extractField(lines, '身高'));
  const education = mapEducation(extractField(lines, '学历|教育'));
  const occupation = extractField(lines, '职业|工作');
  const incomeRange = mapIncomeRange(extractField(lines, '薪资|收入|年收入|年薪'));
  const nativePlace = extractField(lines, '籍贯|祖籍|老家');
  const city = extractField(lines, '现居地|现居|常住地|常住|工作地|所在城市|城市');
  const maritalStatus = mapMaritalStatus(extractField(lines, '婚姻状态|婚姻状况|婚况|婚姻'));
  const houseStatus = mapHouseStatus(extractField(lines, '是否有房|有无房产|房产|有房'));
  const carStatus = mapCarStatus(extractField(lines, '是否有车|有无车|有车'));

  setIfPresent(fields, 'realName', realName);
  setIfPresent(fields, 'gender', inferGender(realName, explicitGender));
  setIfPresent(fields, 'age', parseAge(birthOrAge));
  setIfPresent(fields, 'height', height);
  setIfPresent(fields, 'education', education);
  setIfPresent(fields, 'occupation', occupation);
  setIfPresent(fields, 'incomeRange', incomeRange);
  setIfPresent(fields, 'nativePlace', nativePlace);
  setIfPresent(fields, 'city', city);
  setIfPresent(fields, 'maritalStatus', maritalStatus);
  setIfPresent(fields, 'houseStatus', houseStatus);
  setIfPresent(fields, 'carStatus', carStatus);

  return fields;
}

module.exports = {
  parseMemberCard,
};
