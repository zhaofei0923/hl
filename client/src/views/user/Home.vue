<template>
  <div class="page page--with-tabbar home-page" style="padding-bottom: calc(100px + env(safe-area-inset-bottom));">
    <section class="home-hero" data-testid="home-hero">
      <div class="home-hero__mask"></div>
      <div class="home-hero__top">
        <div class="home-hero__brand">
          <span class="home-hero__brand-dot"></span>
          <span>红娘严选</span>
        </div>
        <button
          type="button"
          class="home-hero__message-btn"
          data-testid="home-message-entry"
          @click="router.push('/messages')"
        >
          <van-icon name="chat-o" size="18" />
          <span>消息</span>
        </button>
      </div>

      <div class="home-hero__content">
        <h1>今日缘分推荐</h1>
        <p>高匹配候选人已由平台与红娘双重筛选</p>
      </div>

      <div class="home-hero__stats">
        <div class="home-hero__stat-item">
          <strong>{{ heroStats.todayMatches }}</strong>
          <span>今日缘分</span>
        </div>
        <div class="home-hero__stat-item">
          <strong>{{ heroStats.verificationRate }}</strong>
          <span>认证通过率</span>
        </div>
        <div class="home-hero__stat-item">
          <strong>{{ heroStats.matchmakerService }}</strong>
          <span>红娘服务</span>
        </div>
      </div>

      <div class="home-hero__badges">
        <span v-for="badge in trustBadges" :key="badge" class="home-trust-badge" data-testid="trust-badge">
          <van-icon name="checked" size="12" />
          {{ badge }}
        </span>
      </div>
    </section>

    <section class="home-filter">
      <button type="button" class="filter-chip" @click="showAgePicker = true">
        <span>{{ filterAgeLabel || '年龄段' }}</span>
        <van-icon name="arrow-down" size="12" />
      </button>
      <button type="button" class="filter-chip" @click="showCityInput = true">
        <span>{{ filterCity || '城市' }}</span>
        <van-icon name="arrow-down" size="12" />
      </button>
      <button type="button" class="filter-chip" @click="showEducationFilter = true">
        <span>{{ filterEducation || '学历' }}</span>
        <van-icon name="arrow-down" size="12" />
      </button>
      <button
        v-if="filterAgeRange || filterCity || filterEducation"
        type="button"
        class="filter-reset"
        @click="resetFilters"
      >
        重置
      </button>
    </section>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="listLoading"
        :finished="finished"
        finished-text="今日推荐已看完"
        @load="loadMore"
      >
        <article
          v-for="item in matchList"
          :key="item.id"
          class="match-card"
          data-testid="recommend-card"
          @click="handleCardClick(item)"
        >
          <header class="match-card__header">
            <van-image
              round
              width="58"
              height="58"
              :src="item.avatarUrl || defaultAvatar"
              fit="cover"
            />
            <div class="match-card__identity">
              <div class="match-card__name-row">
                <h3 class="match-card__name">{{ item.nickname || '匿名用户' }}</h3>
                <van-tag v-if="item.verified" type="success" plain round size="small">已认证</van-tag>
                <van-tag v-else type="warning" plain round size="small">待认证</van-tag>
              </div>
              <div class="match-card__tags">
                <van-tag plain round size="medium">{{ item.age || '?' }}岁</van-tag>
                <van-tag plain round size="medium">{{ item.city || '未知城市' }}</van-tag>
                <van-tag plain round size="medium">{{ item.education || '未填写学历' }}</van-tag>
              </div>
            </div>
          </header>

          <p class="match-card__reason">{{ getMatchReason(item) }}</p>
          <p class="match-card__desc">{{ item.intro || '这个人很懒，什么都没写~' }}</p>

          <footer class="match-card__footer">
            <div class="match-card__score">
              <span>匹配度</span>
              <strong>{{ item.matchScore || 0 }}%</strong>
            </div>
            <div class="match-card__actions">
              <van-button size="small" round plain @click.stop="handleCardClick(item)">
                查看详情
              </van-button>
              <van-button
                size="small"
                round
                type="primary"
                data-testid="cta-say-hi"
                @click.stop="handleSayHi(item)"
              >
                立即打招呼
              </van-button>
            </div>
          </footer>
        </article>

        <div v-if="!listLoading && matchList.length === 0" class="home-empty-wrap">
          <EmptyState text="暂无推荐，先完善资料可提升匹配精准度" />
          <div class="home-empty-actions">
            <van-button round plain block data-testid="empty-action" @click="router.push('/user/profile/edit')">
              完善资料
            </van-button>
            <van-button round type="primary" block data-testid="empty-action" @click="router.push('/certification')">
              去认证
            </van-button>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>

    <div class="home-floating-cta">
      <button type="button" @click="router.push('/messages')">
        <van-icon name="chat-o" size="14" />
        去消息
      </button>
      <button type="button" @click="router.push('/user/match-list')">
        <van-icon name="friends-o" size="14" />
        互相关注
      </button>
    </div>

    <van-popup v-model:show="showAgePicker" position="bottom" round>
      <van-picker
        title="选择年龄段"
        :columns="ageColumns"
        @confirm="onAgeConfirm"
        @cancel="showAgePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showCityInput" position="bottom" round class="city-popup">
      <div class="city-popup__header">
        <span @click="showCityInput = false">取消</span>
        <span>输入城市</span>
        <span class="city-popup__confirm" @click="onCityConfirm">确定</span>
      </div>
      <div class="city-popup__content">
        <van-field
          v-model="cityInputValue"
          placeholder="请输入城市名称"
          clearable
          autofocus
        />
      </div>
    </van-popup>

    <van-popup v-model:show="showEducationFilter" position="bottom" round>
      <van-picker
        title="选择学历"
        :columns="educationColumns"
        @confirm="onEducationConfirm"
        @cancel="showEducationFilter = false"
      />
    </van-popup>

    <TabBar />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { matchApi } from '@/api/match'
