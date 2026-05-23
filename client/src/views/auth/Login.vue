<template>
  <div class="page login-page">
    <section class="login-header" data-testid="login-brand-panel">
      <div class="login-header__halo"></div>
      <div class="login-header__ornament"></div>
      <div class="login-header__topline">
        <span class="brand-label">IF U MATCHMAKING EDITION</span>
        <span class="login-header__status">香槟金甄选</span>
      </div>
      <div class="login-header__logo">
        <van-icon name="like" size="30" color="#fff8ef" />
      </div>
      <h1 class="login-header__title">IFU</h1>
      <p class="login-header__subtitle">严选匹配 / 红娘协作 / 真实认证</p>
      <div class="login-header__pill-row">
        <span
          v-for="pill in brandPills"
          :key="pill"
          class="login-header__pill"
          data-testid="login-brand-pill"
        >
          {{ pill }}
        </span>
      </div>

      <div class="login-header__promise-grid">
        <div
          v-for="item in servicePromises"
          :key="item.title"
          class="login-header__promise"
        >
          <strong>{{ item.title }}</strong>
          <span>{{ item.desc }}</span>
        </div>
      </div>
    </section>

    <div class="login-form-wrapper">
      <van-notice-bar
        v-if="$route.query.inviteCode"
        left-icon="volume-o"
        text="您正在通过邀请链接注册，注册后将自动成为红娘会员"
        color="#7b5b39"
        background="#f5ecdd"
        style="margin: -8px 0 14px; border-radius: 18px;"
      />

      <section class="login-editorial-card">
        <div>
          <span class="brand-label">MATCH WITH INTENT</span>
          <h2>把第一印象变成值得继续的对话</h2>
        </div>
        <p>为认真进入关系的人准备。真实资料、人工撮合、合适再见面。</p>
      </section>

      <section class="login-path-panel" data-testid="login-path-panel">
        <article
          v-for="item in pathGuides"
          :key="item.title"
          class="login-path-panel__item"
          @click="handlePathGuide(item)"
        >
          <span>{{ item.kicker }}</span>
          <strong>{{ item.title }}</strong>
          <p>{{ item.desc }}</p>
        </article>
      </section>

      <van-tabs v-model:active="activeTab" shrink animated>
        <van-tab title="短信登录">
          <div class="login-form">
            <van-field
              v-model="smsForm.phone"
              type="tel"
              maxlength="11"
              placeholder="请输入手机号"
              clearable
              left-icon="phone-o"
            />
            <van-field
              v-model="smsForm.code"
              type="digit"
              maxlength="6"
              placeholder="请输入验证码"
              left-icon="shield-o"
            >
              <template #button>
                <van-button
                  size="small"
                  type="primary"
                  round
                  :disabled="countdown > 0 || !smsForm.phone"
                  @click="handleSendSms"
                >
                  {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                </van-button>
              </template>
            </van-field>
            <van-button
              block
              round
              type="primary"
              class="login-form__submit"
              :loading="loading"
              @click="handleSmsLogin"
            >
              登录
            </van-button>
          </div>
        </van-tab>

        <van-tab title="账号登录">
          <div class="login-form">
            <van-field
              v-model="loginForm.username"
              placeholder="请输入用户名/手机号"
              clearable
              left-icon="manager-o"
            />
            <van-field
              v-model="loginForm.password"
              :type="showLoginPwd ? 'text' : 'password'"
              placeholder="请输入密码"
              left-icon="lock"
              :right-icon="showLoginPwd ? 'eye-o' : 'closed-eye'"
              @click-right-icon="showLoginPwd = !showLoginPwd"
            />
            <van-button
              block
              round
              type="primary"
              class="login-form__submit"
              :loading="loading"
              @click="handleUsernameLogin"
            >
              登录
            </van-button>
            <div class="login-form__tip">
              <a class="login-form__link" @click="activeTab = 3">忘记密码？</a>
              <span class="login-form__separator">·</span>
              还没有账号？
              <a class="login-form__link" @click="activeTab = 2">立即注册</a>
            </div>
          </div>
        </van-tab>

        <van-tab title="注册">
          <div class="login-form">
            <div class="role-select">
              <div
                class="role-select__item"
                :class="{ 'role-select__item--active': regForm.role === 'user' }"
                @click="regForm.role = 'user'"
              >
                <van-icon name="like-o" size="24" />
                <span class="role-select__label">我有婚恋需求</span>
                <span class="role-select__desc">寻找另一半</span>
              </div>
              <div
                class="role-select__item"
                :class="{ 'role-select__item--active': regForm.role === 'matchmaker' }"
                @click="regForm.role = 'matchmaker'"
              >
                <van-icon name="friends-o" size="24" />
                <span class="role-select__label">我是婚介/资源方</span>
                <span class="role-select__desc">为他人牵线</span>
              </div>
            </div>

            <van-field
              v-model="regForm.username"
              placeholder="请输入用户名（3-20位）"
              clearable
              left-icon="manager-o"
            />
            <van-field
              v-model="regForm.nickname"
              placeholder="请输入昵称（选填）"
              clearable
              left-icon="user-o"
            />
            <van-field
              v-model="regForm.password"
              :type="showRegPwd ? 'text' : 'password'"
              placeholder="请输入密码（6位以上）"
              left-icon="lock"
              :right-icon="showRegPwd ? 'eye-o' : 'closed-eye'"
              @click-right-icon="showRegPwd = !showRegPwd"
            />
            <van-field
              v-model="regForm.confirmPassword"
              :type="showRegPwd2 ? 'text' : 'password'"
              placeholder="请再次输入密码"
              left-icon="lock"
              :right-icon="showRegPwd2 ? 'eye-o' : 'closed-eye'"
              @click-right-icon="showRegPwd2 = !showRegPwd2"
            />
            <van-button
              block
              round
              type="primary"
              class="login-form__submit"
              :loading="loading"
              @click="handleRegister"
            >
              注册
            </van-button>
            <div class="login-form__tip">
              已有账号？
              <a class="login-form__link" @click="activeTab = 1">去登录</a>
            </div>
          </div>
        </van-tab>

        <van-tab title="找回密码">
          <div class="login-form">
            <van-field
              v-model="resetForm.phone"
              type="tel"
              maxlength="11"
              placeholder="请输入注册手机号"
              clearable
              left-icon="phone-o"
            />
            <van-field
              v-model="resetForm.code"
              type="digit"
              maxlength="6"
              placeholder="请输入验证码"
              left-icon="shield-o"
            >
              <template #button>
                <van-button
                  size="small"
                  type="primary"
                  round
                  :disabled="resetCountdown > 0 || !resetForm.phone"
                  @click="handleSendResetSms"
                >
                  {{ resetCountdown > 0 ? `${resetCountdown}s` : '获取验证码' }}
                </van-button>
              </template>
            </van-field>
            <van-field
              v-model="resetForm.password"
              :type="showResetPwd ? 'text' : 'password'"
              placeholder="请输入新密码（6位以上）"
              left-icon="lock"
              :right-icon="showResetPwd ? 'eye-o' : 'closed-eye'"
              @click-right-icon="showResetPwd = !showResetPwd"
            />
            <van-field
              v-model="resetForm.confirmPassword"
              :type="showResetPwd2 ? 'text' : 'password'"
              placeholder="请再次输入新密码"
              left-icon="lock"
              :right-icon="showResetPwd2 ? 'eye-o' : 'closed-eye'"
              @click-right-icon="showResetPwd2 = !showResetPwd2"
            />
            <van-button
              block
              round
              type="primary"
              class="login-form__submit"
              :loading="loading"
              @click="handleResetPassword"
            >
              重置密码
            </van-button>
            <div class="login-form__tip">
              想起密码了？
              <a class="login-form__link" @click="activeTab = 1">去登录</a>
            </div>
          </div>
        </van-tab>
      </van-tabs>

      <div class="login-agreement">
        <van-checkbox v-model="agreed" icon-size="16" shape="square">
          <span class="login-agreement__text">
            我已阅读并同意
            <a class="login-agreement__link">《用户服务协议》</a>
            和
            <a class="login-agreement__link">《隐私政策》</a>
          </span>
        </van-checkbox>
      </div>

      <div class="login-third">
        <div class="login-third__divider">
          <span>其他登录方式</span>
        </div>
        <div class="login-third__icons">
          <div class="login-third__icon" @click="handleWechatLogin">
            <van-icon name="wechat" size="40" color="#07C160" />
            <span>微信登录</span>
          </div>
        </div>
      </div>

      <section class="login-proof-panel">
        <div
          v-for="item in socialProof"
          :key="item.label"
          class="login-proof-panel__item"
        >
          <strong>{{ item.value }}</strong>
          <span>{{ item.label }}</span>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { authApi } from '@/api/auth'
import { PHONE_REG, validatePhone, validateSmsCode, validatePassword, validateUsername } from '@/utils/validator'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeTab = ref(1)
const loading = ref(false)
const showLoginPwd = ref(false)
const showRegPwd = ref(false)
const showRegPwd2 = ref(false)
const showResetPwd = ref(false)
const showResetPwd2 = ref(false)
const agreed = ref(false)
const countdown = ref(0)
const resetCountdown = ref(0)
let countdownTimer = null
let resetCountdownTimer = null

const brandPills = ['红娘严选', '实名资料', '线下可见面']
const servicePromises = [
  { title: '先筛再聊', desc: '减少低质量打扰' },
  { title: '重视安全感', desc: '认证与人工复核并行' },
  { title: '适合长期关系', desc: '优先真实择偶意向' }
]
const socialProof = [
  { value: '1v1', label: '顾问式推荐' },
  { value: '98%', label: '资料核验率' },
  { value: '同城', label: '优先线下连接' }
]
const pathGuides = [
  { kicker: 'LOGIN', title: '已有账号', desc: '回到你的推荐、消息和红娘协作流程。', tab: 1 },
  { kicker: 'USER', title: '我是用户', desc: '先注册账号，再完成关系资料建档。', tab: 2, role: 'user' },
  { kicker: 'ADVISOR', title: '我是红娘', desc: '注册后进入会员经营和资源协作工作台。', tab: 2, role: 'matchmaker' }
]

const smsForm = reactive({
  phone: '',
  code: ''
})

const loginForm = reactive({
  username: '',
  password: ''
})

const regForm = reactive({
  username: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  role: 'user'
})

const resetForm = reactive({
  phone: '',
  code: '',
  password: '',
  confirmPassword: ''
})

async function handleSendSms() {
  const phoneError = validatePhone(smsForm.phone)
  if (phoneError) {
    showToast(phoneError)
    return
  }

  try {
    await authApi.sendSms({ phone: smsForm.phone, type: 'login' })
    showToast('验证码已发送')
    countdown.value = 60
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(countdownTimer)
        countdownTimer = null
      }
    }, 1000)
  } catch (err) {
    // request interceptor handles error toast
  }
}

