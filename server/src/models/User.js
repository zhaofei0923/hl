const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(32),
    unique: true,
    allowNull: true,
    comment: '用户名，用于账号密码登录'
  },
  phone: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: true
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  wechatOpenid: {
    type: DataTypes.STRING(128),
    unique: true,
    allowNull: true
  },
  wechatUnionid: {
    type: DataTypes.STRING(128),
    allowNull: true
  },
  nickname: {
    type: DataTypes.STRING(64),
    allowNull: true
  },
  avatarUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  gender: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '0-unknown, 1-male, 2-female'
  },
  currentRole: {
    type: DataTypes.ENUM('user', 'matchmaker'),
    defaultValue: 'user'
  },
  isVerified: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  certificationStatus: {
    type: DataTypes.ENUM('none', 'pending', 'approved', 'rejected'),
    defaultValue: 'none',
    comment: '实名认证状态'
  },
  profileCompletion: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: 'Profile completion percentage 0-100'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '0-disabled, 1-active'
  },
  isAdmin: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '0-normal user, 1-admin'
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true
});

module.exports = User;
