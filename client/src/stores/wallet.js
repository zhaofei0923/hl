import { defineStore } from 'pinia'
import { walletApi } from '@/api/wallet'

export const useWalletStore = defineStore('wallet', {
  state: () => ({
    availableAmount: 0,
    frozenAmount: 0,
    xiCoins: 0,
    todayEarning: 0,
    monthEarning: 0,
    pendingWithdraw: 0
  }),

  actions: {
    async fetchWalletInfo() {
      const res = await walletApi.getInfo()
      Object.assign(this, res.data)
      return res.data
    },

    async fetchEarningsSummary() {
      const res = await walletApi.getEarningsSummary()
      this.todayEarning = res.data.todayEarning
      this.monthEarning = res.data.monthEarning
      this.pendingWithdraw = res.data.pendingWithdraw
      return res.data
    }
  }
})
