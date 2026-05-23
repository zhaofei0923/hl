<template>
  <div class="page utility-page">
    <van-nav-bar title="我的红娘" left-arrow :border="false" @click-left="$router.back()" />

    <section class="card utility-hero" data-testid="my-matchmakers-shell">
      <div class="utility-hero__top">
        <div>
          <span class="brand-label">ADVISOR NETWORK</span>

      <section class="advisor-focus-card" data-testid="my-matchmakers-focus">
        <div class="advisor-focus-card__head">
          <div>
            <span class="brand-label">COLLABORATION</span>
            <h2>协作贡献判断</h2>
          </div>
          <strong>{{ advisorState }}</strong>
        </div>
        <div class="advisor-focus-card__grid">
          <article v-for="item in advisorItems" :key="item.label">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <p>{{ item.hint }}</p>
          </article>
        </div>
      </section>

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
import { ref, computed } from 'vue'
import { matchmakerApi } from '@/api/matchmaker'
import { formatMoney, formatDate, maskPhone } from '@/utils/format'
import EmptyState from '@/components/common/EmptyState.vue'

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iI0UwRTBFMCIvPjxwYXRoIGQ9Ik0zMiAyMGE4IDggMCAxIDAgMCAxNiA4IDggMCAwIDAgMC0xNnptMCAyMGMtOC44NCAwLTE2IDMuNTgtMTYgOHYyaDMydi0yYzAtNC40Mi03LjE2LTgtMTYtOHoiIGZpbGw9IiNBMEEwQTAiLz48L3N2Zz4='

const refreshing = ref(false)
const listLoading = ref(false)
const finished = ref(false)
const page = ref(1)
const matchmakerList = ref([])
const totalMembers = computed(() => matchmakerList.value.reduce((sum, item) => sum + Number(item.memberCount || 0), 0))
const totalPerformance = computed(() => matchmakerList.value.reduce((sum, item) => sum + Number(item.performance || 0), 0))
const advisorState = computed(() => matchmakerList.value.length ? '可复盘' : '待同步')
const advisorItems = computed(() => [
  {
    label: '协作红娘',
    value: `${matchmakerList.value.length} 位`,
    hint: matchmakerList.value.length ? '可按会员数和业绩判断重点协作对象。' : '暂无协作红娘数据。'
  },
  {
    label: '会员覆盖',
    value: `${totalMembers.value} 人`,
    hint: totalMembers.value ? '成员资源越清晰，互推越容易落地。' : '等待红娘会员数据同步。'
  },
  {
    label: '协作业绩',
    value: `¥${formatMoney(totalPerformance.value)}`,
    hint: totalPerformance.value ? '优先复盘高贡献顾问的服务路径。' : '暂未形成明确业绩贡献。'
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
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 24px;
  box-shadow: var(--ifu-shadow-soft);
}

.advisor-focus-card {
  margin: 12px 16px 0;
  padding: 16px;
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: var(--ifu-shadow-soft);
}

.advisor-focus-card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.advisor-focus-card__head h2 {
  margin-top: 6px;
  color: var(--ifu-text-strong);
  font-size: 22px;
  line-height: 1.3;
}

.advisor-focus-card__head strong {
  flex-shrink: 0;
  padding: 8px 11px;
  border-radius: 999px;
  background: rgba(200, 169, 119, 0.16);
  color: var(--ifu-gold-700);
  font-size: 12px;
}

.advisor-focus-card__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.advisor-focus-card__grid article {
  padding: 13px 12px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 252, 248, 0.94), rgba(249, 241, 230, 0.76));
  border: 1px solid rgba(233, 221, 204, 0.86);
}

.advisor-focus-card__grid span {
  display: block;
  color: var(--ifu-text-muted);
  font-size: 11px;
}

.advisor-focus-card__grid strong {
  display: block;
  margin-top: 8px;
  color: var(--ifu-text-strong);
  font-size: 16px;
}

.advisor-focus-card__grid p {
  margin-top: 6px;
  color: var(--ifu-text-muted);
  font-size: 11px;
  line-height: 1.5;
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
  color: var(--ifu-text-strong);
}

.matchmaker-card__phone {
  font-size: 13px;
  color: var(--ifu-text-muted);
}

.matchmaker-card__bottom {
  display: flex;
  align-items: center;
  padding-top: 14px;
  border-top: 1px solid rgba(233, 221, 204, 0.92);
}

.matchmaker-card__stat {
  flex: 1;
  text-align: center;
}

.matchmaker-card__stat-value {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: var(--ifu-text-strong);
  margin-bottom: 2px;
}

.matchmaker-card__stat-label {
  font-size: 11px;
  color: var(--ifu-text-muted);
}

.matchmaker-card__stat-divider {
  width: 1px;
  height: 24px;
  background: rgba(233, 221, 204, 0.92);
}

@media (max-width: 380px) {
  .advisor-focus-card__grid {
    grid-template-columns: 1fr;
  }
}
</style>
