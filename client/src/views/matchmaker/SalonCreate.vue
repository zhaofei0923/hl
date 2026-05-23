<template>
  <div class="page utility-page utility-page--form">
    <van-nav-bar
      :title="isEdit ? '编辑活动' : '创建活动'"
      left-arrow
      :border="false"
      @click-left="$router.back()"
    />

    <section class="card utility-hero" data-testid="matchmaker-salon-create-shell">
      <div class="utility-hero__top">
        <div>
          <span class="brand-label">SALON FORM</span>
          <h1>{{ isEdit ? '把活动修改做成清晰的运营调整' : '把活动创建做成一眼能确认信息完整度的表单' }}</h1>
          <p>时间、地点、人数和费用应当一次写清，方便后续报名、线下执行和红娘协作跟进。</p>
        </div>
        <span class="brand-chip brand-chip--active">{{ isEdit ? '编辑中' : '创建中' }}</span>
      </div>
      <div class="utility-hero__chips">
        <span class="brand-chip">时间与地点</span>
        <span class="brand-chip">席位设置</span>
        <span class="brand-chip">封面图上传</span>
      </div>
    </section>

    <section class="salon-form-check card" data-testid="matchmaker-salon-form-check">
      <div class="salon-form-check__head">
        <div>
          <span class="brand-label">PUBLISH CHECK</span>
          <h2>发布前检查</h2>
        </div>
        <strong>{{ publishState }}</strong>
      </div>
      <div class="salon-form-check__grid">
        <article v-for="item in publishItems" :key="item.label">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p>{{ item.hint }}</p>
        </article>
      </div>
    </section>

    <div class="form-wrap">
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="form.title"
            label="活动标题"
            placeholder="请输入活动标题"
            required
            :rules="[{ required: true, message: '请输入活动标题' }]"
          />

          <van-field
            v-model="form.description"
            label="活动描述"
            type="textarea"
            placeholder="请输入活动描述"
            rows="3"
            autosize
          />

          <van-field
            v-model="form.location"
            label="活动地点"
            placeholder="请输入活动地点"
          />

          <van-field
            v-model="dateDisplay"
            label="活动时间"
            placeholder="请选择活动时间"
            required
            readonly
            is-link
            :rules="[{ required: true, message: '请选择活动时间' }]"
            @click="showDatePicker = true"
          />

          <van-field
            v-model="form.maxParticipants"
            label="最大人数"
            type="digit"
            placeholder="不填则不限人数"
          />

          <van-field
            v-model="form.price"
            label="活动费用"
            type="number"
            placeholder="0 表示免费"
          >
            <template #button>元</template>
          </van-field>
        </van-cell-group>

        <div class="section-title">封面图（可选）</div>
        <van-cell-group inset>
          <van-field label="封面图">
            <template #input>
              <van-uploader
                v-model="coverFileList"
                :max-count="1"
                :before-read="beforeRead"
                :after-read="afterRead"
                result-type="file"
              />
            </template>
          </van-field>
        </van-cell-group>

        <div class="submit-wrap">
          <van-button round block type="primary" native-type="submit" :loading="submitting">
            {{ isEdit ? '保存修改' : '创建活动' }}
          </van-button>
        </div>
      </van-form>
    </div>

    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-date-picker
        v-model="dateValue"
        title="选择日期"
        :min-date="minDate"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showTimePicker" position="bottom" round>
      <van-time-picker
        v-model="timeValue"
        title="选择时间"
        @confirm="onTimeConfirm"
        @cancel="showTimePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import { salonApi } from '@/api/salon'
import { useUpload } from '@/composables/useUpload'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)
const submitting = ref(false)

const form = reactive({
  title: '',
  description: '',
  location: '',
  eventDate: '',
  maxParticipants: '',
  price: '',
  coverImage: ''
})

