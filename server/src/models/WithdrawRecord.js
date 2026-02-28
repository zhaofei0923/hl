const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WithdrawRecord = sequelize.define('WithdrawRecord', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  fee: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  actualAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  withdrawTo: {
    type: DataTypes.ENUM('wechat', 'alipay', 'bank'),
    allowNull: false
  },
  accountInfo: {
    type: DataTypes.JSON,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'success', 'failed', 'rejected'),
    defaultValue: 'pending'
  },
  rejectReason: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'withdraw_records',
  underscored: true,
  timestamps: true
});

module.exports = WithdrawRecord;
