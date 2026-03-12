<template>
  <div class="support-suite" data-testid="preview-support-suite">
    <header class="support-suite__header">
      <div>
        <span class="brand-label">08 SUPPORT AND WORKFLOW SUITE</span>
        <h1>把支持页和工作流页统一到同一套香槟金礼宾体验里</h1>
      </div>
      <p>
        最后一轮高保真把客服、聊天、钱包结算和团队协作整合进同一组视觉语言，让辅助页面也具备品牌识别和行动引导，而不是停留在工具页状态。
      </p>
    </header>

    <section class="support-suite__grid">
      <article class="phone-frame" data-testid="preview-support-service">
        <div class="phone-topbar">
          <span class="brand-label">CONCIERGE</span>
          <strong>专属客服与认证协助</strong>
          <p>把帮助入口、认证进度和人工支持统一为礼宾式面板。</p>
        </div>

        <div class="suite-card">
          <div class="suite-card__title">
            <strong>今日待处理</strong>
            <span>2 项</span>
          </div>
          <div class="info-row" v-for="item in serviceItems" :key="item.title">
            <div class="info-row__icon">{{ item.icon }}</div>
            <div>
              <strong>{{ item.title }}</strong>
              <p>{{ item.note }}</p>
            </div>
            <em>{{ item.status }}</em>
          </div>
        </div>

        <div class="suite-card suite-card--soft">
          <span class="brand-label">CERTIFICATION</span>
          <h2>实名认证进度 75%</h2>
          <p>缺少一项手持证件照片，补齐后可提升推荐曝光与信任分。</p>
          <div class="brand-chip-row">
            <span class="brand-chip brand-chip--active">优先处理</span>
            <span class="brand-chip">人工复核</span>
          </div>
        </div>
      </article>

      <article class="phone-frame phone-frame--light" data-testid="preview-support-chat">
        <div class="phone-topbar phone-topbar--light">
          <span class="brand-label">CHAT DETAIL</span>
          <strong>品牌化对话壳体</strong>
          <p>聊天页保留真实消息流，同时把引导和协助信息前置。</p>
        </div>

        <div class="suite-card">
          <div class="brand-chip-row brand-chip-row--wrap">
            <span class="brand-chip brand-chip--active">真诚开场</span>
            <span class="brand-chip">已读回执</span>
            <span class="brand-chip">红娘可协助</span>
          </div>
          <div class="thread-stack">
            <div class="bubble bubble--incoming">最近工作有点忙，但周末会给自己留一点松弛的时间。</div>
            <div class="bubble bubble--outgoing">我也是，最近更想找一些节奏舒服的活动，慢慢认识会更自然。</div>
            <div class="bubble bubble--incoming">这种聊天方式挺舒服的，可以继续聊聊彼此周末的安排。</div>
          </div>
        </div>

        <div class="composer-shell">
          <div class="composer-shell__label">建议开场</div>
          <div class="composer-shell__value">你最近有没有发现什么适合周末放松的地方？我也在收集一点轻松的灵感。</div>
        </div>
      </article>

      <article class="phone-frame" data-testid="preview-support-wallet">
        <div class="phone-topbar">
          <span class="brand-label">SETTLEMENT</span>
          <strong>钱包与结算一眼读懂</strong>
          <p>把余额、喜币和提现节奏统一到品牌化结算面板里。</p>
        </div>

        <div class="wallet-hero">
          <span>可提现余额</span>
          <strong>¥ 28,640</strong>
          <p>本月预计结算 6 笔，下一次打款窗口为周五 18:00。</p>
        </div>

        <div class="suite-card">
          <div class="suite-card__title">
            <strong>近 3 笔流水</strong>
            <span>实时同步</span>
          </div>
          <div class="record-row" v-for="item in walletItems" :key="item.title">
            <div>
              <strong>{{ item.title }}</strong>
              <p>{{ item.time }}</p>
            </div>
            <em :class="['money-tag', item.positive ? 'money-tag--up' : 'money-tag--down']">{{ item.amount }}</em>
          </div>
        </div>
      </article>

      <article class="phone-frame phone-frame--light" data-testid="preview-support-team">
        <div class="phone-topbar phone-topbar--light">
          <span class="brand-label">COLLABORATION</span>
          <strong>婚介团与协作表单</strong>
          <p>团队页和经营表单共享同一套结构，不再像零散后台工具。</p>
        </div>

        <div class="suite-card">
          <div class="suite-card__title">
            <strong>团队概览</strong>
            <span>本周新增 3 人</span>
          </div>
          <div class="stat-grid">
            <div v-for="item in teamStats" :key="item.label" class="stat-block">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </div>

        <div class="suite-card suite-card--soft">
          <span class="brand-label">WORKFLOW</span>
          <h2>标准化协作动作</h2>
          <ul class="workflow-list">
            <li>统一 hero 面板承载状态、提醒和下一步动作</li>
            <li>表单页使用温暖浅底与清晰分组，减少录入压力</li>
            <li>列表页用香槟金标签区分高意向、待跟进、已完成</li>
          </ul>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
const serviceItems = [
  { icon: '认', title: '认证材料补充', note: '仅剩手持证件照片待上传', status: '加急' },
  { icon: '问', title: '专属客服回访', note: '建议今晚 20:00 前确认活动席位', status: '处理中' }
]

