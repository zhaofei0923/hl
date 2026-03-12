<template>
  <div class="page utility-page">
    <van-nav-bar title="我的红娘" left-arrow :border="false" @click-left="$router.back()" />

    <section class="card utility-hero" data-testid="my-matchmakers-shell">
      <div class="utility-hero__top">
        <div>
          <span class="brand-label">ADVISOR NETWORK</span>
          <h1>把合作红娘做成可追踪的协作列表</h1>
          <p>先看成员数量、业绩和加入时间，再决定重点维护哪位顾问的协作关系。</p>
        </div>
        <span class="brand-chip brand-chip--active">{{ matchmakerList.length }} 位红娘</span>
      </div>
      <div class="utility-hero__chips">
        <span class="brand-chip">会员协作</span>
        <span class="brand-chip">业绩联动</span>
        <span class="brand-chip">长期合作</span>
      </div>
    </section>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="listLoading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadMore"
      >
        <div
          v-for="item in matchmakerList"
          :key="item.id"
          class="matchmaker-card"
        >
          <div class="matchmaker-card__top">
            <van-image
              round
              width="48"
              height="48"
              :src="item.avatarUrl || defaultAvatar"
              fit="cover"
            />
            <div class="matchmaker-card__info">
              <div class="matchmaker-card__name-row">
                <span class="matchmaker-card__name">{{ item.name || '未设置' }}</span>
                <van-tag
                  v-if="item.level"
                  round
                  size="medium"
                  :color="getLevelColor(item.level)"
                >
                  {{ item.level }}
                </van-tag>
              </div>
              <div class="matchmaker-card__phone">{{ maskPhone(item.phone) }}</div>
            </div>
          </div>
          <div class="matchmaker-card__bottom">
            <div class="matchmaker-card__stat">
              <span class="matchmaker-card__stat-value">{{ item.memberCount || 0 }}</span>
              <span class="matchmaker-card__stat-label">会员数</span>
            </div>
            <div class="matchmaker-card__stat-divider"></div>
            <div class="matchmaker-card__stat">
              <span class="matchmaker-card__stat-value">¥{{ formatMoney(item.performance) }}</span>
              <span class="matchmaker-card__stat-label">业绩</span>
            </div>
            <div class="matchmaker-card__stat-divider"></div>
            <div class="matchmaker-card__stat">
              <span class="matchmaker-card__stat-value">{{ formatDate(item.joinDate, 'MM-DD') }}</span>
              <span class="matchmaker-card__stat-label">加入日期</span>
            </div>
          </div>
        </div>

        <EmptyState v-if="!listLoading && matchmakerList.length === 0" text="暂无红娘数据" />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { matchmakerApi } from '@/api/matchmaker'
import { formatMoney, formatDate, maskPhone } from '@/utils/format'
import EmptyState from '@/components/common/EmptyState.vue'

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iI0UwRTBFMCIvPjxwYXRoIGQ9Ik0zMiAyMGE4IDggMCAxIDAgMCAxNiA4IDggMCAwIDAgMC0xNnptMCAyMGMtOC44NCAwLTE2IDMuNTgtMTYgOHYyaDMydi0yYzAtNC40Mi03LjE2LTgtMTYtOHoiIGZpbGw9IiNBMEEwQTAiLz48L3N2Zz4='

const refreshing = ref(false)
const listLoading = ref(false)
const finished = ref(false)
const page = ref(1)
const matchmakerList = ref([])

function getLevelColor(level) {
  const map = {
    '初级': '#07c160',
    '中级': '#1989fa',
    '高级': '#FF7D41',
    '特级': '#FF4D6A'
  }
  return map[level] || '#999'
}

async function fetchList(isRefresh = false) {
  if (isRefresh) {
    page.value = 1
    finished.value = false
  }

  try {
    const res = await matchmakerApi.getMyMatchmakers({
      page: page.value,
      pageSize: 20
    })
    const list = res.data?.list || []

    if (isRefresh) {
      matchmakerList.value = list
    } else {
      matchmakerList.value.push(...list)
    }

    if (list.length < 20) {
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
  fetchList()
}

function onRefresh() {
  fetchList(true)
}
</script>

<style scoped>
.matchmaker-card {
  margin: 10px 16px;
  padding: 16px;
  background: var(--hl-card-bg);
  border-radius: var(--hl-radius-md);
}

.matchmaker-card__top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.matchmaker-card__info {
  flex: 1;
  min-width: 0;
}

.matchmaker-card__name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.matchmaker-card__name {
  font-size: 16px;
  font-weight: 600;
  color: var(--hl-text-primary);
}

.matchmaker-card__phone {
  font-size: 13px;
  color: var(--hl-text-secondary);
}

.matchmaker-card__bottom {
  display: flex;
  align-items: center;
  padding-top: 14px;
  border-top: 1px solid var(--hl-border-color);
}

.matchmaker-card__stat {
  flex: 1;
  text-align: center;
}

.matchmaker-card__stat-value {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: var(--hl-text-primary);
  margin-bottom: 2px;
}

.matchmaker-card__stat-label {
  font-size: 11px;
  color: var(--hl-text-secondary);
}

.matchmaker-card__stat-divider {
  width: 1px;
  height: 24px;
  background: var(--hl-border-color);
}
</style>
