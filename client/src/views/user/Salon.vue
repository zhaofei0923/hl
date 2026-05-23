<template>
  <div class="page salon-page">
    <van-nav-bar title="沙龙活动" left-arrow @click-left="$router.back()" />

    <section class="salon-hero card" data-testid="salon-hero">
      <span class="brand-label">EVENT CURATION</span>
      <h1>把线下活动做成更适合关系推进的场景</h1>
      <p>优先推荐与你当前资料完整度和沟通阶段更匹配的活动，不只是展示时间地点，而是先给你一个更自然的认识场域。</p>
      <div class="salon-hero__chips">
        <span class="brand-chip brand-chip--active">严选氛围</span>
        <span class="brand-chip">红娘协助</span>
        <span class="brand-chip">低压社交</span>
      </div>
    </section>

    <section class="salon-decision card" data-testid="salon-decision-guide">
      <div class="salon-decision__head">
        <span class="brand-label">BOOKING DECISION</span>
        <strong>报名之前先看三件事</strong>
      </div>
      <div class="salon-decision__grid">
        <article v-for="item in salonPromises" :key="item.title">
          <span>{{ item.kicker }}</span>
          <strong>{{ item.title }}</strong>
          <p>{{ item.desc }}</p>
        </article>
      </div>
    </section>

    <div class="salon-tabs-wrap" data-testid="salon-filter-tabs">
      <van-tabs v-model:active="activeTab" @change="onTabChange" sticky>
        <van-tab title="全部活动" name="all" />
        <van-tab title="我的报名" name="mine" />
      </van-tabs>
    </div>

    <section class="salon-list-shell" data-testid="salon-list-shell">
      <div class="salon-list-shell__head">
        <div>
          <span class="brand-label">{{ activeTab === 'all' ? 'ALL EVENTS' : 'MY REGISTRATIONS' }}</span>
          <h2>{{ activeTab === 'all' ? '本周精选活动' : '我的报名安排' }}</h2>
        </div>
        <span class="salon-list-shell__hint">{{ activeTab === 'all' ? '按适配度优先展示' : '按时间顺序查看' }}</span>
      </div>

      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="loadData"
        >
          <div
            v-for="(item, index) in list"
            :key="item.id || item.eventId"
            class="event-card"
            @click="goDetail(item.id || item.eventId)"
          >
            <div class="event-card__cover" :style="coverStyle(index)"></div>
            <div class="event-card__body">
              <div class="event-card__header">
                <div>
                  <span class="brand-label">SALON</span>
                  <strong class="event-card__title">{{ getEvent(item).title }}</strong>
                </div>
                <span class="event-card__badge">{{ statusText(getEvent(item).status) }}</span>
              </div>
              <p class="event-card__desc">{{ eventDescription(getEvent(item)) }}</p>
              <div class="event-card__insights">
                <span>适合慢热型初识</span>
                <span>红娘现场协调</span>
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
    </section>
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

const salonPromises = [
  { kicker: 'FIT', title: '是否适合你', desc: '先看氛围、人群和沟通压力。' },
  { kicker: 'FLOW', title: '活动怎么推进', desc: '优先选择有破冰和自由交流的场次。' },
  { kicker: 'SEATS', title: '席位是否紧张', desc: '人数接近上限时优先咨询红娘。' }
]

function statusText(s) {
  return { upcoming: '即将开始', ongoing: '进行中', ended: '已结束', cancelled: '已取消' }[s] || s || '待定'
}

function getEvent(item) {
  return item.event || item
}

function eventDescription(event) {
  const location = event.location || '城市会客空间'
  return `在 ${location} 进行的轻社交活动，适合从轻松话题开始，降低第一次线下见面的压力。`
}

