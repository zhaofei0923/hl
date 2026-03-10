<template>
  <div class="page">
    <!-- 导航栏 -->
    <van-nav-bar :title="`我的会员 (${stats.total})`" left-arrow @click-left="$router.back()">
      <template #right>
        <div style="display:flex;align-items:center;gap:14px;">
          <van-badge :content="activeFilterCount || ''" color="var(--hl-primary-color)">
            <van-icon name="filter-o" size="20" @click="showFilter = true" />
          </van-badge>
          <van-icon name="search" size="20" @click="showSearch = true" />
        </div>
      </template>
    </van-nav-bar>

    <!-- 类型筛选 -->
    <div class="filter-bar">
      <div
        v-for="item in filterOptions"
        :key="item.value"
        class="filter-bar__item"
        :class="{ 'filter-bar__item--active': memberType === item.value }"
        @click="memberType = item.value"
      >
        {{ item.label }}
      </div>
    </div>

    <!-- 会员列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="listLoading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadMore"
      >
        <MemberCard
          v-for="item in memberList"
          :key="item.id"
          :member="item"
          @click="handleMemberClick"
          @edit-profile="handleEditProfile"
          @delete="handleDelete"
          @call="handleCall"
        />

        <EmptyState v-if="!listLoading && memberList.length === 0" text="暂无会员数据" />
      </van-list>
    </van-pull-refresh>

    <!-- 添加会员浮动按钮 -->
    <van-button
      class="fab-add"
      round
      type="primary"
      icon="plus"
      @click="showAddMember = true"
    >
      发展会员
    </van-button>

    <!-- 发展会员弹窗 -->
    <van-popup
      v-model:show="showAddMember"
      position="bottom"
      round
      :style="{ maxHeight: '70vh' }"
    >
      <div class="popup-form">
        <div class="popup-form__header">
          <span class="popup-form__title">发展新会员</span>
          <van-icon name="cross" size="18" @click="showAddMember = false" />
        </div>

        <!-- 方式选项 -->
        <div class="add-options">
          <!-- 手动录入 -->
          <div class="add-option-card" @click="handleManualAdd">
            <div class="add-option-card__icon">
              <van-icon name="edit" size="28" color="var(--hl-primary-color)" />
            </div>
            <div class="add-option-card__content">
              <div class="add-option-card__title">手动录入</div>
              <div class="add-option-card__desc">填写会员详细资料，适合线下获客</div>
            </div>
            <van-icon name="arrow" color="#ccc" />
          </div>

          <!-- 邀请链接 -->
          <div class="add-option-card" @click="handleShowInviteLink">
            <div class="add-option-card__icon">
              <van-icon name="share-o" size="28" color="var(--hl-primary-color)" />
            </div>
            <div class="add-option-card__content">
              <div class="add-option-card__title">邀请链接</div>
              <div class="add-option-card__desc">分享链接，用户注册后自动绑定</div>
            </div>
            <van-icon name="arrow" color="#ccc" />
          </div>
        </div>

        <!-- 邀请链接区域（展开时显示） -->
        <div v-if="showInviteLink" class="invite-link-card">
          <div class="invite-link-card__desc">
            将以下链接分享给用户，用户在微信中打开并注册后，将自动成为您名下的会员
          </div>
          <div class="invite-link-card__url">
            {{ inviteUrl || '生成中...' }}
          </div>
          <div class="invite-link-card__actions">
            <van-button round block type="primary" icon="link-o" @click="handleCopyLink">
              复制邀请链接
            </van-button>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 搜索弹出框 -->
    <van-popup v-model:show="showSearch" position="top" round>
      <div class="search-popup">
        <van-search
          v-model="searchKeyword"
          placeholder="搜索姓名或手机号"
          show-action
          @search="handleSearch"
          @cancel="showSearch = false"
        />
      </div>
    </van-popup>

    <!-- 筛选面板 -->
    <van-popup v-model:show="showFilter" position="bottom" round :style="{ maxHeight: '80vh' }">
      <div class="popup-form">
        <div class="popup-form__header">
          <span class="popup-form__title">筛选条件</span>
          <van-icon name="cross" size="18" @click="showFilter = false" />
        </div>
        <div class="filter-section">
          <div class="filter-section__label">性别</div>
          <van-radio-group v-model="filterForm.gender" direction="horizontal">
            <van-radio name="">不限</van-radio>
            <van-radio name="1">男</van-radio>
            <van-radio name="2">女</van-radio>
          </van-radio-group>
        </div>
        <div class="filter-section">
          <div class="filter-section__label">年龄段</div>
          <van-radio-group v-model="filterForm.ageRange" direction="horizontal" style="flex-wrap:wrap;gap:8px;">
            <van-radio name="">不限</van-radio>
            <van-radio name="20-25">20-25岁</van-radio>
            <van-radio name="26-30">26-30岁</van-radio>
            <van-radio name="31-35">31-35岁</van-radio>
            <van-radio name="36-40">36-40岁</van-radio>
            <van-radio name="41-99">40岁以上</van-radio>
          </van-radio-group>
        </div>
        <div class="filter-section">
          <div class="filter-section__label">学历</div>
          <van-radio-group v-model="filterForm.education" direction="horizontal" style="flex-wrap:wrap;gap:8px;">
            <van-radio name="">不限</van-radio>
            <van-radio name="高中及以下">高中及以下</van-radio>
            <van-radio name="专科">专科</van-radio>
            <van-radio name="本科">本科</van-radio>
            <van-radio name="硕士">硕士</van-radio>
            <van-radio name="博士">博士</van-radio>
          </van-radio-group>
        </div>
        <div class="filter-section">
          <div class="filter-section__label">婚姻状况</div>
          <van-radio-group v-model="filterForm.maritalStatus" direction="horizontal" style="flex-wrap:wrap;gap:8px;">
            <van-radio name="">不限</van-radio>
            <van-radio name="未婚">未婚</van-radio>
            <van-radio name="离异">离异</van-radio>
            <van-radio name="丧偶">丧偶</van-radio>
          </van-radio-group>
        </div>
        <div class="filter-section">
          <div class="filter-section__label">收入范围</div>
          <van-radio-group v-model="filterForm.incomeRange" direction="horizontal" style="flex-wrap:wrap;gap:8px;">
            <van-radio name="">不限</van-radio>
            <van-radio name="5万以下">5万以下</van-radio>
            <van-radio name="5-10万">5-10万</van-radio>
            <van-radio name="10-20万">10-20万</van-radio>
            <van-radio name="20-50万">20-50万</van-radio>
            <van-radio name="50-100万">50-100万</van-radio>
          </van-radio-group>
        </div>
        <div class="filter-section">
          <div class="filter-section__label">城市</div>
          <van-field
            v-model="filterForm.city"
            placeholder="输入城市名称"
            clearable
            style="background:var(--hl-bg-color);border-radius:8px;"
          />
        </div>
        <div class="filter-footer">
          <van-button block plain round @click="resetFilter">重置</van-button>
          <van-button block type="primary" round @click="applyFilter">确认筛选</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { memberApi } from '@/api/member'
