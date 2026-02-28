const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EarningRecord = sequelize.define('EarningRecord', {
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
  type: {
    type: DataTypes.ENUM('share_earning', 'match_earning', 'team_earning', 'lifetime_earning', 'xi_coin_earning'),
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
  sourceOrderId: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'earning_records',
  underscored: true,
  timestamps: true
});

module.exports = EarningRecord;
