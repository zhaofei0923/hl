<template>
  <div class="page page--with-tabbar profile-page">
    <section class="profile-hero">
      <div class="profile-hero__topline">
        <span class="brand-label">PERSONAL SALON</span>
        <button type="button" class="profile-hero__settings" @click="$router.push('/settings')">
          <van-icon name="setting-o" size="18" />
        </button>
      </div>

      <div class="profile-hero__main">
        <van-image
          round
          width="78"
          height="78"
          :src="userStore.userInfo?.avatarUrl || defaultAvatar"
          fit="cover"
          class="profile-hero__avatar"
        />
        <div class="profile-hero__info">
          <h2 class="profile-hero__name">{{ userStore.userInfo?.nickname || '用户' }}</h2>
          <div class="profile-hero__meta">
            <span class="brand-chip">{{ completionPercent }}% 资料完成</span>
            <span class="brand-chip brand-chip--ghost">{{ unreadText || '消息静默中' }}</span>
          </div>
          <p class="profile-hero__intro">把资料写得更准确，平台和红娘才能给你更像“合适的人”的推荐。</p>
        </div>
      </div>

      <div class="profile-progress">
        <div class="profile-progress__label">
          <span>完善度</span>
          <span class="profile-progress__percent">{{ completionPercent }}%</span>
        </div>
        <van-progress
          :percentage="completionPercent"
          :show-pivot="false"
          color="linear-gradient(90deg, #e2cda9, #a67c52)"
          track-color="rgba(255,255,255,0.32)"
          stroke-width="6"
        />
      </div>
    </section>

    <section class="profile-status card" data-testid="profile-status-card">
      <div class="profile-status__head">
        <div>
          <span class="brand-label">RELATION READINESS</span>
          <h3>关系准备度</h3>
        </div>
        <span class="profile-status__mark">建议优先</span>
      </div>
      <p>把资料、认证和沟通入口放在同一张卡片里，先补齐影响推荐质量的部分。</p>
      <div class="profile-status__stats">
        <article v-for="item in readinessStats" :key="item.label">
          <strong>{{ item.value }}</strong>
          <span>{{ item.label }}</span>
        </article>
      </div>
    </section>

    <section class="profile-journey card" data-testid="profile-journey-card">
      <div class="profile-journey__head">
        <span class="brand-label">NEXT MOVES</span>
        <strong>本周可推进的三件事</strong>
      </div>
      <article v-for="step in journeySteps" :key="step.title" class="profile-journey__item">
        <div class="profile-journey__dot"></div>
        <div>
          <strong>{{ step.title }}</strong>
          <p>{{ step.desc }}</p>
        </div>
      </article>
    </section>

    <section class="profile-nav card">
      <div class="profile-actions__grid">
        <button v-for="action in heroActions" :key="action.label" type="button" class="profile-actions__item" @click="$router.push(action.route)">
          <div class="profile-actions__icon" :style="{ color: action.color }">
            <van-icon :name="action.icon" size="22" />
          </div>
          <strong>{{ action.label }}</strong>
          <span>{{ action.desc }}</span>
        </button>
      </div>

      <div class="profile-nav__divider">
        <span class="brand-label">更多服务</span>
      </div>

      <button
        v-for="item in menuItems"
        :key="item.label"
        type="button"
        class="profile-menu__item"
        @click="$router.push(item.route)"
      >
        <div class="profile-menu__item-left">
          <div class="profile-menu__icon" :style="{ color: item.color }">
            <van-icon :name="item.icon" size="18" />
          </div>
          <div>
            <strong>{{ item.label }}</strong>
            <span>{{ item.desc }}</span>
          </div>
        </div>
        <van-icon name="arrow" size="16" />
      </button>
    </section>

    <section class="profile-switch card">
      <div class="profile-switch__content">
        <span class="brand-label">ROLE EXPANSION</span>
        <h3>{{ userStore.userInfo?.hasMatchmakerRole ? '切换到婚介端继续管理撮合' : '申请成为红娘，进入协作端' }}</h3>
        <p>{{ userStore.userInfo?.hasMatchmakerRole ? '如果你也在帮助别人牵线，可以直接切到红娘视角继续服务。' : '审核通过后可管理会员、撮合匹配并获得收益。' }}</p>
      </div>
      <van-button
        block
        round
        :type="userStore.userInfo?.hasMatchmakerRole ? 'default' : 'primary'"
        @click="userStore.userInfo?.hasMatchmakerRole ? handleSwitchToMatchmaker() : handleApplyMatchmaker()"
      >
        {{ userStore.userInfo?.hasMatchmakerRole ? '切换至婚介端' : '申请成为红娘' }}
      </van-button>
    </section>

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
    return `${messageStore.totalUnread} 条未读`
  }
  return ''
})

const heroActions = computed(() => [
  { label: '编辑资料', desc: '补全择偶信息', icon: 'edit', color: 'var(--ifu-gold-700)', route: '/user/profile/edit' },
  { label: '推荐匹配', desc: '查看更多推荐', icon: 'like-o', color: 'var(--ifu-warning)', route: '/user/match-list' },
  { label: '我的消息', desc: unreadText.value || '查看最近对话', icon: 'chat-o', color: 'var(--ifu-info)', route: '/messages' }
])

const readinessStats = computed(() => [
  { label: '资料完整度', value: `${completionPercent.value}%` },
  { label: '未读消息', value: messageStore.totalUnread || 0 },
  { label: '高频入口', value: '3' }
])

