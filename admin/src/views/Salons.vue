<template>
  <div class="page-container salons-page" data-testid="admin-salons-shell">
    <div class="page-header salons-page__header">
      <div>
        <span class="brand-label">SALON OPERATIONS</span>
        <h2>沙龙管理</h2>
        <p>优先读活动状态、席位和组织者信息，再决定是创建、编辑还是进入详情确认报名情况。</p>
      </div>
      <div class="salons-page__summary">
        <span class="salons-page__pill">线下活动</span>
        <span class="salons-page__pill salons-page__pill--active">{{ dominantStatusLabel }}</span>
        <el-button type="primary" icon="Plus" @click="showCreate">创建沙龙</el-button>
      </div>
    </div>

    <div class="salons-page__stats">
      <article v-for="item in overviewItems" :key="item.label" class="salons-stat-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.hint }}</small>
      </article>
    </div>

    <section class="salons-planning-grid" data-testid="admin-salons-planning">
      <article class="salons-planning-card salons-planning-card--primary">
        <div class="salons-planning-card__head">
          <div>
            <span class="brand-label">EVENT READINESS</span>
            <strong>活动准备度</strong>
          </div>
          <span>{{ upcomingCount }} 场待开始</span>
        </div>
        <p>优先检查即将开始活动的席位占用、组织者和报名名单，临近活动要先确认到场意向。</p>
      </article>
      <article class="salons-planning-card">
        <span class="brand-label">PLANNING CHECKS</span>
        <strong>排期检查</strong>
        <div class="salons-planning-tags">
          <span v-for="item in planningHints" :key="item">{{ item }}</span>
        </div>
      </article>
    </section>

    <el-card shadow="hover" class="filter-card salons-toolbar" data-testid="admin-salons-toolbar">
      <el-form :inline="true" :model="filters">
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable>
            <el-option label="即将开始" value="upcoming" />
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

    <el-card shadow="hover" class="salons-table-card">
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="title" label="活动名称" min-width="220" />
        <el-table-column label="组织者" width="140">
          <template #default="{ row }">{{ row.organizer?.nickname || '-' }}</template>
        </el-table-column>
        <el-table-column label="活动时间" width="170">
          <template #default="{ row }">{{ formatDate(row.eventDate) }}</template>
        </el-table-column>
        <el-table-column prop="location" label="地点" width="160" />
        <el-table-column label="人数" width="110">
          <template #default="{ row }">{{ row.currentParticipants || 0 }}/{{ row.maxParticipants || '-' }}</template>
        </el-table-column>
        <el-table-column label="费用" width="90">
          <template #default="{ row }">{{ row.price > 0 ? `¥${row.price}` : '免费' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="110">
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

    <el-drawer v-model="showDrawer" title="沙龙详情" size="600px">
      <template v-if="current">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="活动名称">{{ current.title }}</el-descriptions-item>
          <el-descriptions-item label="组织者">{{ current.organizer?.nickname }} ({{ current.organizer?.phone }})</el-descriptions-item>
          <el-descriptions-item label="活动时间">{{ formatDate(current.eventDate) }}</el-descriptions-item>
          <el-descriptions-item label="地点">{{ current.location }}</el-descriptions-item>
          <el-descriptions-item label="人数">{{ current.currentParticipants || 0 }}/{{ current.maxParticipants }}</el-descriptions-item>
          <el-descriptions-item label="费用">{{ current.price > 0 ? `¥${current.price}` : '免费' }}</el-descriptions-item>
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
        <el-form-item label="费用" prop="price">
          <el-input-number v-model="salonForm.price" :min="0" :precision="2" />
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
import { ref, reactive, onMounted, computed } from 'vue'
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
  price: 0,
  description: ''
})

const rules = {
  title: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  eventDate: [{ required: true, message: '请选择活动时间', trigger: 'change' }],
  location: [{ required: true, message: '请输入地点', trigger: 'blur' }]
}

const formatDate = (d) => d ? dayjs(d).format('YYYY-MM-DD HH:mm') : '-'
const statusText = (s) => ({ upcoming: '即将开始', ongoing: '进行中', ended: '已结束', cancelled: '已取消' }[s] || s)
const statusType = (s) => ({ upcoming: 'primary', ongoing: 'success', ended: '', cancelled: 'danger' }[s] || 'info')

const seatTotal = computed(() =>
  list.value.reduce((sum, item) => sum + Number(item.maxParticipants || 0), 0)
)

