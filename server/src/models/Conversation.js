const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('private', 'system', 'service'),
    defaultValue: 'private'
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
  lastMessageId: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'conversations',
  underscored: true,
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user_a_id', 'user_b_id']
    }
  ]
});

module.exports = Conversation;
