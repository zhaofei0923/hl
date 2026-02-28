import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'
import { userApi } from '@/api/user'
import { getToken, setToken, removeToken, getRefreshToken, setRefreshToken, removeRefreshToken } from '@/utils/storage'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken() || '',
    refreshToken: getRefreshToken() || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),
    matchmakerInfo: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isMatchmaker: (state) => state.userInfo?.currentRole === 'matchmaker',
    isUser: (state) => state.userInfo?.currentRole === 'user'
  },

  actions: {
    // 短信验证码登录
    async loginBySms(phone, code, inviteCode) {
      const payload = { phone, code }
      if (inviteCode) payload.inviteCode = inviteCode
      const res = await authApi.smsLogin(payload)
      this.handleLoginSuccess(res.data)
      return res.data
    },

    // 密码登录
    async loginByPassword(phone, password) {
      const res = await authApi.passwordLogin({ phone, password })
      this.handleLoginSuccess(res.data)
      return res.data
    },

    // 微信登录
    async loginByWechat(code) {
      const res = await authApi.wechatLogin({ code })
      this.handleLoginSuccess(res.data)
      return res.data
    },

    // 用户名注册
    async registerByUsername(username, password, nickname, role) {
      const res = await authApi.usernameRegister({ username, password, nickname, role })
      this.handleLoginSuccess(res.data)
      return res.data
    },

    // 用户名密码登录
    async loginByUsername(username, password) {
      const res = await authApi.usernameLogin({ username, password })
      this.handleLoginSuccess(res.data)
      return res.data
    },

    // 处理登录成功
    handleLoginSuccess(data) {
      this.token = data.token
      this.refreshToken = data.refreshToken
      this.userInfo = data.user
      setToken(data.token)
      setRefreshToken(data.refreshToken)
      localStorage.setItem('userInfo', JSON.stringify(data.user))
    },

    // 获取用户信息
    async fetchUserInfo() {
      const res = await userApi.getProfile()
      this.userInfo = res.data
      localStorage.setItem('userInfo', JSON.stringify(res.data))
      return res.data
    },

    // 切换角色
    async switchRole(role) {
      const res = await userApi.switchRole(role)
      this.userInfo.currentRole = role
      // 能切换说明用户拥有双重角色
      this.userInfo.hasMatchmakerRole = true
      if (res.data.token) {
        this.token = res.data.token
        setToken(res.data.token)
      }
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
      return res.data
    },

    // 刷新Token
    async refreshTokenAction() {
      const res = await authApi.refreshToken({ refreshToken: this.refreshToken })
      this.token = res.data.token
      this.refreshToken = res.data.refreshToken
      setToken(res.data.token)
      setRefreshToken(res.data.refreshToken)
      return res.data
    },

    // 退出登录
    logout() {
      this.token = ''
      this.refreshToken = ''
      this.userInfo = null
      this.matchmakerInfo = null
      removeToken()
      removeRefreshToken()
      localStorage.removeItem('userInfo')
    }
  }
})
