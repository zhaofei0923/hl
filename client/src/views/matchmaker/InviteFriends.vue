<template>
  <div class="page utility-page">
    <van-nav-bar title="邀请好友" left-arrow :border="false" @click-left="$router.back()" />

    <section class="card utility-hero" data-testid="matchmaker-invite-shell">
      <div class="utility-hero__top">
        <div>
          <span class="brand-label">INVITE NETWORK</span>
          <h1>把邀请页做成持续扩展合作网络的入口</h1>
          <p>邀请码、奖励规则和邀请记录应该放在同一阅读路径里，减少从分享到账励确认之间的断层。</p>
        </div>
        <span class="brand-chip brand-chip--active">{{ inviteCode || '邀请码生成中' }}</span>
      </div>
      <div class="utility-hero__chips">
        <span class="brand-chip">{{ recordList.length }} 条邀请记录</span>
        <span class="brand-chip">复制即分享</span>
        <span class="brand-chip">首单奖励</span>
      </div>
    </section>

    <section class="invite-funnel-card" data-testid="matchmaker-invite-funnel">
      <div class="invite-funnel-card__head">
        <div>
          <span class="brand-label">INVITE FUNNEL</span>
          <h2>邀请转化判断</h2>
        </div>
        <strong>{{ inviteCode ? '可分享' : '生成中' }}</strong>
      </div>
      <div class="invite-funnel-card__grid">
        <article v-for="item in inviteFunnelItems" :key="item.label">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p>{{ item.hint }}</p>
        </article>
      </div>
    </section>

    <div class="invite-banner">
      <div class="invite-banner__icon">
        <van-icon name="friends-o" size="48" color="#fff" />
      </div>
      <div class="invite-banner__title">邀请好友，一起赚</div>
      <div class="invite-banner__desc">
        每邀请一位好友注册成为婚介，您将获得丰厚奖励
      </div>
    </div>

    <div class="invite-code-card">
      <div class="invite-code-card__label">我的邀请码</div>
      <div class="invite-code-card__code-row">
        <span class="invite-code-card__code">{{ inviteCode || '获取中...' }}</span>
        <van-button
          size="small"
          round
          color="var(--hl-primary-color)"
          :disabled="!inviteCode"
          @click="handleCopy"
        >
          复制邀请码
        </van-button>
      </div>
      <div class="invite-code-card__actions">
        <van-button
          block
          round
          type="primary"
          color="var(--hl-primary-color)"
          icon="share-o"
          @click="handleShare"
        >
          立即邀请好友
        </van-button>
      </div>
    </div>

    <div class="rules-card">
      <div class="rules-card__title">
        <van-icon name="info-o" size="16" color="var(--hl-primary-color)" />
        <span>邀请规则</span>
      </div>
      <div class="rules-card__content">
        <div class="rule-item">
          <span class="rule-item__num">1</span>
          <span class="rule-item__text">分享您的专属邀请码给好友</span>
        </div>
        <div class="rule-item">
          <span class="rule-item__num">2</span>
          <span class="rule-item__text">好友使用邀请码注册成为婚介</span>
        </div>
        <div class="rule-item">
          <span class="rule-item__num">3</span>
          <span class="rule-item__text">好友完成首单后，您即获得奖励</span>
        </div>
        <div class="rule-item">
          <span class="rule-item__num">4</span>
          <span class="rule-item__text">邀请人数不设上限，邀请越多奖励越多</span>
        </div>
      </div>
    </div>

    <div class="section-title">
      <span>邀请记录</span>
      <span class="section-title__count">共{{ recordList.length }}人</span>
    </div>

    <van-list
      v-model:loading="listLoading"
      :finished="finished"
      finished-text="没有更多了"
      @load="loadMore"
    >
      <div
        v-for="item in recordList"
        :key="item.id"
        class="record-row"
      >
        <van-image
          round
          width="40"
          height="40"
          :src="item.avatarUrl || defaultAvatar"
          fit="cover"
        />
        <div class="record-row__info">
          <div class="record-row__name">{{ item.name || '用户' }}</div>
          <div class="record-row__date">{{ formatDate(item.createdAt, 'YYYY-MM-DD HH:mm') }}</div>
        </div>
        <van-tag
          round
          size="medium"
          :type="item.status === 'completed' ? 'success' : 'warning'"
        >
          {{ item.status === 'completed' ? '已完成' : '待激活' }}
        </van-tag>
      </div>

      <EmptyState v-if="!listLoading && recordList.length === 0" text="暂无邀请记录" />
    </van-list>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { showToast } from 'vant'
import { matchmakerApi } from '@/api/matchmaker'
import { formatDate } from '@/utils/format'
import EmptyState from '@/components/common/EmptyState.vue'

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iI0UwRTBFMCIvPjxwYXRoIGQ9Ik0zMiAyMGE4IDggMCAxIDAgMCAxNiA4IDggMCAwIDAgMC0xNnptMCAyMGMtOC44NCAwLTE2IDMuNTgtMTYgOHYyaDMydi0yYzAtNC40Mi03LjE2LTgtMTYtOHoiIGZpbGw9IiNBMEEwQTAiLz48L3N2Zz4='

