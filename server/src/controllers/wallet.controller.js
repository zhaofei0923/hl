const { Wallet, EarningRecord, WithdrawRecord, TransferRecord } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const walletService = require('../services/wallet.service');
const { success, error, paginate } = require('../utils/response');
const logger = require('../utils/logger');

const walletController = {
  /**
   * Get wallet info
   * GET /api/wallet/info
   */
  async getInfo(req, res, next) {
    try {
      const { userId } = req.user;

      const wallet = await Wallet.findOne({ where: { userId } });
      if (!wallet) {
        return error(res, '钱包不存在', 40400, 404);
      }

      return success(res, {
        availableAmount: Number(wallet.availableAmount),
        frozenAmount: Number(wallet.frozenAmount),
        totalEarned: Number(wallet.totalEarned),
        totalWithdrawn: Number(wallet.totalWithdrawn),
        xiCoins: wallet.xiCoins
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get earnings list
   * GET /api/wallet/earnings
   */
  async getEarnings(req, res, next) {
    try {
      const { userId } = req.user;
      const { page = 1, pageSize = 20, type, yearMonth } = req.query;

      const where = { userId };
      if (type) where.type = type;

      // Year-month filter: e.g. "2024-03"
      if (yearMonth) {
        const [year, month] = yearMonth.split('-').map(Number);
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
        where.createdAt = { [Op.between]: [monthStart, monthEnd] };
      }

      const { count, rows } = await EarningRecord.findAndCountAll({
        where,
        limit: Number(pageSize),
        offset: (Number(page) - 1) * Number(pageSize),
        order: [['created_at', 'DESC']]
      });

      return paginate(res, {
        list: rows,
        total: count,
        page: Number(page),
        pageSize: Number(pageSize)
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get earnings summary
   * GET /api/wallet/earnings/summary
   */
  async getEarningsSummary(req, res, next) {
    try {
      const { userId } = req.user;

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

      // Earnings by type for this month
      const earningsByType = await EarningRecord.findAll({
        attributes: [
          'type',
          [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: {
          userId,
          createdAt: { [Op.between]: [monthStart, monthEnd] }
        },
        group: ['type'],
        raw: true
      });

      return success(res, {
        today: Number(todayEarnings),
        month: Number(monthEarnings),
        pendingWithdraw: Number(pendingWithdraw),
        byType: earningsByType
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get withdrawal records
   * GET /api/wallet/withdrawals
   */
  async getWithdrawals(req, res, next) {
    try {
      const { userId } = req.user;
      const { page = 1, pageSize = 20, status } = req.query;

      const where = { userId };
      if (status) where.status = status;

      const { count, rows } = await WithdrawRecord.findAndCountAll({
        where,
        limit: Number(pageSize),
        offset: (Number(page) - 1) * Number(pageSize),
        order: [['created_at', 'DESC']]
      });

      return paginate(res, {
        list: rows,
        total: count,
        page: Number(page),
        pageSize: Number(pageSize)
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get transfer records
   * GET /api/wallet/transfers
   */
  async getTransfers(req, res, next) {
    try {
      const { userId } = req.user;
      const { page = 1, pageSize = 20 } = req.query;

      const { count, rows } = await TransferRecord.findAndCountAll({
        where: { userId },
        limit: Number(pageSize),
        offset: (Number(page) - 1) * Number(pageSize),
        order: [['created_at', 'DESC']]
      });

      return paginate(res, {
        list: rows,
        total: count,
        page: Number(page),
        pageSize: Number(pageSize)
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Request withdrawal
   * POST /api/wallet/withdraw
   */
  async withdraw(req, res, next) {
    try {
      const { userId } = req.user;
      const { amount, withdrawTo, accountInfo } = req.body;

      if (!amount || amount <= 0) {
        return error(res, '提现金额必须大于0', 40001);
      }

      if (!withdrawTo) {
        return error(res, '请选择提现方式', 40001);
      }

      if (!['wechat', 'alipay', 'bank'].includes(withdrawTo)) {
        return error(res, '提现方式不正确', 40001);
      }

      // Minimum withdrawal amount
      const minAmount = 10;
      if (amount < minAmount) {
        return error(res, `最低提现金额为${minAmount}元`, 40001);
      }

      const record = await walletService.withdraw(userId, amount, withdrawTo, accountInfo);

      return success(res, record, '提现申请已提交');
    } catch (err) {
      if (err.message === '余额不足' || err.message === '钱包不存在') {
        return error(res, err.message, 40001);
      }
      next(err);
    }
  }
};

module.exports = walletController;
