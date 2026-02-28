const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Wallet = sequelize.define('Wallet', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.BIGINT,
    unique: true,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  availableAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  frozenAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  totalEarned: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  totalWithdrawn: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  xiCoins: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Xi coin balance'
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Optimistic lock version'
  }
}, {
  tableName: 'wallets',
  underscored: true,
  timestamps: true
});

module.exports = Wallet;
