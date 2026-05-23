const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MatchRecord = sequelize.define('MatchRecord', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  userAId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  userBId: {
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
  matchType: {
    type: DataTypes.ENUM('system', 'manual', 'speed', 'recommend'),
    allowNull: false
  },
  compatibilityScore: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: true,
    comment: 'Compatibility score 0-100'
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted_a', 'accepted_b', 'mutual', 'rejected', 'expired'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'match_records',
  underscored: true,
  timestamps: true
});

module.exports = MatchRecord;
