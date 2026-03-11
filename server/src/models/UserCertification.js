const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserCertification = sequelize.define('UserCertification', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.BIGINT,
    unique: true,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  realName: {
    type: DataTypes.STRING(32),
    allowNull: true,
    comment: '真实姓名'
  },
  idCard: {
    type: DataTypes.STRING(18),
    allowNull: true,
    comment: '身份证号'
  },
  idFrontPhoto: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '身份证正面（人像面）'
  },
  idBackPhoto: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '身份证反面（国徽面）'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    comment: '审核状态'
  },
  rejectReason: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '拒绝原因'
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '提交时间'
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '审核时间'
  },
  reviewerId: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '审核管理员 user_id'
  }
}, {
  tableName: 'user_certifications',
  underscored: true,
  timestamps: true
});

module.exports = UserCertification;
