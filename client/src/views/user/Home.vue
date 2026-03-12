<template>
  <div class="page page--with-tabbar home-page">
    <section class="home-hero" data-testid="home-hero">
      <div class="home-hero__spark home-hero__spark--left"></div>
      <div class="home-hero__spark home-hero__spark--right"></div>

      <div class="home-hero__top">
        <div class="home-hero__brand">
          <span class="brand-label">IFU CURATED MATCH</span>
          <strong>红娘严选</strong>
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
        <h1>今天先看值得认识的人</h1>
        <p>平台先做筛选，红娘再做复核，把认真关系留在更靠前的位置。</p>
      </div>

      <div class="home-hero__stats">
        <div class="home-hero__stat-item">
          <strong>{{ heroStats.todayMatches }}</strong>
          <span>今日推荐</span>
        </div>
        <div class="home-hero__stat-item">
          <strong>{{ heroStats.verificationRate }}</strong>
          <span>核验通过率</span>
        </div>
        <div class="home-hero__stat-item">
          <strong>{{ heroStats.matchmakerService }}</strong>
          <span>红娘陪聊</span>
        </div>
      </div>

      <div class="home-hero__badges">
        <span
          v-for="badge in trustBadges"
          :key="badge"
          class="home-trust-badge"
          data-testid="trust-badge"
        >
          <van-icon name="checked" size="12" />
          {{ badge }}
        </span>
      </div>
    </section>

    <section class="home-curation card">
      <div class="home-curation__copy">
        <span class="brand-label">EDITORIAL CURATION</span>
        <h2>先降低无效沟通，再提高见面的概率</h2>
        <p>匹配理由会优先展示城市、教育与资料完整度，让你先看决定关系质量的那部分。</p>
      </div>
      <div class="home-curation__list">
        <div v-for="item in curationHighlights" :key="item.title" class="home-curation__item">
          <strong>{{ item.title }}</strong>
          <span>{{ item.desc }}</span>
        </div>
      </div>
    </section>

    <section class="home-filter">
      <button type="button" class="filter-chip" :class="{ 'filter-chip--active': !!filterAgeRange }" @click="showAgePicker = true">
        <span>{{ filterAgeLabel || '年龄段' }}</span>
        <van-icon name="arrow-down" size="12" />
      </button>
      <button type="button" class="filter-chip" :class="{ 'filter-chip--active': !!filterCity }" @click="showCityInput = true">
        <span>{{ filterCity || '城市' }}</span>
        <van-icon name="arrow-down" size="12" />
      </button>
      <button type="button" class="filter-chip" :class="{ 'filter-chip--active': !!filterEducation }" @click="showEducationFilter = true">
        <span>{{ filterEducation || '学历' }}</span>
        <van-icon name="arrow-down" size="12" />
      </button>
      <button type="button" class="filter-chip" :class="{ 'filter-chip--active': !!filterGender }" @click="showGenderFilter = true">
        <span>{{ filterGenderLabel || '性别' }}</span>
        <van-icon name="arrow-down" size="12" />
      </button>
      <button type="button" class="filter-chip" :class="{ 'filter-chip--active': !!filterMarital }" @click="showMaritalFilter = true">
        <span>{{ filterMaritalLabel || '婚情' }}</span>
        <van-icon name="arrow-down" size="12" />
      </button>
      <button type="button" class="filter-chip" :class="{ 'filter-chip--active': !!filterIncome }" @click="showIncomeFilter = true">
        <span>{{ filterIncomeLabel || '收入' }}</span>
        <van-icon name="arrow-down" size="12" />
      </button>
      <button
        v-if="filterAgeRange || filterCity || filterEducation || filterGender || filterMarital || filterIncome"
        type="button"
        class="filter-reset"
        @click="resetFilters"
      >
        清空
      </button>
    </section>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="listLoading"
        :finished="finished"
        finished-text="今日推荐已经看到尾声"
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
              width="62"
              height="62"
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
                <span class="brand-chip brand-chip--ghost">{{ item.age || '?' }}岁</span>
                <span class="brand-chip brand-chip--ghost">{{ item.city || '未知城市' }}</span>
                <span class="brand-chip brand-chip--ghost">{{ item.education || '未填学历' }}</span>
              </div>
            </div>

            <div class="match-card__score match-card__score-badge">
              <span>匹配度</span>
              <strong>{{ item.matchScore || 0 }}%</strong>
            </div>
          </header>

          <div class="match-card__reason-wrap">
            <span class="brand-label">MATCH REASON</span>
            <p class="match-card__reason">{{ getMatchReason(item) }}</p>
          </div>

          <div class="match-card__meter">
            <span class="match-card__meter-fill" :style="{ width: `${Math.min(item.matchScore || 0, 100)}%` }"></span>
          </div>

          <p class="match-card__desc">{{ item.intro || '这个人很懒，什么都没写~' }}</p>

          <footer class="match-card__footer">
            <div class="match-card__summary">
              <span>{{ item.occupation || '职业待补充' }}</span>
              <span>{{ item.city || '城市待补充' }}</span>
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
          <div class="card">
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
        </div>
      </van-list>
    </van-pull-refresh>

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

    <van-popup v-model:show="showGenderFilter" position="bottom" round>
      <van-picker
        title="选择性别"
        :columns="genderColumns"
        @confirm="onGenderConfirm"
        @cancel="showGenderFilter = false"
      />
    </van-popup>

    <van-popup v-model:show="showMaritalFilter" position="bottom" round>
      <van-picker
        title="选择婚情"
        :columns="maritalColumns"
        @confirm="onMaritalConfirm"
        @cancel="showMaritalFilter = false"
      />
    </van-popup>

    <van-popup v-model:show="showIncomeFilter" position="bottom" round>
      <van-picker
        title="选择收入范围"
        :columns="incomeColumns"
        @confirm="onIncomeConfirm"
        @cancel="showIncomeFilter = false"
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

