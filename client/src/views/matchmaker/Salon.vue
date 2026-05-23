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

    <section class="salon-ops-card" data-testid="matchmaker-salon-ops">
      <div class="salon-ops-card__head">
        <div>
          <span class="brand-label">SALON OPS</span>
          <h2>{{ activeTab === 'registered' ? '报名跟进视角' : '活动运营视角' }}</h2>
        </div>
        <strong>{{ currentList.length }} 项</strong>
      </div>
      <div class="salon-ops-card__grid">
        <article v-for="item in salonInsightItems" :key="item.label">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p>{{ item.hint }}</p>
        </article>
      </div>
    </section>

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
const upcomingCount = computed(() => currentList.value.filter(item => (item.event?.status || item.status) === 'upcoming').length)
const activeParticipantCount = computed(() => currentList.value.reduce((sum, item) => {
  const event = item.event || item
  return sum + Number(event.currentParticipants || 0)
}, 0))
const salonInsightItems = computed(() => [
  {
    label: activeTab.value === 'registered' ? '待参加' : '可运营活动',
    value: `${upcomingCount.value} 场`,
    hint: upcomingCount.value ? '优先确认时间、地点和参会提醒。' : '当前没有可推进的即将开始活动。'
  },
  {
    label: '报名热度',
    value: `${activeParticipantCount.value} 人`,
    hint: activeParticipantCount.value ? '可结合名单做邀约和二次触达。' : '先补活动亮点或主动邀请会员。'
  },
  {
    label: '当前视图',
    value: activeTab.value === 'all' ? '全部' : activeTab.value === 'mine' ? '我创建' : '我报名',
    hint: activeTab.value === 'mine' ? '重点关注自己负责活动的执行状态。' : '切换标签可分开看运营和报名。'
  }
])

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

.salon-ops-card {
  margin: 12px 16px 0;
  padding: 16px;
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: var(--ifu-shadow-soft);
}

.salon-ops-card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.salon-ops-card__head h2 {
  margin-top: 6px;
  color: var(--ifu-text-strong);
  font-size: 22px;
  line-height: 1.3;
}

.salon-ops-card__head strong {
  flex-shrink: 0;
  padding: 8px 11px;
  border-radius: 999px;
  background: rgba(200, 169, 119, 0.16);
  color: var(--ifu-gold-700);
  font-size: 12px;
}

.salon-ops-card__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.salon-ops-card__grid article {
  padding: 13px 12px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 252, 248, 0.94), rgba(249, 241, 230, 0.76));
  border: 1px solid rgba(233, 221, 204, 0.86);
}

.salon-ops-card__grid span {
  display: block;
  color: var(--ifu-text-muted);
  font-size: 11px;
}

.salon-ops-card__grid strong {
  display: block;
  margin-top: 8px;
  color: var(--ifu-text-strong);
  font-size: 16px;
}

.salon-ops-card__grid p {
  margin-top: 6px;
  color: var(--ifu-text-muted);
  font-size: 11px;
  line-height: 1.5;
}

.event-card {
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--ifu-shadow-soft);
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
  color: var(--ifu-text-strong);
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
  color: var(--ifu-text-muted);
}

.event-card__meta-item .price {
  color: var(--ifu-gold-700);
  font-weight: 600;
}

@media (max-width: 380px) {
  .salon-ops-card__grid {
    grid-template-columns: 1fr;
  }
}
</style>
