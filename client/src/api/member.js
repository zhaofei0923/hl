import request from './request'

export const memberApi = {
  // 获取会员邀请码
  getInviteCode() {
    return request.get('/member/invite-code')
  },

  // 会员列表
  getList(params) {
    return request.get('/member/list', { params })
  },

  // 会员详情
  getDetail(id) {
    return request.get(`/member/${id}`)
  },

  // 添加会员
  add(data) {
    return request.post('/member/add', data)
  },

  // 编辑会员资料
  updateProfile(id, data) {
    return request.put(`/member/${id}/profile`, data)
  },

  // 编辑会员权益
  updateRights(id, data) {
    return request.put(`/member/${id}/rights`, data)
  },

  // 打招呼
  greet(id) {
    return request.post(`/member/${id}/greet`)
  },

  // 速配
  speedMatch(id) {
    return request.post(`/member/${id}/speed-match`)
  },

  // 搜索会员
  search(params) {
    return request.get('/member/search', { params })
  },

  // 会员统计
  getStats() {
    return request.get('/member/stats')
  },

  // 推荐自己的会员给资源方（资源互推）
  recommend(data) {
    return request.post('/member/recommend', data)
  }
}
