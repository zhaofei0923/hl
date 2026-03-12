<template>
  <div class="page salon-detail-page">
    <van-nav-bar title="活动详情" left-arrow @click-left="$router.back()" />

    <div v-if="event" class="detail-content">
      <section class="salon-detail-hero card" data-testid="salon-detail-hero">
        <div class="salon-detail-hero__banner" :style="heroCoverStyle"></div>
        <div class="salon-detail-hero__body">
          <div class="salon-detail-hero__header">
            <div>
              <span class="brand-label">SALON DETAIL</span>
              <h1>{{ event.title }}</h1>
            </div>
            <span class="salon-detail-hero__badge">{{ statusText(event.status) }}</span>
          </div>
          <p class="salon-detail-hero__desc">{{ salonSummary }}</p>
          <div class="salon-detail-hero__meta">
            <article>
              <span>时间</span>
              <strong>{{ formatDate(event.eventDate, 'YYYY-MM-DD HH:mm') }}</strong>
            </article>
            <article>
              <span>地点</span>
              <strong>{{ event.location || '待定' }}</strong>
            </article>
            <article>
              <span>报名</span>
              <strong>{{ event.currentParticipants || 0 }}{{ event.maxParticipants ? `/${event.maxParticipants}` : '' }}</strong>
            </article>
          </div>
        </div>
      </section>

      <section class="salon-detail-section card">
        <div class="salon-detail-section__title">
          <van-icon name="notes-o" size="16" />
          <h3>活动介绍</h3>
        </div>
        <p class="salon-detail-paragraph">{{ event.description || '这是一个适合轻松交流、降低线下见面压力的活动场景，方便红娘观察互动氛围并给出更自然的后续建议。' }}</p>
      </section>

      <section class="salon-detail-section card" data-testid="salon-detail-flow">
        <div class="salon-detail-section__title">
          <van-icon name="todo-list-o" size="16" />
          <h3>活动流程</h3>
        </div>
        <article v-for="item in salonFlow" :key="item.time" class="flow-item">
          <div class="flow-item__time">{{ item.time }}</div>
          <div>
            <strong>{{ item.title }}</strong>
            <p>{{ item.desc }}</p>
          </div>
        </article>
      </section>

      <section class="salon-detail-section card">
        <div class="salon-detail-section__title">
          <van-icon name="friends-o" size="16" />
          <h3>报名人员 ({{ registrations.length }})</h3>
        </div>
        <div v-if="registrations.length > 0" class="member-list">
          <div v-for="reg in registrations" :key="reg.id" class="member-item">
            <van-image
              round
              width="40"
              height="40"
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
      </section>

      <section class="salon-detail-booking card" data-testid="salon-detail-booking">
        <div>
          <span class="brand-label">BOOKING</span>
          <h3>{{ bookingTitle }}</h3>
          <p>{{ bookingHint }}</p>
        </div>
        <div class="salon-detail-booking__tags">
          <span class="brand-chip">红娘可协助安排</span>
          <span class="brand-chip brand-chip--active">{{ event.price > 0 ? `¥${Number(event.price).toFixed(2)}` : '免费活动' }}</span>
        </div>
      </section>
    </div>

    <div v-if="event && event.status === 'upcoming'" class="bottom-bar">
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
    </div>

    <van-loading v-if="pageLoading" class="page-loading" vertical>加载中...</van-loading>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showSuccessToast, showDialog } from 'vant'
import { salonApi } from '@/api/salon'
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

const isRegistered = computed(() =>
  registrations.value.some(r => r.userId === userStore.userInfo?.id)
)

const salonSummary = computed(() => {
  if (!event.value) return ''
  const location = event.value.location || '城市会客空间'
  return `在 ${location} 进行的轻社交活动，适合把线上沟通过渡到更自然的线下认识，降低第一次见面的压力。`
})

const salonFlow = computed(() => {
  if (!event.value) return []
  return [
    { time: '签到前 20 分钟', title: '入场与分组', desc: '红娘会根据报名资料协助安排更自然的交流座位。' },
    { time: '活动开始', title: '轻话题破冰', desc: '先从低压力的开放话题开始，避免直接进入强社交状态。' },
    { time: '自由交流', title: '继续沟通', desc: '保留足够的一对一聊天时间，方便后续判断是否继续了解。' }
  ]
})

