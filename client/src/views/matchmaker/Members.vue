<template>
  <div class="page members-page">
    <van-nav-bar title="会员经营" left-arrow :border="false" @click-left="$router.back()">
      <template #right>
        <div class="members-page__nav-actions">
          <button type="button" class="members-page__nav-button" @click="showFilter = true">
            <van-badge :content="activeFilterCount || ''" color="var(--ifu-gold-700)">
              <van-icon name="filter-o" size="18" />
            </van-badge>
          </button>
          <button type="button" class="members-page__nav-button" @click="showSearch = true">
            <van-icon name="search" size="18" />
          </button>
        </div>
      </template>
    </van-nav-bar>

    <section class="card members-hero" data-testid="matchmaker-members-shell">
      <div class="members-hero__header">
        <div>
          <span class="brand-label">MEMBER STUDIO</span>
          <h1>把会员池做成持续经营的关系面板</h1>
          <p>先看存量、筛选密度和当前经营阶段，再决定是跟进、补资料还是继续发展新会员。</p>
        </div>
        <span class="brand-chip brand-chip--active">{{ currentTypeLabel }}</span>
      </div>

      <div class="members-hero__stats">
        <article v-for="item in heroStats" :key="item.label" class="members-hero__stat">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small>{{ item.hint }}</small>
        </article>
      </div>
    </section>

    <section class="card members-list-shell">
      <div class="members-list-shell__header">
        <div>
          <span class="brand-label">MEMBER LIST</span>
          <h3>{{ currentTypeLabel }}会员池</h3>
        </div>
        <span class="members-list-shell__count">当前展示 {{ memberList.length }} 条</span>
      </div>

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
    </section>

    <van-button
      class="fab-add"
      data-testid="matchmaker-members-fab"
      round
      type="primary"
      icon="plus"
      @click="showAddMember = true"
    >
      发展会员
    </van-button>

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

        <div class="add-options">
          <div class="add-option-card" @click="handleManualAdd">
            <div class="add-option-card__icon">
              <van-icon name="edit" size="28" color="var(--ifu-gold-700)" />
            </div>
            <div class="add-option-card__content">
              <div class="add-option-card__title">手动录入</div>
              <div class="add-option-card__desc">填写会员详细资料，适合线下获客</div>
            </div>
            <van-icon name="arrow" color="#b8ab99" />
          </div>

          <div class="add-option-card" @click="handleShowInviteLink">
            <div class="add-option-card__icon">
              <van-icon name="share-o" size="28" color="var(--ifu-warning)" />
            </div>
            <div class="add-option-card__content">
              <div class="add-option-card__title">邀请链接</div>
              <div class="add-option-card__desc">分享链接，用户注册后自动绑定</div>
            </div>
            <van-icon name="arrow" color="#b8ab99" />
          </div>
        </div>

        <div v-if="showInviteLink" class="invite-link-card">
          <div class="invite-link-card__desc">
            将以下链接分享给用户，用户在微信中打开并注册后，将自动成为您名下的会员。
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

    <van-popup v-model:show="showFilter" position="bottom" round :style="{ maxHeight: '80vh' }" :overlay-style="{ background: 'rgba(0,0,0,0.6)' }">
      <div class="popup-form filter-popup">
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
            class="filter-section__field"
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

const filterForm = reactive({
  gender: '',
  ageRange: '',
  education: '',
  maritalStatus: '',
  incomeRange: '',
  city: ''
})

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

const currentTypeLabel = computed(() =>
  filterOptions.find(item => item.value === memberType.value)?.label || '全部'
)

const heroStats = computed(() => [
  {
    label: '总会员',
    value: stats.total || 0,
    hint: '用于判断当前经营盘子大小'
  },
  {
    label: '当前列表',
    value: memberList.value.length,
    hint: '当前筛选条件下已经加载的会员数量'
  },
  {
    label: '生效筛选',
    value: activeFilterCount.value,
    hint: '越具体越适合做精细跟进'
  }
])

const activeFilterTags = computed(() => {
  const genderLabel = { 1: '男性', 2: '女性' }
  return [
    activeFilters.gender ? genderLabel[activeFilters.gender] : '',
    activeFilters.ageRange ? `${activeFilters.ageRange} 岁` : '',
    activeFilters.education,
    activeFilters.maritalStatus,
    activeFilters.incomeRange,
    activeFilters.city ? `${activeFilters.city} 城市` : ''
  ].filter(Boolean)
})

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
    let ageMin
    let ageMax
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
.members-page {
  padding-bottom: calc(118px + env(safe-area-inset-bottom));
}

