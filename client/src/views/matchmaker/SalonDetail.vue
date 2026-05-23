<template>
  <div class="page">
    <van-nav-bar title="活动详情" left-arrow @click-left="$router.back()">
      <template #right v-if="isOrganizer && event?.status === 'upcoming'">
        <van-icon name="edit" size="20" @click="goEdit" style="margin-right: 12px" />
        <van-icon name="ellipsis" size="20" @click="showActions = true" />
      </template>
    </van-nav-bar>

    <div v-if="event" class="detail-content">
      <!-- 封面 -->
      <van-image
        v-if="event.coverImage"
        :src="event.coverImage"
        width="100%"
        height="200"
        fit="cover"
      />

      <!-- 基本信息 -->
      <div class="info-card">
        <div class="info-card__header">
          <h2 class="info-card__title">{{ event.title }}</h2>
          <van-tag round size="large" :type="statusType(event.status)">
            {{ statusText(event.status) }}
          </van-tag>
        </div>

        <div class="info-row">
          <van-icon name="clock-o" size="18" color="var(--hl-primary-color)" />
          <span>{{ formatDate(event.eventDate, 'YYYY-MM-DD HH:mm') }}</span>
        </div>
        <div class="info-row">
          <van-icon name="location-o" size="18" color="var(--hl-primary-color)" />
          <span>{{ event.location || '待定' }}</span>
        </div>
        <div class="info-row">
          <van-icon name="friends-o" size="18" color="var(--hl-primary-color)" />
          <span>{{ event.currentParticipants || 0 }}{{ event.maxParticipants ? `/${event.maxParticipants}` : '' }} 人报名</span>
        </div>
        <div class="info-row" v-if="event.price > 0">
          <van-icon name="gold-coin-o" size="18" color="var(--hl-accent-color)" />
          <span class="price">¥{{ Number(event.price).toFixed(2) }}</span>
        </div>
        <div class="info-row" v-else>
          <van-icon name="gold-coin-o" size="18" color="#67c23a" />
          <span style="color: #67c23a; font-weight: 600">免费</span>
        </div>
        <div class="info-row" v-if="event.organizer">
          <van-icon name="manager-o" size="18" color="var(--hl-primary-color)" />
          <span>组织者: {{ event.organizer.nickname }}</span>
        </div>
      </div>

      <section class="salon-execution-card" data-testid="matchmaker-salon-execution">
        <div class="salon-execution-card__head">
          <div>
            <span class="brand-label">EXECUTION CHECK</span>
            <h2>活动执行判断</h2>
          </div>
          <strong>{{ executionState }}</strong>
        </div>
        <div class="salon-execution-card__grid">
          <article v-for="item in executionItems" :key="item.label">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <p>{{ item.hint }}</p>
          </article>
        </div>
      </section>

      <!-- 描述 -->
      <div v-if="event.description" class="desc-card">
        <div class="section-title">活动介绍</div>
        <div class="desc-text">{{ event.description }}</div>
      </div>

      <!-- 报名人员 -->
      <div class="member-card">
        <div class="section-title">
          报名人员 ({{ registrations.length }})
          <van-button
            v-if="isOrganizer && event.status === 'upcoming'"
            size="small"
            type="primary"
            plain
            icon="plus"
            @click="showInvite = true"
            style="float: right"
          >邀请会员</van-button>
        </div>
        <div v-if="registrations.length > 0" class="member-list">
          <div v-for="reg in registrations" :key="reg.id" class="member-item">
            <van-image
              round
              width="36"
              height="36"
              :src="reg.user?.avatarUrl"
              fit="cover"
            >
              <template #error>
                <van-icon name="user-o" size="20" />
              </template>
            </van-image>
            <div class="member-info">
              <span class="member-name">{{ reg.user?.nickname || '未知' }}</span>
              <van-icon
                v-if="reg.user?.gender === 2"
                name="female"
                color="#FF4D6A"
                size="14"
              />
              <van-icon
                v-else-if="reg.user?.gender === 1"
                name="male"
                color="#1989fa"
                size="14"
              />
            </div>
          </div>
        </div>
        <van-empty v-else image="search" description="暂无报名" :image-size="60" />
      </div>
    </div>

    <!-- 底部按钮 -->
    <div v-if="event && event.status === 'upcoming'" class="bottom-bar">
      <template v-if="isOrganizer">
        <van-button round block type="primary" icon="plus" @click="showInvite = true">
          邀请会员参加
        </van-button>
      </template>
      <template v-else>
        <van-button
          v-if="isRegistered"
          round
          block
          plain
          type="danger"
          :loading="actionLoading"
          @click="handleCancel"
        >取消报名</van-button>
        <van-button
          v-else
          round
          block
          type="primary"
          :loading="actionLoading"
          @click="handleRegister"
        >立即报名</van-button>
      </template>
    </div>

    <!-- 操作菜单 -->
    <van-action-sheet
      v-model:show="showActions"
      :actions="actionOptions"
      cancel-text="取消"
      @select="onActionSelect"
    />

    <!-- 邀请会员弹窗 -->
    <van-popup
      v-model:show="showInvite"
      position="bottom"
      round
      :style="{ height: '70%' }"
    >
      <div class="invite-popup">
        <div class="invite-header">
          <span class="invite-title">邀请会员</span>
          <van-button
            size="small"
            type="primary"
            :loading="inviteLoading"
            :disabled="selectedMembers.length === 0"
            @click="handleInvite"
          >
            发送邀请 ({{ selectedMembers.length }})
          </van-button>
        </div>

        <van-search v-model="memberKeyword" placeholder="搜索会员" @search="loadMembers" />

        <van-checkbox-group v-model="selectedMembers" class="member-check-list">
          <van-cell-group>
            <van-cell
              v-for="member in memberList"
              :key="member.id"
              clickable
              @click="toggleMember(member.user.id)"
            >
              <template #title>
                <div class="member-cell">
                  <van-image
                    round
                    width="32"
                    height="32"
                    :src="member.user?.avatarUrl"
                    fit="cover"
                  />
                  <span>{{ member.user?.nickname || member.user?.phone }}</span>
                  <van-icon
                    v-if="member.user?.gender === 2"
                    name="female"
                    color="#FF4D6A"
                    size="14"
                  />
                  <van-icon
                    v-else-if="member.user?.gender === 1"
                    name="male"
                    color="#1989fa"
                    size="14"
                  />
                </div>
              </template>
              <template #right-icon>
                <van-checkbox :name="member.user.id" @click.stop />
              </template>
            </van-cell>
          </van-cell-group>
        </van-checkbox-group>

        <van-empty v-if="memberList.length === 0 && !memberLoading" description="暂无会员" :image-size="60" />
      </div>
    </van-popup>

    <van-loading v-if="pageLoading" class="page-loading" vertical>加载中...</van-loading>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showSuccessToast, showDialog } from 'vant'
