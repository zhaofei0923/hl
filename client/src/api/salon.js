import request from './request'

export const salonApi = {
  // === 公共接口 ===
  getEvents(params) {
    return request.get('/salon/events', { params })
  },
  getEventDetail(id) {
    return request.get(`/salon/events/${id}`)
  },
  register(id) {
    return request.post(`/salon/events/${id}/register`)
  },
  cancelRegistration(id) {
    return request.delete(`/salon/events/${id}/register`)
  },
  getMyRegistrations(params) {
    return request.get('/salon/my-registrations', { params })
  },

  // === 红娘专属接口 ===
  createEvent(data) {
    return request.post('/salon/events', data)
  },
  updateEvent(id, data) {
    return request.put(`/salon/events/${id}`, data)
  },
  cancelEvent(id) {
    return request.put(`/salon/events/${id}/cancel`)
  },
  getMyEvents(params) {
    return request.get('/salon/my-events', { params })
  },
  inviteMembers(eventId, userIds) {
    return request.post(`/salon/events/${eventId}/invite`, { userIds })
  }
}
