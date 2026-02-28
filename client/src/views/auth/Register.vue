<template>
  <div class="page register-page">
    <!-- 顶部进度条 -->
    <div class="register-header">
      <van-nav-bar
        title="完善资料"
        left-arrow
        @click-left="handleBack"
        :border="false"
      />
      <div class="register-steps">
        <div
          v-for="step in 4"
          :key="step"
          class="register-steps__item"
          :class="{ 'register-steps__item--active': currentStep >= step, 'register-steps__item--done': currentStep > step }"
        >
          <div class="register-steps__dot">
            <van-icon v-if="currentStep > step" name="success" size="12" color="#fff" />
            <span v-else>{{ step }}</span>
          </div>
          <span class="register-steps__label">{{ stepLabels[step - 1] }}</span>
        </div>
        <div class="register-steps__line">
          <div class="register-steps__line-progress" :style="{ width: `${((currentStep - 1) / 3) * 100}%` }"></div>
        </div>
      </div>
    </div>

    <!-- 步骤1: 基本信息 -->
    <div v-show="currentStep === 1" class="register-form">
      <div class="register-form__title">基本信息</div>
      <div class="register-form__desc">请填写您的基本信息，方便为您匹配合适的对象</div>

      <van-cell-group :border="false" class="register-form__group">
        <van-field
          v-model="form.nickname"
          label="昵称"
          placeholder="请输入昵称"
          maxlength="20"
          clearable
          :rules="[{ required: true, message: '请输入昵称' }]"
        />
        <van-cell title="性别" required :border="false">
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
    </div>

    <!-- 步骤2: 详细资料 -->
    <div v-show="currentStep === 2" class="register-form">
      <div class="register-form__title">详细资料</div>
      <div class="register-form__desc">完善更多资料，获得更精准的匹配推荐</div>

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
    </div>

    <!-- 步骤3: 自我介绍 -->
    <div v-show="currentStep === 3" class="register-form">
      <div class="register-form__title">自我介绍</div>
      <div class="register-form__desc">让对方更了解你，提高匹配成功率</div>

      <van-cell-group :border="false" class="register-form__group">
        <van-field
          v-model="form.self_intro"
          type="textarea"
          label="关于我"
          placeholder="介绍一下你自己，比如性格、兴趣爱好、生活状态等"
          :autosize="{ minHeight: 80, maxHeight: 160 }"
          maxlength="500"
          show-word-limit
        />
        <van-field
          v-model="form.partner_requirement"
          type="textarea"
          label="理想对象"
          placeholder="描述一下你理想中的另一半"
          :autosize="{ minHeight: 80, maxHeight: 160 }"
          maxlength="500"
          show-word-limit
        />
      </van-cell-group>

      <div class="register-form__upload-section">
        <div class="register-form__upload-title">
          <span>个人照片</span>
          <span class="register-form__upload-tip">最多上传6张</span>
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
    </div>

    <!-- 步骤4: 完成 -->
    <div v-show="currentStep === 4" class="register-form register-form--complete">
      <div class="register-complete">
        <van-icon name="checked" size="64" color="var(--hl-primary-color)" />
        <div class="register-complete__title">资料填写完成</div>
        <div class="register-complete__desc">系统将根据您的资料为您推荐合适的对象</div>
      </div>
    </div>

    <!-- 底部按钮 -->
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

    <!-- 日期选择器 -->
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

    <!-- 身高选择器 -->
    <van-popup v-model:show="showHeightPicker" position="bottom" round>
      <van-picker
        title="选择身高"
        :columns="heightColumns"
        @confirm="onHeightConfirm"
        @cancel="showHeightPicker = false"
      />
    </van-popup>

    <!-- 学历选择器 -->
    <van-popup v-model:show="showEducationPicker" position="bottom" round>
      <van-picker
        title="选择学历"
        :columns="educationColumns"
        @confirm="onEducationConfirm"
        @cancel="showEducationPicker = false"
      />
    </van-popup>

    <!-- 收入选择器 -->
    <van-popup v-model:show="showIncomePicker" position="bottom" round>
      <van-picker
        title="选择月收入"
        :columns="incomeColumns"
        @confirm="onIncomeConfirm"
        @cancel="showIncomePicker = false"
      />
    </van-popup>

    <!-- 婚姻状况选择器 -->
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
const currentStep = ref(1)
const submitting = ref(false)

// 表单数据
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

// 日期选择器
const showDatePicker = ref(false)
const minDate = new Date(1960, 0, 1)
const maxDate = new Date(2008, 11, 31)
const currentYear = new Date().getFullYear()
const datePickerValue = ref([String(1995), '06', '15'])

function onDateConfirm({ selectedValues }) {
  const [year, month, day] = selectedValues
  form.birth_date = `${year}-${month}-${day}`
  form.birthDateText = `${year}年${month}月${day}日`
  showDatePicker.value = false
}

