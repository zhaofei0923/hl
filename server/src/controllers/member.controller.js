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
          attributes: ['realName', 'age', 'height', 'education', 'occupation', 'incomeRange', 'province', 'city', 'nativePlace', 'maritalStatus', 'photos']
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

      // Flatten nested user/profile data for frontend consumption
      const flatList = rows.map(row => {
        const m = row.toJSON();
        const user = m.user || {};
        const profile = user.profile || {};
        return {
          ...m,
          // User fields
          nickname: user.nickname,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          gender: user.gender,
          isVerified: user.isVerified,
          // Profile fields
          realName: profile.realName,
          age: profile.age,
          height: profile.height,
          education: profile.education,
          occupation: profile.occupation,
          incomeRange: profile.incomeRange,
          city: profile.city,
          province: profile.province,
          nativePlace: profile.nativePlace,
          maritalStatus: profile.maritalStatus,
          houseStatus: profile.houseStatus,
          carStatus: profile.carStatus,
          selfIntro: profile.selfIntro,
          partnerRequirement: profile.partnerRequirement,
          photos: profile.photos,
        };
      });

      return paginate(res, {
        list: flatList,
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
   * Manually add a member with full profile information
   * POST /api/member/add-manual
   */
  async addManual(req, res, next) {
    try {
      const { userId } = req.user;
      const {
        phone, realName, gender, age, constellation,
        height, education, city, nativePlace, occupation,
        incomeRange, maritalStatus, houseStatus, carStatus,
        familySituation, selfIntro, partnerRequirement,
        memberType = 'no_consumption', serviceLevel = 1, remark,
        photos
      } = req.body;

      if (!phone) {
        return error(res, '手机号不能为空', 40001);
      }

      const matchmaker = await Matchmaker.findOne({ where: { userId } });
      if (!matchmaker) {
        return error(res, '红娘信息不存在', 40400, 404);
      }

      const [user, isNewUser] = await User.findOrCreate({
        where: { phone },
        defaults: {
          phone,
          nickname: realName,
          gender: Number(gender),
          currentRole: 'user',
          status: 1
        }
      });

      if (!isNewUser) {
        // Update nickname and gender for existing user if missing
        const updates = {};
        if (!user.nickname || user.nickname === user.phone) updates.nickname = realName;
        if (!user.gender) updates.gender = Number(gender);
        if (Object.keys(updates).length) await user.update(updates);
      }

      const existingMember = await Member.findOne({
        where: { matchmakerId: matchmaker.id, userId: user.id }
      });

      // Build self intro combining family situation
      const fullSelfIntro = [
        familySituation ? `【家庭情况】${familySituation}` : null,
        selfIntro ? `【自我介绍】${selfIntro}` : null
      ].filter(Boolean).join('\n\n') || selfIntro || null;

      // Upsert profile
      const profileData = {
        realName: realName || null,
        age: age ? Number(age) : null,
        height: height ? Number(height) : null,
        education: education || null,
        city: city || null,
        nativePlace: nativePlace || null,
        occupation: occupation || null,
        incomeRange: incomeRange || null,
        maritalStatus: maritalStatus || null,
        houseStatus: houseStatus || null,
        carStatus: carStatus || null,
        selfIntro: fullSelfIntro,
        partnerRequirement: partnerRequirement || null
      };
      if (Array.isArray(photos)) {
        profileData.photos = photos;
      }

      const [profile, profileCreated] = await UserProfile.findOrCreate({
        where: { userId: user.id },
        defaults: { userId: user.id, ...profileData }
      });

      if (!profileCreated) {
        // Only update fields that have values (don't overwrite existing data with null)
        const updateFields = {};
        for (const [key, val] of Object.entries(profileData)) {
          if (val !== null && val !== undefined) {
            updateFields[key] = val;
          }
        }
        if (Object.keys(updateFields).length) {
          await profile.update(updateFields);
        }
      }

      // Always update user nickname to realName if realName is provided
      if (realName) {
        await user.update({ nickname: realName, gender: Number(gender) });
      }

      if (isNewUser) {
        await Wallet.findOrCreate({
          where: { userId: user.id },
          defaults: { userId: user.id, availableAmount: 0, frozenAmount: 0, totalEarned: 0, totalWithdrawn: 0, xiCoins: 0 }
        });
      }

      const memberRemark = [
        constellation ? `星座：${constellation}` : null,
        remark || null
      ].filter(Boolean).join(' | ') || null;

      let member;
      if (existingMember) {
        // Update existing member record
        const memberUpdates = {};
        if (memberType) memberUpdates.memberType = memberType;
        if (memberRemark) memberUpdates.remark = memberRemark;
        if (Object.keys(memberUpdates).length) {
          await existingMember.update(memberUpdates);
        }
        member = existingMember;
      } else {
        member = await Member.create({
          matchmakerId: matchmaker.id,
          userId: user.id,
          memberType,
          serviceLevel,
          remark: memberRemark
        });
      }

      logger.info(`Matchmaker ${matchmaker.id} manually added/updated member userId=${user.id} (new=${isNewUser}, existingMember=${!!existingMember})`);

      return success(res, {
        member,
        user: { id: user.id, nickname: user.nickname, phone: user.phone, gender: user.gender },
        isNewUser
      }, '会员录入成功');
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

      const memberRow = await Member.findOne({
        where: { id, matchmakerId: matchmaker.id },
        include: [{
          association: 'user',
          attributes: { exclude: ['passwordHash'] },
          include: [{ association: 'profile' }]
        }]
      });

      if (!memberRow) {
        return error(res, '会员不存在', 40400, 404);
      }

      // Flatten nested user/profile data
      const m = memberRow.toJSON();
      const user = m.user || {};
      const profile = user.profile || {};
      const flatMember = {
        ...m,
        nickname: user.nickname,
        realName: profile.realName,
        name: profile.realName || user.nickname,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        gender: user.gender,
        isVerified: user.isVerified,
        birthDate: profile.birthDate,
        age: profile.age,
        height: profile.height,
        weight: profile.weight,
        education: profile.education,
        occupation: profile.occupation,
        income: profile.incomeRange,
        incomeRange: profile.incomeRange,
        city: profile.city,
        province: profile.province,
        nativePlace: profile.nativePlace,
        hometown: profile.nativePlace,
        maritalStatus: profile.maritalStatus,
        houseStatus: profile.houseStatus,
        carStatus: profile.carStatus,
        selfIntro: profile.selfIntro,
        partnerRequirement: profile.partnerRequirement,
        photos: profile.photos,
        tags: profile.tags,
      };

      return success(res, flatMember);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Upload a photo for a member
   * POST /api/member/upload-photo
   */
  async uploadPhoto(req, res, next) {
    try {
      if (!req.file) {
        return error(res, '请选择要上传的图片', 40001);
      }
      const photoUrl = `/uploads/photos/${req.file.filename}`;
      return success(res, { url: photoUrl }, '上传成功');
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

      const {
        realName, gender, constellation, memberType, remark: memberRemark,
        ...profileData
      } = req.body;

      // Update user-level fields
      if (realName !== undefined || gender !== undefined) {
        const user = await User.findByPk(member.userId);
        if (user) {
          const userUpdates = {};
          if (realName !== undefined) { userUpdates.nickname = realName; }
          if (gender !== undefined) { userUpdates.gender = Number(gender); }
          if (Object.keys(userUpdates).length) await user.update(userUpdates);
        }
      }

      // Include realName in profile data
      if (realName !== undefined) profileData.realName = realName;

      // Update or create the member's user profile
      const [profile, created] = await UserProfile.findOrCreate({
        where: { userId: member.userId },
        defaults: { userId: member.userId, ...profileData }
      });

      if (!created) {
        await profile.update(profileData);
      }

      // Update member-level fields (constellation in remark, memberType)
      const memberUpdates = {};
      if (memberType !== undefined) memberUpdates.memberType = memberType;
      // Build remark with constellation
      const remarkParts = [];
      if (constellation) remarkParts.push(`星座：${constellation}`);
      if (memberRemark) remarkParts.push(memberRemark);
      if (remarkParts.length) {
        memberUpdates.remark = remarkParts.join(' | ');
      } else if (constellation === '' || memberRemark === '') {
        // Explicitly clearing
        memberUpdates.remark = remarkParts.join(' | ') || null;
      }
      if (Object.keys(memberUpdates).length) {
        await member.update(memberUpdates);
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
  },

  /**
   * Delete a member
   * DELETE /api/member/:id
   */
  async deleteMember(req, res, next) {
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

      await member.destroy();
      logger.info(`Matchmaker ${matchmaker.id} deleted member ${id}`);

      return success(res, null, '删除成功');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = memberController;