async function handleSendResetSms() {
  const phoneError = validatePhone(resetForm.phone)
  if (phoneError) {
    showToast(phoneError)
    return
  }

  try {
    await authApi.sendSms({ phone: resetForm.phone, type: 'reset_password' })
    showToast('验证码已发送')
    resetCountdown.value = 60
    resetCountdownTimer = setInterval(() => {
      resetCountdown.value--
      if (resetCountdown.value <= 0) {
        clearInterval(resetCountdownTimer)
        resetCountdownTimer = null
      }
    }, 1000)
  } catch (err) {
    // request interceptor handles error toast
  }
}

async function handleSmsLogin() {
  if (!checkAgreement()) return

  const phoneError = validatePhone(smsForm.phone)
  if (phoneError) { showToast(phoneError); return }

  const codeError = validateSmsCode(smsForm.code)
  if (codeError) { showToast(codeError); return }

  loading.value = true
  try {
    const data = await userStore.loginBySms(smsForm.phone, smsForm.code, route.query.inviteCode || '')
    navigateAfterLogin(data)
  } catch (err) {
    // error handled by interceptor
  } finally {
    loading.value = false
  }
}

async function handleUsernameLogin() {
  if (!checkAgreement()) return

  const account = loginForm.username.trim()
  if (!account) {
    showToast('请输入用户名/手机号')
    return
  }

  const isPhoneLogin = PHONE_REG.test(account)
  const usernameError = isPhoneLogin ? '' : validateUsername(account)
  if (usernameError) { showToast(usernameError); return }

  const passwordError = validatePassword(loginForm.password)
  if (passwordError) { showToast(passwordError); return }

  loading.value = true
  try {
    const data = isPhoneLogin
      ? await userStore.loginByPassword(account, loginForm.password)
      : await userStore.loginByUsername(account, loginForm.password)
    navigateAfterLogin(data)
  } catch (err) {
    // error handled by interceptor
  } finally {
    loading.value = false
  }
}

