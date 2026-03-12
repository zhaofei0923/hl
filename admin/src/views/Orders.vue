<template>
  <div class="page-container orders-page" data-testid="admin-orders-shell">
    <div class="page-header orders-page__header">
      <div>
        <span class="brand-label">ORDER OPERATIONS</span>
        <h2>订单管理</h2>
        <p>优先读金额、状态和服务结构，再进入单条订单详情，减少运营在列表与抽屉之间来回跳转。</p>
      </div>
      <div class="orders-page__summary">
        <span class="orders-page__pill">支付链路</span>
        <span class="orders-page__pill orders-page__pill--active">{{ dominantTypeLabel }}</span>
        <span class="orders-page__pill">当前页 GMV {{ currency(pageRevenue) }}</span>
      </div>
    </div>

    <div class="orders-page__stats">
      <article v-for="item in overviewItems" :key="item.label" class="orders-stat-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.hint }}</small>
      </article>
    </div>

    <el-card shadow="hover" class="filter-card orders-toolbar" data-testid="admin-orders-toolbar">
      <el-form :inline="true" :model="filters">
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" placeholder="订单号 / 用户名" clearable @keyup.enter="search" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable>
            <el-option label="待支付" value="pending" />
            <el-option label="已支付" value="paid" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
            <el-option label="已退款" value="refunded" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="filters.type" placeholder="全部" clearable>
            <el-option label="会员服务" value="membership" />
            <el-option label="人工匹配" value="manual_match" />
            <el-option label="VIP服务" value="vip_service" />
            <el-option label="喜币充值" value="xi_coin_purchase" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="search">搜索</el-button>
          <el-button icon="RefreshRight" @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="orders-table-card">
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="orderNo" label="订单号" width="200" />
        <el-table-column label="用户" width="140">
          <template #default="{ row }">
            <div class="order-user-cell">
              <span>{{ row.user?.nickname || '-' }}</span>
              <small>{{ row.user?.phone || '未绑定手机号' }}</small>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="红娘" width="130">
          <template #default="{ row }">{{ row.matchmaker?.user?.nickname || '-' }}</template>
        </el-table-column>
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-tag class="order-type-tag" size="small">{{ typeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="110">
          <template #default="{ row }">
            <span class="order-amount">{{ currency(row.paidAmount || row.amount || 0) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="170">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="100">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <el-drawer v-model="showDrawer" title="订单详情" size="500px">
      <template v-if="current">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="订单号">{{ current.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="用户">{{ current.user?.nickname }} ({{ current.user?.phone }})</el-descriptions-item>
          <el-descriptions-item label="红娘">{{ current.matchmaker?.user?.nickname || '-' }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ typeText(current.type) }}</el-descriptions-item>
          <el-descriptions-item label="原价">{{ currency(current.amount) }}</el-descriptions-item>
          <el-descriptions-item label="实付">{{ currency(current.paidAmount) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusType(current.status)">{{ statusText(current.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(current.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="支付时间">{{ formatDate(current.paidAt) }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ current.remark || '-' }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { getOrders, getOrderDetail } from '../api/admin'
import dayjs from 'dayjs'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const showDrawer = ref(false)
const current = ref(null)

const filters = reactive({ keyword: '', status: '', type: '' })

const formatDate = (d) => d ? dayjs(d).format('YYYY-MM-DD HH:mm') : '-'
const typeText = (t) => ({ membership: '会员服务', manual_match: '人工匹配', vip_service: 'VIP服务', xi_coin_purchase: '喜币充值' }[t] || t)
const statusText = (s) => ({ pending: '待支付', paid: '已支付', completed: '已完成', cancelled: '已取消', refunded: '已退款' }[s] || s)
const statusType = (s) => ({ pending: 'info', paid: 'primary', completed: 'success', cancelled: 'warning', refunded: 'danger' }[s] || 'info')
const currency = (value) => `¥${Number(value || 0).toFixed(2)}`

const pageRevenue = computed(() =>
  list.value.reduce((sum, item) => sum + Number(item.paidAmount || item.amount || 0), 0)
)

const pendingCount = computed(() =>
  list.value.filter(item => item.status === 'pending').length
)

const completedCount = computed(() =>
  list.value.filter(item => item.status === 'completed').length
)

const dominantTypeLabel = computed(() => {
  if (!list.value.length) return '服务结构待生成'
  const typeCounter = list.value.reduce((acc, item) => {
    const key = item.type || 'unknown'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const dominantKey = Object.entries(typeCounter).sort((a, b) => b[1] - a[1])[0]?.[0]
  return dominantKey ? `${typeText(dominantKey)}为主` : '服务结构待生成'
})

const overviewItems = computed(() => [
  {
    label: '当前页订单',
    value: list.value.length,
    hint: '便于快速确认本轮筛选范围'
  },
  {
    label: '待支付',
    value: pendingCount.value,
    hint: '适合优先排查异常支付链路'
  },
  {
    label: '已完成',
    value: completedCount.value,
    hint: '可直接判断服务落地占比'
  },
  {
    label: '当前页 GMV',
    value: currency(pageRevenue.value),
    hint: '按实付金额统计当前可见订单'
  }
])

const loadData = async () => {
  loading.value = true
  try {
    const res = await getOrders({ ...filters, page: page.value, pageSize: pageSize.value })
    list.value = res.data.list
    total.value = res.data.pagination.total
  } finally {
    loading.value = false
  }
}

const search = () => {
  page.value = 1
  loadData()
}

const resetFilters = () => {
  Object.assign(filters, { keyword: '', status: '', type: '' })
  search()
}

const viewDetail = async (row) => {
  const res = await getOrderDetail(row.id)
  current.value = res.data
  showDrawer.value = true
}

onMounted(() => loadData())
</script>

<style scoped>
.orders-page__header {
  align-items: end;
}

.orders-page__header p {
  max-width: 620px;
  margin-top: 10px;
}

.orders-page__summary {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.orders-page__pill {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(255, 250, 243, 0.92);
  border: 1px solid rgba(233, 221, 204, 0.96);
  color: var(--ifu-text);
  font-size: 12px;
}

.orders-page__pill--active {
  background: rgba(200, 169, 119, 0.18);
  color: var(--ifu-gold-700);
}

.orders-page__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.orders-stat-card {
  padding: 18px;
  border-radius: var(--ifu-radius-md);
  border: 1px solid rgba(233, 221, 204, 0.92);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 251, 246, 0.92));
  box-shadow: var(--ifu-shadow-soft);
}

.orders-stat-card span {
  display: block;
  font-size: 12px;
  color: var(--ifu-text-muted);
}

.orders-stat-card strong {
  display: block;
  margin-top: 10px;
  font-size: 26px;
  color: var(--ifu-text-strong);
}

.orders-stat-card small {
  display: block;
  margin-top: 8px;
  color: var(--ifu-text-muted);
  line-height: 1.5;
}

.orders-toolbar,
.orders-table-card {
  position: relative;
}

.orders-toolbar::before,
.orders-table-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.24), transparent 30%);
}

.order-user-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order-user-cell span {
  color: var(--ifu-text-strong);
  font-weight: 600;
}

.order-user-cell small {
  color: var(--ifu-text-muted);
}

.order-type-tag {
  border-color: rgba(200, 169, 119, 0.22);
  background: rgba(200, 169, 119, 0.12);
  color: var(--ifu-gold-700);
}

.order-amount {
  font-weight: 700;
  color: var(--ifu-gold-700);
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

@media (max-width: 1280px) {
  .orders-page__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
