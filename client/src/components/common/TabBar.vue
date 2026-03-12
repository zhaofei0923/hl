<template>
  <Teleport to="body">
    <!-- 原生固定导航栏，不依赖 van-tabbar 内部实现，保留 .van-tabbar 类供 e2e 测试 -->
    <nav class="ifu-tabbar van-tabbar" data-testid="app-tabbar" aria-label="主导航">
      <router-link
        v-if="isUser"
        to="/user/home"
        class="ifu-tabbar__item"
        :class="{ 'ifu-tabbar__item--active': active === 'home' }"
      >
        <van-icon name="home-o" size="22" />
        <span>首页</span>
      </router-link>

      <router-link
        to="/messages"
        class="ifu-tabbar__item"
        :class="{ 'ifu-tabbar__item--active': active === 'messages' }"
      >
        <span class="ifu-tabbar__icon-wrap">
          <van-icon name="chat-o" size="22" />
          <sup v-if="unreadCount" class="ifu-tabbar__badge">{{ unreadCount }}</sup>
        </span>
        <span>消息</span>
      </router-link>

      <router-link
        :to="mineRoute"
        class="ifu-tabbar__item"
        :class="{ 'ifu-tabbar__item--active': active === 'mine' }"
      >
        <van-icon name="user-o" size="22" />
        <span>我的</span>
      </router-link>
    </nav>
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
const unreadCount = computed(() => {
  const n = messageStore.totalUnread
  return n > 99 ? '99+' : n || 0
})
const mineRoute = computed(() => userStore.isMatchmaker ? '/matchmaker/profile' : '/user/profile')
</script>

<!-- 用全局样式（非 scoped），确保 Teleport 节点也能正确应用样式 -->
<style>
.ifu-tabbar {
  position: fixed !important;
  bottom: 0 !important;
  left: 0;
  right: 0;
  z-index: 9999 !important;
  display: flex;
  height: 50px;
  padding-bottom: env(safe-area-inset-bottom);
  background: #fff9f3;
  border-top: 1px solid rgba(233, 221, 204, 0.9);
  box-shadow: 0 -4px 16px rgba(83, 59, 33, 0.06);
}

.ifu-tabbar__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: #9a8a78;
  font-size: 10px;
  letter-spacing: 0.02em;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
}

.ifu-tabbar__item--active {
  color: #a67c52;
}

.ifu-tabbar__icon-wrap {
  position: relative;
  display: inline-flex;
}

.ifu-tabbar__badge {
  position: absolute;
  top: -4px;
  right: -8px;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  border-radius: 999px;
  background: #a85d52;
  color: #fff;
  font-size: 9px;
  font-style: normal;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
</style>
