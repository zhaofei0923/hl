<template>
  <div class="page settings-page">
    <van-nav-bar title="设置" left-arrow @click-left="$router.back()" :border="false" />

    <!-- 账户设置 -->
    <div class="settings-section">
      <div class="settings-section__title">账户</div>
      <van-cell-group :border="false" class="settings-section__group">
        <van-cell
          title="手机号"
          :value="maskedPhone"
        />
        <van-cell
          title="修改密码"
          is-link
          @click="handleChangePassword"
        />
        <van-cell
          title="微信绑定"
          :value="wechatBound ? '已绑定' : '未绑定'"
          is-link
          @click="handleWechatBind"
        />
      </van-cell-group>
    </div>

    <!-- 通知设置 -->
    <div class="settings-section">
      <div class="settings-section__title">通知</div>
      <van-cell-group :border="false" class="settings-section__group">
        <van-cell title="消息通知" center>
          <template #right-icon>
            <van-switch
              v-model="settings.messageNotify"
              size="22"
              active-color="var(--hl-primary-color)"
              @change="onSettingChange('messageNotify', $event)"
            />
          </template>
        </van-cell>
        <van-cell title="新消息提醒" center>
          <template #right-icon>
            <van-switch
              v-model="settings.newMessageAlert"
              size="22"
              active-color="var(--hl-primary-color)"
              @change="onSettingChange('newMessageAlert', $event)"
            />
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- 隐私设置 -->
    <div class="settings-section">
      <div class="settings-section__title">隐私</div>
      <van-cell-group :border="false" class="settings-section__group">
        <van-cell title="隐藏在线状态" center>
          <template #right-icon>
            <van-switch
              v-model="settings.hideOnlineStatus"
              size="22"
              active-color="var(--hl-primary-color)"
              @change="onSettingChange('hideOnlineStatus', $event)"
            />
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- 其他 -->
    <div class="settings-section">
      <div class="settings-section__title">其他</div>
      <van-cell-group :border="false" class="settings-section__group">
        <van-cell
          title="清除缓存"
          :value="cacheSize"
          is-link
          @click="handleClearCache"
        />
        <van-cell
          title="关于我们"
          :value="`v${appVersion}`"
          is-link
          @click="handleAbout"
        />
        <van-cell
          title="用户协议"
          is-link
          @click="handleAgreement"
        />
        <van-cell
          title="隐私政策"
          is-link
          @click="handlePrivacy"
        />
      </van-cell-group>
    </div>

    <!-- 退出登录按钮 -->
    <div class="settings-logout">
      <van-button
        block
        round
        class="settings-logout__btn"
        :loading="logoutLoading"
        @click="handleLogout"
      >
        退出登录
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { useUserStore } from '@/stores/user'
import { maskPhone } from '@/utils/format'

const router = useRouter()
const userStore = useUserStore()

const logoutLoading = ref(false)
const appVersion = '1.0.0'
const cacheSize = ref('0.0 MB')

const settings = reactive({
  messageNotify: true,
  newMessageAlert: true,
  hideOnlineStatus: false
})

const wechatBound = ref(false)

const maskedPhone = computed(() => {
  const phone = userStore.userInfo?.phone || ''
  return phone ? maskPhone(phone) : '未绑定'
})

// 设置更改
function onSettingChange(key, value) {
  showToast('设置已保存')
}

// 修改密码
function handleChangePassword() {
  showToast('修改密码功能开发中')
}

// 微信绑定
function handleWechatBind() {
  if (wechatBound.value) {
    showDialog({
      title: '提示',
      message: '确认解绑微信吗？解绑后将无法使用微信登录。',
      showCancelButton: true,
      confirmButtonColor: 'var(--hl-primary-color)',
    }).then(() => {
      wechatBound.value = false
      showToast('已解绑微信')
    }).catch(() => {})
  } else {
    showToast('微信绑定功能开发中')
  }
}

// 清除缓存
function handleClearCache() {
  showDialog({
    title: '清除缓存',
    message: '确认清除所有缓存数据吗？',
    showCancelButton: true,
    confirmButtonColor: 'var(--hl-primary-color)',
  }).then(() => {
    cacheSize.value = '0.0 MB'
    showToast('缓存已清除')
  }).catch(() => {})
}

// 关于我们
function handleAbout() {
  showDialog({
    title: '关于我们',
    message: `IFU v${appVersion}\n\n致力于为单身人士提供优质的婚恋交友服务`,
    confirmButtonColor: 'var(--hl-primary-color)',
  })
}

// 用户协议
function handleAgreement() {
  showToast('用户协议页面开发中')
}

// 隐私政策
function handlePrivacy() {
  showToast('隐私政策页面开发中')
}

// 退出登录
function handleLogout() {
  showDialog({
    title: '退出登录',
    message: '确认退出当前账号吗？',
    showCancelButton: true,
    confirmButtonText: '确认退出',
    confirmButtonColor: 'var(--hl-accent-color)',
  }).then(() => {
    logoutLoading.value = true
    try {
      userStore.logout()
      router.replace('/login')
    } finally {
      logoutLoading.value = false
    }
  }).catch(() => {
    // cancelled
  })
}

// 计算缓存大小
function calcCacheSize() {
  try {
    let total = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      const value = localStorage.getItem(key)
      total += (key.length + value.length) * 2
    }
    const sizeMB = (total / (1024 * 1024)).toFixed(1)
    cacheSize.value = `${sizeMB} MB`
  } catch {
    cacheSize.value = '0.0 MB'
  }
}

onMounted(() => {
  calcCacheSize()
  // 检查微信绑定状态
  wechatBound.value = !!userStore.userInfo?.wechatBound
})
</script>

<style scoped>
.settings-page {
  background: var(--hl-bg-color);
  min-height: 100vh;
  padding-bottom: 40px;
}

.settings-section {
  margin-top: 12px;
}

.settings-section__title {
  font-size: 14px;
  font-weight: 500;
  color: var(--hl-text-secondary);
  padding: 0 16px;
  margin-bottom: 8px;
}

.settings-section__group {
  background: var(--hl-card-bg);
  border-radius: var(--hl-radius-md);
  margin: 0 16px;
  overflow: hidden;
}

.settings-section__group :deep(.van-cell) {
  padding: 14px 16px;
}

.settings-section__group :deep(.van-cell__value) {
  color: var(--hl-text-secondary);
}

.settings-logout {
  margin: 32px 16px 0;
}

.settings-logout__btn {
  height: 44px;
  font-size: 16px;
  color: var(--hl-accent-color);
  border-color: var(--hl-accent-color);
  background: var(--hl-card-bg);
}

.settings-logout__btn:active {
  background: #FFF0F0;
}
</style>