import MemberCard from '@/components/matchmaker/MemberCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const router = useRouter()

const memberType = ref('all')
const showSearch = ref(false)
const showFilter = ref(false)
const searchKeyword = ref('')
const refreshing = ref(false)
const listLoading = ref(false)
const finished = ref(false)
const page = ref(1)
const memberList = ref([])

// 筛选表单状态
const filterForm = reactive({
  gender: '',
  ageRange: '',
  education: '',
  maritalStatus: '',
  incomeRange: '',
  city: ''
})

// 当前生效的筛选条件
const activeFilters = reactive({
  gender: '',
  ageRange: '',
  education: '',
  maritalStatus: '',
  incomeRange: '',
  city: ''
})

const activeFilterCount = computed(() =>
  Object.values(activeFilters).filter(v => v !== '').length
)

const showAddMember = ref(false)
const showInviteLink = ref(false)
const inviteUrl = ref('')

const stats = reactive({
  total: 0
})

const filterOptions = [
  { label: '全部', value: 'all' },
  { label: '会员', value: 'member' },
  { label: '人工牵线', value: 'manual_match' },
  { label: '无消费', value: 'no_consumption' }
]

async function fetchStats() {
  try {
    const res = await memberApi.getStats()
    if (res.data) {
      stats.total = res.data.total || 0
    }
  } catch (err) {
    // handled by interceptor
  }
}

async function loadMembers(isRefresh = false) {
  if (isRefresh) {
    page.value = 1
    finished.value = false
  }

  try {
    // 解析年龄段
    let ageMin, ageMax
    if (activeFilters.ageRange) {
      const [min, max] = activeFilters.ageRange.split('-')
      ageMin = min
      ageMax = max
    }

    const params = {
      page: page.value,
      pageSize: 10,
      type: memberType.value === 'all' ? undefined : memberType.value,
      keyword: searchKeyword.value || undefined,
      gender: activeFilters.gender || undefined,
      ageMin: ageMin || undefined,
      ageMax: ageMax || undefined,
      education: activeFilters.education || undefined,
      maritalStatus: activeFilters.maritalStatus || undefined,
      incomeRange: activeFilters.incomeRange || undefined,
      city: activeFilters.city || undefined
    }
    const res = await memberApi.getList(params)
    const list = res.data?.list || []

    if (isRefresh) {
      memberList.value = list
    } else {
      memberList.value.push(...list)
    }

    if (list.length < 10) {
      finished.value = true
    } else {
      page.value++
    }
  } catch (err) {
    finished.value = true
  } finally {
    listLoading.value = false
    refreshing.value = false
  }
}

