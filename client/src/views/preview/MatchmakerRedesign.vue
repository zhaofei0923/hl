<template>
  <div class="matchmaker-preview" data-testid="preview-matchmaker-redesign">
    <header class="matchmaker-preview__header">
      <div>
        <span class="brand-label">05 MATCHMAKER REDESIGN</span>
        <h1>红娘工作台要更像经营台，而不是菜单页</h1>
      </div>
      <p>把关键 KPI、待处理会员、活动安排与收入提醒放进同一张工作视图里，强化“今天先做什么”的经营节奏。</p>
    </header>

    <section class="matchmaker-preview__board">
      <article class="studio-panel studio-panel--hero">
        <div class="studio-panel__intro">
          <span class="brand-label">MATCHMAKER DESK</span>
          <h2>陈顾问 · 本周配对推进中</h2>
          <p>今天的重点不是看所有信息，而是把最该推进的会员和活动排期前置。</p>
        </div>

        <div class="kpi-grid" data-testid="preview-matchmaker-kpi">
          <article v-for="item in kpis" :key="item.label" class="kpi-card">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <p>{{ item.desc }}</p>
          </article>
        </div>
      </article>

      <div class="studio-columns">
        <article class="studio-panel" data-testid="preview-matchmaker-queue">
          <div class="studio-panel__head">
            <strong>今日待推进会员</strong>
            <span>按见面可能性排序</span>
          </div>
          <article v-for="item in queue" :key="item.name" class="queue-item">
            <div class="queue-item__avatar">{{ item.initial }}</div>
            <div>
              <strong>{{ item.name }}</strong>
              <p>{{ item.desc }}</p>
            </div>
            <b>{{ item.status }}</b>
          </article>
        </article>

        <article class="studio-panel">
          <div class="studio-panel__head">
            <strong>活动与收入提醒</strong>
            <span>把门店节奏并排展示</span>
          </div>

          <div class="event-card">
            <span class="brand-label">SALON</span>
            <h3>周六午后观影沙龙</h3>
            <p>已报名 18 人，还需确认 3 位高意向会员到场。</p>
          </div>

          <div class="income-card">
            <span class="brand-label">REVENUE</span>
            <div class="income-card__row">
              <strong>¥ 28,600</strong>
              <span>本月预计可结算</span>
            </div>
            <p>2 笔服务费待确认，1 笔提现进入复核阶段。</p>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
const kpis = [
  { label: '今日待跟进', value: '08', desc: '优先处理高意向与复联会员' },
  { label: '本周见面安排', value: '03', desc: '已进入排期确认阶段' },
  { label: '沙龙到场率', value: '87%', desc: '高于上周 12 个百分点' }
]

const queue = [
  { initial: '许', name: '许嘉言', desc: '建议今天内确认周末咖啡见面时间。', status: '高优先' },
  { initial: '顾', name: '顾知南', desc: '已同意继续沟通，适合补充更多生活信息。', status: '需复联' },
  { initial: '姚', name: '姚清禾', desc: '线下活动报名未确认，需要短信提醒。', status: '待确认' }
]
</script>

<style scoped>
.matchmaker-preview {
  min-height: 100vh;
  padding: 36px 24px 56px;
  background:
    radial-gradient(circle at 12% 12%, rgba(166, 124, 82, 0.16), transparent 24%),
    linear-gradient(180deg, #fffdf9 0%, var(--ifu-bg) 100%);
}

.matchmaker-preview__header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 24px;
}

.matchmaker-preview__header h1 {
  margin-top: 8px;
  font-size: 46px;
  line-height: 1.08;
}

.matchmaker-preview__header p {
  max-width: 420px;
  font-size: 15px;
  line-height: 1.8;
  color: var(--ifu-text);
}

.matchmaker-preview__board {
  margin-top: 34px;
  padding: 22px;
  border-radius: 36px;
  background: linear-gradient(180deg, rgba(248, 241, 232, 0.98), rgba(244, 233, 218, 0.94));
  border: 1px solid rgba(233, 221, 204, 0.96);
  box-shadow: var(--ifu-shadow-card);
}

.studio-panel {
  padding: 20px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(233, 221, 204, 0.92);
}

.studio-panel--hero {
  background: linear-gradient(145deg, #8e6941, #bd9864 62%, #ead7b7);
  color: #fffaf4;
  border: 0;
}

.studio-panel__intro h2 {
  margin-top: 8px;
  font-size: 32px;
  line-height: 1.18;
}

.studio-panel__intro p {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.8;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.kpi-card {
  padding: 18px;
  border-radius: 24px;
  background: rgba(255, 250, 243, 0.16);
  border: 1px solid rgba(255, 250, 243, 0.2);
}

.kpi-card span,
.studio-panel__head span,
.income-card__row span {
  color: inherit;
  opacity: 0.82;
  font-size: 12px;
}

.kpi-card strong {
  display: block;
  margin-top: 10px;
  font-size: 38px;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
}

.kpi-card p,
.queue-item p,
.event-card p,
.income-card p {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.7;
}

.studio-columns {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 18px;
  margin-top: 18px;
}

.studio-panel__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.studio-panel__head strong,
.queue-item strong,
.event-card h3,
.income-card strong {
  font-size: 24px;
  color: var(--ifu-text-strong);
}

.queue-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid rgba(233, 221, 204, 0.76);
}

.queue-item:first-of-type {
  margin-top: 12px;
}

.queue-item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.queue-item__avatar {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: linear-gradient(160deg, rgba(200, 169, 119, 0.18), rgba(166, 124, 82, 0.32));
  color: var(--ifu-gold-700);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
}

.queue-item b {
  min-width: 66px;
  text-align: center;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(200, 169, 119, 0.18);
  color: var(--ifu-gold-700);
  font-size: 11px;
}

.event-card,
.income-card {
  margin-top: 16px;
  padding: 18px;
  border-radius: 24px;
  background: linear-gradient(180deg, #fffaf3, #f8eedf);
}

.event-card h3 {
  margin-top: 8px;
}

.income-card__row {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 14px;
  margin-top: 8px;
}

.income-card strong {
  font-size: 38px;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
}
</style>
