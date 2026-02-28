import request from './request'

export const authApi = {
  // 发送短信验证码
  sendSms(data) {
    return request.post('/auth/sms/send', data)
  },

  // 短信验证码登录
  smsLogin(data) {
    return request.post('/auth/sms/login', data)
  },

  // 账号密码登录
  passwordLogin(data) {
    return request.post('/auth/password/login', data)
  },

  // 设置/修改密码
  setPassword(data) {
    return request.post('/auth/password/set', data)
  },

  // 用户名注册
  usernameRegister(data) {
    return request.post('/auth/username/register', data)
  },

  // 用户名+密码登录
  usernameLogin(data) {
    return request.post('/auth/username/login', data)
  },

  // 微信登录
  wechatLogin(data) {
    return request.post('/auth/wechat/login', data)
  },

  // 微信绑定手机号
  wechatBindPhone(data) {
    return request.post('/auth/wechat/bindphone', data)
  },

  // 刷新Token
  refreshToken(data) {
    return request.post('/auth/token/refresh', data)
  },

  // 退出登录
  logout() {
    return request.post('/auth/logout')
  }
}
