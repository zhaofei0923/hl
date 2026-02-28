const matchService = require('../services/match.service');
const { success, error, paginate } = require('../utils/response');
const logger = require('../utils/logger');

const matchController = {
  /**
   * Get daily match recommendations (今日缘分)
   * GET /api/match/daily
   */
  async getDailyMatches(req, res, next) {
    try {
      const { userId } = req.user;
      const { limit = 5 } = req.query;

      const matches = await matchService.getDailyMatches(userId, Number(limit));

      return success(res, matches, '获取今日缘分成功');
    } catch (err) {
      if (err.message === '用户不存在') {
        return error(res, err.message, 40400, 404);
      }
      next(err);
    }
  },

  /**
   * Get recommendations with filters
   * GET /api/match/recommend
   */
  async getRecommendations(req, res, next) {
    try {
      const { userId } = req.user;
      const { page = 1, pageSize = 20, minAge, maxAge, city, education } = req.query;

      const result = await matchService.getRecommendations(userId, {
        page,
        pageSize,
        minAge,
        maxAge,
        city,
        education
      });

      return paginate(res, {
        list: result.list,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize
      });
    } catch (err) {
      if (err.message === '用户不存在') {
        return error(res, err.message, 40400, 404);
      }
      next(err);
    }
  },

  /**
   * Express interest (like) in another user
   * POST /api/match/like/:userId
   */
  async likeUser(req, res, next) {
    try {
      const { userId } = req.user;
      const targetUserId = req.params.userId;

      const matchRecord = await matchService.likeUser(userId, targetUserId);

      const message = matchRecord.status === 'mutual' ? '双方互相喜欢，匹配成功！' : '已表达心意';
      return success(res, matchRecord, message);
    } catch (err) {
      if (err.message === '不能喜欢自己' || err.message === '目标用户不存在') {
        return error(res, err.message, 40001);
      }
      next(err);
    }
  },

  /**
   * Get mutual matches
   * GET /api/match/mutual
   */
  async getMutualMatches(req, res, next) {
    try {
      const { userId } = req.user;
      const { page = 1, pageSize = 20 } = req.query;

      const result = await matchService.getMutualMatches(userId, Number(page), Number(pageSize));

      return paginate(res, {
        list: result.list,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = matchController;
