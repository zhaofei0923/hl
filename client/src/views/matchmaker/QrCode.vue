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
import { ref, reactive, onMounted } from 'vue'
import { showToast } from 'vant'
import { formatMoney } from '@/utils/format'

const qrCodeUrl = ref('')

const stats = reactive({
  todayAmount: 0,
  todayCount: 0,
  totalAmount: 0
})

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

.qrcode-card {
  width: 100%;
  max-width: 320px;
  padding: 24px;
  background: var(--hl-card-bg);
  border-radius: var(--hl-radius-lg);
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.qrcode-card__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--hl-text-primary);
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
  background: var(--hl-bg-color);
  border: 2px dashed var(--hl-border-color);
  border-radius: var(--hl-radius-md);
  font-size: 13px;
  color: var(--hl-text-placeholder);
}

.qrcode-card__image {
  border: 1px solid var(--hl-border-color);
  border-radius: var(--hl-radius-sm);
  padding: 8px;
}

.qrcode-card__tip {
  font-size: 12px;
  color: var(--hl-text-secondary);
}

.stats-section {
  padding: 20px 16px;
}

.stats-row {
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--hl-card-bg);
  border-radius: var(--hl-radius-md);
}

.stats-row__item {
  flex: 1;
  text-align: center;
}

.stats-row__value {
  display: block;
  font-size: 17px;
  font-weight: 700;
  color: var(--hl-text-primary);
  margin-bottom: 4px;
}

.stats-row__label {
  font-size: 11px;
  color: var(--hl-text-secondary);
}

.stats-row__divider {
  width: 1px;
  height: 28px;
  background: var(--hl-border-color);
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
</style>
