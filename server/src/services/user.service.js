/**
 * User service - handles user profile operations
 */
const { Op } = require('sequelize');
const { User, UserProfile, Matchmaker } = require('../models');
const logger = require('../utils/logger');

const userService = {
  /**
   * Get a user by ID with profile included
   */
  async getUserById(userId) {
    return User.findByPk(userId, {
      attributes: { exclude: ['passwordHash'] },
      include: [{ association: 'profile' }]
    });
  },

  /**
   * Get full profile data for a user, including completion percentage
   */
  async getProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['passwordHash'] },
      include: [{ association: 'profile' }]
    });

    if (!user) return null;

    const profileCompletion = userService.computeProfileCompletion(user, user.profile);

    // Persist updated completion if it changed
    if (user.profileCompletion !== profileCompletion) {
      await user.update({ profileCompletion });
    }

    const userData = user.toJSON();
    userData.profileCompletion = profileCompletion;

    return userData;
  },

  /**
   * Update basic user fields (nickname, avatarUrl, gender)
   */
  async updateUser(userId, data) {
    const user = await User.findByPk(userId);
    if (!user) return null;

    const allowedFields = ['nickname', 'avatarUrl', 'gender'];
    const updateData = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return user;
    }

    await user.update(updateData);
    logger.info(`User ${userId} basic info updated:`, Object.keys(updateData));
    return user;
  },

  /**
   * Create or update the detailed user profile (user_profiles table)
   */
  async upsertProfile(userId, profileData) {
    const [profile, created] = await UserProfile.findOrCreate({
      where: { userId },
      defaults: { userId, ...profileData }
    });

    if (!created) {
      await profile.update(profileData);
    }

    // Recalculate and persist profile completion
    const user = await User.findByPk(userId);
    if (user) {
      const completion = userService.computeProfileCompletion(user, profile);
      await user.update({ profileCompletion: completion });
    }

    logger.info(`User ${userId} profile ${created ? 'created' : 'updated'}`);
    return profile;
  },

  /**
   * Compute profile completion percentage (0-100)
   * based on key fields in both User and UserProfile
   */
  computeProfileCompletion(user, profile) {
    if (!profile) return 0;

    const fields = [
      'realName', 'birthDate', 'height', 'education',
      'occupation', 'province', 'city', 'maritalStatus',
      'selfIntro'
    ];
    const filled = fields.filter(f => profile[f] != null && profile[f] !== '').length;
    const hasAvatar = user.avatarUrl ? 1 : 0;
    const hasNickname = user.nickname ? 1 : 0;
    const total = fields.length + 2;
    return Math.round(((filled + hasAvatar + hasNickname) / total) * 100);
  },

  /**
   * Switch user's current role between 'user' and 'matchmaker'.
   * Returns null if the role value is invalid.
   * Throws an error if switching to matchmaker but no matchmaker record exists.
   */
  async switchRole(userId, role) {
    if (!['user', 'matchmaker'].includes(role)) {
      return null;
    }

    const user = await User.findByPk(userId);
    if (!user) return null;

    // Switching to matchmaker requires an existing matchmaker record
    if (role === 'matchmaker') {
      const matchmaker = await Matchmaker.findOne({ where: { userId } });
      if (!matchmaker) {
        throw new Error('您还未注册为红娘，请先完成红娘认证');
      }
    }

    await user.update({ currentRole: role });
    logger.info(`User ${userId} switched role to ${role}`);
    return user;
  },

  /**
   * Search / list users with optional filters and pagination
   */
  async searchUsers({ keyword, gender, status, page = 1, pageSize = 20 } = {}) {
    const where = {};

    if (gender !== undefined) where.gender = Number(gender);
    if (status !== undefined) where.status = Number(status);

    if (keyword) {
      where[Op.or] = [
        { nickname: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['passwordHash'] },
      include: [{ association: 'profile' }],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['created_at', 'DESC']]
    });

    return { total: count, list: rows, page: Number(page), pageSize: Number(pageSize) };
  },

  /**
   * Get the user's profile record only (from user_profiles table)
   */
  async getProfileByUserId(userId) {
    return UserProfile.findOne({ where: { userId } });
  }
};

module.exports = userService;