.members-page__nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.members-page__nav-button {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(233, 221, 204, 0.9);
  border-radius: 12px;
  background: rgba(255, 252, 247, 0.78);
  color: var(--ifu-text-strong);
}

.members-hero {
  overflow: hidden;
  background:
    radial-gradient(circle at right top, rgba(255, 250, 244, 0.2), transparent 28%),
    linear-gradient(145deg, #7b5d40, #b68d59 66%, #decaab);
  color: #fff8ef;
}

.members-hero::after {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.14), transparent 38%);
}

.members-hero .brand-label {
  color: rgba(255, 248, 239, 0.72);
}

.members-hero__header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 16px;
}

.members-hero__header h1 {
  margin-top: 12px;
  font-size: 29px;
  line-height: 1.25;
}

.members-hero__header p {
  margin-top: 12px;
  max-width: 480px;
  color: rgba(255, 248, 239, 0.8);
  line-height: 1.7;
}

.members-hero .brand-chip--active {
  background: rgba(255, 248, 239, 0.18);
  color: #fff8ef;
  border-color: rgba(255, 248, 239, 0.28);
}

.members-hero__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.members-hero__stat {
  padding: 14px 10px;
  border-radius: 18px;
  background: rgba(255, 248, 239, 0.12);
  border: 1px solid rgba(255, 248, 239, 0.14);
  text-align: center;
}

.members-hero__stat span {
  display: block;
  font-size: 12px;
  color: rgba(255, 248, 239, 0.78);
  white-space: nowrap;
}

.members-hero__stat small {
  display: block;
  font-size: 11px;
  color: rgba(255, 248, 239, 0.58);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.members-hero__stat strong {
  display: block;
  margin: 8px 0 6px;
  font-size: 28px;
  color: #fffdf9;
}

.members-list-shell__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.members-list-shell__header h3 {
  margin-top: 8px;
  font-size: 21px;
  color: var(--ifu-text-strong);
}

.members-list-shell {
  padding-bottom: 8px;
}

.members-list-shell__count {
  color: var(--ifu-text-muted);
  font-size: 13px;
}

.search-popup {
  padding-bottom: 8px;
}

.filter-popup {
  background: var(--ifu-bg);
}

.filter-section {
  padding: 16px 16px;
  border-bottom: 1px solid var(--ifu-border);
}

.filter-section__label {
  font-size: 14px;
  font-weight: 600;
  color: var(--ifu-text-strong);
  margin-bottom: 12px;
}

.filter-section :deep(.van-radio-group) {
  gap: 10px;
}

.filter-section :deep(.van-radio__icon--checked .van-icon) {
  background-color: var(--ifu-gold-700);
  border-color: var(--ifu-gold-700);
}

.filter-section :deep(.van-radio__label) {
  color: var(--ifu-text);
}

.filter-section__field {
  border-radius: 12px;
  background: #fff;
  border: 1px solid var(--ifu-border);
}

.filter-section__field :deep(.van-field__control) {
  color: var(--ifu-text-strong);
}

.filter-footer {
  display: flex;
  gap: 12px;
  padding: 16px 16px 24px;
  border-top: 1px solid var(--ifu-border);
}

.fab-add {
  position: fixed;
  right: 20px;
  bottom: 90px;
  z-index: 100;
  padding: 0 18px;
  height: 48px;
  font-size: 14px;
  box-shadow: 0 18px 30px rgba(166, 124, 82, 0.28);
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
  border-bottom: 1px solid var(--ifu-border);
}

.popup-form__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--ifu-text-strong);
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
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(233, 221, 204, 0.86);
  border-radius: 18px;
  cursor: pointer;
}

.add-option-card:active {
  background: rgba(246, 235, 221, 0.88);
}

.add-option-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(200, 169, 119, 0.12);
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
  color: var(--ifu-text-strong);
  margin-bottom: 2px;
}

.add-option-card__desc {
  font-size: 12px;
  color: var(--ifu-text-muted);
}

.invite-link-card {
  padding: 0 16px 20px;
}

.invite-link-card__desc {
  font-size: 14px;
  color: var(--ifu-text);
  line-height: 1.6;
  margin-bottom: 16px;
}

.invite-link-card__url {
  padding: 12px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(233, 221, 204, 0.86);
  border-radius: 16px;
  font-size: 13px;
  color: var(--ifu-gold-700);
  word-break: break-all;
  line-height: 1.5;
  margin-bottom: 20px;
}

.invite-link-card__actions {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