function coverStyle(index) {
  const themes = [
    'linear-gradient(135deg, #7f6548, #b08b61 68%, #d9bc91)',
    'linear-gradient(135deg, #84603c, #c19a63 62%, #ead7b7)',
    'linear-gradient(135deg, #6e5a45, #a98c6e 64%, #dbc6a6)'
  ]
  return { background: themes[index % themes.length] }
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
    const res = activeTab.value === 'all'
      ? await salonApi.getEvents(params)
      : await salonApi.getMyRegistrations(params)

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
.salon-page {
  padding-bottom: 32px;
}

.salon-hero {
  margin-top: 8px;
  overflow: hidden;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.94), rgba(255, 248, 239, 0.92));
}

.salon-hero::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 148px;
  background: linear-gradient(135deg, rgba(142, 105, 65, 0.96), rgba(188, 150, 98, 0.82));
  border-radius: inherit;
}

.salon-hero > * {
  position: relative;
  z-index: 1;
}

.salon-hero h1 {
  margin-top: 12px;
  font-size: 28px;
  line-height: 1.2;
  color: #fffaf4;
  max-width: 280px;
}

.salon-hero p {
  margin-top: 16px;
  font-size: 14px;
  line-height: 1.75;
  color: var(--ifu-text);
}

.salon-hero .brand-label {
  color: rgba(255, 250, 244, 0.8);
}

.salon-hero__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.salon-decision {
  margin-top: 12px;
}

.salon-decision__head {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.salon-decision__head strong {
  font-size: 21px;
  color: var(--ifu-text-strong);
}

.salon-decision__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.salon-decision__grid article {
  padding: 13px 12px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255, 252, 248, 0.94), rgba(249, 241, 230, 0.76));
  border: 1px solid rgba(233, 221, 204, 0.86);
}

.salon-decision__grid span {
  display: block;
  color: var(--ifu-gold-700);
  font-size: 10px;
  letter-spacing: 0.08em;
}

.salon-decision__grid strong {
  display: block;
  margin-top: 6px;
  font-size: 13px;
  color: var(--ifu-text-strong);
}

.salon-decision__grid p {
  margin-top: 6px;
  font-size: 11px;
  line-height: 1.55;
  color: var(--ifu-text-muted);
}

.salon-tabs-wrap {
  margin: 14px 16px 0;
}

.salon-tabs-wrap :deep(.van-tabs) {
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(233, 221, 204, 0.84);
  box-shadow: var(--ifu-shadow-soft);
  overflow: hidden;
}

.salon-list-shell {
  margin: 14px 16px 0;
  padding: 18px;
  border-radius: 28px;
  border: 1px solid rgba(233, 221, 204, 0.92);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: var(--ifu-shadow-soft);
}

.salon-list-shell__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: end;
  margin-bottom: 12px;
}

.salon-list-shell__head h2 {
  margin-top: 8px;
  font-size: 24px;
}

.salon-list-shell__hint {
  color: var(--ifu-text-muted);
  font-size: 12px;
}

.event-card {
  margin-top: 14px;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(233, 221, 204, 0.92);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: var(--ifu-shadow-soft);
}

.event-card__cover {
  height: 122px;
}

.event-card__body {
  padding: 16px;
}

.event-card__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
}

.event-card__title {
  display: block;
  margin-top: 8px;
  font-size: 20px;
  line-height: 1.25;
  color: var(--ifu-text-strong);
}

.event-card__badge {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(200, 169, 119, 0.16);
  color: var(--ifu-gold-700);
  font-size: 12px;
  white-space: nowrap;
}

.event-card__desc {
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.75;
  color: var(--ifu-text);
}

.event-card__insights {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.event-card__insights span {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(126, 154, 120, 0.13);
  color: var(--ifu-success);
  font-size: 11px;
}

.event-card__info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  font-size: 13px;
  color: var(--ifu-text);
}

.event-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
}

.event-card__participants {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--ifu-text);
}

.event-card__price {
  font-size: 18px;
  font-weight: 700;
  color: var(--ifu-gold-700);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
}

.event-card__free {
  font-size: 14px;
  font-weight: 600;
  color: var(--ifu-success);
}

@media (max-width: 380px) {
  .salon-decision__grid {
    grid-template-columns: 1fr;
  }
}
</style>
