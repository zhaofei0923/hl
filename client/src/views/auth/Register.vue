<template>
  <div class="page register-page">
    <div class="register-shell">
      <div class="register-header">
        <van-nav-bar
          title="完善资料"
          left-arrow
          @click-left="handleBack"
          :border="false"
        />

        <section class="register-brand-panel" data-testid="register-brand-panel">
          <span class="brand-label">ONBOARDING</span>
          <h1>把注册变成礼宾式建档，而不是填表</h1>
          <p>资料越完整，系统推荐越准，红娘也越容易帮你找到更适合的认识节奏。</p>
          <div class="register-brand-panel__chips">
            <span class="brand-chip brand-chip--ghost">真实认证</span>
            <span class="brand-chip brand-chip--ghost">红娘协作</span>
            <span class="brand-chip brand-chip--ghost">严选推荐</span>
          </div>
        </section>

        <section class="register-progress-board" data-testid="register-progress-board">
          <div class="register-progress-board__meter">
            <div class="register-progress-board__meter-bar" :style="{ width: `${stepProgress}%` }"></div>
          </div>
          <div class="register-progress-board__meta">
            <strong>第 {{ currentStep }} 步 / 4</strong>
            <span>{{ currentStepSummary.time }}</span>
          </div>
          <div class="register-step-list">
            <article
              v-for="step in stepCards"
              :key="step.index"
              class="register-step-card"
              :class="{ 'register-step-card--active': step.active, 'register-step-card--done': step.done }"
              data-testid="register-step-card"
            >
              <div class="register-step-card__index">
                <van-icon v-if="step.done" name="success" size="14" color="#fff" />
                <span v-else>{{ step.index }}</span>
              </div>
              <div class="register-step-card__body">
                <strong>{{ step.label }}</strong>
                <p>{{ step.desc }}</p>
              </div>
              <span class="register-step-card__status">{{ step.status }}</span>
            </article>
          </div>
        </section>
      </div>

      <div class="register-content">
        <aside class="register-aside">
          <section class="register-tip-card">
            <span class="brand-label">CURRENT STEP</span>
            <h2>{{ currentStepSummary.title }}</h2>
            <p>{{ currentStepSummary.desc }}</p>
          </section>

          <section class="register-tip-card register-tip-card--soft">
            <span class="brand-label">WHY IT MATTERS</span>
            <p>完整资料会明显提高推荐准确度，也更利于红娘给出自然的开场建议和线下活动安排。</p>
            <div class="register-tip-card__tags">
              <span class="brand-chip brand-chip--active">更高被联系率</span>
              <span class="brand-chip">更准匹配</span>
            </div>
          </section>
        </aside>

        <main class="register-main">
          <section v-show="currentStep === 1" class="register-form-card">
            <div class="register-form-card__header">
              <div>
                <span class="brand-label">STEP 01</span>
                <h2>基本信息</h2>
              </div>
              <p>先建立最基础的身份轮廓，方便平台快速完成初筛。</p>
            </div>

            <van-cell-group :border="false" class="register-form__group">
              <van-field
                v-model="form.nickname"
                label="昵称"
                placeholder="请输入昵称"
                maxlength="20"
                clearable
                :rules="[{ required: true, message: '请输入昵称' }]"
              />
              <van-cell title="性别" required :border="false" class="register-radio-cell">
                <template #value>
                  <van-radio-group v-model="form.gender" direction="horizontal">
                    <van-radio :name="1" checked-color="var(--hl-primary-color)">男</van-radio>
                    <van-radio :name="2" checked-color="var(--hl-accent-color)">女</van-radio>
                  </van-radio-group>
                </template>
              </van-cell>
              <van-field
                v-model="form.birthDateText"
                label="出生日期"
                placeholder="请选择出生日期"
                readonly
                is-link
                @click="showDatePicker = true"
              />
              <van-field
                v-model="form.city"
                label="所在城市"
                placeholder="请输入所在城市"
                clearable
              />
            </van-cell-group>
          </section>

          <section v-show="currentStep === 2" class="register-form-card">
            <div class="register-form-card__header">
              <div>
                <span class="brand-label">STEP 02</span>
                <h2>详细资料</h2>
              </div>
              <p>把学历、职业与生活状态补充完整，推荐系统会更稳定。</p>
            </div>

            <van-cell-group :border="false" class="register-form__group">
              <van-field
                v-model="form.heightText"
                label="身高"
                placeholder="请选择身高"
                readonly
                is-link
                @click="showHeightPicker = true"
              />
              <van-field
                v-model="form.education"
                label="学历"
                placeholder="请选择学历"
                readonly
                is-link
                @click="showEducationPicker = true"
              />
              <van-field
                v-model="form.occupation"
                label="职业"
                placeholder="请输入您的职业"
                clearable
              />
              <van-field
                v-model="form.income_range"
                label="月收入"
                placeholder="请选择月收入范围"
                readonly
                is-link
                @click="showIncomePicker = true"
              />
              <van-field
                v-model="form.marital_status"
                label="婚姻状况"
                placeholder="请选择婚姻状况"
                readonly
                is-link
                @click="showMaritalPicker = true"
              />
            </van-cell-group>
          </section>

          <section v-show="currentStep === 3" class="register-form-card">
            <div class="register-form-card__header">
              <div>
                <span class="brand-label">STEP 03</span>
                <h2>自我介绍</h2>
              </div>
              <p>让对方更快理解你的生活方式和关系期待，减少泛泛而谈。</p>
            </div>

            <van-cell-group :border="false" class="register-form__group">
              <van-field
                v-model="form.self_intro"
                type="textarea"
                label="关于我"
                placeholder="介绍一下你自己，比如性格、兴趣爱好、生活状态等"
                :autosize="{ minHeight: 92, maxHeight: 180 }"
                maxlength="500"
                show-word-limit
              />
              <van-field
                v-model="form.partner_requirement"
                type="textarea"
                label="理想对象"
                placeholder="描述一下你理想中的另一半"
                :autosize="{ minHeight: 92, maxHeight: 180 }"
                maxlength="500"
                show-word-limit
              />
            </van-cell-group>

            <div class="register-upload-card">
              <div class="register-upload-card__head">
                <div>
                  <span class="brand-label">PHOTO GUIDE</span>
                  <strong>个人照片</strong>
                </div>
                <span>最多上传 6 张</span>
              </div>
              <div class="register-upload-card__tips">
                <span class="brand-chip">清晰头像</span>
                <span class="brand-chip">生活场景</span>
                <span class="brand-chip">兴趣时刻</span>
              </div>
              <van-uploader
                v-model="photoList"
                :max-count="6"
                :after-read="afterPhotoRead"
                :before-read="beforePhotoRead"
                multiple
                image-fit="cover"
              />
            </div>
          </section>

          <section v-show="currentStep === 4" class="register-form-card register-form-card--complete">
            <div class="register-complete">
              <van-icon name="checked" size="68" color="var(--hl-primary-color)" />
              <h2>资料填写完成</h2>
              <p>你的会客名片已经建好，系统会结合资料与红娘复核给出更合适的推荐。</p>
            </div>
          </section>
        </main>
      </div>

      <div class="register-footer">
        <van-button
          v-if="currentStep > 1 && currentStep < 4"
          plain
          round
          class="register-footer__btn register-footer__btn--prev"
          @click="prevStep"
        >
          上一步
        </van-button>
        <van-button
          v-if="currentStep < 3"
          type="primary"
          round
          class="register-footer__btn"
          :class="{ 'register-footer__btn--full': currentStep === 1 }"
          @click="nextStep"
        >
          下一步
        </van-button>
        <van-button
          v-if="currentStep === 3"
          type="primary"
          round
          class="register-footer__btn"
          :loading="submitting"
          @click="handleSubmit"
        >
          完成注册
        </van-button>
        <van-button
          v-if="currentStep === 4"
          type="primary"
          round
          block
          class="register-footer__btn register-footer__btn--full"
          @click="goHome"
        >
          开始使用
        </van-button>
      </div>
    </div>

    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-date-picker
        v-model="datePickerValue"
        title="选择出生日期"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showHeightPicker" position="bottom" round>
      <van-picker
        title="选择身高"
        :columns="heightColumns"
        @confirm="onHeightConfirm"
        @cancel="showHeightPicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showEducationPicker" position="bottom" round>
      <van-picker
        title="选择学历"
        :columns="educationColumns"
        @confirm="onEducationConfirm"
        @cancel="showEducationPicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showIncomePicker" position="bottom" round>
      <van-picker
        title="选择月收入"
        :columns="incomeColumns"
        @confirm="onIncomeConfirm"
        @cancel="showIncomePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showMaritalPicker" position="bottom" round>
      <van-picker
        title="选择婚姻状况"
        :columns="maritalColumns"
        @confirm="onMaritalConfirm"
        @cancel="showMaritalPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { userApi } from '@/api/user'
