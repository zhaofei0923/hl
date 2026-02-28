const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Member = sequelize.define('Member', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  matchmakerId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'matchmakers',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  memberType: {
    type: DataTypes.ENUM('free', 'member', 'manual_match', 'no_consumption'),
    defaultValue: 'free'
  },
  serviceLevel: {
    type: DataTypes.STRING(32),
    allowNull: true
  },
  expireAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '0-inactive, 1-active'
  }
}, {
  tableName: 'members',
  underscored: true,
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['matchmaker_id', 'user_id']
    }
  ]
});

module.exports = Member;
