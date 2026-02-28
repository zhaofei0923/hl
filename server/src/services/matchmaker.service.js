/**
 * Matchmaker service - handles matchmaker operations
 */
const { Op } = require('sequelize');
const { Matchmaker, MatchmakerStore, Team, User, Wallet, EarningRecord, WithdrawRecord, Member } = require('../models');
const logger = require('../utils/logger');

const matchmakerService = {
  /**
   * Get matchmaker record by the owning user ID, with store/team/user included
   */
  async getMatchmakerByUserId(userId) {
    return Matchmaker.findOne({
      where: { userId },
      include: [
        { association: 'store' },
        { association: 'team' },
        { association: 'user', attributes: ['id', 'phone', 'nickname', 'avatarUrl', 'gender'] }
      ]
    });
  },

  /**
   * Get matchmaker by its own primary key, with store/team/user included
   */
  async getMatchmakerById(id) {
    return Matchmaker.findByPk(id, {
      include: [
        { association: 'store' },
        { association: 'team' },
        { association: 'user', attributes: ['id', 'phone', 'nickname', 'avatarUrl', 'gender'] }
      ]
    });
  },

  /**
   * Register a new matchmaker for a user.
   * Generates a unique matchmaker number.
   */
  async createMatchmaker(userId, data) {
    // Prevent duplicate registration
    const existing = await Matchmaker.findOne({ where: { userId } });
    if (existing) {
      throw new Error('该用户已注册为红娘');
    }

    // Generate matchmaker number: MM + timestamp suffix + random digits
    const timestamp = Date.now().toString().slice(-6);
    const random = String(Math.floor(1000 + Math.random() * 9000));
    const matchmakerNo = `MM${timestamp}${random}`;

    const matchmaker = await Matchmaker.create({
      userId,
      matchmakerNo,
      level: 1,
      certificationStatus: 0,
      totalPerformance: 0,
      status: 1,
      ...data
    });

    logger.info(`Matchmaker created: ${matchmaker.id} for user ${userId}`);
    return matchmaker;
  },

  /**
   * Update matchmaker fields
   */
  async updateMatchmaker(id, data) {
    const matchmaker = await Matchmaker.findByPk(id);
    if (!matchmaker) return null;

    await matchmaker.update(data);
    logger.info(`Matchmaker ${id} updated`);
    return matchmaker;
  },

  /**
   * Build the full dashboard data object for a matchmaker.
   * Aggregates wallet info, today/month earnings, pending withdrawals, team performance.
   */
  async getDashboardData(userId) {
    const matchmaker = await Matchmaker.findOne({
      where: { userId },
      include: [
        { association: 'team' },
        { association: 'store' }
      ]
    });

    if (!matchmaker) return null;

    // Wallet
    const wallet = await Wallet.findOne({ where: { userId } });

    // Today's date range
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // This month's date range
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date();

    // Today's earnings
    const todayEarnings = await EarningRecord.sum('amount', {
      where: {
        userId,
        createdAt: { [Op.between]: [todayStart, todayEnd] }
      }
    }) || 0;

    // This month's earnings
    const monthEarnings = await EarningRecord.sum('amount', {
      where: {
        userId,
        createdAt: { [Op.between]: [monthStart, monthEnd] }
      }
    }) || 0;

    // Pending withdrawals
    const pendingWithdraw = await WithdrawRecord.sum('amount', {
      where: {
        userId,
        status: { [Op.in]: ['pending', 'processing'] }
      }
    }) || 0;

    // Team performance
    let teamPerformance = 0;
    if (matchmaker.teamId && matchmaker.team) {
      teamPerformance = Number(matchmaker.team.totalPerformance) || 0;
    }

    // Member count
    const memberCount = await Member.count({ where: { matchmakerId: matchmaker.id, status: 1 } });

    return {
      matchmaker: {
        id: matchmaker.id,
        matchmakerNo: matchmaker.matchmakerNo,
        level: matchmaker.level,
        certificationStatus: matchmaker.certificationStatus,
        totalPerformance: Number(matchmaker.totalPerformance),
        hasStore: matchmaker.hasStore,
        memberCount
      },
      wallet: wallet ? {
        availableAmount: Number(wallet.availableAmount),
        frozenAmount: Number(wallet.frozenAmount),
        totalEarned: Number(wallet.totalEarned),
        xiCoins: wallet.xiCoins
      } : null,
      earnings: {
        today: Number(todayEarnings),
        month: Number(monthEarnings),
        pendingWithdraw: Number(pendingWithdraw)
      },
      teamPerformance
    };
  },

  /**
   * Get team info including leader and all team members.
   * Returns null if the matchmaker has no team.
   */
  async getTeamInfo(userId) {
    const matchmaker = await Matchmaker.findOne({ where: { userId } });
    if (!matchmaker || !matchmaker.teamId) {
      return null;
    }

    const team = await Team.findByPk(matchmaker.teamId, {
      include: [
        {
          association: 'leader',
          include: [{ association: 'user', attributes: ['id', 'nickname', 'avatarUrl'] }]
        },
        {
          association: 'members',
          include: [{ association: 'user', attributes: ['id', 'nickname', 'avatarUrl'] }]
        }
      ]
    });

    return team;
  },

  /**
   * Create or update a matchmaker store
   */
  async upsertStore(matchmakerId, storeData) {
    const [store, created] = await MatchmakerStore.findOrCreate({
      where: { matchmakerId },
      defaults: { matchmakerId, ...storeData }
    });

    if (!created) {
      await store.update(storeData);
    }

    // Mark matchmaker as having a store
    await Matchmaker.update({ hasStore: 1 }, { where: { id: matchmakerId } });

    logger.info(`Store ${created ? 'created' : 'updated'} for matchmaker ${matchmakerId}`);
    return store;
  },

  /**
   * Get direct subordinate matchmakers (children in hierarchy)
   */
  async getSubordinates(matchmakerId, { page = 1, pageSize = 20 } = {}) {
    const { count, rows } = await Matchmaker.findAndCountAll({
      where: { parentId: matchmakerId },
      include: [
        { association: 'user', attributes: ['id', 'nickname', 'avatarUrl', 'phone'] }
      ],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['created_at', 'DESC']]
    });

    return { total: count, list: rows, page: Number(page), pageSize: Number(pageSize) };
  },

  /**
   * List matchmakers with optional filters and pagination
   */
  async listMatchmakers({ keyword, level, certificationStatus, status, page = 1, pageSize = 20 } = {}) {
    const where = {};
    if (level !== undefined) where.level = Number(level);
    if (certificationStatus !== undefined) where.certificationStatus = Number(certificationStatus);
    if (status !== undefined) where.status = Number(status);

    const userInclude = {
      association: 'user',
      attributes: ['id', 'phone', 'nickname', 'avatarUrl', 'gender']
    };

    if (keyword) {
      userInclude.where = {
        [Op.or]: [
          { nickname: { [Op.like]: `%${keyword}%` } },
          { phone: { [Op.like]: `%${keyword}%` } }
        ]
      };
    }

    const { count, rows } = await Matchmaker.findAndCountAll({
      where,
      include: [userInclude, { association: 'store' }, { association: 'team' }],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['created_at', 'DESC']],
      distinct: true
    });

    return { total: count, list: rows, page: Number(page), pageSize: Number(pageSize) };
  },

  /**
   * Update matchmaker certification status
   */
  async updateCertification(matchmakerId, certificationStatus) {
    const matchmaker = await Matchmaker.findByPk(matchmakerId);
    if (!matchmaker) return null;

    await matchmaker.update({ certificationStatus });
    logger.info(`Matchmaker ${matchmakerId} certification status updated to ${certificationStatus}`);
    return matchmaker;
  }
};

module.exports = matchmakerService;