import { EDUCATION_OPTIONS, MARITAL_STATUS_OPTIONS, INCOME_OPTIONS } from '@/utils/constants'

const router = useRouter()

const stepLabels = ['基本信息', '详细资料', '自我介绍', '完成']
const stepDescriptions = [
  '昵称、城市、出生日期与基本身份轮廓。',
  '学历、职业、收入与生活状态，帮助系统完成更细的筛选。',
  '补充自我介绍、理想对象和照片，让开场更自然。',
  '完成建档，进入平台推荐与红娘复核流程。'
]
const stepTimes = ['预计 5 分钟', '预计 3 分钟', '预计 2 分钟', '已完成']
const currentStep = ref(1)
const submitting = ref(false)

const form = reactive({
  nickname: '',
  gender: 1,
  birth_date: '',
  birthDateText: '',
  city: '',
  height: null,
  heightText: '',
  education: '',
  occupation: '',
  income_range: '',
  marital_status: '',
  self_intro: '',
  partner_requirement: ''
})

const photoList = ref([])

const stepCards = computed(() => stepLabels.map((label, index) => ({
  index: index + 1,
  label,
  desc: stepDescriptions[index],
  active: currentStep.value === index + 1,
  done: currentStep.value > index + 1,
  status: currentStep.value > index + 1 ? '已完成' : currentStep.value === index + 1 ? '进行中' : '待填写'
})))

