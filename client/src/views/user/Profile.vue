<template>
  <div class="page page--with-tabbar">
    <!-- 顶部用户信息 -->
    <div class="profile-header">
      <div class="profile-header__bg"></div>
      <div class="profile-header__content">
        <van-image
          round
          width="72"
          height="72"
          :src="userStore.userInfo?.avatarUrl || defaultAvatar"
          fit="cover"
          class="profile-header__avatar"
        />
        <h2 class="profile-header__name">{{ userStore.userInfo?.nickname || '用户' }}</h2>
        <p class="profile-header__id">ID: {{ userStore.userInfo?.id || '--' }}</p>

        <!-- 资料完成度 -->
        <div class="profile-progress">
          <div class="profile-progress__label">
            <span>资料完成度</span>
            <span class="profile-progress__percent">{{ completionPercent }}%</span>
          </div>
          <van-progress
            :percentage="completionPercent"
            :show-pivot="false"
            color="var(--hl-primary-color)"
            track-color="rgba(255,255,255,0.3)"
            stroke-width="6"
          />
        </div>
      </div>
    </div>

    <!-- 菜单列表 -->
    <div class="profile-menu">
      <van-cell-group :border="false">
        <van-cell
          title="编辑资料"
          icon="edit"
          is-link
          @click="$router.push('/user/profile/edit')"
        />
        <van-cell
          title="推荐匹配"
          icon="like-o"
          is-link
          @click="$router.push('/user/match-list')"
        />
        <van-cell
          title="我的消息"
          icon="chat-o"
          is-link
          :value="unreadText"
          @click="$router.push('/messages')"
        />
        <van-cell
          title="沙龙活动"
          icon="calendar-o"
          is-link
          @click="$router.push('/user/salon')"
        />
        <van-cell
          title="认证中心"
          icon="shield-o"
          is-link
          @click="$router.push('/certification')"
        />
        <van-cell
          title="客服中心"
          icon="service-o"
          is-link
          @click="$router.push('/customer-service')"
        />
        <van-cell
          title="设置"
          icon="setting-o"
          is-link
          @click="$router.push('/settings')"
        />
      </van-cell-group>
    </div>

    <!-- 切换到婚介角色 -->
    <div v-if="userStore.userInfo?.hasMatchmakerRole" class="profile-switch">
      <van-button block round type="primary" plain @click="handleSwitchToMatchmaker">
        切换至婚介端
      </van-button>
    </div>

    <!-- 申请成为红娘 -->
    <div v-else class="profile-switch">
      <van-button block round type="primary" plain @click="handleApplyMatchmaker">
        申请成为红娘
      </van-button>
    </div>

    <!-- 底部 TabBar -->
    <TabBar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useMessageStore } from '@/stores/message'
import { matchmakerApi } from '@/api/matchmaker'
import { showConfirmDialog, showSuccessToast, showFailToast } from 'vant'
import TabBar from '@/components/common/TabBar.vue'

const router = useRouter()
const userStore = useUserStore()
const messageStore = useMessageStore()

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iNzIiIHZpZXdCb3g9IjAgMCA3MiA3MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzNiIgY3k9IjM2IiByPSIzNiIgZmlsbD0iI0UwRTBFMCIvPjxwYXRoIGQ9Ik0zNiAyMmExMCAxMCAwIDEgMCAwIDIwIDEwIDEwIDAgMCAwIDAtMjB6bTAgMjZjLTkuOTQgMC0xOCA0LjAzLTE4IDl2M2gzNnYtM2MwLTQuOTctOC4wNi05LTE4LTl6IiBmaWxsPSIjQTBBMEEwIi8+PC9zdmc+'
const completionPercent = ref(60)

const unreadText = computed(() => {
  if (messageStore.totalUnread > 0) {
    return `${messageStore.totalUnread}条未读`
  }
  return ''
})

async function handleSwitchToMatchmaker() {
  try {
    await userStore.switchRole('matchmaker')
    router.replace('/matchmaker/profile')
  } catch (err) {
    // handled by interceptor
  }
}

async function handleApplyMatchmaker() {
  try {
    await showConfirmDialog({
      title: '申请成为红娘',
      message: '成为红娘后，您可以管理会员、撮合匹配并获取收益。确认申请吗？',
    })
    await matchmakerApi.apply({})
    showSuccessToast('申请成功')
    // 切换到红娘角色
    await userStore.switchRole('matchmaker')
    router.replace('/matchmaker/profile')
  } catch (err) {
    if (err === 'cancel' || err?.message === 'cancel') return
    showFailToast(err?.response?.data?.message || '申请失败，请稍后重试')
  }
}

onMounted(() => {
  userStore.fetchUserInfo().catch(() => {})
  messageStore.fetchUnreadCount().catch(() => {})
})
</script>

<style scoped>
.profile-header {
  position: relative;
  padding-bottom: 16px;
}

.profile-header__bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 160px;
  background: linear-gradient(135deg, var(--hl-accent-color), var(--hl-primary-color));
  border-radius: 0 0 24px 24px;
}

.profile-header__content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 40px;
}

.profile-header__avatar {
  border: 3px solid #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.profile-header__name {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin-top: 12px;
}

.profile-header__id {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
}

.profile-progress {
  width: calc(100% - 64px);
  margin-top: 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--hl-radius-sm);
  padding: 12px 16px;
}

.profile-progress__label {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #fff;
  margin-bottom: 8px;
}

.profile-progress__percent {
  font-weight: 600;
}

.profile-menu {
  margin: 12px 16px;
  border-radius: var(--hl-radius-md);
  overflow: hidden;
}

.profile-switch {
  padding: 16px;
}
</style>
