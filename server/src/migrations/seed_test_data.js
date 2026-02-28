/**
 * 测试数据种子脚本
 * 
 * 用法:
 *   node server/src/migrations/seed_test_data.js
 * 
 * 会创建以下测试数据:
 *   - 20 个用户 (10男 + 10女)，带完整个人资料
 *   - 2 个红娘（其中1个有门店）
 *   - 1 个红娘团队
 *   - 会员关系（红娘管理的会员）
 *   - 钱包数据
 *   - 匹配记录（不同状态）
 *   - 会话和消息
 *   - 沙龙活动和报名
 * 
 * 所有用户密码统一: test123456
 */

const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

async function seed() {
  const t = await sequelize.transaction();

  try {
    console.log('🌱 开始插入测试数据...\n');

    // ========== 1. 密码哈希 ==========
    const passwordHash = await bcrypt.hash('test123456', 10);

    // ========== 2. 创建用户 ==========
    console.log('👤 创建用户...');

    const maleUsers = [
      { phone: '13800000001', nickname: '张明远', gender: 1, avatar_url: '/avatars/m1.jpg' },
      { phone: '13800000002', nickname: '李文博', gender: 1, avatar_url: '/avatars/m2.jpg' },
      { phone: '13800000003', nickname: '王子轩', gender: 1, avatar_url: '/avatars/m3.jpg' },
      { phone: '13800000004', nickname: '赵浩然', gender: 1, avatar_url: '/avatars/m4.jpg' },
      { phone: '13800000005', nickname: '陈思远', gender: 1, avatar_url: '/avatars/m5.jpg' },
      { phone: '13800000006', nickname: '刘建国', gender: 1, avatar_url: '/avatars/m6.jpg' },
      { phone: '13800000007', nickname: '杨志成', gender: 1, avatar_url: '/avatars/m7.jpg' },
      { phone: '13800000008', nickname: '周俊杰', gender: 1, avatar_url: '/avatars/m8.jpg' },
      { phone: '13800000009', nickname: '吴天恩', gender: 1, avatar_url: '/avatars/m9.jpg' },
      { phone: '13800000010', nickname: '孙瑞祥', gender: 1, avatar_url: '/avatars/m10.jpg' },
    ];

    const femaleUsers = [
      { phone: '13900000001', nickname: '林婉婷', gender: 2, avatar_url: '/avatars/f1.jpg' },
      { phone: '13900000002', nickname: '陈雨萱', gender: 2, avatar_url: '/avatars/f2.jpg' },
      { phone: '13900000003', nickname: '王诗涵', gender: 2, avatar_url: '/avatars/f3.jpg' },
      { phone: '13900000004', nickname: '张梦琪', gender: 2, avatar_url: '/avatars/f4.jpg' },
      { phone: '13900000005', nickname: '刘佳怡', gender: 2, avatar_url: '/avatars/f5.jpg' },
      { phone: '13900000006', nickname: '赵思颖', gender: 2, avatar_url: '/avatars/f6.jpg' },
      { phone: '13900000007', nickname: '黄欣怡', gender: 2, avatar_url: '/avatars/f7.jpg' },
      { phone: '13900000008', nickname: '周雅琴', gender: 2, avatar_url: '/avatars/f8.jpg' },
      { phone: '13900000009', nickname: '吴芷若', gender: 2, avatar_url: '/avatars/f9.jpg' },
      { phone: '13900000010', nickname: '郑心蕊', gender: 2, avatar_url: '/avatars/f10.jpg' },
    ];

    // 红娘用户
    const matchmakerUsers = [
      { phone: '13700000001', nickname: '王红娘', gender: 2, current_role: 'matchmaker', avatar_url: '/avatars/mm1.jpg' },
      { phone: '13700000002', nickname: '李月老', gender: 1, current_role: 'matchmaker', avatar_url: '/avatars/mm2.jpg' },
    ];

    // 双角色用户（同时拥有求偶和婚介身份，用于测试角色切换）
    const dualRoleUsers = [
      { phone: '13600000001', nickname: '赵双双', gender: 2, current_role: 'user', avatar_url: '/avatars/d1.jpg' },
      { phone: '13600000002', nickname: '钱婉兮', gender: 2, current_role: 'matchmaker', avatar_url: '/avatars/d2.jpg' },
    ];

    // 管理员用户
    const adminUsers = [
      { phone: '13000000001', nickname: '系统管理员', gender: 1, current_role: 'user', avatar_url: '/avatars/admin.jpg', username: 'admin', is_admin: 1 },
    ];

    const allUserData = [...maleUsers, ...femaleUsers, ...matchmakerUsers, ...dualRoleUsers, ...adminUsers].map((u, idx) => ({
      ...u,
      password_hash: passwordHash,
      current_role: u.current_role || 'user',
      is_verified: 1,
      profile_completion: 100,
      status: 1,
      is_admin: u.is_admin || 0,
      username: u.username || `user_${u.phone}`,
      last_login_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { transaction: t });

    // 清理现有测试数据 (按照外键顺序)
    console.log('🧹 清理旧的测试数据...');
    await sequelize.query('DELETE FROM salon_registrations', { transaction: t });
    await sequelize.query('DELETE FROM salon_events', { transaction: t });
    await sequelize.query('DELETE FROM messages', { transaction: t });
    await sequelize.query('DELETE FROM conversations', { transaction: t });
    await sequelize.query('DELETE FROM match_records', { transaction: t });
    await sequelize.query('DELETE FROM invitations', { transaction: t });
    await sequelize.query('DELETE FROM orders', { transaction: t });
    await sequelize.query('DELETE FROM transfer_records', { transaction: t });
    await sequelize.query('DELETE FROM withdraw_records', { transaction: t });
    await sequelize.query('DELETE FROM earning_records', { transaction: t });
    await sequelize.query('DELETE FROM wallets', { transaction: t });
    await sequelize.query('DELETE FROM members', { transaction: t });
    await sequelize.query('UPDATE matchmakers SET team_id = NULL', { transaction: t });
    await sequelize.query('DELETE FROM teams', { transaction: t });
    await sequelize.query('DELETE FROM matchmaker_stores', { transaction: t });
    await sequelize.query('DELETE FROM matchmakers', { transaction: t });
    await sequelize.query('DELETE FROM user_profiles', { transaction: t });
    await sequelize.query('DELETE FROM sms_codes', { transaction: t });
    await sequelize.query('DELETE FROM users', { transaction: t });

    // 重置自增ID
    await sequelize.query('ALTER TABLE users AUTO_INCREMENT = 1', { transaction: t });
    await sequelize.query('ALTER TABLE user_profiles AUTO_INCREMENT = 1', { transaction: t });
    await sequelize.query('ALTER TABLE matchmakers AUTO_INCREMENT = 1', { transaction: t });
    await sequelize.query('ALTER TABLE teams AUTO_INCREMENT = 1', { transaction: t });
    await sequelize.query('ALTER TABLE members AUTO_INCREMENT = 1', { transaction: t });
    await sequelize.query('ALTER TABLE wallets AUTO_INCREMENT = 1', { transaction: t });
    await sequelize.query('ALTER TABLE earning_records AUTO_INCREMENT = 1', { transaction: t });
    await sequelize.query('ALTER TABLE withdraw_records AUTO_INCREMENT = 1', { transaction: t });
    await sequelize.query('ALTER TABLE transfer_records AUTO_INCREMENT = 1', { transaction: t });
    await sequelize.query('ALTER TABLE orders AUTO_INCREMENT = 1', { transaction: t });
    await sequelize.query('ALTER TABLE match_records AUTO_INCREMENT = 1', { transaction: t });
    await sequelize.query('ALTER TABLE conversations AUTO_INCREMENT = 1', { transaction: t });
    await sequelize.query('ALTER TABLE messages AUTO_INCREMENT = 1', { transaction: t });
    await sequelize.query('ALTER TABLE salon_events AUTO_INCREMENT = 1', { transaction: t });
    await sequelize.query('ALTER TABLE salon_registrations AUTO_INCREMENT = 1', { transaction: t });

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { transaction: t });

    // 插入用户
    for (const userData of allUserData) {
      await sequelize.query(
        `INSERT INTO users (phone, password_hash, nickname, avatar_url, gender, current_role, is_verified, profile_completion, status, last_login_at, created_at, updated_at, username, is_admin)
         VALUES (:phone, :password_hash, :nickname, :avatar_url, :gender, :current_role, :is_verified, :profile_completion, :status, :last_login_at, :created_at, :updated_at, :username, :is_admin)`,
        { replacements: { username: null, is_admin: 0, ...userData }, transaction: t }
      );
    }

    // 获取插入的用户ID
    const [users] = await sequelize.query('SELECT id, phone, gender, nickname FROM users ORDER BY id', { transaction: t });
    console.log(`   ✅ 创建了 ${users.length} 个用户`);

    // 用户分组
    const males = users.filter(u => u.gender === 1 && !u.phone.startsWith('137') && !u.phone.startsWith('130'));
    const females = users.filter(u => u.gender === 2 && !u.phone.startsWith('137') && !u.phone.startsWith('136'));
    const mmUsers = users.filter(u => u.phone.startsWith('137'));
    const dualUsers = users.filter(u => u.phone.startsWith('136'));
    const adminDbUsers = users.filter(u => u.phone.startsWith('130'));

    // ========== 3. 创建用户资料 ==========
    console.log('📝 创建用户资料...');

    const cities = ['北京', '上海', '深圳', '杭州', '成都', '广州', '南京', '武汉', '西安', '重庆'];
    const educations = ['大专', '本科', '硕士', '博士', '本科', '硕士', '本科', '本科', '硕士', '本科'];
    const occupations = ['软件工程师', '产品经理', '设计师', '教师', '医生', '律师', '公务员', '金融分析师', '建筑师', '创业者'];
    const femaleOccupations = ['产品经理', '设计师', '教师', '护士', '会计', '市场经理', '人力资源', '翻译', '心理咨询师', '编辑'];
    const incomeRanges = ['10k-15k', '15k-20k', '20k-30k', '30k-50k', '15k-20k', '20k-30k', '10k-15k', '15k-20k', '30k-50k', '20k-30k'];
    const provinces = ['北京市', '上海市', '广东省', '浙江省', '四川省', '广东省', '江苏省', '湖北省', '陕西省', '重庆市'];

    const maleProfiles = males.map((u, i) => ({
      user_id: u.id,
      real_name: u.nickname,
      birth_date: `${1990 + (i % 8)}-${String(3 + i).padStart(2, '0')}-${String(10 + i).padStart(2, '0')}`,
      age: 2026 - (1990 + (i % 8)),
      height: 170 + (i * 2),
      weight: 65 + (i * 3),
      education: educations[i],
      occupation: occupations[i],
      income_range: incomeRanges[i],
      province: provinces[i],
      city: cities[i],
      district: '朝阳区',
      native_place: cities[i],
      marital_status: i < 7 ? '未婚' : '离异',
      has_children: i < 7 ? 0 : 1,
      want_children: 1,
      house_status: i < 5 ? '已购房' : '租房',
      car_status: i < 6 ? '已购车' : '无车',
      smoking: i < 7 ? '不吸烟' : '偶尔',
      drinking: i < 5 ? '不饮酒' : '社交饮酒',
      self_intro: `大家好，我是${u.nickname}，在${cities[i]}工作，职业是${occupations[i]}。性格开朗，热爱生活，喜欢运动和旅行。希望找到一个善良、温柔、有共同话题的伴侣。`,
      partner_requirement: `希望对方年龄在${24 + (i % 5)}-${32 + (i % 5)}岁之间，身高158cm以上，学历本科以上，性格温柔善良，有稳定工作。`,
      tags: JSON.stringify(['运动', '旅行', '阅读', '美食'][i % 4] ? [['运动', '旅行'], ['阅读', '美食'], ['摄影', '音乐'], ['健身', '电影'], ['烹饪', '户外']][i % 5] : ['运动']),
      photos: JSON.stringify([`/photos/m${i + 1}_1.jpg`, `/photos/m${i + 1}_2.jpg`]),
      created_at: new Date(),
      updated_at: new Date(),
    }));

    const femaleProfiles = females.map((u, i) => ({
      user_id: u.id,
      real_name: u.nickname,
      birth_date: `${1993 + (i % 6)}-${String(1 + i).padStart(2, '0')}-${String(5 + i * 2).padStart(2, '0')}`,
      age: 2026 - (1993 + (i % 6)),
      height: 158 + (i * 2),
      weight: 45 + (i * 2),
      education: educations[i],
      occupation: femaleOccupations[i],
      income_range: incomeRanges[i],
      province: provinces[i],
      city: cities[i],
      district: '海淀区',
      native_place: cities[i],
      marital_status: i < 8 ? '未婚' : '离异',
      has_children: 0,
      want_children: 1,
      house_status: i < 3 ? '已购房' : '租房',
      car_status: i < 4 ? '已购车' : '无车',
      smoking: '不吸烟',
      drinking: i < 3 ? '不饮酒' : '社交饮酒',
      self_intro: `你好，我是${u.nickname}，目前在${cities[i]}从事${femaleOccupations[i]}工作。喜欢${['瑜伽', '绘画', '阅读', '烘焙', '旅行'][i % 5]}和${['下厨', '追剧', '健身', '摄影', '音乐'][i % 5]}。希望遇到对的人，一起享受生活。`,
      partner_requirement: `希望对方身高${170 + (i % 5) * 2}cm以上，年龄在${27 + (i % 4)}-${35 + (i % 4)}岁之间，有上进心和责任感，最好在同一个城市。`,
      tags: JSON.stringify([['瑜伽', '烘焙'], ['绘画', '追剧'], ['阅读', '旅行'], ['美食', '摄影'], ['音乐', '健身']][i % 5]),
      photos: JSON.stringify([`/photos/f${i + 1}_1.jpg`, `/photos/f${i + 1}_2.jpg`]),
      created_at: new Date(),
      updated_at: new Date(),
    }));

    // 红娘的个人资料
    const mmProfiles = mmUsers.map((u, i) => ({
      user_id: u.id,
      real_name: u.nickname,
      birth_date: i === 0 ? '1985-06-15' : '1980-03-20',
      age: i === 0 ? 41 : 46,
      height: i === 0 ? 165 : 178,
      weight: i === 0 ? 55 : 75,
      education: '本科',
      occupation: '婚恋顾问',
      income_range: '20k-30k',
      province: '北京市',
      city: '北京',
      district: '朝阳区',
      native_place: '北京',
      marital_status: '已婚',
      has_children: 1,
      want_children: 0,
      house_status: '已购房',
      car_status: '已购车',
      smoking: '不吸烟',
      drinking: '不饮酒',
      self_intro: `资深红娘，从业${i === 0 ? 10 : 15}年，成功撮合超过${i === 0 ? 500 : 800}对情侣。`,
      partner_requirement: '',
      tags: JSON.stringify(['专业', '热心', '经验丰富']),
      photos: JSON.stringify([]),
      created_at: new Date(),
      updated_at: new Date(),
    }));

    // 双角色用户的个人资料
    const dualProfiles = dualUsers.map((u, i) => ({
      user_id: u.id,
      real_name: u.nickname,
      birth_date: i === 0 ? '1992-08-18' : '1990-11-05',
      age: i === 0 ? 34 : 36,
      height: i === 0 ? 163 : 168,
      weight: i === 0 ? 50 : 55,
      education: i === 0 ? '硕士' : '本科',
      occupation: i === 0 ? '心理咨询师' : '婚恋规划师',
      income_range: i === 0 ? '15k-20k' : '20k-30k',
      province: i === 0 ? '浙江省' : '上海市',
      city: i === 0 ? '杭州' : '上海',
      district: i === 0 ? '西湖区' : '静安区',
      native_place: i === 0 ? '杭州' : '上海',
      marital_status: '未婚',
      has_children: 0,
      want_children: 1,
      house_status: '已购房',
      car_status: i === 0 ? '已购车' : '无车',
      smoking: '不吸烟',
      drinking: '社交饮酒',
      self_intro: i === 0
        ? '大家好，我是赵双双，心理学硕士毕业，目前在杭州做心理咨询师。同时也从事婚恋服务行业，希望能帮助更多人找到幸福，也期待自己的那个他。'
        : '你好，我是钱婉兮，在上海从事婚恋规划工作多年。工作之余喜欢瑜伽和烘焙，向往简单温馨的生活，期待遇见有缘人。',
      partner_requirement: i === 0
        ? '希望对方年龄在30-40岁之间，身高172cm以上，有责任心和上进心，能够理解和支持我的工作。'
        : '希望对方在上海工作，年龄相仿，真诚善良，有稳定事业，喜欢居家生活。',
      tags: JSON.stringify(i === 0 ? ['心理学', '瑜伽', '旅行'] : ['烘焙', '瑜伽', '阅读']),
      photos: JSON.stringify([`/photos/d${i + 1}_1.jpg`, `/photos/d${i + 1}_2.jpg`]),
      created_at: new Date(),
      updated_at: new Date(),
    }));

    const allProfiles = [...maleProfiles, ...femaleProfiles, ...mmProfiles, ...dualProfiles];

    for (const profile of allProfiles) {
      await sequelize.query(
        `INSERT INTO user_profiles (user_id, real_name, birth_date, age, height, weight, education, occupation,
          income_range, province, city, district, native_place, marital_status, has_children, want_children,
          house_status, car_status, smoking, drinking, self_intro, partner_requirement, tags, photos, created_at, updated_at)
         VALUES (:user_id, :real_name, :birth_date, :age, :height, :weight, :education, :occupation,
          :income_range, :province, :city, :district, :native_place, :marital_status, :has_children, :want_children,
          :house_status, :car_status, :smoking, :drinking, :self_intro, :partner_requirement, :tags, :photos, :created_at, :updated_at)`,
        { replacements: profile, transaction: t }
      );
    }
    console.log(`   ✅ 创建了 ${allProfiles.length} 个用户资料`);

    // ========== 4. 创建红娘 ==========
    console.log('💼 创建红娘...');

    const matchmakers = [
      {
        user_id: mmUsers[0].id,
        matchmaker_no: 'MM20260001',
        level: 3,
        parent_id: null,
        team_id: null,
        has_store: 1,
        certification_status: 2,  // certified
        total_performance: 25000.00,
        status: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: mmUsers[1].id,
        matchmaker_no: 'MM20260002',
        level: 2,
        parent_id: null,
        team_id: null,
        has_store: 0,
        certification_status: 2,
        total_performance: 12000.00,
        status: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    for (const mm of matchmakers) {
      await sequelize.query(
        `INSERT INTO matchmakers (user_id, matchmaker_no, level, parent_id, team_id, has_store, certification_status, total_performance, status, created_at, updated_at)
         VALUES (:user_id, :matchmaker_no, :level, :parent_id, :team_id, :has_store, :certification_status, :total_performance, :status, :created_at, :updated_at)`,
        { replacements: mm, transaction: t }
      );
    }

    const [mmRows] = await sequelize.query('SELECT id, user_id FROM matchmakers ORDER BY id', { transaction: t });
    console.log(`   ✅ 创建了 ${mmRows.length} 个红娘`);

    // 设置上下级关系: 红娘2 的上级是红娘1
    await sequelize.query(
      'UPDATE matchmakers SET parent_id = :parentId WHERE id = :id',
      { replacements: { parentId: mmRows[0].id, id: mmRows[1].id }, transaction: t }
    );

    // 为双角色用户创建红娘记录
    console.log('🔄 创建双角色用户的红娘身份...');
    for (let i = 0; i < dualUsers.length; i++) {
      await sequelize.query(
        `INSERT INTO matchmakers (user_id, matchmaker_no, level, parent_id, team_id, has_store, certification_status, total_performance, status, created_at, updated_at)
         VALUES (:user_id, :matchmaker_no, :level, :parent_id, :team_id, :has_store, :certification_status, :total_performance, :status, :created_at, :updated_at)`,
        {
          replacements: {
            user_id: dualUsers[i].id,
            matchmaker_no: `MM202600${i + 3}`,
            level: 1,
            parent_id: mmRows[0].id,
            team_id: null,
            has_store: 0,
            certification_status: 2,
            total_performance: (3000 + i * 2000).toFixed(2),
            status: 1,
            created_at: new Date(),
            updated_at: new Date(),
          },
          transaction: t
        }
      );
    }
    console.log(`   ✅ 创建了 ${dualUsers.length} 个双角色红娘记录`);

    // ========== 5. 创建红娘门店 ==========
    console.log('🏪 创建红娘门店...');

    await sequelize.query(
      `INSERT INTO matchmaker_stores (matchmaker_id, store_name, address, province, city, contact_phone, business_license, photos, status, created_at, updated_at)
       VALUES (:matchmaker_id, :store_name, :address, :province, :city, :contact_phone, :business_license, :photos, :status, :created_at, :updated_at)`,
      {
        replacements: {
          matchmaker_id: mmRows[0].id,
          store_name: '缘来如此婚恋工作室',
          address: '北京市朝阳区望京SOHO T1 1208',
          province: '北京市',
          city: '北京',
          contact_phone: '010-88887777',
          business_license: '/licenses/store1.jpg',
          photos: JSON.stringify(['/store_photos/s1_1.jpg', '/store_photos/s1_2.jpg']),
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        transaction: t
      }
    );
    console.log('   ✅ 创建了 1 个门店');

    // ========== 6. 创建团队 ==========
    console.log('👥 创建团队...');

    await sequelize.query(
      `INSERT INTO teams (name, leader_id, member_count, total_performance, created_at, updated_at)
       VALUES (:name, :leader_id, :member_count, :total_performance, :created_at, :updated_at)`,
      {
        replacements: {
          name: '缘来一队',
          leader_id: mmRows[0].id,
          member_count: 2,
          total_performance: 37000.00,
          created_at: new Date(),
          updated_at: new Date(),
        },
        transaction: t,
      }
    );

    const [teamRows] = await sequelize.query('SELECT id FROM teams LIMIT 1', { transaction: t });
    const teamId = teamRows[0].id;

    // 把两个红娘都加入团队
    await sequelize.query(
      'UPDATE matchmakers SET team_id = :teamId WHERE id IN (:ids)',
      { replacements: { teamId, ids: mmRows.map(r => r.id) }, transaction: t }
    );
    console.log('   ✅ 创建了 1 个团队');

    // ========== 7. 创建会员关系 ==========
    console.log('🎫 创建会员关系...');

    const memberData = [
      // 红娘1 管理的会员 (6男 + 5女)
      ...males.slice(0, 6).map((u, i) => ({
        matchmaker_id: mmRows[0].id,
        user_id: u.id,
        member_type: ['member', 'manual_match', 'member', 'free', 'member', 'manual_match'][i],
        service_level: ['普通', '高级', '普通', null, 'VIP', '高级'][i],
        expire_at: i < 3 ? new Date('2027-06-01') : (i === 3 ? null : new Date('2027-12-31')),
        remark: `红娘1管理的男嘉宾${i + 1}`,
        status: 1,
        created_at: new Date(),
        updated_at: new Date(),
      })),
      ...females.slice(0, 5).map((u, i) => ({
        matchmaker_id: mmRows[0].id,
        user_id: u.id,
        member_type: ['member', 'member', 'manual_match', 'free', 'member'][i],
        service_level: ['普通', 'VIP', '高级', null, '普通'][i],
        expire_at: i < 2 ? new Date('2027-06-01') : (i === 3 ? null : new Date('2027-09-15')),
        remark: `红娘1管理的女嘉宾${i + 1}`,
        status: 1,
        created_at: new Date(),
        updated_at: new Date(),
      })),
      // 红娘2 管理的会员 (4男 + 5女)
      ...males.slice(6, 10).map((u, i) => ({
        matchmaker_id: mmRows[1].id,
        user_id: u.id,
        member_type: ['member', 'free', 'manual_match', 'member'][i],
        service_level: ['普通', null, '高级', '普通'][i],
        expire_at: i === 1 ? null : new Date('2027-03-01'),
        remark: `红娘2管理的男嘉宾${i + 1}`,
        status: 1,
        created_at: new Date(),
        updated_at: new Date(),
      })),
      ...females.slice(5, 10).map((u, i) => ({
        matchmaker_id: mmRows[1].id,
        user_id: u.id,
        member_type: ['member', 'member', 'free', 'manual_match', 'member'][i],
        service_level: ['VIP', '普通', null, '高级', '普通'][i],
        expire_at: i === 2 ? null : new Date('2027-06-01'),
        remark: `红娘2管理的女嘉宾${i + 1}`,
        status: 1,
        created_at: new Date(),
        updated_at: new Date(),
      })),
    ];

    for (const mem of memberData) {
      await sequelize.query(
        `INSERT INTO members (matchmaker_id, user_id, member_type, service_level, expire_at, remark, status, created_at, updated_at)
         VALUES (:matchmaker_id, :user_id, :member_type, :service_level, :expire_at, :remark, :status, :created_at, :updated_at)`,
        { replacements: mem, transaction: t }
      );
    }
    console.log(`   ✅ 创建了 ${memberData.length} 个会员关系`);

    // ========== 8. 创建钱包 ==========
    console.log('💰 创建钱包...');

    for (const u of users) {
      const isMM = u.phone.startsWith('137') || u.phone.startsWith('136');
      await sequelize.query(
        `INSERT INTO wallets (user_id, available_amount, frozen_amount, total_earned, total_withdrawn, xi_coins, version, created_at, updated_at)
         VALUES (:user_id, :available_amount, :frozen_amount, :total_earned, :total_withdrawn, :xi_coins, 0, :created_at, :updated_at)`,
        {
          replacements: {
            user_id: u.id,
            available_amount: isMM ? (3000 + Math.floor(Math.random() * 5000)).toFixed(2) : (Math.floor(Math.random() * 500)).toFixed(2),
            frozen_amount: isMM ? (Math.floor(Math.random() * 1000)).toFixed(2) : '0.00',
            total_earned: isMM ? (10000 + Math.floor(Math.random() * 15000)).toFixed(2) : '0.00',
            total_withdrawn: isMM ? (5000 + Math.floor(Math.random() * 5000)).toFixed(2) : '0.00',
            xi_coins: Math.floor(Math.random() * 200) + 10,
            created_at: new Date(),
            updated_at: new Date(),
          },
          transaction: t
        }
      );
    }
    console.log(`   ✅ 创建了 ${users.length} 个钱包`);

    // ========== 9. 创建匹配记录 ==========
    console.log('💕 创建匹配记录...');

    const matchRecords = [
      // 互相喜欢 (mutual) - 3对
      { user_a_id: males[0].id, user_b_id: females[0].id, matchmaker_id: mmRows[0].id, match_type: 'system', compatibility_score: 92, status: 'mutual' },
      { user_a_id: males[1].id, user_b_id: females[1].id, matchmaker_id: mmRows[0].id, match_type: 'manual', compatibility_score: 88, status: 'mutual' },
      { user_a_id: males[2].id, user_b_id: females[3].id, matchmaker_id: null, match_type: 'system', compatibility_score: 85, status: 'mutual' },

      // 单方面喜欢 (accepted_a / accepted_b) - 4对
      { user_a_id: males[3].id, user_b_id: females[2].id, matchmaker_id: null, match_type: 'system', compatibility_score: 78, status: 'accepted_a' },
      { user_a_id: males[4].id, user_b_id: females[4].id, matchmaker_id: null, match_type: 'system', compatibility_score: 82, status: 'accepted_b' },
      { user_a_id: males[5].id, user_b_id: females[5].id, matchmaker_id: mmRows[1].id, match_type: 'manual', compatibility_score: 75, status: 'accepted_a' },
      { user_a_id: males[6].id, user_b_id: females[6].id, matchmaker_id: null, match_type: 'system', compatibility_score: 80, status: 'accepted_b' },

      // 待处理 (pending) - 3对
      { user_a_id: males[7].id, user_b_id: females[7].id, matchmaker_id: mmRows[0].id, match_type: 'manual', compatibility_score: 90, status: 'pending' },
      { user_a_id: males[8].id, user_b_id: females[8].id, matchmaker_id: null, match_type: 'system', compatibility_score: 73, status: 'pending' },
      { user_a_id: males[9].id, user_b_id: females[9].id, matchmaker_id: mmRows[1].id, match_type: 'manual', compatibility_score: 86, status: 'pending' },

      // 拒绝和过期 - 2对
      { user_a_id: males[0].id, user_b_id: females[5].id, matchmaker_id: null, match_type: 'system', compatibility_score: 65, status: 'rejected' },
      { user_a_id: males[3].id, user_b_id: females[8].id, matchmaker_id: null, match_type: 'system', compatibility_score: 60, status: 'expired' },

      // 快速匹配记录
      { user_a_id: males[1].id, user_b_id: females[6].id, matchmaker_id: null, match_type: 'speed', compatibility_score: 77, status: 'accepted_a' },
      { user_a_id: males[5].id, user_b_id: females[2].id, matchmaker_id: null, match_type: 'speed', compatibility_score: 70, status: 'pending' },
    ];

    for (const mr of matchRecords) {
      // 确保 user_a_id < user_b_id
      const userAId = Math.min(mr.user_a_id, mr.user_b_id);
      const userBId = Math.max(mr.user_a_id, mr.user_b_id);
      await sequelize.query(
        `INSERT INTO match_records (user_a_id, user_b_id, matchmaker_id, match_type, compatibility_score, status, created_at, updated_at)
         VALUES (:user_a_id, :user_b_id, :matchmaker_id, :match_type, :compatibility_score, :status, :created_at, :updated_at)`,
        {
          replacements: {
            user_a_id: userAId,
            user_b_id: userBId,
            matchmaker_id: mr.matchmaker_id,
            match_type: mr.match_type,
            compatibility_score: mr.compatibility_score,
            status: mr.status,
            created_at: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 3600 * 1000)),
            updated_at: new Date(),
          },
          transaction: t
        }
      );
    }
    console.log(`   ✅ 创建了 ${matchRecords.length} 条匹配记录`);

    // ========== 10. 创建会话和消息 ==========
    console.log('💬 创建会话和消息...');

    // 为互相喜欢的3对创建会话和示例消息
    const conversationPairs = [
      { userA: males[0], userB: females[0] },
      { userA: males[1], userB: females[1] },
      { userA: males[2], userB: females[3] },
    ];

    const sampleMessages = [
      ['你好，很高兴认识你！', '你好呀，我也很高兴~', '看了你的资料，感觉我们有很多共同话题', '是呢，我也觉得我们很合拍', '周末有空一起喝杯咖啡吗？', '好呀，什么时间方便呢？'],
      ['Hi，第一次用这个平台', '我也是，红娘推荐的你，觉得很不错', '谢谢，你是做什么工作的呀？', '我在做设计相关的工作，你呢？', '我是产品经理，经常和设计打交道', '那我们可能很有话聊哦~'],
      ['看到你喜欢旅行，最近去了哪里？', '上个月去了云南，特别美', '云南我一直想去！有什么推荐的地方吗？', '大理和丽江都很不错，还有泸沽湖', '下次有机会一起去啊', '好呀，期待~'],
    ];

    for (let ci = 0; ci < conversationPairs.length; ci++) {
      const pair = conversationPairs[ci];
      const userAId = Math.min(pair.userA.id, pair.userB.id);
      const userBId = Math.max(pair.userA.id, pair.userB.id);

      await sequelize.query(
        `INSERT INTO conversations (type, user_a_id, user_b_id, last_message_at, created_at, updated_at)
         VALUES ('private', :user_a_id, :user_b_id, :last_message_at, :created_at, :updated_at)`,
        {
          replacements: {
            user_a_id: userAId,
            user_b_id: userBId,
            last_message_at: new Date(),
            created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000),
            updated_at: new Date(),
          },
          transaction: t
        }
      );

      const [convRows] = await sequelize.query(
        'SELECT id FROM conversations WHERE user_a_id = :a AND user_b_id = :b',
        { replacements: { a: userAId, b: userBId }, transaction: t }
      );
      const convId = convRows[0].id;

      const msgs = sampleMessages[ci];
      for (let mi = 0; mi < msgs.length; mi++) {
        const senderId = mi % 2 === 0 ? pair.userA.id : pair.userB.id;
        const receiverId = mi % 2 === 0 ? pair.userB.id : pair.userA.id;
        const msgTime = new Date(Date.now() - (msgs.length - mi) * 3600 * 1000);

        await sequelize.query(
          `INSERT INTO messages (conversation_id, sender_id, receiver_id, content_type, content, is_read, read_at, created_at, updated_at)
           VALUES (:conversation_id, :sender_id, :receiver_id, 'text', :content, :is_read, :read_at, :created_at, :updated_at)`,
          {
            replacements: {
              conversation_id: convId,
              sender_id: senderId,
              receiver_id: receiverId,
              content: msgs[mi],
              is_read: mi < msgs.length - 1 ? 1 : 0,
              read_at: mi < msgs.length - 1 ? msgTime : null,
              created_at: msgTime,
              updated_at: msgTime,
            },
            transaction: t
          }
        );
      }

      // 更新会话的最后消息ID
      const [lastMsgRows] = await sequelize.query(
        'SELECT id FROM messages WHERE conversation_id = :convId ORDER BY id DESC LIMIT 1',
        { replacements: { convId }, transaction: t }
      );
      if (lastMsgRows.length) {
        await sequelize.query(
          'UPDATE conversations SET last_message_id = :msgId WHERE id = :convId',
          { replacements: { msgId: lastMsgRows[0].id, convId }, transaction: t }
        );
      }
    }
    console.log(`   ✅ 创建了 ${conversationPairs.length} 个会话和 ${sampleMessages.flat().length} 条消息`);

    // ========== 11. 创建收入记录 ==========
    console.log('📊 创建收入记录...');

    const earningTypes = ['share_earning', 'match_earning', 'team_earning'];
    let earningCount = 0;
    for (const mm of mmRows) {
      for (let i = 0; i < 5; i++) {
        await sequelize.query(
          `INSERT INTO earning_records (user_id, type, amount, xi_coins, description, created_at, updated_at)
           VALUES (:user_id, :type, :amount, :xi_coins, :description, :created_at, :updated_at)`,
          {
            replacements: {
              user_id: mm.user_id,
              type: earningTypes[i % 3],
              amount: (500 + Math.floor(Math.random() * 2000)).toFixed(2),
              xi_coins: Math.floor(Math.random() * 50),
              description: ['分享推荐奖励', '成功撮合奖励', '团队业绩提成', '会员服务佣金', '活动组织奖励'][i],
              created_at: new Date(Date.now() - (5 - i) * 7 * 24 * 3600 * 1000),
              updated_at: new Date(),
            },
            transaction: t
          }
        );
        earningCount++;
      }
    }
    console.log(`   ✅ 创建了 ${earningCount} 条收入记录`);

    // ========== 11.5. 创建提现记录 ==========
    console.log('💸 创建提现记录...');

    const withdrawData = [
      { user_id: mmUsers[0].id, amount: 2000.00, actual_amount: 1980.00, fee: 20.00, withdraw_to: 'bank', account_info: JSON.stringify({ bankName: '中国工商银行', cardNo: '6222 **** **** 1234', realName: '王红娘' }), status: 'success' },
      { user_id: mmUsers[0].id, amount: 1500.00, actual_amount: 1485.00, fee: 15.00, withdraw_to: 'wechat', account_info: JSON.stringify({ wechatId: 'wxpay_wanghm' }), status: 'pending' },
      { user_id: mmUsers[1].id, amount: 1000.00, actual_amount: 990.00, fee: 10.00, withdraw_to: 'alipay', account_info: JSON.stringify({ alipayAccount: '137****0002' }), status: 'processing' },
      { user_id: mmUsers[1].id, amount: 500.00, actual_amount: 0, fee: 0, withdraw_to: 'bank', account_info: JSON.stringify({ bankName: '招商银行', cardNo: '6225 **** **** 5678', realName: '李月老' }), status: 'rejected', reject_reason: '资料不完整，请补充银行预留手机号' },
    ];

    for (let i = 0; i < withdrawData.length; i++) {
      const wd = withdrawData[i];
      await sequelize.query(
        `INSERT INTO withdraw_records (user_id, amount, actual_amount, fee, withdraw_to, account_info, status, reject_reason, created_at, updated_at)
         VALUES (:user_id, :amount, :actual_amount, :fee, :withdraw_to, :account_info, :status, :reject_reason, :created_at, :updated_at)`,
        {
          replacements: {
            user_id: wd.user_id,
            amount: wd.amount.toFixed(2),
            actual_amount: wd.actual_amount.toFixed(2),
            fee: wd.fee.toFixed(2),
            withdraw_to: wd.withdraw_to,
            account_info: wd.account_info,
            status: wd.status,
            reject_reason: wd.reject_reason || null,
            created_at: new Date(Date.now() - (4 - i) * 5 * 24 * 3600 * 1000),
            updated_at: new Date(),
          },
          transaction: t
        }
      );
    }
    console.log(`   ✅ 创建了 ${withdrawData.length} 条提现记录`);

    // ========== 11.6. 创建转账/充值记录 ==========
    console.log('💳 创建转账/充值记录...');

    const transferData = [
      { user_id: males[0].id, from_user_id: null, type: 'recharge', amount: 99.00, xi_coins: 100, description: '购买100喜币' },
      { user_id: females[0].id, from_user_id: null, type: 'recharge', amount: 49.00, xi_coins: 50, description: '购买50喜币' },
      { user_id: males[1].id, from_user_id: null, type: 'recharge', amount: 199.00, xi_coins: 220, description: '购买220喜币(含赠送)' },
      { user_id: mmUsers[0].id, from_user_id: null, type: 'reward', amount: 500.00, xi_coins: 0, description: '成功撮合佣金奖励' },
      { user_id: mmUsers[1].id, from_user_id: null, type: 'reward', amount: 300.00, xi_coins: 0, description: '团队业绩分成奖励' },
    ];

    for (let i = 0; i < transferData.length; i++) {
      const td = transferData[i];
      await sequelize.query(
        `INSERT INTO transfer_records (user_id, from_user_id, type, amount, xi_coins, description, created_at, updated_at)
         VALUES (:user_id, :from_user_id, :type, :amount, :xi_coins, :description, :created_at, :updated_at)`,
        {
          replacements: {
            user_id: td.user_id,
            from_user_id: td.from_user_id,
            type: td.type,
            amount: td.amount.toFixed(2),
            xi_coins: td.xi_coins,
            description: td.description,
            created_at: new Date(Date.now() - (5 - i) * 3 * 24 * 3600 * 1000),
            updated_at: new Date(),
          },
          transaction: t
        }
      );
    }
    console.log(`   ✅ 创建了 ${transferData.length} 条转账/充值记录`);

    // ========== 12. 创建订单 ==========
    console.log('🧾 创建订单...');

    const orderData = [
      { user_id: males[0].id, matchmaker_id: mmRows[0].id, type: 'membership', amount: 1999.00, status: 'paid' },
      { user_id: females[0].id, matchmaker_id: mmRows[0].id, type: 'membership', amount: 1999.00, status: 'paid' },
      { user_id: males[1].id, matchmaker_id: mmRows[0].id, type: 'manual_match', amount: 4999.00, status: 'completed' },
      { user_id: females[1].id, matchmaker_id: mmRows[0].id, type: 'manual_match', amount: 4999.00, status: 'paid' },
      { user_id: males[4].id, matchmaker_id: mmRows[1].id, type: 'membership', amount: 999.00, status: 'paid' },
      { user_id: females[5].id, matchmaker_id: mmRows[1].id, type: 'vip_service', amount: 9999.00, status: 'pending' },
      { user_id: males[7].id, matchmaker_id: mmRows[0].id, type: 'xi_coin_purchase', amount: 99.00, status: 'paid' },
      { user_id: females[3].id, matchmaker_id: null, type: 'xi_coin_purchase', amount: 49.00, status: 'paid' },
    ];

    for (let i = 0; i < orderData.length; i++) {
      const od = orderData[i];
      const orderNo = `HL${Date.now()}${String(i).padStart(4, '0')}`;
      await sequelize.query(
        `INSERT INTO orders (order_no, user_id, matchmaker_id, type, amount, paid_amount, payment_method, status, paid_at, remark, created_at, updated_at)
         VALUES (:order_no, :user_id, :matchmaker_id, :type, :amount, :paid_amount, :payment_method, :status, :paid_at, :remark, :created_at, :updated_at)`,
        {
          replacements: {
            order_no: orderNo,
            user_id: od.user_id,
            matchmaker_id: od.matchmaker_id,
            type: od.type,
            amount: od.amount.toFixed(2),
            paid_amount: od.status !== 'pending' ? od.amount.toFixed(2) : '0.00',
            payment_method: od.status !== 'pending' ? 'wechat' : null,
            status: od.status,
            paid_at: od.status !== 'pending' ? new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 3600 * 1000) : null,
            remark: null,
            created_at: new Date(Date.now() - (30 - i * 3) * 24 * 3600 * 1000),
            updated_at: new Date(),
          },
          transaction: t
        }
      );
    }
    console.log(`   ✅ 创建了 ${orderData.length} 个订单`);

    // ========== 13. 创建沙龙活动 ==========
    console.log('🎉 创建沙龙活动...');

    const salonEvents = [
      {
        title: '春季单身交友沙龙',
        description: '阳春三月，邂逅爱情。本次活动邀请20位优质单身男女，通过互动游戏、自我介绍等环节，帮助大家找到心仪的对象。',
        cover_image: '/salon/event1.jpg',
        location: '北京市朝阳区望京SOHO T1 咖啡厅',
        event_date: new Date('2026-03-15 14:00:00'),
        max_participants: 20,
        current_participants: 12,
        price: 99.00,
        organizer_id: mmUsers[0].id,
        status: 'upcoming',
      },
      {
        title: '都市白领速配之夜',
        description: '为都市白领精心打造的速配活动，8分钟快速约会，高效认识更多优秀异性。',
        cover_image: '/salon/event2.jpg',
        location: '上海市浦东新区世纪大道88号 Sky Lounge',
        event_date: new Date('2026-03-22 19:00:00'),
        max_participants: 30,
        current_participants: 18,
        price: 149.00,
        organizer_id: mmUsers[1].id,
        status: 'upcoming',
      },
      {
        title: '户外踏青相亲行',
        description: '春暖花开，一起去郊外踏青！在大自然中放松心情，轻松认识新朋友。',
        cover_image: '/salon/event3.jpg',
        location: '杭州市西湖区灵隐路1号',
        event_date: new Date('2026-02-20 09:00:00'),
        max_participants: 24,
        current_participants: 24,
        price: 79.00,
        organizer_id: mmUsers[0].id,
        status: 'ended',
      },
    ];

    for (const event of salonEvents) {
      await sequelize.query(
        `INSERT INTO salon_events (title, description, cover_image, location, event_date, max_participants, current_participants, price, organizer_id, status, created_at, updated_at)
         VALUES (:title, :description, :cover_image, :location, :event_date, :max_participants, :current_participants, :price, :organizer_id, :status, :created_at, :updated_at)`,
        {
          replacements: {
            ...event,
            price: event.price.toFixed(2),
            created_at: new Date(Date.now() - 14 * 24 * 3600 * 1000),
            updated_at: new Date(),
          },
          transaction: t
        }
      );
    }

    const [eventRows] = await sequelize.query('SELECT id, status FROM salon_events ORDER BY id', { transaction: t });
    console.log(`   ✅ 创建了 ${eventRows.length} 个沙龙活动`);

    // ========== 14. 创建沙龙报名 ==========
    console.log('📋 创建沙龙报名...');

    let regCount = 0;
    // 第一场活动：6男6女报名
    for (let i = 0; i < 6; i++) {
      for (const u of [males[i], females[i]]) {
        await sequelize.query(
          `INSERT INTO salon_registrations (event_id, user_id, status, created_at, updated_at)
           VALUES (:event_id, :user_id, 'registered', :created_at, :updated_at)`,
          {
            replacements: {
              event_id: eventRows[0].id,
              user_id: u.id,
              created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000),
              updated_at: new Date(),
            },
            transaction: t
          }
        );
        regCount++;
      }
    }

    // 第三场活动（已结束）：全部参加
    for (const u of [...males, ...females].slice(0, 12)) {
      await sequelize.query(
        `INSERT INTO salon_registrations (event_id, user_id, status, created_at, updated_at)
         VALUES (:event_id, :user_id, 'attended', :created_at, :updated_at)`,
        {
          replacements: {
            event_id: eventRows[2].id,
            user_id: u.id,
            created_at: new Date(Date.now() - 14 * 24 * 3600 * 1000),
            updated_at: new Date(),
          },
          transaction: t
        }
      );
      regCount++;
    }
    console.log(`   ✅ 创建了 ${regCount} 条沙龙报名`);

    // ========== 15. 创建邀请关系 ==========
    console.log('🔗 创建邀请关系...');

    const invitations = [
      { inviter_id: males[0].id, invitee_id: males[2].id, invite_code: 'INV001', reward_amount: 10.00, status: 1 },
      { inviter_id: females[0].id, invitee_id: females[2].id, invite_code: 'INV002', reward_amount: 10.00, status: 1 },
      { inviter_id: males[1].id, invitee_id: males[4].id, invite_code: 'INV003', reward_amount: 10.00, status: 0 },
    ];

    for (const inv of invitations) {
      await sequelize.query(
        `INSERT INTO invitations (inviter_id, invitee_id, invite_code, reward_amount, status, created_at, updated_at)
         VALUES (:inviter_id, :invitee_id, :invite_code, :reward_amount, :status, :created_at, :updated_at)`,
        {
          replacements: {
            ...inv,
            reward_amount: inv.reward_amount.toFixed(2),
            created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000),
            updated_at: new Date(),
          },
          transaction: t
        }
      );
    }
    console.log(`   ✅ 创建了 ${invitations.length} 条邀请关系`);

    // ========== 提交事务 ==========
    await t.commit();

    console.log('\n🎉 测试数据插入完成！\n');
    console.log('========== 测试账号汇总 ==========');
    console.log('密码统一: test123456\n');
    console.log('--- 普通用户 (男) ---');
    males.forEach((u, i) => console.log(`  ${u.nickname}: ${u.phone} (ID: ${u.id})`));
    console.log('\n--- 普通用户 (女) ---');
    females.forEach((u, i) => console.log(`  ${u.nickname}: ${u.phone} (ID: ${u.id})`));
    console.log('\n--- 红娘 ---');
    mmUsers.forEach((u, i) => console.log(`  ${u.nickname}: ${u.phone} (ID: ${u.id})`));
    console.log('\n--- 双角色用户 (婚介+求偶) ---');
    dualUsers.forEach((u, i) => console.log(`  ${u.nickname}: ${u.phone} (ID: ${u.id})`));
    console.log('\n--- 匹配关系 ---');
    console.log('  互相喜欢: 张明远 ↔ 林婉婷, 李文博 ↔ 陈雨萱, 王子轩 ↔ 张梦琪');
    console.log('  单方喜欢: 赵浩然 → 王诗涵, 刘佳怡 → 陈思远, 刘建国 → 赵思颖, 黄欣怡 → 杨志成');
    console.log('  待处理: 周俊杰 ↔ 周雅琴, 吴天恩 ↔ 吴芷若, 孙瑞祥 ↔ 郑心蕊');
    console.log('\n--- 角色切换测试 ---');
    console.log('  赵双双(13600000001): 当前=求偶端, 可切换到婚介端');
    console.log('  钱婉兮(13600000002): 当前=婚介端, 可切换到求偶端');
    console.log('\n--- 管理员 ---');
    console.log('  系统管理员(13000000001): 用户名=admin, 密码=test123456');
    console.log('\n================================\n');

    process.exit(0);
  } catch (error) {
    await t.rollback();
    console.error('❌ 数据插入失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seed();
