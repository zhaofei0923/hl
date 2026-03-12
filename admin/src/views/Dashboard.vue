<template>
  <div class="page-container dashboard-page">
    <div class="page-header">
      <div>
        <span class="brand-label">OVERVIEW</span>
        <h2>数据概览</h2>
      </div>
      <el-button @click="refreshData" :loading="loading" icon="Refresh">刷新</el-button>
    </div>

    <section class="priority-panel" data-testid="admin-priority-panel">
      <div class="priority-panel__copy">
        <span class="brand-label">TODAY'S PRIORITY</span>
        <h3>今日优先处理</h3>
        <p>把需要人工决策的事项排到更前面，再看趋势与分布。</p>
      </div>
      <div class="priority-panel__list">
        <article v-for="item in priorityItems" :key="item.label" class="priority-panel__item">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small>{{ item.note }}</small>
        </article>
      </div>
    </section>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6" v-for="card in statsCards" :key="card.label">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <span class="brand-label">{{ card.kicker }}</span>
              <div class="stat-value">{{ card.value }}</div>
              <div class="stat-label">{{ card.label }}</div>
            </div>
            <div class="stat-icon" :style="{ color: card.color, backgroundColor: card.bg }">
              <el-icon><component :is="card.icon" /></el-icon>
            </div>
          </div>
          <div class="stat-footer">
            <span class="stat-sub">{{ card.sub }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="15">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <div>
                <span class="brand-label">TREND</span>
                <strong>新增用户趋势</strong>
              </div>
              <el-radio-group v-model="trendDays" size="small" @change="loadTrend">
                <el-radio-button :value="7">7天</el-radio-button>
                <el-radio-button :value="14">14天</el-radio-button>
                <el-radio-button :value="30">30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="9">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <div>
                <span class="brand-label">DISTRIBUTION</span>
                <strong>订单类型分布</strong>
              </div>
            </div>
          </template>
          <div ref="pieChartRef" class="chart-container chart-container--small"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getDashboardStats, getUserTrend, getOrderDistribution } from '../api/admin'

const loading = ref(false)
const stats = ref({})
const trendDays = ref(7)
const trendData = ref([])
const orderDist = ref([])
const trendChartRef = ref()
const pieChartRef = ref()
let trendChart = null
let pieChart = null

const statsCards = computed(() => [
  {
    kicker: 'USERS',
    label: '总用户数',
    value: stats.value.totalUsers || 0,
    sub: `今日新增 ${stats.value.todayNewUsers || 0}`,
    icon: 'User',
    color: 'var(--ifu-gold-700)',
    bg: 'rgba(200, 169, 119, 0.18)'
  },
  {
    kicker: 'MATCHMAKERS',
    label: '红娘数',
    value: stats.value.totalMatchmakers || 0,
    sub: `今日新增 ${stats.value.todayNewMatchmakers || 0}`,
    icon: 'Avatar',
    color: 'var(--ifu-success)',
    bg: 'rgba(126, 154, 120, 0.16)'
  },
  {
    kicker: 'WITHDRAWALS',
    label: '待审提现',
    value: stats.value.pendingWithdrawals || 0,
    sub: `金额 ¥${(stats.value.pendingWithdrawAmount || 0).toFixed(2)}`,
    icon: 'Wallet',
    color: 'var(--ifu-warning)',
    bg: 'rgba(194, 139, 78, 0.15)'
  },
  {
    kicker: 'GMV',
    label: '总订单金额',
    value: `¥${(stats.value.totalOrderAmount || 0).toFixed(0)}`,
    sub: `今日 ¥${(stats.value.todayOrderAmount || 0).toFixed(0)}`,
    icon: 'Tickets',
    color: 'var(--ifu-danger)',
    bg: 'rgba(168, 93, 82, 0.14)'
  }
])

const priorityItems = computed(() => [
  {
    label: '待审提现',
    value: `${stats.value.pendingWithdrawals || 0} 笔`,
    note: `涉及金额 ¥${(stats.value.pendingWithdrawAmount || 0).toFixed(2)}`
  },
  {
    label: '新增红娘',
    value: `${stats.value.todayNewMatchmakers || 0} 人`,
    note: '检查认证与等级配置'
  },
  {
    label: '今日新增用户',
    value: `${stats.value.todayNewUsers || 0} 人`,
    note: '关注活跃转化与匹配效率'
  }
])

