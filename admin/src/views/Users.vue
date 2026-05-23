<template>
  <div class="page-container users-page" data-testid="admin-users-shell">
    <div class="page-header users-page__header">
      <div>
        <span class="brand-label">MEMBER MANAGEMENT</span>
        <h2>会员管理</h2>
        <p>会员资料、认证状态与后续动作一览，仅展示寻友会员。</p>
      </div>
      <div class="users-page__summary">
        <span class="users-page__pill">寻友会员</span>
        <span class="users-page__pill users-page__pill--active">认证状态优先</span>
      </div>
    </div>

    <div class="users-page__stats" data-testid="admin-users-overview">
      <article v-for="item in overviewItems" :key="item.label" class="users-stat-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.hint }}</small>
      </article>
    </div>

    <el-card shadow="hover" class="filter-card users-toolbar" data-testid="admin-users-toolbar">
      <el-form :inline="true" :model="filters">
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" placeholder="昵称/手机号/用户名" clearable @keyup.enter="search" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="filters.gender" placeholder="全部" clearable>
            <el-option label="男" :value="1" />
            <el-option label="女" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable>
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="认证状态">
          <el-select v-model="filters.certificationStatus" placeholder="全部" clearable>
            <el-option label="未认证" value="none" />
            <el-option label="审核中" value="pending" />
            <el-option label="已认证" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="search">搜索</el-button>
          <el-button icon="RefreshRight" @click="resetFilters">重置</el-button>
          <el-button type="success" icon="Download" @click="handleExport">
            {{ selectedUsers.length > 0 ? `导出选中(${selectedUsers.length})` : '导出当前筛选' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="users-table-card">
      <el-table :data="list" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="头像" width="70">
          <template #default="{ row }">
            <el-avatar :size="36" :src="row.avatarUrl" icon="UserFilled" />
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="username" label="用户名" width="130" />
        <el-table-column label="性别" width="70">
          <template #default="{ row }">
            {{ row.gender === 1 ? '男' : row.gender === 2 ? '女' : '未设置' }}
          </template>
        </el-table-column>
        <el-table-column label="城市" width="100">
          <template #default="{ row }">
            {{ row.profile?.city || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="实名认证" width="100">
          <template #default="{ row }">
            <el-tag
              :type="certTagType(row.certificationStatus)"
              size="small"
            >{{ certTagLabel(row.certificationStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" width="170">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">详情</el-button>
            <el-button v-if="row.status === 1" link type="danger" size="small" @click="toggleStatus(row, 0)">禁用</el-button>
            <el-button v-else link type="success" size="small" @click="toggleStatus(row, 1)">启用</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
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
    <el-drawer v-model="showDetail" title="用户详情" size="500px">
      <template v-if="currentUser">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="ID">{{ currentUser.id }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ currentUser.nickname }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentUser.phone }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ currentUser.gender === 1 ? '男' : currentUser.gender === 2 ? '女' : '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentUser.status === 1 ? 'success' : 'danger'">
              {{ currentUser.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <h4 style="margin: 20px 0 10px;">个人资料</h4>
        <el-descriptions :column="2" border v-if="currentUser.profile">
          <el-descriptions-item label="年龄">{{ currentUser.profile.age || '-' }}</el-descriptions-item>
          <el-descriptions-item label="身高">{{ currentUser.profile.height ? currentUser.profile.height + 'cm' : '-' }}</el-descriptions-item>
          <el-descriptions-item label="学历">{{ currentUser.profile.education || '-' }}</el-descriptions-item>
          <el-descriptions-item label="职业">{{ currentUser.profile.occupation || '-' }}</el-descriptions-item>
          <el-descriptions-item label="城市">{{ currentUser.profile.city || '-' }}</el-descriptions-item>
          <el-descriptions-item label="收入">{{ currentUser.profile.incomeRange || '-' }}</el-descriptions-item>
          <el-descriptions-item label="婚姻状况">{{ currentUser.profile.maritalStatus || '-' }}</el-descriptions-item>
          <el-descriptions-item label="房产">{{ currentUser.profile.houseStatus || '-' }}</el-descriptions-item>
        </el-descriptions>
        <el-empty v-else description="暂无个人资料" />

        <h4 style="margin: 20px 0 10px;">钱包</h4>
        <el-descriptions :column="2" border v-if="currentUser.wallet">
          <el-descriptions-item label="可用余额">¥{{ currentUser.wallet.availableAmount }}</el-descriptions-item>
          <el-descriptions-item label="冻结金额">¥{{ currentUser.wallet.frozenAmount }}</el-descriptions-item>
          <el-descriptions-item label="总收入">¥{{ currentUser.wallet.totalEarned }}</el-descriptions-item>
          <el-descriptions-item label="喜币">{{ currentUser.wallet.xiCoins }}</el-descriptions-item>
        </el-descriptions>
        <el-empty v-else description="暂无钱包数据" />

        <h4 style="margin: 20px 0 10px;">实名认证</h4>
        <template v-if="currentUser.certification">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="真实姓名">{{ currentUser.certification.realName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="身份证号">{{ currentUser.certification.idCard || '-' }}</el-descriptions-item>
            <el-descriptions-item label="提交时间">{{ formatDate(currentUser.certification.submittedAt) }}</el-descriptions-item>
            <el-descriptions-item label="审核状态">
              <el-tag :type="certTagType(currentUser.certification.status)" size="small">
                {{ certTagLabel(currentUser.certification.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item v-if="currentUser.certification.rejectReason" label="拒绝原因">
              <span style="color: #EE0A24;">{{ currentUser.certification.rejectReason }}</span>
            </el-descriptions-item>
          </el-descriptions>

          <div v-if="currentUser.certification.idFrontPhoto || currentUser.certification.idBackPhoto" style="margin-top: 12px;">
            <div style="margin-bottom: 6px; font-size: 13px; color: #666;">证件照片</div>
            <div style="display: flex; gap: 12px;">
              <div v-if="currentUser.certification.idFrontPhoto">
                <div style="font-size: 12px; color: #999; margin-bottom: 4px;">正面（人像面）</div>
                <el-image
                  :src="currentUser.certification.idFrontPhoto"
                  style="width: 140px; height: 90px; border-radius: 4px;"
                  fit="cover"
                  :preview-src-list="[currentUser.certification.idFrontPhoto, currentUser.certification.idBackPhoto].filter(Boolean)"
                />
              </div>
              <div v-if="currentUser.certification.idBackPhoto">
                <div style="font-size: 12px; color: #999; margin-bottom: 4px;">反面（国徽面）</div>
                <el-image
                  :src="currentUser.certification.idBackPhoto"
                  style="width: 140px; height: 90px; border-radius: 4px;"
                  fit="cover"
                  :preview-src-list="[currentUser.certification.idFrontPhoto, currentUser.certification.idBackPhoto].filter(Boolean)"
                />
              </div>
            </div>
          </div>

          <div v-if="currentUser.certification.status === 'pending'" style="margin-top: 16px; display: flex; gap: 10px;">
            <el-button type="success" @click="handleReview('approve')">通过认证</el-button>
            <el-button type="danger" @click="showRejectDialog = true">拒绝</el-button>
          </div>
        </template>
        <el-empty v-else description="用户暂未提交认证申请" />
      </template>
    </el-drawer>

    <!-- Reject Reason Dialog -->
    <el-dialog v-model="showRejectDialog" title="填写拒绝原因" width="400px">
      <el-input
        v-model="rejectReason"
        type="textarea"
        :rows="3"
        placeholder="请填写拒绝原因，将展示给用户"
        maxlength="100"
        show-word-limit
      />
      <template #footer>
        <el-button @click="showRejectDialog = false">取消</el-button>
        <el-button type="danger" :disabled="!rejectReason.trim()" @click="handleReview('reject')">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getUsers, getUserDetail, updateUserStatus, reviewCertification, deleteUser, exportUsers } from '../api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const showDetail = ref(false)
const currentUser = ref(null)
const showRejectDialog = ref(false)
const rejectReason = ref('')
const selectedUsers = ref([])

const filters = reactive({
  keyword: '',
  gender: '',
  status: '',
  role: 'user',
  certificationStatus: ''
})

const approvedCount = computed(() =>
  list.value.filter(item => item.certificationStatus === 'approved').length
)

const pendingCount = computed(() =>
  list.value.filter(item => item.certificationStatus === 'pending').length
)

const disabledCount = computed(() =>
  list.value.filter(item => item.status === 0).length
)

const activeCityCount = computed(() =>
  new Set(list.value.map(item => item.profile?.city).filter(Boolean)).size
)

const overviewItems = computed(() => [
  {
    label: '当前页会员',
    value: list.value.length,
    hint: `总筛选结果 ${total.value || 0} 人`
  },
  {
    label: '已认证',
    value: approvedCount.value,
    hint: '可优先进入高质量推荐池'
  },
  {
    label: '待审核',
    value: pendingCount.value,
    hint: '需要人工核验证件与资料一致性'
  },
  {
    label: '覆盖城市',
    value: activeCityCount.value,
    hint: disabledCount.value > 0 ? `${disabledCount.value} 个账号处于禁用状态` : '当前页账号状态正常'
  }
])

const formatDate = (d) => d ? dayjs(d).format('YYYY-MM-DD HH:mm') : '-'

const loadData = async () => {
  loading.value = true
  try {
    const res = await getUsers({ ...filters, page: page.value, pageSize: pageSize.value })
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
  Object.assign(filters, { keyword: '', gender: '', status: '', role: 'user', certificationStatus: '' })
  search()
}

const viewDetail = async (row) => {
  const res = await getUserDetail(row.id)
  currentUser.value = res.data
  showDetail.value = true
}

const toggleStatus = async (row, status) => {
  const action = status === 0 ? '禁用' : '启用'
  await ElMessageBox.confirm(`确定要${action}用户 "${row.nickname}" 吗?`, '提示', { type: 'warning' })
  await updateUserStatus(row.id, status)
  ElMessage.success(`已${action}`)
  loadData()
}

const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm(`确定要删除用户 "${row.nickname || row.id}" 吗？删除后该用户将从列表中移除。`, '删除确认', { type: 'warning' })
  await deleteUser(row.id)
  ElMessage.success('删除成功')
  loadData()
}

const handleExport = async () => {
  try {
    const params = {}
    if (selectedUsers.value.length > 0) {
      params.ids = selectedUsers.value.map(u => u.id).join(',')
    } else {
      Object.assign(params, {
        keyword: filters.keyword || undefined,
        gender: filters.gender !== '' ? filters.gender : undefined,
        status: filters.status !== '' ? filters.status : undefined,
        certificationStatus: filters.certificationStatus || undefined
      })
    }
    const res = await exportUsers(params)
    const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const dateStr = dayjs().format('YYYYMMDD')
    a.download = `会员数据_${dateStr}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (err) {
    // handled by interceptor
  }
}

const certTagType = (status) => {
  const map = { none: 'info', pending: 'warning', approved: 'success', rejected: 'danger' }
  return map[status] || 'info'
}

const certTagLabel = (status) => {
  const map = { none: '未认证', pending: '审核中', approved: '已认证', rejected: '已拒绝' }
  return map[status] || '未认证'
}

const handleReview = async (action) => {
  if (action === 'reject' && !rejectReason.value.trim()) return
  try {
    const certId = currentUser.value.certification.id
    await reviewCertification(certId, action, rejectReason.value.trim() || undefined)
    ElMessage.success(action === 'approve' ? '已通过认证' : '已拒绝认证')
    showRejectDialog.value = false
    rejectReason.value = ''
    // Refresh detail
    const res = await getUserDetail(currentUser.value.id)
    currentUser.value = res.data
    loadData()
  } catch (err) {
    // handled by interceptor
  }
}

onMounted(() => loadData())
</script>

<style scoped>
.users-page__header {
  align-items: end;
}

.users-page__header p {
  max-width: 560px;
  margin-top: 10px;
}

.users-page__summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.users-page__pill {
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

.users-page__pill--active {
  background: rgba(200, 169, 119, 0.18);
  color: var(--ifu-gold-700);
}

.users-page__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.users-stat-card {
  padding: 18px;
  border-radius: var(--ifu-radius-md);
  border: 1px solid rgba(233, 221, 204, 0.92);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 251, 246, 0.92));
  box-shadow: var(--ifu-shadow-soft);
}

.users-stat-card span {
  display: block;
  font-size: 12px;
  color: var(--ifu-text-muted);
}

.users-stat-card strong {
  display: block;
  margin-top: 10px;
  font-size: 26px;
  color: var(--ifu-text-strong);
}

.users-stat-card small {
  display: block;
  margin-top: 8px;
  color: var(--ifu-text-muted);
  line-height: 1.5;
}

.users-toolbar,
.users-table-card {
  position: relative;
}

.users-toolbar::before,
.users-table-card::before {
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

@media (max-width: 1280px) {
  .users-page__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
