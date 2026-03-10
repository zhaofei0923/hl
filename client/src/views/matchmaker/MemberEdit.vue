<template>
  <div class="page">
    <van-nav-bar title="编辑会员资料" left-arrow @click-left="$router.back()" />

    <van-loading v-if="loading" class="page-loading" size="24px" vertical>加载中...</van-loading>

    <van-form v-if="!loading" ref="formRef" @submit="handleSubmit">
      <!-- 基础信息 -->
      <div class="section-title">基本信息</div>
      <van-cell-group inset>
        <van-field
          v-model="form.realName"
          name="realName"
          label="姓名"
          placeholder="请输入真实姓名"
        />
        <van-field
          v-model="form.phone"
          name="phone"
          label="手机号"
          type="tel"
          disabled
          placeholder="手机号不可修改"
        />
        <van-field name="gender" label="性别">
          <template #input>
            <van-radio-group v-model="form.gender" direction="horizontal">
              <van-radio :name="1">男</van-radio>
              <van-radio :name="2">女</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field
          v-model="form.age"
          name="age"
          label="年龄"
          is-link
          readonly
          placeholder="请选择年龄"
          @click="showAgePicker = true"
        />
        <van-field
          v-model="form.constellation"
          name="constellation"
          label="星座"
          is-link
          readonly
          placeholder="请选择星座"
          @click="showConstellationPicker = true"
        />
        <van-field
          v-model="form.height"
          name="height"
          label="身高(cm)"
          is-link
          readonly
          placeholder="请选择身高"
          @click="showHeightPicker = true"
        />
        <van-field
          v-model="form.education"
          name="education"
          label="学历"
          is-link
          readonly
          placeholder="请选择学历"
          @click="showEducationPicker = true"
        />
        <van-field
          v-model="form.city"
          name="city"
          label="常住地/工作地"
          placeholder="如：成都"
        />
        <van-field
          v-model="form.nativePlace"
          name="nativePlace"
          label="祖籍"
          placeholder="如：黑龙江"
        />
        <van-field
          v-model="form.occupation"
          name="occupation"
          label="职业"
          placeholder="如：外企高管 医药行业"
        />
        <van-field
          v-model="form.incomeRange"
          name="incomeRange"
          label="收入"
          is-link
          readonly
          placeholder="请选择收入范围"
          @click="showIncomePicker = true"
        />
        <van-field
          v-model="form.maritalStatus"
          name="maritalStatus"
          label="婚姻情况"
          is-link
          readonly
          placeholder="请选择婚姻状况"
          @click="showMaritalPicker = true"
        />
        <van-field
          v-model="form.houseStatus"
          name="houseStatus"
          label="是否有房"
          is-link
          readonly
          placeholder="请选择"
          @click="showHousePicker = true"
        />
        <van-field
          v-model="form.carStatus"
          name="carStatus"
          label="是否有车"
          is-link
          readonly
          placeholder="请选择"
          @click="showCarPicker = true"
        />
      </van-cell-group>

      <!-- 详细信息 -->
      <div class="section-title">详细介绍</div>
      <van-cell-group inset>
        <van-field
          v-model="form.selfIntro"
          name="selfIntro"
          label="自我介绍"
          type="textarea"
          rows="3"
          autosize
          placeholder="请填写自我介绍"
        />
        <van-field
          v-model="form.partnerRequirement"
          name="partnerRequirement"
          label="择偶要求"
          type="textarea"
          rows="3"
          autosize
          placeholder="请填写择偶要求"
        />
      </van-cell-group>

      <!-- 会员照片 -->
      <div class="section-title">会员照片</div>
      <van-cell-group inset>
        <van-field name="photos" label="上传照片">
          <template #input>
            <van-uploader
              v-model="fileList"
              :after-read="afterReadPhoto"
              :max-count="3"
              :max-size="20 * 1024 * 1024"
              @oversize="onOversize"
              @delete="onDeletePhoto"
              multiple
            />
          </template>
        </van-field>
      </van-cell-group>

      <!-- 会员设置 -->
      <div class="section-title">会员设置</div>
      <van-cell-group inset>
        <van-field
          v-model="form.memberTypeLabel"
          name="memberType"
          label="会员类型"
          is-link
          readonly
          placeholder="请选择会员类型"
          @click="showMemberTypePicker = true"
        />
        <van-field
          v-model="form.remark"
          name="remark"
          label="备注"
          type="textarea"
          rows="2"
          autosize
          placeholder="内部备注（不对会员展示）"
        />
      </van-cell-group>

      <div class="form-footer">
        <van-button
          block
          round
          type="primary"
          native-type="submit"
          :loading="submitting"
          loading-text="保存中..."
        >
          保存修改
        </van-button>
      </div>
    </van-form>

    <!-- 年龄选择器 -->
    <van-popup v-model:show="showAgePicker" position="bottom" round>
      <van-picker :columns="ageOptions" @confirm="onAgeConfirm" @cancel="showAgePicker = false" title="选择年龄" />
    </van-popup>

    <!-- 星座选择器 -->
    <van-popup v-model:show="showConstellationPicker" position="bottom" round>
      <van-picker :columns="constellationOptions" @confirm="onConstellationConfirm" @cancel="showConstellationPicker = false" title="选择星座" />
    </van-popup>

    <!-- 身高选择器 -->
    <van-popup v-model:show="showHeightPicker" position="bottom" round>
      <van-picker :columns="heightOptions" @confirm="onHeightConfirm" @cancel="showHeightPicker = false" title="选择身高" />
    </van-popup>

    <!-- 学历选择器 -->
    <van-popup v-model:show="showEducationPicker" position="bottom" round>
      <van-picker :columns="educationOptions" @confirm="onEducationConfirm" @cancel="showEducationPicker = false" title="选择学历" />
    </van-popup>

    <!-- 收入选择器 -->
    <van-popup v-model:show="showIncomePicker" position="bottom" round>
      <van-picker :columns="incomeOptions" @confirm="onIncomeConfirm" @cancel="showIncomePicker = false" title="选择收入范围" />
    </van-popup>

    <!-- 婚姻状况选择器 -->
    <van-popup v-model:show="showMaritalPicker" position="bottom" round>
      <van-picker :columns="maritalOptions" @confirm="onMaritalConfirm" @cancel="showMaritalPicker = false" title="选择婚姻状况" />
    </van-popup>

    <!-- 是否有房选择器 -->
    <van-popup v-model:show="showHousePicker" position="bottom" round>
      <van-picker :columns="houseOptions" @confirm="onHouseConfirm" @cancel="showHousePicker = false" title="是否有房" />
    </van-popup>

    <!-- 是否有车选择器 -->
    <van-popup v-model:show="showCarPicker" position="bottom" round>
      <van-picker :columns="carOptions" @confirm="onCarConfirm" @cancel="showCarPicker = false" title="是否有车" />
    </van-popup>

    <!-- 会员类型选择器 -->
    <van-popup v-model:show="showMemberTypePicker" position="bottom" round>
      <van-picker :columns="memberTypeOptions" @confirm="onMemberTypeConfirm" @cancel="showMemberTypePicker = false" title="选择会员类型" />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showSuccessToast, showFailToast, showToast } from 'vant'
