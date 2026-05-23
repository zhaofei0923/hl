/**
 * Member service - handles member management operations
 */
const { Op } = require('sequelize');
const { Member, User, UserProfile, Matchmaker, MatchRecord, Conversation, Message } = require('../models');
const logger = require('../utils/logger');

const memberService = {
  /**
   * List members belonging to a matchmaker with filtering, keyword search, and pagination.
   * Supports filters: memberType, status, gender (on user), keyword (nickname/phone).
   */
  async getMembersByMatchmaker(matchmakerId, filters = {}) {
    const { page = 1, pageSize = 20, memberType, status, gender, keyword } = filters;

    const memberWhere = { matchmakerId };
    if (memberType) memberWhere.memberType = memberType;
    if (status !== undefined) memberWhere.status = Number(status);

    // Build user include with optional gender/keyword filters
    const userInclude = {
      association: 'user',
      attributes: ['id', 'phone', 'nickname', 'avatarUrl', 'gender'],
      include: [{
        association: 'profile',
        attributes: [
          'realName', 'age', 'height', 'education', 'occupation', 'incomeRange',
          'province', 'city', 'nativePlace', 'maritalStatus', 'houseStatus',
          'carStatus', 'selfIntro', 'partnerRequirement', 'photos'
        ]
      }]
    };

    if (gender) {
      userInclude.where = { gender: Number(gender) };
    }

    if (keyword) {
      userInclude.where = {
        ...userInclude.where,
        [Op.or]: [
          { nickname: { [Op.like]: `%${keyword}%` } },
          { phone: { [Op.like]: `%${keyword}%` } }
        ]
      };
    }

    const { count, rows } = await Member.findAndCountAll({
      where: memberWhere,
      include: [userInclude],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['created_at', 'DESC']],
      distinct: true
    });

    return { total: count, list: rows, page: Number(page), pageSize: Number(pageSize) };
  },

  /**
   * Get a single member by ID with user and profile data
   */
  async getMemberById(id) {
    return Member.findByPk(id, {
      include: [
        {
          association: 'user',
          attributes: { exclude: ['passwordHash'] },
          include: [{ association: 'profile' }]
        }
      ]
    });
  },

  /**
   * Get member detail with ownership check (must belong to the matchmaker)
   */
  async getMemberDetail(id, matchmakerId) {
    return Member.findOne({
      where: { id, matchmakerId },
      include: [{
        association: 'user',
        attributes: { exclude: ['passwordHash'] },
        include: [{ association: 'profile' }]
      }]
    });
  },

  /**
   * Create a new member record linking a user to a matchmaker
   */
  async createMember(data) {
    const { matchmakerId, userId } = data;

    // Check for duplicate membership
    const existing = await Member.findOne({
      where: { matchmakerId, userId }
    });

    if (existing) {
      throw new Error('该用户已是您的会员');
    }

    // Verify user exists
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const member = await Member.create({
      matchmakerId,
      userId,
      memberType: data.memberType || 'free',
      serviceLevel: data.serviceLevel || null,
      expireAt: data.expireAt || null,
      remark: data.remark || null,
      status: 1
    });

    logger.info(`Member created: ${member.id}, user ${userId} -> matchmaker ${matchmakerId}`);
    return member;
  },

  /**
   * Update a member record. Returns null if not found.
   */
  async updateMember(id, data) {
    const member = await Member.findByPk(id);
    if (!member) return null;

    await member.update(data);
    logger.info(`Member ${id} updated`);
    return member;
  },

  /**
   * Update a member's user profile (matchmaker editing member info).
   * Enforces ownership: the member must belong to the given matchmaker.
   */
  async updateMemberProfile(memberId, matchmakerId, profileData) {
    const member = await Member.findOne({
      where: { id: memberId, matchmakerId }
    });

    if (!member) return null;

    const [profile, created] = await UserProfile.findOrCreate({
      where: { userId: member.userId },
      defaults: { userId: member.userId, ...profileData }
    });

    if (!created) {
      await profile.update(profileData);
    }

    logger.info(`Member ${memberId} profile ${created ? 'created' : 'updated'} by matchmaker ${matchmakerId}`);
    return profile;
  },

  /**
   * Update member rights/type (memberType, serviceLevel, expireAt, remark).
   * Enforces ownership: the member must belong to the given matchmaker.
   */
  async updateMemberRights(id, matchmakerId, data) {
    const member = await Member.findOne({
      where: { id, matchmakerId }
    });

    if (!member) return null;

    const updateData = {};
    if (data.memberType !== undefined) updateData.memberType = data.memberType;
    if (data.serviceLevel !== undefined) updateData.serviceLevel = data.serviceLevel;
    if (data.expireAt !== undefined) updateData.expireAt = data.expireAt;
    if (data.remark !== undefined) updateData.remark = data.remark;

    await member.update(updateData);
    logger.info(`Member ${id} rights updated by matchmaker ${matchmakerId}`);
    return member;
  },

  /**
   * Remove a member (set status to inactive).
   * Enforces ownership.
   */
  async deleteMember(id, matchmakerId) {
    const member = await Member.findOne({
      where: { id, matchmakerId }
    });

    if (!member) return null;

    await member.update({ status: 0 });
    logger.info(`Member ${id} deactivated by matchmaker ${matchmakerId}`);
    return member;
  },

  /**
   * Speed match: create a match record between two members of the same matchmaker.
   * Validates both users are members of the given matchmaker.
   */
  async speedMatch(matchmakerId, userAId, userBId, compatibilityScore) {
    if (userAId === userBId) {
      throw new Error('不能与自己匹配');
    }

    // Verify both users belong to this matchmaker
    const memberA = await Member.findOne({
      where: { matchmakerId, userId: userAId }
    });
    const memberB = await Member.findOne({
      where: { matchmakerId, userId: userBId }
    });

    if (!memberA || !memberB) {
      throw new Error('匹配对象必须是您的会员');
    }

    const matchRecord = await MatchRecord.create({
      userAId,
      userBId,
      matchmakerId,
      matchType: 'speed',
      compatibilityScore: compatibilityScore || null,
      status: 'pending'
    });

    logger.info(`Speed match created: ${matchRecord.id}, users ${userAId} <-> ${userBId} by matchmaker ${matchmakerId}`);
    return matchRecord;
  },

  /**
   * Send a greeting message from matchmaker to a member.
   * Creates/reuses a conversation and inserts a message.
   * Enforces that the member belongs to the matchmaker.
   */
  async sendGreeting(senderId, memberId, matchmakerId, content) {
    const member = await Member.findOne({
      where: { id: memberId, matchmakerId }
    });

    if (!member) {
      throw new Error('会员不存在');
    }

    const receiverId = member.userId;

    // Conversation ordering: smaller ID is always userA
    const [userAId, userBId] = senderId < receiverId
      ? [senderId, receiverId]
      : [receiverId, senderId];

    const [conversation] = await Conversation.findOrCreate({
      where: { userAId, userBId },
      defaults: { type: 'service', userAId, userBId }
    });

    const message = await Message.create({
      conversationId: conversation.id,
      senderId,
      receiverId,
      contentType: 'text',
      content
    });

    // Update conversation with latest message
    await conversation.update({
      lastMessageId: message.id,
      lastMessageAt: new Date()
    });

    logger.info(`Greeting sent from user ${senderId} to member ${memberId}`);
    return message;
  },

  /**
   * Get match records for a matchmaker with pagination
   */
  async getMatchRecords(matchmakerId, { page = 1, pageSize = 20, status } = {}) {
    const where = { matchmakerId };
    if (status) where.status = status;

    const { count, rows } = await MatchRecord.findAndCountAll({
      where,
      include: [
        { association: 'userA', attributes: ['id', 'nickname', 'avatarUrl', 'gender'] },
        { association: 'userB', attributes: ['id', 'nickname', 'avatarUrl', 'gender'] }
      ],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['created_at', 'DESC']]
    });

    return { total: count, list: rows, page: Number(page), pageSize: Number(pageSize) };
  },

  /**
   * Count members by type for a given matchmaker
   */
  async getMemberStats(matchmakerId) {
    const total = await Member.count({ where: { matchmakerId, status: 1 } });

    const byType = await Member.findAll({
      attributes: [
        'memberType',
        [Member.sequelize.fn('COUNT', Member.sequelize.col('id')), 'count']
      ],
      where: { matchmakerId, status: 1 },
      group: ['memberType'],
      raw: true
    });

    return { total, byType };
  }
};

module.exports = memberService;
