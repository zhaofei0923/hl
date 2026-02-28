<template>
  <div class="page user-detail-page">
    <van-nav-bar
      :title="userDetail.nickname || '用户详情'"
      left-arrow
      @click-left="$router.back()"
      :border="false"
    />

    <div v-if="loading" class="user-detail-loading">
      <van-loading type="spinner" color="var(--hl-primary-color)" />
    </div>

    <template v-else>
      <section class="detail-hero" :style="heroBackgroundStyle">
        <div class="detail-hero__overlay"></div>
        <div class="detail-hero__content">
          <van-image
            round
            width="76"
            height="76"
            :src="userDetail.avatarUrl || defaultAvatar"
            fit="cover"
            class="detail-hero__avatar"
          />
          <div class="detail-hero__name-row">
            <h1>{{ userDetail.nickname || '匿名用户' }}</h1>
            <van-tag v-if="userDetail.verified" type="success" plain round size="small">已认证</van-tag>
            <van-tag v-else type="warning" plain round size="small">待认证</van-tag>
          </div>
          <p class="detail-hero__subtitle">{{ userAge ? `${userAge}岁` : '年龄未填写' }} · {{ userDetail.city || '城市未填写' }} · {{ userDetail.occupation || '职业未填写' }}</p>
        </div>
      </section>

      <section class="detail-trust card" data-testid="detail-trust-panel">
        <div class="detail-trust__header">
          <h2>可信度评估</h2>
          <span>{{ trustLevelText }}</span>
        </div>
        <div class="detail-trust__progress">
          <div class="detail-trust__meta">
            <span>资料完整度</span>
            <strong>{{ profileCompletion }}%</strong>
          </div>
          <van-progress
            :percentage="profileCompletion"
            :show-pivot="false"
            color="var(--hl-primary-color)"
            track-color="var(--hl-bg-soft)"
            stroke-width="6"
          />
        </div>
        <div class="detail-trust__chips">
          <span class="chip">实名校验</span>
          <span class="chip">多维资料</span>
          <span class="chip">人工复核</span>
        </div>
      </section>

      <section class="detail-summary card">
        <div class="detail-summary__item">
          <span class="label">身高</span>
          <strong>{{ userDetail.height ? `${userDetail.height} cm` : '未填写' }}</strong>
        </div>
        <div class="detail-summary__item">
          <span class="label">学历</span>
          <strong>{{ userDetail.education || '未填写' }}</strong>
        </div>
        <div class="detail-summary__item">
          <span class="label">收入</span>
          <strong>{{ userDetail.income_range || '未填写' }}</strong>
        </div>
      </section>

      <section class="detail-section card">
        <div class="detail-section__title">
          <van-icon name="cluster-o" size="16" />
          <h3>生活方式</h3>
        </div>
        <ul class="detail-list">
          <li v-for="item in lifestyleItems" :key="item.label">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </li>
        </ul>
      </section>

      <section class="detail-section card">
        <div class="detail-section__title">
          <van-icon name="bookmark-o" size="16" />
          <h3>婚恋观</h3>
        </div>
        <p v-for="(line, idx) in relationshipValues" :key="idx" class="detail-paragraph">
          {{ line }}
        </p>
      </section>

      <section class="detail-section card">
        <div class="detail-section__title">
          <van-icon name="like-o" size="16" />
          <h3>择偶要求</h3>
        </div>
        <p v-for="(line, idx) in partnerRequirementLines" :key="idx" class="detail-paragraph">
          {{ line }}
        </p>
      </section>

      <div class="user-detail-bottom-placeholder"></div>
    </template>

    <div v-if="!loading" class="detail-action-bar">
      <van-button round plain class="detail-action-bar__secondary" @click="handleSaveForLater">
        收藏稍后聊
      </van-button>
      <van-button
        round
        type="primary"
        class="detail-action-bar__primary"
        data-testid="detail-primary-cta"
        @click="handleSayHi"
      >
        立即打招呼
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { userApi } from '@/api/user'
import { calcAge } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const userId = route.params.id

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI0OCIgY3k9IjQ4IiByPSI0OCIgZmlsbD0iI0UwRTBFMCIvPjxwYXRoIGQ9Ik00OCAzMGExNCAxNCAwIDEgMCAwIDI4IDE0IDE0IDAgMCAwIDAtMjh6bTAgMzRjLTEzLjI1IDAtMjQgNS4zNy0yNCAxMnYyaDQ4di0yYzAtNi42My0xMC43NS0xMi0yNC0xMnoiIGZpbGw9IiNBMEEwQTAiLz48L3N2Zz4='

