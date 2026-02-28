const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SalonEvent = sequelize.define('SalonEvent', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  coverImage: {
    type: DataTypes.STRING(500)
  },
  location: {
    type: DataTypes.STRING(200)
  },
  eventDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  maxParticipants: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  currentParticipants: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  organizerId: {
    type: DataTypes.BIGINT,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('upcoming', 'ongoing', 'ended', 'cancelled'),
    defaultValue: 'upcoming'
  }
}, {
  tableName: 'salon_events',
  underscored: true,
  timestamps: true
});

module.exports = SalonEvent;
