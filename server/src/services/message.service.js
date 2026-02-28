/**
 * Message service - handles messaging and conversation operations
 */
const { Op } = require('sequelize');
const { Conversation, Message, User } = require('../models');
const logger = require('../utils/logger');

const messageService = {
  /**
   * Get paginated conversations for a user.
   * A user can be on either side of the conversation (userA or userB).
   * Ordered by last message time descending (most recent first).
   */
  async getConversations(userId, page = 1, pageSize = 20) {
    const { count, rows } = await Conversation.findAndCountAll({
      where: {
        [Op.or]: [
          { userAId: userId },
          { userBId: userId }
        ]
      },
      include: [
        { association: 'userA', attributes: ['id', 'nickname', 'avatarUrl'] },
        { association: 'userB', attributes: ['id', 'nickname', 'avatarUrl'] }
      ],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['last_message_at', 'DESC']]
    });

    // Enrich each conversation with unread count for this user
    const conversationsWithUnread = await Promise.all(
      rows.map(async (conv) => {
        const unreadCount = await Message.count({
          where: {
            conversationId: conv.id,
            receiverId: userId,
            isRead: 0
          }
        });
        const convData = conv.toJSON();
        convData.unreadCount = unreadCount;
        return convData;
      })
    );

    return {
      total: count,
      list: conversationsWithUnread,
      page: Number(page),
      pageSize: Number(pageSize)
    };
  },

  /**
   * Get a single conversation by ID
   */
  async getConversationById(conversationId) {
    return Conversation.findByPk(conversationId, {
      include: [
        { association: 'userA', attributes: ['id', 'nickname', 'avatarUrl'] },
        { association: 'userB', attributes: ['id', 'nickname', 'avatarUrl'] }
      ]
    });
  },

  /**
   * Get paginated messages within a conversation.
   * Ordered by created_at descending so the client receives newest first.
   */
  async getMessages(conversationId, page = 1, pageSize = 20) {
    const { count, rows } = await Message.findAndCountAll({
      where: { conversationId },
      include: [
        { association: 'sender', attributes: ['id', 'nickname', 'avatarUrl'] }
      ],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['created_at', 'DESC']]
    });

    return {
      total: count,
      list: rows,
      page: Number(page),
      pageSize: Number(pageSize)
    };
  },

  /**
   * Send a message from one user to another.
   * Finds or creates the conversation (ordering user IDs so the smaller
   * is always userA, keeping the unique index consistent), creates the
   * message, and updates the conversation's last message pointer.
   */
  async sendMessage(senderId, receiverId, content, contentType = 'text') {
    if (!content) {
      throw new Error('消息内容不能为空');
    }

    if (senderId === receiverId) {
      throw new Error('不能给自己发送消息');
    }

    // Verify receiver exists
    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      throw new Error('接收用户不存在');
    }

    // Conversation ordering: smaller ID is always userA
    const [userAId, userBId] = senderId < receiverId
      ? [senderId, receiverId]
      : [receiverId, senderId];

    const [conversation] = await Conversation.findOrCreate({
      where: { userAId, userBId },
      defaults: { type: 'private', userAId, userBId }
    });

    const message = await Message.create({
      conversationId: conversation.id,
      senderId,
      receiverId,
      content,
      contentType
    });

    // Update conversation with latest message info
    await conversation.update({
      lastMessageId: message.id,
      lastMessageAt: new Date()
    });

    logger.info(`Message sent: ${message.id}, from ${senderId} to ${receiverId}`);
    return message;
  },

  /**
   * Mark all unread messages in a conversation as read for the given user.
   * Only marks messages where the user is the receiver.
   * Returns the number of messages that were marked.
   */
  async markAsRead(conversationId, userId) {
    const [affectedCount] = await Message.update(
      { isRead: 1, readAt: new Date() },
      {
        where: {
          conversationId,
          receiverId: userId,
          isRead: 0
        }
      }
    );

    if (affectedCount > 0) {
      logger.info(`Marked ${affectedCount} messages as read in conversation ${conversationId} for user ${userId}`);
    }

    return affectedCount;
  },

  /**
   * Get the total unread message count across all conversations for a user.
   */
  async getUnreadCount(userId) {
    const count = await Message.count({
      where: {
        receiverId: userId,
        isRead: 0
      }
    });

    return count;
  },

  /**
   * Get unread counts grouped by conversation for a user.
   * Useful for showing per-conversation badges.
   */
  async getUnreadCountByConversation(userId) {
    const results = await Message.findAll({
      attributes: [
        'conversationId',
        [Message.sequelize.fn('COUNT', Message.sequelize.col('id')), 'unreadCount']
      ],
      where: {
        receiverId: userId,
        isRead: 0
      },
      group: ['conversationId'],
      raw: true
    });

    return results;
  },

  /**
   * Delete (hide) a conversation for a user.
   * In this implementation we do not hard-delete; we simply mark all
   * messages in the conversation as read so it drops out of the
   * "active" list from the user's perspective.
   */
  async deleteConversation(conversationId, userId) {
    // Verify user is a participant
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) return null;

    if (conversation.userAId !== userId && conversation.userBId !== userId) {
      throw new Error('无权操作该会话');
    }

    // Mark all messages as read for this user
    await Message.update(
      { isRead: 1, readAt: new Date() },
      {
        where: {
          conversationId,
          receiverId: userId,
          isRead: 0
        }
      }
    );

    logger.info(`Conversation ${conversationId} cleared for user ${userId}`);
    return conversation;
  }
};

module.exports = messageService;
