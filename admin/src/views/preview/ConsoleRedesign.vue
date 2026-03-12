<template>
  <div class="admin-preview" data-testid="preview-admin-redesign">
    <header class="admin-preview__header">
      <div>
        <span class="brand-label">06 ADMIN SUITE</span>
        <h1>后台高保真桌面套件</h1>
      </div>
      <p>登录与控制台保持同一香槟金品牌，但表达更克制、更适合运营决策与审批场景。</p>
    </header>

    <section class="admin-preview__stage">
      <article class="desktop-frame" data-testid="preview-admin-login-frame">
        <div class="desktop-frame__panel desktop-frame__panel--brand">
          <span class="brand-label">LOGIN</span>
          <h2>以礼宾式后台入口承接品牌体验</h2>
          <p>门店管理、提现审批、红娘协同与活动排期都使用同一套视觉资产。</p>
          <div class="desktop-pill-row">
            <span class="desktop-pill">运营控制</span>
            <span class="desktop-pill">门店协同</span>
            <span class="desktop-pill">品牌一致</span>
          </div>
        </div>
        <div class="desktop-frame__panel desktop-frame__panel--form">
          <span class="brand-label">SIGN IN</span>
          <strong>欢迎回来</strong>
          <div class="field-card">
            <label>管理员账号</label>
            <div>admin</div>
          </div>
          <div class="field-card">
            <label>登录密码</label>
            <div>••••••••••</div>
          </div>
          <button class="primary-action">进入 IFU Console</button>
        </div>
      </article>

      <article class="desktop-frame desktop-frame--dashboard" data-testid="preview-admin-dashboard-frame">
        <aside class="console-sidebar">
          <span class="brand-label">IFU CONSOLE</span>
          <strong>运营总览</strong>
          <nav class="console-nav">
            <a class="console-nav__item console-nav__item--active">数据概览</a>
            <a class="console-nav__item">用户管理</a>
            <a class="console-nav__item">提现审批</a>
            <a class="console-nav__item">沙龙管理</a>
          </nav>
        </aside>

        <div class="console-main">
          <div class="console-topbar">
            <div>
              <span class="brand-label">TODAY</span>
              <h2>今日优先处理</h2>
            </div>
            <div class="console-topbar__badge">待审批 7 项</div>
          </div>

          <section class="console-kpis">
            <article v-for="item in stats" :key="item.label" class="console-kpi">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
              <p>{{ item.desc }}</p>
            </article>
          </section>

          <section class="console-grid">
            <article class="console-card">
              <div class="console-card__head">
                <strong>审批提醒</strong>
                <span>按风险优先级排序</span>
              </div>
              <div class="approval-list">
                <article v-for="item in approvals" :key="item.name" class="approval-item">
                  <div>
                    <strong>{{ item.name }}</strong>
                    <p>{{ item.desc }}</p>
                  </div>
                  <b :class="['approval-item__tag', `approval-item__tag--${item.state}`]">{{ item.tag }}</b>
                </article>
              </div>
            </article>

            <article class="console-card console-card--warm">
              <div class="console-card__head">
                <strong>门店活动排期</strong>
                <span>本周线下节奏</span>
              </div>
              <div class="event-stack">
                <article v-for="item in salons" :key="item.title" class="event-stack__item">
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.desc }}</p>
                </article>
              </div>
            </article>
          </section>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
const stats = [
  { label: '待审提现', value: '07', desc: '较昨天新增 2 笔' },
  { label: '本周新增用户', value: '126', desc: '重点来源于线下活动' },
  { label: '活跃红娘', value: '18', desc: '其中 6 位门店本周表现突出' }
]

const approvals = [
  { name: '杭州市门店提现', desc: '金额 ¥8,600，超常规额度，需要二次复核。', tag: '高风险', state: 'danger' },
  { name: '王顾问认证资料', desc: '职业证明已补齐，可进入人工终审。', tag: '审核中', state: 'warning' },
  { name: '深圳活动预算', desc: '场地预定完成，预算已在合理区间。', tag: '已就绪', state: 'success' }
]

const salons = [
  { title: '周五夜场观影局', desc: '已确认 22 人，需补 3 位候补名单。' },
  { title: '周六午后茶叙', desc: '建议追加 1 位红娘主持，提升到场转化。' }
]
</script>

<style scoped>
.admin-preview {
  min-height: 100vh;
  padding: 40px 28px 60px;
  background:
    radial-gradient(circle at 10% 10%, rgba(200, 169, 119, 0.14), transparent 24%),
    linear-gradient(180deg, #fffcf8 0%, #f7f1e7 100%);
}

.admin-preview__header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 24px;
}

.admin-preview__header h1 {
  margin-top: 8px;
  font-size: 52px;
  line-height: 1.05;
}

