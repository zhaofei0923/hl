<template>
  <div class="page">
    <!-- 导航栏 -->
    <van-nav-bar title="业绩订单" left-arrow @click-left="$router.back()" />

    <!-- 业绩统计 -->
    <div class="stats-card">
      <div class="stats-card__item">
        <div class="stats-card__value">¥{{ formatMoney(summary.totalPerformance) }}</div>
        <div class="stats-card__label">总业绩</div>
      </div>
      <div class="stats-card__divider"></div>
      <div class="stats-card__item">
        <div class="stats-card__value">¥{{ formatMoney(summary.monthPerformance) }}</div>
        <div class="stats-card__label">本月业绩</div>
      </div>
      <div class="stats-card__divider"></div>
      <div class="stats-card__item">
        <div class="stats-card__value">¥{{ formatMoney(summary.yearPerformance) }}</div>
        <div class="stats-card__label">本年业绩</div>
      </div>
    </div>

    <!-- 订单状态筛选 -->
    <van-tabs v-model:active="statusTab" @change="handleTabChange">
      <van-tab title="全部" name="all" />
      <van-tab title="待付款" name="pending" />
      <van-tab title="已完成" name="completed" />
      <van-tab title="已取消" name="cancelled" />
    </van-tabs>

    <!-- 订单列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="listLoading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadMore"
      >
        <div
          v-for="item in orderList"
          :key="item.id"
          class="order-item"
        >
          <div class="order-item__header">
            <span class="order-item__no">订单号：{{ item.orderNo }}</span>
            <van-tag
              round
              size="medium"
              :type="getStatusType(item.status)"
            >
              {{ getStatusText(item.status) }}
            </van-tag>
          </div>
          <div class="order-item__body">
            <div class="order-item__row">
              <span class="order-item__label">会员</span>
              <span class="order-item__value">{{ item.memberName || '--' }}</span>
            </div>
            <div class="order-item__row">
              <span class="order-item__label">类型</span>
              <span class="order-item__value">{{ item.typeName || '--' }}</span>
            </div>
            <div class="order-item__row">
              <span class="order-item__label">金额</span>
              <span class="order-item__value order-item__value--amount">¥{{ formatMoney(item.amount) }}</span>
            </div>
          </div>
          <div class="order-item__footer">
            <span class="order-item__date">{{ formatDate(item.createdAt, 'YYYY-MM-DD HH:mm') }}</span>
          </div>
        </div>

        <EmptyState v-if="!listLoading && orderList.length === 0" text="暂无订单记录" />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
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
.stats-card {
  display: flex;
  align-items: center;
  margin: 16px;
  padding: 20px 0;
  background: linear-gradient(135deg, var(--hl-accent-color), var(--hl-primary-color));
  border-radius: var(--hl-radius-lg);
}

.stats-card__item {
  flex: 1;
  text-align: center;
}

.stats-card__value {
  font-size: 17px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.stats-card__label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
}

.stats-card__divider {
  width: 1px;
  height: 28px;
  background: rgba(255, 255, 255, 0.3);
}

.order-item {
  margin: 10px 16px;
  padding: 14px;
  background: var(--hl-card-bg);
  border-radius: var(--hl-radius-md);
}

.order-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--hl-border-color);
}

.order-item__no {
  font-size: 12px;
  color: var(--hl-text-secondary);
}

.order-item__body {
  margin-bottom: 10px;
}

.order-item__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.order-item__label {
  font-size: 13px;
  color: var(--hl-text-secondary);
}

.order-item__value {
  font-size: 13px;
  color: var(--hl-text-primary);
}

.order-item__value--amount {
  font-size: 15px;
  font-weight: 600;
  color: var(--hl-primary-color);
}

.order-item__footer {
  padding-top: 8px;
  border-top: 1px dashed var(--hl-border-color);
}

.order-item__date {
  font-size: 12px;
  color: var(--hl-text-placeholder);
}
</style>
