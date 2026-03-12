<template>
  <div class="page orders-page">
    <van-nav-bar title="业绩订单" left-arrow :border="false" @click-left="$router.back()" />

    <section class="card orders-hero" data-testid="matchmaker-orders-shell">
      <div class="orders-hero__header">
        <div>
          <span class="brand-label">PERFORMANCE</span>
          <h1>把订单看成经营进度，而不是流水堆叠</h1>
          <p>先看累计业绩和当前处理状态，再进入单条订单确认会员、服务类型和成交金额。</p>
        </div>
        <span class="brand-chip brand-chip--active">{{ currentStatusLabel }}</span>
      </div>

      <div class="orders-hero__stats" data-testid="matchmaker-orders-stats">
        <article v-for="item in heroStats" :key="item.label" class="orders-hero__stat">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small>{{ item.hint }}</small>
        </article>
      </div>
    </section>

    <section class="card orders-toolbar">
      <div class="orders-toolbar__title">
        <span class="brand-label">ORDER STAGE</span>
        <h3>按状态筛选订单池</h3>
      </div>
      <van-tabs v-model:active="statusTab" animated @change="handleTabChange">
        <van-tab title="全部" name="all" />
        <van-tab title="待付款" name="pending" />
        <van-tab title="已完成" name="completed" />
        <van-tab title="已取消" name="cancelled" />
      </van-tabs>
    </section>

    <section class="card orders-list-shell" data-testid="matchmaker-orders-list">
      <div class="orders-list-shell__header">
        <div>
          <span class="brand-label">ORDER LIST</span>
          <h3>{{ currentStatusLabel }}订单</h3>
        </div>
        <span class="orders-list-shell__count">当前展示 {{ orderList.length }} 条</span>
      </div>

      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="listLoading"
          :finished="finished"
          finished-text="没有更多了"
          @load="loadMore"
        >
          <article v-for="item in orderList" :key="item.id" class="order-item">
            <div class="order-item__header">
              <div>
                <span class="order-item__eyebrow">订单号 {{ item.orderNo }}</span>
                <strong>{{ item.memberName || '--' }}</strong>
              </div>
              <van-tag round size="medium" :type="getStatusType(item.status)">
                {{ getStatusText(item.status) }}
              </van-tag>
            </div>

            <div class="order-item__body">
              <div class="order-item__meta">
                <span>服务类型</span>
                <strong>{{ item.typeName || '--' }}</strong>
              </div>
              <div class="order-item__meta">
                <span>成交金额</span>
                <strong class="order-item__amount">¥{{ formatMoney(item.amount) }}</strong>
              </div>
              <div class="order-item__meta">
                <span>成交时间</span>
                <strong>{{ formatDate(item.createdAt, 'YYYY-MM-DD HH:mm') }}</strong>
              </div>
            </div>
          </article>

          <EmptyState v-if="!listLoading && orderList.length === 0" text="暂无订单记录" />
        </van-list>
      </van-pull-refresh>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { walletApi } from '@/api/wallet'
import { formatMoney, formatDate } from '@/utils/format'
import EmptyState from '@/components/common/EmptyState.vue'

const statusTab = ref('all')
const refreshing = ref(false)
const listLoading = ref(false)
const finished = ref(false)
const page = ref(1)
const orderList = ref([])

const summary = reactive({
  totalPerformance: 0,
  monthPerformance: 0,
  yearPerformance: 0
})

const currentStatusLabel = computed(() => (
  {
    all: '全部',
    pending: '待付款',
    completed: '已完成',
    cancelled: '已取消'
  }[statusTab.value] || '全部'
))

const heroStats = computed(() => {
  const completedCount = orderList.value.filter(item => item.status === 'completed').length
  const pendingCount = orderList.value.filter(item => item.status === 'pending').length

  return [
    {
      label: '总业绩',
      value: `¥${formatMoney(summary.totalPerformance)}`,
      hint: '累计确认的经营成果'
    },
    {
      label: '本月业绩',
      value: `¥${formatMoney(summary.monthPerformance)}`,
      hint: '观察当前月的成交节奏'
    },
    {
      label: '待付款',
      value: pendingCount,
      hint: '适合优先跟进支付转化'
    },
    {
      label: '已完成',
      value: completedCount,
      hint: '用于判断服务成交占比'
    }
  ]
})

