const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invitation = sequelize.define('Invitation', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  inviterId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  inviteeId: {
    type: DataTypes.BIGINT,
    unique: true,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  inviteCode: {
    type: DataTypes.STRING(32),
    allowNull: true
  },
  rewardAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '0-pending, 1-rewarded'
  }
}, {
  tableName: 'invitations',
  underscored: true,
  timestamps: true
});

module.exports = Invitation;
