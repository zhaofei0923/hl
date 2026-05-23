<template>
  <div class="page utility-page utility-page--form cert-page">
    <van-nav-bar title="认证中心" left-arrow :border="false" @click-left="$router.back()" />

    <section class="card utility-hero" data-testid="certification-shell">
      <div class="utility-hero__top">
        <div>
          <span class="brand-label">VERIFICATION</span>
          <h1>把认证流程做成可理解、可追踪的信任面板</h1>
          <p>清楚知道当前状态、需要提交的材料，以及完成认证后会对曝光、信任和推荐带来的变化。</p>
        </div>
        <span class="brand-chip brand-chip--active">
          {{ certStatus === 'certified' ? '已认证' : certStatus === 'pending' ? '审核中' : certStatus === 'rejected' ? '待重提' : '未认证' }}
        </span>
      </div>
      <div class="utility-hero__chips">
        <span class="brand-chip">实名校验</span>
        <span class="brand-chip">资料提权</span>
        <span class="brand-chip">信任展示</span>
      </div>
    </section>

    <section class="cert-readiness card" data-testid="cert-readiness-panel">
      <div class="cert-readiness__head">
        <div>
          <span class="brand-label">TRUST CHECK</span>
          <h2>认证材料检查</h2>
        </div>
        <strong>{{ certReadinessState }}</strong>
      </div>
      <div class="cert-readiness__grid">
        <article v-for="item in certReadinessItems" :key="item.label">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p>{{ item.hint }}</p>
        </article>
      </div>
    </section>

    <div class="cert-content">
      <!-- 认证状态提示 -->
      <van-notice-bar
        v-if="certStatus === 'uncertified'"
        left-icon="warning-o"
        text="您尚未完成实名认证，认证后可提升信任度"
        color="#ED6A0C"
        background="#FFFBE8"
      />
      <van-notice-bar
        v-else-if="certStatus === 'pending'"
        left-icon="info-o"
        text="认证审核中，请耐心等待，预计1-3个工作日完成"
        color="#1989FA"
        background="#ECF9FF"
      />
      <van-notice-bar
        v-else-if="certStatus === 'certified'"
        left-icon="passed"
        text="已完成实名认证"
        color="#07C160"
        background="#E8F7EC"
      />
      <van-notice-bar
        v-else-if="certStatus === 'rejected'"
        left-icon="close"
        text="认证未通过，请重新提交"
        color="#EE0A24"
        background="#FFF0F0"
      />

      <!-- 已认证状态展示 -->
      <div v-if="certStatus === 'certified'" class="cert-success-card card">
        <div class="cert-success-card__icon">
          <van-icon name="shield-o" size="48" color="#07C160" />
        </div>
        <div class="cert-success-card__info">
          <div class="cert-success-card__name">{{ certInfo.realName || '***' }}</div>
          <div class="cert-success-card__id">{{ maskIdCard(certInfo.idCard) }}</div>
          <div class="cert-success-card__time">认证时间：{{ formatDate(certInfo.certifiedAt, 'YYYY-MM-DD') }}</div>
        </div>
      </div>

      <!-- 审核中状态展示 -->
      <div v-if="certStatus === 'pending'" class="cert-pending-card card">
        <van-loading size="24" color="var(--hl-primary-color)" />
        <p class="cert-pending-card__text">您的认证信息正在审核中</p>
        <p class="cert-pending-card__sub">提交时间：{{ formatDate(certInfo.submittedAt, 'YYYY-MM-DD HH:mm') }}</p>
      </div>

      <!-- 认证表单（未认证 / 被拒绝时显示） -->
      <div v-if="certStatus === 'uncertified' || certStatus === 'rejected'" class="cert-form-section">
        <!-- 拒绝原因 -->
        <div v-if="certStatus === 'rejected' && certInfo.rejectReason" class="cert-reject-reason card">
          <div class="cert-reject-reason__label">拒绝原因</div>
          <div class="cert-reject-reason__text">{{ certInfo.rejectReason }}</div>
        </div>

        <van-form @submit="handleSubmit">
          <div class="card">
            <div class="cert-form__title">基本信息</div>
            <van-field
              v-model="form.realName"
              label="真实姓名"
              placeholder="请输入真实姓名"
              :rules="[{ required: true, message: '请输入真实姓名' }]"
              maxlength="20"
            />
            <van-field
              v-model="form.idCard"
              label="身份证号"
              placeholder="请输入18位身份证号"
              :rules="[
                { required: true, message: '请输入身份证号' },
                { pattern: idCardPattern, message: '请输入正确的身份证号' }
              ]"
              maxlength="18"
            />
          </div>

          <div class="card">
            <div class="cert-form__title">证件照片</div>
            <div class="cert-upload-group">
              <div class="cert-upload-item">
                <div class="cert-upload-item__label">身份证正面（人像面）</div>
                <van-uploader
                  v-model="idFrontFiles"
                  :max-count="1"
                  :max-size="5 * 1024 * 1024"
                  :after-read="(file) => handleAfterRead(file, 'front')"
                  @oversize="handleOversize"
                  accept="image/*"
                >
                  <div v-if="idFrontFiles.length === 0" class="cert-upload-trigger">
                    <van-icon name="photograph" size="28" color="var(--hl-text-placeholder)" />
                    <span>点击上传</span>
                  </div>
                </van-uploader>
              </div>
              <div class="cert-upload-item">
                <div class="cert-upload-item__label">身份证反面（国徽面）</div>
                <van-uploader
                  v-model="idBackFiles"
                  :max-count="1"
                  :max-size="5 * 1024 * 1024"
                  :after-read="(file) => handleAfterRead(file, 'back')"
                  @oversize="handleOversize"
                  accept="image/*"
                >
                  <div v-if="idBackFiles.length === 0" class="cert-upload-trigger">
                    <van-icon name="photograph" size="28" color="var(--hl-text-placeholder)" />
                    <span>点击上传</span>
                  </div>
                </van-uploader>
              </div>
            </div>
          </div>

          <div class="cert-form__action">
            <van-button
              type="primary"
              block
              round
              native-type="submit"
              :loading="submitting"
              :disabled="!isFormValid"
            >
              提交认证
            </van-button>
          </div>
        </van-form>
      </div>

      <!-- 认证权益说明 -->
      <div class="cert-benefits card">
        <div class="cert-benefits__title">认证权益</div>
        <div class="cert-benefits__list">
          <div class="cert-benefit-item">
            <div class="cert-benefit-item__icon">
              <van-icon name="shield-o" size="24" color="var(--hl-primary-color)" />
            </div>
            <div class="cert-benefit-item__info">
              <div class="cert-benefit-item__name">提高信任度</div>
              <div class="cert-benefit-item__desc">实名认证后，您的个人资料将更受其他用户信赖</div>
            </div>
          </div>
          <div class="cert-benefit-item">
            <div class="cert-benefit-item__icon">
              <van-icon name="fire-o" size="24" color="var(--hl-primary-color)" />
            </div>
            <div class="cert-benefit-item__info">
              <div class="cert-benefit-item__name">优先推荐</div>
              <div class="cert-benefit-item__desc">已认证用户将在匹配推荐中获得更高的展示优先级</div>
            </div>
          </div>
          <div class="cert-benefit-item">
            <div class="cert-benefit-item__icon">
              <van-icon name="medal-o" size="24" color="var(--hl-primary-color)" />
            </div>
            <div class="cert-benefit-item__info">
              <div class="cert-benefit-item__name">专属标识</div>
              <div class="cert-benefit-item__desc">认证通过后将获得专属认证标识，彰显真实身份</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { showToast, showSuccessToast } from 'vant'