.admin-preview__header p {
  max-width: 420px;
  color: var(--ifu-text);
  line-height: 1.8;
}

.admin-preview__stage {
  display: grid;
  gap: 26px;
  margin-top: 34px;
}

.desktop-frame {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 18px;
  padding: 20px;
  border-radius: 34px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(233, 221, 204, 0.96);
  box-shadow: 0 26px 60px rgba(83, 59, 33, 0.12);
}

.desktop-frame--dashboard {
  grid-template-columns: 240px 1fr;
}

.desktop-frame__panel {
  min-height: 360px;
  padding: 28px;
  border-radius: 28px;
}

.desktop-frame__panel--brand {
  background: linear-gradient(145deg, #8e6941, #bc9662 62%, #ead7b7);
  color: #fffaf4;
}

.desktop-frame__panel--brand h2 {
  margin-top: 10px;
  font-size: 38px;
  line-height: 1.16;
}

.desktop-frame__panel--brand p {
  margin-top: 10px;
  line-height: 1.8;
}

.desktop-pill-row {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}

.desktop-pill {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(255, 250, 244, 0.18);
  border: 1px solid rgba(255, 250, 244, 0.18);
  font-size: 12px;
}

.desktop-frame__panel--form {
  background: linear-gradient(180deg, #fffefb, #f8f0e4);
  border: 1px solid rgba(233, 221, 204, 0.96);
}

.desktop-frame__panel--form strong {
  display: block;
  margin-top: 10px;
  font-size: 32px;
  color: var(--ifu-text-strong);
}

.field-card {
  margin-top: 16px;
  padding: 16px 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(233, 221, 204, 0.92);
}

.field-card label {
  display: block;
  color: var(--ifu-text-muted);
  font-size: 12px;
}

.field-card div {
  margin-top: 8px;
  color: var(--ifu-text-strong);
  font-size: 16px;
}

.primary-action {
  width: 100%;
  margin-top: 20px;
  min-height: 48px;
  border: 0;
  border-radius: 18px;
  background: linear-gradient(135deg, #a67c52, #c8a977);
  color: #fffdf9;
  font-size: 15px;
  font-weight: 600;
}

.console-sidebar {
  padding: 24px 20px;
  border-radius: 26px;
  background: linear-gradient(180deg, #4a3828, #6f543b);
  color: #f8f1e7;
}

.console-sidebar strong {
  display: block;
  margin-top: 10px;
  font-size: 28px;
}

.console-nav {
  display: grid;
  gap: 10px;
  margin-top: 24px;
}

.console-nav__item {
  padding: 12px 14px;
  border-radius: 16px;
  color: rgba(248, 241, 231, 0.78);
}

.console-nav__item--active {
  background: rgba(255, 250, 243, 0.14);
  color: #fffaf4;
}

.console-main {
  padding: 10px 4px 4px;
}

.console-topbar {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 20px;
}

.console-topbar h2 {
  margin-top: 8px;
  font-size: 36px;
  color: var(--ifu-text-strong);
}

.console-topbar__badge {
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(200, 169, 119, 0.18);
  color: var(--ifu-gold-700);
  font-size: 12px;
}

.console-kpis {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.console-kpi,
.console-card {
  padding: 18px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(233, 221, 204, 0.92);
}

.console-kpi span,
.console-card__head span {
  color: var(--ifu-text-muted);
  font-size: 12px;
}

.console-kpi strong {
  display: block;
  margin-top: 10px;
  font-size: 36px;
  color: var(--ifu-text-strong);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
}

.console-kpi p,
.approval-item p,
.event-stack__item p {
  margin-top: 8px;
  color: var(--ifu-text);
  line-height: 1.7;
}

.console-grid {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 16px;
  margin-top: 16px;
}

.console-card--warm {
  background: linear-gradient(180deg, #fffaf3, #f7eddc);
}

.console-card__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.console-card__head strong,
.approval-item strong,
.event-stack__item strong {
  font-size: 22px;
  color: var(--ifu-text-strong);
}

.approval-item,
.event-stack__item {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(233, 221, 204, 0.76);
}

.approval-item:first-of-type,
.event-stack__item:first-of-type {
  margin-top: 12px;
}

.approval-item:last-child,
.event-stack__item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.approval-item__tag {
  align-self: start;
  min-width: 64px;
  padding: 8px 12px;
  border-radius: 999px;
  text-align: center;
  font-size: 11px;
}

.approval-item__tag--danger {
  background: rgba(168, 93, 82, 0.14);
  color: #a85d52;
}

.approval-item__tag--warning {
  background: rgba(194, 139, 78, 0.14);
  color: #c28b4e;
}

.approval-item__tag--success {
  background: rgba(126, 154, 120, 0.16);
  color: #7e9a78;
}
</style>