import { EDUCATION_OPTIONS } from '@/utils/constants'
import TabBar from '@/components/common/TabBar.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const router = useRouter()

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHZpZXdCb3g9IjAgMCA1NiA1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyOCIgY3k9IjI4IiByPSIyOCIgZmlsbD0iI0UwRTBFMCIvPjxwYXRoIGQ9Ik0yOCAxOGE3IDcgMCAxIDAgMCAxNCA3IDcgMCAwIDAgMC0xNHptMCAxOGMtNy43MyAwLTE0IDMuMTQtMTQgN3YyaDI4di0yYzAtMy44Ni02LjI3LTctMTQtN3oiIGZpbGw9IiNBMEEwQTAiLz48L3N2Zz4='

const refreshing = ref(false)
const listLoading = ref(false)
const finished = ref(false)
const page = ref(1)
const totalCount = ref(0)
const matchList = ref([])

const filterAgeLabel = ref('')
const filterAgeRange = ref('')
const filterCity = ref('')
const filterEducation = ref('')

const showAgePicker = ref(false)
const showCityInput = ref(false)
const showEducationFilter = ref(false)
const cityInputValue = ref('')

const ageColumns = [
  { text: '不限', value: '' },
  { text: '23-28岁', value: '23-28' },
  { text: '29-33岁', value: '29-33' },
  { text: '34-38岁', value: '34-38' },
  { text: '39-45岁', value: '39-45' }
]

const educationColumns = [
  { text: '不限', value: '' },
  ...EDUCATION_OPTIONS.map(item => ({ text: item, value: item }))
]

const trustBadges = ['实名资料', '红娘初筛', '人工复核']

const heroStats = computed(() => ({
  todayMatches: totalCount.value || matchList.value.length,
  verificationRate: '98%',
  matchmakerService: '1v1'
}))

const recommendationQuery = computed(() => {
  const params = {
    page: page.value,
    pageSize: 10
  }

  if (filterAgeRange.value) {
    const [minAge, maxAge] = filterAgeRange.value.split('-')
    params.minAge = Number(minAge)
    params.maxAge = Number(maxAge)
  }
  if (filterCity.value) {
    params.city = filterCity.value
  }
  if (filterEducation.value) {
    params.education = filterEducation.value
  }

  return params
})

function normalizeMatch(item) {
  const u = item.user || item
  const p = u.profile || {}

  return {
    id: u.id,
    nickname: u.nickname,
    avatarUrl: u.avatarUrl,
    gender: u.gender,
    age: p.age,
    city: p.city,
    education: p.education,
    occupation: p.occupation,
    intro: p.self_intro || p.selfIntro,
    verified: Boolean(u.isVerified || u.is_verified || u.verified),
    matchScore: Number(item.compatibilityScore ?? item.matchScore ?? 0)
  }
}

function getMatchReason(item) {
  if (item.city && item.education) {
    return '同城且学历匹配，沟通成本更低，建议优先联系'
  }
  if (item.city) {
    return '同城高潜匹配，线下见面更高效'
  }
  if (item.education) {
    return '教育背景相近，价值观更容易同频'
  }
  return '资料完整度较高，适合先聊三句再深入了解'
}

async function fetchMatches(isRefresh = false) {
  if (isRefresh) {
    page.value = 1
    finished.value = false
  }

  try {
    const res = await matchApi.getRecommendations(recommendationQuery.value)
    const list = (res.data?.list || []).map(normalizeMatch)

    totalCount.value = Number(res.data?.total || 0)

    if (isRefresh) {
      matchList.value = list
    } else {
      matchList.value.push(...list)
    }

    if (list.length < 10) {
      finished.value = true
    } else {
      page.value += 1
    }
  } catch (err) {
    finished.value = true
  } finally {
    listLoading.value = false
    refreshing.value = false
  }
}

function loadMore() {
  fetchMatches()
}

function onRefresh() {
  refreshing.value = true
  fetchMatches(true)
}

function onAgeConfirm({ selectedOptions }) {
  filterAgeLabel.value = selectedOptions[0].text
  filterAgeRange.value = selectedOptions[0].value
  showAgePicker.value = false
  onRefresh()
}

function onEducationConfirm({ selectedOptions }) {
  filterEducation.value = selectedOptions[0].value
  showEducationFilter.value = false
  onRefresh()
}

