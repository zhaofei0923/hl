<template>
  <div class="page utility-page">
    <van-nav-bar title="我的钱包" left-arrow :border="false" @click-left="$router.back()" />

    <section class="card utility-hero" data-testid="matchmaker-wallet-shell">
      <div class="utility-hero__top">
        <div>
          <span class="brand-label">WALLET</span>
          <h1>把收益、提现和转入记录拉回同一个结算视图</h1>
          <p>先看余额和月份，再决定切到收益、提现还是转入记录做具体核对。</p>
        </div>
        <span class="brand-chip brand-chip--active">{{ currentMonth }}</span>
      </div>
      <div class="utility-hero__stats">
        <article class="utility-hero__stat">
          <span>可用余额</span>
          <strong>¥{{ formatMoney(walletStore.availableAmount) }}</strong>
          <small>可继续提现吗</small>
        </article>
        <article class="utility-hero__stat">
          <span>囍币</span>
          <strong>{{ walletStore.xiCoins || 0 }}</strong>
          <small>当前资产补充项</small>
        </article>
        <article class="utility-hero__stat">
          <span>记录数</span>
          <strong>{{ recordList.length }}</strong>
          <small>{{ activeTab === 'earnings' ? '收益' : activeTab === 'withdrawals' ? '提现' : '转入' }}</small>
        </article>
      </div>
    </section>

    <WalletCard
      :amount="walletStore.availableAmount"
      :coins="walletStore.xiCoins"
      @withdraw="$router.push('/matchmaker/withdraw')"
    />

    <van-tabs v-model:active="activeTab" @change="handleTabChange">
      <van-tab title="收益记录" name="earnings" />
      <van-tab title="提现记录" name="withdrawals" />
      <van-tab title="转入记录" name="transfers" />
    </van-tabs>

    <div class="wallet-filter">
      <div class="wallet-filter__left" @click="showTypePicker = true">
        <span>{{ currentFilterLabel }}</span>
        <van-icon name="arrow-down" size="12" />
      </div>
      <div class="wallet-filter__right" @click="showDatePicker = true">
        <van-icon name="calendar-o" size="16" />
        <span>{{ currentMonth }}</span>
      </div>
    </div>

    <van-list
      v-model:loading="listLoading"
      :finished="finished"
      finished-text="没有更多了"
      @load="loadMore"
    >
      <!-- 收益记录 -->
      <template v-if="activeTab === 'earnings'">
        <div v-for="item in recordList" :key="item.id" class="record-item">
          <div class="record-item__left">
            <div class="record-item__title">{{ item.typeName || '收益' }}</div>
            <div class="record-item__time">{{ formatDate(item.createdAt, 'MM-DD HH:mm') }}</div>
          </div>
          <div class="record-item__amount record-item__amount--plus">
            +{{ formatMoney(item.amount) }}
          </div>
        </div>
      </template>

      <!-- 提现记录 -->
      <template v-if="activeTab === 'withdrawals'">
        <div v-for="item in recordList" :key="item.id" class="record-item">
          <div class="record-item__left">
            <div class="record-item__title">提现至{{ item.channel || '银行卡' }}</div>
            <div class="record-item__time">{{ formatDate(item.createdAt, 'MM-DD HH:mm') }}</div>
          </div>
          <div class="record-item__right">
            <div class="record-item__amount record-item__amount--minus">
              -{{ formatMoney(item.amount) }}
            </div>
            <van-tag
              :type="getWithdrawStatusType(item.status)"
              size="medium"
              round
            >
              {{ getWithdrawStatusText(item.status) }}
            </van-tag>
          </div>
        </div>
      </template>

      <!-- 转入记录 -->
      <template v-if="activeTab === 'transfers'">
        <div v-for="item in recordList" :key="item.id" class="record-item">
          <div class="record-item__left">
            <div class="record-item__title">{{ item.description || '转入' }}</div>
            <div class="record-item__time">{{ formatDate(item.createdAt, 'MM-DD HH:mm') }}</div>
          </div>
          <div class="record-item__amount record-item__amount--plus">
            +{{ formatMoney(item.amount) }}
          </div>
        </div>
      </template>

      <EmptyState v-if="!listLoading && recordList.length === 0" text="暂无记录" />
    </van-list>

    <!-- 类型筛选弹出 -->
    <van-popup v-model:show="showTypePicker" position="bottom" round>
      <van-picker
        :columns="typeColumns"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
      />
    </van-popup>

    <!-- 月份选择弹出 -->
    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-date-picker
        v-model="selectedDate"
        type="year-month"
        title="选择月份"
        :min-date="minDate"
        :max-date="maxDate"
        :columns-type="['year', 'month']"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWalletStore } from '@/stores/wallet'