async function handleResetPassword() {
  const phoneError = validatePhone(resetForm.phone)
  if (phoneError) { showToast(phoneError); return }

  const codeError = validateSmsCode(resetForm.code)
  if (codeError) { showToast(codeError); return }

  const passwordError = validatePassword(resetForm.password)
  if (passwordError) { showToast(passwordError); return }

  if (resetForm.password !== resetForm.confirmPassword) {
    showToast('两次输入的密码不一致')
    return
  }

  loading.value = true
  try {
    await authApi.resetPassword({
      phone: resetForm.phone,
      code: resetForm.code,
      newPassword: resetForm.password
    })
    showToast('密码重置成功，请使用新密码登录')
    loginForm.username = resetForm.phone
    loginForm.password = ''
    resetForm.code = ''
    resetForm.password = ''
    resetForm.confirmPassword = ''
    activeTab.value = 1
  } catch (err) {
    // request interceptor handles error toast
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  if (!checkAgreement()) return

  const usernameError = validateUsername(regForm.username)
  if (usernameError) { showToast(usernameError); return }

  const passwordError = validatePassword(regForm.password)
  if (passwordError) { showToast(passwordError); return }

  if (regForm.password !== regForm.confirmPassword) {
    showToast('两次输入的密码不一致')
    return
  }

  loading.value = true
  try {
    const data = await userStore.registerByUsername(
      regForm.username,
      regForm.password,
      regForm.nickname || undefined,
      regForm.role
    )
    showToast('注册成功')
    navigateAfterLogin(data)
  } catch (err) {
    // error handled by interceptor
  } finally {
    loading.value = false
  }
}

function handleWechatLogin() {
  showToast('微信登录开发中...')
}

function handlePathGuide(item) {
  if (item.role) {
    regForm.role = item.role
  }
  activeTab.value = item.tab
}

function checkAgreement() {
  if (!agreed.value) {
    showToast('请先同意用户协议和隐私政策')
    return false
  }
  return true
}

function navigateAfterLogin(data) {
  const redirect = route.query.redirect
  if (redirect) {
    router.replace(redirect)
  } else {
    const path = data?.user?.currentRole === 'matchmaker' ? '/matchmaker/profile' : '/user/home'
    router.replace(path)
  }
}

onBeforeUnmount(() => {
  if (countdownTimer) clearInterval(countdownTimer)
  if (resetCountdownTimer) clearInterval(resetCountdownTimer)
})
</script>

<style scoped>
.login-page {
  overflow-x: hidden;
  min-height: 100vh;
}

.login-header {
  position: relative;
  margin: 0 14px;
  padding: calc(env(safe-area-inset-top) + 24px) 22px 28px;
  border-radius: 0 0 var(--ifu-radius-lg) var(--ifu-radius-lg);
  background:
    radial-gradient(circle at 20% 18%, rgba(255, 255, 255, 0.18), transparent 22%),
    radial-gradient(circle at 82% 12%, rgba(243, 223, 194, 0.26), transparent 18%),
    linear-gradient(145deg, #8f6840 0%, #b38a58 52%, #d0b07c 100%);
  color: #fff9f1;
  overflow: hidden;
  box-shadow: var(--ifu-shadow-card);
}

.login-header__halo,
.login-header__ornament {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.login-header__halo {
  width: 180px;
  height: 180px;
  top: -68px;
  right: -42px;
  background: rgba(255, 244, 228, 0.13);
}

.login-header__ornament {
  width: 96px;
  height: 96px;
  left: -18px;
  bottom: 46px;
  border: 1px solid rgba(255, 250, 241, 0.18);
}

.login-header__topline,
.login-header__logo,
.login-header__title,
.login-header__subtitle,
.login-header__pill-row,
.login-header__promise-grid {
  position: relative;
  z-index: 1;
}

.login-header__topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.login-header__status {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 248, 239, 0.16);
  background: rgba(255, 248, 239, 0.1);
  font-size: 12px;
}

.login-header__logo {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  margin: 20px auto 10px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255, 248, 239, 0.22), rgba(255, 248, 239, 0.08));
  border: 1px solid rgba(255, 248, 239, 0.18);
  backdrop-filter: blur(10px);
}

