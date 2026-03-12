<template>
  <div class="page utility-page">
    <van-nav-bar :title="`会员展示 (${totalCount})`" left-arrow :border="false" @click-left="$router.back()">
      <template #right>
        <div style="display:flex;align-items:center;gap:14px;">
          <van-badge :content="activeFilterCount || ''" color="var(--hl-primary-color)">
            <van-icon name="filter-o" size="20" @click="showFilter = true" />
          </van-badge>
          <van-icon name="search" size="20" @click="showSearch = true" />
        </div>
      </template>
    </van-nav-bar>

    <section class="card utility-hero" data-testid="matchmaker-resources-shell">
      <div class="utility-hero__top">
        <div>
          <span class="brand-label">RESOURCE POOL</span>
          <h1>把会员资源库做成可互推的共享盘</h1>
          <p>先看总量和筛选密度，再决定查看详情、互推资源，还是继续细化筛选条件。</p>
        </div>
        <span class="brand-chip brand-chip--active">{{ notCertified ? '需先认证' : '资源可用' }}</span>
      </div>
      <div class="utility-hero__chips">
        <span class="brand-chip">{{ totalCount }} 位资源</span>
        <span class="brand-chip">{{ activeFilterCount }} 个筛选</span>
        <span class="brand-chip">互推协作</span>
      </div>
    </section>

    <van-empty
      v-if="notCertified"
      image="network"
      description="仅已认证红娘可查看会员资源库，请先完成认证"
      style="margin-top:80px"
    />
    <van-pull-refresh v-else v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="listLoading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadMore"
      >
        <div
          v-for="item in resourceList"
          :key="item.id"
          class="resource-card"
        >
          <van-image
            round
            width="56"
            height="56"
            :src="item.avatarUrl || defaultAvatar"
            fit="cover"
            class="resource-card__avatar"
            @click="handleDetail(item)"
          />
          <div class="resource-card__body" @click="handleDetail(item)">
            <div class="resource-card__top">
              <span class="resource-card__name">{{ item.nickname || item.realName || '匿名' }}</span>
              <van-icon
                v-if="item.gender"
                :name="item.gender === 1 ? 'friends-o' : 'friends-o'"
                :color="item.gender === 1 ? '#1989fa' : '#FF4D6A'"
                size="14"
              />
            </div>
            <div class="resource-card__info">
              <span v-if="item.age">{{ item.age }}岁</span>
              <span v-if="item.city">{{ item.city }}</span>
              <span v-if="item.height">{{ item.height }}cm</span>
            </div>
            <div class="resource-card__tags">
              <van-tag
                v-if="item.education"
                plain
                round
                size="medium"
                color="var(--hl-primary-color)"
              >
                {{ item.education }}
              </van-tag>
              <van-tag
                v-if="item.maritalStatus"
                plain
                round
                size="medium"
                color="#1989fa"
              >
                {{ item.maritalStatus }}
              </van-tag>
              <van-tag
                v-if="item.income"
                plain
                round
                size="medium"
                color="#07c160"
              >
                {{ item.income }}
              </van-tag>
            </div>
          </div>
          <div class="resource-card__right">
            <div v-if="item.compatibility" class="resource-card__match">
              <span class="resource-card__match-value">{{ item.compatibility }}%</span>
              <span class="resource-card__match-label">匹配</span>
            </div>
            <van-button
              size="small"
              round
              type="primary"
              class="recommend-btn"
              @click.stop="handleRecommend(item)"
            >
              互推
            </van-button>
          </div>
        </div>

          <EmptyState v-if="!listLoading && resourceList.length === 0" text="暂无会员数据" />
      </van-list>
    </van-pull-refresh>
    <van-popup v-model:show="showSearch" position="top" round>
      <div class="search-popup">
        <van-search
          v-model="searchKeyword"
          placeholder="搜索姓名、城市、职业"
          show-action
          @search="handleSearch"
          @cancel="showSearch = false"
        />
      </div>
    </van-popup>

    <van-popup v-model:show="showFilter" position="bottom" round :style="{ maxHeight: '80vh' }">
      <div class="popup-form">
        <div class="popup-form__header">
          <span class="popup-form__title">筛选条件</span>
          <van-icon name="cross" size="18" @click="showFilter = false" />
        </div>
        <div class="filter-section">
          <div class="filter-section__label">性别</div>
          <van-radio-group v-model="filterForm.gender" direction="horizontal">
            <van-radio name="">不限</van-radio>
            <van-radio name="1">男</van-radio>
            <van-radio name="2">女</van-radio>
          </van-radio-group>
        </div>
        <div class="filter-section">
          <div class="filter-section__label">年龄段</div>
          <van-radio-group v-model="filterForm.ageRange" direction="horizontal" style="flex-wrap:wrap;gap:8px;">
            <van-radio name="">不限</van-radio>
            <van-radio name="20-25">20-25岁</van-radio>
            <van-radio name="26-30">26-30岁</van-radio>
            <van-radio name="31-35">31-35岁</van-radio>
            <van-radio name="36-40">36-40岁</van-radio>
            <van-radio name="41-99">40岁以上</van-radio>
          </van-radio-group>
        </div>
        <div class="filter-section">
          <div class="filter-section__label">学历</div>
          <van-radio-group v-model="filterForm.education" direction="horizontal" style="flex-wrap:wrap;gap:8px;">
            <van-radio name="">不限</van-radio>
            <van-radio name="高中及以下">高中及以下</van-radio>
            <van-radio name="专科">专科</van-radio>
            <van-radio name="本科">本科</van-radio>
            <van-radio name="硕士">硕士</van-radio>
            <van-radio name="博士">博士</van-radio>
          </van-radio-group>
        </div>
        <div class="filter-section">
          <div class="filter-section__label">婚姻状况</div>
          <van-radio-group v-model="filterForm.maritalStatus" direction="horizontal" style="flex-wrap:wrap;gap:8px;">
            <van-radio name="">不限</van-radio>
            <van-radio name="未婚">未婚</van-radio>
            <van-radio name="离异">离异</van-radio>
            <van-radio name="丧偶">丧偶</van-radio>
          </van-radio-group>
        </div>
        <div class="filter-section">
          <div class="filter-section__label">收入范围</div>
          <van-radio-group v-model="filterForm.incomeRange" direction="horizontal" style="flex-wrap:wrap;gap:8px;">
            <van-radio name="">不限</van-radio>
            <van-radio name="5万以下">5万以下</van-radio>
            <van-radio name="5-10万">5-10万</van-radio>
            <van-radio name="10-20万">10-20万</van-radio>
            <van-radio name="20-50万">20-50万</van-radio>
            <van-radio name="50-100万">50-100万</van-radio>
          </van-radio-group>
        </div>
        <div class="filter-section">
          <div class="filter-section__label">城市</div>
          <van-field
            v-model="filterForm.city"
            placeholder="输入城市名称"
            clearable
            style="background:var(--hl-bg-color);border-radius:8px;"
          />
        </div>
        <div class="filter-footer">
          <van-button block plain round @click="resetFilter">重置</van-button>
          <van-button block type="primary" round @click="applyFilter">确认筛选</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 互推选择弹窗 -->
    <van-popup
      v-model:show="showRecommendPopup"
      position="bottom"
      round
      :style="{ maxHeight: '70vh' }"
    >
      <div class="recommend-popup">
        <div class="popup-form__header">
          <span class="popup-form__title">选择要互推的会员</span>
          <van-icon name="cross" size="18" @click="showRecommendPopup = false" />
        </div>
        <div class="recommend-popup__target" v-if="recommendTarget">
          <span class="recommend-popup__label">推送给：</span>
          <span class="recommend-popup__name">{{ recommendTarget.nickname || recommendTarget.realName || '匿名' }}</span>
        </div>

        <van-loading v-if="myMembersLoading" class="loading-center" />

        <van-empty v-else-if="myMembers.length === 0" description="暂无可互推的会员" />

        <div v-else class="my-member-list">
          <div
            v-for="m in myMembers"
            :key="m.id"
            class="my-member-item"
            @click="confirmRecommend(m)"
          >
            <van-image
              round
              width="44"
              height="44"
              :src="m.avatarUrl || defaultAvatar"
              fit="cover"
            />
            <div class="my-member-item__info">
              <div class="my-member-item__name">{{ m.nickname || m.realName || '匿名' }}</div>
              <div class="my-member-item__meta">
                <span v-if="m.age">{{ m.age }}岁</span>
                <span v-if="m.city">{{ m.city }}</span>
              </div>
            </div>
            <van-icon name="arrow" color="var(--hl-text-placeholder)" />
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { memberApi } from '@/api/member'
import EmptyState from '@/components/common/EmptyState.vue'

