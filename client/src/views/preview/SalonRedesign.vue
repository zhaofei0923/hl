<template>
  <div class="salon-preview" data-testid="preview-salon-redesign">
    <header class="salon-preview__header">
      <div>
        <span class="brand-label">09 SALON REDESIGN</span>
        <h1>活动页要先卖氛围，再卖报名</h1>
      </div>
      <p>列表页突出场景与适配人群，详情页再给出流程、席位和报名决策信息，让线下活动更像精选社交场而不是普通活动流。</p>
    </header>

    <section class="salon-preview__grid">
      <article class="board-frame" data-testid="preview-salon-list">
        <div class="board-frame__hero">
          <span class="brand-label">EVENT LIST</span>
          <h2>本周精选沙龙</h2>
          <p>优先显示更适合你资料气质与当前沟通阶段的活动。</p>
        </div>
        <div class="event-stack">
          <article v-for="event in events" :key="event.title" class="event-card">
            <div class="event-card__cover"></div>
            <div class="event-card__body">
              <div class="event-card__head">
                <strong>{{ event.title }}</strong>
                <span>{{ event.badge }}</span>
              </div>
              <p>{{ event.desc }}</p>
              <div class="event-card__meta">
                <span>{{ event.time }}</span>
                <span>{{ event.count }}</span>
              </div>
            </div>
          </article>
        </div>
      </article>

      <article class="board-frame board-frame--light" data-testid="preview-salon-detail">
        <div class="detail-card">
          <div class="detail-card__banner"></div>
          <div class="detail-card__content">
            <span class="brand-label">DETAIL</span>
            <h2>周六午后茶叙</h2>
            <p>适合第一次线下见面前的轻社交活动，强社交压力低，更适合慢热型用户。</p>
            <div class="detail-card__info">
              <article v-for="item in detailMeta" :key="item.label">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </article>
            </div>
          </div>
        </div>

        <div class="timeline-card">
          <span class="brand-label">FLOW</span>
          <article v-for="item in timeline" :key="item.time" class="timeline-item">
            <div class="timeline-item__time">{{ item.time }}</div>
            <div>
              <strong>{{ item.title }}</strong>
              <p>{{ item.desc }}</p>
            </div>
          </article>
        </div>

        <div class="booking-card">
          <div>
            <strong>还剩 6 个席位</strong>
            <p>建议尽快报名，红娘可根据你的意向帮你安排更合适的活动同伴。</p>
          </div>
          <div class="booking-card__actions">
            <span class="brand-chip">先咨询红娘</span>
            <span class="brand-chip brand-chip--active">立即报名</span>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
const events = [
  {
    title: '夜场观影局',
    badge: '高适配',
    desc: '适合同城初识，社交负担轻，活动后便于继续单独沟通。',
    time: '周五 19:30',
    count: '22/28 人'
  },
  {
    title: '午后茶叙',
    badge: '推荐',
    desc: '适合慢热型用户，交流更轻松，红娘也更容易观察互动氛围。',
    time: '周六 14:00',
    count: '14/20 人'
  }
]

const detailMeta = [
  { label: '时间', value: '周六 14:00' },
  { label: '地点', value: '静安会客厅' },
  { label: '报名', value: '14/20' }
]

const timeline = [
  { time: '13:40', title: '签到入场', desc: '红娘协助落座，优先安排相近风格嘉宾。' },
  { time: '14:10', title: '轻话题破冰', desc: '围绕近期生活与城市体验展开交流。' },
  { time: '15:20', title: '自由交流', desc: '保留更自然的一对一聊天时间。' }
]
</script>

<style scoped>
.salon-preview {
  min-height: 100vh;
  padding: 36px 24px 56px;
  background:
    radial-gradient(circle at 10% 12%, rgba(226, 205, 169, 0.18), transparent 22%),
    linear-gradient(180deg, #fffdf9 0%, var(--ifu-bg) 100%);
}

.salon-preview__header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 24px;
}

.salon-preview__header h1 {
  margin-top: 8px;
  font-size: 46px;
  line-height: 1.08;
}

.salon-preview__header p {
  max-width: 420px;
  font-size: 15px;
  line-height: 1.8;
  color: var(--ifu-text);
}

.salon-preview__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 420px));
  justify-content: space-between;
  gap: 28px;
  margin-top: 34px;
}

.board-frame {
  padding: 18px;
  border-radius: 42px;
  background: linear-gradient(180deg, rgba(248, 241, 232, 0.98), rgba(244, 233, 218, 0.94));
  border: 1px solid rgba(233, 221, 204, 0.96);
  box-shadow: var(--ifu-shadow-card);
}

.board-frame--light {
  background: linear-gradient(180deg, rgba(255, 248, 239, 0.98), rgba(248, 239, 226, 0.94));
}

.board-frame__hero,
.event-card,
.detail-card,
.timeline-card,
.booking-card {
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(233, 221, 204, 0.92);
}

.board-frame__hero {
  padding: 18px;
  background: linear-gradient(140deg, #8e6941, #bc9662 62%, #ecd9b9);
  color: #fffaf4;
  border: 0;
}

.board-frame__hero h2,
.detail-card h2 {
  margin-top: 10px;
  font-size: 28px;
}

.board-frame__hero p,
.event-card p,
.detail-card p,
.timeline-item p,
.booking-card p {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.75;
}

.event-stack,
.timeline-card,
.booking-card {
  margin-top: 14px;
}

.event-stack {
  display: grid;
  gap: 14px;
}

.event-card {
  overflow: hidden;
}

.event-card__cover,
.detail-card__banner {
  height: 138px;
  background:
    linear-gradient(180deg, rgba(25, 19, 15, 0.12), rgba(25, 19, 15, 0.28)),
    linear-gradient(135deg, #7f6548, #b08b61 68%, #d9bc91);
}

.event-card__body,
.detail-card__content,
.timeline-card,
.booking-card {
  padding: 18px;
}

.event-card__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
}

.event-card__head strong,
.timeline-item strong,
.booking-card strong {
  font-size: 22px;
  color: var(--ifu-text-strong);
}

.event-card__head span {
  color: var(--ifu-gold-700);
  font-size: 12px;
}

.event-card__meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  color: var(--ifu-text-muted);
  font-size: 12px;
}

.detail-card__info {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.detail-card__info article {
  padding: 14px;
  border-radius: 22px;
  background: linear-gradient(180deg, #fffaf3, #f8eedf);
}

.detail-card__info span {
  color: var(--ifu-text-muted);
  font-size: 12px;
}

.detail-card__info strong {
  display: block;
  margin-top: 8px;
  color: var(--ifu-text-strong);
  font-size: 17px;
}

.timeline-item {
  display: grid;
  grid-template-columns: 74px 1fr;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(233, 221, 204, 0.76);
}

.timeline-item:first-of-type {
  margin-top: 8px;
}

.timeline-item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.timeline-item__time {
  color: var(--ifu-gold-700);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 18px;
}

.booking-card {
  background: linear-gradient(180deg, #fffaf3, #f7eddc);
}

.booking-card__actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}
</style>
