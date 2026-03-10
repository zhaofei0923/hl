<template>
  <div class="page">
    <!-- 导航栏 -->
    <van-nav-bar title="会员详情" left-arrow @click-left="$router.back()">
      <template #right>
        <span class="nav-edit-btn" @click="handleEdit">编辑</span>
      </template>
    </van-nav-bar>

    <!-- 加载状态 -->
    <van-loading v-if="loading" class="page-loading" size="24px" vertical>加载中...</van-loading>

    <template v-if="!loading && member">
      <!-- 头像信息区 -->
      <div class="member-header">
        <div class="member-header__avatar">
          <van-image
            round
            width="80"
            height="80"
            :src="member.avatarUrl || defaultAvatar"
            fit="cover"
          />
        </div>
        <div class="member-header__name-row">
          <span class="member-header__name">{{ member.realName || member.nickname || '未填写' }}</span>
          <van-icon
            v-if="member.gender"
            :name="member.gender === 1 ? 'friends-o' : 'friends-o'"
            :color="member.gender === 1 ? '#1989fa' : '#FF4D6A'"
            size="18"
          />
        </div>
        <div class="member-header__phone">{{ maskPhone(member.phone) }}</div>
        <div class="member-header__tags">
          <van-tag v-if="member.age || member.birthDate" round type="primary" plain>
            {{ member.age || calcAge(member.birthDate) }}岁
          </van-tag>
          <van-tag v-if="member.city" round color="#f0f0f0" text-color="#666">
            {{ member.city }}
          </van-tag>
          <van-tag v-if="member.education" round color="#f0f0f0" text-color="#666">
            {{ member.education }}
          </van-tag>
          <van-tag v-if="member.income" round color="#f0f0f0" text-color="#666">
            {{ member.income }}
          </van-tag>
        </div>
      </div>

      <!-- 基本资料 -->
      <div class="info-card">
        <div class="info-card__title">基本资料</div>
        <div class="info-card__grid">
          <div class="info-row">
            <span class="info-row__label">姓名</span>
            <span class="info-row__value">{{ member.realName || member.nickname || '未填写' }}</span>
          </div>
          <div class="info-row">
            <span class="info-row__label">性别</span>
            <span class="info-row__value">{{ member.gender === 1 ? '男' : member.gender === 2 ? '女' : '未填写' }}</span>
          </div>
          <div class="info-row">
            <span class="info-row__label">年龄</span>
            <span class="info-row__value">{{ member.age ? member.age + '岁' : (member.birthDate ? calcAge(member.birthDate) + '岁' : '未填写') }}</span>
          </div>
          <div v-if="constellation" class="info-row">
            <span class="info-row__label">星座</span>
            <span class="info-row__value">{{ constellation }}</span>
          </div>
          <div class="info-row">
            <span class="info-row__label">身高</span>
            <span class="info-row__value">{{ member.height ? member.height + 'cm' : '未填写' }}</span>
          </div>
          <div class="info-row">
            <span class="info-row__label">学历</span>
            <span class="info-row__value">{{ member.education || '未填写' }}</span>
          </div>
          <div class="info-row">
            <span class="info-row__label">常住地/工作地</span>
            <span class="info-row__value">{{ member.city || '未填写' }}</span>
          </div>
          <div class="info-row">
            <span class="info-row__label">籍贯</span>
            <span class="info-row__value">{{ member.hometown || member.nativePlace || '未填写' }}</span>
          </div>
          <div class="info-row">
            <span class="info-row__label">职业</span>
            <span class="info-row__value">{{ member.occupation || '未填写' }}</span>
          </div>
          <div class="info-row">
            <span class="info-row__label">收入</span>
            <span class="info-row__value">{{ member.income || member.incomeRange || '未填写' }}</span>
          </div>
          <div class="info-row">
            <span class="info-row__label">婚姻情况</span>
            <span class="info-row__value">{{ member.maritalStatus || '未填写' }}</span>
          </div>
          <div class="info-row">
            <span class="info-row__label">是否有房</span>
            <span class="info-row__value">{{ member.houseStatus || '未填写' }}</span>
          </div>
          <div class="info-row">
            <span class="info-row__label">是否有车</span>
            <span class="info-row__value">{{ member.carStatus || '未填写' }}</span>
          </div>
        </div>
      </div>

      <!-- 自我介绍 -->
      <div v-if="member.selfIntro" class="info-card">
        <div class="info-card__title">自我介绍</div>
        <div class="info-card__content info-card__content--pre">
          {{ member.selfIntro }}
        </div>
      </div>

      <!-- 择偶要求 -->
      <div class="info-card">
        <div class="info-card__title">择偶要求</div>
        <div class="info-card__content">
          {{ member.partnerRequirement || '暂无择偶要求' }}
        </div>
      </div>

      <!-- 相册 -->
      <div v-if="member.photos && member.photos.length > 0" class="info-card">
        <div class="info-card__title">个人相册</div>
        <div class="photo-grid">
          <van-image
            v-for="(photo, index) in member.photos"
            :key="index"
            :src="photo"
            width="100%"
            height="100"
            fit="cover"
            radius="8"
            @click="previewImage(index)"
          />
        </div>
      </div>

      <!-- 底部占位 -->
      <div class="bottom-placeholder"></div>
    </template>

    <EmptyState v-if="!loading && !member" text="会员不存在" />

    <!-- 底部操作栏 -->
    <div v-if="member" class="action-bar">
      <van-button
        class="action-bar__btn"
        icon="chat-o"
        type="primary"
        plain
        round
        size="small"
        @click="handleGreet"
      >
        打招呼
      </van-button>
      <van-button
        class="action-bar__btn"
        icon="fire-o"
        color="var(--hl-accent-color)"
        round
        size="small"
        @click="handleSpeedMatch"
      >
        速配
      </van-button>
      <van-button
        class="action-bar__btn"
        icon="phone-o"
        color="var(--hl-primary-color)"
        round
        size="small"
        @click="handleCall"
      >
        拨打电话
      </van-button>
    </div>

    <!-- 图片预览 -->
    <van-image-preview
      v-model:show="showPreview"
      :images="member?.photos || []"
      :start-position="previewIndex"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showImagePreview } from 'vant'
