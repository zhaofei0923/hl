const { Member, User, UserProfile, Matchmaker, MatchRecord, Wallet, Conversation, Message } = require('../models');
const memberService = require('../services/member.service');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { success, error, paginate } = require('../utils/response');
const logger = require('../utils/logger');

const memberController = {
  /**
   * Get member invite code for sharing
   * GET /api/member/invite-code
   */
  async getInviteCode(req, res, next) {
    try {
      const { userId } = req.user;
      const matchmaker = await Matchmaker.findOne({ where: { userId } });
      if (!matchmaker) {
        return error(res, '红娘信息不存在', 40400, 404);
      }
      const code = `MBR${String(matchmaker.id).padStart(6, '0')}`;
      return success(res, { code, matchmakerId: matchmaker.id });
    } catch (err) {
      next(err);
    }
  },

  /**
   * List members for a matchmaker
   * GET /api/member/list
   */
  async list(req, res, next) {
    try {
      const { userId } = req.user;
      const { page = 1, pageSize = 20, keyword, gender, memberType, status } = req.query;

      // Get matchmaker record
      const matchmaker = await Matchmaker.findOne({ where: { userId } });
      if (!matchmaker) {
        return error(res, '红娘信息不存在', 40400, 404);
      }

      // Build where clause
      const memberWhere = { matchmakerId: matchmaker.id };
      if (memberType) memberWhere.memberType = memberType;
      if (status !== undefined) memberWhere.status = Number(status);

      // Build user include with optional filters
      const userInclude = {
        association: 'user',
        attributes: ['id', 'phone', 'nickname', 'avatarUrl', 'gender'],
        include: [{
          association: 'profile',
          attributes: ['realName', 'age', 'height', 'education', 'occupation', 'province', 'city', 'maritalStatus', 'photos']
        }]
      };

      // Gender filter on user
      if (gender) {
        userInclude.where = { gender: Number(gender) };
      }

      // Keyword search
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

      return paginate(res, {
        list: rows,
        total: count,
        page: Number(page),
        pageSize: Number(pageSize)
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Add a new member
   * POST /api/member/add
   * Supports direct info input (name, phone, gender, age, city)
   * Finds existing user by phone or creates a new one
   */
  async add(req, res, next) {
    try {
      const { userId } = req.user;
      const { name, phone, gender, age, city, memberType = 'no_consumption', serviceLevel = 1, remark } = req.body;

      if (!phone) {
        return error(res, '手机号不能为空', 40001);
      }

      const matchmaker = await Matchmaker.findOne({ where: { userId } });
      if (!matchmaker) {
        return error(res, '红娘信息不存在', 40400, 404);
      }

      // Find or create user by phone
      const [user, isNewUser] = await User.findOrCreate({
        where: { phone },
        defaults: {
          phone,
          nickname: name || phone,
          gender: gender || 0,
          currentRole: 'user',
          status: 1
        }
      });

      // Check if already this matchmaker's member
      const existingMember = await Member.findOne({
        where: { matchmakerId: matchmaker.id, userId: user.id }
      });
      if (existingMember) {
        return error(res, '该用户已是您的会员', 40001);
      }

      // Update nickname if provided and user just created
      if (name && isNewUser) {
        await user.update({ nickname: name, gender: gender || 0 });
      }

      // Create/update profile with age and city if provided
      if (age || city) {
        const [profile, profileCreated] = await UserProfile.findOrCreate({
          where: { userId: user.id },
          defaults: { userId: user.id, age, city }
        });
        if (!profileCreated) {
          const updates = {};
          if (age) updates.age = age;
          if (city) updates.city = city;
          await profile.update(updates);
        }
      }

      // Ensure wallet exists for new user
      if (isNewUser) {
        await Wallet.findOrCreate({
          where: { userId: user.id },
          defaults: { userId: user.id, availableAmount: 0, frozenAmount: 0, totalEarned: 0, totalWithdrawn: 0, xiCoins: 0 }
        });
      }

      // Create member record
      const member = await Member.create({
        matchmakerId: matchmaker.id,
        userId: user.id,
        memberType,
        serviceLevel,
        remark
      });

      logger.info(`Matchmaker ${matchmaker.id} added member userId=${user.id} (new=${isNewUser})`);

      return success(res, {
        member,
        user: { id: user.id, nickname: user.nickname, phone: user.phone, gender: user.gender },
        isNewUser
      }, '会员添加成功');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Search members by keyword and filters
   * GET /api/member/search
   */
  async search(req, res, next) {
    try {
      const { userId } = req.user;
      const { keyword, gender, page = 1, pageSize = 20 } = req.query;

      const matchmaker = await Matchmaker.findOne({ where: { userId } });
      if (!matchmaker) {
        return error(res, '红娘信息不存在', 40400, 404);
      }

      const result = await memberService.getMembersByMatchmaker(matchmaker.id, {
        keyword,
        gender,
        page,
        pageSize
      });

      return paginate(res, {
        list: result.list,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get member statistics for the current matchmaker
   * GET /api/member/stats
   */
  async getStats(req, res, next) {
    try {
      const { userId } = req.user;

      const matchmaker = await Matchmaker.findOne({ where: { userId } });
      if (!matchmaker) {
        return error(res, '红娘信息不存在', 40400, 404);
      }

      const stats = await memberService.getMemberStats(matchmaker.id);

      return success(res, stats);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get member detail
   * GET /api/member/:id
   */
  async getDetail(req, res, next) {
    try {
      const { id } = req.params;
      const { userId } = req.user;

      const matchmaker = await Matchmaker.findOne({ where: { userId } });
      if (!matchmaker) {
        return error(res, '红娘信息不存在', 40400, 404);
      }

      const member = await Member.findOne({
        where: { id, matchmakerId: matchmaker.id },
        include: [{
          association: 'user',
          attributes: { exclude: ['passwordHash'] },
          include: [{ association: 'profile' }]
        }]
      });

      if (!member) {
        return error(res, '会员不存在', 40400, 404);
      }

      return success(res, member);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update member profile (matchmaker edits member info)
   * PUT /api/member/:id/profile
   */
  async updateProfile(req, res, next) {
    try {
      const { id } = req.params;
      const { userId } = req.user;

      const matchmaker = await Matchmaker.findOne({ where: { userId } });
      if (!matchmaker) {
        return error(res, '红娘信息不存在', 40400, 404);
      }

      const member = await Member.findOne({
        where: { id, matchmakerId: matchmaker.id }
      });

      if (!member) {
        return error(res, '会员不存在', 40400, 404);
      }

      // Update or create the member's user profile
      const profileData = req.body;
      const [profile, created] = await UserProfile.findOrCreate({
        where: { userId: member.userId },
        defaults: { userId: member.userId, ...profileData }
      });

      if (!created) {
        await profile.update(profileData);
      }

      return success(res, profile, '资料更新成功');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update member rights/type
   * PUT /api/member/:id/rights
   */
  async updateRights(req, res, next) {
    try {
      const { id } = req.params;
      const { userId } = req.user;
      const { memberType, serviceLevel, expireAt, remark } = req.body;

      const matchmaker = await Matchmaker.findOne({ where: { userId } });
      if (!matchmaker) {
        return error(res, '红娘信息不存在', 40400, 404);
      }

      const member = await Member.findOne({
        where: { id, matchmakerId: matchmaker.id }
      });

      if (!member) {
        return error(res, '会员不存在', 40400, 404);
      }

      const updateData = {};
      if (memberType !== undefined) updateData.memberType = memberType;
      if (serviceLevel !== undefined) updateData.serviceLevel = serviceLevel;
      if (expireAt !== undefined) updateData.expireAt = expireAt;
      if (remark !== undefined) updateData.remark = remark;

      await member.update(updateData);

      return success(res, member, '权益更新成功');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Speed match - create a speed match request for a member
   * POST /api/member/:id/speed-match
   */
  async speedMatch(req, res, next) {
    try {
      const { userId } = req.user;
      const memberId = req.params.id;
      const { targetMemberId, compatibilityScore } = req.body || {};

      const matchmaker = await Matchmaker.findOne({ where: { userId } });
      if (!matchmaker) {
        return error(res, '红娘信息不存在', 40400, 404);
      }

      // Verify the member belongs to this matchmaker
      const member = await Member.findOne({
        where: { id: memberId, matchmakerId: matchmaker.id }
      });
      if (!member) {
        return error(res, '会员不存在', 40400, 404);
      }

      const userAId = member.userId;

      // If a target member is specified, create a direct match
      if (targetMemberId) {
        const targetMember = await Member.findOne({
          where: { id: targetMemberId, matchmakerId: matchmaker.id }
        });
        if (!targetMember) {
          return error(res, '目标会员不存在', 40400, 404);
        }
        if (userAId === targetMember.userId) {
          return error(res, '不能与自己匹配', 40001);
        }

        const matchRecord = await MatchRecord.create({
          userAId,
          userBId: targetMember.userId,
          matchmakerId: matchmaker.id,
          matchType: 'speed',
          compatibilityScore: compatibilityScore || null,
          status: 'pending'
        });
        return success(res, matchRecord, '速配创建成功');
      }

      // No target specified - create a speed match request (pending match)
      const matchRecord = await MatchRecord.create({
        userAId,
        userBId: null,
        matchmakerId: matchmaker.id,
        matchType: 'speed',
        compatibilityScore: null,
        status: 'pending'
      });

      return success(res, matchRecord, '已发起速配');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Send greeting message from matchmaker to member
   * POST /api/member/:id/greet
   */
  async greet(req, res, next) {
    try {
      const { id } = req.params;
      const { userId } = req.user;
      const { content } = req.body;

      if (!content) {
        return error(res, '消息内容不能为空', 40001);
      }

      const matchmaker = await Matchmaker.findOne({ where: { userId } });
      if (!matchmaker) {
        return error(res, '红娘信息不存在', 40400, 404);
      }

      const member = await Member.findOne({
        where: { id, matchmakerId: matchmaker.id }
      });

      if (!member) {
        return error(res, '会员不存在', 40400, 404);
      }

      // Find or create conversation
      const senderId = userId;
      const receiverId = member.userId;
      const [userAId, userBId] = senderId < receiverId
        ? [senderId, receiverId]
        : [receiverId, senderId];

      const [conversation] = await Conversation.findOrCreate({
        where: { userAId, userBId },
        defaults: { type: 'service', userAId, userBId }
      });

      // Create message
      const message = await Message.create({
        conversationId: conversation.id,
        senderId,
        receiverId,
        contentType: 'text',
        content
      });

      // Update conversation
      await conversation.update({
        lastMessageId: message.id,
        lastMessageAt: new Date()
      });

      return success(res, message, '消息发送成功');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Recommend - cross-matchmaker speed match
   * POST /api/member/recommend
   * Body: { myMemberId, resourceMemberId, note }
   * Allows a matchmaker to recommend one of their own members
   * to interact with a member from another matchmaker (resource)
   */
  async recommend(req, res, next) {
    try {
      const { userId } = req.user;
      const { myMemberId, resourceUserId, note } = req.body;

      if (!myMemberId || !resourceUserId) {
        return error(res, '请选择要推荐的会员和目标资源', 40001);
      }

      const matchmaker = await Matchmaker.findOne({ where: { userId } });
      if (!matchmaker) {
        return error(res, '红娘信息不存在', 40400, 404);
      }

      // Verify myMember belongs to this matchmaker
      const myMember = await Member.findOne({
        where: { id: myMemberId, matchmakerId: matchmaker.id },
        include: [{ association: 'user', attributes: ['id', 'nickname'] }]
      });
      if (!myMember) {
        return error(res, '请选择您自己的会员', 40001);
      }

      // Prevent self-match
      if (myMember.userId === resourceUserId) {
        return error(res, '不能推荐会员与自己互动', 40001);
      }

      // Create cross-matchmaker match record
      const [userAId, userBId] = myMember.userId < resourceUserId
        ? [myMember.userId, resourceUserId]
        : [resourceUserId, myMember.userId];

      const matchRecord = await MatchRecord.create({
        userAId,
        userBId,
        matchmakerId: matchmaker.id,
        matchType: 'recommend',
        status: 'pending'
      });

      // Send notification message to both parties
      const intro = note || `您好！红娘为您推荐了一位优质${myMember.user?.nickname || '会员'}，希望你们有缘分！`;

      // Notify resource user
      const [conv] = await Conversation.findOrCreate({
        where: {
          userAId: Math.min(userId, resourceUserId),
          userBId: Math.max(userId, resourceUserId)
        },
        defaults: {
          userAId: Math.min(userId, resourceUserId),
          userBId: Math.max(userId, resourceUserId),
          type: 'service'
        }
      });

      const msg = await Message.create({
        conversationId: conv.id,
        senderId: userId,
        receiverId: resourceUserId,
        contentType: 'text',
        content: intro
      });

      await conv.update({ lastMessageId: msg.id, lastMessageAt: new Date() });

      logger.info(`Matchmaker ${matchmaker.id} recommended member ${myMemberId} to user ${resourceUserId}`);

      return success(res, { matchRecord, message: msg }, '互推成功，已通知对方');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = memberController;
