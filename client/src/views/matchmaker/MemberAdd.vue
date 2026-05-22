<template>
  <div class="page utility-page utility-page--form">
    <van-nav-bar title="手动录入会员" left-arrow :border="false" @click-left="$router.back()" />

    <section class="card utility-hero" data-testid="matchmaker-member-add-shell">
      <div class="utility-hero__top">
        <div>
          <span class="brand-label">ADD MEMBER</span>
          <h1>把手动录入做成可持续经营的会员建档流程</h1>
          <p>先补全基础资料，再整理详细介绍和相册，确保后续推荐、互推和跟进时有足够信息支撑。</p>
        </div>
        <span class="brand-chip brand-chip--active">新建档案</span>
      </div>
      <div class="utility-hero__chips">
        <span class="brand-chip">基础资料</span>
        <span class="brand-chip">详细介绍</span>
        <span class="brand-chip">信息图片</span>
      </div>
    </section>

    <!-- 智能识别入口 -->
    <van-cell-group inset style="margin: 12px 16px">
      <van-field name="ocrUpload" label="智能识别">
        <template #input>
          <div class="ocr-upload-area">
            <van-uploader
              :after-read="afterReadOcr"
              :max-count="1"
              :max-size="20 * 1024 * 1024"
              accept="image/*"
              :preview-image="false"
              @oversize="() => showToast('图片不能超过 20MB')"
            >
              <van-button
                size="small"
                type="primary"
                plain
                icon="scan"
                :loading="ocrLoading"
                loading-text="识别中..."
              >
                拍照/上传资料卡
              </van-button>
            </van-uploader>
            <span class="ocr-hint">上传会员资料卡图片，自动识别填写信息</span>
          </div>
        </template>
      </van-field>
      <div v-if="sourceCardUrl" class="ocr-source-card" @click="previewSourceCard">
        <img :src="sourceCardUrl" alt="资料卡原图" />
        <div class="ocr-source-card__info">
          <div class="ocr-source-card__title">资料卡图片已保存</div>
          <div class="ocr-source-card__desc">确认录入后，会在会员详情中展示原始图片</div>
        </div>
      </div>
    </van-cell-group>

    <van-form ref="formRef" @submit="handleSubmit">
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
          placeholder="请输入手机号"
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

      <!-- 会员信息图片 -->
      <div class="section-title">会员信息图片</div>
      <van-cell-group inset>
        <van-field name="avatar" label="头像">
          <template #input>
            <van-uploader
              v-model="avatarList"
              :after-read="afterReadAvatar"
              :max-count="1"
              :max-size="5 * 1024 * 1024"
              @oversize="onAvatarOversize"
            />
          </template>
        </van-field>
        <van-field name="photos" label="会员信息">
          <template #input>
            <van-uploader
              v-model="fileList"
              :after-read="afterReadPhoto"
              :max-count="3"
              :max-size="20 * 1024 * 1024"
              @oversize="onOversize"
              @delete="onDeleteMemberInfoImage"
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

    <!-- 年龄选择器 -->
    <van-popup v-model:show="showAgePicker" position="bottom" round>
      <van-picker
        :columns="ageOptions"
        @confirm="onAgeConfirm"
        @cancel="showAgePicker = false"
        title="选择年龄"
      />
    </van-popup>

    <!-- 星座选择器 -->
    <van-popup v-model:show="showConstellationPicker" position="bottom" round>
      <van-picker
        :columns="constellationOptions"
        @confirm="onConstellationConfirm"
        @cancel="showConstellationPicker = false"
        title="选择星座"
      />
    </van-popup>

    <!-- 身高选择器 -->
    <van-popup v-model:show="showHeightPicker" position="bottom" round>
      <van-picker
        :columns="heightOptions"
        @confirm="onHeightConfirm"
        @cancel="showHeightPicker = false"
        title="选择身高"
      />
    </van-popup>

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
import { showSuccessToast, showFailToast, showToast, showImagePreview } from 'vant'
import { memberApi } from '@/api/member'

const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)
const ocrLoading = ref(false)
const fileList = ref([])
const avatarList = ref([])
const sourceCardUrl = ref('')

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
  familySituation: '',
  selfIntro: '',
  partnerRequirement: '',
  memberType: 'no_consumption',
  memberTypeLabel: '无消费',
  remark: ''
})

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
  const opt = selectedOptions[0]
  form.age = opt?.value || ''
  showAgePicker.value = false
}

function onConstellationConfirm({ selectedOptions }) {
  const opt = selectedOptions[0]
  form.constellation = opt?.value || ''
  showConstellationPicker.value = false
}

function onHeightConfirm({ selectedOptions }) {
  const opt = selectedOptions[0]
  form.height = opt?.value || ''
  showHeightPicker.value = false
}

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

async function afterReadAvatar(file) {
  const f = Array.isArray(file) ? file[0] : file
  f.status = 'uploading'
  f.message = '上传中...'
  try {
    const formData = new FormData()
    formData.append('avatar', f.file)
    const res = await memberApi.uploadAvatar(formData)
    f.status = 'done'
    f.message = ''
    f.url = res.data?.url || res.url
  } catch {
    f.status = 'failed'
    f.message = '上传失败'
  }
}

function onAvatarOversize() {
  showToast('头像大小不能超过 5MB')
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
  showToast('会员信息图片大小不能超过 20MB')
}

function onDeleteMemberInfoImage(file) {
  if (file?.url && file.url === sourceCardUrl.value) {
    sourceCardUrl.value = ''
  }
}

