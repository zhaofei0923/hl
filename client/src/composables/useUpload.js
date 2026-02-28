import { ref } from 'vue'
import { showToast } from 'vant'
import { userApi } from '@/api/user'

export function useUpload(options = {}) {
  const { maxSize = 5 * 1024 * 1024, accept = ['image/jpeg', 'image/png', 'image/webp'] } = options

  const uploading = ref(false)
  const progress = ref(0)

  function beforeRead(file) {
    if (Array.isArray(file)) file = file[0]
    if (!accept.includes(file.type)) {
      showToast('请上传 jpg/png/webp 格式的图片')
      return false
    }
    if (file.size > maxSize) {
      showToast(`图片大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`)
      return false
    }
    return true
  }

  async function uploadAvatar(file) {
    uploading.value = true
    progress.value = 0
    try {
      const formData = new FormData()
      formData.append('avatar', file.file || file)
      const res = await userApi.uploadAvatar(formData)
      progress.value = 100
      return res.data?.avatarUrl || res.avatarUrl
    } catch (err) {
      showToast('上传失败，请重试')
      throw err
    } finally {
      uploading.value = false
    }
  }

  async function uploadImage(file, fieldName = 'file') {
    uploading.value = true
    try {
      const formData = new FormData()
      formData.append(fieldName, file.file || file)
      // Generic upload endpoint - can be customized
      const res = await userApi.uploadAvatar(formData)
      return res.data?.url || res.url || ''
    } catch (err) {
      showToast('上传失败')
      throw err
    } finally {
      uploading.value = false
    }
  }

  return { uploading, progress, beforeRead, uploadAvatar, uploadImage }
}
