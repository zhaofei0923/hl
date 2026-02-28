import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '管理员登录' }
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
        meta: { title: '用户管理', icon: 'User' }
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
  document.title = to.meta.title ? `${to.meta.title} - 婚恋管理后台` : '婚恋管理后台'
  
  const token = localStorage.getItem('admin_token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
