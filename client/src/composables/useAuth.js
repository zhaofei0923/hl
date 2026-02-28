import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

export function useAuth() {
  const router = useRouter()
  const userStore = useUserStore()

  const isLoggedIn = computed(() => userStore.isLoggedIn)
  const isMatchmaker = computed(() => userStore.isMatchmaker)
  const userInfo = computed(() => userStore.userInfo)
  const currentRole = computed(() => userStore.userInfo?.currentRole || 'user')

  async function logout() {
    await userStore.logout()
    router.replace('/login')
  }

  async function switchRole() {
    const newRole = currentRole.value === 'matchmaker' ? 'user' : 'matchmaker'
    await userStore.switchRole(newRole)
    router.replace(newRole === 'matchmaker' ? '/matchmaker/profile' : '/user/home')
  }

  function requireAuth() {
    if (!isLoggedIn.value) {
      router.replace('/login')
      return false
    }
    return true
  }

  return { isLoggedIn, isMatchmaker, userInfo, currentRole, logout, switchRole, requireAuth }
}
