<template>
  <div class="page-container">
    <div class="page-header">
      <h2>订单管理</h2>
    </div>

    <!-- Filter -->
    <el-card shadow="hover" class="filter-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" placeholder="订单号" clearable @keyup.enter="search" />
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

    <!-- Table -->
    <el-card shadow="hover">
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="orderNo" label="订单号" width="200" />
        <el-table-column label="用户" width="130">
          <template #default="{ row }">{{ row.user?.nickname || '-' }}</template>
        </el-table-column>
        <el-table-column label="红娘" width="130">
          <template #default="{ row }">{{ row.matchmaker?.user?.nickname || '-' }}</template>
        </el-table-column>
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ typeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="100">
          <template #default="{ row }">¥{{ Number(row.paidAmount || row.amount || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
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

    <!-- Detail Drawer -->
    <el-drawer v-model="showDrawer" title="订单详情" size="500px">
      <template v-if="current">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="订单号">{{ current.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="用户">{{ current.user?.nickname }} ({{ current.user?.phone }})</el-descriptions-item>
          <el-descriptions-item label="红娘">{{ current.matchmaker?.user?.nickname || '-' }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ typeText(current.type) }}</el-descriptions-item>
          <el-descriptions-item label="原价">¥{{ current.amount }}</el-descriptions-item>
          <el-descriptions-item label="实付">¥{{ current.paidAmount }}</el-descriptions-item>
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
import { ref, reactive, onMounted } from 'vue'
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

const search = () => { page.value = 1; loadData() }
const resetFilters = () => { Object.assign(filters, { keyword: '', status: '', type: '' }); search() }

const viewDetail = async (row) => {
  const res = await getOrderDetail(row.id)
  current.value = res.data
  showDrawer.value = true
}

onMounted(() => loadData())
</script>

<style scoped>
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
