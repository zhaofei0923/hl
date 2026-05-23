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

    <section class="team-coach-card" data-testid="matchmaker-team-coach">
      <div class="team-coach-card__head">
        <div>
          <span class="brand-label">COACHING FOCUS</span>
          <h2>团队带教重点</h2>
        </div>
        <strong>{{ teamHealth }}</strong>
      </div>
      <div class="team-coach-card__grid">
        <article v-for="item in coachItems" :key="item.label">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p>{{ item.hint }}</p>
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
import { ref, reactive, onMounted, computed } from 'vue'
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
const averagePerformance = computed(() => {
  const count = Number(teamInfo.memberCount || memberList.value.length || 0)
  if (!count) return 0
  return Number(teamInfo.monthPerformance || 0) / count
})
const activeMemberCount = computed(() => memberList.value.filter(item => Number(item.performance || 0) > 0).length)
const teamHealth = computed(() => {
  if (!teamInfo.memberCount) return '待组建'
  if (Number(teamInfo.monthPerformance || 0) > 0) return '有产出'
  return '待激活'
})
const coachItems = computed(() => [
  {
    label: '人均月产出',
    value: `¥${formatMoney(averagePerformance.value)}`,
    hint: averagePerformance.value ? '可复盘高产成员的获客和跟进方法。' : '先推动成员完成首批服务动作。'
  },
  {
    label: '活跃成员',
    value: `${activeMemberCount.value} 人`,
    hint: activeMemberCount.value ? '优先沉淀可复制的协作方式。' : '成员列表暂无明确业绩记录。'
  },
  {
    label: '团队规模',
    value: `${teamInfo.memberCount || memberList.value.length || 0} 人`,
    hint: teamInfo.memberCount ? '人数稳定后重点看持续产出。' : '可通过邀请好友扩展顾问网络。'
  }
])

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
  background: linear-gradient(135deg, var(--ifu-gold-500), var(--ifu-gold-700));
  border-radius: var(--ifu-radius-lg);
}

.team-coach-card {
  margin: 12px 16px 0;
  padding: 16px;
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: var(--ifu-shadow-soft);
}

.team-coach-card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.team-coach-card__head h2 {
  margin-top: 6px;
  color: var(--ifu-text-strong);
  font-size: 22px;
  line-height: 1.3;
}

.team-coach-card__head strong {
  flex-shrink: 0;
  padding: 8px 11px;
  border-radius: 999px;
  background: rgba(200, 169, 119, 0.16);
  color: var(--ifu-gold-700);
  font-size: 12px;
}

.team-coach-card__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.team-coach-card__grid article {
  padding: 13px 12px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 252, 248, 0.94), rgba(249, 241, 230, 0.76));
  border: 1px solid rgba(233, 221, 204, 0.86);
}

.team-coach-card__grid span {
  display: block;
  color: var(--ifu-text-muted);
  font-size: 11px;
}

.team-coach-card__grid strong {
  display: block;
  margin-top: 8px;
  color: var(--ifu-text-strong);
  font-size: 16px;
}

.team-coach-card__grid p {
  margin-top: 6px;
  color: var(--ifu-text-muted);
  font-size: 11px;
  line-height: 1.5;
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
  color: var(--ifu-text-strong);
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
  background: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid rgba(233, 221, 204, 0.92);
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
  color: var(--ifu-text-strong);
}

.member-row__meta {
  font-size: 12px;
  color: var(--ifu-text-muted);
}

.member-row__performance {
  text-align: right;
  flex-shrink: 0;
}

.member-row__amount {
  font-size: 15px;
  font-weight: 600;
  color: var(--ifu-gold-700);
}

.member-row__label {
  font-size: 11px;
  color: var(--ifu-text-muted);
}

@media (max-width: 380px) {
  .team-coach-card__grid {
    grid-template-columns: 1fr;
  }
}
</style>