import { userApi } from '@/api/user'
import { formatDate } from '@/utils/format'

const idCardPattern = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/

const certStatus = ref('uncertified') // uncertified | pending | certified | rejected
const certInfo = ref({})
const submitting = ref(false)

const form = ref({
  realName: '',
  idCard: ''
})

const idFrontFiles = ref([])
const idBackFiles = ref([])
const idFrontUrl = ref('')
const idBackUrl = ref('')

const isFormValid = computed(() => {
  return (
    form.value.realName.trim() !== '' &&
    idCardPattern.test(form.value.idCard) &&
    idFrontUrl.value !== '' &&
    idBackUrl.value !== ''
  )
})

const certReadinessState = computed(() => {
  if (certStatus.value === 'certified') return '信任已建立'
  if (certStatus.value === 'pending') return '等待复核'
  if (isFormValid.value) return '可以提交'
  return '材料待补齐'
})

const certReadinessItems = computed(() => [
  {
    label: '实名信息',
    value: form.value.realName && idCardPattern.test(form.value.idCard) ? '已填写' : '待完善',
    hint: form.value.realName && idCardPattern.test(form.value.idCard) ? '姓名和证件号格式已满足提交条件。' : '请确认姓名和 18 位身份证号格式。'
  },
  {
    label: '证件照片',
    value: idFrontUrl.value && idBackUrl.value ? '已上传' : '待上传',
    hint: idFrontUrl.value && idBackUrl.value ? '正反面照片已具备审核基础。' : '请上传清晰身份证正反面照片。'
  },
  {
    label: '审核节奏',
    value: certStatus.value === 'pending' ? '1-3 个工作日' : '人工复核',
    hint: certStatus.value === 'rejected' ? '请按拒绝原因修正后重新提交。' : '提交后将进入平台人工复核。'
  }
])