const router = useRouter()

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iI0UwRTBFMCIvPjxwYXRoIGQ9Ik0zMiAyMGE4IDggMCAxIDAgMCAxNiA4IDggMCAwIDAgMC0xNnptMCAyMGMtOC44NCAwLTE2IDMuNTgtMTYgOHYyaDMydi0yYzAtNC40Mi03LjE2LTgtMTYtOHoiIGZpbGw9IiNBMEEwQTAiLz48L3N2Zz4='

const showSearch = ref(false)
const searchKeyword = ref('')
const refreshing = ref(false)
const listLoading = ref(false)
const finished = ref(false)
const page = ref(1)
const resourceList = ref([])
const totalCount = ref(0)
const notCertified = ref(false)

const showFilter = ref(false)
const filterForm = reactive({
  gender: '',
  ageRange: '',
  education: '',
  maritalStatus: '',
  incomeRange: '',
  city: ''
})
const activeFilters = reactive({
  gender: '',
  ageRange: '',
  education: '',
  maritalStatus: '',
  incomeRange: '',
  city: ''
})
const activeFilterCount = computed(() =>
  Object.values(activeFilters).filter(v => v !== '').length
)

const showRecommendPopup = ref(false)
const recommendTarget = ref(null)
const myMembers = ref([])
const myMembersLoading = ref(false)

