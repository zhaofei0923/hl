import request from './request'

export const walletApi = {
  // 钱包概览
  getInfo() {
    return request.get('/wallet/info')
  },

  // 收益记录
  getEarnings(params) {
    return request.get('/wallet/earnings', { params })
  },

  // 收益统计
  getEarningsSummary() {
    return request.get('/wallet/earnings/summary')
  },

  // 提现记录
  getWithdrawals(params) {
    return request.get('/wallet/withdrawals', { params })
  },

  // 发起提现
  withdraw(data) {
    return request.post('/wallet/withdraw', data)
  },

  // 转入记录
  getTransfers(params) {
    return request.get('/wallet/transfers', { params })
  }
}
