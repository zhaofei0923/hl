<template>
  <div class="page page--with-tabbar messages-page">
    <van-nav-bar title="消息" :border="false" />

    <section class="starter-panel">
      <div class="starter-panel__title">
        <span>推荐开场白</span>
        <small>降低冷启动沟通门槛</small>
      </div>
      <div class="starter-panel__chips">
        <button
          v-for="text in starterTemplates"
          :key="text"
          type="button"
          class="starter-chip"
          data-testid="message-intro-suggestion"
          @click="handleStarterClick(text)"
        >
          {{ text }}
        </button>
      </div>
    </section>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="conversation-list">
        <article
          v-for="item in normalizedConversations"
          :key="item.conversationId"
          class="conversation-item"
          :class="{ 'conversation-item--priority': item.intentLevel > 0 }"
          @click="handleConversationClick(item)"
        >
          <div class="conversation-item__avatar">
            <van-image
              round
              width="48"
              height="48"
              :src="item.avatarUrl || defaultAvatar"
              fit="cover"
            />
            <div v-if="item.unreadCount > 0" class="conversation-item__badge">
              {{ item.unreadCount > 99 ? '99+' : item.unreadCount }}
            </div>
          </div>

          <div class="conversation-item__content">
            <div class="conversation-item__top">
              <div class="conversation-item__name-wrap">
                <span class="conversation-item__name">{{ item.nickname || '未知用户' }}</span>
                <span
                  v-if="item.intentLevel > 0"
                  class="conversation-item__priority-pill"
                  data-testid="message-priority-pill"
                >
                  {{ item.intentLabel }}
                </span>
              </div>
              <span class="conversation-item__time">{{ formatTime(item.lastMessageAt) }}</span>
            </div>
            <div class="conversation-item__bottom">
              <span class="conversation-item__preview">{{ item.lastMessage || '点击进入，立即开启对话' }}</span>
            </div>
          </div>
        </article>

        <EmptyState v-if="!refreshing && normalizedConversations.length === 0" text="暂无消息" />
      </div>
    </van-pull-refresh>

    <TabBar />
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useMessageStore } from '@/stores/message'
import { useUserStore } from '@/stores/user'
import { formatDate } from '@/utils/format'
import TabBar from '@/components/common/TabBar.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const router = useRouter()
const messageStore = useMessageStore()
const userStore = useUserStore()

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyNCIgZmlsbD0iI0UwRTBFMCIvPjxwYXRoIGQ9Ik0yNCAxNmE2IDYgMCAxIDAgMCAxMiA2IDYgMCAwIDAgMC0xMnptMCAxNmMtNi42MyAwLTEyIDIuNjktMTIgNnYyaDI0di0yYzAtMy4zMS01LjM3LTYtMTItNnoiIGZpbGw9IiNBMEEwQTAiLz48L3N2Zz4='
const refreshing = ref(false)

const starterTemplates = [
  '你好，看到你的资料很有眼缘，方便认识一下吗？',
  '你平时最喜欢的周末安排是什么？',
  '我也在认真找对象，想和你先聊几句。'
]

const normalizedConversations = computed(() => {
  const currentUserId = Number(userStore.userInfo?.id || 0)

  return (messageStore.conversations || [])
    .map((rawItem) => {
      const item = rawItem || {}
      const conversationId = Number(item.conversationId || item.id || 0)
      const userAId = Number(item.userAId || item.user_a_id || item.userA?.id || 0)
      const userBId = Number(item.userBId || item.user_b_id || item.userB?.id || 0)
      let peer = item.otherUser || null

      if (!peer && currentUserId > 0 && userAId > 0 && userBId > 0) {
        peer = userAId === currentUserId ? item.userB : item.userA
      }
      if (!peer) {
        peer = {
          id: item.targetUserId,
          nickname: item.nickname,
          avatarUrl: item.avatarUrl
        }
      }

      const lastMessageAt = item.lastMessageAt || item.last_message_at || item.updatedAt || item.updated_at
      const unreadCount = Number(item.unreadCount || 0)
      const recentHours = lastMessageAt
        ? Math.floor((Date.now() - new Date(lastMessageAt).getTime()) / (1000 * 60 * 60))
        : 999

      let intentLevel = 0
      let intentLabel = ''
      if (unreadCount > 0) {
        intentLevel = 2
        intentLabel = '高意向'
      } else if (recentHours <= 72) {
        intentLevel = 1
        intentLabel = '近期活跃'
      }

      return {
        conversationId,
        nickname: peer?.nickname,
        avatarUrl: peer?.avatarUrl,
        lastMessage: item.lastMessage || item.last_message || '',
        lastMessageAt,
        unreadCount,
        intentLevel,
        intentLabel
      }
    })
    .sort((a, b) => {
      if (b.intentLevel !== a.intentLevel) return b.intentLevel - a.intentLevel
      return new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
    })
})