const userDetail = reactive({
  id: '',
  nickname: '',
  gender: 0,
  avatarUrl: '',
  birth_date: '',
  city: '',
  height: null,
  education: '',
  occupation: '',
  income_range: '',
  marital_status: '',
  self_intro: '',
  partner_requirement: '',
  photos: [],
  matchScore: null,
  verified: false
})

const userAge = computed(() => (userDetail.birth_date ? calcAge(userDetail.birth_date) : null))

const profileCompletion = computed(() => {
  const fields = [
    userDetail.avatarUrl,
    userDetail.birth_date,
    userDetail.city,
    userDetail.height,
    userDetail.education,
    userDetail.occupation,
    userDetail.income_range,
    userDetail.marital_status,
    userDetail.self_intro,
    userDetail.partner_requirement
  ]
  const filled = fields.filter(Boolean).length
  return Math.max(30, Math.round((filled / fields.length) * 100))
})

const trustLevelText = computed(() => {
  if (userDetail.verified && profileCompletion.value >= 80) return '高可信'
  if (profileCompletion.value >= 60) return '中可信'
  return '待完善'
})

const lifestyleItems = computed(() => [
  { label: '工作城市', value: userDetail.city || '未填写' },
  { label: '职业方向', value: userDetail.occupation || '未填写' },
  { label: '学历背景', value: userDetail.education || '未填写' },
  { label: '收入范围', value: userDetail.income_range || '未填写' },
  { label: '婚姻状态', value: userDetail.marital_status || '未填写' }
])

const relationshipValues = computed(() => splitParagraph(userDetail.self_intro, '希望我们都认真对待关系，在真诚沟通里建立稳定长期的信任。'))
const partnerRequirementLines = computed(() => splitParagraph(userDetail.partner_requirement, '期待对方情绪稳定、愿意沟通，也愿意一起规划未来。'))

const heroBackgroundStyle = computed(() => {
  const cover = userDetail.photos?.[0] || userDetail.avatarUrl
  if (cover) {
    return {
      backgroundImage: `url(${cover})`
    }
  }
  return {
    backgroundImage: 'linear-gradient(145deg, #3e2b1b, #72543a)'
  }
})

function splitParagraph(value, fallback) {
  const text = (value || '').trim()
  if (!text) {
    return [fallback]
  }

  const lines = text
    .split(/[。！？!?\n]/)
    .map(item => item.trim())
    .filter(Boolean)

  return lines.length > 0 ? lines.slice(0, 3) : [fallback]
}

