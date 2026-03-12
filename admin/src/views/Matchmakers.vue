<template>
  <div class="page-container">
    <div class="page-header">
      <h2>红娘管理</h2>
    </div>

    <!-- Filter -->
    <el-card shadow="hover" class="filter-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" placeholder="昵称/手机号" clearable @keyup.enter="search" />
        </el-form-item>
        <el-form-item label="认证状态">
          <el-select v-model="filters.certificationStatus" placeholder="全部" clearable>
            <el-option label="未认证" :value="0" />
            <el-option label="审核中" :value="1" />
            <el-option label="已认证" :value="2" />
            <el-option label="已拒绝" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="等级">
          <el-select v-model="filters.level" placeholder="全部" clearable>
            <el-option v-for="l in [1,2,3,4,5]" :key="l" :label="`Lv.${l}`" :value="l" />
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
        <el-table-column label="头像" width="70">
          <template #default="{ row }">
            <el-avatar :size="36" :src="row.user?.avatarUrl" icon="UserFilled" />
          </template>
        </el-table-column>
        <el-table-column label="昵称" width="120">
          <template #default="{ row }">{{ row.user?.nickname || '-' }}</template>
        </el-table-column>
        <el-table-column label="手机号" width="130">
          <template #default="{ row }">{{ row.user?.phone || '-' }}</template>
        </el-table-column>
        <el-table-column label="等级" width="80">
          <template #default="{ row }">
            <el-tag type="warning" size="small">Lv.{{ row.level || 1 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="认证状态" width="100">
          <template #default="{ row }">
            <el-tag :type="certStatusType(row.certificationStatus)" size="small">
              {{ certStatusText(row.certificationStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="团队" width="120">
          <template #default="{ row }">{{ row.team?.name || '-' }}</template>
        </el-table-column>
        <el-table-column label="门店" width="120">
          <template #default="{ row }">{{ row.store?.storeName || '-' }}</template>
        </el-table-column>
        <el-table-column prop="successCount" label="成功数" width="80" />
        <el-table-column label="注册时间" width="170">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">详情</el-button>
            <el-button link type="warning" size="small" @click="showCertDialog(row)">认证</el-button>
            <el-button link type="success" size="small" @click="showLevelDialog(row)">调级</el-button>
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
    <el-drawer v-model="showDrawer" title="红娘详情" size="500px">
      <template v-if="current">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="ID">{{ current.id }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ current.user?.nickname }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ current.user?.phone }}</el-descriptions-item>
          <el-descriptions-item label="等级">Lv.{{ current.level || 1 }}</el-descriptions-item>
          <el-descriptions-item label="认证状态">{{ certStatusText(current.certificationStatus) }}</el-descriptions-item>
          <el-descriptions-item label="成功数">{{ current.successCount || 0 }}</el-descriptions-item>
          <el-descriptions-item label="团队">{{ current.team?.name || '无' }}</el-descriptions-item>
          <el-descriptions-item label="门店">{{ current.store?.storeName || '无' }}</el-descriptions-item>
          <el-descriptions-item label="上级">{{ current.parent?.user?.nickname || '无' }}</el-descriptions-item>
          <el-descriptions-item label="服务介绍">{{ current.serviceIntro || '-' }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-drawer>

    <!-- Certification Dialog -->
    <el-dialog v-model="certDialogVisible" title="更新认证状态" width="400px">
      <el-form>
        <el-form-item label="认证状态">
          <el-select v-model="certForm.certificationStatus" style="width: 100%;">
            <el-option label="未认证" :value="0" />
            <el-option label="审核中" :value="1" />
            <el-option label="已认证" :value="2" />
            <el-option label="已拒绝" :value="3" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="certDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCertUpdate">确定</el-button>
      </template>
    </el-dialog>

    <!-- Level Dialog -->
    <el-dialog v-model="levelDialogVisible" title="调整等级" width="400px">
      <el-form>
        <el-form-item label="等级">
          <el-select v-model="levelForm.level" style="width: 100%;">
            <el-option v-for="l in [1,2,3,4,5]" :key="l" :label="`Lv.${l}`" :value="l" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="levelDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleLevelUpdate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getMatchmakers, getMatchmakerDetail, updateCertification, updateMatchmakerLevel } from '../api/admin'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const showDrawer = ref(false)
const current = ref(null)
const certDialogVisible = ref(false)
const levelDialogVisible = ref(false)
const certForm = reactive({ id: null, certificationStatus: 0 })
const levelForm = reactive({ id: null, level: 1 })

const filters = reactive({ keyword: '', certificationStatus: '', level: '' })

const formatDate = (d) => d ? dayjs(d).format('YYYY-MM-DD HH:mm') : '-'

const certStatusText = (s) => ({ 0: '未认证', 1: '审核中', 2: '已认证', 3: '已拒绝' }[s] || '未知')
const certStatusType = (s) => ({ 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' }[s] || 'info')

const loadData = async () => {
  loading.value = true
  try {
    const res = await getMatchmakers({ ...filters, page: page.value, pageSize: pageSize.value })
    list.value = res.data.list
    total.value = res.data.pagination.total
  } finally {
    loading.value = false
  }
}

const search = () => { page.value = 1; loadData() }
const resetFilters = () => { Object.assign(filters, { keyword: '', certificationStatus: '', level: '' }); search() }

const viewDetail = async (row) => {
  const res = await getMatchmakerDetail(row.id)
  current.value = res.data
  showDrawer.value = true
}

const showCertDialog = (row) => {
  certForm.id = row.id
  certForm.certificationStatus = row.certificationStatus || 0
  certDialogVisible.value = true
}

const handleCertUpdate = async () => {
  await updateCertification(certForm.id, certForm.certificationStatus)
  ElMessage.success('认证状态已更新')
  certDialogVisible.value = false
  loadData()
}

const showLevelDialog = (row) => {
  levelForm.id = row.id
  levelForm.level = row.level || 1
  levelDialogVisible.value = true
}

const handleLevelUpdate = async () => {
  await updateMatchmakerLevel(levelForm.id, levelForm.level)
  ElMessage.success('等级已更新')
  levelDialogVisible.value = false
  loadData()
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