// ========== OCR 智能识别 ==========
const incomeOptionValues = ['5万以下', '5-10万', '10-20万', '20-50万', '50-100万', '100万+']
const educationOptionValues = ['高中及以下', '专科', '本科', '硕士', '博士', '其他']
const maritalOptionValues = ['未婚', '离异', '丧偶']
const houseOptionValues = ['有', '无', '按揭中']
const carOptionValues = ['有', '无']

function fuzzyMatch(value, options) {
  if (!value) return ''
  const exact = options.find(o => o === value)
  if (exact) return exact
  const partial = options.find(o => value.includes(o) || o.includes(value))
  return partial || ''
}

function previewSourceCard() {
  if (!sourceCardUrl.value) return
  showImagePreview({
    images: [sourceCardUrl.value],
    closeable: true
  })
}

function addSourceCardToMemberInfo(cardUrl) {
  if (!cardUrl) return

  sourceCardUrl.value = cardUrl

  const existingIndex = fileList.value.findIndex(item => item.url === cardUrl)
  if (existingIndex >= 0) {
    const [existing] = fileList.value.splice(existingIndex, 1)
    fileList.value.unshift({ ...existing, status: 'done', message: '', isOcrSourceCard: true })
    return
  }

  const previousSourceIndex = fileList.value.findIndex(item => item.isOcrSourceCard)
  if (previousSourceIndex >= 0) {
    fileList.value.splice(previousSourceIndex, 1)
  }

  fileList.value.unshift({
    url: cardUrl,
    status: 'done',
    message: '',
    isImage: true,
    isOcrSourceCard: true
  })
}

async function afterReadOcr(file) {
  const f = Array.isArray(file) ? file[0] : file
  ocrLoading.value = true
  try {
    const formData = new FormData()
    formData.append('image', f.file)
    const res = await memberApi.ocrRecognize(formData)
    const data = res.data || res
    const fields = data.fields || {}
    const cardUrl = data.sourceImageUrl || data.photos?.find(url => url?.includes('ocr_card_')) || ''

    // Fill text fields
    if (fields.realName) form.realName = fields.realName
    if (fields.gender) form.gender = Number(fields.gender)
    if (fields.age) form.age = fields.age
    if (fields.height) form.height = fields.height
    if (fields.education) form.education = fuzzyMatch(fields.education, educationOptionValues) || form.education
    if (fields.city) form.city = fields.city
    if (fields.nativePlace) form.nativePlace = fields.nativePlace
    if (fields.occupation) form.occupation = fields.occupation
    if (fields.incomeRange) form.incomeRange = fuzzyMatch(fields.incomeRange, incomeOptionValues) || form.incomeRange
    if (fields.maritalStatus) form.maritalStatus = fuzzyMatch(fields.maritalStatus, maritalOptionValues) || form.maritalStatus
    if (fields.houseStatus) form.houseStatus = fuzzyMatch(fields.houseStatus, houseOptionValues) || form.houseStatus
    if (fields.carStatus) form.carStatus = fuzzyMatch(fields.carStatus, carOptionValues) || form.carStatus

    if (cardUrl) {
      addSourceCardToMemberInfo(cardUrl)
    }

    const fieldCount = Object.keys(fields).length
    if (fieldCount === 0) {
      showToast(cardUrl ? '图片已保存，未识别到基础信息，请手动补充' : '未识别到有效信息，请确认图片为会员资料卡')
    } else {
      showSuccessToast('基础信息已识别，请检查并补充')
    }
  } catch (err) {
    showFailToast(err?.response?.data?.message || '识别失败，请重试')
  } finally {
    ocrLoading.value = false
  }
}

async function handleSubmit() {
  submitting.value = true
  try {
    const photoUrls = fileList.value
      .filter(f => f.status === 'done' && f.url)
      .map(f => f.url)
    if (sourceCardUrl.value && !photoUrls.includes(sourceCardUrl.value)) {
      photoUrls.unshift(sourceCardUrl.value)
    }

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
      avatarUrl: avatarList.value.find(f => f.status === 'done' && f.url)?.url || undefined,
      photos: photoUrls
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

.ocr-upload-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ocr-hint {
  font-size: 12px;
  color: var(--hl-text-secondary, #999);
}

.ocr-source-card {
  display: flex;
  gap: 12px;
  margin: 0 16px 14px;
  padding: 12px;
  border: 1px solid rgba(187, 143, 74, 0.22);
  border-radius: 12px;
  background: rgba(255, 250, 242, 0.86);
}

.ocr-source-card img {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  object-fit: cover;
  background: var(--hl-bg-muted);
}

.ocr-source-card__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.ocr-source-card__title {
  color: var(--hl-text-primary);
  font-size: 14px;
  font-weight: 600;
}

.ocr-source-card__desc {
  margin-top: 4px;
  color: var(--hl-text-secondary);
  font-size: 12px;
  line-height: 1.45;
}

:deep(.van-cell-group--inset) {
  margin: 0 16px;
}

:deep(.van-field__label) {
  width: 90px;
}

:deep(.van-picker) {
  background: #fff;
}

:deep(.van-picker-column__item) {
  color: var(--ifu-text-strong, #3a2e23);
}

:deep(.van-picker__toolbar) {
  background: #fff;
}

:deep(.van-picker__title) {
  color: var(--ifu-text-strong, #3a2e23);
}

:deep(.van-picker__confirm) {
  color: var(--ifu-gold-700, #a67c52);
}

:deep(.van-picker__cancel) {
  color: var(--ifu-text-muted, #9a8a78);
}
</style>
