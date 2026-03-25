/**
 * Match service - handles recommendation algorithm and matching operations
 */
const { Op } = require('sequelize');
const { User, UserProfile, MatchRecord } = require('../models');
const logger = require('../utils/logger');

const matchService = {
  /**
   * Get daily recommendations for a user (今日缘分)
   * Returns top N candidates scored by compatibility
   */
  async getDailyMatches(userId, limit = 5) {
    // 1. Get user's profile and preferences
    const user = await User.findByPk(userId, {
      include: [{ association: 'profile' }]
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    const profile = user.profile;

    // 2. Find users of opposite gender (or all if gender not set)
    const userWhere = {
      id: { [Op.ne]: userId },
      status: 1
    };

    if (user.gender === 1) {
      userWhere.gender = 2;
    } else if (user.gender === 2) {
      userWhere.gender = 1;
    }

    // 3. Exclude already matched users (mutual or pending)
    const existingMatches = await MatchRecord.findAll({
      where: {
        [Op.or]: [
          { userAId: userId },
          { userBId: userId }
        ],
        status: { [Op.in]: ['mutual', 'accepted_a', 'accepted_b'] }
      },
      attributes: ['userAId', 'userBId']
    });

    const excludeIds = new Set([userId]);
    existingMatches.forEach(m => {
      excludeIds.add(Number(m.userAId));
      excludeIds.add(Number(m.userBId));
    });

    userWhere.id = { [Op.notIn]: Array.from(excludeIds) };

    // 4. Fetch candidate users with profiles
    const candidates = await User.findAll({
      where: userWhere,
      include: [{ association: 'profile' }],
      limit: 50
    });

    // 5. Score and rank candidates
    const scored = candidates.map(candidate => {
      const score = matchService.computeScore(user, profile, candidate, candidate.profile);
      return {
        user: candidate,
        compatibilityScore: score
      };
    });

    // Sort by score descending
    scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    // Return top N
    return scored.slice(0, limit);
  },

  /**
   * Get recommended matches with filters and pagination
   */
  async getRecommendations(userId, filters = {}) {
    const { page = 1, pageSize = 20, minAge, maxAge, city, education, gender, maritalStatus } = filters;

    const user = await User.findByPk(userId, {
      include: [{ association: 'profile' }]
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    const profile = user.profile;

    // Build user where clause
    const userWhere = {
      id: { [Op.ne]: userId },
      status: 1
    };

    if (user.gender === 1) {
      userWhere.gender = 2;
    } else if (user.gender === 2) {
      userWhere.gender = 1;
    }

    // Gender filter: client sends 'male'/'female', override the auto opposite-gender logic
    if (gender === 'male') {
      userWhere.gender = 1;
    } else if (gender === 'female') {
      userWhere.gender = 2;
    }

    // Build profile where clause for filters
    const profileWhere = {};
    if (minAge || maxAge) {
      profileWhere.age = {};
      if (minAge) profileWhere.age[Op.gte] = Number(minAge);
      if (maxAge) profileWhere.age[Op.lte] = Number(maxAge);
    }
    if (city) {
      profileWhere.city = city;
    }
    if (education) {
      profileWhere.education = education;
    }
    if (maritalStatus) {
      profileWhere.maritalStatus = maritalStatus;
    }

    const profileInclude = {
      association: 'profile',
      where: Object.keys(profileWhere).length > 0 ? profileWhere : undefined,
      required: Object.keys(profileWhere).length > 0
    };

    // Fetch all matching candidates (for scoring)
    const { count, rows: candidates } = await User.findAndCountAll({
      where: userWhere,
      include: [profileInclude],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      distinct: true
    });

    // Score candidates
    const scored = candidates.map(candidate => {
      const score = matchService.computeScore(user, profile, candidate, candidate.profile);
      return {
        user: candidate,
        compatibilityScore: score
      };
    });

    // Sort by score descending
    scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return {
      total: count,
      list: scored,
      page: Number(page),
      pageSize: Number(pageSize)
    };
  },

  /**
   * Express interest (like) in a user
   * Creates or updates MatchRecord; if mutual interest, status becomes 'mutual'
   */
  async likeUser(userId, targetUserId) {
    if (Number(userId) === Number(targetUserId)) {
      throw new Error('不能喜欢自己');
    }

    // Verify target user exists
    const targetUser = await User.findByPk(targetUserId);
    if (!targetUser) {
      throw new Error('目标用户不存在');
    }

    // Normalize ordering: smaller ID is always userA
    const [userAId, userBId] = Number(userId) < Number(targetUserId)
      ? [Number(userId), Number(targetUserId)]
      : [Number(targetUserId), Number(userId)];

    const isUserA = Number(userId) === userAId;

    // Check for existing match record
    let matchRecord = await MatchRecord.findOne({
      where: { userAId, userBId }
    });

    if (matchRecord) {
      // Update existing record
      if (isUserA) {
        // Current user is userA
        if (matchRecord.status === 'accepted_b') {
          // userB already liked, now mutual
          await matchRecord.update({ status: 'mutual' });
        } else if (matchRecord.status !== 'mutual') {
          await matchRecord.update({ status: 'accepted_a' });
        }
      } else {
        // Current user is userB
        if (matchRecord.status === 'accepted_a') {
          // userA already liked, now mutual
          await matchRecord.update({ status: 'mutual' });
        } else if (matchRecord.status !== 'mutual') {
          await matchRecord.update({ status: 'accepted_b' });
        }
      }
    } else {
      // Create new record
      matchRecord = await MatchRecord.create({
        userAId,
        userBId,
        matchType: 'system',
        status: isUserA ? 'accepted_a' : 'accepted_b'
      });
    }

    logger.info(`User ${userId} liked user ${targetUserId}, match status: ${matchRecord.status}`);
    return matchRecord;
  },

  /**
   * Get mutual matches for a user with pagination
   */
  async getMutualMatches(userId, page = 1, pageSize = 20) {
    const { count, rows } = await MatchRecord.findAndCountAll({
      where: {
        status: 'mutual',
        [Op.or]: [
          { userAId: userId },
          { userBId: userId }
        ]
      },
      include: [
        {
          association: 'userA',
          attributes: ['id', 'nickname', 'avatarUrl', 'gender'],
          include: [{ association: 'profile', attributes: ['age', 'city', 'occupation', 'photos'] }]
        },
        {
          association: 'userB',
          attributes: ['id', 'nickname', 'avatarUrl', 'gender'],
          include: [{ association: 'profile', attributes: ['age', 'city', 'occupation', 'photos'] }]
        }
      ],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['updated_at', 'DESC']]
    });

    return { total: count, list: rows, page: Number(page), pageSize: Number(pageSize) };
  },

  /**
   * Compute compatibility score between two users
   * Returns a score clamped to the 60-98 range for display
   */
  computeScore(userA, profileA, userB, profileB) {
    let score = 50; // base score

    if (!profileA || !profileB) {
      // If either user has no profile, return base clamped
      return Math.max(60, Math.min(98, score));
    }

    // Same city: +15
    if (profileA.city && profileB.city && profileA.city === profileB.city) {
      score += 15;
    }

    // Age compatibility
    if (profileA.age && profileB.age) {
      const ageDiff = Math.abs(profileA.age - profileB.age);
      if (ageDiff <= 3) {
        score += 12;
      } else if (ageDiff <= 5) {
        score += 8;
      } else if (ageDiff <= 10) {
        score += 4;
      }
    }

    // Same education: +10
    if (profileA.education && profileB.education && profileA.education === profileB.education) {
      score += 10;
    }

    // Income range compatible: +8
    if (profileA.incomeRange && profileB.incomeRange && profileA.incomeRange === profileB.incomeRange) {
      score += 8;
    }

    // Both have photos: +5
    const aHasPhotos = profileA.photos && Array.isArray(profileA.photos) && profileA.photos.length > 0;
    const bHasPhotos = profileB.photos && Array.isArray(profileB.photos) && profileB.photos.length > 0;
    if (aHasPhotos && bHasPhotos) {
      score += 5;
    }

    // Add small random factor to avoid ties (0-5)
    score += Math.floor(Math.random() * 6);

    // Clamp to 60-98 range for display
    return Math.max(60, Math.min(98, score));
  }
};

module.exports = matchService;