// 身高选择器
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

// 学历选择器
const showEducationPicker = ref(false)
const educationColumns = EDUCATION_OPTIONS.map(item => ({ text: item, value: item }))

function onEducationConfirm({ selectedOptions }) {
  form.education = selectedOptions[0].value
  showEducationPicker.value = false
}

// 收入选择器
const showIncomePicker = ref(false)
const incomeColumns = INCOME_OPTIONS.map(item => ({ text: item, value: item }))

function onIncomeConfirm({ selectedOptions }) {
  form.income_range = selectedOptions[0].value
  showIncomePicker.value = false
}

// 婚姻状况选择器
const showMaritalPicker = ref(false)
const maritalColumns = MARITAL_STATUS_OPTIONS.map(item => ({ text: item, value: item }))

function onMaritalConfirm({ selectedOptions }) {
  form.marital_status = selectedOptions[0].value
  showMaritalPicker.value = false
}

// 照片上传
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

// 步骤验证
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
  // 步骤2的字段为选填，不做强制校验
  return true
}

function validateStep3() {
  // 步骤3的字段为选填
  return true
}

// 导航
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

// 提交注册
async function handleSubmit() {
  submitting.value = true
  try {
    // 提交基本信息
    await userApi.updateProfile({
      nickname: form.nickname,
      gender: form.gender,
      birth_date: form.birth_date,
      city: form.city
    })

    // 提交详细资料
    await userApi.updateProfileDetail({
      height: form.height,
      education: form.education,
      occupation: form.occupation,
      income_range: form.income_range,
      marital_status: form.marital_status,
      self_intro: form.self_intro,
      partner_requirement: form.partner_requirement
    })

    // 上传照片
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
  background: var(--hl-bg-color);
  min-height: 100vh;
  padding-bottom: 100px;
}

.register-header {
  background: var(--hl-card-bg);
}

.register-steps {
  position: relative;
  display: flex;
  justify-content: space-between;
  padding: 16px 32px 24px;
}

.register-steps__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
  z-index: 1;
}

.register-steps__dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--hl-border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--hl-text-secondary);
  transition: all 0.3s;
}

.register-steps__item--active .register-steps__dot {
  background: var(--hl-primary-color);
  color: #fff;
}

.register-steps__item--done .register-steps__dot {
  background: var(--hl-primary-color);
  color: #fff;
}

.register-steps__label {
  font-size: 11px;
  color: var(--hl-text-placeholder);
  white-space: nowrap;
}

.register-steps__item--active .register-steps__label {
  color: var(--hl-primary-color);
  font-weight: 500;
}

.register-steps__item--done .register-steps__label {
  color: var(--hl-primary-color);
}

.register-steps__line {
  position: absolute;
  top: 28px;
  left: 52px;
  right: 52px;
  height: 2px;
  background: var(--hl-border-color);
}

.register-steps__line-progress {
  height: 100%;
  background: var(--hl-primary-color);
  transition: width 0.3s;
}

.register-form {
  padding: 20px 16px;
}

.register-form__title {
  font-size: 20px;
  font-weight: 600;
  color: var(--hl-text-primary);
  margin-bottom: 6px;
}

.register-form__desc {
  font-size: 13px;
  color: var(--hl-text-secondary);
  margin-bottom: 20px;
}

.register-form__group {
  background: var(--hl-card-bg);
  border-radius: var(--hl-radius-md);
  overflow: hidden;
}

.register-form__group :deep(.van-field) {
  padding: 14px 16px;
}

.register-form__group :deep(.van-cell) {
  padding: 14px 16px;
}

.register-form__upload-section {
  margin-top: 20px;
  background: var(--hl-card-bg);
  border-radius: var(--hl-radius-md);
  padding: 16px;
}

.register-form__upload-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: var(--hl-text-primary);
  margin-bottom: 12px;
}

.register-form__upload-tip {
  font-size: 12px;
  color: var(--hl-text-secondary);
}

.register-form--complete {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.register-complete {
  text-align: center;
}

.register-complete__title {
  font-size: 20px;
  font-weight: 600;
  color: var(--hl-text-primary);
  margin-top: 20px;
  margin-bottom: 8px;
}

.register-complete__desc {
  font-size: 14px;
  color: var(--hl-text-secondary);
}

.register-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: var(--hl-card-bg);
  display: flex;
  gap: 12px;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.04);
}

.register-footer__btn {
  flex: 1;
  height: 44px;
  font-size: 16px;
}

.register-footer__btn--prev {
  flex: 0 0 auto;
  width: 100px;
  color: var(--hl-text-secondary);
  border-color: var(--hl-border-color);
}

.register-footer__btn--full {
  flex: 1;
}
</style>
