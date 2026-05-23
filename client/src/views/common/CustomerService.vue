<template>
  <div class="page utility-page cs-page">
    <van-nav-bar title="客服中心" left-arrow :border="false" @click-left="$router.back()" />

    <section class="card utility-hero" data-testid="customer-service-shell">
      <div class="utility-hero__top">
        <div>
          <span class="brand-label">SUPPORT</span>
          <h1>把帮助中心做成可直接行动的服务页</h1>
          <p>先定位常见问题，再决定拨打电话、在线咨询，还是继续查看平台规则和会员权益说明。</p>
        </div>
        <span class="brand-chip brand-chip--active">客服在线</span>
      </div>
      <div class="utility-hero__chips">
        <span class="brand-chip">常见问题</span>
        <span class="brand-chip">人工咨询</span>
        <span class="brand-chip">服务时间 9:00-21:00</span>
      </div>
    </section>

    <section class="cs-routing card" data-testid="customer-service-routing">
      <div class="cs-routing__head">
        <div>
          <span class="brand-label">SUPPORT ROUTING</span>
          <h2>先判断问题类型</h2>
        </div>
        <strong>9:00-21:00</strong>
      </div>
      <div class="cs-routing__grid">
        <article v-for="item in supportRoutes" :key="item.label">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p>{{ item.hint }}</p>
        </article>
      </div>
    </section>

    <div class="cs-content">
      <!-- 常见问题 -->
      <div class="cs-section">
        <div class="cs-section__title">
          <van-icon name="question-o" size="18" color="var(--hl-primary-color)" />
          <span>常见问题</span>
        </div>

        <van-collapse v-model="activeNames" class="cs-collapse">
          <van-collapse-item title="如何成为婚介人员？" name="1">
            <div class="cs-answer">
              您可以通过以下步骤申请成为婚介人员：<br />
              1. 在"我的"页面点击"切换为婚介人员"；<br />
              2. 填写个人信息和从业资质；<br />
              3. 提交实名认证材料；<br />
              4. 等待平台审核，通常1-3个工作日内完成。<br />
              审核通过后即可开始使用婚介端功能。
            </div>
          </van-collapse-item>

          <van-collapse-item title="如何提现？" name="2">
            <div class="cs-answer">
              提现规则如下：<br />
              1. 进入"我的钱包"页面，点击"提现"按钮；<br />
              2. 输入提现金额，最低提现金额为10元；<br />
              3. 选择提现方式（微信/支付宝/银行卡）；<br />
              4. 提现申请提交后，预计1-3个工作日到账。<br />
              注意：每日最多可发起3次提现申请。
            </div>
          </van-collapse-item>

          <van-collapse-item title="如何修改个人资料？" name="3">
            <div class="cs-answer">
              修改个人资料的步骤：<br />
              1. 进入"我的"页面；<br />
              2. 点击头像或"编辑资料"按钮；<br />
              3. 修改您需要更新的信息（昵称、头像、个人介绍等）；<br />
              4. 点击保存即可完成修改。<br />
              注意：实名认证信息提交后不可自行修改，如需修改请联系客服。
            </div>
          </van-collapse-item>

          <van-collapse-item title="会员权益有哪些？" name="4">
            <div class="cs-answer">
              成为平台会员后，您将享有以下权益：<br />
              1. 优先推荐 — 您的资料将获得更高曝光率；<br />
              2. 专属红娘 — 配备专属红娘一对一服务；<br />
              3. 精准匹配 — 享受更精准的对象推荐；<br />
              4. 身份认证标识 — 展示会员专属标识，提升信任度；<br />
              5. 更多互动机会 — 每日可发起更多聊天和关注。
            </div>
          </van-collapse-item>

          <van-collapse-item title="如何联系客服？" name="5">
            <div class="cs-answer">
              您可以通过以下方式联系我们：<br />
              1. 在线客服 — 点击本页面底部"在线客服"按钮；<br />
              2. 客服电话 — 拨打 400-888-9999；<br />
              3. 电子邮箱 — 发送邮件至 support@hunlian.com；<br />
              客服工作时间：周一至周日 9:00 - 21:00。
            </div>
          </van-collapse-item>
        </van-collapse>
      </div>

      <!-- 联系方式 -->
      <div class="cs-section">
        <div class="cs-section__title">
          <van-icon name="phone-o" size="18" color="var(--hl-primary-color)" />
          <span>联系方式</span>
        </div>

        <div class="cs-contact-card">
          <van-cell
            title="客服电话"
            value="400-888-9999"
            is-link
            @click="handleCall"
          >
            <template #icon>
              <van-icon name="phone-o" size="18" color="var(--hl-primary-color)" class="cs-cell-icon" />
            </template>
          </van-cell>
          <van-cell title="工作时间" value="周一至周日 9:00 - 21:00">
            <template #icon>
              <van-icon name="clock-o" size="18" color="var(--hl-primary-color)" class="cs-cell-icon" />
            </template>
          </van-cell>
          <van-cell title="电子邮箱" value="support@hunlian.com">
            <template #icon>
              <van-icon name="envelop-o" size="18" color="var(--hl-primary-color)" class="cs-cell-icon" />
            </template>
          </van-cell>
        </div>
      </div>
    </div>

    <!-- 底部在线客服按钮 -->
    <div class="cs-bottom-bar">
      <van-button
        type="primary"
        block
        round
        @click="handleOnlineService"
      >
        在线客服
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast } from 'vant'

