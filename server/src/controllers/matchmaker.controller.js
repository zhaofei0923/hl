const { Matchmaker, Invitation, Team, Wallet, EarningRecord, WithdrawRecord } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { success, error, paginate } = require('../utils/response');
const logger = require('../utils/logger');
const matchmakerService = require('../services/matchmaker.service');

const matchmakerController = {
  /**
   * Get matchmaker dashboard data
   * GET /api/matchmaker/dashboard
   */
  async getDashboard(req, res, next) {
    try {
      const { userId } = req.user;

      // Get matchmaker record
      const matchmaker = await Matchmaker.findOne({
        where: { userId },
        include: [
          { association: 'team' },
          { association: 'store' }
        ]
      });

      if (!matchmaker) {
        return error(res, '红娘信息不存在', 40400, 404);
      }

      // Get wallet
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

      // Team performance (if has team)
      let teamPerformance = 0;
      if (matchmaker.teamId && matchmaker.team) {
        teamPerformance = Number(matchmaker.team.totalPerformance) || 0;
      }

      return success(res, {
        matchmaker: {
          id: matchmaker.id,
          matchmakerNo: matchmaker.matchmakerNo,
          level: matchmaker.level,
          certificationStatus: matchmaker.certificationStatus,
          totalPerformance: Number(matchmaker.totalPerformance),
          hasStore: matchmaker.hasStore
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
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Apply to become a matchmaker
   * POST /api/matchmaker/apply
   */
  async apply(req, res, next) {
    try {
      const { userId } = req.user;
      const matchmaker = await matchmakerService.createMatchmaker(userId, req.body);
      return success(res, matchmaker, '申请成功', 201);
    } catch (err) {
      if (err.message === '该用户已注册为红娘') {
        return error(res, err.message, 40900, 409);
      }
      next(err);
    }
  },

  /**
   * Get matchmaker info
   * GET /api/matchmaker/info
   */
  async getInfo(req, res, next) {
    try {
      const { userId } = req.user;

      const matchmaker = await Matchmaker.findOne({
        where: { userId },
        include: [
          { association: 'user', attributes: ['id', 'phone', 'nickname', 'avatarUrl'] },
          { association: 'store' },
          { association: 'team' }
        ]
      });

      if (!matchmaker) {
        return error(res, '红娘信息不存在', 40400, 404);
      }

      return success(res, matchmaker);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update matchmaker info
   * PUT /api/matchmaker/info
   */
  async updateInfo(req, res, next) {
    try {
      const { userId } = req.user;

      const matchmaker = await Matchmaker.findOne({ where: { userId } });
      if (!matchmaker) {
        return error(res, '红娘信息不存在', 40400, 404);
      }

      const updated = await matchmakerService.updateMatchmaker(matchmaker.id, req.body);
      return success(res, updated, '更新成功');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get team info
   * GET /api/matchmaker/team
   */
  async getTeam(req, res, next) {
    try {
      const { userId } = req.user;

      const matchmaker = await Matchmaker.findOne({ where: { userId } });
      if (!matchmaker || !matchmaker.teamId) {
        return success(res, null, '暂无团队信息');
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

      return success(res, team);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get team member list with pagination
   * GET /api/matchmaker/team/members
   */
  async getTeamMembers(req, res, next) {
    try {
      const { userId } = req.user;
      const { page = 1, pageSize = 20 } = req.query;

      const matchmaker = await Matchmaker.findOne({ where: { userId } });
      if (!matchmaker) {
        return error(res, '红娘信息不存在', 40400, 404);
      }

      const result = await matchmakerService.getSubordinates(matchmaker.id, { page, pageSize });
      return paginate(res, result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Apply for a store
   * POST /api/matchmaker/store/apply
   */
  async applyStore(req, res, next) {
    try {
      const { userId } = req.user;

      const matchmaker = await Matchmaker.findOne({ where: { userId } });
      if (!matchmaker) {
        return error(res, '红娘信息不存在', 40400, 404);
      }

      const store = await matchmakerService.upsertStore(matchmaker.id, req.body);
      return success(res, store, '门店申请成功', 201);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get store info
   * GET /api/matchmaker/store
   */
  async getStore(req, res, next) {
    try {
      const { userId } = req.user;

      const matchmaker = await Matchmaker.findOne({
        where: { userId },
        include: [{ association: 'store' }]
      });

      if (!matchmaker) {
        return error(res, '红娘信息不存在', 40400, 404);
      }

      return success(res, matchmaker.store || null);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update store info
   * PUT /api/matchmaker/store
   */
  async updateStore(req, res, next) {
    try {
      const { userId } = req.user;

      const matchmaker = await Matchmaker.findOne({ where: { userId } });
      if (!matchmaker) {
        return error(res, '红娘信息不存在', 40400, 404);
      }

      const store = await matchmakerService.upsertStore(matchmaker.id, req.body);
      return success(res, store, '门店更新成功');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get subordinate matchmakers list
   * GET /api/matchmaker/my-matchmakers
   */
  async getMyMatchmakers(req, res, next) {
    try {
      const { userId } = req.user;
      const { page = 1, pageSize = 20, ...filters } = req.query;

      const matchmaker = await Matchmaker.findOne({ where: { userId } });
      if (!matchmaker) {
        return error(res, '红娘信息不存在', 40400, 404);
      }

      const result = await matchmakerService.getSubordinates(matchmaker.id, { page, pageSize, ...filters });
      return paginate(res, result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get invite code for current matchmaker
   * GET /api/matchmaker/invite/code
   */
  async getInviteCode(req, res, next) {
    try {
      const { userId } = req.user;

      const matchmaker = await Matchmaker.findOne({ where: { userId } });
      if (!matchmaker) {
        return error(res, '红娘信息不存在', 40400, 404);
      }

      // Generate invite code based on matchmaker ID
      const code = `INV${String(matchmaker.id).padStart(6, '0')}`;
      return success(res, { code, matchmakerId: matchmaker.id });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get invitation records
   * GET /api/matchmaker/invite/records
   */
  async getInviteRecords(req, res, next) {
    try {
      const { userId } = req.user;
      const { page = 1, pageSize = 20 } = req.query;

      const limit = Number(pageSize);
      const offset = (Number(page) - 1) * limit;

      const { count, rows } = await Invitation.findAndCountAll({
        where: { inviterId: userId },
        include: [
          { association: 'invitee', attributes: ['id', 'nickname', 'avatarUrl', 'phone'] }
        ],
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });

      return paginate(res, { list: rows, total: count, page: Number(page), pageSize: limit });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = matchmakerController;
