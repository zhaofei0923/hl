import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { ROLES } from '@/utils/constants'

export function useRole() {
  const userStore = useUserStore()

  const currentRole = computed(() => userStore.userInfo?.currentRole || ROLES.USER)
  const isMatchmaker = computed(() => currentRole.value === ROLES.MATCHMAKER)
  const isUser = computed(() => currentRole.value === ROLES.USER)

  const homePath = computed(() => isMatchmaker.value ? '/matchmaker/profile' : '/user/home')
  const tabBarType = computed(() => isMatchmaker.value ? 'matchmaker' : 'user')

  function getMenuItems() {
    if (isMatchmaker.value) {
      return [
        { icon: 'friends-o', text: '我的会员', path: '/matchmaker/members' },
        { icon: 'gold-coin-o', text: '我的钱包', path: '/matchmaker/wallet' },
        { icon: 'chart-trending-o', text: '业绩订单', path: '/matchmaker/orders' },
        { icon: 'manager-o', text: '婚介团', path: '/matchmaker/team' },
        { icon: 'apps-o', text: '全部资源', path: '/matchmaker/resources' },
        { icon: 'shop-o', text: '门店信息', path: '/matchmaker/store' },
        { icon: 'share-o', text: '邀请好友', path: '/matchmaker/invite' },
        { icon: 'qr', text: '收款码', path: '/matchmaker/qrcode' },
      ]
    }
    return [
      { icon: 'edit', text: '编辑资料', path: '/user/profile-edit' },
      { icon: 'shield-o', text: '认证中心', path: '/certification' },
      { icon: 'like-o', text: '推荐匹配', path: '/user/match-list' },
      { icon: 'setting-o', text: '设置', path: '/settings' },
    ]
  }

  return { currentRole, isMatchmaker, isUser, homePath, tabBarType, getMenuItems }
}
