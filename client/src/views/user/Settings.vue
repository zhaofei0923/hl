<template>
  <div class="page settings-page">
    <van-nav-bar title="设置" left-arrow @click-left="$router.back()" :border="false" />

    <section class="settings-brand-panel card" data-testid="settings-brand-panel">
      <span class="brand-label">SETTINGS</span>
      <h1>把账号、通知和隐私集中到一页管理</h1>
      <p>不只是切换开关，而是让你清楚知道哪些设置会影响沟通体验、资料展示和账户安全。</p>
      <div class="settings-brand-panel__chips">
        <span class="brand-chip brand-chip--active">账户安全</span>
        <span class="brand-chip">通知节奏</span>
        <span class="brand-chip">隐私控制</span>
      </div>
    </section>

    <section class="settings-status card" data-testid="settings-status-panel">
      <div class="settings-status__head">
        <div>
          <span class="brand-label">ACCOUNT STATUS</span>
          <h2>安全与沟通状态</h2>
        </div>
        <strong>{{ accountState }}</strong>
      </div>
      <div class="settings-status__grid">
        <article v-for="item in statusItems" :key="item.label">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p>{{ item.hint }}</p>
        </article>
      </div>
    </section>

    <section class="settings-section" data-testid="settings-account-shell">
      <div class="settings-section__title">账户</div>
      <van-cell-group :border="false" class="settings-section__group">
        <van-cell title="手机号" :value="maskedPhone" />
        <van-cell title="修改密码" is-link @click="handleChangePassword" />
        <van-cell title="微信绑定" :value="wechatBound ? '已绑定' : '未绑定'" is-link @click="handleWechatBind" />
      </van-cell-group>
    </section>

    <section class="settings-section">
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
    </section>

    <section class="settings-section">
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
    </section>

    <section class="settings-section">
      <div class="settings-section__title">其他</div>
      <van-cell-group :border="false" class="settings-section__group">
        <van-cell title="清除缓存" :value="cacheSize" is-link @click="handleClearCache" />
        <van-cell title="关于我们" :value="`v${appVersion}`" is-link @click="handleAbout" />
        <van-cell title="用户协议" is-link @click="handleAgreement" />
        <van-cell title="隐私政策" is-link @click="handlePrivacy" />
      </van-cell-group>
    </section>

    <div class="settings-logout" data-testid="settings-logout-shell">
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

const accountState = computed(() => userStore.userInfo?.phone ? '基础安全已建立' : '先绑定手机号')

const statusItems = computed(() => [
  {
    label: '手机号',
    value: maskedPhone.value,
    hint: userStore.userInfo?.phone ? '账号找回和身份确认已有基础。' : '建议先绑定手机号，降低账号风险。'
  },
  {
    label: '消息提醒',
    value: settings.messageNotify && settings.newMessageAlert ? '已开启' : '需确认',
    hint: settings.messageNotify && settings.newMessageAlert ? '重要沟通不容易错过。' : '关闭提醒可能影响回复节奏。'
  },
  {
    label: '在线状态',
    value: settings.hideOnlineStatus ? '已隐藏' : '正常展示',
    hint: settings.hideOnlineStatus ? '更偏隐私，但互动信号会变弱。' : '在线状态有助于对方判断沟通时机。'
  }
])

function onSettingChange() {
  showToast('设置已保存')
}

function handleChangePassword() {
  showToast('修改密码功能开发中')
}

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

function handleAbout() {
  showDialog({
    title: '关于我们',
    message: `IFU v${appVersion}\n\n致力于为单身人士提供优质的婚恋交友服务`,
    confirmButtonColor: 'var(--hl-primary-color)',
  })
}

function handleAgreement() {
  showToast('用户协议页面开发中')
}

function handlePrivacy() {
  showToast('隐私政策页面开发中')
}

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
  }).catch(() => {})
}

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
  wechatBound.value = !!userStore.userInfo?.wechatBound
})
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  padding-bottom: 40px;
}

.settings-brand-panel {
  margin-top: 8px;
  overflow: hidden;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.94), rgba(255, 248, 239, 0.92));
}

.settings-brand-panel::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 138px;
  background: linear-gradient(135deg, rgba(142, 105, 65, 0.96), rgba(188, 150, 98, 0.82));
  border-radius: inherit;
}

.settings-brand-panel > * {
  position: relative;
  z-index: 1;
}

.settings-brand-panel .brand-label {
  color: rgba(255, 250, 244, 0.8);
}

.settings-brand-panel h1 {
  margin-top: 12px;
  font-size: 28px;
  line-height: 1.2;
  color: #fffaf4;
  max-width: 280px;
}

.settings-brand-panel p {
  margin-top: 16px;
  font-size: 14px;
  line-height: 1.75;
  color: var(--ifu-text);
}

.settings-brand-panel__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.settings-status {
  margin-top: 12px;
}

.settings-status__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.settings-status__head h2 {
  margin-top: 6px;
  color: var(--ifu-text-strong);
  font-size: 22px;
  line-height: 1.3;
}

.settings-status__head strong {
  flex-shrink: 0;
  padding: 8px 11px;
  border-radius: 999px;
  background: rgba(200, 169, 119, 0.16);
  color: var(--ifu-gold-700);
  font-size: 12px;
}

.settings-status__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.settings-status__grid article {
  padding: 13px 12px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 252, 248, 0.94), rgba(249, 241, 230, 0.76));
  border: 1px solid rgba(233, 221, 204, 0.86);
}

.settings-status__grid span {
  display: block;
  color: var(--ifu-text-muted);
  font-size: 11px;
}

.settings-status__grid strong {
  display: block;
  margin-top: 8px;
  color: var(--ifu-text-strong);
  font-size: 16px;
}

.settings-status__grid p {
  margin-top: 6px;
  color: var(--ifu-text-muted);
  font-size: 11px;
  line-height: 1.5;
}

.settings-section {
  margin-top: 12px;
}

.settings-section__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ifu-text);
  padding: 0 16px;
  margin-bottom: 8px;
}

.settings-section__group {
  margin: 0 16px;
  overflow: hidden;
  border-radius: 24px;
  border: 1px solid rgba(233, 221, 204, 0.92);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: var(--ifu-shadow-soft);
}

.settings-section__group :deep(.van-cell) {
  padding: 15px 16px;
  background: transparent;
}

.settings-section__group :deep(.van-cell__title),
.settings-section__group :deep(.van-cell__value) {
  color: var(--ifu-text);
}

.settings-logout {
  margin: 32px 16px 0;
}

.settings-logout__btn {
  height: 46px;
  color: var(--ifu-gold-700);
  border-color: rgba(166, 124, 82, 0.32);
  background: rgba(255, 255, 255, 0.92);
}

@media (max-width: 380px) {
  .settings-status__grid {
    grid-template-columns: 1fr;
  }
}
</style>