import { memberApi } from '@/api/member'

const route = useRoute()
const router = useRouter()
const memberId = route.params.id
const formRef = ref(null)
const loading = ref(true)
const submitting = ref(false)
const fileList = ref([])

const showAgePicker = ref(false)
const showConstellationPicker = ref(false)
const showHeightPicker = ref(false)
const showEducationPicker = ref(false)
const showIncomePicker = ref(false)
const showMaritalPicker = ref(false)
const showHousePicker = ref(false)
const showCarPicker = ref(false)
const showMemberTypePicker = ref(false)

const form = reactive({
  realName: '',
  phone: '',
  gender: null,
  age: '',
  constellation: '',
  height: '',
  education: '',
  city: '',
  nativePlace: '',
  occupation: '',
  incomeRange: '',
  maritalStatus: '',
  houseStatus: '',
  carStatus: '',
  selfIntro: '',
  partnerRequirement: '',
  memberType: 'no_consumption',
  memberTypeLabel: '无消费',
  remark: ''
})

const memberTypeMap = {
  no_consumption: '无消费',
  member: '会员',
  manual_match: '人工牵线'
}

async function loadMember() {
  try {
    const res = await memberApi.getDetail(memberId)
    const m = res.data
    form.realName = m.realName || m.nickname || ''
    form.phone = m.phone || ''
    form.gender = m.gender || null
    form.age = m.age ? String(m.age) : ''
    form.height = m.height ? String(m.height) : ''
    form.education = m.education || ''
    form.city = m.city || ''
    form.nativePlace = m.nativePlace || m.hometown || ''
    form.occupation = m.occupation || ''
    form.incomeRange = m.incomeRange || m.income || ''
    form.maritalStatus = m.maritalStatus || ''
    form.houseStatus = m.houseStatus || ''
    form.carStatus = m.carStatus || ''
    form.selfIntro = m.selfIntro || ''
    form.partnerRequirement = m.partnerRequirement || ''
    form.memberType = m.memberType || 'no_consumption'
    form.memberTypeLabel = memberTypeMap[m.memberType] || '无消费'

    // Extract constellation from remark
    const remarkStr = m.remark || ''
    const constellationMatch = remarkStr.match(/星座[：:]\s*([^\s|]+)/)
    form.constellation = constellationMatch ? constellationMatch[1] : ''
    // Extract non-constellation part of remark
    form.remark = remarkStr.replace(/星座[：:]\s*[^\s|]+\s*\|?\s*/, '').trim()

    // Load existing photos
    if (m.photos && m.photos.length) {
      fileList.value = m.photos.map(url => ({ url, status: 'done' }))
    }
  } catch (err) {
    showFailToast('加载会员信息失败')
  } finally {
    loading.value = false
  }
}