import { salonApi } from '@/api/salon'
import { memberApi } from '@/api/member'
import { formatDate } from '@/utils/format'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const eventId = computed(() => Number(route.params.id))

const pageLoading = ref(true)
const actionLoading = ref(false)
const event = ref(null)
const registrations = ref([])

const isOrganizer = computed(() => event.value?.organizerId === userStore.userInfo?.id)
const isRegistered = computed(() =>
  registrations.value.some(r => r.userId === userStore.userInfo?.id)
)
const participantLimit = computed(() => Number(event.value?.maxParticipants || 0))
const participantCount = computed(() => Number(event.value?.currentParticipants || registrations.value.length || 0))
const remainingSeats = computed(() => participantLimit.value ? Math.max(0, participantLimit.value - participantCount.value) : null)
const executionState = computed(() => {
  if (!event.value) return '加载中'
  if (event.value.status !== 'upcoming') return statusText(event.value.status)
  if (participantLimit.value && remainingSeats.value === 0) return '已满员'
  return isOrganizer.value ? '可邀约' : isRegistered.value ? '已报名' : '可报名'
})
const executionItems = computed(() => [
  {
    label: '报名席位',
    value: participantLimit.value ? `${participantCount.value}/${participantLimit.value}` : `${participantCount.value} 人`,
    hint: participantLimit.value ? `剩余 ${remainingSeats.value} 个席位。` : '当前活动未设置人数上限。'
  },
  {
    label: '组织动作',
    value: isOrganizer.value ? '可邀请' : '参与视角',
    hint: isOrganizer.value ? '可从会员池中邀请合适会员参加。' : '关注报名状态和活动信息即可。'
  },
  {
    label: '费用状态',
    value: Number(event.value?.price || 0) > 0 ? `¥${Number(event.value.price).toFixed(0)}` : '免费',
    hint: Number(event.value?.price || 0) > 0 ? '建议提前确认费用说明与退款口径。' : '免费活动适合做关系暖场和线下破冰。'
  }
])

const showActions = ref(false)
const actionOptions = [
  { name: '取消活动', color: '#ee0a24', value: 'cancel' }
]

// Invite members state
const showInvite = ref(false)
const inviteLoading = ref(false)
const memberLoading = ref(false)
const memberKeyword = ref('')
const memberList = ref([])
const selectedMembers = ref([])

function statusType(s) {
  return { upcoming: 'primary', ongoing: 'success', ended: 'default', cancelled: 'danger' }[s] || 'default'
}
function statusText(s) {
  return { upcoming: '即将开始', ongoing: '进行中', ended: '已结束', cancelled: '已取消' }[s] || s
}

async function loadDetail() {
  pageLoading.value = true
  try {
    const res = await salonApi.getEventDetail(eventId.value)
    event.value = res.data
    registrations.value = res.data?.registrations || []
  } catch {
    showToast('加载失败')
  } finally {
    pageLoading.value = false
  }
}

function goEdit() {
  router.push(`/matchmaker/salon/edit/${eventId.value}`)
}

async function onActionSelect(action) {
  if (action.value === 'cancel') {
    try {
      await showDialog({ title: '确认取消', message: '取消后已报名人员将收到通知，确定取消此活动吗？' })
      await salonApi.cancelEvent(eventId.value)
      showSuccessToast('已取消活动')
      loadDetail()
    } catch (e) {
      if (e !== 'cancel' && e?.message !== 'cancel') {
        showToast(e.response?.data?.message || '操作失败')
      }
    }
  }
}

