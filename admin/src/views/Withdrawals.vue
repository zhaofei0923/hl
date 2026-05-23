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

    <section class="withdrawals-risk-grid" data-testid="admin-withdrawals-risk-grid">
      <article class="withdrawals-risk-card withdrawals-risk-card--primary">
        <div class="withdrawals-risk-card__head">
          <div>
            <span class="brand-label">RISK SUMMARY</span>
            <strong>本页待处理风险</strong>
          </div>
          <span class="withdrawals-risk-card__badge">{{ pendingRows.length }} 笔待审</span>
        </div>
        <div class="withdrawals-risk-card__stats">
          <article v-for="item in riskStats" :key="item.label">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <p>{{ item.note }}</p>
          </article>
        </div>
      </article>

      <article class="withdrawals-risk-card withdrawals-risk-card--notes">
        <span class="brand-label">REVIEW CHECKLIST</span>
        <strong>审批前检查</strong>
        <ul>
          <li v-for="item in reviewChecklist" :key="item">{{ item }}</li>
        </ul>
      </article>
    </section>

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
import { ref, reactive, computed, onMounted } from 'vue'
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

const pendingRows = computed(() => list.value.filter(item => item.status === 'pending'))
const pendingAmount = computed(() => pendingRows.value.reduce((sum, item) => sum + Number(item.amount || 0), 0))
const largestPendingAmount = computed(() => Math.max(0, ...pendingRows.value.map(item => Number(item.amount || 0))))
const riskStats = computed(() => [
  { label: '待审笔数', value: `${pendingRows.value.length} 笔`, note: `当前筛选共 ${total.value || list.value.length} 条记录` },
  { label: '待审金额', value: `¥${pendingAmount.value.toFixed(2)}`, note: '先核对冻结余额和账户实名' },
  { label: '最高单笔', value: `¥${largestPendingAmount.value.toFixed(2)}`, note: '高金额建议二次复核' }
])
const reviewChecklist = ['账户姓名与提现渠道一致', '冻结余额已完成扣减', '异常大额优先电话确认']

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

.withdrawals-risk-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
  gap: 18px;
  margin-bottom: 18px;
}

.withdrawals-risk-card {
  padding: 22px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(233, 221, 204, 0.96);
  box-shadow: var(--ifu-shadow-soft);
}

.withdrawals-risk-card--primary {
  background:
    linear-gradient(135deg, rgba(255, 250, 244, 0.96), rgba(246, 235, 221, 0.84)),
    #fffdf9;
}

.withdrawals-risk-card__head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.withdrawals-risk-card__head strong,
.withdrawals-risk-card--notes > strong {
  display: block;
  margin-top: 6px;
  color: var(--ifu-text-strong);
  font-size: 24px;
}

.withdrawals-risk-card__badge {
  flex-shrink: 0;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(194, 139, 78, 0.14);
  color: var(--ifu-warning);
  font-size: 12px;
  font-weight: 600;
}

.withdrawals-risk-card__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.withdrawals-risk-card__stats article {
  padding: 16px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(233, 221, 204, 0.84);
}

.withdrawals-risk-card__stats span {
  display: block;
  color: var(--ifu-text-muted);
  font-size: 12px;
}

.withdrawals-risk-card__stats strong {
  display: block;
  margin-top: 8px;
  color: var(--ifu-text-strong);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 26px;
}

.withdrawals-risk-card__stats p {
  margin-top: 8px;
  color: var(--ifu-text);
  font-size: 12px;
  line-height: 1.6;
}

.withdrawals-risk-card--notes ul {
  display: grid;
  gap: 10px;
  margin-top: 16px;
  padding: 0;
  list-style: none;
}

.withdrawals-risk-card--notes li {
  position: relative;
  padding-left: 18px;
  color: var(--ifu-text);
  font-size: 13px;
  line-height: 1.7;
}

.withdrawals-risk-card--notes li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.7em;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--ifu-gold-500);
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

@media (max-width: 1200px) {
  .withdrawals-risk-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .withdrawals-risk-card__stats {
    grid-template-columns: 1fr;
  }
}
</style>
