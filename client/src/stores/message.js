import { defineStore } from 'pinia'
import { messageApi } from '@/api/message'

export const useMessageStore = defineStore('message', {
  state: () => ({
    conversations: [],
    totalUnread: 0
  }),

  actions: {
    async fetchConversations() {
      const res = await messageApi.getConversations()
      this.conversations = res.data.list
      this.totalUnread = res.data.totalUnread
      return res.data
    },

    async fetchUnreadCount() {
      const res = await messageApi.getUnreadCount()
      this.totalUnread = res.data.count
      return res.data.count
    }
  }
})
