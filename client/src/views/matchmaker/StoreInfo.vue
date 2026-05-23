<template>
  <div class="page utility-page utility-page--form">
    <van-nav-bar title="门店信息" left-arrow :border="false" @click-left="$router.back()" />

    <section class="card utility-hero" data-testid="matchmaker-store-shell">
      <div class="utility-hero__top">
        <div>
          <span class="brand-label">STORE PROFILE</span>
          <h1>把门店信息做成可信赖的线下名片</h1>
          <p>门店状态、基础资料、照片和营业执照要在同一页清楚呈现，方便后续审核和线下转化。</p>
        </div>
        <span class="brand-chip brand-chip--active">{{ hasStore ? '已开通门店' : '待申请门店' }}</span>
      </div>
      <div class="utility-hero__chips">
        <span class="brand-chip">{{ hasStore ? (storeData.name || '门店资料') : '提交申请' }}</span>
        <span class="brand-chip">{{ hasStore ? '可编辑资料' : '等待审核' }}</span>
      </div>
    </section>

    <section v-if="!loading" class="store-trust-card" data-testid="matchmaker-store-trust">
      <div class="store-trust-card__head">
        <div>
          <span class="brand-label">TRUST CHECK</span>
          <h2>门店信任检查</h2>
        </div>
        <strong>{{ storeTrustState }}</strong>
      </div>
      <div class="store-trust-card__grid">
        <article v-for="item in storeTrustItems" :key="item.label">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p>{{ item.hint }}</p>
        </article>
      </div>
    </section>

    <van-loading v-if="loading" class="page-loading" size="24px" vertical>加载中...</van-loading>

    <!-- 无门店：申请开通 -->
    <template v-if="!loading && !hasStore">
      <div class="apply-card">
        <div class="apply-card__icon">
          <van-icon name="shop-o" size="64" color="var(--hl-primary-color)" />
        </div>
        <div class="apply-card__title">开通实体门店</div>
        <div class="apply-card__desc">
          开通专属门店，提升信任度，获取更多客源
        </div>
        <van-button
          round
          type="primary"
          color="var(--hl-primary-color)"
          class="apply-card__btn"
          @click="showApplyForm = true"
        >
          立即申请
        </van-button>
      </div>
    </template>

    <!-- 有门店：展示信息 -->
    <template v-if="!loading && hasStore">
      <div class="store-info">
        <!-- 门店基本信息 -->
        <div class="info-card">
          <div class="info-card__header">
            <span class="info-card__title">门店信息</span>
            <span class="info-card__edit" @click="isEditing = !isEditing">
              {{ isEditing ? '取消' : '编辑' }}
            </span>
          </div>

          <van-form v-if="isEditing" @submit="handleUpdate">
            <van-field
              v-model="storeForm.name"
              label="门店名称"
              placeholder="请输入门店名称"
              :rules="[{ required: true, message: '请输入门店名称' }]"
            />
            <van-field
              v-model="storeForm.address"
              label="门店地址"
              placeholder="请输入门店地址"
              :rules="[{ required: true, message: '请输入门店地址' }]"
            />
            <van-field
              v-model="storeForm.phone"
              label="联系电话"
              placeholder="请输入联系电话"
              type="tel"
            />
            <div class="form-actions">
              <van-button
                block
                round
                type="primary"
                color="var(--hl-primary-color)"
                native-type="submit"
                :loading="submitting"
              >
                保存修改
              </van-button>
            </div>
          </van-form>

          <template v-else>
            <div class="info-rows">
              <div class="info-row">
                <span class="info-row__label">门店名称</span>
                <span class="info-row__value">{{ storeData.name || '--' }}</span>
              </div>
              <div class="info-row">
                <span class="info-row__label">门店地址</span>
                <span class="info-row__value">{{ storeData.address || '--' }}</span>
              </div>
              <div class="info-row">
                <span class="info-row__label">联系电话</span>
                <span class="info-row__value">{{ storeData.phone || '--' }}</span>
              </div>
              <div class="info-row">
                <span class="info-row__label">审核状态</span>
                <van-tag
                  round
                  size="medium"
                  :type="storeData.status === 'approved' ? 'success' : storeData.status === 'rejected' ? 'danger' : 'warning'"
                >
                  {{ getStoreStatusText(storeData.status) }}
                </van-tag>
              </div>
            </div>
          </template>
        </div>

        <!-- 门店照片 -->
        <div class="info-card">
          <div class="info-card__header">
            <span class="info-card__title">门店照片</span>
          </div>
          <div v-if="storeData.photos && storeData.photos.length > 0" class="photo-grid">
            <van-image
              v-for="(photo, index) in storeData.photos"
              :key="index"
              :src="photo"
              width="100%"
              height="80"
              fit="cover"
              radius="8"
              @click="previewPhotos(index)"
            />
          </div>
          <div v-else class="no-photos">暂无门店照片</div>
        </div>

        <!-- 营业执照 -->
        <div class="info-card">
          <div class="info-card__header">
            <span class="info-card__title">营业执照</span>
          </div>
          <div v-if="storeData.license" class="license-wrap">
            <van-image
              :src="storeData.license"
              width="100%"
              height="180"
              fit="contain"
              radius="8"
            />
          </div>
          <div v-else class="no-photos">暂未上传营业执照</div>
        </div>
      </div>
    </template>

    <!-- 申请表单弹出 -->
    <van-popup
      v-model:show="showApplyForm"
      position="bottom"
      round
      :style="{ maxHeight: '80%' }"
    >
      <div class="apply-popup">
        <div class="apply-popup__title">申请开通门店</div>
        <van-form @submit="handleApply">
          <van-field
            v-model="applyForm.name"
            label="门店名称"
            placeholder="请输入门店名称"
            :rules="[{ required: true, message: '请输入门店名称' }]"
          />
          <van-field
            v-model="applyForm.address"
            label="门店地址"
            placeholder="请输入门店地址"
            :rules="[{ required: true, message: '请输入门店地址' }]"
          />
          <van-field
            v-model="applyForm.phone"
            label="联系电话"
            placeholder="请输入联系电话"
            type="tel"
            :rules="[{ required: true, message: '请输入联系电话' }]"
          />
          <div class="form-actions">
            <van-button
              block
              round
              type="primary"
              color="var(--hl-primary-color)"
              native-type="submit"
              :loading="submitting"
            >
              提交申请
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { showToast, showImagePreview } from 'vant'
import { matchmakerApi } from '@/api/matchmaker'

