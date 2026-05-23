<template>
  <div class="page utility-page utility-page--form">
    <van-nav-bar title="提现" left-arrow :border="false" @click-left="$router.back()" />

    <section class="card utility-hero" data-testid="matchmaker-withdraw-shell">
      <div class="utility-hero__top">
        <div>
          <span class="brand-label">WITHDRAWAL</span>
          <h1>把提现流程做成可预估到账的结算面板</h1>
          <p>先看可提现金额和规则，再确认金额、渠道与手续费预期，减少提交前的不确定感。</p>
        </div>
        <span class="brand-chip brand-chip--active">{{ withdrawMethod === 'wechat' ? '微信提现' : '银行卡提现' }}</span>
      </div>
      <div class="utility-hero__chips">
        <span class="brand-chip">余额 ¥{{ formatMoney(walletStore.availableAmount) }}</span>
        <span class="brand-chip">最低 10 元</span>
        <span class="brand-chip">手续费 1%</span>
      </div>
    </section>

    <div class="balance-card">
      <div class="balance-card__label">可提现金额 (元)</div>
      <div class="balance-card__amount">{{ formatMoney(walletStore.availableAmount) }}</div>
    </div>

    <section class="withdraw-review card" data-testid="matchmaker-withdraw-review">
      <div class="withdraw-review__head">
        <div>
          <span class="brand-label">PAYOUT CHECK</span>
          <h2>提交前确认</h2>
        </div>
        <strong>{{ withdrawState }}</strong>
      </div>
      <div class="withdraw-review__grid">
        <article v-for="item in withdrawReviewItems" :key="item.label">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p>{{ item.hint }}</p>
        </article>
      </div>
    </section>

    <div class="card">
      <div class="amount-section">
        <div class="amount-section__label">提现金额</div>
        <div class="amount-section__input">
          <span class="amount-section__unit">¥</span>
          <van-field
            v-model="amount"
            type="number"
            placeholder="请输入提现金额"
            :border="false"
            class="amount-field"
          />
          <span class="amount-section__all" @click="handleWithdrawAll">全部提现</span>
        </div>
        <div class="amount-section__hint">
          最低提现金额10元，手续费1%
        </div>
      </div>
    </div>

    <div class="card">
      <div class="method-section">
        <div class="method-section__label">提现方式</div>
        <van-radio-group v-model="withdrawMethod" direction="horizontal">
          <van-radio name="wechat">
            <div class="method-option">
              <van-icon name="wechat" size="20" color="#07C160" />
              <span>微信</span>
            </div>
          </van-radio>
          <van-radio name="bank">
            <div class="method-option">
              <van-icon name="card" size="20" color="#1989fa" />
              <span>银行卡</span>
            </div>
          </van-radio>
        </van-radio-group>
      </div>
    </div>

    <div class="rules-card">
      <div class="rules-card__title">提现规则</div>
      <ul class="rules-card__list">
        <li>提现手续费为提现金额的1%</li>
        <li>最低提现金额为10元</li>
        <li>提现申请提交后，预计1-3个工作日到账</li>
        <li>微信提现将直接到账至您的微信钱包</li>
        <li>银行卡提现需先绑定银行卡信息</li>
      </ul>
    </div>

    <div class="submit-wrap">
      <van-button
        block
        round
        type="primary"
        color="var(--hl-primary-color)"
        :loading="submitting"
        :disabled="!canSubmit"
        @click="handleSubmit"
      >
        确认提现
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { useWalletStore } from '@/stores/wallet'
import { walletApi } from '@/api/wallet'
import { formatMoney } from '@/utils/format'

const router = useRouter()
const walletStore = useWalletStore()

const amount = ref('')
const withdrawMethod = ref('wechat')
const submitting = ref(false)

const canSubmit = computed(() => {
  const val = Number(amount.value)
  return val >= 10 && val <= walletStore.availableAmount
})
const feeAmount = computed(() => Number(amount.value || 0) * 0.01)
const actualAmount = computed(() => Math.max(0, Number(amount.value || 0) - feeAmount.value))
const withdrawState = computed(() => {
  const val = Number(amount.value || 0)
  if (!val) return '填写金额'
  if (val < 10) return '低于最低额'
  if (val > walletStore.availableAmount) return '超过余额'
  return '可以提交'
})

const withdrawReviewItems = computed(() => [
  {
    label: '到账预估',
    value: `¥${formatMoney(actualAmount.value)}`,
    hint: amount.value ? `已扣除 1% 手续费 ¥${formatMoney(feeAmount.value)}` : '输入金额后自动估算到账。'
  },
  {
    label: '提现渠道',
    value: withdrawMethod.value === 'wechat' ? '微信' : '银行卡',
    hint: withdrawMethod.value === 'wechat' ? '适合小额快速提现。' : '适合较大金额或对账需要。'
  },
  {
    label: '余额校验',
    value: `¥${formatMoney(walletStore.availableAmount)}`,
    hint: canSubmit.value ? '当前金额满足余额和最低提现规则。' : '请确认金额不少于 10 元且不超过余额。'
  }
])