const activeNames = ref([])
const supportRoutes = [
  { label: '规则问题', value: '先看 FAQ', hint: '提现、认证、会员权益可先在常见问题中定位。' },
  { label: '紧急问题', value: '电话优先', hint: '账号风险、支付异常建议直接拨打客服电话。' },
  { label: '关系服务', value: '在线咨询', hint: '红娘协助、推荐节奏和资料问题适合在线沟通。' }
]

function handleCall() {
  window.location.href = 'tel:400-888-9999'
}

function handleOnlineService() {
  showToast('客服功能开发中')
}
</script>

<style scoped>
.cs-page {
  padding-bottom: calc(72px + env(safe-area-inset-bottom));
  background-color: var(--ifu-bg);
}

.cs-routing {
  margin-top: 12px;
}

.cs-routing__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.cs-routing__head h2 {
  margin-top: 6px;
  color: var(--ifu-text-strong);
  font-size: 22px;
  line-height: 1.3;
}

.cs-routing__head strong {
  flex-shrink: 0;
  padding: 8px 11px;
  border-radius: 999px;
  background: rgba(200, 169, 119, 0.16);
  color: var(--ifu-gold-700);
  font-size: 12px;
}

.cs-routing__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.cs-routing__grid article {
  padding: 13px 12px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 252, 248, 0.94), rgba(249, 241, 230, 0.76));
  border: 1px solid rgba(233, 221, 204, 0.86);
}

.cs-routing__grid span {
  display: block;
  color: var(--ifu-text-muted);
  font-size: 11px;
}

.cs-routing__grid strong {
  display: block;
  margin-top: 8px;
  color: var(--ifu-text-strong);
  font-size: 16px;
}

.cs-routing__grid p {
  margin-top: 6px;
  color: var(--ifu-text-muted);
  font-size: 11px;
  line-height: 1.5;
}

.cs-content {
  padding: 12px 0;
}

.cs-section {
  margin-bottom: 12px;
}

.cs-section__title {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 500;
  color: var(--ifu-text-strong);
}

.cs-collapse {
  margin: 0 16px;
  overflow: hidden;
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: var(--ifu-shadow-soft);
}

.cs-collapse :deep(.van-collapse-item__title) {
  font-size: 14px;
  color: var(--ifu-text-strong);
  padding: 14px 16px;
}

.cs-collapse :deep(.van-collapse-item__content) {
  padding: 0 16px 14px;
}

.cs-answer {
  font-size: 13px;
  line-height: 1.8;
  color: var(--ifu-text);
}

.cs-contact-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 24px;
  margin: 0 16px;
  overflow: hidden;
  box-shadow: var(--ifu-shadow-soft);
}

.cs-contact-card :deep(.van-cell) {
  padding: 14px 16px;
}

.cs-contact-card :deep(.van-cell__title) {
  font-size: 14px;
  color: var(--ifu-text-strong);
}

.cs-contact-card :deep(.van-cell__value) {
  font-size: 14px;
  color: var(--ifu-text);
}

.cs-cell-icon {
  margin-right: 8px;
}

.cs-bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: rgba(251, 247, 241, 0.94);
  border-top: 1px solid rgba(233, 221, 204, 0.92);
  box-shadow: var(--ifu-shadow-float);
}

.cs-bottom-bar :deep(.van-button) {
  height: 44px;
  font-size: 16px;
  font-weight: 500;
}

@media (max-width: 380px) {
  .cs-routing__grid {
    grid-template-columns: 1fr;
  }
}
</style>