async function fetchResources(isRefresh = false) {
  if (isRefresh) {
    page.value = 1
    finished.value = false
  }

  try {
    const params = {
      page: page.value,
      pageSize: 15,
      keyword: searchKeyword.value || undefined,
      gender: activeFilters.gender || undefined,
      education: activeFilters.education || undefined,
      maritalStatus: activeFilters.maritalStatus || undefined,
      incomeRange: activeFilters.incomeRange || undefined,
      city: activeFilters.city || undefined
    }
    if (activeFilters.ageRange) {
      const [min, max] = activeFilters.ageRange.split('-')
      params.ageMin = min
      params.ageMax = max
    }
    const res = await memberApi.getResources(params)
    const list = res.data?.list || []
    if (isRefresh || page.value === 1) {
      totalCount.value = res.data?.pagination?.total || 0
    }

    if (isRefresh) {
      resourceList.value = list
    } else {
      resourceList.value.push(...list)
    }

    if (list.length < 15) {
      finished.value = true
    } else {
      page.value++
    }
  } catch (err) {
    if (err?.response?.status === 403 || err?.response?.data?.code === 40301) {
      notCertified.value = true
    }
    finished.value = true
  } finally {
    listLoading.value = false
    refreshing.value = false
  }
}

function loadMore() {
  fetchResources()
}

function onRefresh() {
  fetchResources(true)
}

function handleSearch() {
  showSearch.value = false
  resourceList.value = []
  fetchResources(true)
}

function handleDetail(item) {
  router.push(`/matchmaker/member/${item.id}?from=resources`)
}