const currentStepSummary = computed(() => ({
  title: stepLabels[currentStep.value - 1],
  desc: stepDescriptions[currentStep.value - 1],
  time: stepTimes[currentStep.value - 1]
}))

const stepProgress = computed(() => ((currentStep.value - 1) / 3) * 100)

const showDatePicker = ref(false)
const minDate = new Date(1960, 0, 1)
const maxDate = new Date(2008, 11, 31)
const datePickerValue = ref(['1995', '06', '15'])

function onDateConfirm({ selectedValues }) {
  const [year, month, day] = selectedValues
  form.birth_date = `${year}-${month}-${day}`
  form.birthDateText = `${year}年${month}月${day}日`
  showDatePicker.value = false
}

const showHeightPicker = ref(false)
const heightColumns = Array.from({ length: 61 }, (_, i) => ({
  text: `${140 + i} cm`,
  value: 140 + i
}))

function onHeightConfirm({ selectedOptions }) {
  form.height = selectedOptions[0].value
  form.heightText = selectedOptions[0].text
  showHeightPicker.value = false
}

const showEducationPicker = ref(false)
const educationColumns = EDUCATION_OPTIONS.map(item => ({ text: item, value: item }))

function onEducationConfirm({ selectedOptions }) {
  form.education = selectedOptions[0].value
  showEducationPicker.value = false
}

const showIncomePicker = ref(false)
const incomeColumns = INCOME_OPTIONS.map(item => ({ text: item, value: item }))

function onIncomeConfirm({ selectedOptions }) {
  form.income_range = selectedOptions[0].value
  showIncomePicker.value = false
}

const showMaritalPicker = ref(false)
const maritalColumns = MARITAL_STATUS_OPTIONS.map(item => ({ text: item, value: item }))

function onMaritalConfirm({ selectedOptions }) {
  form.marital_status = selectedOptions[0].value
  showMaritalPicker.value = false
}

function beforePhotoRead(file) {
  const isImage = file.type?.startsWith('image/')
  if (!isImage) {
    showToast('请上传图片文件')
    return false
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('图片大小不能超过5MB')
    return false
  }
  return true
}

function afterPhotoRead(file) {
  if (Array.isArray(file)) {
    file.forEach(f => { f.status = 'done' })
  } else {
    file.status = 'done'
  }
}

function validateStep1() {
  if (!form.nickname.trim()) {
    showToast('请输入昵称')
    return false
  }
  if (!form.gender) {
    showToast('请选择性别')
    return false
  }
  if (!form.birth_date) {
    showToast('请选择出生日期')
    return false
  }
  if (!form.city.trim()) {
    showToast('请输入所在城市')
    return false
  }
  return true
}

function validateStep2() {
  return true
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function nextStep() {
  if (currentStep.value === 1 && !validateStep1()) return
  if (currentStep.value === 2 && !validateStep2()) return
  currentStep.value++
}

function handleBack() {
  if (currentStep.value > 1) {
    currentStep.value--
  } else {
    router.back()
  }
}

async function handleSubmit() {
  submitting.value = true
  try {
    await userApi.updateProfile({
      nickname: form.nickname,
      gender: form.gender,
      birth_date: form.birth_date,
      city: form.city
    })

    await userApi.updateProfileDetail({
      height: form.height,
      education: form.education,
      occupation: form.occupation,
      income_range: form.income_range,
      marital_status: form.marital_status,
      self_intro: form.self_intro,
      partner_requirement: form.partner_requirement
    })

    for (const photo of photoList.value) {
      if (photo.file) {
        await userApi.uploadAvatar(photo.file)
      }
    }

    currentStep.value = 4
  } catch (err) {
    // handled by interceptor
  } finally {
    submitting.value = false
  }
}

function goHome() {
  router.replace('/user/home')
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  padding-bottom: calc(110px + env(safe-area-inset-bottom));
}

.register-shell {
  max-width: 1180px;
  margin: 0 auto;
}

.register-header {
  padding: max(env(safe-area-inset-top), 8px) 16px 0;
}

.register-brand-panel,
.register-progress-board,
.register-form-card,
.register-tip-card,
.register-upload-card {
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: var(--ifu-shadow-soft);
}

.register-brand-panel {
  margin-top: 10px;
  padding: 22px;
  background: linear-gradient(140deg, #8e6941, #bc9662 62%, #ecd9b9);
  color: #fffaf4;
  border: 0;
}

.register-brand-panel h1 {
  margin-top: 10px;
  font-size: 32px;
  line-height: 1.18;
}

.register-brand-panel p {
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.8;
  color: rgba(255, 250, 244, 0.86);
}

.register-brand-panel__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.register-brand-panel :deep(.brand-chip) {
  background: rgba(255, 250, 244, 0.16);
  border-color: rgba(255, 250, 244, 0.18);
  color: #fffaf4;
}

.register-progress-board {
  margin-top: 14px;
  padding: 18px;
}

.register-progress-board__meter {
  height: 10px;
  border-radius: 999px;
  background: rgba(200, 169, 119, 0.14);
  overflow: hidden;
}

.register-progress-board__meter-bar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--ifu-gold-700), #e5cfaa);
}

