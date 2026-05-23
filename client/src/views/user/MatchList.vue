<template>
  <div class="page utility-page match-list-page">
    <van-nav-bar title="推荐匹配" left-arrow @click-left="$router.back()" :border="false" />

    <section class="card utility-hero" data-testid="match-list-shell">
      <div class="utility-hero__top">
        <div>
          <span class="brand-label">DISCOVERY</span>
          <h1>把推荐列表做成可筛选、可比较的认识入口</h1>
          <p>先缩小年龄、城市和学历范围，再进入每张卡片判断是否值得继续了解和打招呼。</p>
        </div>
        <span class="brand-chip brand-chip--active">{{ matchList.length }} 位候选</span>
      </div>
      <div class="utility-hero__chips">
        <span class="brand-chip">{{ filterAge || '年龄不限' }}</span>
        <span class="brand-chip">{{ filterCity || '城市不限' }}</span>
        <span class="brand-chip">{{ filterEducation || '学历不限' }}</span>
      </div>
    </section>

    <section class="match-guide card" data-testid="match-guide">
      <div class="match-guide__head">
        <span class="brand-label">COMPARE BY SIGNALS</span>
        <strong>先比较关系信号，再决定是否打招呼</strong>
      </div>
      <div class="match-guide__grid">
        <article v-for="item in discoveryGuides" :key="item.title">
          <span>{{ item.value }}</span>
          <strong>{{ item.title }}</strong>
          <p>{{ item.desc }}</p>
        </article>
      </div>
    </section>

    <div class="match-filter">
      <div class="match-filter__item" @click="showAgePicker = true">
        <span :class="{ 'match-filter__item--active': filterAge }">{{ filterAge || '年龄' }}</span>
        <van-icon name="arrow-down" size="12" />
      </div>
      <div class="match-filter__item" @click="showCityInput = true">
        <span :class="{ 'match-filter__item--active': filterCity }">{{ filterCity || '城市' }}</span>
        <van-icon name="arrow-down" size="12" />
      </div>
      <div class="match-filter__item" @click="showEducationFilter = true">
        <span :class="{ 'match-filter__item--active': filterEducation }">{{ filterEducation || '学历' }}</span>
        <van-icon name="arrow-down" size="12" />
      </div>
      <div
        v-if="filterAge || filterCity || filterEducation"
        class="match-filter__reset"
        @click="resetFilters"
      >
        <van-icon name="cross" size="12" />
        <span>重置</span>
      </div>
    </div>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="listLoading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadMore"
      >
        <div
          v-for="item in matchList"
          :key="item.id"
          class="match-card"
          @click="handleCardClick(item)"
        >
          <div class="match-card__header">
            <van-image
              round
              width="56"
              height="56"
              :src="item.avatarUrl || defaultAvatar"
              fit="cover"
            />
            <div class="match-card__info">
              <div class="match-card__name-row">
                <span class="match-card__name">{{ item.nickname || '匿名用户' }}</span>
                <van-icon
                  v-if="item.gender === 2"
                  name="female"
                  color="#FF4D6A"
                  size="16"
                />
                <van-icon
                  v-else
                  name="male"
                  color="#1989fa"
                  size="16"
                />
              </div>
              <div class="match-card__tags">
                <span class="brand-chip brand-chip--ghost">{{ item.age || '?' }}岁</span>
                <span class="brand-chip brand-chip--ghost">{{ item.city || '未知' }}</span>
                <span class="brand-chip brand-chip--ghost">{{ item.education || '未填写' }}</span>
              </div>
              <div class="match-card__desc">{{ item.intro || '这个人很懒，什么都没写~' }}</div>
            </div>
          </div>
          <div class="match-card__signals">
            <span>城市距离更近</span>
            <span>资料信息可比</span>
            <span>适合轻量开场</span>
          </div>
          <div class="match-card__footer">
            <div class="match-card__score">
              <van-icon name="like" color="var(--hl-accent-color)" size="14" />
              <span>匹配度 {{ item.matchScore || 0 }}%</span>
            </div>
            <van-button size="small" round type="primary" plain @click.stop="handleSayHi(item)">
              打招呼
            </van-button>
          </div>
        </div>

        <EmptyState v-if="!listLoading && matchList.length === 0" text="暂无匹配结果，请调整筛选条件" />
      </van-list>
    </van-pull-refresh>

    <!-- 年龄筛选弹出 -->
    <van-popup v-model:show="showAgePicker" position="bottom" round>
      <van-picker
        title="选择年龄范围"
        :columns="ageColumns"
        @confirm="onAgeConfirm"
        @cancel="showAgePicker = false"
      />
    </van-popup>

    <!-- 城市输入弹出 -->
    <van-popup v-model:show="showCityInput" position="bottom" round class="city-popup">
      <div class="city-popup__header">
        <span class="city-popup__cancel" @click="showCityInput = false">取消</span>
        <span class="city-popup__title">输入城市</span>
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

    <!-- 学历筛选弹出 -->
    <van-popup v-model:show="showEducationFilter" position="bottom" round>
      <van-picker
        title="选择学历"
        :columns="educationFilterColumns"
        @confirm="onEducationFilterConfirm"
        @cancel="showEducationFilter = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { userApi } from '@/api/user'
