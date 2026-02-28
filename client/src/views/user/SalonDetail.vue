<template>
  <div class="page">
    <van-nav-bar title="活动详情" left-arrow @click-left="$router.back()" />

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

      <!-- 描述 -->
      <div v-if="event.description" class="desc-card">
        <div class="section-title">活动介绍</div>
        <div class="desc-text">{{ event.description }}</div>
      </div>

      <!-- 报名人员 -->
      <div class="member-card">
        <div class="section-title">报名人员 ({{ registrations.length }})</div>
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
.detail-content {
  padding-bottom: 80px;
}

.info-card {
  padding: 16px;
  background: var(--hl-card-bg);
  margin: 12px 16px;
  border-radius: var(--hl-radius-md);
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
  color: var(--hl-text-primary);
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
  color: var(--hl-text-primary);
}

.info-row .price {
  color: var(--hl-accent-color);
  font-weight: 600;
  font-size: 16px;
}

.desc-card {
  margin: 0 16px 12px;
  padding: 16px;
  background: var(--hl-card-bg);
  border-radius: var(--hl-radius-md);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--hl-text-primary);
  margin-bottom: 10px;
}

.desc-text {
  font-size: 14px;
  color: var(--hl-text-secondary);
  line-height: 1.6;
  white-space: pre-wrap;
}

.member-card {
  margin: 0 16px 12px;
  padding: 16px;
  background: var(--hl-card-bg);
  border-radius: var(--hl-radius-md);
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
  background: var(--hl-bg-color);
  border-radius: 20px;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.member-name {
  font-size: 13px;
  color: var(--hl-text-primary);
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: var(--hl-card-bg);
  box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.06);
  z-index: 100;
}

.page-loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
