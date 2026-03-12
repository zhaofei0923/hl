<template>
  <div class="page page--with-tabbar messages-page">
    <van-nav-bar title="消息" :border="false" />

    <section class="messages-hero card">
      <div class="messages-hero__title">
        <div>
          <span class="brand-label">RELATIONSHIP INBOX</span>
          <h2>先回复更有可能继续的对话</h2>
        </div>
        <div class="messages-hero__badge">{{ priorityCount }} 条优先</div>
      </div>
      <p class="messages-hero__desc">高意向与近期活跃会被排在更前面，先把对的人留在你的注意力里。</p>
    </section>

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
              width="52"
              height="52"
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

        <div v-if="!refreshing && normalizedConversations.length === 0" class="card conversation-empty">
          <EmptyState text="暂无消息" />
        </div>
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

const priorityCount = computed(() => normalizedConversations.value.filter(item => item.intentLevel > 0).length)

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
  padding-bottom: calc(86px + env(safe-area-inset-bottom));
}

.messages-hero {
  margin-top: max(env(safe-area-inset-top), 8px);
}

.messages-hero__title {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.messages-hero__title h2 {
  margin-top: 6px;
  font-size: 22px;
  line-height: 1.3;
}

.messages-hero__badge {
  min-width: 72px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: linear-gradient(180deg, #fff8eb, rgba(226, 205, 169, 0.3));
  border: 1px solid rgba(166, 124, 82, 0.24);
  font-size: 12px;
  color: var(--ifu-text-strong);
}

.messages-hero__desc {
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--ifu-text);
}

.starter-panel {
  margin: 8px 14px 12px;
  padding: 14px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(252, 247, 240, 0.9));
  border: 1px solid rgba(233, 221, 204, 0.9);
  box-shadow: var(--ifu-shadow-soft);
}

.starter-panel__title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.starter-panel__title span {
  font-size: 15px;
  font-weight: 600;
  color: var(--ifu-text-strong);
}

.starter-panel__title small {
  font-size: 11px;
  color: var(--ifu-text-muted);
}

.starter-panel__chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.starter-chip {
  border: 1px solid rgba(166, 124, 82, 0.18);
  background: #fff;
  color: var(--ifu-text);
  border-radius: 999px;
  min-height: 36px;
  padding: 0 14px;
  white-space: nowrap;
  font-size: 12px;
}

.conversation-list {
  margin: 0 14px;
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  margin-bottom: 12px;
  border-radius: 24px;
  border: 1px solid rgba(233, 221, 204, 0.92);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 250, 244, 0.94));
  box-shadow: var(--ifu-shadow-soft);
  cursor: pointer;
}

.conversation-item--priority {
  background: linear-gradient(180deg, rgba(255, 248, 239, 0.98), rgba(255, 250, 244, 0.96));
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
  background: var(--ifu-danger);
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
  font-weight: 600;
  color: var(--ifu-text-strong);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-item__priority-pill {
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 10px;
  color: #fff;
  background: linear-gradient(120deg, var(--ifu-gold-700), var(--ifu-gold-500));
}

.conversation-item__time {
  font-size: 12px;
  color: var(--ifu-text-muted);
  flex-shrink: 0;
  margin-left: 8px;
}

.conversation-item__preview {
  font-size: 13px;
  color: var(--ifu-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.conversation-empty {
  margin: 0;
}
</style>
