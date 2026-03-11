import request from './request'

// Admin uses the same auth login endpoint, then the admin middleware validates isAdmin
export const adminLogin = (data) => request.post('/auth/username/login', data)

// Dashboard
export const getDashboardStats = () => request.get('/admin/dashboard/stats')
export const getUserTrend = (days = 7) => request.get('/admin/dashboard/user-trend', { params: { days } })
export const getOrderDistribution = () => request.get('/admin/dashboard/order-distribution')

// Users
export const getUsers = (params) => request.get('/admin/users', { params })
export const getUserDetail = (id) => request.get(`/admin/users/${id}`)
export const updateUserStatus = (id, status) => request.put(`/admin/users/${id}/status`, { status })

// Matchmakers
export const getMatchmakers = (params) => request.get('/admin/matchmakers', { params })
export const getMatchmakerDetail = (id) => request.get(`/admin/matchmakers/${id}`)
export const updateCertification = (id, certificationStatus) => request.put(`/admin/matchmakers/${id}/certification`, { certificationStatus })
export const updateMatchmakerLevel = (id, level) => request.put(`/admin/matchmakers/${id}/level`, { level })

// Withdrawals
export const getWithdrawals = (params) => request.get('/admin/withdrawals', { params })
export const approveWithdrawal = (id) => request.put(`/admin/withdrawals/${id}/approve`)
export const rejectWithdrawal = (id, rejectReason) => request.put(`/admin/withdrawals/${id}/reject`, { rejectReason })

// Orders
export const getOrders = (params) => request.get('/admin/orders', { params })
export const getOrderDetail = (id) => request.get(`/admin/orders/${id}`)

// Salons
export const getSalons = (params) => request.get('/admin/salons', { params })
export const getSalonDetail = (id) => request.get(`/admin/salons/${id}`)
export const createSalon = (data) => request.post('/admin/salons', data)
export const updateSalon = (id, data) => request.put(`/admin/salons/${id}`, data)
export const updateSalonStatus = (id, status) => request.put(`/admin/salons/${id}/status`, { status })

// User Certifications
export const getCertifications = (params) => request.get('/admin/certifications', { params })
export const reviewCertification = (id, action, rejectReason) => request.put(`/admin/certifications/${id}/review`, { action, rejectReason })