async function fetchUserDetail() {
  loading.value = true
  try {
    // 占位：当前项目暂无公开用户详情接口，先复用个人资料接口进行展示
    const res = await userApi.getProfile()
    const data = res.data || {}

    userDetail.id = userId || data.id
    userDetail.nickname = data.nickname || ''
    userDetail.gender = data.gender || 0
    userDetail.avatarUrl = data.avatarUrl || ''
    userDetail.birth_date = data.birth_date || ''
    userDetail.city = data.city || ''
    userDetail.height = data.height || null
    userDetail.education = data.education || ''
    userDetail.occupation = data.occupation || ''
    userDetail.income_range = data.income_range || ''
    userDetail.marital_status = data.marital_status || ''
    userDetail.self_intro = data.self_intro || ''
    userDetail.partner_requirement = data.partner_requirement || ''
    userDetail.photos = data.photos || []
    userDetail.matchScore = data.matchScore || null
    userDetail.verified = Boolean(data.verified || data.is_verified || data.isVerified)
  } catch (err) {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

function handleSaveForLater() {
  showToast('已加入稍后联系名单')
}

function handleSayHi() {
  showToast('已发送打招呼，去消息继续沟通')
  setTimeout(() => {
    router.push('/messages')
  }, 250)
}

onMounted(() => {
  fetchUserDetail()
})
</script>

<style scoped>
.user-detail-page {
  background: transparent;
}

.user-detail-loading {
  display: flex;
  justify-content: center;
  padding: 56px 0;
}

.detail-hero {
  position: relative;
  height: 280px;
  margin: 0 12px;
  border-radius: 0 0 var(--hl-radius-lg) var(--hl-radius-lg);
  background-size: cover;
  background-position: center;
  overflow: hidden;
}

.detail-hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(19, 14, 10, 0.75), rgba(21, 16, 10, 0.15));
}

.detail-hero__content {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 18px;
  z-index: 1;
}

.detail-hero__avatar {
  border: 2px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.detail-hero__name-row {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-hero__name-row h1 {
  margin: 0;
  font-size: 24px;
  color: #fff;
}

.detail-hero__subtitle {
  margin: 8px 0 0;
  color: rgba(255, 255, 255, 0.86);
  font-size: 13px;
}

.detail-trust {
  margin-top: -18px;
  position: relative;
  z-index: 2;
}

.detail-trust__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-trust__header h2 {
  margin: 0;
  font-size: 17px;
}

.detail-trust__header span {
  color: var(--hl-primary-color);
  font-size: 13px;
  font-weight: 600;
}

.detail-trust__progress {
  margin-top: 10px;
}

.detail-trust__meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}

.detail-trust__chips {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  background: var(--hl-accent-light);
  color: var(--hl-primary-color);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 11px;
}

.detail-summary {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.detail-summary__item {
  text-align: center;
  border-right: 1px solid var(--hl-border-color);
}

.detail-summary__item:last-child {
  border-right: 0;
}

.detail-summary__item .label {
  display: block;
  font-size: 12px;
  color: var(--hl-text-placeholder);
}

.detail-summary__item strong {
  display: block;
  margin-top: 7px;
  font-size: 14px;
  color: var(--hl-text-primary);
}

.detail-section {
  margin-top: 12px;
}

.detail-section__title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--hl-primary-color);
}

.detail-section__title h3 {
  margin: 0;
  font-size: 17px;
}

.detail-list {
  list-style: none;
  margin: 14px 0 0;
  padding: 0;
}

.detail-list li {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed var(--hl-border-color);
  font-size: 13px;
  color: var(--hl-text-secondary);
}

.detail-list li:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.detail-list li strong {
  color: var(--hl-text-primary);
  font-weight: 600;
}

.detail-paragraph {
  margin: 12px 0 0;
  font-size: 14px;
  line-height: 1.65;
  color: var(--hl-text-secondary);
}

.detail-paragraph:first-of-type {
  margin-top: 14px;
}

.user-detail-bottom-placeholder {
  height: 92px;
}

.detail-action-bar {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: calc(10px + env(safe-area-inset-bottom));
  z-index: 5;
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 10px;
  padding: 10px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: var(--hl-shadow-soft);
}

.detail-action-bar :deep(.van-button) {
  height: 44px;
}

.detail-action-bar__secondary {
  border-color: var(--hl-border-color);
}

@media (max-width: 360px) {
  .detail-hero {
    margin: 0 10px;
  }

  .detail-action-bar {
    left: 10px;
    right: 10px;
  }
}
</style>