function maskIdCard(idCard) {
  if (!idCard || idCard.length < 8) return idCard || ''
  return idCard.replace(/^(.{4})(.*)(.{4})$/, '$1**********$3')
}

function handleAfterRead(file, side) {
  // Mark as uploading
  file.status = 'uploading'
  file.message = '上传中...'

  const formData = new FormData()
  formData.append('file', file.file)

  // Simulate upload via a general upload endpoint
  // In production, this would be a dedicated upload API
  const reader = new FileReader()
  reader.onload = () => {
    // Use the file content as a data URL for preview; in production use real upload
    if (side === 'front') {
      idFrontUrl.value = file.content || reader.result
    } else {
      idBackUrl.value = file.content || reader.result
    }
    file.status = 'done'
    file.message = ''
  }
  reader.onerror = () => {
    file.status = 'failed'
    file.message = '上传失败'
  }
  reader.readAsDataURL(file.file)
}

function handleOversize() {
  showToast('图片大小不能超过5MB')
}

async function handleSubmit() {
  if (!isFormValid.value || submitting.value) return

  submitting.value = true
  try {
    await userApi.submitCertification({
      realName: form.value.realName,
      idCard: form.value.idCard,
      idFrontPhoto: idFrontUrl.value,
      idBackPhoto: idBackUrl.value
    })
    showSuccessToast('提交成功')
    certStatus.value = 'pending'
    certInfo.value.submittedAt = new Date().toISOString()
  } catch (err) {
    // handled by interceptor
  } finally {
    submitting.value = false
  }
}

async function fetchCertification() {
  try {
    const res = await userApi.getCertification()
    const data = res.data || {}

    if (data.status) {
      certStatus.value = data.status
      certInfo.value = data
    }

    // Pre-fill form if rejected so user can edit
    if (data.status === 'rejected') {
      form.value.realName = data.realName || ''
      form.value.idCard = data.idCard || ''
    }
  } catch (err) {
    // handled by interceptor
  }
}

onMounted(() => {
  fetchCertification()
})
</script>

<style scoped>
.cert-page {
  background-color: var(--ifu-bg);
}

.cert-content {
  padding-bottom: 24px;
}

.cert-readiness {
  margin-top: 12px;
}

.cert-readiness__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.cert-readiness__head h2 {
  margin-top: 6px;
  color: var(--ifu-text-strong);
  font-size: 22px;
  line-height: 1.3;
}

.cert-readiness__head strong {
  flex-shrink: 0;
  padding: 8px 11px;
  border-radius: 999px;
  background: rgba(200, 169, 119, 0.16);
  color: var(--ifu-gold-700);
  font-size: 12px;
}