import { EDUCATION_OPTIONS } from '@/utils/constants'
import EmptyState from '@/components/common/EmptyState.vue'

const router = useRouter()

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHZpZXdCb3g9IjAgMCA1NiA1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyOCIgY3k9IjI4IiByPSIyOCIgZmlsbD0iI0UwRTBFMCIvPjxwYXRoIGQ9Ik0yOCAxOGE3IDcgMCAxIDAgMCAxNCA3IDcgMCAwIDAgMC0xNHptMCAxOGMtNy43MyAwLTE0IDMuMTQtMTQgN3YyaDI4di0yYzAtMy44Ni02LjI3LTctMTQtN3oiIGZpbGw9IiNBMEEwQTAiLz48L3N2Zz4='
const refreshing = ref(false)
const listLoading = ref(false)
const finished = ref(false)
const page = ref(1)
const matchList = ref([])

// 筛选项
const filterAge = ref('')
const filterCity = ref('')
const filterEducation = ref('')

const discoveryGuides = [
  { value: '01', title: '同城优先', desc: '降低第一次见面成本。' },
  { value: '02', title: '资料完整', desc: '避免只凭头像做决定。' },
  { value: '03', title: '轻量开场', desc: '先建立自然沟通节奏。' }
]

// 年龄筛选
const showAgePicker = ref(false)
const ageColumns = [
  { text: '18-25岁', value: '18-25' },
  { text: '25-30岁', value: '25-30' },
  { text: '30-35岁', value: '30-35' },
  { text: '35-40岁', value: '35-40' },
  { text: '40-45岁', value: '40-45' },
  { text: '45-50岁', value: '45-50' },
  { text: '50岁以上', value: '50+' }
]

function onAgeConfirm({ selectedOptions }) {
  filterAge.value = selectedOptions[0].text
  showAgePicker.value = false
  onRefresh()
}

// 城市筛选
const showCityInput = ref(false)
const cityInputValue = ref('')

function onCityConfirm() {
  filterCity.value = cityInputValue.value.trim()
  showCityInput.value = false
  onRefresh()
}

// 学历筛选
const showEducationFilter = ref(false)
const educationFilterColumns = [
  { text: '不限', value: '' },
  ...EDUCATION_OPTIONS.map(item => ({ text: item, value: item }))
]

function onEducationFilterConfirm({ selectedOptions }) {
  filterEducation.value = selectedOptions[0].value
  showEducationFilter.value = false
  onRefresh()
}

// 重置筛选
function resetFilters() {
  filterAge.value = ''
  filterCity.value = ''
  filterEducation.value = ''
  cityInputValue.value = ''
  onRefresh()
}

