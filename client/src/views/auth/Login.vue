<template>
  <div class="page login-page">
    <!-- 顶部品牌区域 -->
    <div class="login-header">
      <div class="login-header__logo">
        <van-icon name="like" size="48" color="#fff" />
      </div>
      <h1 class="login-header__title">婚恋平台</h1>
      <p class="login-header__subtitle">遇见对的人，从这里开始</p>
    </div>

    <!-- 根据上下文显示邀请提示 -->
    <van-notice-bar
      v-if="$route.query.inviteCode"
      left-icon="volume-o"
      text="您正在通过邀请链接注册，注册后将自动成为红娘会员"
      color="#1989fa"
      background="#ecf9ff"
    />

    <!-- 登录/注册表单 -->
    <div class="login-form-wrapper">
      <van-tabs v-model:active="activeTab" shrink animated>
        <!-- Tab 1: 短信验证码登录 -->
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

        <!-- Tab 2: 用户名密码登录 -->
        <van-tab title="账号登录">
          <div class="login-form">
            <van-field
              v-model="loginForm.username"
              placeholder="请输入用户名"
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
              还没有账号？
              <a class="login-form__link" @click="activeTab = 2">立即注册</a>
            </div>
          </div>
        </van-tab>

        <!-- Tab 3: 注册 -->
        <van-tab title="注册">
          <div class="login-form">
            <!-- 身份选择 -->
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
      </van-tabs>

      <!-- 协议勾选 -->
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

      <!-- 第三方登录 -->
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
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { authApi } from '@/api/auth'
import { validatePhone, validateSmsCode, validatePassword, validateUsername } from '@/utils/validator'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeTab = ref(1) // 默认显示账号登录
const loading = ref(false)
const showLoginPwd = ref(false)
const showRegPwd = ref(false)
const showRegPwd2 = ref(false)
const agreed = ref(false)
const countdown = ref(0)
let countdownTimer = null

// 短信登录表单
const smsForm = reactive({
  phone: '',
  code: ''
})

// 用户名登录表单
const loginForm = reactive({
  username: '',
  password: ''
})

// 注册表单
const regForm = reactive({
  username: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  role: 'user'
})

// 发送短信验证码
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

// 短信验证码登录
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

// 用户名密码登录
async function handleUsernameLogin() {
  if (!checkAgreement()) return

  const usernameError = validateUsername(loginForm.username)
  if (usernameError) { showToast(usernameError); return }

  const passwordError = validatePassword(loginForm.password)
  if (passwordError) { showToast(passwordError); return }

  loading.value = true
  try {
    const data = await userStore.loginByUsername(loginForm.username, loginForm.password)
    navigateAfterLogin(data)
  } catch (err) {
    // error handled by interceptor
  } finally {
    loading.value = false
  }
}

// 注册
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

// 微信登录
function handleWechatLogin() {
  showToast('微信登录开发中...')
}

// 协议检查
function checkAgreement() {
  if (!agreed.value) {
    showToast('请先同意用户协议和隐私政策')
    return false
  }
  return true
}

// 登录成功后跳转
function navigateAfterLogin(data) {
  const redirect = route.query.redirect
  if (redirect) {
    router.replace(redirect)
  } else {
    const path = data?.user?.currentRole === 'matchmaker' ? '/matchmaker/profile' : '/user/home'
    router.replace(path)
  }
}
</script>

<style scoped>
.login-page {
  background: var(--hl-bg-color);
  min-height: 100vh;
}

.login-header {
  background: linear-gradient(135deg, var(--hl-accent-color), var(--hl-primary-color));
  padding: 60px 20px 40px;
  text-align: center;
  border-radius: 0 0 30px 30px;
}

.login-header__logo {
  margin-bottom: 12px;
}

.login-header__title {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}

.login-header__subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
}

.login-form-wrapper {
  margin: -20px 16px 0;
  background: var(--hl-card-bg);
  border-radius: var(--hl-radius-lg);
  padding: 24px 16px;
  position: relative;
  z-index: 1;
}

.login-form {
  padding-top: 16px;
}

.login-form :deep(.van-field) {
  margin-bottom: 12px;
  background: var(--hl-bg-color);
  border-radius: var(--hl-radius-sm);
}

.login-form__submit {
  margin-top: 24px;
  height: 44px;
  font-size: 16px;
}

.login-form__tip {
  margin-top: 16px;
  text-align: center;
  font-size: 13px;
  color: var(--hl-text-secondary);
}

.login-form__link {
  color: var(--hl-primary-color);
  cursor: pointer;
}

.login-agreement {
  margin-top: 20px;
  padding: 0 4px;
}

.login-agreement__text {
  font-size: 12px;
  color: var(--hl-text-placeholder);
}

.login-agreement__link {
  color: var(--hl-primary-color);
}

.login-third {
  margin-top: 32px;
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
  color: var(--hl-text-placeholder);
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
  color: var(--hl-text-secondary);
}

/* 身份选择 */
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
  border: 2px solid var(--hl-border-color);
  border-radius: var(--hl-radius-sm);
  cursor: pointer;
  transition: all 0.2s;
  color: var(--hl-text-secondary);
}

.role-select__item--active {
  border-color: var(--hl-primary-color);
  background: rgba(255, 125, 65, 0.06);
  color: var(--hl-primary-color);
}

.role-select__label {
  font-size: 13px;
  font-weight: 500;
}

.role-select__desc {
  font-size: 11px;
  opacity: 0.8;
}
</style>