const filterGender = ref('')
const filterGenderLabel = ref('')
const filterMarital = ref('')
const filterMaritalLabel = ref('')
const filterIncome = ref('')
const filterIncomeLabel = ref('')
const showGenderFilter = ref(false)
const showMaritalFilter = ref(false)
const showIncomeFilter = ref(false)

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

const genderColumns = [
  { text: '不限', value: '' },
  { text: '男', value: 'male' },
  { text: '女', value: 'female' }
]

const maritalColumns = [
  { text: '不限', value: '' },
  { text: '未婚', value: '未婚' },
  { text: '离婚', value: '离婚' },
  { text: '丧偶', value: '丧偶' }
]

const incomeColumns = [
  { text: '不限', value: '' },
  { text: '5万5人以下', value: '0-50000' },
  { text: '5万-10万', value: '50000-100000' },
  { text: '10万-20万', value: '100000-200000' },
  { text: '20万-50万', value: '200000-500000' },
  { text: '50万以上', value: '500000+' }
]

const trustBadges = ['实名资料', '红娘初筛', '人工复核']
const curationHighlights = [
  { title: '同城优先', desc: '先把见面成本降下来' },
  { title: '资料完整', desc: '减少只凭头像判断' },
  { title: '节奏更稳', desc: '让红娘筛掉无效打扰' }
]

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
  if (filterGender.value) {
    params.gender = filterGender.value
  }
  if (filterMarital.value) {
    params.maritalStatus = filterMarital.value
  }
  if (filterIncome.value) {
    params.incomeRange = filterIncome.value
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
    return '同城且教育背景接近，沟通效率更高，适合先从轻松话题开始。'
  }
  if (item.city) {
    return '同城高潜匹配，线下见面门槛更低，适合优先推进认识节奏。'
  }
  if (item.education) {
    return '教育背景相近，价值观更容易同频，适合进一步了解。'
  }
  return '资料完整度较高，适合先聊三句，再决定是否继续深入了解。'
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

