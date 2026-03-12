import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '管理员登录' }
  },
  {
    path: '/preview/console-redesign',
    name: 'PreviewConsoleRedesign',
    component: () => import('../views/preview/ConsoleRedesign.vue'),
    meta: { title: '后台高保真预览' }
  },
  {
    path: '/preview/operations-redesign',
    name: 'PreviewOperationsRedesign',
    component: () => import('../views/preview/OperationsRedesign.vue'),
    meta: { title: '后台运营列表高保真预览' }
  },
  {
    path: '/',
    component: () => import('../layout/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '数据概览', icon: 'DataAnalysis' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/Users.vue'),
        meta: { title: '会员管理', icon: 'User' }
      },
      {
        path: 'matchmakers',
        name: 'Matchmakers',
        component: () => import('../views/Matchmakers.vue'),
        meta: { title: '红娘管理', icon: 'Avatar' }
      },
      {
        path: 'withdrawals',
        name: 'Withdrawals',
        component: () => import('../views/Withdrawals.vue'),
        meta: { title: '提现审批', icon: 'Wallet' }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('../views/Orders.vue'),
        meta: { title: '订单管理', icon: 'Tickets' }
      },
      {
        path: 'salons',
        name: 'Salons',
        component: () => import('../views/Salons.vue'),
        meta: { title: '沙龙管理', icon: 'Calendar' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory('/admin/'),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - IFU` : 'IFU'
  
  const token = localStorage.getItem('admin_token')
  if (to.path !== '/login' && !to.path.startsWith('/preview') && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
