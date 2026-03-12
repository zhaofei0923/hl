<template>
  <div class="login-container">
    <section class="login-stage">
      <div class="login-brand-panel">
        <span class="brand-label">ADMIN CONSOLE</span>
        <h1>IFU</h1>
        <p>Marriage Matchmaking Admin Panel</p>
        <div class="login-brand-panel__chips">
          <span>提现审批</span>
          <span>认证审核</span>
          <span>活动排期</span>
        </div>
      </div>

      <div class="login-card">
        <div class="login-header">
          <span class="brand-label">SIGN IN</span>
          <h2>进入运营管理平台</h2>
          <p>统一查看用户、红娘、订单与线下活动。</p>
        </div>
        <el-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleLogin">
          <el-form-item prop="username">
            <el-input v-model="form.username" prefix-icon="User" placeholder="管理员用户名" size="large" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="form.password" prefix-icon="Lock" type="password" placeholder="密码" size="large" show-password @keyup.enter="handleLogin" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="large" :loading="loading" style="width: 100%;" @click="handleLogin">
              登 录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const ok = await authStore.login(form.username, form.password)
      if (ok) {
        ElMessage.success('登录成功')
        router.push('/dashboard')
      }
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
  background:
    radial-gradient(circle at top left, rgba(200, 169, 119, 0.18), transparent 24%),
    linear-gradient(135deg, #f8efe1 0%, #fffaf4 50%, #f2e6d4 100%);
}

.login-stage {
  width: min(1040px, 100%);
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 26px;
  align-items: stretch;
}

.login-brand-panel,
.login-card {
  padding: 34px;
  border-radius: 32px;
  box-shadow: var(--ifu-shadow-card);
}

.login-brand-panel {
  background:
    radial-gradient(circle at top right, rgba(255, 249, 241, 0.16), transparent 20%),
    linear-gradient(145deg, #3a2e23, #7b5b39 56%, #b58c58);
  color: #fff8ef;
}

.login-brand-panel h1 {
  margin-top: 14px;
  font-size: 64px;
}

.login-brand-panel p {
  margin-top: 10px;
  font-size: 16px;
  color: rgba(255, 248, 239, 0.76);
}

.login-brand-panel__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 28px;
}

.login-brand-panel__chips span {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 248, 239, 0.14);
  background: rgba(255, 248, 239, 0.1);
  font-size: 12px;
}

.login-card {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(233, 221, 204, 0.94);
}

.login-header h2 {
  margin-top: 8px;
  font-size: 34px;
  color: var(--ifu-text-strong);
}

.login-header p {
  margin-top: 10px;
  margin-bottom: 24px;
  color: var(--ifu-text);
}

@media (max-width: 900px) {
  .login-stage {
    grid-template-columns: 1fr;
  }
}
</style>