.cert-readiness__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.cert-readiness__grid article {
  padding: 13px 12px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 252, 248, 0.94), rgba(249, 241, 230, 0.76));
  border: 1px solid rgba(233, 221, 204, 0.86);
}

.cert-readiness__grid span {
  display: block;
  color: var(--ifu-text-muted);
  font-size: 11px;
}

.cert-readiness__grid strong {
  display: block;
  margin-top: 8px;
  color: var(--ifu-text-strong);
  font-size: 16px;
}

.cert-readiness__grid p {
  margin-top: 6px;
  color: var(--ifu-text-muted);
  font-size: 11px;
  line-height: 1.5;
}

/* 已认证卡片 */
.cert-success-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cert-success-card__icon {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #E8F7EC;
  border-radius: 50%;
}

.cert-success-card__name {
  font-size: 16px;
  font-weight: 500;
  color: var(--ifu-text-strong);
  margin-bottom: 4px;
}

.cert-success-card__id {
  font-size: 14px;
  color: var(--ifu-text);
  margin-bottom: 4px;
}

.cert-success-card__time {
  font-size: 12px;
  color: var(--ifu-text-muted);
}

/* 审核中卡片 */
.cert-pending-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
}

.cert-pending-card__text {
  font-size: 15px;
  color: var(--ifu-text-strong);
  margin-top: 12px;
}

.cert-pending-card__sub {
  font-size: 13px;
  color: var(--ifu-text-muted);
  margin-top: 6px;
}

/* 拒绝原因 */
.cert-reject-reason {
  border-left: 3px solid #EE0A24;
}

.cert-reject-reason__label {
  font-size: 13px;
  color: #EE0A24;
  margin-bottom: 4px;
  font-weight: 500;
}

.cert-reject-reason__text {
  font-size: 13px;
  color: var(--hl-text-secondary);
  line-height: 1.6;
}

/* 表单 */
.cert-form__title {
  font-size: 15px;
  font-weight: 500;
  color: var(--ifu-text-strong);
  margin-bottom: 8px;
}

.cert-form-section :deep(.van-field) {
  padding: 12px 0;
}

.cert-form-section :deep(.van-field__label) {
  width: 80px;
  font-size: 14px;
  color: var(--hl-text-primary);
}

.cert-form-section :deep(.van-field__control) {
  font-size: 14px;
}

/* 上传区域 */
.cert-upload-group {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.cert-upload-item {
  flex: 1;
}

.cert-upload-item__label {
  font-size: 13px;
  color: var(--hl-text-secondary);
  margin-bottom: 8px;
}

.cert-upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-width: 120px;
  height: 90px;
  background: var(--hl-bg-color);
  border: 1px dashed var(--hl-border-color);
  border-radius: var(--hl-radius-sm);
  gap: 4px;
}

.cert-upload-trigger span {
  font-size: 12px;
  color: var(--hl-text-placeholder);
}

.cert-upload-item :deep(.van-uploader__wrapper) {
  width: 100%;
}

.cert-upload-item :deep(.van-uploader__preview) {
  width: 100%;
  margin: 0;
}

.cert-upload-item :deep(.van-uploader__preview-image) {
  width: 100%;
  height: 90px;
  border-radius: var(--hl-radius-sm);
}

/* 提交按钮 */
.cert-form__action {
  padding: 20px 16px;
}

.cert-form__action :deep(.van-button) {
  height: 44px;
  font-size: 16px;
  font-weight: 500;
}

/* 认证权益 */
.cert-benefits__title {
  font-size: 15px;
  font-weight: 500;
  color: var(--ifu-text-strong);
  margin-bottom: 12px;
}

.cert-benefits__list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cert-benefit-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.cert-benefit-item__icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--hl-primary-light);
  border-radius: var(--hl-radius-sm);
}

.cert-benefit-item__name {
  font-size: 14px;
  font-weight: 500;
  color: var(--ifu-text-strong);
  margin-bottom: 2px;
}

.cert-benefit-item__desc {
  font-size: 12px;
  color: var(--ifu-text-muted);
  line-height: 1.5;
}

@media (max-width: 380px) {
  .cert-readiness__grid {
    grid-template-columns: 1fr;
  }
}
</style>
