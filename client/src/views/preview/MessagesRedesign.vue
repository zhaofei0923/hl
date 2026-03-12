<template>
  <div class="messages-preview" data-testid="preview-messages-redesign">
    <header class="messages-preview__header">
      <div>
        <span class="brand-label">03 MESSAGES REDESIGN</span>
        <h1>把消息页做成可推进关系的礼宾台</h1>
      </div>
      <p>不仅展示对话列表，还把优先联系对象、开场建议和待跟进状态前置，让消息页从被动收件箱变成主动经营面板。</p>
    </header>

    <section class="messages-preview__grid">
      <article class="phone-frame">
        <div class="phone-topbar">
          <span class="brand-label">INBOX</span>
          <strong>今日联系节奏</strong>
          <p>先处理优先推荐，再继续常规沟通。</p>
        </div>

        <div class="priority-card" data-testid="preview-messages-priority">
          <div>
            <span class="brand-label">PRIORITY</span>
            <h2>优先联系 2 位高意向对象</h2>
          </div>
          <div class="priority-card__list">
            <article v-for="item in priorityList" :key="item.name" class="priority-person">
              <div class="priority-person__avatar">{{ item.initial }}</div>
              <div>
                <strong>{{ item.name }}</strong>
                <p>{{ item.note }}</p>
              </div>
              <em>{{ item.score }}</em>
            </article>
          </div>
        </div>

        <div class="conversation-panel" data-testid="preview-messages-conversation">
          <div class="conversation-panel__title">
            <strong>最近对话</strong>
            <span>按推进优先级排序</span>
          </div>
          <article v-for="chat in inboxList" :key="chat.name" class="conversation-item">
            <div class="conversation-item__avatar">{{ chat.initial }}</div>
            <div class="conversation-item__body">
              <div class="conversation-item__meta">
                <strong>{{ chat.name }}</strong>
                <span>{{ chat.time }}</span>
              </div>
              <p>{{ chat.message }}</p>
            </div>
            <b :class="['conversation-item__status', `conversation-item__status--${chat.state}`]">{{ chat.badge }}</b>
          </article>
        </div>
      </article>

      <article class="phone-frame phone-frame--soft">
        <div class="phone-topbar phone-topbar--light">
          <span class="brand-label">CHAT DETAIL</span>
          <strong>让开场更轻松</strong>
          <p>把系统建议、红娘提示和当前聊天放在同一视图里。</p>
        </div>

        <div class="message-assist">
          <div class="message-assist__tips">
            <span class="brand-chip brand-chip--active">共同点: 同城创意行业</span>
            <span class="brand-chip">建议: 从周末安排切入</span>
          </div>
          <div class="message-assist__prompt">
            <span class="brand-label">OPENING IDEA</span>
            <p>看到你也喜欢看展，最近北京有个摄影展挺适合周末去，你会更偏爱摄影还是装置类作品？</p>
          </div>
        </div>

        <div class="chat-thread">
          <div class="bubble bubble--incoming">最近工作比较忙，但周末一般会安排一点线下活动。</div>
          <div class="bubble bubble--outgoing">那挺好，我平时也会找些轻松一点的去处，展览或者音乐现场都不错。</div>
          <div class="bubble bubble--incoming">感觉我们节奏还挺像，可以慢慢聊。</div>
        </div>

        <div class="composer-card">
          <div class="composer-card__actions">
            <span class="brand-chip brand-chip--ghost">发送开场建议</span>
            <span class="brand-chip">标记待跟进</span>
          </div>
          <div class="composer-card__input">今晚下班后有空吗？想听听你最近有没有发现什么不错的放松方式。</div>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
const priorityList = [
  { initial: '沈', name: '沈清和', note: '已读你的资料，建议今天内主动问候', score: '96%' },
  { initial: '林', name: '林知遥', note: '同城且生活节奏接近，适合晚间联系', score: '91%' }
]

const inboxList = [
  { initial: '沈', name: '沈清和', time: '18:20', message: '刚下班，今天过得还顺利吗？', badge: '高意向', state: 'success' },
  { initial: '周', name: '周予安', time: '昨天', message: '周末可能会去看个展，你会感兴趣吗？', badge: '待跟进', state: 'warning' },
  { initial: '温', name: '温书宁', time: '周二', message: '谢谢你的推荐，我回头认真看看。', badge: '缓慢', state: 'muted' }
]
</script>

<style scoped>
.messages-preview {
  min-height: 100vh;
  padding: 36px 24px 56px;
  background:
    radial-gradient(circle at 10% 10%, rgba(200, 169, 119, 0.16), transparent 24%),
    linear-gradient(180deg, #fffdf9 0%, var(--ifu-bg) 100%);
}

.messages-preview__header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 24px;
}

