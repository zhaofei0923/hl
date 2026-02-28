const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SmsCode = sequelize.define('SmsCode', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(6),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('login', 'register', 'reset_password', 'bind_phone'),
    allowNull: false
  },
  isUsed: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'sms_codes',
  underscored: true,
  timestamps: true
});

module.exports = SmsCode;
