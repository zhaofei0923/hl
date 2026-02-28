<template>
  <div class="page">
    <!-- 导航栏 -->
    <van-nav-bar title="全部资源" left-arrow @click-left="$router.back()">
      <template #right>
        <van-icon name="search" size="20" @click="showSearch = true" />
      </template>
    </van-nav-bar>

    <!-- 性别筛选 -->
    <van-tabs v-model:active="genderTab" @change="handleGenderChange">
      <van-tab title="男" name="male" />
      <van-tab title="女" name="female" />
    </van-tabs>

    <!-- 资源列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
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
              <span class="resource-card__name">{{ item.name || '匿名' }}</span>
              <van-icon
                v-if="item.gender"
                :name="item.gender === 1 ? 'friends-o' : 'friends-o'"
                :color="item.gender === 1 ? '#1989fa' : '#FF4D6A'"
                size="14"
              />
            </div>
            <div class="resource-card__info">
              <span v-if="item.birthDate">{{ calcAge(item.birthDate) }}岁</span>
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

        <EmptyState v-if="!listLoading && resourceList.length === 0" text="暂无资源数据" />
      </van-list>
    </van-pull-refresh>

    <!-- 搜索弹出框 -->
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
          <span class="recommend-popup__name">{{ recommendTarget.name || '匿名' }}</span>
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
              <div class="my-member-item__name">{{ m.name || m.nickname || '匿名' }}</div>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { memberApi } from '@/api/member'
import { calcAge } from '@/utils/format'
import EmptyState from '@/components/common/EmptyState.vue'

const router = useRouter()

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iI0UwRTBFMCIvPjxwYXRoIGQ9Ik0zMiAyMGE4IDggMCAxIDAgMCAxNiA4IDggMCAwIDAgMC0xNnptMCAyMGMtOC44NCAwLTE2IDMuNTgtMTYgOHYyaDMydi0yYzAtNC40Mi03LjE2LTgtMTYtOHoiIGZpbGw9IiNBMEEwQTAiLz48L3N2Zz4='

const genderTab = ref('male')
const showSearch = ref(false)
const searchKeyword = ref('')
const refreshing = ref(false)
const listLoading = ref(false)
const finished = ref(false)
const page = ref(1)
const resourceList = ref([])

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
      gender: genderTab.value === 'male' ? 1 : 2,
      keyword: searchKeyword.value || undefined
    }
    const res = await memberApi.search(params)
    const list = res.data?.list || []

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

function handleGenderChange() {
  resourceList.value = []
  fetchResources(true)
}

function handleSearch() {
  showSearch.value = false
  resourceList.value = []
  fetchResources(true)
}

function handleDetail(item) {
  router.push(`/matchmaker/member/${item.id}`)
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