function handleWithdrawAll() {
  amount.value = String(walletStore.availableAmount || 0)
}

async function handleSubmit() {
  const val = Number(amount.value)

  if (!val || val <= 0) {
    showToast('请输入提现金额')
    return
  }
  if (val < 10) {
    showToast('最低提现金额为10元')
    return
  }
  if (val > walletStore.availableAmount) {
    showToast('提现金额不能超过可提现余额')
    return
  }

  const fee = (val * 0.01).toFixed(2)
  const actualAmount = (val - Number(fee)).toFixed(2)

  try {
    await showDialog({
      title: '确认提现',
      message: `提现金额：¥${formatMoney(val)}\n手续费：¥${fee}\n实际到账：¥${actualAmount}`,
      confirmButtonColor: 'var(--hl-primary-color)'
    })

    submitting.value = true
    await walletApi.withdraw({
      amount: val,
      channel: withdrawMethod.value
    })
    showToast('提现申请已提交')
    walletStore.fetchWalletInfo().catch(() => {})
    router.back()
  } catch (err) {
    // 用户取消或接口报错
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  walletStore.fetchWalletInfo().catch(() => {})
})
</script>

<style scoped>
.balance-card {
  background: linear-gradient(135deg, var(--ifu-gold-500), var(--ifu-gold-700));
  margin: 16px;
  padding: 24px;
  border-radius: var(--ifu-radius-lg);
  text-align: center;
}

.balance-card__label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 8px;
}

.balance-card__amount {
  font-size: 36px;
  font-weight: 700;
  color: #fff;
}

.withdraw-review {
  margin-top: 12px;
}

.withdraw-review__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.withdraw-review__head h2 {
  margin-top: 6px;
  color: var(--ifu-text-strong);
  font-size: 22px;
  line-height: 1.3;
}

.withdraw-review__head strong {
  flex-shrink: 0;
  padding: 8px 11px;
  border-radius: 999px;
  background: rgba(200, 169, 119, 0.16);
  color: var(--ifu-gold-700);
  font-size: 12px;
}

.withdraw-review__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.withdraw-review__grid article {
  padding: 13px 12px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 252, 248, 0.94), rgba(249, 241, 230, 0.76));
  border: 1px solid rgba(233, 221, 204, 0.86);
}

.withdraw-review__grid span {
  display: block;
  color: var(--ifu-text-muted);
  font-size: 11px;
}

.withdraw-review__grid strong {
  display: block;
  margin-top: 8px;
  color: var(--ifu-text-strong);
  font-size: 16px;
}

.withdraw-review__grid p {
  margin-top: 6px;
  color: var(--ifu-text-muted);
  font-size: 11px;
  line-height: 1.5;
}

.card {
  margin: 12px 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 24px;
  box-shadow: var(--ifu-shadow-soft);
}

.amount-section__label {
  font-size: 14px;
  font-weight: 600;
  color: var(--hl-text-primary);
  margin-bottom: 12px;
}

.amount-section__input {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--hl-border-color);
  padding-bottom: 8px;
}

.amount-section__unit {
  font-size: 24px;
  font-weight: 600;
  color: var(--hl-text-primary);
  margin-right: 4px;
}

.amount-field {
  padding: 0;
  font-size: 24px;
}

.amount-field :deep(.van-field__control) {
  font-size: 24px;
  font-weight: 600;
}

.amount-section__all {
  flex-shrink: 0;
  font-size: 13px;
  color: var(--ifu-gold-700);
  cursor: pointer;
  padding-left: 8px;
}

.amount-section__hint {
  font-size: 12px;
  color: var(--hl-text-secondary);
  margin-top: 8px;
}

.method-section__label {
  font-size: 14px;
  font-weight: 600;
  color: var(--hl-text-primary);
  margin-bottom: 16px;
}

.method-option {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--hl-text-primary);
}

.rules-card {
  margin: 12px 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 24px;
  box-shadow: var(--ifu-shadow-soft);
}

.rules-card__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--hl-text-primary);
  margin-bottom: 8px;
}

.rules-card__list {
  padding-left: 16px;
  margin: 0;
}

.rules-card__list li {
  font-size: 12px;
  color: var(--hl-text-secondary);
  line-height: 2;
}

.submit-wrap {
  padding: 24px 16px;
}

@media (max-width: 380px) {
  .withdraw-review__grid {
    grid-template-columns: 1fr;
  }
}
</style>