const loading = ref(true)
const hasStore = ref(false)
const isEditing = ref(false)
const showApplyForm = ref(false)
const submitting = ref(false)

const storeData = ref({
  name: '',
  address: '',
  phone: '',
  photos: [],
  license: '',
  status: ''
})

const storeForm = reactive({
  name: '',
  address: '',
  phone: ''
})

const applyForm = reactive({
  name: '',
  address: '',
  phone: ''
})

const storeTrustScore = computed(() => {
  if (!hasStore.value) return 0
  const fields = [
    storeData.value.name,
    storeData.value.address,
    storeData.value.phone,
    storeData.value.status === 'approved',
    storeData.value.photos?.length > 0,
    storeData.value.license
  ]
  return Math.round((fields.filter(Boolean).length / fields.length) * 100)
})
const storeTrustState = computed(() => {
  if (!hasStore.value) return '待申请'
  if (storeData.value.status === 'approved') return '已通过'
  if (storeData.value.status === 'rejected') return '需重提'
  return '审核中'
})
const storeTrustItems = computed(() => [
  {
    label: '可信完整度',
    value: hasStore.value ? `${storeTrustScore.value}%` : '待开通',
    hint: hasStore.value ? '门店资料越完整，线下转化越稳定。' : '先提交门店名称、地址和电话。'
  },
  {
    label: '审核状态',
    value: hasStore.value ? getStoreStatusText(storeData.value.status) : '未申请',
    hint: hasStore.value ? '审核状态会影响门店对外展示。' : '申请后等待平台审核。'
  },
  {
    label: '展示素材',
    value: hasStore.value ? `${storeData.value.photos?.length || 0} 张` : '待上传',
    hint: hasStore.value && storeData.value.photos?.length ? '照片可辅助建立线下信任。' : '建议补门店照片和营业执照。'
  }
])

