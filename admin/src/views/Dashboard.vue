<template>
  <div class="page-container">
    <div class="page-header">
      <h2>数据概览</h2>
      <el-button @click="refreshData" :loading="loading" icon="Refresh">刷新</el-button>
    </div>

    <!-- Stats Cards -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6" v-for="card in statsCards" :key="card.label">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-value">{{ card.value }}</div>
              <div class="stat-label">{{ card.label }}</div>
            </div>
            <el-icon class="stat-icon" :style="{ color: card.color, backgroundColor: card.color + '20' }">
              <component :is="card.icon" />
            </el-icon>
          </div>
          <div class="stat-footer" v-if="card.sub">
            <span class="stat-sub">{{ card.sub }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Charts -->
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>新增用户趋势</span>
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
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header><span>订单类型分布</span></template>
          <div ref="pieChartRef" class="chart-container"></div>
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
  { label: '总用户数', value: stats.value.totalUsers || 0, sub: `今日新增 ${stats.value.todayNewUsers || 0}`, icon: 'User', color: '#409EFF' },
  { label: '红娘数', value: stats.value.totalMatchmakers || 0, sub: `今日新增 ${stats.value.todayNewMatchmakers || 0}`, icon: 'Avatar', color: '#67C23A' },
  { label: '待审提现', value: stats.value.pendingWithdrawals || 0, sub: `金额 ¥${(stats.value.pendingWithdrawAmount || 0).toFixed(2)}`, icon: 'Wallet', color: '#E6A23C' },
  { label: '总订单金额', value: `¥${(stats.value.totalOrderAmount || 0).toFixed(0)}`, sub: `今日 ¥${(stats.value.todayOrderAmount || 0).toFixed(0)}`, icon: 'Tickets', color: '#F56C6C' }
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
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: trendData.value.map(d => d.date.slice(5)),
      axisLabel: { fontSize: 11 }
    },
    yAxis: { type: 'value', minInterval: 1 },
    series: [{
      data: trendData.value.map(d => d.count),
      type: 'line',
      smooth: true,
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(64,158,255,0.3)' }, { offset: 1, color: 'rgba(64,158,255,0.02)' }]) },
      lineStyle: { color: '#409EFF', width: 2 },
      itemStyle: { color: '#409EFF' }
    }]
  })
}

const typeNames = { membership: '会员服务', manual_match: '人工匹配', vip_service: 'VIP服务', xi_coin_purchase: '喜币充值' }

const renderPieChart = () => {
  if (!pieChart) {
    pieChart = echarts.init(pieChartRef.value)
  }
  pieChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      label: { show: true, formatter: '{b}\n{d}%', fontSize: 11 },
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
.stats-row {
  margin-bottom: 20px;
}

.stat-card .stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.stat-icon {
  font-size: 28px;
  padding: 12px;
  border-radius: 8px;
}

.stat-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.stat-sub {
  font-size: 12px;
  color: #909399;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 320px;
}
</style>
