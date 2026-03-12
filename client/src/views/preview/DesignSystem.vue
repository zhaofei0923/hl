<template>
  <div class="system-page" data-testid="design-system-preview">
    <header class="system-page__header">
      <div>
        <span class="brand-label">02 DESIGN SYSTEM</span>
        <h1>Champagne Gold Tokens</h1>
      </div>
      <p>同一套香槟金 token 同时服务移动端情绪感页面和后台运营控制台。</p>
    </header>

    <section class="system-section">
      <h2>Core Palette</h2>
      <div class="token-grid">
        <article v-for="token in colorTokens" :key="token.label" class="token-card">
          <div class="token-card__swatch" :style="{ background: token.value }"></div>
          <strong>{{ token.label }}</strong>
          <span>{{ token.value }}</span>
        </article>
      </div>
    </section>

    <section class="system-section">
      <h2>Mobile Components</h2>
      <div class="component-row">
        <div class="component-card">
          <span class="brand-chip brand-chip--active">主按钮</span>
          <span class="brand-chip">次按钮</span>
          <span class="brand-chip brand-chip--ghost">筛选 Chip</span>
        </div>
        <div class="component-card">
          <div class="component-card__badge-row">
            <span class="brand-chip brand-chip--ghost">实名资料</span>
            <span class="brand-chip brand-chip--ghost">红娘初筛</span>
          </div>
          <p>推荐卡、信任徽章、TabBar、空状态都使用统一圆角和浅层叠关系。</p>
        </div>
      </div>
    </section>

    <section class="system-section">
      <h2>Admin Console Components</h2>
      <div class="admin-row">
        <article class="admin-card">
          <span class="brand-label">PRIORITY CARD</span>
          <strong>今日优先处理</strong>
          <p>待审提现、认证审核、活动排期</p>
        </article>
        <article class="admin-card admin-card--stat">
          <span class="brand-label">STAT</span>
          <strong>25</strong>
          <p>总用户数</p>
        </article>
        <article class="admin-card">
          <span class="brand-label">STATUS TAG</span>
          <div class="admin-card__tags">
            <span class="admin-tag admin-tag--success">已认证</span>
            <span class="admin-tag admin-tag--warning">审核中</span>
            <span class="admin-tag admin-tag--danger">已拒绝</span>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
const colorTokens = [
  { label: 'Gold 700', value: '#A67C52' },
  { label: 'Gold 500', value: '#C8A977' },
  { label: 'Gold 100', value: '#F6EBDD' },
  { label: 'Background', value: '#FBF7F1' },
  { label: 'Text Strong', value: '#3A2E23' },
  { label: 'Border', value: '#E9DDCC' }
]
</script>

<style scoped>
.system-page {
  min-height: 100vh;
  padding: 36px 24px 56px;
  background: linear-gradient(180deg, #fffdf9, var(--ifu-bg));
}

.system-page__header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: end;
}

.system-page__header h1 {
  margin-top: 8px;
  font-size: 48px;
}

.system-page__header p {
  max-width: 420px;
  font-size: 15px;
  line-height: 1.75;
  color: var(--ifu-text);
}

.system-section {
  margin-top: 34px;
}

.system-section h2 {
  margin-bottom: 16px;
  font-size: 30px;
}

.token-grid,
.admin-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.token-card,
.component-card,
.admin-card {
  padding: 20px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(233, 221, 204, 0.94);
  box-shadow: var(--ifu-shadow-soft);
}

.token-card__swatch {
  height: 120px;
  border-radius: 22px;
  margin-bottom: 14px;
}

.token-card strong,
.admin-card strong {
  display: block;
  font-size: 24px;
  color: var(--ifu-text-strong);
}

.token-card span,
.admin-card p {
  display: block;
  margin-top: 8px;
  color: var(--ifu-text-muted);
}

.component-row {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 18px;
}

.component-card__badge-row {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.component-card p {
  margin-top: 14px;
  font-size: 15px;
  line-height: 1.75;
  color: var(--ifu-text);
}

.admin-card--stat strong {
  font-size: 48px;
}

.admin-card__tags {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.admin-tag {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
}

.admin-tag--success {
  background: rgba(126, 154, 120, 0.16);
  color: var(--ifu-success);
}

.admin-tag--warning {
  background: rgba(194, 139, 78, 0.14);
  color: var(--ifu-warning);
}

.admin-tag--danger {
  background: rgba(168, 93, 82, 0.12);
  color: var(--ifu-danger);
}
</style>