const bookingTitle = computed(() => {
  if (!event.value) return ''
  if (isRegistered.value) return '你已完成报名'
  return event.value.maxParticipants && event.value.currentParticipants >= event.value.maxParticipants
    ? '当前名额已满'
    : '现在适合报名'
})

const bookingHint = computed(() => {
  if (!event.value) return ''
  if (isRegistered.value) return '活动开始前仍可取消报名，建议保留时间并提前和红娘沟通你的参与预期。'
  if (event.value.maxParticipants && event.value.currentParticipants >= event.value.maxParticipants) {
    return '名额已满时建议先联系红娘，确认是否有候补席位或更适合的活动。'
  }
  return '如果你正处于从线上沟通过渡到线下认识的阶段，这类活动通常比直接单独见面更自然。'
})

const heroCoverStyle = computed(() => {
  if (event.value?.coverImage) {
    return {
      backgroundImage: `linear-gradient(180deg, rgba(25, 19, 15, 0.12), rgba(25, 19, 15, 0.28)), url(${event.value.coverImage})`
    }
  }
  return {
    backgroundImage: 'linear-gradient(135deg, #7f6548, #b08b61 68%, #d9bc91)'
  }
})

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

onMounted(() => {
  loadDetail()
})
</script>

<style scoped>
.salon-detail-page {
  padding-bottom: 96px;
}

.detail-content {
  padding-bottom: 12px;
}

.salon-detail-hero {
  overflow: hidden;
  padding: 0;
}

.salon-detail-hero__banner {
  height: 180px;
  background-size: cover;
  background-position: center;
}

.salon-detail-hero__body {
  padding: 18px;
}

.salon-detail-hero__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
}

.salon-detail-hero__header h1 {
  margin-top: 8px;
  font-size: 28px;
  line-height: 1.18;
}

.salon-detail-hero__badge {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(200, 169, 119, 0.16);
  color: var(--ifu-gold-700);
  font-size: 12px;
}

.salon-detail-hero__desc,
.salon-detail-paragraph,
.flow-item p,
.salon-detail-booking p {
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.75;
  color: var(--ifu-text);
}

.salon-detail-hero__meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.salon-detail-hero__meta article {
  padding: 12px;
  border-radius: 18px;
  background: linear-gradient(180deg, #fffaf3, #f8eedf);
}

.salon-detail-hero__meta span {
  display: block;
  color: var(--ifu-text-muted);
  font-size: 12px;
}

.salon-detail-hero__meta strong {
  display: block;
  margin-top: 8px;
  color: var(--ifu-text-strong);
  font-size: 15px;
}

.salon-detail-section {
  margin-top: 12px;
}

.salon-detail-section__title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--ifu-gold-700);
}

.salon-detail-section__title h3,
.salon-detail-booking h3 {
  margin: 0;
  font-size: 18px;
  color: var(--ifu-text-strong);
}

.flow-item {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(233, 221, 204, 0.72);
}

.flow-item:first-of-type {
  margin-top: 14px;
}

.flow-item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.flow-item__time {
  color: var(--ifu-gold-700);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 15px;
}

.flow-item strong {
  display: block;
  font-size: 16px;
  color: var(--ifu-text-strong);
}

.member-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 14px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px 6px;
  background: linear-gradient(180deg, #fffaf3, #f8eedf);
  border-radius: 999px;
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

.salon-detail-booking {
  margin-top: 12px;
  background: linear-gradient(180deg, #fffaf3, #f7eddc);
}

.salon-detail-booking__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.bottom-bar {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: calc(10px + env(safe-area-inset-bottom));
  padding: 10px;
  border-radius: 24px;
  border: 1px solid rgba(233, 221, 204, 0.96);
  background: rgba(251, 247, 241, 0.94);
  box-shadow: var(--ifu-shadow-float);
  backdrop-filter: blur(18px);
  z-index: 100;
}

.page-loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
