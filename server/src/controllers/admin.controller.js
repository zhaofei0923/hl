/**
 * Admin controller - handles admin HTTP requests
 */
const adminService = require('../services/admin.service');
const { success, error, paginate } = require('../utils/response');

const adminController = {
  // ==================== Dashboard ====================

  async getDashboardStats(req, res, next) {
    try {
      const stats = await adminService.getDashboardStats();
      return success(res, stats);
    } catch (err) { next(err); }
  },

  async getUserTrend(req, res, next) {
    try {
      const { days = 7 } = req.query;
      const trend = await adminService.getRecentUserTrend(Number(days));
      return success(res, trend);
    } catch (err) { next(err); }
  },

  async getOrderTypeDistribution(req, res, next) {
    try {
      const dist = await adminService.getOrderTypeDistribution();
      return success(res, dist);
    } catch (err) { next(err); }
  },

  // ==================== User Management ====================

  async getUsers(req, res, next) {
    try {
      const result = await adminService.getUsers(req.query);
      return paginate(res, result);
    } catch (err) { next(err); }
  },

  async getUserDetail(req, res, next) {
    try {
      const user = await adminService.getUserDetail(req.params.id);
      if (!user) return error(res, '用户不存在', 40400, 404);
      return success(res, user);
    } catch (err) { next(err); }
  },

  async updateUserStatus(req, res, next) {
    try {
      const { status } = req.body;
      if (status === undefined) return error(res, '缺少status参数');
      const user = await adminService.updateUserStatus(req.params.id, status);
      if (!user) return error(res, '用户不存在', 40400, 404);
      return success(res, user, '状态更新成功');
    } catch (err) { next(err); }
  },

  // ==================== Matchmaker Management ====================

  async getMatchmakers(req, res, next) {
    try {
      const result = await adminService.getMatchmakers(req.query);
      return paginate(res, result);
    } catch (err) { next(err); }
  },

  async getMatchmakerDetail(req, res, next) {
    try {
      const mm = await adminService.getMatchmakerDetail(req.params.id);
      if (!mm) return error(res, '红娘不存在', 40400, 404);
      return success(res, mm);
    } catch (err) { next(err); }
  },

  async updateCertification(req, res, next) {
    try {
      const { certificationStatus } = req.body;
      if (certificationStatus === undefined) return error(res, '缺少certificationStatus参数');
      const mm = await adminService.updateCertification(req.params.id, certificationStatus);
      if (!mm) return error(res, '红娘不存在', 40400, 404);
      return success(res, mm, '认证状态更新成功');
    } catch (err) { next(err); }
  },

  async updateLevel(req, res, next) {
    try {
      const { level } = req.body;
      if (level === undefined) return error(res, '缺少level参数');
      const mm = await adminService.updateLevel(req.params.id, level);
      if (!mm) return error(res, '红娘不存在', 40400, 404);
      return success(res, mm, '等级更新成功');
    } catch (err) { next(err); }
  },

  // ==================== Withdrawal Management ====================

  async getWithdrawals(req, res, next) {
    try {
      const result = await adminService.getWithdrawals(req.query);
      return paginate(res, result);
    } catch (err) { next(err); }
  },

  async approveWithdrawal(req, res, next) {
    try {
      const result = await adminService.approveWithdrawal(req.params.id);
      if (!result) return error(res, '提现记录不存在', 40400, 404);
      if (result.error) return error(res, result.error);
      return success(res, result, '已批准提现');
    } catch (err) { next(err); }
  },

  async rejectWithdrawal(req, res, next) {
    try {
      const { rejectReason } = req.body;
      if (!rejectReason) return error(res, '请填写拒绝原因');
      const result = await adminService.rejectWithdrawal(req.params.id, rejectReason);
      if (!result) return error(res, '提现记录不存在', 40400, 404);
      if (result.error) return error(res, result.error);
      return success(res, result, '已拒绝提现');
    } catch (err) { next(err); }
  },

  // ==================== Order Management ====================

  async getOrders(req, res, next) {
    try {
      const result = await adminService.getOrders(req.query);
      return paginate(res, result);
    } catch (err) { next(err); }
  },

  async getOrderDetail(req, res, next) {
    try {
      const order = await adminService.getOrderDetail(req.params.id);
      if (!order) return error(res, '订单不存在', 40400, 404);
      return success(res, order);
    } catch (err) { next(err); }
  },

  // ==================== Salon Management ====================

  async getSalons(req, res, next) {
    try {
      const result = await adminService.getSalons(req.query);
      return paginate(res, result);
    } catch (err) { next(err); }
  },

  async getSalonDetail(req, res, next) {
    try {
      const salon = await adminService.getSalonDetail(req.params.id);
      if (!salon) return error(res, '沙龙不存在', 40400, 404);
      return success(res, salon);
    } catch (err) { next(err); }
  },

  async createSalon(req, res, next) {
    try {
      const salon = await adminService.createSalon(req.body);
      return success(res, salon, '创建成功');
    } catch (err) { next(err); }
  },

  async updateSalon(req, res, next) {
    try {
      const salon = await adminService.updateSalon(req.params.id, req.body);
      if (!salon) return error(res, '沙龙不存在', 40400, 404);
      return success(res, salon, '更新成功');
    } catch (err) { next(err); }
  },

  async updateSalonStatus(req, res, next) {
    try {
      const { status } = req.body;
      if (!status) return error(res, '缺少status参数');
      const salon = await adminService.updateSalonStatus(req.params.id, status);
      if (!salon) return error(res, '沙龙不存在', 40400, 404);
      return success(res, salon, '状态更新成功');
    } catch (err) { next(err); }
  }
};

module.exports = adminController;
