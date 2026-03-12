<template>
  <div class="page utility-page">
    <van-nav-bar title="婚介团" left-arrow :border="false" @click-left="$router.back()" />

    <section class="card utility-hero" data-testid="matchmaker-team-shell">
      <div class="utility-hero__top">
        <div>
          <span class="brand-label">TEAM</span>
          <h1>把团队页做成协作与业绩联动面板</h1>
          <p>先看团队人数和本月业绩，再进入成员列表确认谁在持续贡献、谁需要继续带教。</p>
        </div>
        <span class="brand-chip brand-chip--active">{{ teamInfo.name || '我的团队' }}</span>
      </div>
      <div class="utility-hero__stats">
        <article class="utility-hero__stat">
          <span>成员数</span>
          <strong>{{ teamInfo.memberCount || 0 }}</strong>
          <small>当前顾问网络规模</small>
        </article>
        <article class="utility-hero__stat">
          <span>总业绩</span>
          <strong>¥{{ formatMoney(teamInfo.totalPerformance) }}</strong>
          <small>累计团队贡献</small>
        </article>
        <article class="utility-hero__stat">
          <span>本月业绩</span>
          <strong>¥{{ formatMoney(teamInfo.monthPerformance) }}</strong>
          <small>关注当月活跃度</small>
        </article>
      </div>
    </section>

    <div class="team-overview">
      <div class="team-overview__name">
        <van-icon name="cluster-o" size="22" color="#fff" />
        <span>{{ teamInfo.name || '我的团队' }}</span>
      </div>
      <div class="team-overview__stats">
        <div class="stat-item">
          <div class="stat-item__value">{{ teamInfo.memberCount || 0 }}</div>
          <div class="stat-item__label">团队成员</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-item__value">{{ formatMoney(teamInfo.totalPerformance) }}</div>
          <div class="stat-item__label">总业绩(元)</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-item__value">{{ formatMoney(teamInfo.monthPerformance) }}</div>
          <div class="stat-item__label">本月业绩(元)</div>
        </div>
      </div>
    </div>

    <div class="section-title">
      <span>团队成员</span>
      <span class="section-title__count">共{{ memberList.length }}人</span>
    </div>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="listLoading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadMore"
      >
        <div
          v-for="item in memberList"
          :key="item.id"
          class="member-row"
        >
          <van-image
            round
            width="44"
            height="44"
            :src="item.avatarUrl || defaultAvatar"
            fit="cover"
          />
          <div class="member-row__info">
            <div class="member-row__name-row">
              <span class="member-row__name">{{ item.name || '未设置' }}</span>
              <van-tag
                v-if="item.level"
                round
                size="medium"
                :color="getLevelColor(item.level)"
              >
                {{ item.level }}
              </van-tag>
            </div>
            <div class="member-row__meta">
              加入时间：{{ formatDate(item.joinDate) }}
            </div>
          </div>
          <div class="member-row__performance">
            <div class="member-row__amount">¥{{ formatMoney(item.performance) }}</div>
            <div class="member-row__label">业绩</div>
          </div>
        </div>

        <EmptyState v-if="!listLoading && memberList.length === 0" text="暂无团队成员" />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { matchmakerApi } from '@/api/matchmaker'
import { formatMoney, formatDate } from '@/utils/format'
import EmptyState from '@/components/common/EmptyState.vue'

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iI0UwRTBFMCIvPjxwYXRoIGQ9Ik0zMiAyMGE4IDggMCAxIDAgMCAxNiA4IDggMCAwIDAgMC0xNnptMCAyMGMtOC44NCAwLTE2IDMuNTgtMTYgOHYyaDMydi0yYzAtNC40Mi03LjE2LTgtMTYtOHoiIGZpbGw9IiNBMEEwQTAiLz48L3N2Zz4='

const teamInfo = reactive({
  name: '',
  memberCount: 0,
  totalPerformance: 0,
  monthPerformance: 0
})

const refreshing = ref(false)
const listLoading = ref(false)
const finished = ref(false)
const page = ref(1)
const memberList = ref([])

function getLevelColor(level) {
  const map = {
    '初级': '#07c160',
    '中级': '#1989fa',
    '高级': '#FF7D41',
    '特级': '#FF4D6A'
  }
  return map[level] || '#999'
}

async function fetchTeamInfo() {
  try {
    const res = await matchmakerApi.getTeam()
    if (res.data) {
      Object.assign(teamInfo, res.data)
    }
  } catch (err) {
    // handled by interceptor
  }
}

async function fetchMembers(isRefresh = false) {
  if (isRefresh) {
    page.value = 1
    finished.value = false
  }

  try {
    const res = await matchmakerApi.getTeamMembers({
      page: page.value,
      pageSize: 20
    })
    const list = res.data?.list || []

    if (isRefresh) {
      memberList.value = list
    } else {
      memberList.value.push(...list)
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
  fetchMembers()
}

function onRefresh() {
  fetchMembers(true)
}

onMounted(() => {
  fetchTeamInfo()
})
</script>

<style scoped>
.team-overview {
  margin: 16px;
  padding: 20px;
  background: linear-gradient(135deg, var(--hl-accent-color), var(--hl-primary-color));
  border-radius: var(--hl-radius-lg);
}

.team-overview__name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 20px;
}

.team-overview__stats {
  display: flex;
  align-items: center;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-item__value {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.stat-item__label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: rgba(255, 255, 255, 0.3);
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--hl-text-primary);
}

.section-title__count {
  font-size: 12px;
  font-weight: 400;
  color: var(--hl-text-secondary);
}

.member-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--hl-card-bg);
  border-bottom: 1px solid var(--hl-border-color);
}

.member-row__info {
  flex: 1;
  min-width: 0;
}

.member-row__name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.member-row__name {
  font-size: 15px;
  font-weight: 500;
  color: var(--hl-text-primary);
}

.member-row__meta {
  font-size: 12px;
  color: var(--hl-text-secondary);
}

.member-row__performance {
  text-align: right;
  flex-shrink: 0;
}

.member-row__amount {
  font-size: 15px;
  font-weight: 600;
  color: var(--hl-primary-color);
}

.member-row__label {
  font-size: 11px;
  color: var(--hl-text-secondary);
}
</style>
