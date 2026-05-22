const test = require('node:test');
const assert = require('node:assert/strict');
const { parseMemberCard } = require('./ocr.parser');

function detections(lines) {
  return lines.map((text) => ({ text, polygon: [] }));
}

function ageFromDate(year, month = 1, day = 1) {
  const now = new Date();
  let age = now.getFullYear() - year;
  const currentMonth = now.getMonth() + 1;
  if (currentMonth < month || (currentMonth === month && now.getDate() < day)) {
    age -= 1;
  }
  return String(age);
}

test('parses basic fields from full-width bracket member card text', () => {
  const result = parseMemberCard(detections([
    '【姓名】：谢先生',
    '【生日】：1990.2.18',
    '【身高】：187',
    '【学历】：本科',
    '【职业】：销售经理（上市公司）',
    '【薪资】：12万+',
    '【籍贯】：四川 成都',
    '【现居地】：成都 成华区',
    '【婚况】：未婚',
    '【是否有车】：有',
    '【是否有房】：有（160平及三间商铺）',
    '【兴趣爱好】：运动，旅游，美食。',
  ]));

  assert.equal(result.realName, '谢先生');
  assert.equal(result.gender, 1);
  assert.equal(result.age, ageFromDate(1990, 2, 18));
  assert.equal(result.height, '187');
  assert.equal(result.education, '本科');
  assert.equal(result.occupation, '销售经理（上市公司）');
  assert.equal(result.incomeRange, '10-20万');
  assert.equal(result.nativePlace, '四川 成都');
  assert.equal(result.city, '成都 成华区');
  assert.equal(result.maritalStatus, '未婚');
  assert.equal(result.carStatus, '有');
  assert.equal(result.houseStatus, '有');
  assert.equal(result.selfIntro, undefined);
  assert.equal(result.familySituation, undefined);
  assert.equal(result.remark, undefined);
});

test('parses basic fields from plain colon member card text', () => {
  const result = parseMemberCard(detections([
    '姓名:伍先生',
    '[婚况]:未婚',
    '[出生]:1985年11月',
    '[身高]:180CM',
    '籍贯:成都天府新区',
    '[职业]:政府机关(副处级待遇)',
    '[学历]:硕士(英国留学)',
    '[收入]:30W+',
    '是否有房:有',
    '是否有车:有',
    '[爱好]: 旅游 美食 运动 历史 艺术 摄影',
    '[红娘评价]:高大帅气，性格很开朗。',
  ]));

  assert.equal(result.realName, '伍先生');
  assert.equal(result.gender, 1);
  assert.equal(result.age, ageFromDate(1985, 11, 1));
  assert.equal(result.height, '180');
  assert.equal(result.education, '硕士');
  assert.equal(result.occupation, '政府机关(副处级待遇)');
  assert.equal(result.incomeRange, '20-50万');
  assert.equal(result.nativePlace, '成都天府新区');
  assert.equal(result.maritalStatus, '未婚');
  assert.equal(result.houseStatus, '有');
  assert.equal(result.carStatus, '有');
  assert.equal(result.selfIntro, undefined);
  assert.equal(result.remark, undefined);
});

test('leaves missing basic fields absent instead of filling defaults', () => {
  const result = parseMemberCard(detections([
    '【姓名】姚懿恬',
    '【姓名】：姚先生',
    '【性别】：男',
    '【出生年月日】：2001.10.30',
    '【收入】：12w+',
    '【婚姻状态】：未婚',
    '【自我介绍】：这是一段很长的自我介绍，不应写入基础字段。',
  ]));

  assert.equal(result.realName, '姚先生');
  assert.equal(result.gender, 1);
  assert.equal(result.age, ageFromDate(2001, 10, 30));
  assert.equal(result.incomeRange, '10-20万');
  assert.equal(result.maritalStatus, '未婚');
  assert.equal(result.height, undefined);
  assert.equal(result.education, undefined);
  assert.equal(result.city, undefined);
  assert.equal(result.selfIntro, undefined);
  assert.equal(result.partnerRequirement, undefined);
  assert.equal(result.familySituation, undefined);
});
