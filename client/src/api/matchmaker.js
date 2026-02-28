import request from './request'

export const matchmakerApi = {
  // 婚介首页统计数据
  getDashboard() {
    return request.get('/matchmaker/dashboard')
  },

  // 申请成为婚介
  apply(data) {
    return request.post('/matchmaker/apply', data)
  },

  // 获取婚介信息
  getInfo() {
    return request.get('/matchmaker/info')
  },

  // 更新婚介信息
  updateInfo(data) {
    return request.put('/matchmaker/info', data)
  },

  // 获取团队信息
  getTeam() {
    return request.get('/matchmaker/team')
  },

  // 团队成员列表
  getTeamMembers(params) {
    return request.get('/matchmaker/team/members', { params })
  },

  // 申请开通实体店
  applyStore(data) {
    return request.post('/matchmaker/store/apply', data)
  },

  // 获取门店信息
  getStore() {
    return request.get('/matchmaker/store')
  },

  // 更新门店信息
  updateStore(data) {
    return request.put('/matchmaker/store', data)
  },

  // 我的红娘列表
  getMyMatchmakers(params) {
    return request.get('/matchmaker/my-matchmakers', { params })
  },

  // 获取邀请码
  getInviteCode() {
    return request.get('/matchmaker/invite/code')
  },

  // 邀请记录
  getInviteRecords(params) {
    return request.get('/matchmaker/invite/records', { params })
  }
}
