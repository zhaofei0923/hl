const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  orderNo: {
    type: DataTypes.STRING(64),
    unique: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  matchmakerId: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'matchmakers',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('membership', 'manual_match', 'vip_service', 'xi_coin_purchase'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  paidAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  paymentMethod: {
    type: DataTypes.STRING(32),
    allowNull: true,
    comment: 'wechat/alipay/balance'
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'completed', 'cancelled', 'refunded'),
    defaultValue: 'pending'
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  remark: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'orders',
  underscored: true,
  timestamps: true
});

module.exports = Order;