const inviteCode = ref('')
const listLoading = ref(false)
const finished = ref(false)
const page = ref(1)
const recordList = ref([])
const completedInviteCount = computed(() => recordList.value.filter(item => item.status === 'completed').length)
const pendingInviteCount = computed(() => Math.max(0, recordList.value.length - completedInviteCount.value))
const inviteFunnelItems = computed(() => [
  {
    label: '已完成',
    value: `${completedInviteCount.value} 人`,
    hint: completedInviteCount.value ? '可继续跟进首单后的长期合作。' : '先用邀请码建立首批合作线索。'
  },
  {
    label: '待激活',
    value: `${pendingInviteCount.value} 人`,
    hint: pendingInviteCount.value ? '适合补一次注册或首单提醒。' : '暂无待激活邀请。'
  },
  {
    label: '分享状态',
    value: inviteCode.value || '待生成',
    hint: inviteCode.value ? '复制后可直接发送给潜在合作伙伴。' : '邀请码生成后再分享。'
  }
])

async function fetchInviteCode() {
  try {
    const res = await matchmakerApi.getInviteCode()
    inviteCode.value = res.data?.code || ''
  } catch (err) {
    // handled by interceptor
  }
}

async function fetchRecords(isRefresh = false) {
  if (isRefresh) {
    page.value = 1
    finished.value = false
  }

  try {
    const res = await matchmakerApi.getInviteRecords({
      page: page.value,
      pageSize: 20
    })
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

async function handleCopy() {
  if (!inviteCode.value) return
  try {
    await navigator.clipboard.writeText(inviteCode.value)
    showToast('邀请码已复制')
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = inviteCode.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    showToast('邀请码已复制')
  }
}

function handleShare() {
  if (!inviteCode.value) {
    showToast('邀请码获取中，请稍候')
    return
  }
  handleCopy()
}

onMounted(() => {
  fetchInviteCode()
})
</script>

<style scoped>
.invite-banner {
  margin: 16px;
  padding: 32px 20px;
  background: linear-gradient(135deg, var(--ifu-gold-500), var(--ifu-gold-700));
  border-radius: var(--ifu-radius-lg);
  text-align: center;
}

.invite-funnel-card {
  margin: 12px 16px 0;
  padding: 16px;
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: var(--ifu-shadow-soft);
}

.invite-funnel-card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.invite-funnel-card__head h2 {
  margin-top: 6px;
  color: var(--ifu-text-strong);
  font-size: 22px;
  line-height: 1.3;
}

.invite-funnel-card__head strong {
  flex-shrink: 0;
  padding: 8px 11px;
  border-radius: 999px;
  background: rgba(200, 169, 119, 0.16);
  color: var(--ifu-gold-700);
  font-size: 12px;
}

.invite-funnel-card__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.invite-funnel-card__grid article {
  padding: 13px 12px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 252, 248, 0.94), rgba(249, 241, 230, 0.76));
  border: 1px solid rgba(233, 221, 204, 0.86);
}

.invite-funnel-card__grid span {
  display: block;
  color: var(--ifu-text-muted);
  font-size: 11px;
}

.invite-funnel-card__grid strong {
  display: block;
  margin-top: 8px;
  color: var(--ifu-text-strong);
  font-size: 16px;
}

.invite-funnel-card__grid p {
  margin-top: 6px;
  color: var(--ifu-text-muted);
  font-size: 11px;
  line-height: 1.5;
}

.invite-banner__icon {
  margin-bottom: 12px;
}

.invite-banner__title {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}

.invite-banner__desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.5;
}

.invite-code-card {
  margin: 0 16px 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 24px;
  box-shadow: var(--ifu-shadow-soft);
}

.invite-code-card__label {
  font-size: 13px;
  color: var(--hl-text-secondary);
  margin-bottom: 12px;
}

.invite-code-card__code-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.invite-code-card__code {
  font-size: 28px;
  font-weight: 700;
  color: var(--ifu-gold-700);
  letter-spacing: 0;
}

.invite-code-card__actions {
  margin-top: 4px;
}

.rules-card {
  margin: 0 16px 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 24px;
  box-shadow: var(--ifu-shadow-soft);
}

.rules-card__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: var(--ifu-text-strong);
  margin-bottom: 12px;
}

.rules-card__content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rule-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.rule-item__num {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--ifu-gold-700);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rule-item__text {
  font-size: 13px;
  color: var(--ifu-text);
  line-height: 20px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--ifu-text-strong);
}

.section-title__count {
  font-size: 12px;
  font-weight: 400;
  color: var(--hl-text-secondary);
}

.record-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid rgba(233, 221, 204, 0.92);
}

.record-row__info {
  flex: 1;
  min-width: 0;
}

.record-row__name {
  font-size: 14px;
  font-weight: 500;
  color: var(--ifu-text-strong);
  margin-bottom: 2px;
}

.record-row__date {
  font-size: 12px;
  color: var(--ifu-text-muted);
}

@media (max-width: 380px) {
  .invite-funnel-card__grid {
    grid-template-columns: 1fr;
  }
}
</style>
