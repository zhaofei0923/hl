const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Matchmaker = sequelize.define('Matchmaker', {
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
  matchmakerNo: {
    type: DataTypes.STRING(32),
    unique: true,
    allowNull: true
  },
  level: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: 'Matchmaker level 1-5'
  },
  parentId: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'matchmakers',
      key: 'id'
    },
    comment: 'Parent matchmaker ID for hierarchy'
  },
  teamId: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  hasStore: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  certificationStatus: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '0-uncertified, 1-pending, 2-certified, 3-rejected'
  },
  totalPerformance: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '0-disabled, 1-active'
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'matchmakers',
  underscored: true,
  timestamps: true,
  paranoid: true
});

module.exports = Matchmaker;