function applyFilter() {
  Object.assign(activeFilters, { ...filterForm })
  showFilter.value = false
  resourceList.value = []
  fetchResources(true)
}

function resetFilter() {
  Object.assign(filterForm, { gender: '', ageRange: '', education: '', maritalStatus: '', incomeRange: '', city: '' })
  Object.assign(activeFilters, { gender: '', ageRange: '', education: '', maritalStatus: '', incomeRange: '', city: '' })
  showFilter.value = false
  resourceList.value = []
  fetchResources(true)
}

// 打开互推弹窗，加载自己的会员列表
async function handleRecommend(resource) {
  recommendTarget.value = resource
  showRecommendPopup.value = true
  myMembersLoading.value = true
  myMembers.value = []
  try {
    const res = await memberApi.getList({ page: 1, pageSize: 50 })
    myMembers.value = res.data?.list || []
  } catch (err) {
    // handled by interceptor
  } finally {
    myMembersLoading.value = false
  }
}

// 确认互推
async function confirmRecommend(myMember) {
  if (!recommendTarget.value) return
  try {
    await memberApi.recommend({
      myMemberId: myMember.id,
      resourceUserId: recommendTarget.value.userId || recommendTarget.value.id
    })
    showToast('互推成功！已通知对方红娘')
    showRecommendPopup.value = false
  } catch (err) {
    // handled by interceptor
  }
}
</script>

<style scoped>
.resource-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--hl-card-bg);
  border-bottom: 1px solid var(--hl-border-color);
}

.resource-card__avatar {
  flex-shrink: 0;
}

.resource-card__body {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.resource-card__right {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.resource-card__top {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.resource-card__name {
  font-size: 15px;
  font-weight: 500;
  color: var(--hl-text-primary);
}

.resource-card__info {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: var(--hl-text-secondary);
  margin-bottom: 6px;
}

.resource-card__info span::after {
  content: '|';
  margin-left: 8px;
  color: var(--hl-border-color);
}

.resource-card__info span:last-child::after {
  content: '';
  margin-left: 0;
}

.resource-card__tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.resource-card__match {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.resource-card__match-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--hl-accent-color);
}

.resource-card__match-label {
  font-size: 10px;
  color: var(--hl-text-secondary);
}

.recommend-btn {
  font-size: 12px;
  padding: 0 10px;
  height: 26px;
}

.search-popup {
  padding-bottom: 8px;
}

.filter-section {
  padding: 14px 16px;
  border-bottom: 1px solid var(--hl-border-color);
}

.filter-section__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--hl-text-secondary);
  margin-bottom: 10px;
}

.filter-footer {
  display: flex;
  gap: 12px;
  padding: 16px 16px 24px;
}

.popup-form {
  padding: 0 0 24px;
  overflow-y: auto;
  max-height: 85vh;
}

/* 互推弹窗 */
.recommend-popup {
  padding-bottom: 24px;
}

.popup-form__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
  border-bottom: 1px solid var(--hl-border-color);
}

.popup-form__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--hl-text-primary);
}

.recommend-popup__target {
  padding: 12px 16px;
  font-size: 13px;
  color: var(--hl-text-secondary);
  background: var(--hl-bg-color);
}

.recommend-popup__name {
  color: var(--hl-primary-color);
  font-weight: 500;
}

.loading-center {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.my-member-list {
  overflow-y: auto;
  max-height: 50vh;
}

.my-member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--hl-border-color);
  cursor: pointer;
}

.my-member-item:active {
  background: var(--hl-bg-color);
}

.my-member-item__info {
  flex: 1;
  min-width: 0;
}

.my-member-item__name {
  font-size: 15px;
  color: var(--hl-text-primary);
  margin-bottom: 2px;
}

.my-member-item__meta {
  font-size: 12px;
  color: var(--hl-text-secondary);
  display: flex;
  gap: 8px;
}
</style>
