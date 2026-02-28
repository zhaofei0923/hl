<template>
  <div class="page chat-page">
    <van-nav-bar :title="otherUser.nickname || '聊天'" left-arrow @click-left="$router.back()" />

    <div ref="messageListRef" class="chat-messages" @scroll="handleScroll">
      <div v-if="loadingMore" class="chat-loading">
        <van-loading size="20" />
      </div>

      <div
        v-for="msg in messages"
        :key="msg.id"
        class="chat-bubble-wrap"
        :class="{ 'chat-bubble-wrap--self': msg.senderId === currentUserId }"
      >
        <van-image
          round
          width="36"
          height="36"
          :src="msg.senderId === currentUserId ? myAvatar : otherUser.avatarUrl || defaultAvatar"
          fit="cover"
          class="chat-bubble__avatar"
        />
        <div class="chat-bubble" :class="{ 'chat-bubble--self': msg.senderId === currentUserId }">
          <div class="chat-bubble__content">{{ msg.content }}</div>
          <div class="chat-bubble__time">{{ formatDate(msg.createdAt, 'HH:mm') }}</div>
        </div>
      </div>

      <EmptyState v-if="!loading && messages.length === 0" text="暂无消息，说点什么吧" />
    </div>

    <div class="chat-input-bar">
      <van-field
        v-model="inputText"
        type="textarea"
        :autosize="{ maxHeight: 80 }"
        rows="1"
        placeholder="输入消息..."
        class="chat-input-bar__field"
        @keypress.enter.prevent="handleSend"
      />
      <van-button
        type="primary"
        size="small"
        round
        :disabled="!inputText.trim()"
        @click="handleSend"
      >
        发送
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { messageApi } from '@/api/message'
import { formatDate } from '@/utils/format'
import EmptyState from '@/components/common/EmptyState.vue'

const route = useRoute()
const userStore = useUserStore()

const conversationId = route.params.conversationId
const currentUserId = userStore.userInfo?.id

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyNCIgZmlsbD0iI0UwRTBFMCIvPjxwYXRoIGQ9Ik0yNCAxNmE2IDYgMCAxIDAgMCAxMiA2IDYgMCAwIDAgMC0xMnptMCAxNmMtNi42MyAwLTEyIDIuNjktMTIgNnYyaDI0di0yYzAtMy4zMS01LjM3LTYtMTItNnoiIGZpbGw9IiNBMEEwQTAiLz48L3N2Zz4='
const myAvatar = userStore.userInfo?.avatarUrl || defaultAvatar

const messages = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const inputText = ref('')
const messageListRef = ref(null)
const page = ref(1)
const hasMore = ref(true)

const otherUser = ref({
  nickname: '',
  avatarUrl: ''
})

async function fetchMessages(isLoadMore = false) {
  if (!isLoadMore) {
    loading.value = true
  } else {
    loadingMore.value = true
  }

  try {
    const params = { page: page.value, pageSize: 20 }
    const res = await messageApi.getMessages(conversationId, params)
    const list = res.data?.list || []

    // Extract other user info from conversation data
    if (res.data?.otherUser) {
      otherUser.value = res.data.otherUser
    }

    if (isLoadMore) {
      // Prepend older messages to the top
      const prevHeight = messageListRef.value?.scrollHeight || 0
      messages.value = [...list, ...messages.value]
      // Restore scroll position after prepending
      nextTick(() => {
        if (messageListRef.value) {
          const newHeight = messageListRef.value.scrollHeight
          messageListRef.value.scrollTop = newHeight - prevHeight
        }
      })
    } else {
      messages.value = list
      scrollToBottom()
    }

    if (list.length < 20) {
      hasMore.value = false
    }
  } catch (err) {
    // handled by interceptor
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

async function handleSend() {
  const content = inputText.value.trim()
  if (!content) return

  inputText.value = ''

  // Optimistically add the message to the list
  const tempMsg = {
    id: `temp_${Date.now()}`,
    senderId: currentUserId,
    content,
    contentType: 'text',
    createdAt: new Date().toISOString()
  }
  messages.value.push(tempMsg)
  scrollToBottom()

  try {
    const res = await messageApi.send({
      conversationId,
      content,
      contentType: 'text'
    })
    // Replace temp message with real one
    const idx = messages.value.findIndex(m => m.id === tempMsg.id)
    if (idx !== -1 && res.data) {
      messages.value.splice(idx, 1, res.data)
    }
  } catch (err) {
    // Mark the message as failed if send fails
    const idx = messages.value.findIndex(m => m.id === tempMsg.id)
    if (idx !== -1) {
      messages.value[idx].sendFailed = true
    }
  }
}

function handleScroll() {
  if (!messageListRef.value) return
  // Load more when scrolled to top
  if (messageListRef.value.scrollTop <= 50 && hasMore.value && !loadingMore.value) {
    page.value++
    fetchMessages(true)
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

onMounted(async () => {
  const starter = route.query.starter
  if (typeof starter === 'string' && starter.trim()) {
    inputText.value = starter.trim()
  }

  await fetchMessages()
  // Mark as read after loading messages
  messageApi.markAsRead(conversationId).catch(() => {})
})
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--hl-bg-color);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  -webkit-overflow-scrolling: touch;
}

.chat-loading {
  display: flex;
  justify-content: center;
  padding: 12px 0;
}

.chat-bubble-wrap {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 8px;
}

.chat-bubble-wrap--self {
  flex-direction: row-reverse;
}

.chat-bubble__avatar {
  flex-shrink: 0;
}

.chat-bubble {
  max-width: 65%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.chat-bubble--self {
  align-items: flex-end;
}

.chat-bubble__content {
  padding: 10px 14px;
  border-radius: var(--hl-radius-md);
  font-size: 15px;
  line-height: 1.5;
  word-break: break-word;
  background: var(--hl-card-bg);
  color: var(--hl-text-primary);
  position: relative;
}

.chat-bubble--self .chat-bubble__content {
  background: var(--hl-primary-color);
  color: #fff;
}

.chat-bubble__time {
  font-size: 11px;
  color: var(--hl-text-placeholder);
  margin-top: 4px;
  padding: 0 4px;
}

.chat-input-bar {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 12px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
  background: var(--hl-card-bg);
  border-top: 1px solid var(--hl-border-color);
}

.chat-input-bar__field {
  flex: 1;
  background: var(--hl-bg-color);
  border-radius: var(--hl-radius-sm);
  padding: 6px 12px;
}

.chat-input-bar__field :deep(.van-field__control) {
  font-size: 15px;
  line-height: 1.4;
}

.chat-input-bar :deep(.van-button) {
  flex-shrink: 0;
  height: 34px;
  padding: 0 16px;
}
</style>