const loadStats = async () => {
  const res = await getDashboardStats()
  stats.value = res.data
}

const loadTrend = async () => {
  const res = await getUserTrend(trendDays.value)
  trendData.value = res.data
  renderTrendChart()
}

const loadOrderDist = async () => {
  const res = await getOrderDistribution()
  orderDist.value = res.data
  renderPieChart()
}

const renderTrendChart = () => {
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }
  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 24, bottom: 30 },
    xAxis: {
      type: 'category',
      data: trendData.value.map(d => d.date.slice(5)),
      axisLabel: { fontSize: 11, color: '#9a8a78' },
      axisLine: { lineStyle: { color: '#e5d6c2' } }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { color: '#9a8a78' },
      splitLine: { lineStyle: { color: '#f0e6d7' } }
    },
    series: [{
      data: trendData.value.map(d => d.count),
      type: 'line',
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(166, 124, 82, 0.36)' },
          { offset: 1, color: 'rgba(166, 124, 82, 0.04)' }
        ])
      },
      lineStyle: { color: '#a67c52', width: 3 },
      itemStyle: { color: '#a67c52' }
    }]
  })
}

const typeNames = { membership: '会员服务', manual_match: '人工匹配', vip_service: 'VIP服务', xi_coin_purchase: '喜币充值' }
const pieColors = ['#a67c52', '#c8a977', '#7e9a78', '#c28b4e', '#8c9aa8']

const renderPieChart = () => {
  if (!pieChart) {
    pieChart = echarts.init(pieChartRef.value)
  }
  pieChart.setOption({
    color: pieColors,
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    series: [{
      type: 'pie',
      radius: ['42%', '72%'],
      avoidLabelOverlap: false,
      label: { show: true, formatter: '{b}\n{d}%', fontSize: 11, color: '#655647' },
      data: orderDist.value.map(d => ({
        name: typeNames[d.type] || d.type,
        value: d.count
      }))
    }]
  })
}

const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([loadStats(), loadTrend(), loadOrderDist()])
  } finally {
    loading.value = false
  }
}

const handleResize = () => {
  trendChart?.resize()
  pieChart?.resize()
}

onMounted(async () => {
  await nextTick()
  refreshData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  pieChart?.dispose()
})
</script>

<style scoped>
.dashboard-page {
  padding-bottom: 28px;
}

.priority-panel {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 18px;
  padding: 22px;
  margin-bottom: 20px;
  border-radius: 30px;
  background: linear-gradient(145deg, #3d3023, #7c5d3a 52%, #c29a64);
  color: #fff8ef;
  box-shadow: var(--ifu-shadow-card);
}

.priority-panel__copy h3 {
  margin-top: 8px;
  font-size: 34px;
}

.priority-panel__copy p {
  margin-top: 12px;
  max-width: 460px;
  line-height: 1.75;
  color: rgba(255, 248, 239, 0.76);
}

.priority-panel__list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.priority-panel__item {
  padding: 16px;
  border-radius: 22px;
  background: rgba(255, 248, 239, 0.12);
  border: 1px solid rgba(255, 248, 239, 0.12);
}

.priority-panel__item span,
.priority-panel__item small {
  display: block;
}

.priority-panel__item span {
  font-size: 12px;
  color: rgba(255, 248, 239, 0.7);
}

.priority-panel__item strong {
  display: block;
  margin-top: 12px;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 30px;
}

.priority-panel__item small {
  margin-top: 10px;
  font-size: 11px;
  line-height: 1.6;
  color: rgba(255, 248, 239, 0.66);
}

.stats-row {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
}

.stat-value {
  margin-top: 8px;
  font-size: 34px;
  font-weight: 700;
  color: var(--ifu-text-strong);
  line-height: 1.15;
}

.stat-label {
  margin-top: 6px;
  font-size: 13px;
  color: var(--ifu-text);
}

.stat-icon {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  font-size: 24px;
}

.stat-footer {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(233, 221, 204, 0.82);
}

.stat-sub {
  font-size: 12px;
  color: var(--ifu-text-muted);
}

.dashboard-card {
  min-height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.card-header strong {
  display: block;
  margin-top: 4px;
  font-size: 20px;
  color: var(--ifu-text-strong);
}

.chart-container {
  height: 340px;
}

.chart-container--small {
  height: 340px;
}

@media (max-width: 1200px) {
  .priority-panel {
    grid-template-columns: 1fr;
  }
}
</style>
