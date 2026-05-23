/**
 * Admin service - business logic for admin management panel
 */
const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/database');
const ExcelJS = require('exceljs');
const {
  User, UserProfile, UserCertification, Matchmaker, MatchmakerStore,
  Wallet, WithdrawRecord, Order, SalonEvent,
  SalonRegistration, MatchRecord, Member, Team,
  EarningRecord
} = require('../models');
const logger = require('../utils/logger');
const walletService = require('./wallet.service');

const salonStatusMap = {
  draft: 'upcoming',
  registering: 'upcoming',
  full: 'upcoming',
  completed: 'ended'
};

function normalizeSalonPayload(data = {}) {
  const payload = { ...data };
  if (payload.fee !== undefined && payload.price === undefined) {
    payload.price = payload.fee;
  }
  if (payload.currentCount !== undefined && payload.currentParticipants === undefined) {
    payload.currentParticipants = payload.currentCount;
  }
  delete payload.fee;
  delete payload.currentCount;

  if (payload.status) {
    payload.status = salonStatusMap[payload.status] || payload.status;
  }
  return payload;
}

const adminService = {
  // ==================== Dashboard ====================

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalMatchmakers,
      todayNewUsers,
      todayNewMatchmakers,
      pendingWithdrawals,
      pendingWithdrawAmount,
      totalOrderAmount,
      todayOrderAmount,
      totalOrders,
      activeUsers,
      totalMatches,
      mutualMatches
    ] = await Promise.all([
      User.count({ where: { status: 1 } }),
      Matchmaker.count({ where: { status: 1 } }),
      User.count({ where: { createdAt: { [Op.gte]: today } } }),
      Matchmaker.count({ where: { createdAt: { [Op.gte]: today } } }),
      WithdrawRecord.count({ where: { status: 'pending' } }),
      WithdrawRecord.sum('amount', { where: { status: 'pending' } }) || 0,
      Order.sum('paidAmount', { where: { status: { [Op.in]: ['paid', 'completed'] } } }) || 0,
      Order.sum('paidAmount', { where: { status: { [Op.in]: ['paid', 'completed'] }, createdAt: { [Op.gte]: today } } }) || 0,
      Order.count(),
      User.count({ where: { lastLoginAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 3600 * 1000) } } }),
      MatchRecord.count(),
      MatchRecord.count({ where: { status: 'mutual' } })
    ]);

    return {
      totalUsers,
      totalMatchmakers,
      todayNewUsers,
      todayNewMatchmakers,
      pendingWithdrawals,
      pendingWithdrawAmount: Number(pendingWithdrawAmount) || 0,
      totalOrderAmount: Number(totalOrderAmount) || 0,
      todayOrderAmount: Number(todayOrderAmount) || 0,
      totalOrders,
      activeUsers,
      totalMatches,
      mutualMatches
    };
  },

  async getRecentUserTrend(days = 7) {
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await User.count({
        where: { createdAt: { [Op.gte]: date, [Op.lt]: nextDate } }
      });

      result.push({
        date: date.toISOString().slice(0, 10),
        count
      });
    }
    return result;
  },

  async getOrderTypeDistribution() {
    const rows = await Order.findAll({
      attributes: ['type', [fn('COUNT', col('id')), 'count'], [fn('SUM', col('paid_amount')), 'amount']],
      where: { status: { [Op.in]: ['paid', 'completed'] } },
      group: ['type'],
      raw: true
    });
    return rows.map(r => ({ type: r.type, count: Number(r.count), amount: Number(r.amount) || 0 }));
  },

  // ==================== User Management ====================

  async getUsers({ page = 1, pageSize = 20, keyword, gender, status, role, certificationStatus } = {}) {
    const where = {};
    if (gender !== undefined && gender !== '') where.gender = Number(gender);
    if (status !== undefined && status !== '') where.status = Number(status);
    if (role) where.currentRole = role;
    if (certificationStatus) where.certificationStatus = certificationStatus;
    if (keyword) {
      where[Op.or] = [
        { nickname: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } },
        { username: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['passwordHash'] },
      include: [{ association: 'profile', attributes: ['age', 'city', 'education', 'occupation'] }],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['created_at', 'DESC']]
    });

    return { total: count, list: rows, page: Number(page), pageSize: Number(pageSize) };
  },

  async getUserDetail(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['passwordHash'] },
      include: [
        { association: 'profile' },
        { association: 'wallet', attributes: ['availableAmount', 'frozenAmount', 'totalEarned', 'xiCoins'] },
        { association: 'certification' }
      ]
    });
    return user;
  },

  async updateUserStatus(userId, status) {
    const user = await User.findByPk(userId);
    if (!user) return null;
    await user.update({ status });
    logger.info(`Admin updated user ${userId} status to ${status}`);
    return user;
  },

  async deleteUser(userId) {
    const user = await User.findByPk(userId);
    if (!user) return null;
    if (user.isAdmin === 1) return { error: '不能删除管理员账号' };

    // 如果该用户有红娘身份，同步软删红娘记录
    const matchmaker = await Matchmaker.findOne({ where: { userId } });
    if (matchmaker) {
      await matchmaker.destroy();
      logger.info(`Admin soft-deleted matchmaker ${matchmaker.id} (linked to user ${userId})`);
    }

    await user.destroy();
    logger.info(`Admin soft-deleted user ${userId}`);
    return { success: true };
  },

  async exportUsers({ ids, keyword, gender, status, certificationStatus } = {}) {
    const where = {};
    where.currentRole = 'user';

    if (ids && ids.length > 0) {
      where.id = { [Op.in]: ids };
    } else {
      if (gender !== undefined && gender !== '') where.gender = Number(gender);
      if (status !== undefined && status !== '') where.status = Number(status);
      if (certificationStatus) where.certificationStatus = certificationStatus;
      if (keyword) {
        where[Op.or] = [
          { nickname: { [Op.like]: `%${keyword}%` } },
          { phone: { [Op.like]: `%${keyword}%` } },
          { username: { [Op.like]: `%${keyword}%` } }
        ];
      }
    }

    const users = await User.findAll({
      where,
      attributes: { exclude: ['passwordHash'] },
      include: [{ association: 'profile', attributes: ['age', 'city', 'education', 'occupation'] }],
      order: [['created_at', 'DESC']]
    });

    const genderMap = { 1: '男', 2: '女' };
    const statusMap = { 0: '禁用', 1: '正常' };
    const certMap = { none: '未认证', pending: '审核中', approved: '已认证', rejected: '已拒绝' };

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('会员数据');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: '昵称', key: 'nickname', width: 15 },
      { header: '手机号', key: 'phone', width: 15 },
      { header: '用户名', key: 'username', width: 15 },
      { header: '性别', key: 'gender', width: 8 },
      { header: '年龄', key: 'age', width: 8 },
      { header: '城市', key: 'city', width: 12 },
      { header: '学历', key: 'education', width: 12 },
      { header: '职业', key: 'occupation', width: 15 },
      { header: '状态', key: 'status', width: 8 },
      { header: '实名认证', key: 'certificationStatus', width: 12 },
      { header: '注册时间', key: 'createdAt', width: 20 }
    ];

    // 表头加粗
    sheet.getRow(1).font = { bold: true };

    for (const u of users) {
      sheet.addRow({
        id: u.id,
        nickname: u.nickname || '',
        phone: u.phone || '',
        username: u.username || '',
        gender: genderMap[u.gender] || '未设置',
        age: u.profile?.age || '',
        city: u.profile?.city || '',
        education: u.profile?.education || '',
        occupation: u.profile?.occupation || '',
        status: statusMap[u.status] || '',
        certificationStatus: certMap[u.certificationStatus] || '未认证',
        createdAt: u.createdAt ? u.createdAt.toISOString().replace('T', ' ').slice(0, 19) : ''
      });
    }

    return workbook;
  },

  // ==================== Matchmaker Management ====================

  async getMatchmakers({ page = 1, pageSize = 20, keyword, certificationStatus, level } = {}) {
    const mmWhere = {};
    if (certificationStatus !== undefined && certificationStatus !== '') mmWhere.certificationStatus = Number(certificationStatus);
    if (level !== undefined && level !== '') mmWhere.level = Number(level);

    const userWhere = {};
    if (keyword) {
      userWhere[Op.or] = [
        { nickname: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await Matchmaker.findAndCountAll({
      where: mmWhere,
      include: [
        {
          association: 'user',
          attributes: ['id', 'nickname', 'phone', 'avatarUrl', 'gender', 'status'],
          where: Object.keys(userWhere).length > 0 ? userWhere : undefined
        },
        { association: 'team', attributes: ['id', 'name'] },
        { association: 'store', attributes: ['id', 'storeName', 'status'] }
      ],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['created_at', 'DESC']],
      distinct: true
    });

    return { total: count, list: rows, page: Number(page), pageSize: Number(pageSize) };
  },

  async getMatchmakerDetail(matchmakerId) {
    const mm = await Matchmaker.findByPk(matchmakerId, {
      include: [
        { association: 'user', attributes: { exclude: ['passwordHash'] }, include: [{ association: 'profile' }] },
        { association: 'team' },
        { association: 'store' },
        { association: 'parent', attributes: ['id'], include: [{ association: 'user', attributes: ['nickname', 'phone'] }] }
      ]
    });
    return mm;
  },

  async updateCertification(matchmakerId, certificationStatus) {
    const mm = await Matchmaker.findByPk(matchmakerId);
    if (!mm) return null;
    await mm.update({ certificationStatus });
    logger.info(`Admin updated matchmaker ${matchmakerId} certification to ${certificationStatus}`);
    return mm;
  },

  async updateLevel(matchmakerId, level) {
    const mm = await Matchmaker.findByPk(matchmakerId);
    if (!mm) return null;
    await mm.update({ level });
    logger.info(`Admin updated matchmaker ${matchmakerId} level to ${level}`);
    return mm;
  },

  async deleteMatchmaker(matchmakerId) {
    const mm = await Matchmaker.findByPk(matchmakerId);
    if (!mm) return null;
    await mm.destroy();
    await User.update({ currentRole: 'user' }, { where: { id: mm.userId, currentRole: 'matchmaker' } });
    logger.info(`Admin soft-deleted matchmaker ${matchmakerId}`);
    return { success: true };
  },

  // ==================== Withdrawal Management ====================

  async getWithdrawals({ page = 1, pageSize = 20, status } = {}) {
    const where = {};
    if (status && status !== 'all') where.status = status;

    const { count, rows } = await WithdrawRecord.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nickname', 'phone', 'avatarUrl']
      }],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['created_at', 'DESC']]
    });

    return { total: count, list: rows, page: Number(page), pageSize: Number(pageSize) };
  },

  async approveWithdrawal(withdrawId) {
    try {
      const record = await walletService.completeWithdrawal(withdrawId);
      logger.info(`Admin approved withdrawal ${withdrawId}`);
      return record;
    } catch (err) {
      if (err.message === '提现记录不存在') return null;
      return { error: err.message };
    }
  },

  async rejectWithdrawal(withdrawId, rejectReason) {
    try {
      const record = await walletService.rejectWithdrawal(withdrawId, rejectReason);
      logger.info(`Admin rejected withdrawal ${withdrawId}, reason: ${rejectReason}`);
      return record;
    } catch (err) {
      if (err.message === '提现记录不存在') return null;
      return { error: err.message };
    }
  },

  // ==================== Order Management ====================

  async getOrders({ page = 1, pageSize = 20, status, type, keyword } = {}) {
    const where = {};
    if (status && status !== 'all') where.status = status;
    if (type && type !== 'all') where.type = type;
    if (keyword) {
      where[Op.or] = [
        { orderNo: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'nickname', 'phone'] },
        { model: Matchmaker, as: 'matchmaker', include: [{ association: 'user', attributes: ['nickname'] }] }
      ],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['created_at', 'DESC']],
      distinct: true
    });

    return { total: count, list: rows, page: Number(page), pageSize: Number(pageSize) };
  },

  async getOrderDetail(orderId) {
    const order = await Order.findByPk(orderId, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['passwordHash'] } },
        { model: Matchmaker, as: 'matchmaker', include: [{ association: 'user', attributes: ['nickname', 'phone'] }] }
      ]
    });
    return order;
  },

  // ==================== Salon Management ====================

  async getSalons({ page = 1, pageSize = 20, status } = {}) {
    const where = {};
    if (status && status !== 'all') where.status = salonStatusMap[status] || status;

    const { count, rows } = await SalonEvent.findAndCountAll({
      where,
      include: [{ model: User, as: 'organizer', attributes: ['id', 'nickname', 'phone'] }],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['event_date', 'DESC']],
      distinct: true
    });

    return { total: count, list: rows, page: Number(page), pageSize: Number(pageSize) };
  },

  async getSalonDetail(salonId) {
    const event = await SalonEvent.findByPk(salonId, {
      include: [
        { model: User, as: 'organizer', attributes: ['id', 'nickname', 'phone'] },
        {
          model: SalonRegistration, as: 'registrations',
          include: [{ model: User, as: 'user', attributes: ['id', 'nickname', 'phone', 'gender', 'avatarUrl'] }]
        }
      ]
    });
    return event;
  },

  async createSalon(data) {
    const payload = normalizeSalonPayload(data);
    if (!payload.status) payload.status = 'upcoming';
    const event = await SalonEvent.create(payload);
    logger.info(`Admin created salon event ${event.id}: ${data.title}`);
    return event;
  },

  async updateSalon(salonId, data) {
    const event = await SalonEvent.findByPk(salonId);
    if (!event) return null;
    await event.update(normalizeSalonPayload(data));
    logger.info(`Admin updated salon event ${salonId}`);
    return event;
  },

  async updateSalonStatus(salonId, status) {
    const event = await SalonEvent.findByPk(salonId);
    if (!event) return null;
    const normalizedStatus = salonStatusMap[status] || status;
    await event.update({ status: normalizedStatus });
    logger.info(`Admin updated salon ${salonId} status to ${normalizedStatus}`);
    return event;
  },

  // ==================== User Certification Management ====================

  async getCertifications({ status, page = 1, pageSize = 20 } = {}) {
    const where = {};
    if (status) where.status = status;

    const { count, rows } = await UserCertification.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nickname', 'phone', 'avatarUrl']
      }],
      order: [['submitted_at', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      distinct: true
    });

    return { total: count, list: rows, page: Number(page), pageSize: Number(pageSize) };
  },

  async reviewCertification(certId, action, rejectReason, reviewerUserId) {
    const cert = await UserCertification.findByPk(certId);
    if (!cert) return null;

    const now = new Date();
    if (action === 'approve') {
      await cert.update({ status: 'approved', reviewedAt: now, reviewerId: reviewerUserId, rejectReason: null });
      await User.update(
        { certificationStatus: 'approved', isVerified: 1 },
        { where: { id: cert.userId } }
      );
    } else {
      await cert.update({ status: 'rejected', rejectReason, reviewedAt: now, reviewerId: reviewerUserId });
      await User.update(
        { certificationStatus: 'rejected' },
        { where: { id: cert.userId } }
      );
    }

    logger.info(`Admin ${reviewerUserId} ${action}d certification ${certId} for user ${cert.userId}`);
    return cert;
  }
};

module.exports = adminService;