function onGenderConfirm({ selectedOptions }) {
  filterGenderLabel.value = selectedOptions[0].text
  filterGender.value = selectedOptions[0].value
  showGenderFilter.value = false
  onRefresh()
}

function onMaritalConfirm({ selectedOptions }) {
  filterMaritalLabel.value = selectedOptions[0].text
  filterMarital.value = selectedOptions[0].value
  showMaritalFilter.value = false
  onRefresh()
}

function onIncomeConfirm({ selectedOptions }) {
  filterIncomeLabel.value = selectedOptions[0].text
  filterIncome.value = selectedOptions[0].value
  showIncomeFilter.value = false
  onRefresh()
}

function resetFilters() {
  filterAgeLabel.value = ''
  filterAgeRange.value = ''
  filterCity.value = ''
  filterEducation.value = ''
  cityInputValue.value = ''
  filterGender.value = ''
  filterGenderLabel.value = ''
  filterMarital.value = ''
  filterMaritalLabel.value = ''
  filterIncome.value = ''
  filterIncomeLabel.value = ''
  onRefresh()
}

function handleCardClick(item) {
  router.push(`/user/detail/${item.id}`)
}

function handleSayHi() {
  showToast('已发送打招呼')
}
</script>

<style scoped>
.home-page {
  position: relative;
  padding-bottom: calc(74px + env(safe-area-inset-bottom));
}

.home-hero {
  position: relative;
  margin: 0 14px;
  padding: calc(env(safe-area-inset-top) + 22px) 18px 20px;
  border-radius: 0 0 var(--ifu-radius-lg) var(--ifu-radius-lg);
  background:
    linear-gradient(145deg, rgba(81, 56, 30, 0.14), transparent 36%),
    linear-gradient(135deg, #8b6640 0%, #b58c58 55%, #d4b785 100%);
  color: #fff9f3;
  overflow: hidden;
  box-shadow: var(--ifu-shadow-card);
}

.home-hero__spark {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 250, 244, 0.11);
}

.home-hero__spark--left {
  width: 130px;
  height: 130px;
  left: -20px;
  top: 68px;
}

.home-hero__spark--right {
  width: 180px;
  height: 180px;
  right: -60px;
  top: -46px;
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
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.home-hero__brand strong {
  display: block;
  margin-top: 6px;
  font-size: 16px;
}

.home-hero__message-btn {
  border: 1px solid rgba(255, 249, 243, 0.16);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 249, 243, 0.12);
  color: #fff;
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
}

.home-hero__content {
  margin-top: 18px;
}

.home-hero__content h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1.18;
}

.home-hero__content p {
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.72;
  color: rgba(255, 249, 243, 0.84);
}