function formatTime(timestamp) {
  if (!timestamp) return ''
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${diffMin}分钟前`
  if (diffHour < 24 && now.getDate() === date.getDate()) {
    return formatDate(timestamp, 'HH:mm')
  }
  if (diffDay < 7) return `${diffDay}天前`
  return formatDate(timestamp, 'MM-DD')
}

function handleConversationClick(item) {
  router.push(`/chat/${item.conversationId}`)
}

function handleStarterClick(starter) {
  const firstConversation = normalizedConversations.value[0]
  if (!firstConversation) {
    showToast('暂无可发起会话，请先去首页打招呼')
    return
  }

  router.push({
    path: `/chat/${firstConversation.conversationId}`,
    query: { starter }
  })
}

async function onRefresh() {
  try {
    await messageStore.fetchConversations()
  } catch (err) {
    // handled by interceptor
  } finally {
    refreshing.value = false
  }
}

onMounted(() => {
  messageStore.fetchConversations().catch(() => {})
})
</script>

<style scoped>
.messages-page {
  background: transparent;
}

.starter-panel {
  margin: 8px 12px 12px;
  padding: 12px;
  border-radius: var(--hl-radius-md);
  background: linear-gradient(145deg, #fff, #f9f5ee);
  border: 1px solid var(--hl-border-color);
  box-shadow: var(--hl-shadow-card);
}

.starter-panel__title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.starter-panel__title span {
  font-size: 14px;
  font-weight: 600;
  color: var(--hl-text-primary);
}

.starter-panel__title small {
  font-size: 11px;
  color: var(--hl-text-placeholder);
}

.starter-panel__chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.starter-chip {
  border: 1px solid rgba(140, 106, 67, 0.2);
  background: #fff;
  color: var(--hl-text-secondary);
  border-radius: 999px;
  min-height: 34px;
  padding: 0 12px;
  white-space: nowrap;
  font-size: 12px;
}

.conversation-list {
  background: rgba(255, 255, 255, 0.74);
  margin: 0 12px;
  border-radius: var(--hl-radius-md);
  overflow: hidden;
  box-shadow: var(--hl-shadow-card);
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-bottom: 1px solid var(--hl-border-color);
  cursor: pointer;
}

.conversation-item:last-child {
  border-bottom: 0;
}

.conversation-item:active {
  background: var(--hl-bg-soft);
}

.conversation-item--priority {
  background: linear-gradient(90deg, rgba(201, 164, 106, 0.08), rgba(201, 164, 106, 0));
}

.conversation-item__avatar {
  position: relative;
  flex-shrink: 0;
}

.conversation-item__badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  font-size: 10px;
  color: #fff;
  background: var(--hl-accent-color);
  border-radius: 9px;
  padding: 0 4px;
}

.conversation-item__content {
  flex: 1;
  min-width: 0;
}

.conversation-item__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.conversation-item__name-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.conversation-item__name {
  font-size: 15px;
  font-weight: 500;
  color: var(--hl-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-item__priority-pill {
  border-radius: 999px;
  padding: 1px 7px;
  font-size: 10px;
  color: #fff;
  background: linear-gradient(120deg, #8c6a43, #c9a46a);
}

.conversation-item__time {
  font-size: 12px;
  color: var(--hl-text-placeholder);
  flex-shrink: 0;
  margin-left: 8px;
}

.conversation-item__preview {
  font-size: 13px;
  color: var(--hl-text-placeholder);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}
</style>
