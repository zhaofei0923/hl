const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SalonRegistration = sequelize.define('SalonRegistration', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  eventId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'salon_events',
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
  status: {
    type: DataTypes.ENUM('registered', 'attended', 'cancelled'),
    defaultValue: 'registered'
  }
}, {
  tableName: 'salon_registrations',
  underscored: true,
  timestamps: true
});

module.exports = SalonRegistration;
