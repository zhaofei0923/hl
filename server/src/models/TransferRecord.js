const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TransferRecord = sequelize.define('TransferRecord', {
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
  fromUserId: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('recharge', 'transfer', 'reward', 'refund'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  xiCoins: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'transfer_records',
  underscored: true,
  timestamps: true
});

module.exports = TransferRecord;