.login-header__title {
  text-align: center;
  font-size: 34px;
  color: #fff9f1;
  margin-bottom: 8px;
}

.login-header__subtitle {
  text-align: center;
  font-size: 14px;
  color: rgba(255, 249, 241, 0.88);
}

.login-header__pill-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.login-header__pill {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 248, 239, 0.14);
  border: 1px solid rgba(255, 248, 239, 0.14);
  font-size: 12px;
}

.login-header__promise-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
}

.login-header__promise {
  padding: 12px 10px;
  border-radius: 18px;
  background: rgba(255, 248, 239, 0.1);
  border: 1px solid rgba(255, 248, 239, 0.14);
  text-align: left;
}

.login-header__promise strong {
  display: block;
  font-size: 13px;
  font-weight: 600;
}

.login-header__promise span {
  display: block;
  margin-top: 5px;
  font-size: 11px;
  color: rgba(255, 249, 241, 0.74);
}

.login-form-wrapper {
  margin: -18px 16px 0;
  padding: 22px 18px 26px;
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.84);
  border-radius: var(--ifu-radius-lg);
  border: 1px solid rgba(233, 221, 204, 0.94);
  box-shadow: var(--ifu-shadow-float);
  backdrop-filter: blur(16px);
}

.login-editorial-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
  padding: 16px;
  border-radius: 22px;
  background: linear-gradient(180deg, #fffaf3, #f8efe2);
  border: 1px solid rgba(226, 205, 169, 0.6);
}

