<template>
  <div class="wallet-card">
    <div class="wallet-card__row">
      <div class="wallet-card__info">
        <div class="wallet-card__label">可提现收益(元)</div>
        <div class="wallet-card__amount">{{ formatMoney(amount) }}</div>
        <div class="wallet-card__coins">剩余囍币(个): {{ coins }}</div>
      </div>
      <van-button round color="#fff" class="wallet-card__btn" @click="$emit('withdraw')">
        <span style="color: #E84D5F; font-weight: 600;">提现</span>
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { formatMoney } from '@/utils/format'

defineProps({
  amount: {
    type: [Number, String],
    default: 0
  },
  coins: {
    type: Number,
    default: 0
  }
})

defineEmits(['withdraw'])
</script>

<style scoped>
.wallet-card {
  background: linear-gradient(135deg, #E84D5F, #FF6B7A);
  border-radius: var(--hl-radius-md);
  margin: 12px 16px;
  padding: 24px 20px;
}

.wallet-card__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wallet-card__info {
  color: #fff;
}

.wallet-card__label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.wallet-card__amount {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.wallet-card__coins {
  font-size: 13px;
  opacity: 0.8;
}

.wallet-card__btn {
  width: 80px;
  height: 36px;
}
</style>
