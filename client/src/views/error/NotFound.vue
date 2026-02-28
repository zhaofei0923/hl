<template>
  <div class="page not-found-page">
    <van-empty
      image="error"
      description="页面走丢了"
    >
      <van-button round type="primary" class="not-found-btn" @click="goHome">
        返回首页
      </van-button>
    </van-empty>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

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
}

.not-found-btn {
  width: 160px;
}
</style>
