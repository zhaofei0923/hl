const salonService = require('../services/salon.service');
const { success, error, paginate } = require('../utils/response');
const logger = require('../utils/logger');

const salonController = {
  /**
   * List salon events
   * GET /api/salon/events
   */
  async getEvents(req, res, next) {
    try {
      const { page = 1, pageSize = 20, status } = req.query;

      const result = await salonService.getEvents({ page, pageSize, status });

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
   * Get salon event detail
   * GET /api/salon/events/:id
   */
  async getEventDetail(req, res, next) {
    try {
      const { id } = req.params;

      const event = await salonService.getEventDetail(id);

      if (!event) {
        return error(res, '活动不存在', 40400, 404);
      }

      return success(res, event);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Register for a salon event
   * POST /api/salon/events/:id/register
   */
  async register(req, res, next) {
    try {
      const { id } = req.params;
      const { userId } = req.user;

      const registration = await salonService.registerForEvent(id, userId);

      return success(res, registration, '报名成功');
    } catch (err) {
      if (['活动不存在', '活动当前不可报名', '活动名额已满', '您已报名该活动'].includes(err.message)) {
        return error(res, err.message, 40001);
      }
      next(err);
    }
  },

  /**
   * Cancel registration for a salon event
   * DELETE /api/salon/events/:id/register
   */
  async cancelRegistration(req, res, next) {
    try {
      const { id } = req.params;
      const { userId } = req.user;

      const registration = await salonService.cancelRegistration(id, userId);

      return success(res, registration, '已取消报名');
    } catch (err) {
      if (err.message === '未找到报名记录') {
        return error(res, err.message, 40400, 404);
      }
      next(err);
    }
  },

  /**
   * Get current user's registrations
   * GET /api/salon/my-registrations
   */
  async getMyRegistrations(req, res, next) {
    try {
      const { userId } = req.user;
      const { page = 1, pageSize = 20 } = req.query;

      const result = await salonService.getMyRegistrations(userId, Number(page), Number(pageSize));

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
   * Create a salon event (matchmaker only)
   * POST /api/salon/events
   */
  async createEvent(req, res, next) {
    try {
      const { userId } = req.user;
      const event = await salonService.createEvent(userId, req.body);
      return success(res, event, '活动创建成功');
    } catch (err) {
      if (['活动标题和时间为必填项'].includes(err.message)) {
        return error(res, err.message, 40001);
      }
      next(err);
    }
  },

  /**
   * Update a salon event (organizer only)
   * PUT /api/salon/events/:id
   */
  async updateEvent(req, res, next) {
    try {
      const { id } = req.params;
      const { userId } = req.user;
      const event = await salonService.updateEvent(Number(id), userId, req.body);
      return success(res, event, '活动更新成功');
    } catch (err) {
      if (['活动不存在', '无权修改此活动', '已结束或已取消的活动不能修改'].includes(err.message)) {
        return error(res, err.message, 40001);
      }
      next(err);
    }
  },

  /**
   * Cancel a salon event (organizer only)
   * PUT /api/salon/events/:id/cancel
   */
  async cancelEvent(req, res, next) {
    try {
      const { id } = req.params;
      const { userId } = req.user;
      const event = await salonService.cancelEvent(Number(id), userId);
      return success(res, event, '活动已取消');
    } catch (err) {
      if (['活动不存在', '无权取消此活动', '活动已取消', '已结束的活动不能取消'].includes(err.message)) {
        return error(res, err.message, 40001);
      }
      next(err);
    }
  },

  /**
   * Get events created by current matchmaker
   * GET /api/salon/my-events
   */
  async getMyEvents(req, res, next) {
    try {
      const { userId } = req.user;
      const { page = 1, pageSize = 20 } = req.query;
      const result = await salonService.getMyEvents(userId, Number(page), Number(pageSize));
      return paginate(res, result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Invite members to a salon event
   * POST /api/salon/events/:id/invite
   */
  async inviteMembers(req, res, next) {
    try {
      const { id } = req.params;
      const { userId } = req.user;
      const { userIds } = req.body;

      if (!Array.isArray(userIds) || userIds.length === 0) {
        return error(res, '请选择要邀请的会员', 40001);
      }

      const result = await salonService.inviteMembers(Number(id), userId, userIds);
      return success(res, result, `成功邀请 ${result.invited} 人`);
    } catch (err) {
      if (['活动不存在', '无权邀请人员参加此活动', '只能邀请参加即将开始的活动', '红娘信息不存在', '未找到有效的会员'].includes(err.message)) {
        return error(res, err.message, 40001);
      }
      next(err);
    }
  }
};

module.exports = salonController;
