/**
 * Admin service - business logic for admin management panel
 */
const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/database');
const {
  User, UserProfile, UserCertification, Matchmaker, MatchmakerStore,
  Wallet, WithdrawRecord, Order, SalonEvent,
  SalonRegistration, MatchRecord, Member, Team,
  EarningRecord
} = require('../models');
const logger = require('../utils/logger');

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
    const record = await WithdrawRecord.findByPk(withdrawId);
    if (!record) return null;
    if (record.status !== 'pending') return { error: '该提现记录状态不可操作' };
    await record.update({ status: 'processing', processedAt: new Date() });
    logger.info(`Admin approved withdrawal ${withdrawId}`);
    return record;
  },

  async rejectWithdrawal(withdrawId, rejectReason) {
    const record = await WithdrawRecord.findByPk(withdrawId);
    if (!record) return null;
    if (record.status !== 'pending') return { error: '该提现记录状态不可操作' };

    // Refund to wallet
    const wallet = await Wallet.findOne({ where: { userId: record.userId } });
    if (wallet) {
      await wallet.increment('availableAmount', { by: Number(record.amount) });
    }

    await record.update({ status: 'rejected', rejectReason, processedAt: new Date() });
    logger.info(`Admin rejected withdrawal ${withdrawId}, reason: ${rejectReason}`);
    return record;
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
    if (status && status !== 'all') where.status = status;

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
    const event = await SalonEvent.create(data);
    logger.info(`Admin created salon event ${event.id}: ${data.title}`);
    return event;
  },

  async updateSalon(salonId, data) {
    const event = await SalonEvent.findByPk(salonId);
    if (!event) return null;
    await event.update(data);
    logger.info(`Admin updated salon event ${salonId}`);
    return event;
  },

  async updateSalonStatus(salonId, status) {
    const event = await SalonEvent.findByPk(salonId);
    if (!event) return null;
    await event.update({ status });
    logger.info(`Admin updated salon ${salonId} status to ${status}`);
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
