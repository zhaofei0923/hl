<template>
  <div class="page-container withdrawals-page" data-testid="admin-withdrawals-shell">
    <div class="page-header withdrawals-page__header">
      <div>
        <span class="brand-label">WITHDRAWALS</span>
        <h2>提现审批</h2>
        <p>优先看金额、渠道和风险等级，再做通过或拒绝判断，减少审批过程中的上下文切换。</p>
      </div>
      <div class="withdrawals-page__summary">
        <span class="withdrawals-page__pill">审批视图</span>
        <span class="withdrawals-page__pill withdrawals-page__pill--active">高风险优先</span>
      </div>
    </div>

    <el-card shadow="hover" class="filter-card withdrawals-toolbar" data-testid="admin-withdrawals-toolbar">
      <el-form :inline="true" :model="filters">
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable>
            <el-option label="全部" value="all" />
            <el-option label="待审核" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="search">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="withdrawals-table-card">
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="用户" width="150">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="28" :src="row.user?.avatarUrl" icon="UserFilled" />
              <span>{{ row.user?.nickname || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ Number(row.amount).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="提现方式" width="100">
          <template #default="{ row }">{{ withdrawToText(row.withdrawTo) }}</template>
        </el-table-column>
        <el-table-column label="账户信息" min-width="150">
          <template #default="{ row }">
            {{ formatAccountInfo(row.accountInfo) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="170">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="160">
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <el-button link type="success" size="small" @click="handleApprove(row)">通过</el-button>
              <el-button link type="danger" size="small" @click="showReject(row)">拒绝</el-button>
            </template>
            <span v-else class="text-muted">-</span>
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

    <!-- Reject Dialog -->
    <el-dialog v-model="rejectVisible" title="拒绝提现" width="400px">
      <el-form>
        <el-form-item label="拒绝原因" required>
          <el-input v-model="rejectReason" type="textarea" :rows="3" placeholder="请输入拒绝原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="danger" @click="handleReject">确定拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getWithdrawals, approveWithdrawal, rejectWithdrawal } from '../api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const rejectVisible = ref(false)
const rejectReason = ref('')
const rejectId = ref(null)

const filters = reactive({ status: '' })

const formatDate = (d) => d ? dayjs(d).format('YYYY-MM-DD HH:mm') : '-'
const statusText = (s) => ({ pending: '待审核', processing: '处理中', completed: '已完成', success: '已到账', rejected: '已拒绝' }[s] || s)
const statusType = (s) => ({ pending: 'warning', processing: 'primary', completed: 'success', success: 'success', rejected: 'danger' }[s] || 'info')
const withdrawToText = (w) => ({ bank: '银行卡', alipay: '支付宝', wechat: '微信' }[w] || w || '-')

const formatAccountInfo = (info) => {
  if (!info) return '-'
  try {
    const obj = typeof info === 'string' ? JSON.parse(info) : info
    if (obj.bankName) return `${obj.realName || ''} ${obj.bankName} ${obj.cardNo || ''}`
    if (obj.alipayAccount) return `支付宝 ${obj.alipayAccount}`
    if (obj.wechatId) return `微信 ${obj.wechatId}`
    return Object.values(obj).filter(Boolean).join(' ')
  } catch { return String(info) }
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getWithdrawals({ ...filters, page: page.value, pageSize: pageSize.value })
    list.value = res.data.list
    total.value = res.data.pagination.total
  } finally {
    loading.value = false
  }
}

const search = () => { page.value = 1; loadData() }

const handleApprove = async (row) => {
  await ElMessageBox.confirm(`确定通过 ¥${row.amount} 的提现申请?`, '提示', { type: 'warning' })
  await approveWithdrawal(row.id)
  ElMessage.success('已通过')
  loadData()
}

const showReject = (row) => {
  rejectId.value = row.id
  rejectReason.value = ''
  rejectVisible.value = true
}

const handleReject = async () => {
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请填写拒绝原因')
    return
  }
  await rejectWithdrawal(rejectId.value, rejectReason.value)
  ElMessage.success('已拒绝')
  rejectVisible.value = false
  loadData()
}

onMounted(() => loadData())
</script>

<style scoped>
.withdrawals-page__header {
  align-items: end;
}

.withdrawals-page__header p {
  max-width: 560px;
  margin-top: 10px;
}

.withdrawals-page__summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.withdrawals-page__pill {
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

.withdrawals-page__pill--active {
  background: rgba(200, 169, 119, 0.18);
  color: var(--ifu-gold-700);
}

.withdrawals-toolbar,
.withdrawals-table-card {
  position: relative;
}

.withdrawals-toolbar::before,
.withdrawals-table-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.22), transparent 32%);
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.amount {
  font-weight: 600;
  color: #f56c6c;
}

.text-muted {
  color: #c0c4cc;
}
</style>