import { walletApi } from '@/api/wallet'
import { formatMoney, formatDate, formatYearMonth } from '@/utils/format'
import { WITHDRAW_STATUS, WITHDRAW_STATUS_TEXT, EARNING_TYPE_TEXT } from '@/utils/constants'
import WalletCard from '@/components/matchmaker/WalletCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const walletStore = useWalletStore()

const activeTab = ref('earnings')
const listLoading = ref(false)
const finished = ref(false)
const page = ref(1)
const recordList = ref([])

const showTypePicker = ref(false)
const showDatePicker = ref(false)
const filterType = ref('all')
const currentMonth = ref(formatYearMonth())

const now = new Date()
const selectedDate = ref([String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, '0')])
const minDate = new Date(2024, 0, 1)
const maxDate = new Date()

const typeColumns = computed(() => {
  if (activeTab.value === 'earnings') {
    return [
      { text: '全部类型', value: 'all' },
      { text: '分享收益', value: 'share_earning' },
      { text: '婚介收益', value: 'match_earning' },
      { text: '团队收益', value: 'team_earning' },
      { text: '终身收益', value: 'lifetime_earning' },
      { text: '囍币收益', value: 'xi_coin_earning' }
    ]
  }
  return [{ text: '全部类型', value: 'all' }]
})

const currentFilterLabel = computed(() => {
  if (filterType.value === 'all') return '全部类型'
  return EARNING_TYPE_TEXT[filterType.value] || '全部类型'
})

function getWithdrawStatusType(status) {
  const map = {
    [WITHDRAW_STATUS.PENDING]: 'warning',
    [WITHDRAW_STATUS.PROCESSING]: 'primary',
    [WITHDRAW_STATUS.SUCCESS]: 'success',
    [WITHDRAW_STATUS.FAILED]: 'danger',
    [WITHDRAW_STATUS.REJECTED]: 'danger'
  }
  return map[status] || 'default'
}

function getWithdrawStatusText(status) {
  return WITHDRAW_STATUS_TEXT[status] || status
}

async function fetchRecords(isRefresh = false) {
  if (isRefresh) {
    page.value = 1
    finished.value = false
  }

  const params = {
    page: page.value,
    pageSize: 20,
    month: currentMonth.value,
    type: filterType.value === 'all' ? undefined : filterType.value
  }

  try {
    let res
    if (activeTab.value === 'earnings') {
      res = await walletApi.getEarnings(params)
    } else if (activeTab.value === 'withdrawals') {
      res = await walletApi.getWithdrawals(params)
    } else {
      res = await walletApi.getTransfers(params)
    }

    const list = res.data?.list || []
    if (isRefresh) {
      recordList.value = list
    } else {
      recordList.value.push(...list)
    }

    if (list.length < 20) {
      finished.value = true
    } else {
      page.value++
    }
  } catch (err) {
    finished.value = true
  } finally {
    listLoading.value = false
  }
}

function loadMore() {
  fetchRecords()
}

function handleTabChange() {
  recordList.value = []
  filterType.value = 'all'
  fetchRecords(true)
}

function onTypeConfirm({ selectedOptions }) {
  filterType.value = selectedOptions[0]?.value || 'all'
  showTypePicker.value = false
  recordList.value = []
  fetchRecords(true)
}

function onDateConfirm({ selectedValues }) {
  currentMonth.value = `${selectedValues[0]}-${selectedValues[1]}`
  selectedDate.value = selectedValues
  showDatePicker.value = false
  recordList.value = []
  fetchRecords(true)
}

onMounted(() => {
  walletStore.fetchWalletInfo().catch(() => {})
})
</script>

<style scoped>
.wallet-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--hl-card-bg);
  border-bottom: 1px solid var(--hl-border-color);
}

.wallet-filter__left,
.wallet-filter__right {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--hl-text-secondary);
  cursor: pointer;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: var(--hl-card-bg);
  border-bottom: 1px solid var(--hl-border-color);
}

.record-item__left {
  flex: 1;
  min-width: 0;
}

.record-item__title {
  font-size: 14px;
  color: var(--hl-text-primary);
  margin-bottom: 4px;
}

.record-item__time {
  font-size: 12px;
  color: var(--hl-text-placeholder);
}

.record-item__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.record-item__amount {
  font-size: 16px;
  font-weight: 600;
}

.record-item__amount--plus {
  color: #E84D5F;
}

.record-item__amount--minus {
  color: var(--hl-text-primary);
}
</style>