const ageOptions = Array.from({ length: 63 }, (_, i) => ({
  text: `${i + 18}岁`,
  value: String(i + 18)
}))

const constellationOptions = [
  { text: '白羊', value: '白羊' },
  { text: '金牛', value: '金牛' },
  { text: '双子', value: '双子' },
  { text: '巨蟹', value: '巨蟹' },
  { text: '狮子', value: '狮子' },
  { text: '处女', value: '处女' },
  { text: '天秤', value: '天秤' },
  { text: '天蝎', value: '天蝎' },
  { text: '射手', value: '射手' },
  { text: '摩羯', value: '摩羯' },
  { text: '水瓶', value: '水瓶' },
  { text: '双鱼', value: '双鱼' }
]

const heightOptions = Array.from({ length: 61 }, (_, i) => ({
  text: `${i + 140}cm`,
  value: String(i + 140)
}))

const educationOptions = [
  { text: '高中及以下', value: '高中及以下' },
  { text: '专科', value: '专科' },
  { text: '本科', value: '本科' },
  { text: '硕士', value: '硕士' },
  { text: '博士', value: '博士' },
  { text: '其他', value: '其他' }
]

const incomeOptions = [
  { text: '5万以下', value: '5万以下' },
  { text: '5-10万', value: '5-10万' },
  { text: '10-20万', value: '10-20万' },
  { text: '20-50万', value: '20-50万' },
  { text: '50-100万', value: '50-100万' },
  { text: '100万+', value: '100万+' }
]

const maritalOptions = [
  { text: '未婚', value: '未婚' },
  { text: '离异', value: '离异' },
  { text: '丧偶', value: '丧偶' }
]