.home-hero__stats {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.home-hero__stat-item {
  padding: 12px 8px;
  border-radius: 18px;
  background: rgba(255, 249, 243, 0.12);
  border: 1px solid rgba(255, 249, 243, 0.12);
  text-align: center;
}

.home-hero__stat-item strong {
  display: block;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 18px;
}

.home-hero__stat-item span {
  display: block;
  margin-top: 6px;
  font-size: 11px;
  color: rgba(255, 249, 243, 0.72);
}

.home-hero__badges {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.home-trust-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #fff4e6;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 249, 243, 0.12);
}

.home-curation {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.home-curation__copy h2 {
  margin-top: 6px;
  font-size: 22px;
  line-height: 1.3;
}

.home-curation__copy p {
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.65;
  color: var(--ifu-text);
}

.home-curation__list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.home-curation__item {
  padding: 14px 12px;
  border-radius: 20px;
  background: rgba(255, 251, 246, 0.82);
  border: 1px solid rgba(226, 205, 169, 0.52);
}

.home-curation__item strong {
  display: block;
  font-size: 13px;
}

.home-curation__item span {
  display: block;
  margin-top: 6px;
  font-size: 11px;
  line-height: 1.6;
  color: var(--ifu-text-muted);
}

.home-filter {
  position: sticky;
  top: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px 10px;
  background: linear-gradient(180deg, rgba(251, 247, 241, 0.95), rgba(251, 247, 241, 0.75));
  backdrop-filter: blur(10px);
  overflow-x: auto;
  scrollbar-width: none;
}

.home-filter::-webkit-scrollbar {
  display: none;
}

.filter-chip,
.filter-reset {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(233, 221, 204, 0.9);
  background: rgba(255, 255, 255, 0.82);
  color: #3a2e23;
  font-size: 12px;
  flex-shrink: 0;
  white-space: nowrap;
}

.filter-chip--active {
  background: linear-gradient(180deg, #fff9ef, rgba(226, 205, 169, 0.28));
  border-color: rgba(166, 124, 82, 0.38);
  color: var(--ifu-text-strong);
}

.filter-reset {
  color: var(--ifu-gold-700);
}

.match-card {
  position: relative;
  margin: 0 16px 14px;
  padding: 18px;
  border-radius: 28px;
  border: 1px solid rgba(233, 221, 204, 0.96);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 250, 244, 0.94));
  box-shadow: var(--ifu-shadow-soft);
  cursor: pointer;
}

.match-card__header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: start;
}

.match-card__identity {
  min-width: 0;
}

.match-card__name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.match-card__name {
  font-size: 18px;
  font-weight: 600;
  color: var(--ifu-text-strong);
}

.match-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.match-card__score-badge {
  min-width: 72px;
  padding: 8px 10px;
  border-radius: 18px;
  text-align: center;
  background: linear-gradient(180deg, #fff8eb, rgba(226, 205, 169, 0.3));
  border: 1px solid rgba(166, 124, 82, 0.22);
}

.match-card__score-badge span {
  display: block;
  font-size: 10px;
  color: var(--ifu-text-muted);
}

.match-card__score-badge strong {
  display: block;
  margin-top: 2px;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 18px;
  color: var(--ifu-text-strong);
}

.match-card__reason-wrap {
  margin-top: 16px;
}

.match-card__reason {
  margin-top: 7px;
  font-size: 14px;
  line-height: 1.65;
  color: var(--ifu-text-strong);
}

.match-card__meter {
  margin-top: 14px;
  height: 8px;
  border-radius: 999px;
  background: #efe6d8;
  overflow: hidden;
}

.match-card__meter-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--ifu-gold-300), var(--ifu-gold-600));
}

.match-card__desc {
  margin-top: 12px;
  font-size: 13px;
  line-height: 1.72;
  color: var(--ifu-text);
}

.match-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 18px;
}

.match-card__summary {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 12px;
  color: var(--ifu-text-muted);
}

.match-card__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.home-empty-wrap {
  margin: 0 16px 18px;
}

.home-empty-wrap .card {
  margin: 0;
}

.home-empty-actions {
  display: grid;
  gap: 10px;
}

:deep(.van-picker) {
  color: #3a2e23;
}

:deep(.van-picker__title),
:deep(.van-picker-column__item),
:deep(.van-picker__cancel),
:deep(.van-picker__confirm) {
  color: #3a2e23;
}

:deep(.van-picker-column__item--selected) {
  color: #8b6640;
  font-weight: 600;
}

.city-popup__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  font-size: 14px;
}

.city-popup__confirm {
  color: var(--ifu-gold-700);
}

.city-popup__content {
  padding: 0 16px 16px;
}

@media (max-width: 380px) {
  .home-curation__list,
  .home-hero__stats {
    grid-template-columns: 1fr;
  }

  .match-card__header,
  .match-card__footer {
    grid-template-columns: 1fr;
    display: grid;
  }

  .match-card__actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}
</style>