function getStatusType(status) {
  const map = {
    pending: 'warning',
    completed: 'success',
    cancelled: 'default',
    paid: 'primary'
  }
  return map[status] || 'default'
}

function getStatusText(status) {
  const map = {
    pending: '待付款',
    completed: '已完成',
    cancelled: '已取消',
    paid: '已付款'
  }
  return map[status] || status
}

async function fetchSummary() {
  try {
    const res = await walletApi.getEarningsSummary()
    if (res.data) {
      summary.totalPerformance = res.data.totalPerformance || 0
      summary.monthPerformance = res.data.monthPerformance || 0
      summary.yearPerformance = res.data.yearPerformance || 0
    }
  } catch (err) {
    // handled by interceptor
  }
}

async function fetchOrders(isRefresh = false) {
  if (isRefresh) {
    page.value = 1
    finished.value = false
  }

  try {
    const params = {
      page: page.value,
      pageSize: 20,
      status: statusTab.value === 'all' ? undefined : statusTab.value
    }
    const res = await walletApi.getEarnings(params)
    const list = res.data?.list || []

    if (isRefresh) {
      orderList.value = list
    } else {
      orderList.value.push(...list)
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
  fetchOrders()
}

function onRefresh() {
  fetchSummary()
  fetchOrders(true)
}

function handleTabChange() {
  orderList.value = []
  fetchOrders(true)
}

onMounted(() => {
  fetchSummary()
})
</script>

<style scoped>
.orders-page {
  padding-bottom: 40px;
}

.orders-hero {
  overflow: hidden;
  background:
    radial-gradient(circle at right top, rgba(255, 250, 244, 0.2), transparent 28%),
    linear-gradient(145deg, #7a5b3d, #b78d59 66%, #ddc59f);
  color: #fff8ef;
}

.orders-hero::after {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.14), transparent 36%);
}

.orders-hero .brand-label {
  color: rgba(255, 248, 239, 0.74);
}

.orders-hero .brand-chip--active {
  background: rgba(255, 248, 239, 0.18);
  color: #fff8ef;
  border-color: rgba(255, 248, 239, 0.28);
}

.orders-hero__header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 14px;
}

.orders-hero__header h1 {
  margin-top: 12px;
  font-size: 29px;
  line-height: 1.22;
}

.orders-hero__header p {
  margin-top: 12px;
  color: rgba(255, 248, 239, 0.8);
  line-height: 1.7;
}

.orders-hero__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.orders-hero__stat {
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 248, 239, 0.12);
  border: 1px solid rgba(255, 248, 239, 0.14);
}

.orders-hero__stat span,
.orders-hero__stat small {
  display: block;
  color: rgba(255, 248, 239, 0.72);
}

.orders-hero__stat strong {
  display: block;
  margin: 8px 0 6px;
  font-size: 24px;
  color: #fffdf9;
}

.orders-toolbar__title,
.orders-list-shell__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.orders-toolbar__title h3,
.orders-list-shell__header h3 {
  margin-top: 8px;
  font-size: 20px;
  color: var(--ifu-text-strong);
}

.orders-list-shell__count {
  color: var(--ifu-text-muted);
  font-size: 13px;
}

.orders-toolbar :deep(.van-tabs__wrap) {
  margin-top: 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.76);
}

.order-item {
  padding: 16px 0;
  border-bottom: 1px solid rgba(233, 221, 204, 0.76);
}

.order-item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.order-item__header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 10px;
}

.order-item__eyebrow {
  display: block;
  font-size: 12px;
  color: var(--ifu-text-muted);
}

.order-item__header strong {
  display: block;
  margin-top: 6px;
  color: var(--ifu-text-strong);
  font-size: 18px;
}

.order-item__body {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.order-item__meta {
  padding: 12px;
  border-radius: 16px;
  background: linear-gradient(180deg, #fffaf3, #f8eedf);
}

.order-item__meta span {
  display: block;
  font-size: 12px;
  color: var(--ifu-text-muted);
}

.order-item__meta strong {
  display: block;
  margin-top: 8px;
  color: var(--ifu-text-strong);
  font-size: 14px;
  line-height: 1.5;
}

.order-item__amount {
  color: var(--ifu-gold-700) !important;
}
</style>
