const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MatchmakerStore = sequelize.define('MatchmakerStore', {
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
  storeName: {
    type: DataTypes.STRING(128),
    allowNull: true
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  province: {
    type: DataTypes.STRING(32),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(32),
    allowNull: true
  },
  contactPhone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  businessLicense: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  photos: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '0-pending, 1-approved, 2-rejected'
  }
}, {
  tableName: 'matchmaker_stores',
  underscored: true,
  timestamps: true
});

module.exports = MatchmakerStore;
