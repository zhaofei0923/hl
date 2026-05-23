<template>
  <div class="page not-found-page">
    <section class="not-found-card" data-testid="not-found-shell">
      <span class="brand-label">404</span>
      <h1>这个页面暂时不可访问</h1>
      <p>{{ helperText }}</p>
      <div class="not-found-card__actions">
        <van-button round type="primary" class="not-found-btn" @click="goHome">
          {{ actionText }}
        </van-button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const actionText = computed(() => userStore.isLoggedIn ? '返回工作台' : '返回登录')
const helperText = computed(() => {
  if (!userStore.isLoggedIn) return '请先登录，再继续访问会员、红娘或管理相关页面。'
  return userStore.isMatchmaker ? '可以先回到红娘工作台，再从功能入口重新进入。' : '可以先回到首页，再从推荐、消息或个人中心重新进入。'
})

function goHome() {
  if (userStore.isLoggedIn) {
    const path = userStore.isMatchmaker ? '/matchmaker/profile' : '/user/home'
    router.replace(path)
  } else {
    router.replace('/login')
  }
}
</script>

<style scoped>
.not-found-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px 16px;
  background:
    radial-gradient(circle at top left, rgba(200, 169, 119, 0.18), transparent 34%),
    linear-gradient(180deg, #fffaf4 0%, #f5eadb 100%);
}

.not-found-card {
  width: 100%;
  max-width: 360px;
  padding: 28px 22px;
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: var(--ifu-shadow-soft);
  text-align: center;
}

.not-found-card h1 {
  margin: 10px 0 8px;
  color: var(--ifu-text-strong);
  font-size: 24px;
  line-height: 1.3;
}

.not-found-card p {
  margin: 0;
  color: var(--ifu-text-muted);
  font-size: 14px;
  line-height: 1.7;
}

.not-found-card__actions {
  margin-top: 22px;
}

.not-found-btn {
  width: 160px;
}
</style>