.register-progress-board__meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  color: var(--ifu-text);
  font-size: 12px;
}

.register-step-list {
  margin-top: 14px;
}

.register-step-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid rgba(233, 221, 204, 0.72);
}

.register-step-card:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.register-step-card__index {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: rgba(233, 221, 204, 0.9);
  color: var(--ifu-text);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
}

.register-step-card--active .register-step-card__index,
.register-step-card--done .register-step-card__index {
  background: linear-gradient(160deg, var(--ifu-gold-700), var(--ifu-gold-500));
  color: #fff;
}

.register-step-card__body strong {
  display: block;
  font-size: 17px;
  color: var(--ifu-text-strong);
}

.register-step-card__body p,
.register-tip-card p,
.register-form-card__header p,
.register-complete p {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.75;
  color: var(--ifu-text);
}

.register-step-card__status {
  color: var(--ifu-text-muted);
  font-size: 12px;
}

.register-content {
  display: grid;
  gap: 16px;
  padding: 16px;
}

.register-aside {
  display: grid;
  gap: 14px;
}

.register-tip-card {
  padding: 18px;
}

.register-tip-card h2,
.register-form-card__header h2,
.register-complete h2 {
  margin-top: 8px;
  font-size: 28px;
  color: var(--ifu-text-strong);
}

.register-tip-card--soft {
  background: linear-gradient(180deg, #fffaf3, #f7eddc);
}

.register-tip-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.register-form-card {
  padding: 20px 18px;
}

.register-form-card__header {
  margin-bottom: 16px;
}

.register-form__group {
  overflow: hidden;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255, 250, 243, 0.86), rgba(255, 255, 255, 0.92));
}

.register-form-card :deep(.van-field),
.register-form-card :deep(.van-cell) {
  background: transparent;
}

.register-form-card :deep(.van-field__label),
.register-form-card :deep(.van-cell__title) {
  color: var(--ifu-text);
}

.register-form-card :deep(.van-field__control) {
  color: var(--ifu-text-strong);
}

.register-radio-cell {
  min-height: 56px;
}

.register-upload-card {
  margin-top: 16px;
  padding: 18px;
  background: linear-gradient(180deg, #fffaf3, #f7eddc);
}

.register-upload-card__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
}

.register-upload-card__head strong {
  display: block;
  margin-top: 8px;
  font-size: 22px;
  color: var(--ifu-text-strong);
}

.register-upload-card__head span:last-child {
  color: var(--ifu-text-muted);
  font-size: 12px;
}

.register-upload-card__tips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0 14px;
}

.register-form-card--complete {
  display: grid;
  place-items: center;
  min-height: 360px;
}

.register-complete {
  max-width: 360px;
  text-align: center;
}

.register-footer {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: calc(10px + env(safe-area-inset-bottom));
  z-index: 8;
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  gap: 10px;
  padding: 10px;
  border-radius: 24px;
  border: 1px solid rgba(233, 221, 204, 0.96);
  background: rgba(251, 247, 241, 0.94);
  box-shadow: var(--ifu-shadow-float);
  backdrop-filter: blur(18px);
}

.register-footer__btn {
  min-height: 46px;
}

.register-footer__btn--full {
  grid-column: 1 / -1;
}

.register-footer__btn--prev {
  background: rgba(255, 255, 255, 0.78);
  border-color: rgba(219, 199, 173, 0.78);
}

@media (min-width: 960px) {
  .register-content {
    grid-template-columns: 320px 1fr;
    align-items: start;
  }

  .register-shell {
    padding-bottom: 20px;
  }

  .register-footer {
    left: max(24px, calc(50% - 560px));
    right: max(24px, calc(50% - 560px));
  }
}
</style>