const currentParticipantsTotal = computed(() =>
  list.value.reduce((sum, item) => sum + Number(item.currentParticipants || 0), 0)
)

const upcomingCount = computed(() =>
  list.value.filter(item => item.status === 'upcoming').length
)

const cancelledCount = computed(() =>
  list.value.filter(item => item.status === 'cancelled').length
)

const dominantStatusLabel = computed(() => {
  if (!list.value.length) return '活动状态待生成'
  const counter = list.value.reduce((acc, item) => {
    const key = item.status || 'unknown'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const dominantKey = Object.entries(counter).sort((a, b) => b[1] - a[1])[0]?.[0]
  return dominantKey ? `${statusText(dominantKey)}为主` : '活动状态待生成'
})

const overviewItems = computed(() => [
  {
    label: '当前页活动',
    value: list.value.length,
    hint: '当前筛选条件下的线下活动数量'
  },
  {
    label: '即将开始',
    value: upcomingCount.value,
    hint: '适合优先观察报名与转化'
  },
  {
    label: '已取消',
    value: cancelledCount.value,
    hint: '需要复盘活动组织与用户触达'
  },
  {
    label: '席位占用',
    value: `${currentParticipantsTotal.value}/${seatTotal.value || 0}`,
    hint: '快速判断当前活动池的报名热度'
  }
])

const planningHints = computed(() => [
  dominantStatusLabel.value,
  cancelledCount.value > 0 ? '存在取消活动需复盘' : '取消风险较低',
  seatTotal.value > 0 ? `席位占用 ${currentParticipantsTotal.value}/${seatTotal.value}` : '席位待配置'
])

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

const search = () => {
  page.value = 1
  loadData()
}

const viewDetail = async (row) => {
  const res = await getSalonDetail(row.id)
  current.value = res.data
  showDrawer.value = true
}

const showCreate = () => {
  isEdit.value = false
  editId.value = null
  Object.assign(salonForm, { title: '', eventDate: '', location: '', maxParticipants: 20, price: 0, description: '' })
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
    price: row.price || 0,
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
      await createSalon({ ...salonForm, status: 'upcoming' })
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
.salons-page__header {
  align-items: end;
}

.salons-page__header p {
  max-width: 620px;
  margin-top: 10px;
}

.salons-page__summary {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.salons-page__pill {
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

.salons-page__pill--active {
  background: rgba(200, 169, 119, 0.18);
  color: var(--ifu-gold-700);
}

.salons-page__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.salons-planning-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: 18px;
  margin-bottom: 18px;
}

.salons-planning-card {
  padding: 22px;
  border-radius: 30px;
  border: 1px solid rgba(233, 221, 204, 0.96);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: var(--ifu-shadow-soft);
}

.salons-planning-card--primary {
  background:
    linear-gradient(135deg, rgba(255, 250, 244, 0.96), rgba(246, 235, 221, 0.84)),
    #fffdf9;
}

.salons-planning-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.salons-planning-card__head span:last-child {
  flex-shrink: 0;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(126, 154, 120, 0.14);
  color: var(--ifu-success);
  font-size: 12px;
  font-weight: 600;
}

.salons-planning-card strong {
  display: block;
  margin-top: 6px;
  color: var(--ifu-text-strong);
  font-size: 24px;
}

.salons-planning-card p {
  margin-top: 12px;
  color: var(--ifu-text);
  font-size: 13px;
  line-height: 1.7;
}

.salons-planning-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.salons-planning-tags span {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(200, 169, 119, 0.14);
  color: var(--ifu-gold-700);
  font-size: 12px;
}

.salons-stat-card {
  padding: 18px;
  border-radius: var(--ifu-radius-md);
  border: 1px solid rgba(233, 221, 204, 0.92);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 251, 246, 0.92));
  box-shadow: var(--ifu-shadow-soft);
}

.salons-stat-card span {
  display: block;
  font-size: 12px;
  color: var(--ifu-text-muted);
}

.salons-stat-card strong {
  display: block;
  margin-top: 10px;
  font-size: 26px;
  color: var(--ifu-text-strong);
}

.salons-stat-card small {
  display: block;
  margin-top: 8px;
  color: var(--ifu-text-muted);
  line-height: 1.5;
}

.salons-toolbar,
.salons-table-card {
  position: relative;
}

.salons-toolbar::before,
.salons-table-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.24), transparent 30%);
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

@media (max-width: 1280px) {
  .salons-page__stats,
  .salons-planning-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .salons-page__stats,
  .salons-planning-grid {
    grid-template-columns: 1fr;
  }
}
</style>
