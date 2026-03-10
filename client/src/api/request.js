import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'
import router from '@/router'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    // FormData 上传时让浏览器自动设置 Content-Type（含 boundary）
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
let isRefreshing = false
let pendingRequests = []

request.interceptors.response.use(
  (response) => {
    const { code, message, data } = response.data
    if (code === 0 || code === 200) {
      return response.data
    }
    showToast(message || '请求失败')
    return Promise.reject(new Error(message))
  },
  async (error) => {
    const { response } = error
    if (!response) {
      showToast('网络异常，请检查网络连接')
      return Promise.reject(error)
    }

    const { status } = response
    const userStore = useUserStore()

    if (status === 401) {
      // Token 过期，尝试刷新
      if (!isRefreshing && userStore.refreshToken) {
        isRefreshing = true
        try {
          await userStore.refreshTokenAction()
          isRefreshing = false
          // 重试所有挂起的请求
          pendingRequests.forEach(cb => cb())
          pendingRequests = []
          return request(error.config)
        } catch (refreshError) {
          isRefreshing = false
          pendingRequests = []
          userStore.logout()
          router.push('/login')
          return Promise.reject(refreshError)
        }
      }

      if (isRefreshing) {
        // 等待 token 刷新完成
        return new Promise((resolve) => {
          pendingRequests.push(() => resolve(request(error.config)))
        })
      }

      userStore.logout()
      router.push('/login')
    } else if (status === 403) {
      showToast('无权限访问')
    } else if (status === 404) {
      showToast('请求的资源不存在')
    } else if (status >= 500) {
      showToast('服务器异常，请稍后重试')
    } else {
      showToast(response.data?.message || '请求失败')
    }

    return Promise.reject(error)
  }
)

export default request
