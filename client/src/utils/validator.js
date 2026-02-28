// 手机号正则
export const PHONE_REG = /^1[3-9]\d{9}$/

// 验证码正则
export const SMS_CODE_REG = /^\d{4,6}$/

// 密码正则 (6-32位)
export const PASSWORD_REG = /^.{6,32}$/

// 用户名正则 (3-20位，字母/数字/下划线/中文)
export const USERNAME_REG = /^[a-zA-Z0-9_\u4e00-\u9fa5]{3,20}$/

export function validatePhone(phone) {
  if (!phone) return '请输入手机号'
  if (!PHONE_REG.test(phone)) return '请输入正确的手机号'
  return ''
}

export function validateSmsCode(code) {
  if (!code) return '请输入验证码'
  if (!SMS_CODE_REG.test(code)) return '请输入正确的验证码'
  return ''
}

export function validatePassword(password) {
  if (!password) return '请输入密码'
  if (!PASSWORD_REG.test(password)) return '密码长度为6-32位'
  return ''
}

export function validateUsername(username) {
  if (!username) return '请输入用户名'
  if (!USERNAME_REG.test(username)) return '用户名3-20位，支持字母、数字、下划线或中文'
  return ''
}
