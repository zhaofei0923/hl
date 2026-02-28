const { success, error, paginate } = require('../utils/response');
const messageService = require('../services/message.service');
const logger = require('../utils/logger');

const messageController = {
  /**
   * Get conversations list
   * GET /api/message/conversations
   */
  async getConversations(req, res, next) {
    try {
      const { userId } = req.user;
      const { page = 1, pageSize = 20 } = req.query;

      const result = await messageService.getConversations(userId, page, pageSize);
      return paginate(res, result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get messages in a conversation
   * GET /api/message/conversation/:id
   */
  async getMessages(req, res, next) {
    try {
      const { page = 1, pageSize = 20 } = req.query;

      const result = await messageService.getMessages(req.params.id, page, pageSize);
      return paginate(res, result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Send a message
   * POST /api/message/send
   */
  async sendMessage(req, res, next) {
    try {
      const { userId } = req.user;
      const { receiverId, content, contentType } = req.body;

      const message = await messageService.sendMessage(userId, receiverId, content, contentType);
      return success(res, message, '消息发送成功');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Mark messages as read
   * PUT /api/message/read/:id
   */
  async markAsRead(req, res, next) {
    try {
      const { userId } = req.user;

      const affectedCount = await messageService.markAsRead(req.params.id, userId);
      return success(res, { affectedCount }, '已标记为已读');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get unread message count
   * GET /api/message/unread-count
   */
  async getUnreadCount(req, res, next) {
    try {
      const { userId } = req.user;

      const count = await messageService.getUnreadCount(userId);
      return success(res, { count });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete a conversation
   * DELETE /api/message/conversation/:id
   */
  async deleteConversation(req, res, next) {
    try {
      const { userId } = req.user;

      const conversation = await messageService.deleteConversation(req.params.id, userId);
      if (!conversation) {
        return error(res, '会话不存在', 40400, 404);
      }
      return success(res, conversation, '会话已删除');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = messageController;
