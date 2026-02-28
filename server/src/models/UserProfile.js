const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserProfile = sequelize.define('UserProfile', {
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
  realName: {
    type: DataTypes.STRING(32),
    allowNull: true
  },
  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  age: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: true
  },
  height: {
    type: DataTypes.SMALLINT,
    allowNull: true,
    comment: 'Height in cm'
  },
  weight: {
    type: DataTypes.SMALLINT,
    allowNull: true,
    comment: 'Weight in kg'
  },
  education: {
    type: DataTypes.STRING(32),
    allowNull: true
  },
  occupation: {
    type: DataTypes.STRING(64),
    allowNull: true
  },
  incomeRange: {
    type: DataTypes.STRING(32),
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
  district: {
    type: DataTypes.STRING(32),
    allowNull: true
  },
  nativePlace: {
    type: DataTypes.STRING(64),
    allowNull: true,
    comment: 'Hometown'
  },
  maritalStatus: {
    type: DataTypes.STRING(16),
    allowNull: true,
    comment: 'unmarried/divorced/widowed'
  },
  hasChildren: {
    type: DataTypes.TINYINT,
    allowNull: true,
    comment: '0-no, 1-yes'
  },
  wantChildren: {
    type: DataTypes.TINYINT,
    allowNull: true,
    comment: '0-no, 1-yes'
  },
  houseStatus: {
    type: DataTypes.STRING(32),
    allowNull: true
  },
  carStatus: {
    type: DataTypes.STRING(32),
    allowNull: true
  },
  smoking: {
    type: DataTypes.STRING(16),
    allowNull: true
  },
  drinking: {
    type: DataTypes.STRING(16),
    allowNull: true
  },
  selfIntro: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  partnerRequirement: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  photos: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  }
}, {
  tableName: 'user_profiles',
  underscored: true,
  timestamps: true
});

module.exports = UserProfile;
