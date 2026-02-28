import request from './request'

export const matchApi = {
  getDailyMatches() {
    return request.get('/match/daily')
  },
  getRecommendations(params) {
    return request.get('/match/recommend', { params })
  },
  likeUser(userId) {
    return request.post(`/match/like/${userId}`)
  },
  getMutualMatches(params) {
    return request.get('/match/mutual', { params })
  }
}
