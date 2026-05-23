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
          <span class="detail-hero__label brand-label">PROFILE</span>
          <div class="detail-hero__top">
            <van-image
              round
              width="76"
              height="76"
              :src="userDetail.avatarUrl || defaultAvatar"
              fit="cover"
              class="detail-hero__avatar"
            />
            <span class="detail-hero__score">{{ matchScoreText }}</span>
          </div>
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

      <section class="detail-next card" data-testid="detail-next-step">
        <div class="detail-next__head">
          <div>
            <span class="brand-label">NEXT STEP</span>
            <h2>关系推进判断</h2>
          </div>
          <strong>{{ primaryNextStep }}</strong>
        </div>
        <div class="detail-next__grid">
          <article v-for="item in decisionSignals" :key="item.label">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <p>{{ item.hint }}</p>
          </article>
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

      <section class="detail-match card" data-testid="detail-match-reasons">
        <div class="detail-section__title">
          <van-icon name="fire-o" size="16" />
          <h3>这次推荐的理由</h3>
        </div>
        <ul class="detail-match__list">
          <li v-for="reason in matchReasons" :key="reason">{{ reason }}</li>
        </ul>
        <div class="detail-match__tip">
          <span class="brand-label">OPENING IDEA</span>
          <p>{{ openingSuggestion }}</p>
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

const matchScoreText = computed(() => `${userDetail.matchScore || Math.max(78, profileCompletion.value)}%`)

const lifestyleItems = computed(() => [
  { label: '工作城市', value: userDetail.city || '未填写' },
  { label: '职业方向', value: userDetail.occupation || '未填写' },
  { label: '学历背景', value: userDetail.education || '未填写' },
  { label: '收入范围', value: userDetail.income_range || '未填写' },
  { label: '婚姻状态', value: userDetail.marital_status || '未填写' }
])

const relationshipValues = computed(() => splitParagraph(userDetail.self_intro, '希望我们都认真对待关系，在真诚沟通里建立稳定长期的信任。'))
const partnerRequirementLines = computed(() => splitParagraph(userDetail.partner_requirement, '期待对方情绪稳定、愿意沟通，也愿意一起规划未来。'))
const matchReasons = computed(() => [
  userDetail.city ? `同在${userDetail.city}，见面和后续相处的现实成本更低。` : '同城关系更容易从线上沟通过渡到线下见面。',
  userDetail.education ? `资料显示学历背景为${userDetail.education}，信息完整度更高。`
    : '核心资料比较完整，红娘能更准确判断沟通节奏。',
  userDetail.occupation ? `${userDetail.occupation}的生活节奏更适合从轻话题慢慢打开。`
    : '整体生活方式偏稳定，适合认真推进认识。'
])
const openingSuggestion = computed(() => {
  if (userDetail.city && userDetail.occupation) {
    return `可以从 ${userDetail.city} 的日常节奏和 ${userDetail.occupation} 的工作体验切入，更容易形成自然对话。`
  }
  return '建议先从周末安排、最近的兴趣体验或城市生活偏好开始，轻松但不空泛。'
})

const primaryNextStep = computed(() => {
  if (!userDetail.verified || profileCompletion.value < 60) return '先确认资料'
  if (profileCompletion.value >= 80 && userDetail.city) return '适合打招呼'
  return '轻话题开场'
})

const decisionSignals = computed(() => [
  {
    label: '信任基础',
    value: trustLevelText.value,
    hint: userDetail.verified ? '已完成基础认证，可进入沟通判断。' : '建议先确认认证和关键资料。'
  },
  {
    label: '见面成本',
    value: userDetail.city || '待确认城市',
    hint: userDetail.city ? '同城信息清晰，后续见面安排更容易落地。' : '先通过聊天确认城市和线下节奏。'
  },
  {
    label: '开场方向',
    value: userDetail.occupation || userDetail.education || '生活偏好',
    hint: userDetail.occupation ? '从工作体验切入，比直接问条件更自然。' : '先从周末安排和城市生活偏好开始。'
  }
])

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
    const res = await userApi.getPublicProfile(userId)
    const data = res.data || {}

    userDetail.id = data.id || userId
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

.detail-hero__label {
  display: inline-block;
  color: rgba(255, 250, 244, 0.82);
}

.detail-hero__top {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 12px;
  margin-top: 12px;
}

.detail-hero__avatar {
  border: 2px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.detail-hero__score {
  display: inline-flex;
  align-items: center;
  min-height: 42px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(255, 250, 244, 0.16);
  color: #fffaf4;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 22px;
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

.detail-next {
  margin-top: 12px;
}

.detail-next__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.detail-next__head h2 {
  margin-top: 6px;
  font-size: 22px;
  line-height: 1.3;
  color: var(--ifu-text-strong);
}

.detail-next__head strong {
  flex-shrink: 0;
  padding: 8px 11px;
  border-radius: 999px;
  background: rgba(200, 169, 119, 0.16);
  color: var(--ifu-gold-700);
  font-size: 12px;
}

.detail-next__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.detail-next__grid article {
  padding: 13px 12px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 252, 248, 0.94), rgba(249, 241, 230, 0.76));
  border: 1px solid rgba(233, 221, 204, 0.86);
}

.detail-next__grid span {
  display: block;
  color: var(--ifu-text-muted);
  font-size: 11px;
}

.detail-next__grid strong {
  display: block;
  margin-top: 8px;
  color: var(--ifu-text-strong);
  font-size: 16px;
}

.detail-next__grid p {
  margin-top: 6px;
  color: var(--ifu-text-muted);
  font-size: 11px;
  line-height: 1.5;
}

.detail-summary {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.detail-summary__item {
  text-align: center;
  padding: 12px;
  border-radius: 18px;
  background: linear-gradient(180deg, #fffaf3, #f8eedf);
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

.detail-match {
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

.detail-match__list {
  margin: 14px 0 0;
  padding-left: 18px;
  color: var(--hl-text-secondary);
}

.detail-match__list li {
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.75;
}

.detail-match__tip {
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 20px;
  background: linear-gradient(180deg, #fffaf3, #f7eddc);
}

.detail-match__tip p {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.75;
  color: var(--hl-text-secondary);
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

  .detail-next__grid,
  .detail-summary {
    grid-template-columns: 1fr;
  }

  .detail-action-bar {
    left: 10px;
    right: 10px;
  }
}
</style>
