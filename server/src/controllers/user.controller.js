const { User, UserProfile, Matchmaker, UserCertification } = require('../models');
const userService = require('../services/user.service');
const authService = require('../services/auth.service');
const { success, error } = require('../utils/response');
const { generateToken } = require('../utils/jwt');
const logger = require('../utils/logger');

const userController = {
  /**
   * Get current user profile
   * GET /api/user/profile
   */
  async getProfile(req, res, next) {
    try {
      const { userId } = req.user;

      const user = await User.findByPk(userId, {
        attributes: { exclude: ['passwordHash'] },
        include: [{ association: 'profile' }]
      });

      if (!user) {
        return error(res, '用户不存在', 40400, 404);
      }

      // Compute profile completion
      const profileCompletion = userService.computeProfileCompletion(user, user.profile);

      // Update if changed
      if (user.profileCompletion !== profileCompletion) {
        await user.update({ profileCompletion });
      }

      const userData = user.toJSON();
      userData.profileCompletion = profileCompletion;

      // Check if user has a matchmaker record
      const matchmaker = await Matchmaker.findOne({ where: { userId } });
      userData.hasMatchmakerRole = !!matchmaker;

      return success(res, userData);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update basic user info (nickname, avatar, gender)
   * PUT /api/user/profile
   */
  async updateProfile(req, res, next) {
    try {
      const { userId } = req.user;
      const { nickname, avatarUrl, gender } = req.body;

      const updateData = {};
      if (nickname !== undefined) updateData.nickname = nickname;
      if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
      if (gender !== undefined) updateData.gender = gender;

      const user = await User.findByPk(userId);
      if (!user) {
        return error(res, '用户不存在', 40400, 404);
      }

      await user.update(updateData);

      return success(res, {
        id: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        gender: user.gender
      }, '更新成功');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update detailed profile (user_profiles table)
   * PUT /api/user/profile/detail
   */
  async updateProfileDetail(req, res, next) {
    try {
      const { userId } = req.user;
      const {
        realName, birthDate, age, height, weight,
        education, occupation, incomeRange,
        province, city, district, nativePlace,
        maritalStatus, hasChildren, wantChildren,
        houseStatus, carStatus, smoking, drinking,
        selfIntro, partnerRequirement, tags, photos
      } = req.body;

      const profileData = {};
      if (realName !== undefined) profileData.realName = realName;
      if (birthDate !== undefined) profileData.birthDate = birthDate;
      if (age !== undefined) profileData.age = age;
      if (height !== undefined) profileData.height = height;
      if (weight !== undefined) profileData.weight = weight;
      if (education !== undefined) profileData.education = education;
      if (occupation !== undefined) profileData.occupation = occupation;
      if (incomeRange !== undefined) profileData.incomeRange = incomeRange;
      if (province !== undefined) profileData.province = province;
      if (city !== undefined) profileData.city = city;
      if (district !== undefined) profileData.district = district;
      if (nativePlace !== undefined) profileData.nativePlace = nativePlace;
      if (maritalStatus !== undefined) profileData.maritalStatus = maritalStatus;
      if (hasChildren !== undefined) profileData.hasChildren = hasChildren;
      if (wantChildren !== undefined) profileData.wantChildren = wantChildren;
      if (houseStatus !== undefined) profileData.houseStatus = houseStatus;
      if (carStatus !== undefined) profileData.carStatus = carStatus;
      if (smoking !== undefined) profileData.smoking = smoking;
      if (drinking !== undefined) profileData.drinking = drinking;
      if (selfIntro !== undefined) profileData.selfIntro = selfIntro;
      if (partnerRequirement !== undefined) profileData.partnerRequirement = partnerRequirement;
      if (tags !== undefined) profileData.tags = tags;
      if (photos !== undefined) profileData.photos = photos;

      const profile = await userService.upsertProfile(userId, profileData);

      // Recalculate profile completion
      const user = await User.findByPk(userId);
      const completion = userService.computeProfileCompletion(user, profile);
      await user.update({ profileCompletion: completion });

      return success(res, profile, '资料更新成功');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Switch user role (user <-> matchmaker)
   * PUT /api/user/role/switch
   */
  async switchRole(req, res, next) {
    try {
      const { userId } = req.user;
      const { role } = req.body;

      if (!['user', 'matchmaker'].includes(role)) {
        return error(res, '角色类型不正确', 40001);
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return error(res, '用户不存在', 40400, 404);
      }

      // If switching to matchmaker, check if matchmaker record exists
      if (role === 'matchmaker') {
        const matchmaker = await Matchmaker.findOne({ where: { userId } });
        if (!matchmaker) {
          return error(res, '您还未注册为红娘，请先完成红娘认证', 40002);
        }
      }

      await user.update({ currentRole: role });

      // Generate new token with updated role
      const token = generateToken({
        userId: user.id,
        phone: user.phone,
        currentRole: role
      });

      return success(res, {
        currentRole: role,
        token
      }, '角色切换成功');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Upload user avatar
   * POST /api/user/avatar
   */
  async uploadAvatar(req, res, next) {
    try {
      const { userId } = req.user;

      if (!req.file) {
        return error(res, '请选择头像文件', 40001);
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return error(res, '用户不存在', 40400, 404);
      }

      // Build the avatar URL from the uploaded file path
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      await user.update({ avatarUrl });

      logger.info(`User ${userId} avatar updated: ${avatarUrl}`);

      return success(res, { avatarUrl }, '头像上传成功');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get user certification status
   * GET /api/user/certification
   */
  async getCertification(req, res, next) {
    try {
      const { userId } = req.user;

      const cert = await UserCertification.findOne({ where: { userId } });
      if (!cert) {
        return success(res, { status: 'uncertified' });
      }

      const statusMap = { pending: 'pending', approved: 'certified', rejected: 'rejected' };
      return success(res, {
        status: statusMap[cert.status] || 'uncertified',
        realName: cert.realName,
        idCard: cert.idCard,
        submittedAt: cert.submittedAt,
        reviewedAt: cert.reviewedAt,
        rejectReason: cert.rejectReason,
        certifiedAt: cert.status === 'approved' ? cert.reviewedAt : null
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Submit certification application
   * POST /api/user/certification
   */
  async submitCertification(req, res, next) {
    try {
      const { userId } = req.user;
      const { realName, idCard, idFrontPhoto, idBackPhoto } = req.body;

      if (!realName || !idCard || !idFrontPhoto || !idBackPhoto) {
        return error(res, '请填写完整的认证信息', 40001);
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return error(res, '用户不存在', 40400, 404);
      }

      // Find or create certification record
      const [cert, created] = await UserCertification.findOrCreate({
        where: { userId },
        defaults: { userId, realName, idCard, idFrontPhoto, idBackPhoto, status: 'pending', submittedAt: new Date() }
      });

      if (!created) {
        if (cert.status === 'approved') {
          return error(res, '您已完成实名认证', 40001);
        }
        // Re-submission for pending/rejected
        await cert.update({ realName, idCard, idFrontPhoto, idBackPhoto, status: 'pending', submittedAt: new Date(), rejectReason: null });
      }

      // Sync profile realName and user certification_status
      await userService.upsertProfile(userId, { realName });
      await user.update({ certificationStatus: 'pending' });

      logger.info(`User ${userId} submitted certification, realName: ${realName}`);

      return success(res, { status: 'pending' }, '认证申请已提交');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get public profile of any user by ID
   * GET /api/user/public/:id
   */
  async getPublicProfile(req, res, next) {
    try {
      const targetId = req.params.id;

      const user = await User.findByPk(targetId, {
        attributes: ['id', 'nickname', 'avatarUrl', 'gender', 'certificationStatus'],
        include: [
          {
            association: 'profile',
            attributes: [
              'realName', 'age', 'height', 'education', 'occupation',
              'incomeRange', 'city', 'province', 'nativePlace',
              'maritalStatus', 'selfIntro', 'partnerRequirement', 'photos'
            ]
          }
        ]
      });

      if (!user) {
        return error(res, '用户不存在', 40400, 404);
      }

      const u = user.toJSON();
      const profile = u.profile || {};

      return success(res, {
        id: u.id,
        nickname: u.nickname,
        avatarUrl: u.avatarUrl,
        gender: u.gender,
        verified: u.certificationStatus === 'approved',
        age: profile.age,
        height: profile.height,
        education: profile.education,
        occupation: profile.occupation,
        income_range: profile.incomeRange,
        city: profile.city,
        marital_status: profile.maritalStatus,
        self_intro: profile.selfIntro,
        partner_requirement: profile.partnerRequirement,
        photos: profile.photos || []
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = userController;
