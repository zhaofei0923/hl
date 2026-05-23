<template>
  <div class="page utility-page">
    <van-nav-bar title="官方收款码" left-arrow :border="false" @click-left="$router.back()" />

    <section class="card utility-hero" data-testid="matchmaker-qrcode-shell">
      <div class="utility-hero__top">
        <div>
          <span class="brand-label">PAYMENT QR</span>
          <h1>把收款码做成可直接展示的成交工具</h1>
          <p>除了展示二维码，还要同步呈现今日收款、笔数和累计金额，方便现场成交时快速核对。</p>
        </div>
        <span class="brand-chip brand-chip--active">官方收款</span>
      </div>
      <div class="utility-hero__chips">
        <span class="brand-chip">今日 ¥{{ formatMoney(stats.todayAmount) }}</span>
        <span class="brand-chip">{{ stats.todayCount || 0 }} 笔</span>
        <span class="brand-chip">累计 ¥{{ formatMoney(stats.totalAmount) }}</span>
      </div>
    </section>

    <van-notice-bar
      left-icon="info-o"
      text="此为官方收款码，会员可扫码完成付款，款项将直接进入您的钱包"
      color="var(--hl-primary-color)"
      background="#FFF7F0"
    />

    <section class="payment-guard-card" data-testid="matchmaker-qrcode-guard">
      <div class="payment-guard-card__head">
        <div>
          <span class="brand-label">PAYMENT GUARD</span>
          <h2>现场收款检查</h2>
        </div>
        <strong>{{ qrCodeUrl ? '可展示' : '待生成' }}</strong>
      </div>
      <div class="payment-guard-card__grid">
        <article v-for="item in paymentGuardItems" :key="item.label">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p>{{ item.hint }}</p>
        </article>
      </div>
    </section>

    <div class="qrcode-section">
      <div class="qrcode-card">
        <div class="qrcode-card__title">扫码向我付款</div>
        <div class="qrcode-card__box">
          <div v-if="qrCodeUrl" class="qrcode-card__image">
            <van-image
              :src="qrCodeUrl"
              width="200"
              height="200"
              fit="contain"
            />
          </div>
          <div v-else class="qrcode-card__placeholder">
            <van-icon name="qr" size="64" color="var(--hl-text-placeholder)" />
            <span>收款码区域</span>
          </div>
        </div>
        <div class="qrcode-card__tip">请让会员扫描此二维码完成付款</div>
      </div>
    </div>

    <div class="stats-section">
      <div class="stats-row">
        <div class="stats-row__item">
          <span class="stats-row__value">¥{{ formatMoney(stats.todayAmount) }}</span>
          <span class="stats-row__label">今日收款</span>
        </div>
        <div class="stats-row__divider"></div>
        <div class="stats-row__item">
          <span class="stats-row__value">{{ stats.todayCount || 0 }}</span>
          <span class="stats-row__label">今日笔数</span>
        </div>
        <div class="stats-row__divider"></div>
        <div class="stats-row__item">
          <span class="stats-row__value">¥{{ formatMoney(stats.totalAmount) }}</span>
          <span class="stats-row__label">累计收款</span>
        </div>
      </div>
    </div>

    <div class="action-section">
      <van-button
        block
        round
        type="primary"
        color="var(--hl-primary-color)"
        icon="down"
        @click="handleSave"
      >
        保存收款码到相册
      </van-button>
      <van-button
        block
        round
        plain
        hairline
        color="var(--hl-primary-color)"
        icon="share-o"
        class="action-section__share"
        @click="handleShare"
      >
        分享收款码
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { showToast } from 'vant'
import { formatMoney } from '@/utils/format'

const qrCodeUrl = ref('')

const stats = reactive({
  todayAmount: 0,
  todayCount: 0,
  totalAmount: 0
})

const paymentGuardItems = computed(() => [
  {
    label: '今日收款',
    value: `¥${formatMoney(stats.todayAmount)}`,
    hint: stats.todayAmount ? '现场成交后可用今日金额做快速核对。' : '今日暂无收款记录。'
  },
  {
    label: '今日笔数',
    value: `${stats.todayCount || 0} 笔`,
    hint: stats.todayCount ? '收款笔数可与会员付款记录互相确认。' : '完成收款后这里会展示笔数。'
  },
  {
    label: '收款码状态',
    value: qrCodeUrl.value ? '已生成' : '待接入',
    hint: qrCodeUrl.value ? '可现场展示或保存分享。' : '二维码 API 接入后可直接使用。'
  }
])

function handleSave() {
  if (!qrCodeUrl.value) {
    showToast('收款码生成中，请稍候')
    return
  }
  showToast('保存功能即将上线')
}

function handleShare() {
  if (!qrCodeUrl.value) {
    showToast('收款码生成中，请稍候')
    return
  }
  showToast('分享功能即将上线')
}

onMounted(() => {
  // QR码生成逻辑和API可后续接入
})
</script>

<style scoped>
.qrcode-section {
  display: flex;
  justify-content: center;
  padding: 24px 16px 0;
}

.payment-guard-card {
  margin: 12px 16px 0;
  padding: 16px;
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: var(--ifu-shadow-soft);
}

.payment-guard-card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.payment-guard-card__head h2 {
  margin-top: 6px;
  color: var(--ifu-text-strong);
  font-size: 22px;
  line-height: 1.3;
}

.payment-guard-card__head strong {
  flex-shrink: 0;
  padding: 8px 11px;
  border-radius: 999px;
  background: rgba(200, 169, 119, 0.16);
  color: var(--ifu-gold-700);
  font-size: 12px;
}

.payment-guard-card__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.payment-guard-card__grid article {
  padding: 13px 12px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 252, 248, 0.94), rgba(249, 241, 230, 0.76));
  border: 1px solid rgba(233, 221, 204, 0.86);
}

.payment-guard-card__grid span {
  display: block;
  color: var(--ifu-text-muted);
  font-size: 11px;
}

.payment-guard-card__grid strong {
  display: block;
  margin-top: 8px;
  color: var(--ifu-text-strong);
  font-size: 16px;
}

.payment-guard-card__grid p {
  margin-top: 6px;
  color: var(--ifu-text-muted);
  font-size: 11px;
  line-height: 1.5;
}

.qrcode-card {
  width: 100%;
  max-width: 320px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.qrcode-card__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--ifu-text-strong);
  margin-bottom: 20px;
}

.qrcode-card__box {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
}

.qrcode-card__placeholder {
  width: 200px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(249, 241, 230, 0.72);
  border: 2px dashed rgba(233, 221, 204, 0.92);
  border-radius: 18px;
  font-size: 13px;
  color: var(--ifu-text-muted);
}

.qrcode-card__image {
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 14px;
  padding: 8px;
}

.qrcode-card__tip {
  font-size: 12px;
  color: var(--ifu-text-muted);
}

.stats-section {
  padding: 20px 16px;
}

.stats-row {
  display: flex;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 24px;
  box-shadow: var(--ifu-shadow-soft);
}

.stats-row__item {
  flex: 1;
  text-align: center;
}

.stats-row__value {
  display: block;
  font-size: 17px;
  font-weight: 700;
  color: var(--ifu-text-strong);
  margin-bottom: 4px;
}

.stats-row__label {
  font-size: 11px;
  color: var(--ifu-text-muted);
}

.stats-row__divider {
  width: 1px;
  height: 28px;
  background: rgba(233, 221, 204, 0.92);
}

.action-section {
  padding: 8px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-section__share {
  margin-top: 0;
}

@media (max-width: 380px) {
  .payment-guard-card__grid {
    grid-template-columns: 1fr;
  }
}
</style>