// 获取匹配列表
async function fetchMatches(isRefresh = false) {
  if (isRefresh) {
    page.value = 1
    finished.value = false
  }

  try {
    const res = await userApi.getProfile()
    // 使用推荐数据的占位逻辑（等后端推荐接口完成后替换）
    const list = res.data?.recommendations || []

    if (isRefresh) {
      matchList.value = list
    } else {
      matchList.value.push(...list)
    }

    if (list.length < 10) {
      finished.value = true
    } else {
      page.value++
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

function handleCardClick(item) {
  router.push(`/user/detail/${item.id}`)
}

function handleSayHi(item) {
  showToast('已发送打招呼')
}

onMounted(() => {
  // Initial load will be triggered by van-list @load
})
</script>

<style scoped>
.match-list-page {
  background: var(--ifu-bg);
  min-height: 100vh;
}

.match-guide {
  margin-top: 12px;
}

.match-guide__head {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.match-guide__head strong {
  font-size: 21px;
  line-height: 1.35;
  color: var(--ifu-text-strong);
}

.match-guide__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.match-guide__grid article {
  padding: 13px 12px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255, 252, 248, 0.94), rgba(249, 241, 230, 0.76));
  border: 1px solid rgba(233, 221, 204, 0.86);
}

.match-guide__grid span {
  color: var(--ifu-gold-700);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 18px;
}

.match-guide__grid strong {
  display: block;
  margin-top: 6px;
  font-size: 13px;
  color: var(--ifu-text-strong);
}

.match-guide__grid p {
  margin-top: 6px;
  font-size: 11px;
  line-height: 1.55;
  color: var(--ifu-text-muted);
}

.match-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 16px 0;
  padding: 10px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(233, 221, 204, 0.86);
  box-shadow: var(--ifu-shadow-soft);
  overflow-x: auto;
}

.match-filter__item {
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 34px;
  padding: 0 12px;
  font-size: 13px;
  color: var(--ifu-text-muted);
  background: rgba(255, 252, 248, 0.9);
  border: 1px solid rgba(233, 221, 204, 0.76);
  border-radius: 999px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
}

.match-filter__item:active {
  opacity: 0.7;
}

.match-filter__item--active {
  color: var(--ifu-gold-700);
  font-weight: 500;
}

.match-filter__reset {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 10px;
  font-size: 12px;
  color: var(--ifu-gold-700);
  cursor: pointer;
  flex-shrink: 0;
}

.match-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 250, 244, 0.94));
  border: 1px solid rgba(233, 221, 204, 0.96);
  border-radius: 28px;
  margin: 12px 16px;
  padding: 18px;
  box-shadow: var(--ifu-shadow-soft);
}

.match-card__header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.match-card__info {
  flex: 1;
  min-width: 0;
}

.match-card__name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.match-card__name {
  font-size: 18px;
  font-weight: 600;
  color: var(--ifu-text-strong);
}

.match-card__tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.match-card__desc {
  font-size: 13px;
  color: var(--ifu-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.match-card__signals {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
}

.match-card__signals span {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(126, 154, 120, 0.13);
  color: var(--ifu-success);
  font-size: 11px;
}

.match-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(233, 221, 204, 0.76);
}

.match-card__score {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--ifu-gold-700);
  font-weight: 500;
}

.city-popup {
  padding-bottom: env(safe-area-inset-bottom);
}

.city-popup__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--hl-border-color);
}

.city-popup__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--ifu-text-strong);
}

.city-popup__cancel {
  font-size: 14px;
  color: var(--ifu-text-muted);
  cursor: pointer;
}

.city-popup__confirm {
  font-size: 14px;
  color: var(--ifu-gold-700);
  font-weight: 500;
  cursor: pointer;
}

.city-popup__content {
  padding: 16px;
}

@media (max-width: 380px) {
  .match-guide__grid {
    grid-template-columns: 1fr;
  }
}
</style>
