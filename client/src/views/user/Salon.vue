<template>
  <div class="page">
    <van-nav-bar title="沙龙活动" left-arrow @click-left="$router.back()" />

    <van-tabs v-model:active="activeTab" @change="onTabChange" sticky>
      <van-tab title="全部活动" name="all" />
      <van-tab title="我的报名" name="mine" />
    </van-tabs>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadData"
      >
        <div
          v-for="item in list"
          :key="item.id"
          class="event-card"
          @click="goDetail(item.id || item.eventId)"
        >
          <div class="event-card__body">
            <div class="event-card__header">
              <span class="event-card__title">{{ getEvent(item).title }}</span>
              <van-tag :type="statusType(getEvent(item).status)" round>
                {{ statusText(getEvent(item).status) }}
              </van-tag>
            </div>
            <div class="event-card__info">
              <van-icon name="clock-o" size="14" />
              <span>{{ formatDate(getEvent(item).eventDate, 'YYYY-MM-DD HH:mm') }}</span>
            </div>
            <div class="event-card__info">
              <van-icon name="location-o" size="14" />
              <span>{{ getEvent(item).location || '待定' }}</span>
            </div>
            <div class="event-card__footer">
              <span class="event-card__participants">
                <van-icon name="friends-o" size="14" />
                {{ getEvent(item).currentParticipants || 0 }}{{ getEvent(item).maxParticipants ? `/${getEvent(item).maxParticipants}` : '' }} 人
              </span>
              <span v-if="getEvent(item).price > 0" class="event-card__price">
                ¥{{ Number(getEvent(item).price).toFixed(2) }}
              </span>
              <span v-else class="event-card__free">免费</span>
            </div>
          </div>
        </div>

        <van-empty
          v-if="!loading && list.length === 0"
          :description="activeTab === 'all' ? '暂无活动' : '暂无报名'"
          image="search"
        />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { salonApi } from '@/api/salon'
import { formatDate } from '@/utils/format'

const router = useRouter()

const activeTab = ref('all')
const list = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = 10

function statusType(s) {
  return { upcoming: 'primary', ongoing: 'success', ended: 'default', cancelled: 'danger' }[s] || 'default'
}
function statusText(s) {
  return { upcoming: '即将开始', ongoing: '进行中', ended: '已结束', cancelled: '已取消' }[s] || s
}

function getEvent(item) {
  // For "my registrations", the event data is nested under item.event
  return item.event || item
}

function onTabChange() {
  list.value = []
  page.value = 1
  finished.value = false
  loadData()
}

function onRefresh() {
  list.value = []
  page.value = 1
  finished.value = false
  loadData()
}

async function loadData() {
  loading.value = true
  try {
    const params = { page: page.value, pageSize }
    let res
    if (activeTab.value === 'all') {
      res = await salonApi.getEvents(params)
    } else {
      res = await salonApi.getMyRegistrations(params)
    }
    const rows = res.data?.list || res.data?.rows || []
    if (page.value === 1) {
      list.value = rows
    } else {
      list.value.push(...rows)
    }
    if (rows.length < pageSize) {
      finished.value = true
    } else {
      page.value++
    }
  } catch {
    finished.value = true
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function goDetail(id) {
  router.push(`/user/salon/${id}`)
}
</script>

<style scoped>
.event-card {
  margin: 12px 16px;
  background: var(--hl-card-bg);
  border-radius: var(--hl-radius-md);
  overflow: hidden;
  box-shadow: var(--hl-shadow-sm);
}

.event-card__body {
  padding: 12px;
}

.event-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.event-card__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--hl-text-primary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-card__info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--hl-text-secondary);
  margin-bottom: 4px;
}

.event-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.event-card__participants {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--hl-text-secondary);
}

.event-card__price {
  font-size: 16px;
  font-weight: 700;
  color: var(--hl-accent-color);
}

.event-card__free {
  font-size: 14px;
  font-weight: 600;
  color: #67c23a;
}
</style>
