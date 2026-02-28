<template>
  <div class="page-container">
    <div class="page-header">
      <h2>沙龙管理</h2>
      <el-button type="primary" icon="Plus" @click="showCreate">创建沙龙</el-button>
    </div>

    <!-- Filter -->
    <el-card shadow="hover" class="filter-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable>
            <el-option label="草稿" value="draft" />
            <el-option label="报名中" value="registering" />
            <el-option label="已满员" value="full" />
            <el-option label="进行中" value="ongoing" />
            <el-option label="已结束" value="ended" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="search">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Table -->
    <el-card shadow="hover">
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="title" label="活动名称" min-width="180" />
        <el-table-column label="组织者" width="120">
          <template #default="{ row }">{{ row.organizer?.nickname || '-' }}</template>
        </el-table-column>
        <el-table-column label="活动时间" width="170">
          <template #default="{ row }">{{ formatDate(row.eventDate) }}</template>
        </el-table-column>
        <el-table-column prop="location" label="地点" width="150" />
        <el-table-column label="人数" width="100">
          <template #default="{ row }">{{ row.currentCount || 0 }}/{{ row.maxParticipants || '-' }}</template>
        </el-table-column>
        <el-table-column label="费用" width="80">
          <template #default="{ row }">{{ row.fee > 0 ? `¥${row.fee}` : '免费' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">详情</el-button>
            <el-button link type="warning" size="small" @click="showEdit(row)">编辑</el-button>
            <el-button v-if="row.status !== 'cancelled'" link type="danger" size="small" @click="handleCancel(row)">取消</el-button>
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
    <el-drawer v-model="showDrawer" title="沙龙详情" size="600px">
      <template v-if="current">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="活动名称">{{ current.title }}</el-descriptions-item>
          <el-descriptions-item label="组织者">{{ current.organizer?.nickname }} ({{ current.organizer?.phone }})</el-descriptions-item>
          <el-descriptions-item label="活动时间">{{ formatDate(current.eventDate) }}</el-descriptions-item>
          <el-descriptions-item label="地点">{{ current.location }}</el-descriptions-item>
          <el-descriptions-item label="人数">{{ current.currentCount || 0 }}/{{ current.maxParticipants }}</el-descriptions-item>
          <el-descriptions-item label="费用">{{ current.fee > 0 ? `¥${current.fee}` : '免费' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusType(current.status)">{{ statusText(current.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="简介">{{ current.description || '-' }}</el-descriptions-item>
        </el-descriptions>

        <h4 style="margin: 20px 0 10px;">报名列表 ({{ current.registrations?.length || 0 }}人)</h4>
        <el-table :data="current.registrations || []" stripe size="small">
          <el-table-column label="用户" width="120">
            <template #default="{ row }">{{ row.user?.nickname || '-' }}</template>
          </el-table-column>
          <el-table-column label="性别" width="60">
            <template #default="{ row }">{{ row.user?.gender === 1 ? '男' : '女' }}</template>
          </el-table-column>
          <el-table-column label="手机号" width="130">
            <template #default="{ row }">{{ row.user?.phone || '-' }}</template>
          </el-table-column>
          <el-table-column label="报名时间">
            <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
          </el-table-column>
        </el-table>
      </template>
    </el-drawer>

    <!-- Create/Edit Dialog -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑沙龙' : '创建沙龙'" width="600px">
      <el-form ref="formRef" :model="salonForm" :rules="rules" label-width="100px">
        <el-form-item label="活动名称" prop="title">
          <el-input v-model="salonForm.title" />
        </el-form-item>
        <el-form-item label="活动时间" prop="eventDate">
          <el-date-picker v-model="salonForm.eventDate" type="datetime" placeholder="选择时间" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="活动地点" prop="location">
          <el-input v-model="salonForm.location" />
        </el-form-item>
        <el-form-item label="最大人数" prop="maxParticipants">
          <el-input-number v-model="salonForm.maxParticipants" :min="2" :max="500" />
        </el-form-item>
        <el-form-item label="费用" prop="fee">
          <el-input-number v-model="salonForm.fee" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="salonForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getSalons, getSalonDetail, createSalon, updateSalon, updateSalonStatus } from '../api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const showDrawer = ref(false)
const current = ref(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const formRef = ref()

const filters = reactive({ status: '' })

const salonForm = reactive({
  title: '',
  eventDate: '',
  location: '',
  maxParticipants: 20,
  fee: 0,
  description: ''
})

const rules = {
  title: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  eventDate: [{ required: true, message: '请选择活动时间', trigger: 'change' }],
  location: [{ required: true, message: '请输入地点', trigger: 'blur' }]
}

const formatDate = (d) => d ? dayjs(d).format('YYYY-MM-DD HH:mm') : '-'
const statusText = (s) => ({ draft: '草稿', registering: '报名中', full: '已满员', ongoing: '进行中', ended: '已结束', cancelled: '已取消' }[s] || s)
const statusType = (s) => ({ draft: 'info', registering: 'primary', full: 'warning', ongoing: 'success', ended: '', cancelled: 'danger' }[s] || 'info')

const loadData = async () => {
  loading.value = true
  try {
    const res = await getSalons({ ...filters, page: page.value, pageSize: pageSize.value })
    list.value = res.data.list
    total.value = res.data.pagination.total
  } finally {
    loading.value = false
  }
}

const search = () => { page.value = 1; loadData() }

const viewDetail = async (row) => {
  const res = await getSalonDetail(row.id)
  current.value = res.data
  showDrawer.value = true
}

const showCreate = () => {
  isEdit.value = false
  editId.value = null
  Object.assign(salonForm, { title: '', eventDate: '', location: '', maxParticipants: 20, fee: 0, description: '' })
  dialogVisible.value = true
}

const showEdit = (row) => {
  isEdit.value = true
  editId.value = row.id
  Object.assign(salonForm, {
    title: row.title,
    eventDate: row.eventDate,
    location: row.location,
    maxParticipants: row.maxParticipants,
    fee: row.fee || 0,
    description: row.description || ''
  })
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    if (isEdit.value) {
      await updateSalon(editId.value, { ...salonForm })
      ElMessage.success('更新成功')
    } else {
      await createSalon({ ...salonForm, status: 'registering' })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  })
}

const handleCancel = async (row) => {
  await ElMessageBox.confirm(`确定要取消沙龙 "${row.title}" 吗?`, '提示', { type: 'warning' })
  await updateSalonStatus(row.id, 'cancelled')
  ElMessage.success('已取消')
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