function getStoreStatusText(status) {
  const map = {
    pending: '审核中',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return map[status] || '未知'
}

function previewPhotos(index) {
  if (storeData.value.photos?.length) {
    showImagePreview({
      images: storeData.value.photos,
      startPosition: index
    })
  }
}

async function fetchStore() {
  try {
    const res = await matchmakerApi.getStore()
    if (res.data) {
      hasStore.value = true
      storeData.value = res.data
      storeForm.name = res.data.name || ''
      storeForm.address = res.data.address || ''
      storeForm.phone = res.data.phone || ''
    }
  } catch (err) {
    hasStore.value = false
  } finally {
    loading.value = false
  }
}

async function handleApply() {
  submitting.value = true
  try {
    await matchmakerApi.applyStore({
      name: applyForm.name,
      address: applyForm.address,
      phone: applyForm.phone
    })
    showToast('申请已提交，请等待审核')
    showApplyForm.value = false
    fetchStore()
  } catch (err) {
    // handled by interceptor
  } finally {
    submitting.value = false
  }
}

async function handleUpdate() {
  submitting.value = true
  try {
    await matchmakerApi.updateStore({
      name: storeForm.name,
      address: storeForm.address,
      phone: storeForm.phone
    })
    showToast('修改已保存')
    isEditing.value = false
    fetchStore()
  } catch (err) {
    // handled by interceptor
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchStore()
})
</script>

<style scoped>
.page-loading {
  padding: 100px 0;
}

.apply-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 40px 16px;
  padding: 40px 24px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 24px;
  box-shadow: var(--ifu-shadow-soft);
}

.store-trust-card {
  margin: 12px 16px 0;
  padding: 16px;
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: var(--ifu-shadow-soft);
}

.store-trust-card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.store-trust-card__head h2 {
  margin-top: 6px;
  color: var(--ifu-text-strong);
  font-size: 22px;
  line-height: 1.3;
}

.store-trust-card__head strong {
  flex-shrink: 0;
  padding: 8px 11px;
  border-radius: 999px;
  background: rgba(200, 169, 119, 0.16);
  color: var(--ifu-gold-700);
  font-size: 12px;
}

.store-trust-card__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.store-trust-card__grid article {
  padding: 13px 12px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 252, 248, 0.94), rgba(249, 241, 230, 0.76));
  border: 1px solid rgba(233, 221, 204, 0.86);
}

.store-trust-card__grid span {
  display: block;
  color: var(--ifu-text-muted);
  font-size: 11px;
}

.store-trust-card__grid strong {
  display: block;
  margin-top: 8px;
  color: var(--ifu-text-strong);
  font-size: 16px;
}

.store-trust-card__grid p {
  margin-top: 6px;
  color: var(--ifu-text-muted);
  font-size: 11px;
  line-height: 1.5;
}

.apply-card__icon {
  margin-bottom: 16px;
}

.apply-card__title {
  font-size: 20px;
  font-weight: 600;
  color: var(--ifu-text-strong);
  margin-bottom: 8px;
}

.apply-card__desc {
  font-size: 13px;
  color: var(--ifu-text-muted);
  text-align: center;
  margin-bottom: 24px;
  line-height: 1.5;
}

.apply-card__btn {
  width: 200px;
}

.info-card {
  margin: 12px 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 24px;
  box-shadow: var(--ifu-shadow-soft);
}

.info-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.info-card__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--ifu-text-strong);
  padding-left: 8px;
  border-left: 3px solid var(--ifu-gold-700);
}

.info-card__edit {
  font-size: 13px;
  color: var(--ifu-gold-700);
  cursor: pointer;
}

.info-rows {
  display: flex;
  flex-direction: column;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(233, 221, 204, 0.92);
}

.info-row:last-child {
  border-bottom: none;
}

.info-row__label {
  font-size: 13px;
  color: var(--ifu-text-muted);
  flex-shrink: 0;
  margin-right: 16px;
}

.info-row__value {
  font-size: 13px;
  color: var(--ifu-text-strong);
  text-align: right;
  word-break: break-all;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.license-wrap {
  margin-top: 4px;
}

.no-photos {
  padding: 20px 0;
  text-align: center;
  font-size: 13px;
  color: var(--ifu-text-muted);
}

.form-actions {
  padding: 20px 16px;
}

.apply-popup {
  padding: 20px 0;
}

.apply-popup__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--ifu-text-strong);
  text-align: center;
  padding-bottom: 16px;
}

@media (max-width: 380px) {
  .store-trust-card__grid {
    grid-template-columns: 1fr;
  }
}
</style>
