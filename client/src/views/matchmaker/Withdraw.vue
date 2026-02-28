<template>
  <div class="page">
    <!-- 导航栏 -->
    <van-nav-bar title="提现" left-arrow @click-left="$router.back()" />

    <!-- 余额展示 -->
    <div class="balance-card">
      <div class="balance-card__label">可提现金额 (元)</div>
      <div class="balance-card__amount">{{ formatMoney(walletStore.availableAmount) }}</div>
    </div>

    <!-- 提现金额 -->
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

    <!-- 提现方式 -->
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

    <!-- 提现规则 -->
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

    <!-- 提现按钮 -->
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
  background: linear-gradient(135deg, var(--hl-accent-color), var(--hl-primary-color));
  margin: 16px;
  padding: 24px;
  border-radius: var(--hl-radius-lg);
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

.card {
  margin: 12px 16px;
  padding: 16px;
  background: var(--hl-card-bg);
  border-radius: var(--hl-radius-md);
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
  color: var(--hl-primary-color);
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
  background: var(--hl-card-bg);
  border-radius: var(--hl-radius-md);
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
</style>
