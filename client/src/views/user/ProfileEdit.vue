<template>
  <div class="page utility-page utility-page--form profile-edit-page">
    <van-nav-bar
      title="编辑资料"
      left-arrow
      @click-left="$router.back()"
      :border="false"
    >
      <template #right>
        <span class="nav-save-btn" @click="handleSave">保存</span>
      </template>
    </van-nav-bar>

    <section class="card utility-hero" data-testid="user-profile-edit-shell">
      <div class="utility-hero__top">
        <div>
          <span class="brand-label">PROFILE EDIT</span>
          <h1>把资料维护做成清楚可控的形象更新流程</h1>
          <p>头像、基础资料、生活方式和婚恋观应该在同一页完整呈现，方便你持续优化展示效果。</p>
        </div>
        <span class="brand-chip brand-chip--active">资料维护</span>
      </div>
      <div class="utility-hero__chips">
        <span class="brand-chip">头像更新</span>
        <span class="brand-chip">基础信息</span>
        <span class="brand-chip">婚恋偏好</span>
      </div>
    </section>

    <div v-if="loading" class="profile-edit-loading">
      <van-loading type="spinner" color="var(--hl-primary-color)" />
    </div>

    <template v-else>
      <!-- 头像区域 -->
      <div class="profile-edit-avatar">
        <div class="profile-edit-avatar__wrapper" @click="chooseAvatar">
          <van-image
            round
            width="80"
            height="80"
            :src="form.avatarUrl || defaultAvatar"
            fit="cover"
            class="profile-edit-avatar__img"
          />
          <div class="profile-edit-avatar__overlay">
            <van-icon name="photograph" size="20" color="#fff" />
          </div>
        </div>
        <span class="profile-edit-avatar__tip">点击更换头像</span>
        <van-uploader
          ref="avatarUploaderRef"
          :after-read="onAvatarRead"
          :before-read="beforeAvatarRead"
          :max-count="1"
          style="display: none"
        />
      </div>

      <!-- 基本信息 -->
      <div class="profile-edit-section">
        <div class="profile-edit-section__title">基本信息</div>
        <van-cell-group :border="false" class="profile-edit-section__group">
          <van-field
            v-model="form.nickname"
            label="昵称"
            placeholder="请输入昵称"
            maxlength="20"
            clearable
          />
          <van-cell title="性别" :value="genderText" />
          <van-cell
            title="出生日期"
            :value="form.birthDateText || '请选择'"
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

      <!-- 详细资料 -->
      <div class="profile-edit-section">
        <div class="profile-edit-section__title">详细资料</div>
        <van-cell-group :border="false" class="profile-edit-section__group">
          <van-cell
            title="身高"
            :value="form.heightText || '请选择'"
            is-link
            @click="showHeightPicker = true"
          />
          <van-cell
            title="学历"
            :value="form.education || '请选择'"
            is-link
            @click="showEducationPicker = true"
          />
          <van-field
            v-model="form.occupation"
            label="职业"
            placeholder="请输入您的职业"
            clearable
          />
          <van-cell
            title="月收入"
            :value="form.income_range || '请选择'"
            is-link
            @click="showIncomePicker = true"
          />
          <van-cell
            title="婚姻状况"
            :value="form.marital_status || '请选择'"
            is-link
            @click="showMaritalPicker = true"
          />
        </van-cell-group>
      </div>

      <!-- 个人介绍 -->
      <div class="profile-edit-section">
        <div class="profile-edit-section__title">个人介绍</div>
        <van-cell-group :border="false" class="profile-edit-section__group">
          <van-field
            v-model="form.self_intro"
            type="textarea"
            label="自我介绍"
            placeholder="介绍一下你自己，比如性格、兴趣爱好、生活状态等"
            :autosize="{ minHeight: 80, maxHeight: 160 }"
            maxlength="500"
            show-word-limit
          />
          <van-field
            v-model="form.partner_requirement"
            type="textarea"
            label="择偶要求"
            placeholder="描述一下你理想中的另一半"
            :autosize="{ minHeight: 80, maxHeight: 160 }"
            maxlength="500"
            show-word-limit
          />
        </van-cell-group>
      </div>
    </template>

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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { userApi } from '@/api/user'
import { EDUCATION_OPTIONS, MARITAL_STATUS_OPTIONS, INCOME_OPTIONS, GENDER_TEXT } from '@/utils/constants'
import { calcAge, formatDate } from '@/utils/format'

const router = useRouter()

