<template>
  <div class="page page--with-tabbar matchmaker-page">
    <section class="matchmaker-hero">
      <div class="matchmaker-hero__actions">
        <button type="button" @click="$router.push('/certification')">
          <van-icon name="certificate" size="18" />
        </button>
        <button type="button" @click="$router.push('/settings')">
          <van-icon name="setting-o" size="18" />
        </button>
      </div>

      <div class="matchmaker-hero__identity">
        <div class="matchmaker-hero__avatar-wrap">
          <van-image
            round
            width="70"
            height="70"
            :src="userStore.userInfo?.avatarUrl || defaultAvatar"
            fit="cover"
          />
          <div v-if="completionPercent < 100" class="matchmaker-hero__badge">
            {{ completionPercent }}%
          </div>
        </div>

        <div class="matchmaker-hero__info">
          <span class="brand-label">MATCHMAKER STUDIO</span>
          <div class="matchmaker-hero__name-row">
            <h2>{{ userStore.userInfo?.nickname || '婚介用户' }}</h2>
            <span class="brand-chip">婚介</span>
          </div>
          <p>今天先处理高意向会员、近期活动和收益提醒，把经营动作排到最前面。</p>
          <van-button size="small" round class="matchmaker-hero__switch" @click="handleSwitchRole">
            切换至求偶
          </van-button>
        </div>
      </div>

      <div class="matchmaker-hero__stats">
        <button
          v-for="item in statsItems"
          :key="item.label"
          type="button"
          class="matchmaker-hero__stat"
          @click="handleStatsClick(item)"
        >
          <strong>{{ item.value }}</strong>
          <span>{{ item.label }}</span>
        </button>
      </div>

    </section>

    <section class="card matchmaker-queue" data-testid="matchmaker-priority-queue">
      <div class="matchmaker-card__header">
        <span class="brand-label">TODAY QUEUE</span>
        <span>按经营优先级</span>
      </div>
      <article v-for="item in priorityQueue" :key="item.title" class="matchmaker-queue__item">
        <div class="matchmaker-queue__icon" :style="{ color: item.color }">
          <van-icon :name="item.icon" size="18" />
        </div>
        <div>
          <strong>{{ item.title }}</strong>
          <p>{{ item.desc }}</p>
        </div>
        <span>{{ item.tag }}</span>
      </article>
    </section>

    <section class="card matchmaker-card">
      <div class="matchmaker-card__header">
        <span class="brand-label">PRIMARY WORKFLOW</span>
        <span>高频任务入口</span>
      </div>
      <div class="matchmaker-card__grid">
        <button
          v-for="item in quickActions"
          :key="item.label"
          type="button"
          class="matchmaker-card__item"
          @click="$router.push(item.route)"
        >
          <div class="matchmaker-card__icon" :style="{ color: item.color }">
            <van-icon :name="item.icon" size="24" />
          </div>
          <strong>{{ item.label }}</strong>
          <span>{{ item.desc }}</span>
        </button>
      </div>
    </section>

    <section class="card matchmaker-card">
      <div class="matchmaker-card__header">
        <span class="brand-label">OPERATIONS</span>
        <span>协作与经营</span>
      </div>
      <div class="matchmaker-card__grid matchmaker-card__grid--compact">
        <button
          v-for="item in menuActions"
          :key="item.label"
          type="button"
          class="matchmaker-card__item"
          @click="$router.push(item.route)"
        >
          <div class="matchmaker-card__icon" :style="{ color: item.color }">
            <van-icon :name="item.icon" size="22" />
          </div>
          <strong>{{ item.label }}</strong>
          <span>{{ item.desc }}</span>
        </button>
      </div>
    </section>

    <section class="card matchmaker-note">
      <span class="brand-label">SERVICE NOTE</span>
      <h3>把业务管理做得像高质量待办，而不是信息堆积。</h3>
      <p>优先跟进待提现、待联络会员和近期开场的活动，让每一个入口都对应清晰动作。</p>
    </section>

    <TabBar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useWalletStore } from '@/stores/wallet'
import { matchmakerApi } from '@/api/matchmaker'
import TabBar from '@/components/common/TabBar.vue'

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
  { label: '团队业绩', value: dashboard.value.teamPerformance || 0, route: '/matchmaker/team' },
  { label: '今日收益', value: dashboard.value.todayEarning || 0, route: '/matchmaker/wallet' },
  { label: '本月收益', value: dashboard.value.monthEarning || 0, route: '/matchmaker/wallet' },
  { label: '提现中', value: dashboard.value.pendingWithdraw || 0, route: '/matchmaker/wallet' }
])

const quickActions = [
  { icon: 'friends-o', label: '我的会员', desc: '查看与维护会员资料', color: 'var(--ifu-warning)', route: '/matchmaker/members' },
  { icon: 'apps-o', label: '会员展示', desc: '分享优质资源卡片', color: 'var(--ifu-info)', route: '/matchmaker/resources' },
  { icon: 'calendar-o', label: '沙龙活动', desc: '组织线下见面场景', color: 'var(--ifu-gold-700)', route: '/matchmaker/salon' },
  { icon: 'share-o', label: '邀请好友', desc: '扩展合作网络', color: 'var(--ifu-warning)', route: '/matchmaker/invite' }
]

