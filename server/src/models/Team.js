const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Team = sequelize.define('Team', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(64),
    allowNull: false
  },
  leaderId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'matchmakers',
      key: 'id'
    }
  },
  memberCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalPerformance: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  }
}, {
  tableName: 'teams',
  underscored: true,
  timestamps: true
});

module.exports = Team;
