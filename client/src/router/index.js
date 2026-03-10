import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  // ===== 认证页面 =====
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresAuth: false, title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { requiresAuth: false, title: '注册' }
  },

  // ===== 婚介端 =====
  {
    path: '/matchmaker',
    redirect: '/matchmaker/profile',
    children: [
      {
        path: 'profile',
        name: 'MatchmakerProfile',
        component: () => import('@/views/matchmaker/Profile.vue'),
        meta: { requiresAuth: true, role: 'matchmaker', tabBar: true, tabActive: 'mine', title: '我的' }
      },
      {
        path: 'members',
        name: 'MatchmakerMembers',
        component: () => import('@/views/matchmaker/Members.vue'),
        meta: { requiresAuth: true, role: 'matchmaker', title: '我的会员' }
      },
      {
        path: 'member/add',
        name: 'MemberAdd',
        component: () => import('@/views/matchmaker/MemberAdd.vue'),
        meta: { requiresAuth: true, role: 'matchmaker', title: '手动录入会员' }
      },
      {
        path: 'member/:id',
        name: 'MemberDetail',
        component: () => import('@/views/matchmaker/MemberDetail.vue'),
        meta: { requiresAuth: true, role: 'matchmaker', title: '会员详情' }
      },
      {
        path: 'member/:id/edit',
        name: 'MemberEdit',
        component: () => import('@/views/matchmaker/MemberEdit.vue'),
        meta: { requiresAuth: true, role: 'matchmaker', title: '编辑会员资料' }
      },
      {
        path: 'wallet',
        name: 'MatchmakerWallet',
        component: () => import('@/views/matchmaker/Wallet.vue'),
        meta: { requiresAuth: true, role: 'matchmaker', title: '我的钱包' }
      },
      {
        path: 'withdraw',
        name: 'MatchmakerWithdraw',
        component: () => import('@/views/matchmaker/Withdraw.vue'),
        meta: { requiresAuth: true, role: 'matchmaker', title: '提现' }
      },
      {
        path: 'team',
        name: 'MatchmakerTeam',
        component: () => import('@/views/matchmaker/Team.vue'),
        meta: { requiresAuth: true, role: 'matchmaker', title: '婚介团' }
      },
      {
        path: 'resources',
        name: 'MatchmakerResources',
        component: () => import('@/views/matchmaker/Resources.vue'),
        meta: { requiresAuth: true, role: 'matchmaker', title: '全部资源' }
      },
      {
        path: 'orders',
        name: 'MatchmakerOrders',
        component: () => import('@/views/matchmaker/Orders.vue'),
        meta: { requiresAuth: true, role: 'matchmaker', title: '业绩订单' }
      },
      {
        path: 'invite',
        name: 'MatchmakerInvite',
        component: () => import('@/views/matchmaker/InviteFriends.vue'),
        meta: { requiresAuth: true, role: 'matchmaker', title: '邀请好友' }
      },
      {
        path: 'store',
        name: 'MatchmakerStore',
        component: () => import('@/views/matchmaker/StoreInfo.vue'),
        meta: { requiresAuth: true, role: 'matchmaker', title: '门店信息' }
      },
      {
        path: 'my-matchmakers',
        name: 'MyMatchmakers',
        component: () => import('@/views/matchmaker/MyMatchmakers.vue'),
        meta: { requiresAuth: true, role: 'matchmaker', title: '我的红娘' }
      },
      {
        path: 'salon',
        name: 'MatchmakerSalon',
        component: () => import('@/views/matchmaker/Salon.vue'),
        meta: { requiresAuth: true, role: 'matchmaker', title: '沙龙活动' }
      },
      {
        path: 'salon/create',
        name: 'MatchmakerSalonCreate',
        component: () => import('@/views/matchmaker/SalonCreate.vue'),
        meta: { requiresAuth: true, role: 'matchmaker', title: '创建活动' }
      },
      {
        path: 'salon/edit/:id',
        name: 'MatchmakerSalonEdit',
        component: () => import('@/views/matchmaker/SalonCreate.vue'),
        meta: { requiresAuth: true, role: 'matchmaker', title: '编辑活动' }
      },
      {
        path: 'salon/:id',
        name: 'MatchmakerSalonDetail',
        component: () => import('@/views/matchmaker/SalonDetail.vue'),
        meta: { requiresAuth: true, role: 'matchmaker', title: '活动详情' }
      },
      {
        path: 'shop',
        name: 'MatchmakerShop',
        component: () => import('@/views/matchmaker/Shop.vue'),
        meta: { requiresAuth: true, role: 'matchmaker', title: '我的商城' }
      },
      {
        path: 'qrcode',
        name: 'MatchmakerQrCode',
        component: () => import('@/views/matchmaker/QrCode.vue'),
        meta: { requiresAuth: true, role: 'matchmaker', title: '官方收款码' }
      }
    ]
  },

  // ===== 用户端 =====
  {
    path: '/user',
    redirect: '/user/home',
    children: [
      {
        path: 'home',
        name: 'UserHome',
        component: () => import('@/views/user/Home.vue'),
        meta: { requiresAuth: true, role: 'user', tabBar: true, tabActive: 'home', title: '首页' }
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/views/user/Profile.vue'),
        meta: { requiresAuth: true, role: 'user', tabBar: true, tabActive: 'mine', title: '我的' }
      },
      {
        path: 'profile/edit',
        name: 'UserProfileEdit',
        component: () => import('@/views/user/ProfileEdit.vue'),
        meta: { requiresAuth: true, role: 'user', title: '编辑资料' }
      },
      {
        path: 'match-list',
        name: 'MatchList',
        component: () => import('@/views/user/MatchList.vue'),
        meta: { requiresAuth: true, role: 'user', title: '推荐匹配' }
      },
      {
        path: 'detail/:id',
        name: 'UserDetail',
        component: () => import('@/views/user/UserDetail.vue'),
        meta: { requiresAuth: true, role: 'user', title: '用户详情' }
      },
      {
        path: 'salon',
        name: 'UserSalon',
        component: () => import('@/views/user/Salon.vue'),
        meta: { requiresAuth: true, role: 'user', title: '沙龙活动' }
      },
      {
        path: 'salon/:id',
        name: 'UserSalonDetail',
        component: () => import('@/views/user/SalonDetail.vue'),
        meta: { requiresAuth: true, role: 'user', title: '活动详情' }
      }
    ]
  },

  // ===== 公共页面 =====
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/user/Settings.vue'),
    meta: { requiresAuth: true, title: '设置' }
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('@/views/common/Messages.vue'),
    meta: { requiresAuth: true, tabBar: true, tabActive: 'messages', title: '消息' }
  },
  {
    path: '/chat/:conversationId',
    name: 'Chat',
    component: () => import('@/views/common/Chat.vue'),
    meta: { requiresAuth: true, title: '聊天' }
  },
  {
    path: '/customer-service',
    name: 'CustomerService',
    component: () => import('@/views/common/CustomerService.vue'),
    meta: { requiresAuth: true, title: '客服中心' }
  },
  {
    path: '/certification',
    name: 'Certification',
    component: () => import('@/views/common/Certification.vue'),
    meta: { requiresAuth: true, title: '认证中心' }
  },

  // ===== 根路径重定向 =====
  {
    path: '/',
    redirect: '/login'
  },

  // ===== 404 =====
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFound.vue'),
    meta: { title: '页面未找到' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 婚恋平台`
  }

  const userStore = useUserStore()

  // 不需要认证的页面直接放行
  if (to.meta.requiresAuth === false) {
    if (userStore.isLoggedIn) {
      // 已登录用户访问登录页，重定向到对应首页
      const redirectPath = userStore.isMatchmaker ? '/matchmaker/profile' : '/user/home'
      next(redirectPath)
      return
    }
    next()
    return
  }

  // 需要认证但未登录
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  // 角色检查
  if (to.meta.role && to.meta.role !== userStore.userInfo?.currentRole) {
    const redirectPath = userStore.isMatchmaker ? '/matchmaker/profile' : '/user/home'
    next(redirectPath)
    return
  }

  next()
})

export default router
