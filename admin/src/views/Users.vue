<template>
  <div class="page-container">
    <div class="page-header">
      <h2>用户管理</h2>
    </div>

    <!-- Filter -->
    <el-card shadow="hover" class="filter-card">
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
        <el-form-item label="角色">
          <el-select v-model="filters.role" placeholder="全部" clearable>
            <el-option label="求偶用户" value="user" />
            <el-option label="红娘" value="matchmaker" />
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
        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.currentRole === 'matchmaker' ? 'warning' : 'primary'" size="small">
              {{ row.currentRole === 'matchmaker' ? '红娘' : '用户' }}
            </el-tag>
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
        <el-table-column label="注册时间" width="170">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="160">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">详情</el-button>
            <el-button v-if="row.status === 1" link type="danger" size="small" @click="toggleStatus(row, 0)">禁用</el-button>
            <el-button v-else link type="success" size="small" @click="toggleStatus(row, 1)">启用</el-button>
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
          <el-descriptions-item label="角色">{{ currentUser.currentRole === 'matchmaker' ? '红娘' : '用户' }}</el-descriptions-item>
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
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getUsers, getUserDetail, updateUserStatus } from '../api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const showDetail = ref(false)
const currentUser = ref(null)

const filters = reactive({
  keyword: '',
  gender: '',
  status: '',
  role: ''
})

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
  Object.assign(filters, { keyword: '', gender: '', status: '', role: '' })
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

onMounted(() => loadData())
</script>

<style scoped>
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
