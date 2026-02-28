/**
 * Wallet service - handles wallet and financial operations
 */
const { Op } = require('sequelize');
const { Wallet, EarningRecord, WithdrawRecord, TransferRecord } = require('../models');
const sequelize = require('../config/database');
const logger = require('../utils/logger');

const walletService = {
  /**
   * Get wallet record for a user
   */
  async getWalletByUserId(userId) {
    return Wallet.findOne({ where: { userId } });
  },

  /**
   * Get or create wallet for a user (ensures a wallet always exists)
   */
  async getOrCreateWallet(userId) {
    const [wallet] = await Wallet.findOrCreate({
      where: { userId },
      defaults: {
        userId,
        availableAmount: 0,
        frozenAmount: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        xiCoins: 0,
        version: 0
      }
    });
    return wallet;
  },

  /**
   * Get paginated earning records for a user.
   * Supports optional type and yearMonth filters.
   */
  async getEarnings(userId, filters = {}) {
    const { page = 1, pageSize = 20, type, yearMonth } = filters;
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

    return { total: count, list: rows, page: Number(page), pageSize: Number(pageSize) };
  },

  /**
   * Get earnings summary: today's earnings, this month's earnings,
   * pending withdrawals, and a breakdown by earning type for the current month.
   */
  async getEarningsSummary(userId) {
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

    return {
      today: Number(todayEarnings),
      month: Number(monthEarnings),
      pendingWithdraw: Number(pendingWithdraw),
      byType: earningsByType
    };
  },

  /**
   * Get paginated withdrawal records for a user.
   * Supports optional status filter.
   */
  async getWithdrawals(userId, filters = {}) {
    const { page = 1, pageSize = 20, status } = filters;
    const where = { userId };
    if (status) where.status = status;

    const { count, rows } = await WithdrawRecord.findAndCountAll({
      where,
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['created_at', 'DESC']]
    });

    return { total: count, list: rows, page: Number(page), pageSize: Number(pageSize) };
  },

  /**
   * Get paginated transfer records for a user.
   * Supports optional type filter.
   */
  async getTransfers(userId, filters = {}) {
    const { page = 1, pageSize = 20, type } = filters;
    const where = { userId };
    if (type) where.type = type;

    const { count, rows } = await TransferRecord.findAndCountAll({
      where,
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['created_at', 'DESC']]
    });

    return { total: count, list: rows, page: Number(page), pageSize: Number(pageSize) };
  },

  /**
   * Request a withdrawal.
   * Uses a transaction with optimistic locking to safely deduct from available
   * and move the amount to frozen while the withdrawal is processed.
   * Throws if wallet not found or balance insufficient.
   */
  async withdraw(userId, amount, withdrawTo, accountInfo) {
    const t = await sequelize.transaction();
    try {
      const wallet = await Wallet.findOne({
        where: { userId },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!wallet) {
        throw new Error('钱包不存在');
      }

      if (Number(wallet.availableAmount) < amount) {
        throw new Error('余额不足');
      }

      const fee = 0; // Fee calculation placeholder
      const actualAmount = amount - fee;

      // Deduct from available, add to frozen using optimistic lock
      const [affectedRows] = await Wallet.update(
        {
          availableAmount: sequelize.literal(`available_amount - ${amount}`),
          frozenAmount: sequelize.literal(`frozen_amount + ${amount}`),
          version: sequelize.literal('version + 1')
        },
        {
          where: { userId, version: wallet.version },
          transaction: t
        }
      );

      if (affectedRows === 0) {
        throw new Error('操作冲突，请重试');
      }

      const record = await WithdrawRecord.create({
        userId,
        amount,
        fee,
        actualAmount,
        withdrawTo,
        accountInfo,
        status: 'pending'
      }, { transaction: t });

      await t.commit();
      logger.info(`Withdrawal requested: user ${userId}, amount ${amount}, to ${withdrawTo}`);
      return record;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  /**
   * Add an earning to a user's wallet.
   * Creates an EarningRecord and credits the wallet's available amount in a transaction.
   */
  async addEarning(userId, { type, amount, xiCoins = 0, sourceOrderId = null, description = '' }) {
    const t = await sequelize.transaction();
    try {
      const wallet = await Wallet.findOne({
        where: { userId },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!wallet) {
        throw new Error('钱包不存在');
      }

      // Create earning record
      const record = await EarningRecord.create({
        userId,
        type,
        amount,
        xiCoins,
        sourceOrderId,
        description
      }, { transaction: t });

      // Credit wallet
      const updateFields = {
        availableAmount: sequelize.literal(`available_amount + ${Number(amount)}`),
        totalEarned: sequelize.literal(`total_earned + ${Number(amount)}`),
        version: sequelize.literal('version + 1')
      };

      if (xiCoins > 0) {
        updateFields.xiCoins = sequelize.literal(`xi_coins + ${Number(xiCoins)}`);
      }

      await Wallet.update(updateFields, {
        where: { userId, version: wallet.version },
        transaction: t
      });

      await t.commit();
      logger.info(`Earning added: user ${userId}, type ${type}, amount ${amount}`);
      return record;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  /**
   * Record a transfer (recharge, reward, refund, or user-to-user transfer).
   * Credits the wallet and creates a TransferRecord inside a transaction.
   */
  async addTransfer(userId, { type, amount, xiCoins = 0, fromUserId = null, description = '' }) {
    const t = await sequelize.transaction();
    try {
      const wallet = await Wallet.findOne({
        where: { userId },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!wallet) {
        throw new Error('钱包不存在');
      }

      const record = await TransferRecord.create({
        userId,
        fromUserId,
        type,
        amount,
        xiCoins,
        description
      }, { transaction: t });

      const updateFields = {
        availableAmount: sequelize.literal(`available_amount + ${Number(amount)}`),
        version: sequelize.literal('version + 1')
      };

      if (xiCoins > 0) {
        updateFields.xiCoins = sequelize.literal(`xi_coins + ${Number(xiCoins)}`);
      }

      await Wallet.update(updateFields, {
        where: { userId, version: wallet.version },
        transaction: t
      });

      await t.commit();
      logger.info(`Transfer recorded: user ${userId}, type ${type}, amount ${amount}`);
      return record;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  /**
   * Complete a withdrawal (called when admin approves / payment succeeds).
   * Moves funds from frozen to totalWithdrawn.
   */
  async completeWithdrawal(withdrawId) {
    const t = await sequelize.transaction();
    try {
      const record = await WithdrawRecord.findByPk(withdrawId, { transaction: t });
      if (!record) {
        throw new Error('提现记录不存在');
      }

      if (record.status !== 'pending' && record.status !== 'processing') {
        throw new Error('提现记录状态不允许此操作');
      }

      const wallet = await Wallet.findOne({
        where: { userId: record.userId },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!wallet) {
        throw new Error('钱包不存在');
      }

      // Move from frozen to withdrawn
      await Wallet.update(
        {
          frozenAmount: sequelize.literal(`frozen_amount - ${Number(record.amount)}`),
          totalWithdrawn: sequelize.literal(`total_withdrawn + ${Number(record.actualAmount)}`),
          version: sequelize.literal('version + 1')
        },
        {
          where: { userId: record.userId, version: wallet.version },
          transaction: t
        }
      );

      await record.update({ status: 'success', processedAt: new Date() }, { transaction: t });

      await t.commit();
      logger.info(`Withdrawal ${withdrawId} completed for user ${record.userId}`);
      return record;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  /**
   * Reject a withdrawal (called when admin rejects).
   * Moves funds from frozen back to available.
   */
  async rejectWithdrawal(withdrawId, rejectReason) {
    const t = await sequelize.transaction();
    try {
      const record = await WithdrawRecord.findByPk(withdrawId, { transaction: t });
      if (!record) {
        throw new Error('提现记录不存在');
      }

      if (record.status !== 'pending' && record.status !== 'processing') {
        throw new Error('提现记录状态不允许此操作');
      }

      const wallet = await Wallet.findOne({
        where: { userId: record.userId },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!wallet) {
        throw new Error('钱包不存在');
      }

      // Move from frozen back to available
      await Wallet.update(
        {
          frozenAmount: sequelize.literal(`frozen_amount - ${Number(record.amount)}`),
          availableAmount: sequelize.literal(`available_amount + ${Number(record.amount)}`),
          version: sequelize.literal('version + 1')
        },
        {
          where: { userId: record.userId, version: wallet.version },
          transaction: t
        }
      );

      await record.update({
        status: 'rejected',
        rejectReason: rejectReason || '',
        processedAt: new Date()
      }, { transaction: t });

      await t.commit();
      logger.info(`Withdrawal ${withdrawId} rejected for user ${record.userId}`);
      return record;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
};

module.exports = walletService;
