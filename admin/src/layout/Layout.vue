<template>
  <el-container class="layout-container" data-testid="admin-brand-shell">
    <el-aside :width="isCollapse ? '88px' : '248px'" class="layout-aside">
      <div class="logo-area">
        <span class="brand-label">IFU CONSOLE</span>
        <strong v-if="!isCollapse" class="logo-text">香槟金运营台</strong>
        <strong v-else class="logo-text-mini">IFU</strong>
      </div>
      <el-menu :default-active="currentRoute" class="sidebar-menu" :collapse="isCollapse" router>
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>
            <div class="sidebar-title">
              <strong>{{ item.title }}</strong>
              <span>{{ item.desc }}</span>
            </div>
          </template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container class="layout-main-shell">
      <el-header class="layout-header">
        <div class="header-left">
          <button type="button" class="collapse-btn" @click="isCollapse = !isCollapse">
            <el-icon>
              <Fold v-if="!isCollapse" />
              <Expand v-else />
            </el-icon>
          </button>
          <div class="header-title">
            <span class="brand-label">TODAY'S CONTROL PANEL</span>
            <h1>{{ currentTitle }}</h1>
          </div>
        </div>
        <div class="header-right">
          <div class="header-user">
            <el-avatar :size="36" icon="UserFilled" />
            <div>
              <strong>{{ authStore.userInfo?.nickname || '管理员' }}</strong>
              <span>品牌与运营总览</span>
            </div>
          </div>
          <el-dropdown @command="handleCommand">
            <button type="button" class="header-action">操作</button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const authStore = useAuthStore()
const isCollapse = ref(false)

const menuItems = [
  { path: '/dashboard', title: '数据概览', desc: '总览与优先级', icon: 'DataAnalysis' },
  { path: '/users', title: '用户管理', desc: '资料与认证状态', icon: 'User' },
  { path: '/matchmakers', title: '红娘管理', desc: '等级与协作网络', icon: 'Avatar' },
  { path: '/withdrawals', title: '提现审批', desc: '风险与出款处理', icon: 'Wallet' },
  { path: '/orders', title: '订单管理', desc: '收入与服务类型', icon: 'Tickets' },
  { path: '/salons', title: '沙龙管理', desc: '活动创建与排期', icon: 'Calendar' }
]

const currentRoute = computed(() => route.path)
const currentTitle = computed(() => {
  const item = menuItems.find(m => m.path === route.path)
  return item?.title || '数据概览'
})

const handleCommand = (command) => {
  if (command === 'logout') {
    authStore.logout()
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  background: linear-gradient(180deg, #fffdf9, var(--ifu-bg));
}

.layout-aside {
  display: flex;
  flex-direction: column;
  padding: 18px 14px 14px;
  background: linear-gradient(180deg, var(--ifu-sidebar) 0%, var(--ifu-sidebar-soft) 100%);
  color: #fff8ef;
  transition: width 0.3s;
  overflow: hidden;
}

.logo-area {
  padding: 10px 14px 20px;
}

.logo-text,
.logo-text-mini {
  display: block;
  margin-top: 8px;
  color: #fff8ef;
  font-size: 24px;
}

.logo-text-mini {
  font-size: 20px;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  background: transparent;
  --el-menu-bg-color: transparent;
  --el-menu-text-color: rgba(255, 248, 239, 0.7);
  --el-menu-hover-bg-color: rgba(255, 248, 239, 0.08);
  --el-menu-active-color: #fff8ef;
}

.sidebar-menu :deep(.el-menu-item) {
  height: auto;
  margin-bottom: 10px;
  padding: 14px 14px !important;
  border-radius: 18px;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, rgba(200, 169, 119, 0.3), rgba(255, 248, 239, 0.08));
}

.sidebar-menu :deep(.el-menu-item .el-icon) {
  font-size: 18px;
}

.sidebar-title {
  display: flex;
  flex-direction: column;
  margin-left: 6px;
}

.sidebar-title strong {
  font-size: 14px;
  font-weight: 600;
}

.sidebar-title span {
  margin-top: 4px;
  font-size: 11px;
  color: rgba(255, 248, 239, 0.56);
}

.layout-main-shell {
  min-width: 0;
}

.layout-header {
  height: 92px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  background: rgba(255, 253, 249, 0.8);
  border-bottom: 1px solid rgba(233, 221, 204, 0.86);
  backdrop-filter: blur(16px);
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn,
.header-action {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border-radius: 16px;
  border: 1px solid rgba(233, 221, 204, 0.96);
  background: rgba(255, 255, 255, 0.84);
  color: var(--ifu-text-strong);
}

.header-title h1 {
  margin-top: 6px;
  font-size: 28px;
  color: var(--ifu-text-strong);
}

.header-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(233, 221, 204, 0.94);
}

.header-user strong {
  display: block;
  font-size: 14px;
  color: var(--ifu-text-strong);
}

.header-user span {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--ifu-text-muted);
}

.layout-main {
  padding: 0;
  background: transparent;
  overflow-y: auto;
}
</style>