.login-editorial-card h2 {
  font-size: 22px;
  line-height: 1.25;
  margin-top: 4px;
}

.login-editorial-card p {
  font-size: 13px;
  line-height: 1.65;
  color: var(--ifu-text);
}

.login-path-panel {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.login-path-panel__item {
  padding: 13px 12px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 252, 248, 0.94), rgba(249, 241, 230, 0.76));
  border: 1px solid rgba(233, 221, 204, 0.86);
  cursor: pointer;
}

.login-path-panel__item span {
  color: var(--ifu-text-muted);
  font-size: 10px;
  letter-spacing: 0;
}

.login-path-panel__item strong {
  display: block;
  margin-top: 6px;
  color: var(--ifu-text-strong);
  font-size: 14px;
}

.login-path-panel__item p {
  margin-top: 6px;
  color: var(--ifu-text-muted);
  font-size: 11px;
  line-height: 1.5;
}

.login-form-wrapper :deep(.van-tabs__nav) {
  padding: 4px;
  border-radius: 18px;
  background: #efe8de;
}

.login-form-wrapper :deep(.van-tab) {
  color: var(--ifu-text-muted);
}

.login-form-wrapper :deep(.van-tab--active) {
  color: var(--ifu-text-strong);
}

.login-form-wrapper :deep(.van-tabs__line) {
  bottom: 8px;
  height: 28px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
}

.login-form {
  padding-top: 16px;
}

.login-form :deep(.van-field) {
  margin-bottom: 12px;
  background: rgba(250, 245, 237, 0.84);
  border-radius: 18px;
}

.login-form__submit {
  margin-top: 22px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

.login-form__tip {
  margin-top: 16px;
  text-align: center;
  font-size: 13px;
  color: var(--ifu-text);
}

.login-form__link {
  color: var(--ifu-gold-700);
  cursor: pointer;
}

.login-form__separator {
  margin: 0 6px;
  color: var(--ifu-text-muted);
}

.login-agreement {
  margin-top: 20px;
  padding: 0 4px;
}

.login-agreement :deep(.van-checkbox__icon) {
  border-radius: 8px;
}

.login-agreement__text {
  font-size: 12px;
  color: var(--ifu-text-muted);
}

.login-agreement__link {
  color: var(--ifu-gold-700);
}

.login-third {
  margin-top: 26px;
}

.login-third__divider {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.login-third__divider::before,
.login-third__divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--hl-border-color);
}

.login-third__divider span {
  font-size: 12px;
  color: var(--ifu-text-muted);
  padding: 0 16px;
}

.login-third__icons {
  display: flex;
  justify-content: center;
}

.login-third__icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.login-third__icon span {
  font-size: 12px;
  color: var(--ifu-text);
}

.login-proof-panel {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 24px;
}

.login-proof-panel__item {
  padding: 12px 10px;
  border-radius: 18px;
  text-align: center;
  background: rgba(255, 250, 242, 0.8);
  border: 1px solid rgba(226, 205, 169, 0.48);
}

.login-proof-panel__item strong {
  display: block;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 20px;
  color: var(--ifu-text-strong);
}

.login-proof-panel__item span {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--ifu-text-muted);
}

.role-select {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  margin-top: 8px;
}

.role-select__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 8px;
  border: 1px solid rgba(219, 199, 173, 0.9);
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--ifu-text);
}

.role-select__item--active {
  border-color: rgba(166, 124, 82, 0.5);
  background: linear-gradient(180deg, #fff7eb, rgba(226, 205, 169, 0.28));
  color: var(--ifu-text-strong);
}

.role-select__label {
  font-size: 13px;
  font-weight: 500;
}

.role-select__desc {
  font-size: 11px;
  color: var(--ifu-text-muted);
}

@media (max-width: 380px) {
  .login-header__promise-grid,
  .login-proof-panel,
  .login-path-panel {
    grid-template-columns: 1fr;
  }
}
</style>
