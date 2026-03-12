<template>
  <div class="page page--with-tabbar">
    <!-- 顶部渐变横幅 -->
    <div class="profile-banner">
      <div class="profile-banner__actions">
        <van-icon name="certificate" size="22" color="#fff" @click="$router.push('/certification')" />
        <van-icon name="setting-o" size="22" color="#fff" @click="$router.push('/settings')" />
      </div>

      <!-- 用户信息 -->
      <div class="profile-user">
        <div class="profile-user__avatar-wrap">
          <van-image
            round
            width="64"
            height="64"
            :src="userStore.userInfo?.avatarUrl || defaultAvatar"
            fit="cover"
          />
          <div v-if="completionPercent < 100" class="profile-user__badge">
            {{ completionPercent }}%
          </div>
        </div>
        <div class="profile-user__info">
          <div class="profile-user__name-row">
            <span class="profile-user__name">{{ userStore.userInfo?.nickname || '婚介用户' }}</span>
            <van-tag type="primary" round size="medium">婚介</van-tag>
          </div>
          <div class="profile-user__id">ID: {{ userStore.userInfo?.id || '--' }}</div>
          <van-button
            size="small"
            round
            class="profile-user__switch"
            @click="handleSwitchRole"
          >
            切换至求偶
          </van-button>
        </div>
      </div>
    </div>

    <!-- 数据统计栏 -->
    <StatsBar :items="statsItems" @click="handleStatsClick" />

    <!-- 快捷功能 -->
    <div class="card">
      <div class="action-grid">
        <div
          v-for="item in quickActions"
          :key="item.label"
          class="action-grid__item"
          @click="$router.push(item.route)"
        >
          <van-icon :name="item.icon" :size="28" :color="item.color" />
          <span>{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- 扩展功能 -->
    <div class="card">
      <div class="action-grid action-grid--small">
        <div
          v-for="item in menuActions"
          :key="item.label"
          class="action-grid__item"
          @click="$router.push(item.route)"
        >
          <van-icon :name="item.icon" :size="24" :color="item.color" />
          <span>{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- 底部 TabBar -->
    <TabBar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { useWalletStore } from '@/stores/wallet'
import { matchmakerApi } from '@/api/matchmaker'
import TabBar from '@/components/common/TabBar.vue'
import StatsBar from '@/components/matchmaker/StatsBar.vue'

const router = useRouter()
const userStore = useUserStore()
const walletStore = useWalletStore()

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iI0UwRTBFMCIvPjxwYXRoIGQ9Ik0zMiAyMGE4IDggMCAxIDAgMCAxNiA4IDggMCAwIDAgMC0xNnptMCAyMGMtOC44NCAwLTE2IDMuNTgtMTYgOHYyaDMydi0yYzAtNC40Mi03LjE2LTgtMTYtOHoiIGZpbGw9IiNBMEEwQTAiLz48L3N2Zz4='
const completionPercent = ref(80)

const dashboard = ref({
  teamPerformance: 0,
  todayEarning: 0,
  monthEarning: 0,
  pendingWithdraw: 0
})

const statsItems = computed(() => [
  { label: '团队业绩', value: dashboard.value.teamPerformance },
  { label: '今日收益', value: dashboard.value.todayEarning },
  { label: '本月收益', value: dashboard.value.monthEarning },
  { label: '提现中', value: dashboard.value.pendingWithdraw }
])

const quickActions = [
  { icon: 'balance-o', label: '我的钱包', color: '#E84D5F', route: '/matchmaker/wallet' },
  { icon: 'friends-o', label: '我的会员', color: '#FF7D41', route: '/matchmaker/members' },
  { icon: 'apps-o', label: '会员展示', color: '#1989fa', route: '/matchmaker/resources' },
  { icon: 'cluster-o', label: '婚介团', color: '#07c160', route: '/matchmaker/team' }
]

const menuActions = [
  { icon: 'share-o', label: '邀请好友', color: '#FF7D41', route: '/matchmaker/invite' },
  { icon: 'service-o', label: '客服中心', color: '#1989fa', route: '/customer-service' },
  { icon: 'shop-o', label: '我的商城', color: '#07c160', route: '/matchmaker/shop' },
  { icon: 'orders-o', label: '业绩订单', color: '#E84D5F', route: '/matchmaker/orders' },
  { icon: 'manager-o', label: '我的红娘', color: '#8B6914', route: '/matchmaker/my-matchmakers' },
  { icon: 'calendar-o', label: '沙龙活动', color: '#722ED1', route: '/matchmaker/salon' },
  { icon: 'location-o', label: '门店信息', color: '#13C2C2', route: '/matchmaker/store' },
  { icon: 'qr', label: '收款码', color: '#FA8C16', route: '/matchmaker/qrcode' }
]

function handleStatsClick(item) {
  if (item.label === '团队业绩') router.push('/matchmaker/team')
  else if (item.label === '提现中') router.push('/matchmaker/wallet')
}

async function handleSwitchRole() {
  try {
    await userStore.switchRole('user')
    router.replace('/user/home')
  } catch (err) {
    // handled by interceptor
  }
}

onMounted(async () => {
  try {
    const res = await matchmakerApi.getDashboard()
    if (res.data) {
      dashboard.value = res.data
    }
  } catch (err) {
    // handled by interceptor
  }

  walletStore.fetchWalletInfo().catch(() => {})
})
</script>

<style scoped>
.profile-banner {
  background: linear-gradient(135deg, var(--hl-accent-color), var(--hl-primary-color));
  padding: 48px 16px 24px;
  border-radius: 0 0 20px 20px;
}

.profile-banner__actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-bottom: 16px;
}

.profile-user {
  display: flex;
  gap: 16px;
  align-items: center;
}

.profile-user__avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.profile-user__badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: var(--hl-primary-color);
  color: #fff;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 8px;
  border: 2px solid #fff;
}

.profile-user__info {
  flex: 1;
  color: #fff;
}

.profile-user__name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.profile-user__name {
  font-size: 18px;
  font-weight: 600;
}

.profile-user__id {
  font-size: 12px;
  opacity: 0.85;
  margin-bottom: 8px;
}

.profile-user__switch {
  font-size: 12px;
  background: rgba(255, 255, 255, 0.9) !important;
  color: var(--hl-primary-color) !important;
  border-color: rgba(255, 255, 255, 0.9) !important;
  font-weight: 500;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px 0;
}

.action-grid--small .action-grid__item {
  padding: 8px 0;
}

.action-grid__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 0;
}

.action-grid__item span {
  font-size: 12px;
  color: var(--hl-text-secondary);
}
</style>
