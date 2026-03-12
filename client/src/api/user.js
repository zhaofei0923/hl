import request from './request'

export const userApi = {
  // 获取当前用户资料
  getProfile() {
    return request.get('/user/profile')
  },

  // 获取指定用户的公开资料
  getPublicProfile(id) {
    return request.get(`/user/public/${id}`)
  },

  // 更新用户基础信息
  updateProfile(data) {
    return request.put('/user/profile', data)
  },

  // 更新用户详细资料
  updateProfileDetail(data) {
    return request.put('/user/profile/detail', data)
  },

  // 上传头像
  uploadAvatar(file) {
    const formData = new FormData()
    formData.append('avatar', file)
    return request.post('/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // 切换角色
  switchRole(role) {
    return request.put('/user/role/switch', { role })
  },

  // 获取认证状态
  getCertification() {
    return request.get('/user/certification')
  },

  // 提交实名认证
  submitCertification(data) {
    return request.post('/user/certification', data)
  }
}