const houseOptions = [
  { text: '有', value: '有' },
  { text: '无', value: '无' },
  { text: '按揭中', value: '按揭中' }
]

const carOptions = [
  { text: '有', value: '有' },
  { text: '无', value: '无' }
]

const memberTypeOptions = [
  { text: '无消费', value: 'no_consumption' },
  { text: '会员', value: 'member' },
  { text: '人工牵线', value: 'manual_match' }
]

function onAgeConfirm({ selectedOptions }) {
  form.age = selectedOptions[0]?.value || ''
  showAgePicker.value = false
}
function onConstellationConfirm({ selectedOptions }) {
  form.constellation = selectedOptions[0]?.value || ''
  showConstellationPicker.value = false
}
function onHeightConfirm({ selectedOptions }) {
  form.height = selectedOptions[0]?.value || ''
  showHeightPicker.value = false
}
function onEducationConfirm({ selectedOptions }) {
  form.education = selectedOptions[0]?.value || ''
  showEducationPicker.value = false
}
function onIncomeConfirm({ selectedOptions }) {
  form.incomeRange = selectedOptions[0]?.value || ''
  showIncomePicker.value = false
}
function onMaritalConfirm({ selectedOptions }) {
  form.maritalStatus = selectedOptions[0]?.value || ''
  showMaritalPicker.value = false
}
function onHouseConfirm({ selectedOptions }) {
  form.houseStatus = selectedOptions[0]?.value || ''
  showHousePicker.value = false
}
function onCarConfirm({ selectedOptions }) {
  form.carStatus = selectedOptions[0]?.value || ''
  showCarPicker.value = false
}
function onMemberTypeConfirm({ selectedOptions }) {
  const opt = selectedOptions[0]
  form.memberType = opt?.value || 'no_consumption'
  form.memberTypeLabel = opt?.text || '无消费'
  showMemberTypePicker.value = false
}

async function afterReadPhoto(file) {
  const files = Array.isArray(file) ? file : [file]
  for (const f of files) {
    f.status = 'uploading'
    f.message = '上传中...'
    try {
      const formData = new FormData()
      formData.append('photo', f.file)
      const res = await memberApi.uploadPhoto(formData)
      f.status = 'done'
      f.message = ''
      f.url = res.data?.url || res.url
    } catch {
      f.status = 'failed'
      f.message = '上传失败'
    }
  }
}

function onOversize() {
  showToast('图片大小不能超过 20MB')
}

function onDeletePhoto() {
  // fileList is automatically updated by van-uploader
}

async function handleSubmit() {
  submitting.value = true
  try {
    const payload = {
      realName: form.realName || undefined,
      gender: form.gender,
      age: form.age ? Number(form.age) : null,
      constellation: form.constellation || '',
      height: form.height ? Number(form.height) : null,
      education: form.education || null,
      city: form.city || null,
      nativePlace: form.nativePlace || null,
      occupation: form.occupation || null,
      incomeRange: form.incomeRange || null,
      maritalStatus: form.maritalStatus || null,
      houseStatus: form.houseStatus || null,
      carStatus: form.carStatus || null,
      selfIntro: form.selfIntro || null,
      partnerRequirement: form.partnerRequirement || null,
      memberType: form.memberType,
      remark: form.remark || '',
      photos: fileList.value
        .filter(f => f.status === 'done' && f.url)
        .map(f => f.url)
    }
    await memberApi.updateProfile(memberId, payload)
    showSuccessToast('资料更新成功')
    router.back()
  } catch (err) {
    showFailToast(err?.response?.data?.message || err?.message || '保存失败，请重试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadMember()
})
</script>

<style scoped>
.page-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.section-title {
  padding: 16px 16px 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--hl-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-footer {
  padding: 24px 16px calc(24px + env(safe-area-inset-bottom));
}

:deep(.van-cell-group--inset) {
  margin: 0 16px;
}

:deep(.van-field__label) {
  width: 90px;
}
</style>
