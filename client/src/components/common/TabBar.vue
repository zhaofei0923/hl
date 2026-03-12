<template>
  <Teleport to="body">
    <van-tabbar v-model="active" :fixed="true" :z-index="1000" :safe-area-inset-bottom="true" class="brand-tabbar">
      <!-- 用户端首页 -->
      <van-tabbar-item v-if="isUser" name="home" icon="home-o" to="/user/home">
        首页
      </van-tabbar-item>

      <!-- 消息 -->
      <van-tabbar-item name="messages" icon="chat-o" :badge="unreadCount || ''" to="/messages">
        消息
      </van-tabbar-item>

      <!-- 我的 -->
      <van-tabbar-item name="mine" icon="user-o" :to="mineRoute">
        我的
      </van-tabbar-item>
    </van-tabbar>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useMessageStore } from '@/stores/message'

const route = useRoute()
const userStore = useUserStore()
const messageStore = useMessageStore()

const active = computed(() => route.meta.tabActive || '')
const isUser = computed(() => userStore.isUser)
const unreadCount = computed(() => messageStore.totalUnread > 99 ? '99+' : messageStore.totalUnread)
const mineRoute = computed(() => userStore.isMatchmaker ? '/matchmaker/profile' : '/user/profile')
</script>

<style scoped>
.brand-tabbar :deep(.van-tabbar-item__text) {
  font-size: 11px;
  letter-spacing: 0.02em;
}

.brand-tabbar :deep(.van-badge) {
  background: var(--ifu-danger);
  border-color: transparent;
}
</style>