function loadMore() {
  loadMembers()
}

function onRefresh() {
  loadMembers(true)
}

watch(memberType, () => {
  memberList.value = []
  loadMembers(true)
})

function handleSearch() {
  showSearch.value = false
  memberList.value = []
  loadMembers(true)
}

function applyFilter() {
  Object.assign(activeFilters, { ...filterForm })
  showFilter.value = false
  memberList.value = []
  loadMembers(true)
}

function resetFilter() {
  Object.assign(filterForm, { gender: '', ageRange: '', education: '', maritalStatus: '', incomeRange: '', city: '' })
  Object.assign(activeFilters, { gender: '', ageRange: '', education: '', maritalStatus: '', incomeRange: '', city: '' })
  showFilter.value = false
  memberList.value = []
  loadMembers(true)
}

function handleMemberClick(member) {
  router.push(`/matchmaker/member/${member.id}`)
}

function handleEditProfile(member) {
  router.push(`/matchmaker/member/${member.id}/edit`)
}

function handleDelete(member) {
  showConfirmDialog({
    title: '确认删除',
    message: `确定要删除会员「${member.realName || member.nickname || ''}」吗？此操作不可撤销。`
  }).then(() => {
    memberApi.deleteMember(member.id).then(() => {
      showToast('删除成功')
      memberList.value = memberList.value.filter(m => m.id !== member.id)
      fetchStats()
    }).catch(() => {})
  }).catch(() => {})
}

function handleCall(member) {
  if (member.phone) {
    window.location.href = `tel:${member.phone}`
  }
}

function handleManualAdd() {
  showAddMember.value = false
  router.push('/matchmaker/member/add')
}

function handleShowInviteLink() {
  showInviteLink.value = true
}

watch(showAddMember, async (val) => {
  if (!val) {
    showInviteLink.value = false
    return
  }
  if (!inviteUrl.value) {
    try {
      const res = await memberApi.getInviteCode()
      const code = res.data?.code
      inviteUrl.value = `${window.location.origin}/login?inviteCode=${code}`
    } catch {
      inviteUrl.value = '生成失败，请重试'
    }
  }
})

function handleCopyLink() {
  if (!inviteUrl.value || inviteUrl.value.includes('失败')) return
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(inviteUrl.value).then(() => {
      showToast('链接已复制，可粘贴至微信分享')
    }).catch(() => fallbackCopy(inviteUrl.value))
  } else {
    fallbackCopy(inviteUrl.value)
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.top = '-9999px'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
  showToast('链接已复制，可粘贴至微信分享')
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.filter-bar {
  display: flex;
  padding: 8px 16px;
  gap: 8px;
  background: var(--hl-card-bg);
}

.filter-bar__item {
  padding: 4px 12px;
  font-size: 13px;
  color: var(--hl-text-secondary);
  border-radius: 16px;
  background: var(--hl-bg-color);
  cursor: pointer;
}

.filter-bar__item--active {
  color: #fff;
  background: var(--hl-primary-color);
}

.search-popup {
  padding-bottom: 8px;
}

.filter-section {
  padding: 14px 16px;
  border-bottom: 1px solid var(--hl-border-color);
}

.filter-section__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--hl-text-secondary);
  margin-bottom: 10px;
}

.filter-footer {
  display: flex;
  gap: 12px;
  padding: 16px 16px 24px;
}

.fab-add {
  position: fixed;
  right: 20px;
  bottom: 80px;
  z-index: 100;
  padding: 0 16px;
  height: 44px;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(255, 125, 65, 0.4);
}

.popup-form {
  padding: 0 0 24px;
  overflow-y: auto;
  max-height: 85vh;
}

.popup-form__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
  border-bottom: 1px solid var(--hl-border-color);
}

.popup-form__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--hl-text-primary);
}

.popup-form__footer {
  padding: 20px 16px 0;
}

.add-options {
  padding: 8px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.add-option-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 12px;
  background: var(--hl-bg-color);
  border-radius: var(--hl-radius-sm);
  cursor: pointer;
  transition: background 0.15s;
}

.add-option-card:active {
  background: #f0ece8;
}

.add-option-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(var(--hl-primary-rgb, 180, 120, 60), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.add-option-card__content {
  flex: 1;
}

.add-option-card__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--hl-text-primary);
  margin-bottom: 2px;
}

.add-option-card__desc {
  font-size: 12px;
  color: var(--hl-text-secondary);
}

.invite-link-card {
  padding: 0 16px 20px;
}

.invite-link-card__desc {
  font-size: 14px;
  color: var(--hl-text-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
}

.invite-link-card__url {
  padding: 12px;
  background: var(--hl-bg-color);
  border-radius: var(--hl-radius-sm);
  font-size: 13px;
  color: var(--hl-primary-color);
  word-break: break-all;
  line-height: 1.5;
  margin-bottom: 20px;
}

.invite-link-card__actions {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
