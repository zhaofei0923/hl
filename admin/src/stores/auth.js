import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminLogin } from '../api/admin'
import { ElMessage } from 'element-plus'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('admin_token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('admin_user') || 'null'))

  const login = async (username, password) => {
    try {
      const res = await adminLogin({ username, password })
      const { token: newToken, user } = res.data
      
      // Verify admin role
      if (!user.isAdmin) {
        ElMessage.error('您没有管理员权限')
        return false
      }

      token.value = newToken
      userInfo.value = user
      localStorage.setItem('admin_token', newToken)
      localStorage.setItem('admin_user', JSON.stringify(user))
      return true
    } catch (err) {
      return false
    }
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    router.push('/login')
  }

  const isLoggedIn = () => !!token.value

  return { token, userInfo, login, logout, isLoggedIn }
})