function onCityConfirm() {
  filterCity.value = cityInputValue.value.trim()
  showCityInput.value = false
  onRefresh()
}

function resetFilters() {
  filterAgeLabel.value = ''
  filterAgeRange.value = ''
  filterCity.value = ''
  filterEducation.value = ''
  cityInputValue.value = ''
  onRefresh()
}

function handleCardClick(item) {
  router.push(`/user/detail/${item.id}`)
}

function handleSayHi(item) {
  showToast('已发送打招呼')
}
</script>

<style scoped>
.home-page {
  position: relative;
}

.home-hero {
  position: relative;
  margin: 0 12px;
  padding: 18px 16px 16px;
  border-radius: 0 0 var(--hl-radius-lg) var(--hl-radius-lg);
  background: linear-gradient(145deg, #352417, #6b4e31 55%, #8c6a43);
  color: #f5eee7;
  overflow: hidden;
  box-shadow: var(--hl-shadow-soft);
  animation: hero-enter 0.45s ease;
}

.home-hero__mask {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 85% 0%, rgba(213, 185, 142, 0.32), transparent 42%);
}

.home-hero__top,
.home-hero__content,
.home-hero__stats,
.home-hero__badges {
  position: relative;
  z-index: 1;
}

.home-hero__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.home-hero__brand {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  opacity: 0.95;
}

.home-hero__brand-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d9be95;
}

.home-hero__message-btn {
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
}

.home-hero__content {
  margin-top: 14px;
}

.home-hero__content h1 {
  margin: 0;
  font-size: 23px;
  font-weight: 600;
}

.home-hero__content p {
  margin: 8px 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.84);
}

.home-hero__stats {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.home-hero__stat-item {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  text-align: center;
  padding: 10px 6px;
}

.home-hero__stat-item strong {
  display: block;
  font-size: 17px;
  line-height: 1;
}

.home-hero__stat-item span {
  display: block;
  margin-top: 6px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.82);
}

.home-hero__badges {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.home-trust-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #e9dbc8;
  padding: 4px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
}

.home-filter {
  position: sticky;
  top: 0;
  z-index: 3;
  display: flex;
  gap: 8px;
  padding: 12px;
  backdrop-filter: blur(8px);
}

.filter-chip,
.filter-reset {
  border: 1px solid var(--hl-border-color);
  background: rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  min-height: 34px;
  padding: 0 12px;
  font-size: 12px;
  color: var(--hl-text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.filter-chip {
  flex: 1;
  justify-content: space-between;
}

.filter-reset {
  color: var(--hl-primary-color);
}

.match-card {
  margin: 0 12px 12px;
  padding: 14px;
  background: var(--hl-card-bg);
  border-radius: var(--hl-radius-md);
  box-shadow: var(--hl-shadow-card);
  border: 1px solid rgba(140, 106, 67, 0.08);
  animation: card-enter 0.35s ease;
}

.match-card:active {
  transform: translateY(-1px) scale(0.996);
}

.match-card__header {
  display: flex;
  gap: 12px;
}

.match-card__identity {
  min-width: 0;
  flex: 1;
}

.match-card__name-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 7px;
}

.match-card__name {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--hl-text-primary);
}

.match-card__tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.match-card__reason {
  margin: 11px 0 4px;
  font-size: 13px;
  color: var(--hl-primary-color);
  background: var(--hl-primary-light);
  border-radius: 8px;
  padding: 7px 10px;
}

.match-card__desc {
  margin: 0;
  font-size: 13px;
  color: var(--hl-text-placeholder);
  line-height: 1.5;
}

.match-card__footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--hl-border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.match-card__score span {
  font-size: 12px;
  color: var(--hl-text-placeholder);
}

.match-card__score strong {
  margin-left: 6px;
  font-size: 18px;
  color: var(--hl-accent-color);
}

.match-card__actions {
  display: flex;
  gap: 8px;
}

.match-card__actions :deep(.van-button) {
  min-width: 84px;
}

.home-empty-wrap {
  margin: 0 12px;
  padding: 24px 14px;
  border-radius: var(--hl-radius-md);
  background: #fff;
  box-shadow: var(--hl-shadow-card);
}

.home-empty-actions {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.home-empty-actions :deep(.van-button) {
  height: 42px;
}

.home-floating-cta {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: calc(58px + env(safe-area-inset-bottom));
  z-index: 4;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.home-floating-cta button {
  border: none;
  border-radius: 999px;
  height: 38px;
  background: rgba(46, 36, 23, 0.92);
  color: #fff;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.city-popup {
  overflow: hidden;
}

.city-popup__header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 12px 16px;
  font-size: 14px;
  border-bottom: 1px solid var(--hl-border-color);
}

.city-popup__header span:last-child {
  text-align: right;
}

.city-popup__confirm {
  color: var(--hl-primary-color);
  font-weight: 600;
}

.city-popup__content {
  padding: 16px;
}

@keyframes hero-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 360px) {
  .home-hero__content h1 {
    font-size: 21px;
  }

  .home-hero__stats {
    gap: 6px;
  }

  .home-floating-cta {
    left: 10px;
    right: 10px;
  }
}
</style>