const walletItems = [
  { title: '订单结算到账', time: '今天 14:20', amount: '+ ¥6,800', positive: true },
  { title: '官方活动场地费', time: '昨天 11:05', amount: '- ¥980', positive: false },
  { title: '会员升级返佣', time: '周二 19:45', amount: '+ ¥2,400', positive: true }
]

const teamStats = [
  { label: '活跃红娘', value: '18' },
  { label: '待跟进会员', value: '42' },
  { label: '本周签约', value: '6' },
  { label: '服务满意度', value: '97%' }
]
</script>

<style scoped>
.support-suite {
  min-height: 100vh;
  padding: 36px 24px 56px;
  background:
    radial-gradient(circle at top left, rgba(200, 169, 119, 0.14), transparent 24%),
    radial-gradient(circle at right center, rgba(166, 124, 82, 0.14), transparent 28%),
    linear-gradient(180deg, #fffdf9 0%, var(--ifu-bg) 100%);
}

.support-suite__header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 24px;
}

.support-suite__header h1 {
  margin-top: 8px;
  max-width: 760px;
  font-size: 44px;
  line-height: 1.08;
}

.support-suite__header p {
  max-width: 420px;
  font-size: 15px;
  line-height: 1.8;
  color: var(--ifu-text);
}

.support-suite__grid {
  margin-top: 34px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 420px));
  justify-content: space-between;
  gap: 28px;
}

.phone-frame {
  padding: 18px;
  border-radius: 42px;
  background: linear-gradient(180deg, rgba(248, 241, 232, 0.98), rgba(244, 233, 218, 0.94));
  border: 1px solid rgba(233, 221, 204, 0.96);
  box-shadow: var(--ifu-shadow-card);
}

.phone-frame--light {
  background: linear-gradient(180deg, rgba(255, 251, 245, 0.98), rgba(248, 239, 226, 0.94));
}

.phone-topbar {
  padding: 18px;
  border-radius: 28px;
  background: linear-gradient(140deg, #8e6941, #bc9662 62%, #ecd9b9);
  color: #fffaf4;
}

.phone-topbar--light {
  background: linear-gradient(180deg, #fffaf4, #f4e7d3);
  border: 1px solid rgba(226, 205, 169, 0.5);
  color: var(--ifu-text-strong);
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

.suite-card,
.wallet-hero,
.composer-shell {
  margin-top: 14px;
  padding: 18px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(233, 221, 204, 0.92);
}

.suite-card--soft {
  background: linear-gradient(180deg, rgba(255, 248, 239, 0.98), rgba(248, 239, 226, 0.98));
}

.suite-card__title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.suite-card__title strong,
.info-row strong,
.record-row strong {
  color: var(--ifu-text-strong);
  font-size: 17px;
}

.suite-card__title span,
.info-row p,
.wallet-hero p,
.record-row p,
.composer-shell__label {
  color: var(--ifu-text);
  font-size: 13px;
  line-height: 1.7;
}

.info-row,
.record-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  padding-top: 14px;
}

.info-row__icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: linear-gradient(160deg, rgba(200, 169, 119, 0.18), rgba(166, 124, 82, 0.3));
  color: var(--ifu-gold-700);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 17px;
}

.info-row em,
.money-tag {
  font-style: normal;
  font-size: 13px;
  font-weight: 700;
}

.brand-chip-row {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.brand-chip-row--wrap {
  flex-wrap: wrap;
}

.thread-stack {
  margin-top: 14px;
  display: grid;
  gap: 10px;
}

.bubble {
  max-width: 88%;
  padding: 12px 14px;
  border-radius: 22px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--ifu-text-strong);
  background: rgba(248, 241, 232, 0.88);
}

.bubble--outgoing {
  justify-self: end;
  background: linear-gradient(135deg, #b89362, #d5b07d);
  color: #fffaf3;
}

.wallet-hero span,
.stat-block span {
  font-size: 12px;
  letter-spacing: 0.12em;
  color: var(--ifu-text-muted);
  text-transform: uppercase;
}

.wallet-hero strong {
  display: block;
  margin-top: 10px;
  font-size: 34px;
  line-height: 1.1;
  color: var(--ifu-text-strong);
}

.composer-shell__label {
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.composer-shell__value {
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.75;
  color: var(--ifu-text-strong);
}

.money-tag--up {
  color: #7e9a78;
}

.money-tag--down {
  color: #a85d52;
}

.stat-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.stat-block {
  padding: 14px;
  border-radius: 22px;
  background: rgba(248, 241, 232, 0.7);
}

.stat-block strong {
  display: block;
  margin-top: 8px;
  font-size: 24px;
  color: var(--ifu-text-strong);
}

.workflow-list {
  margin: 14px 0 0;
  padding-left: 18px;
  color: var(--ifu-text);
  display: grid;
  gap: 10px;
  line-height: 1.75;
}

@media (max-width: 960px) {
  .support-suite {
    padding: 28px 16px 40px;
  }

  .support-suite__header {
    flex-direction: column;
    align-items: start;
  }

  .support-suite__header h1 {
    font-size: 34px;
  }

  .support-suite__grid {
    grid-template-columns: 1fr;
  }
}
</style>