const showDatePicker = ref(false)
const showTimePicker = ref(false)
const minDate = new Date()
const dateValue = ref([
  String(new Date().getFullYear()),
  String(new Date().getMonth() + 1).padStart(2, '0'),
  String(new Date().getDate()).padStart(2, '0')
])
const timeValue = ref(['10', '00'])
const selectedDate = ref('')
const dateDisplay = computed(() => form.eventDate || '')
const publishScore = computed(() => {
  const fields = [
    form.title,
    form.description,
    form.location,
    form.eventDate,
    form.maxParticipants,
    form.coverImage
  ]
  const filled = fields.filter(Boolean).length
  return Math.round((filled / fields.length) * 100)
})
const publishState = computed(() => {
  if (publishScore.value >= 80) return '可发布'
  if (publishScore.value >= 50) return '继续补齐'
  return '先定框架'
})
const publishItems = computed(() => [
  {
    label: '信息完整度',
    value: `${publishScore.value}%`,
    hint: publishScore.value >= 80 ? '报名页已有清晰基础信息。' : '建议补齐介绍、地点、人数和封面。'
  },
  {
    label: '席位策略',
    value: form.maxParticipants ? `${form.maxParticipants} 人` : '不限人数',
    hint: form.maxParticipants ? '可用于控制线下接待和报名节奏。' : '不限人数适合开放式活动。'
  },
  {
    label: '费用说明',
    value: Number(form.price || 0) > 0 ? `¥${Number(form.price).toFixed(0)}` : '免费',
    hint: Number(form.price || 0) > 0 ? '建议在描述中说明费用包含内容。' : '免费活动更适合拉新和暖场。'
  }
])

const coverFileList = ref([])
const { beforeRead } = useUpload()

async function afterRead(file) {
  file.status = 'uploading'
  file.message = '上传中...'
  try {
    const res = await salonApi.uploadCover(file.file || file)
    const url = res.data?.url || res.url
    form.coverImage = url
    file.status = 'done'
    file.message = ''
  } catch {
    file.status = 'failed'
    file.message = '上传失败'
  }
}

function onDateConfirm({ selectedValues }) {
  selectedDate.value = selectedValues.join('-')
  showDatePicker.value = false
  showTimePicker.value = true
}

function onTimeConfirm({ selectedValues }) {
  form.eventDate = `${selectedDate.value} ${selectedValues.join(':')}`
  showTimePicker.value = false
}

async function loadEvent() {
  if (!isEdit.value) return
  try {
    const res = await salonApi.getEventDetail(route.params.id)
    const event = res.data
    form.title = event.title
    form.description = event.description || ''
    form.location = event.location || ''
    form.maxParticipants = event.maxParticipants ? String(event.maxParticipants) : ''
    form.price = event.price ? String(Number(event.price)) : ''
    form.coverImage = event.coverImage || ''

    if (event.eventDate) {
      const d = new Date(event.eventDate)
      form.eventDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    }

    if (event.coverImage) {
      coverFileList.value = [{ url: event.coverImage, status: 'done' }]
    }
  } catch {
    showToast('加载活动信息失败')
  }
}

async function onSubmit() {
  submitting.value = true
  try {
    const data = {
      title: form.title,
      description: form.description,
      location: form.location,
      eventDate: form.eventDate,
      maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : 0,
      price: form.price ? Number(form.price) : 0,
      coverImage: form.coverImage
    }

    if (isEdit.value) {
      await salonApi.updateEvent(route.params.id, data)
      showSuccessToast('修改成功')
    } else {
      await salonApi.createEvent(data)
      showSuccessToast('创建成功')
    }

    router.back()
  } catch (e) {
    showToast(e.response?.data?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadEvent()
})
</script>

<style scoped>
.form-wrap {
  padding: 16px 0;
}

.salon-form-check {
  margin-top: 12px;
}

.salon-form-check__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.salon-form-check__head h2 {
  margin-top: 6px;
  color: var(--ifu-text-strong);
  font-size: 22px;
  line-height: 1.3;
}

.salon-form-check__head strong {
  flex-shrink: 0;
  padding: 8px 11px;
  border-radius: 999px;
  background: rgba(200, 169, 119, 0.16);
  color: var(--ifu-gold-700);
  font-size: 12px;
}

.salon-form-check__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.salon-form-check__grid article {
  padding: 13px 12px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 252, 248, 0.94), rgba(249, 241, 230, 0.76));
  border: 1px solid rgba(233, 221, 204, 0.86);
}

.salon-form-check__grid span {
  display: block;
  color: var(--ifu-text-muted);
  font-size: 11px;
}

.salon-form-check__grid strong {
  display: block;
  margin-top: 8px;
  color: var(--ifu-text-strong);
  font-size: 16px;
}

.salon-form-check__grid p {
  margin-top: 6px;
  color: var(--ifu-text-muted);
  font-size: 11px;
  line-height: 1.5;
}

.section-title {
  padding: 16px 32px 8px;
  font-size: 14px;
  color: var(--ifu-text);
}

.submit-wrap {
  padding: 24px 16px;
}

@media (max-width: 380px) {
  .salon-form-check__grid {
    grid-template-columns: 1fr;
  }
}
</style>