const menuActions = [
  { icon: 'cash-back-record', label: '钱包收益', desc: '查看到账与提现', color: 'var(--ifu-success)', route: '/matchmaker/wallet' },
  { icon: 'service-o', label: '客服中心', desc: '获取平台支持', color: 'var(--ifu-info)', route: '/customer-service' }
]

const priorityQueue = [
  { icon: 'friends-o', title: '复核待跟进会员', desc: '先看资料缺口和近期沟通状态，避免会员沉默。', tag: '今日', color: 'var(--ifu-warning)' },
  { icon: 'apps-o', title: '挑选可互推资源', desc: '从资源池里找同城、年龄和学历更接近的对象。', tag: '高频', color: 'var(--ifu-info)' },
  { icon: 'calendar-o', title: '确认沙龙席位', desc: '线下活动前核对到场意向，提升见面转化。', tag: '本周', color: 'var(--ifu-gold-700)' }
]

function handleStatsClick(item) {
  router.push(item.route)
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
.matchmaker-page {
  padding-bottom: calc(90px + env(safe-area-inset-bottom));
}

.matchmaker-hero {
  margin: 0 14px;
  padding: calc(env(safe-area-inset-top) + 22px) 18px 22px;
  border-radius: 0 0 var(--ifu-radius-lg) var(--ifu-radius-lg);
  background:
    radial-gradient(circle at right top, rgba(255, 249, 241, 0.16), transparent 22%),
    linear-gradient(145deg, #7e5d3d, #b58c58 62%, #dbc298);
  color: #fff8ef;
  box-shadow: var(--ifu-shadow-card);
}

.matchmaker-hero__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.matchmaker-hero__actions button {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 248, 239, 0.14);
  border-radius: 14px;
  background: rgba(255, 248, 239, 0.12);
  color: #fff;
}

.matchmaker-hero__identity {
  display: flex;
  gap: 14px;
  align-items: center;
  margin-top: 18px;
}

.matchmaker-hero__avatar-wrap {
  position: relative;
}

.matchmaker-hero__badge {
  position: absolute;
  right: -4px;
  bottom: -4px;
  padding: 2px 7px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  background: rgba(58, 46, 35, 0.86);
  color: #fff8ef;
  font-size: 10px;
}

.matchmaker-hero__info {
  flex: 1;
}

.matchmaker-hero__name-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}

.matchmaker-hero__name-row h2 {
  font-size: 26px;
}

.matchmaker-hero__info p {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.65;
  color: rgba(255, 248, 239, 0.78);
}

.matchmaker-hero__switch {
  margin-top: 12px;
  background: rgba(255, 255, 255, 0.9) !important;
  color: var(--ifu-text-strong) !important;
  border-color: rgba(255, 255, 255, 0.9) !important;
}

.matchmaker-hero__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
}

.matchmaker-hero__stat {
  padding: 12px 8px;
  border-radius: 18px;
  border: 1px solid rgba(255, 248, 239, 0.14);
  background: rgba(255, 248, 239, 0.12);
  color: #fff8ef;
  text-align: center;
}

.matchmaker-hero__stat strong {
  display: block;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 18px;
}

.matchmaker-hero__stat span {
  display: block;
  margin-top: 6px;
  font-size: 11px;
  color: rgba(255, 248, 239, 0.74);
}

.matchmaker-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  font-size: 12px;
  color: var(--ifu-text-muted);
}

.matchmaker-queue__item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid rgba(233, 221, 204, 0.68);
}

.matchmaker-queue__item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.matchmaker-queue__icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 15px;
  background: rgba(246, 235, 221, 0.72);
}

.matchmaker-queue__item strong {
  display: block;
  font-size: 14px;
  color: var(--ifu-text-strong);
}

.matchmaker-queue__item p {
  margin-top: 5px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--ifu-text);
}

.matchmaker-queue__item > span {
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(200, 169, 119, 0.16);
  color: var(--ifu-gold-700);
  font-size: 11px;
  white-space: nowrap;
}

.matchmaker-card__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.matchmaker-card__item {
  padding: 16px 12px;
  border-radius: 20px;
  border: 1px solid rgba(226, 205, 169, 0.48);
  background: rgba(255, 252, 247, 0.82);
  text-align: left;
}

.matchmaker-card__icon {
  margin-bottom: 12px;
}

.matchmaker-card__item strong {
  display: block;
  font-size: 14px;
  color: var(--ifu-text-strong);
}

.matchmaker-card__item span {
  display: block;
  margin-top: 6px;
  font-size: 11px;
  line-height: 1.6;
  color: var(--ifu-text-muted);
}

.matchmaker-note h3 {
  margin-top: 6px;
  font-size: 22px;
  line-height: 1.3;
}

.matchmaker-note p {
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--ifu-text);
}

@media (max-width: 420px) {
  .matchmaker-card__grid,
  .matchmaker-hero__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
