<template>
  <div class="page">
    <!-- 导航栏 -->
    <van-nav-bar title="沙龙活动" left-arrow @click-left="$router.back()">
      <template #right>
        <van-icon name="plus" size="20" @click="$router.push('/matchmaker/salon/create')" />
      </template>
    </van-nav-bar>

    <!-- Tab 切换 -->
    <van-tabs v-model:active="activeTab" sticky @change="onTabChange">
      <van-tab title="全部活动" name="all" />
      <van-tab title="我的活动" name="mine" />
      <van-tab title="我的报名" name="registered" />
    </van-tabs>

    <!-- 活动列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadMore"
      >
        <!-- 全部活动 / 我的活动 -->
        <template v-if="activeTab !== 'registered'">
          <div class="salon-list">
            <div
              v-for="item in eventList"
              :key="item.id"
              class="event-card"
              @click="goDetail(item.id)"
            >
              <div class="event-card__body">
                <div class="event-card__title-row">
                  <span class="event-card__title">{{ item.title }}</span>
                  <van-tag round size="medium" :type="statusType(item.status)">
                    {{ statusText(item.status) }}
                  </van-tag>
                </div>
                <div class="event-card__meta">
                  <div class="event-card__meta-item">
                    <van-icon name="clock-o" size="14" />
                    <span>{{ formatDate(item.eventDate, 'MM-DD HH:mm') }}</span>
                  </div>
                  <div class="event-card__meta-item">
                    <van-icon name="location-o" size="14" />
                    <span>{{ item.location || '待定' }}</span>
                  </div>
                  <div class="event-card__meta-item">
                    <van-icon name="friends-o" size="14" />
                    <span>{{ item.currentParticipants || 0 }}{{ item.maxParticipants ? `/${item.maxParticipants}` : '' }}人报名</span>
                  </div>
                  <div v-if="item.price > 0" class="event-card__meta-item">
                    <van-icon name="gold-coin-o" size="14" />
                    <span class="price">¥{{ Number(item.price).toFixed(0) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- 我的报名 -->
        <template v-else>
          <div class="salon-list">
            <div
              v-for="reg in registrationList"
              :key="reg.id"
              class="event-card"
              @click="goDetail(reg.event?.id || reg.eventId)"
            >
              <div class="event-card__body">
                <div class="event-card__title-row">
                  <span class="event-card__title">{{ reg.event?.title || '-' }}</span>
                  <van-tag round size="medium" :type="statusType(reg.event?.status)">
                    {{ statusText(reg.event?.status) }}
                  </van-tag>
                </div>
                <div class="event-card__meta">
                  <div class="event-card__meta-item">
                    <van-icon name="clock-o" size="14" />
                    <span>{{ formatDate(reg.event?.eventDate, 'MM-DD HH:mm') }}</span>
                  </div>
                  <div class="event-card__meta-item">
                    <van-icon name="location-o" size="14" />
                    <span>{{ reg.event?.location || '待定' }}</span>
                  </div>
                  <div class="event-card__meta-item">
                    <van-icon name="checked" size="14" color="var(--hl-primary-color)" />
                    <span>报名状态: {{ reg.status === 'registered' ? '已报名' : reg.status }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </van-list>

      <EmptyState v-if="!loading && !refreshing && currentList.length === 0" text="暂无活动" />
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { salonApi } from '@/api/salon'
import { formatDate } from '@/utils/format'
import EmptyState from '@/components/common/EmptyState.vue'

const router = useRouter()
const activeTab = ref('all')
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const eventList = ref([])
const registrationList = ref([])

const currentList = computed(() => activeTab.value === 'registered' ? registrationList.value : eventList.value)

function statusType(s) {
  return { upcoming: 'primary', ongoing: 'success', ended: 'default', cancelled: 'danger' }[s] || 'default'
}
function statusText(s) {
  return { upcoming: '即将开始', ongoing: '进行中', ended: '已结束', cancelled: '已取消' }[s] || s || ''
}

function goDetail(id) {
  if (id) router.push(`/matchmaker/salon/${id}`)
}

async function loadData(reset = false) {
  if (reset) {
    page.value = 1
    finished.value = false
    if (activeTab.value === 'registered') {
      registrationList.value = []
    } else {
      eventList.value = []
    }
  }

  loading.value = true
  try {
    let res
    if (activeTab.value === 'all') {
      res = await salonApi.getEvents({ page: page.value, pageSize: 10 })
    } else if (activeTab.value === 'mine') {
      res = await salonApi.getMyEvents({ page: page.value, pageSize: 10 })
    } else {
      res = await salonApi.getMyRegistrations({ page: page.value, pageSize: 10 })
    }

    const list = res.data?.list || []
    if (activeTab.value === 'registered') {
      registrationList.value = reset ? list : [...registrationList.value, ...list]
    } else {
      eventList.value = reset ? list : [...eventList.value, ...list]
    }

    if (list.length < 10) {
      finished.value = true
    } else {
      page.value++
    }
  } catch (e) {
    finished.value = true
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function loadMore() {
  loadData(false)
}

function onRefresh() {
  loadData(true)
}

function onTabChange() {
  loadData(true)
}

onMounted(() => {
  loadData(true)
})
</script>

<style scoped>
.salon-list {
  padding: 12px 16px;
}

.event-card {
  margin-bottom: 16px;
  background: var(--hl-card-bg);
  border-radius: var(--hl-radius-md);
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.event-card__cover-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 160px;
  background: var(--hl-bg-color);
}

.event-card__body {
  padding: 12px 14px 14px;
}

.event-card__title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 10px;
}

.event-card__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--hl-text-primary);
  flex: 1;
  line-height: 1.3;
}

.event-card__meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.event-card__meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--hl-text-secondary);
}

.event-card__meta-item .price {
  color: var(--hl-accent-color);
  font-weight: 600;
}
</style>
