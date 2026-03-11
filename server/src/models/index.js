const sequelize = require('../config/database');
const User = require('./User');
const UserProfile = require('./UserProfile');
const UserCertification = require('./UserCertification');
const SmsCode = require('./SmsCode');
const Matchmaker = require('./Matchmaker');
const MatchmakerStore = require('./MatchmakerStore');
const Team = require('./Team');
const Member = require('./Member');
const Wallet = require('./Wallet');
const EarningRecord = require('./EarningRecord');
const WithdrawRecord = require('./WithdrawRecord');
const TransferRecord = require('./TransferRecord');
const Order = require('./Order');
const Conversation = require('./Conversation');
const Message = require('./Message');
const MatchRecord = require('./MatchRecord');
const Invitation = require('./Invitation');
const SalonEvent = require('./SalonEvent');
const SalonRegistration = require('./SalonRegistration');

// ==================== Associations ====================

// User <-> UserProfile (one-to-one)
User.hasOne(UserProfile, { foreignKey: 'userId', as: 'profile' });
UserProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> UserCertification (one-to-one)
User.hasOne(UserCertification, { foreignKey: 'userId', as: 'certification' });
UserCertification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Matchmaker (one-to-one)
User.hasOne(Matchmaker, { foreignKey: 'userId', as: 'matchmaker' });
Matchmaker.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Wallet (one-to-one)
User.hasOne(Wallet, { foreignKey: 'userId', as: 'wallet' });
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Matchmaker <-> MatchmakerStore (one-to-one)
Matchmaker.hasOne(MatchmakerStore, { foreignKey: 'matchmakerId', as: 'store' });
MatchmakerStore.belongsTo(Matchmaker, { foreignKey: 'matchmakerId', as: 'matchmaker' });

// Matchmaker <-> Team (many-to-one)
Team.hasMany(Matchmaker, { foreignKey: 'teamId', as: 'members' });
Matchmaker.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// Team <-> Matchmaker (leader)
Team.belongsTo(Matchmaker, { foreignKey: 'leaderId', as: 'leader' });

// Matchmaker parent-child hierarchy
Matchmaker.hasMany(Matchmaker, { foreignKey: 'parentId', as: 'children' });
Matchmaker.belongsTo(Matchmaker, { foreignKey: 'parentId', as: 'parent' });

// Matchmaker <-> Member (one-to-many)
Matchmaker.hasMany(Member, { foreignKey: 'matchmakerId', as: 'memberList' });
Member.belongsTo(Matchmaker, { foreignKey: 'matchmakerId', as: 'matchmaker' });

// User <-> Member (one-to-many)
User.hasMany(Member, { foreignKey: 'userId', as: 'memberships' });
Member.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> EarningRecord (one-to-many)
User.hasMany(EarningRecord, { foreignKey: 'userId', as: 'earnings' });
EarningRecord.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> WithdrawRecord (one-to-many)
User.hasMany(WithdrawRecord, { foreignKey: 'userId', as: 'withdrawals' });
WithdrawRecord.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> TransferRecord (one-to-many)
User.hasMany(TransferRecord, { foreignKey: 'userId', as: 'transfers' });
TransferRecord.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Order (one-to-many)
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Matchmaker <-> Order (one-to-many)
Matchmaker.hasMany(Order, { foreignKey: 'matchmakerId', as: 'orders' });
Order.belongsTo(Matchmaker, { foreignKey: 'matchmakerId', as: 'matchmaker' });

// Conversation <-> Message (one-to-many)
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

// User <-> Conversation
User.hasMany(Conversation, { foreignKey: 'userAId', as: 'conversationsAsA' });
User.hasMany(Conversation, { foreignKey: 'userBId', as: 'conversationsAsB' });
Conversation.belongsTo(User, { foreignKey: 'userAId', as: 'userA' });
Conversation.belongsTo(User, { foreignKey: 'userBId', as: 'userB' });

// User <-> Message
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// MatchRecord associations
User.hasMany(MatchRecord, { foreignKey: 'userAId', as: 'matchRecordsAsA' });
User.hasMany(MatchRecord, { foreignKey: 'userBId', as: 'matchRecordsAsB' });
MatchRecord.belongsTo(User, { foreignKey: 'userAId', as: 'userA' });
MatchRecord.belongsTo(User, { foreignKey: 'userBId', as: 'userB' });
Matchmaker.hasMany(MatchRecord, { foreignKey: 'matchmakerId', as: 'matchRecords' });
MatchRecord.belongsTo(Matchmaker, { foreignKey: 'matchmakerId', as: 'matchmaker' });

// Invitation associations
User.hasMany(Invitation, { foreignKey: 'inviterId', as: 'invitationsSent' });
User.hasOne(Invitation, { foreignKey: 'inviteeId', as: 'invitationReceived' });
Invitation.belongsTo(User, { foreignKey: 'inviterId', as: 'inviter' });
Invitation.belongsTo(User, { foreignKey: 'inviteeId', as: 'invitee' });

// SalonEvent <-> User (organizer)
SalonEvent.belongsTo(User, { as: 'organizer', foreignKey: 'organizerId' });
User.hasMany(SalonEvent, { as: 'organizedEvents', foreignKey: 'organizerId' });

// SalonEvent <-> SalonRegistration (one-to-many)
SalonEvent.hasMany(SalonRegistration, { as: 'registrations', foreignKey: 'eventId' });
SalonRegistration.belongsTo(SalonEvent, { as: 'event', foreignKey: 'eventId' });

// SalonRegistration <-> User (many-to-one)
SalonRegistration.belongsTo(User, { as: 'user', foreignKey: 'userId' });
User.hasMany(SalonRegistration, { as: 'salonRegistrations', foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  UserProfile,
  UserCertification,
  SmsCode,
  Matchmaker,
  MatchmakerStore,
  Team,
  Member,
  Wallet,
  EarningRecord,
  WithdrawRecord,
  TransferRecord,
  Order,
  Conversation,
  Message,
  MatchRecord,
  Invitation,
  SalonEvent,
  SalonRegistration
};