const loading = ref(true)
const saving = ref(false)
const avatarUploaderRef = ref(null)

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI0MCIgY3k9IjQwIiByPSI0MCIgZmlsbD0iI0UwRTBFMCIvPjxwYXRoIGQ9Ik00MCAyNGExMiAxMiAwIDEgMCAwIDI0IDEyIDEyIDAgMCAwIDAtMjR6bTAgMzBjLTExLjA1IDAtMjAgNC40Ny0yMCAxMHYyaDQwdi0yYzAtNS41My04Ljk1LTEwLTIwLTEweiIgZmlsbD0iI0EwQTBBMCIvPjwvc3ZnPg=='

// 表单数据
const form = reactive({
  avatarUrl: '',
  nickname: '',
  gender: 0,
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

const genderText = computed(() => GENDER_TEXT[form.gender] || '未设置')

// 日期选择器
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

// 头像上传
function chooseAvatar() {
  avatarUploaderRef.value?.chooseFile()
}

function beforeAvatarRead(file) {
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

async function onAvatarRead(file) {
  const toast = showLoadingToast({ message: '上传中...', forbidClick: true, duration: 0 })
  try {
    const res = await userApi.uploadAvatar(file.file)
    form.avatarUrl = res.data?.avatarUrl || file.content
    showToast('头像更新成功')
  } catch (err) {
    // handled by interceptor
  } finally {
    closeToast()
  }
}

// 加载用户资料
async function fetchProfile() {
  loading.value = true
  try {
    const res = await userApi.getProfile()
    const data = res.data || {}
    form.avatarUrl = data.avatarUrl || ''
    form.nickname = data.nickname || ''
    form.gender = data.gender || 0
    form.city = data.city || ''
    form.occupation = data.occupation || ''
    form.education = data.education || ''
    form.income_range = data.income_range || ''
    form.marital_status = data.marital_status || ''
    form.self_intro = data.self_intro || ''
    form.partner_requirement = data.partner_requirement || ''

    // 处理出生日期
    if (data.birth_date) {
      form.birth_date = data.birth_date
      const d = new Date(data.birth_date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      form.birthDateText = `${year}年${month}月${day}日`
      datePickerValue.value = [String(year), month, day]
    }

    // 处理身高
    if (data.height) {
      form.height = data.height
      form.heightText = `${data.height} cm`
    }
  } catch (err) {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

// 保存资料
async function handleSave() {
  if (!form.nickname.trim()) {
    showToast('请输入昵称')
    return
  }

  const toast = showLoadingToast({ message: '保存中...', forbidClick: true, duration: 0 })
  try {
    await userApi.updateProfileDetail({
      nickname: form.nickname,
      birth_date: form.birth_date,
      city: form.city,
      height: form.height,
      education: form.education,
      occupation: form.occupation,
      income_range: form.income_range,
      marital_status: form.marital_status,
      self_intro: form.self_intro,
      partner_requirement: form.partner_requirement
    })
    closeToast()
    showToast('保存成功')
    setTimeout(() => {
      router.back()
    }, 500)
  } catch (err) {
    closeToast()
    // handled by interceptor
  }
}

onMounted(() => {
  fetchProfile()
})
</script>

<style scoped>
.profile-edit-page {
  background: var(--hl-bg-color);
  min-height: 100vh;
  padding-bottom: 24px;
}

.nav-save-btn {
  color: var(--hl-primary-color);
  font-size: 15px;
  font-weight: 500;
}

.profile-edit-loading {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.profile-edit-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px 16px;
}

.profile-edit-avatar__wrapper {
  position: relative;
  cursor: pointer;
}

.profile-edit-avatar__img {
  border: 3px solid #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.profile-edit-avatar__overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--hl-primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
}

.profile-edit-avatar__tip {
  font-size: 12px;
  color: var(--hl-text-secondary);
  margin-top: 8px;
}

.profile-edit-section {
  margin-top: 12px;
}

.profile-edit-section__title {
  font-size: 14px;
  font-weight: 500;
  color: var(--hl-text-secondary);
  padding: 0 16px;
  margin-bottom: 8px;
}

.profile-edit-section__group {
  background: var(--hl-card-bg);
  border-radius: var(--hl-radius-md);
  margin: 0 16px;
  overflow: hidden;
}

.profile-edit-section__group :deep(.van-field) {
  padding: 14px 16px;
}

.profile-edit-section__group :deep(.van-cell) {
  padding: 14px 16px;
}

.profile-edit-section__group :deep(.van-cell__value) {
  color: var(--hl-text-primary);
}
</style>
