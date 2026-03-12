<template>
  <div class="operations-preview" data-testid="preview-admin-operations">
    <header class="operations-preview__header">
      <div>
        <span class="brand-label">10 ADMIN OPERATIONS</span>
        <h1>后台列表页也需要品牌化节奏</h1>
      </div>
      <p>用户管理和提现审批不只是表格，应该先让运营快速识别风险、优先级和下一步动作。</p>
    </header>

    <section class="operations-preview__stage">
      <article class="panel-shell">
        <div class="panel-shell__head">
          <div>
            <span class="brand-label">USER MANAGEMENT</span>
            <h2>用户管理列表</h2>
          </div>
          <div class="panel-shell__filters">
            <span class="filter-pill">关键词</span>
            <span class="filter-pill">角色</span>
            <span class="filter-pill filter-pill--active">认证状态</span>
          </div>
        </div>
        <div class="table-card" data-testid="preview-admin-users-table">
          <div class="table-card__header table-card__header--grid-users">
            <span>用户</span>
            <span>角色</span>
            <span>城市</span>
            <span>认证</span>
            <span>操作</span>
          </div>
          <article v-for="user in users" :key="user.name" class="table-row table-row--grid-users">
            <div class="person-cell">
              <div class="person-cell__avatar">{{ user.initial }}</div>
              <div>
                <strong>{{ user.name }}</strong>
                <p>{{ user.phone }}</p>
              </div>
            </div>
            <span class="tag">{{ user.role }}</span>
            <span class="muted">{{ user.city }}</span>
            <span :class="['tag', `tag--${user.state}`]">{{ user.cert }}</span>
            <a class="link-action">查看详情</a>
          </article>
        </div>
      </article>

      <article class="panel-shell">
        <div class="panel-shell__head">
          <div>
            <span class="brand-label">WITHDRAWALS</span>
            <h2>提现审批列表</h2>
          </div>
          <div class="priority-pill">高风险 2 笔</div>
        </div>
        <div class="table-card" data-testid="preview-admin-withdrawals-table">
          <div class="table-card__header table-card__header--grid-withdrawals">
            <span>申请人</span>
            <span>金额</span>
            <span>方式</span>
            <span>状态</span>
            <span>动作</span>
          </div>
          <article v-for="item in withdrawals" :key="item.name" class="table-row table-row--grid-withdrawals">
            <div>
              <strong>{{ item.name }}</strong>
              <p>{{ item.time }}</p>
            </div>
            <span class="amount">¥{{ item.amount }}</span>
            <span class="muted">{{ item.channel }}</span>
            <span :class="['tag', `tag--${item.state}`]">{{ item.status }}</span>
            <div class="action-group">
              <a class="link-action link-action--success">通过</a>
              <a class="link-action link-action--danger">拒绝</a>
            </div>
          </article>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
const users = [
  { initial: '沈', name: '沈清和', phone: '138****2048', role: '求偶用户', city: '上海', cert: '已认证', state: 'success' },
  { initial: '陈', name: '陈顾问', phone: '136****9182', role: '红娘', city: '杭州', cert: '审核中', state: 'warning' },
  { initial: '姚', name: '姚清禾', phone: '150****6413', role: '求偶用户', city: '深圳', cert: '已拒绝', state: 'danger' }
]

const withdrawals = [
  { name: '杭州门店', time: '今天 10:24', amount: '8,600', channel: '银行卡', status: '待审核', state: 'warning' },
  { name: '陈顾问', time: '今天 09:10', amount: '3,200', channel: '支付宝', status: '高风险', state: 'danger' },
  { name: '深圳门店', time: '昨天 18:40', amount: '5,400', channel: '银行卡', status: '处理中', state: 'info' }
]
</script>

<style scoped>
.operations-preview {
  min-height: 100vh;
  padding: 40px 28px 60px;
  background:
    radial-gradient(circle at 10% 10%, rgba(200, 169, 119, 0.14), transparent 24%),
    linear-gradient(180deg, #fffcf8 0%, #f7f1e7 100%);
}

.operations-preview__header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 24px;
}

.operations-preview__header h1 {
  margin-top: 8px;
  font-size: 52px;
  line-height: 1.05;
}

.operations-preview__header p {
  max-width: 420px;
  color: var(--ifu-text);
  line-height: 1.8;
}

.operations-preview__stage {
  display: grid;
  gap: 22px;
  margin-top: 34px;
}

.panel-shell {
  padding: 22px;
  border-radius: 34px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(233, 221, 204, 0.96);
  box-shadow: 0 24px 56px rgba(83, 59, 33, 0.12);
}

.panel-shell__head {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 18px;
}

.panel-shell__head h2 {
  margin-top: 8px;
  font-size: 34px;
  color: var(--ifu-text-strong);
}

.panel-shell__filters {
  display: flex;
  gap: 8px;
}

.filter-pill,
.priority-pill {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(255, 250, 243, 0.92);
  border: 1px solid rgba(233, 221, 204, 0.96);
  color: var(--ifu-text);
  font-size: 12px;
}

.filter-pill--active,
.priority-pill {
  background: rgba(200, 169, 119, 0.18);
  color: var(--ifu-gold-700);
}

.table-card {
  margin-top: 18px;
  padding: 16px 18px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(233, 221, 204, 0.92);
}

.table-card__header,
.table-row {
  display: grid;
  gap: 14px;
  align-items: center;
}

.table-card__header {
  padding: 0 0 12px;
  color: var(--ifu-text-muted);
  font-size: 12px;
  border-bottom: 1px solid rgba(233, 221, 204, 0.76);
}

.table-card__header--grid-users,
.table-row--grid-users {
  grid-template-columns: 2fr 0.9fr 0.7fr 0.8fr 0.7fr;
}

.table-card__header--grid-withdrawals,
.table-row--grid-withdrawals {
  grid-template-columns: 1.5fr 0.8fr 0.8fr 0.8fr 0.9fr;
}

.table-row {
  padding: 16px 0;
  border-bottom: 1px solid rgba(233, 221, 204, 0.76);
}

.table-row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.person-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.person-cell__avatar {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: linear-gradient(160deg, rgba(200, 169, 119, 0.18), rgba(166, 124, 82, 0.32));
  color: var(--ifu-gold-700);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
}

.person-cell strong,
.table-row strong {
  color: var(--ifu-text-strong);
  font-size: 17px;
}

.person-cell p,
.table-row p {
  margin-top: 4px;
  color: var(--ifu-text-muted);
  font-size: 12px;
}

.muted {
  color: var(--ifu-text);
  font-size: 14px;
}

.tag {
  justify-self: start;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(200, 169, 119, 0.14);
  color: var(--ifu-gold-700);
  font-size: 12px;
}

.tag--success {
  background: rgba(126, 154, 120, 0.16);
  color: #7e9a78;
}

.tag--warning {
  background: rgba(194, 139, 78, 0.14);
  color: #c28b4e;
}

.tag--danger {
  background: rgba(168, 93, 82, 0.14);
  color: #a85d52;
}

.tag--info {
  background: rgba(140, 154, 168, 0.14);
  color: #8c9aa8;
}

.amount {
  color: var(--ifu-text-strong);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 24px;
}

.link-action {
  color: var(--ifu-gold-700);
  font-size: 13px;
}

.link-action--success {
  color: #7e9a78;
}

.link-action--danger {
  color: #a85d52;
}

.action-group {
  display: flex;
  gap: 12px;
}
</style>
