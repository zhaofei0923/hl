import request from './request'

export const messageApi = {
  // 会话列表
  getConversations(params) {
    return request.get('/message/conversations', { params })
  },

  // 某个会话的消息列表
  getMessages(conversationId, params) {
    return request.get(`/message/conversation/${conversationId}`, { params })
  },

  // 发送消息
  send(data) {
    return request.post('/message/send', data)
  },

  // 标记已读
  markAsRead(conversationId) {
    return request.put(`/message/read/${conversationId}`)
  },

  // 未读消息计数
  getUnreadCount() {
    return request.get('/message/unread-count')
  },

  // 删除会话
  deleteConversation(conversationId) {
    return request.delete(`/message/conversation/${conversationId}`)
  }
}