import { memberApi } from '@/api/member'
import { maskPhone, formatDate, calcAge } from '@/utils/format'
import EmptyState from '@/components/common/EmptyState.vue'

const route = useRoute()
const router = useRouter()

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iI0UwRTBFMCIvPjxwYXRoIGQ9Ik0zMiAyMGE4IDggMCAxIDAgMCAxNiA4IDggMCAwIDAgMC0xNnptMCAyMGMtOC44NCAwLTE2IDMuNTgtMTYgOHYyaDMydi0yYzAtNC40Mi03LjE2LTgtMTYtOHoiIGZpbGw9IiNBMEEwQTAiLz48L3N2Zz4='

const loading = ref(true)
const member = ref(null)
const showPreview = ref(false)
const previewIndex = ref(0)

// Extract constellation from member remark (format: "星座：xxx" or "星座：xxx | ...")
const constellation = computed(() => {
  const remark = member.value?.remark || ''
  const match = remark.match(/星座[：:]\s*([^\s|]+)/)
  return match ? match[1] : ''
})

function previewImage(index) {
  if (member.value?.photos?.length) {
    showImagePreview({
      images: member.value.photos,
      startPosition: index
    })
  }
}

function handleEdit() {
  router.push(`/matchmaker/member/${route.params.id}/edit`)
}

async function handleGreet() {
  try {
    await memberApi.greet(route.params.id)
    showToast('打招呼成功')
  } catch (err) {
    // handled by interceptor
  }
}

async function handleSpeedMatch() {
  try {
    await memberApi.speedMatch(route.params.id)
    showToast('已发起速配')
  } catch (err) {
    // handled by interceptor
  }
}

function handleCall() {
  if (member.value?.phone) {
    window.location.href = `tel:${member.value.phone}`
  } else {
    showToast('暂无联系电话')
  }
}

onMounted(async () => {
  try {
    const res = await memberApi.getDetail(route.params.id)
    member.value = res.data
  } catch (err) {
    // handled by interceptor
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-loading {
  padding: 100px 0;
}

.nav-edit-btn {
  font-size: 14px;
  color: var(--hl-primary-color);
}

.member-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px 20px;
  background: linear-gradient(180deg, var(--hl-primary-color) 0%, var(--hl-bg-color) 100%);
}

.member-header__avatar {
  margin-bottom: 12px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(255, 125, 65, 0.3);
}

.member-header__name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.member-header__name {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
}

.member-header__phone {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 12px;
}

.member-header__tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.info-card {
  margin: 12px 16px;
  padding: 16px;
  background: var(--hl-card-bg);
  border-radius: var(--hl-radius-md);
}

.info-card__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--hl-text-primary);
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid var(--hl-primary-color);
}

.info-card__content {
  font-size: 14px;
  color: var(--hl-text-secondary);
  line-height: 1.6;
}

.info-card__grid {
  display: flex;
  flex-direction: column;
}

.info-card__content--pre {
  white-space: pre-wrap;
  word-break: break-word;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--hl-border-color);
}

.info-row__label {
  font-size: 13px;
  color: var(--hl-text-secondary);
  flex-shrink: 0;
  margin-right: 8px;
}

.info-row__value {
  font-size: 13px;
  color: var(--hl-text-primary);
  text-align: right;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.bottom-placeholder {
  height: 70px;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 10px;
  padding: 10px 16px;
  background: var(--hl-card-bg);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  z-index: 100;
}

.action-bar__btn {
  flex: 1;
}
</style>