async function handleRegister() {
  actionLoading.value = true
  try {
    await salonApi.register(eventId.value)
    showSuccessToast('报名成功')
    loadDetail()
  } catch (e) {
    showToast(e.response?.data?.message || '报名失败')
  } finally {
    actionLoading.value = false
  }
}

async function handleCancel() {
  try {
    await showDialog({ title: '提示', message: '确定取消报名吗？' })
    actionLoading.value = true
    await salonApi.cancelRegistration(eventId.value)
    showSuccessToast('已取消报名')
    loadDetail()
  } catch (e) {
    if (e !== 'cancel' && e?.message !== 'cancel') {
      showToast(e.response?.data?.message || '操作失败')
    }
  } finally {
    actionLoading.value = false
  }
}

async function loadMembers() {
  memberLoading.value = true
  try {
    const res = await memberApi.getList({ page: 1, pageSize: 100, keyword: memberKeyword.value })
    memberList.value = res.data?.list || []
  } catch {
    memberList.value = []
  } finally {
    memberLoading.value = false
  }
}

function toggleMember(userId) {
  const idx = selectedMembers.value.indexOf(userId)
  if (idx >= 0) {
    selectedMembers.value.splice(idx, 1)
  } else {
    selectedMembers.value.push(userId)
  }
}

async function handleInvite() {
  if (selectedMembers.value.length === 0) return
  inviteLoading.value = true
  try {
    const res = await salonApi.inviteMembers(eventId.value, selectedMembers.value)
    const data = res.data
    showSuccessToast(`已邀请 ${data.invited} 人`)
    showInvite.value = false
    selectedMembers.value = []
  } catch (e) {
    showToast(e.response?.data?.message || '邀请失败')
  } finally {
    inviteLoading.value = false
  }
}

onMounted(() => {
  loadDetail()
  // Pre-load members for invite popup
  if (userStore.userInfo?.currentRole === 'matchmaker') {
    loadMembers()
  }
})
</script>

<style scoped>
.detail-content {
  padding-bottom: 80px;
}

.info-card {
  padding: 16px;
  background: rgba(255, 255, 255, 0.92);
  margin: 12px 16px;
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 24px;
  box-shadow: var(--ifu-shadow-soft);
}

.info-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.info-card__title {
  font-size: 20px;
  font-weight: 700;
  color: var(--ifu-text-strong);
  flex: 1;
  margin: 0;
  line-height: 1.3;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 14px;
  color: var(--ifu-text);
}

.info-row .price {
  color: var(--ifu-gold-700);
  font-weight: 600;
  font-size: 16px;
}

.salon-execution-card {
  margin: 0 16px 12px;
  padding: 16px;
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: var(--ifu-shadow-soft);
}

.salon-execution-card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.salon-execution-card__head h2 {
  margin-top: 6px;
  color: var(--ifu-text-strong);
  font-size: 22px;
  line-height: 1.3;
}

.salon-execution-card__head strong {
  flex-shrink: 0;
  padding: 8px 11px;
  border-radius: 999px;
  background: rgba(200, 169, 119, 0.16);
  color: var(--ifu-gold-700);
  font-size: 12px;
}

.salon-execution-card__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.salon-execution-card__grid article {
  padding: 13px 12px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 252, 248, 0.94), rgba(249, 241, 230, 0.76));
  border: 1px solid rgba(233, 221, 204, 0.86);
}

.salon-execution-card__grid span {
  display: block;
  color: var(--ifu-text-muted);
  font-size: 11px;
}

.salon-execution-card__grid strong {
  display: block;
  margin-top: 8px;
  color: var(--ifu-text-strong);
  font-size: 16px;
}

.salon-execution-card__grid p {
  margin-top: 6px;
  color: var(--ifu-text-muted);
  font-size: 11px;
  line-height: 1.5;
}

.desc-card {
  margin: 0 16px 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 24px;
  box-shadow: var(--ifu-shadow-soft);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--ifu-text-strong);
  margin-bottom: 10px;
}

.desc-text {
  font-size: 14px;
  color: var(--ifu-text);
  line-height: 1.6;
  white-space: pre-wrap;
}

.member-card {
  margin: 0 16px 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 24px;
  box-shadow: var(--ifu-shadow-soft);
}

.member-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 4px;
  background: rgba(249, 241, 230, 0.72);
  border-radius: 20px;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.member-name {
  font-size: 13px;
  color: var(--ifu-text-strong);
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: rgba(251, 247, 241, 0.94);
  border-top: 1px solid rgba(233, 221, 204, 0.92);
  box-shadow: var(--ifu-shadow-float);
  z-index: 100;
}

.invite-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.invite-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--hl-border-color);
}

@media (max-width: 380px) {
  .salon-execution-card__grid {
    grid-template-columns: 1fr;
  }
}

.invite-title {
  font-size: 16px;
  font-weight: 600;
}

.member-check-list {
  flex: 1;
  overflow-y: auto;
}

.member-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