const journeySteps = [
  { title: '补充生活节奏', desc: '把作息、周末安排和见面偏好写清楚，红娘更容易给出有效建议。' },
  { title: '完成可信认证', desc: '认证会优先影响资料可信度，也会提升推荐卡片里的展示权重。' },
  { title: '主动回应沟通', desc: '先回复近期对话，再决定是否让红娘协助安排下一步。' }
]

const menuItems = [
  { label: '沙龙活动', desc: '报名同城线下活动', icon: 'calendar-o', color: 'var(--ifu-warning)', route: '/user/salon' },
  { label: '认证中心', desc: '提升资料可信度', icon: 'shield-o', color: 'var(--ifu-success)', route: '/certification' },
  { label: '客服中心', desc: '获取人工支持', icon: 'service-o', color: 'var(--ifu-gold-700)', route: '/customer-service' },
  { label: '设置', desc: '账号与通知管理', icon: 'setting-o', color: 'var(--ifu-info)', route: '/settings' }
]

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
.profile-page {
  padding-bottom: calc(90px + env(safe-area-inset-bottom));
}

.profile-hero {
  margin: 0 14px;
  padding: calc(env(safe-area-inset-top) + 22px) 18px 20px;
  border-radius: 0 0 var(--ifu-radius-lg) var(--ifu-radius-lg);
  background:
    radial-gradient(circle at right top, rgba(255, 251, 245, 0.18), transparent 20%),
    linear-gradient(145deg, #8a6440, #c09a68 68%, #e0c79b);
  color: #fff8ef;
  box-shadow: var(--ifu-shadow-card);
}

.profile-hero__topline {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-hero__settings {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 248, 239, 0.16);
  border-radius: 14px;
  background: rgba(255, 248, 239, 0.12);
  color: #fff;
}

.profile-hero__main {
  display: flex;
  gap: 14px;
  margin-top: 18px;
}

.profile-hero__avatar {
  border: 3px solid rgba(255, 255, 255, 0.4);
}

.profile-hero__info {
  flex: 1;
}

.profile-hero__name {
  font-size: 26px;
}

.profile-hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.profile-hero__intro {
  margin-top: 12px;
  font-size: 13px;
  line-height: 1.7;
  color: rgba(255, 248, 239, 0.78);
}

.profile-progress {
  margin-top: 18px;
  padding: 14px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 248, 239, 0.16);
}

.profile-progress__label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}

.profile-progress__percent {
  font-weight: 600;
}

.profile-status__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.profile-status__head h3 {
  margin-top: 6px;
  font-size: 24px;
  line-height: 1.25;
}

.profile-status__mark {
  flex-shrink: 0;
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(194, 139, 78, 0.14);
  color: var(--ifu-warning);
  font-size: 11px;
  font-weight: 600;
}

.profile-status p {
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--ifu-text);
}

.profile-status__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 16px;
}

.profile-status__stats article {
  padding: 14px 10px;
  border-radius: 18px;
  background: rgba(255, 252, 248, 0.9);
  border: 1px solid rgba(233, 221, 204, 0.86);
  text-align: center;
}

.profile-status__stats strong {
  display: block;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 22px;
  color: var(--ifu-text-strong);
}

.profile-status__stats span {
  display: block;
  margin-top: 6px;
  font-size: 11px;
  color: var(--ifu-text-muted);
}

.profile-journey__head {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 12px;
}

.profile-journey__head strong {
  font-size: 20px;
  color: var(--ifu-text-strong);
}

.profile-journey__item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid rgba(233, 221, 204, 0.68);
}

.profile-journey__dot {
  width: 12px;
  height: 12px;
  margin-top: 5px;
  border-radius: 50%;
  background: var(--ifu-gold-500);
  box-shadow: 0 0 0 6px rgba(200, 169, 119, 0.14);
}

.profile-journey__item strong {
  display: block;
  font-size: 14px;
  color: var(--ifu-text-strong);
}

.profile-journey__item p {
  margin-top: 5px;
  font-size: 12px;
  line-height: 1.65;
  color: var(--ifu-text);
}

.profile-actions__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.profile-actions__item {
  padding: 14px 12px;
  border-radius: 20px;
  border: 1px solid rgba(226, 205, 169, 0.48);
  background: rgba(255, 252, 248, 0.86);
  text-align: left;
}

.profile-actions__icon {
  margin-bottom: 12px;
}

.profile-actions__item strong {
  display: block;
  font-size: 14px;
  color: var(--ifu-text-strong);
}

.profile-actions__item span {
  display: block;
  margin-top: 6px;
  font-size: 11px;
  line-height: 1.6;
  color: var(--ifu-text-muted);
}

.profile-nav__divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 0 4px;
  font-size: 11px;
  color: var(--ifu-text-muted);
}

.profile-nav__divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(233, 221, 204, 0.7);
}

.profile-menu__item {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border: none;
  border-bottom: 1px solid rgba(233, 221, 204, 0.6);
  background: transparent;
  color: var(--ifu-text-strong);
  cursor: pointer;
  text-align: left;
}

.profile-menu__item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.profile-menu__item:first-of-type {
  padding-top: 0;
}

.profile-menu__item-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-menu__icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: rgba(246, 235, 221, 0.72);
}

.profile-menu__item strong {
  display: block;
  font-size: 14px;
}

.profile-menu__item span {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--ifu-text-muted);
}

.profile-switch__content h3 {
  margin-top: 6px;
  font-size: 22px;
  line-height: 1.3;
}

.profile-switch__content p {
  margin-top: 10px;
  margin-bottom: 16px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--ifu-text);
}

@media (max-width: 380px) {
  .profile-actions__grid,
  .profile-status__stats {
    grid-template-columns: 1fr;
  }
}
</style>