.messages-preview__header h1 {
  margin-top: 8px;
  font-size: 46px;
  line-height: 1.08;
}

.messages-preview__header p {
  max-width: 420px;
  font-size: 15px;
  line-height: 1.8;
  color: var(--ifu-text);
}

.messages-preview__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 420px));
  justify-content: space-between;
  gap: 28px;
  margin-top: 34px;
}

.phone-frame {
  padding: 18px;
  border-radius: 42px;
  background: linear-gradient(180deg, rgba(248, 241, 232, 0.98), rgba(244, 233, 218, 0.94));
  border: 1px solid rgba(233, 221, 204, 0.96);
  box-shadow: var(--ifu-shadow-card);
}

.phone-frame--soft {
  background: linear-gradient(180deg, rgba(255, 248, 239, 0.98), rgba(248, 239, 226, 0.94));
}

.phone-topbar {
  padding: 18px;
  border-radius: 28px;
  background: linear-gradient(140deg, #8e6941, #bc9662 62%, #ecd9b9);
  color: #fffaf4;
}

.phone-topbar--light {
  background: linear-gradient(180deg, #fffaf4, #f4e7d3);
  color: var(--ifu-text-strong);
  border: 1px solid rgba(226, 205, 169, 0.5);
}

.phone-topbar strong {
  display: block;
  margin-top: 12px;
  font-size: 28px;
  line-height: 1.2;
}

.phone-topbar p {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.75;
}

.priority-card,
.conversation-panel,
.message-assist,
.composer-card {
  margin-top: 14px;
  padding: 18px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(233, 221, 204, 0.92);
}

.priority-card h2 {
  margin-top: 8px;
  font-size: 24px;
  line-height: 1.3;
}

.priority-card__list {
  margin-top: 16px;
  display: grid;
  gap: 12px;
}

.priority-person,
.conversation-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
}

.priority-person__avatar,
.conversation-item__avatar {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: linear-gradient(160deg, rgba(200, 169, 119, 0.18), rgba(166, 124, 82, 0.32));
  color: var(--ifu-gold-700);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 18px;
}

.priority-person strong,
.conversation-item strong,
.conversation-panel__title strong {
  color: var(--ifu-text-strong);
  font-size: 17px;
}

.priority-person p,
.conversation-item p,
.message-assist__prompt p,
.conversation-panel__title span {
  margin-top: 4px;
  color: var(--ifu-text);
  font-size: 13px;
  line-height: 1.65;
}

.priority-person em {
  font-style: normal;
  color: var(--ifu-gold-700);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 22px;
}

.conversation-panel__title {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.conversation-panel__title span {
  margin-top: 0;
  font-size: 12px;
}

.conversation-item {
  padding: 14px 0;
  border-bottom: 1px solid rgba(233, 221, 204, 0.76);
}

.conversation-item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.conversation-item:first-of-type {
  margin-top: 12px;
}

.conversation-item__meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.conversation-item__meta span {
  color: var(--ifu-text-muted);
  font-size: 12px;
}

.conversation-item__status {
  min-width: 56px;
  text-align: center;
  padding: 7px 10px;
  border-radius: 999px;
  font-size: 11px;
}

.conversation-item__status--success {
  background: rgba(126, 154, 120, 0.16);
  color: var(--ifu-success);
}

.conversation-item__status--warning {
  background: rgba(194, 139, 78, 0.14);
  color: var(--ifu-warning);
}

.conversation-item__status--muted {
  background: rgba(140, 154, 168, 0.14);
  color: var(--ifu-info);
}

.message-assist__tips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.message-assist__prompt {
  margin-top: 14px;
  padding: 16px;
  border-radius: 22px;
  background: linear-gradient(180deg, #fffaf3, #f7eddc);
}

.chat-thread {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.bubble {
  max-width: 82%;
  padding: 14px 16px;
  border-radius: 22px;
  font-size: 14px;
  line-height: 1.7;
}

.bubble--incoming {
  background: rgba(255, 255, 255, 0.92);
  color: var(--ifu-text);
  border: 1px solid rgba(233, 221, 204, 0.72);
}

.bubble--outgoing {
  margin-left: auto;
  background: linear-gradient(135deg, rgba(200, 169, 119, 0.18), rgba(166, 124, 82, 0.2));
  color: var(--ifu-text-strong);
}

.composer-card__actions {
  display: flex;
  gap: 8px;
}

.composer-card__input {
  margin-top: 14px;
  min-height: 96px;
  padding: 16px;
  border-radius: 22px;
  background: rgba(251, 247, 241, 0.84);
  color: var(--ifu-text);
  font-size: 14px;
  line-height: 1.7;
}
</style>
