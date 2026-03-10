<template>
  <div class="page">
    <van-nav-bar title="手动录入会员" left-arrow @click-left="$router.back()" />

    <van-form ref="formRef" @submit="handleSubmit">
      <!-- 基础信息 -->
      <div class="section-title">基本信息</div>
      <van-cell-group inset>
        <van-field
          v-model="form.realName"
          name="realName"
          label="姓名"
          placeholder="请输入真实姓名"
          :rules="[{ required: true, message: '请填写姓名' }]"
        />
        <van-field
          v-model="form.phone"
          name="phone"
          label="手机号"
          type="tel"
          placeholder="请输入手机号"
          :rules="[
            { required: true, message: '请填写手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
          ]"
        />
        <van-field name="gender" label="性别" :rules="[{ required: true, message: '请选择性别' }]">
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
          type="number"
          placeholder="请输入年龄"
        />
        <van-field
          v-model="form.constellation"
          name="constellation"
          label="星座"
          placeholder="如：双鱼座"
        />
        <van-field
          v-model="form.height"
          name="height"
          label="身高(cm)"
          type="number"
          placeholder="如：178"
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
          v-model="form.familySituation"
          name="familySituation"
          label="家庭情况"
          type="textarea"
          rows="3"
          autosize
          placeholder="请描述家庭情况"
        />
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
              :max-count="9"
              :max-size="5 * 1024 * 1024"
              @oversize="onOversize"
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
          loading-text="录入中..."
        >
          确认录入
        </van-button>
      </div>
    </van-form>

    <!-- 学历选择器 -->
    <van-popup v-model:show="showEducationPicker" position="bottom" round>
      <van-picker
        :columns="educationOptions"
        @confirm="onEducationConfirm"
        @cancel="showEducationPicker = false"
        title="选择学历"
      />
    </van-popup>

    <!-- 收入选择器 -->
    <van-popup v-model:show="showIncomePicker" position="bottom" round>
      <van-picker
        :columns="incomeOptions"
        @confirm="onIncomeConfirm"
        @cancel="showIncomePicker = false"
        title="选择收入范围"
      />
    </van-popup>

    <!-- 婚姻状况选择器 -->
    <van-popup v-model:show="showMaritalPicker" position="bottom" round>
      <van-picker
        :columns="maritalOptions"
        @confirm="onMaritalConfirm"
        @cancel="showMaritalPicker = false"
        title="选择婚姻状况"
      />
    </van-popup>

    <!-- 是否有房选择器 -->
    <van-popup v-model:show="showHousePicker" position="bottom" round>
      <van-picker
        :columns="houseOptions"
        @confirm="onHouseConfirm"
        @cancel="showHousePicker = false"
        title="是否有房"
      />
    </van-popup>

    <!-- 是否有车选择器 -->
    <van-popup v-model:show="showCarPicker" position="bottom" round>
      <van-picker
        :columns="carOptions"
        @confirm="onCarConfirm"
        @cancel="showCarPicker = false"
        title="是否有车"
      />
    </van-popup>

    <!-- 会员类型选择器 -->
    <van-popup v-model:show="showMemberTypePicker" position="bottom" round>
      <van-picker
        :columns="memberTypeOptions"
        @confirm="onMemberTypeConfirm"
        @cancel="showMemberTypePicker = false"
        title="选择会员类型"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast, showToast } from 'vant'
import { memberApi } from '@/api/member'

const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)
const fileList = ref([])

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
  familySituation: '',
  selfIntro: '',
  partnerRequirement: '',
  memberType: 'no_consumption',
  memberTypeLabel: '无消费',
  remark: ''
})

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

function onEducationConfirm({ selectedOptions }) {
  const opt = selectedOptions[0]
  form.education = opt?.value || ''
  showEducationPicker.value = false
}

function onIncomeConfirm({ selectedOptions }) {
  const opt = selectedOptions[0]
  form.incomeRange = opt?.value || ''
  showIncomePicker.value = false
}

function onMaritalConfirm({ selectedOptions }) {
  const opt = selectedOptions[0]
  form.maritalStatus = opt?.value || ''
  showMaritalPicker.value = false
}

function onHouseConfirm({ selectedOptions }) {
  const opt = selectedOptions[0]
  form.houseStatus = opt?.value || ''
  showHousePicker.value = false
}

function onCarConfirm({ selectedOptions }) {
  const opt = selectedOptions[0]
  form.carStatus = opt?.value || ''
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
  showToast('图片大小不能超过 5MB')
}

async function handleSubmit() {
  submitting.value = true
  try {
    const payload = {
      phone: form.phone,
      realName: form.realName,
      gender: form.gender,
      age: form.age ? Number(form.age) : undefined,
      constellation: form.constellation || undefined,
      height: form.height ? Number(form.height) : undefined,
      education: form.education || undefined,
      city: form.city || undefined,
      nativePlace: form.nativePlace || undefined,
      occupation: form.occupation || undefined,
      incomeRange: form.incomeRange || undefined,
      maritalStatus: form.maritalStatus || undefined,
      houseStatus: form.houseStatus || undefined,
      carStatus: form.carStatus || undefined,
      familySituation: form.familySituation || undefined,
      selfIntro: form.selfIntro || undefined,
      partnerRequirement: form.partnerRequirement || undefined,
      memberType: form.memberType,
      remark: form.remark || undefined,
      photos: fileList.value
        .filter(f => f.status === 'done' && f.url)
        .map(f => f.url)
    }
    await memberApi.addManual(payload)
    showSuccessToast('会员录入成功')
    router.back()
  } catch (err) {
    showFailToast(err?.response?.data?.message || err?.message || '录入失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
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
