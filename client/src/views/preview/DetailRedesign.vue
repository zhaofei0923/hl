<template>
  <div class="detail-preview" data-testid="preview-detail-redesign">
    <header class="detail-preview__header">
      <div>
        <span class="brand-label">08 DETAIL REDESIGN</span>
        <h1>用户详情页要让人快速判断“值不值得认识”</h1>
      </div>
      <p>用强首图、可信分层、匹配理由和明确行动条，替代单纯的资料堆叠，让阅读动线更接近真实决策过程。</p>
    </header>

    <section class="detail-preview__grid">
      <article class="phone-frame">
        <div class="profile-hero">
          <div class="profile-hero__cover"></div>
          <div class="profile-hero__content">
            <div class="profile-hero__avatar">顾</div>
            <div>
              <span class="brand-label">PROFILE</span>
              <h2>顾知南</h2>
              <p>34岁 · 上海 · 建筑设计师</p>
            </div>
            <em>96%</em>
          </div>
        </div>

        <div class="trust-card" data-testid="preview-detail-trust">
          <div class="trust-card__head">
            <strong>可信度评估</strong>
            <span>高可信</span>
          </div>
          <div class="trust-card__meter">
            <div class="trust-card__meter-bar"></div>
          </div>
          <div class="trust-card__chips">
            <span class="brand-chip brand-chip--active">实名资料</span>
            <span class="brand-chip">学历认证</span>
            <span class="brand-chip">红娘复核</span>
          </div>
        </div>

        <div class="summary-card">
          <article v-for="item in summary" :key="item.label">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </article>
        </div>
      </article>

      <article class="phone-frame phone-frame--light">
        <div class="match-card">
          <span class="brand-label">WHY MATCH</span>
          <h2>这次推荐的理由</h2>
          <ul>
            <li v-for="reason in reasons" :key="reason">{{ reason }}</li>
          </ul>
        </div>

        <div class="story-card">
          <span class="brand-label">ABOUT</span>
          <p>长期生活在上海，工作节奏稳定，偏爱城市漫步、展览和节奏舒缓的周末安排。希望关系建立在真诚和尊重之上，不追求过度热烈，更看重长期相处的舒适感。</p>
        </div>

        <div class="cta-card" data-testid="preview-detail-cta">
          <div>
            <strong>现在适合怎么开始？</strong>
            <p>建议从周末安排和最近看展经历切入，更容易形成轻松对话。</p>
          </div>
          <div class="cta-card__actions">
            <span class="brand-chip">收藏稍后聊</span>
            <span class="brand-chip brand-chip--active">立即打招呼</span>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
const summary = [
  { label: '学历', value: '硕士' },
  { label: '身高', value: '172 cm' },
  { label: '收入', value: '35k+' }
]

const reasons = [
  '同城且生活节奏接近，线下见面成本较低。',
  '职业审美与兴趣偏好有明显重合，利于开场。',
  '资料完整度高，关系预判更稳定。'
]
</script>

<style scoped>
.detail-preview {
  min-height: 100vh;
  padding: 36px 24px 56px;
  background:
    radial-gradient(circle at 88% 12%, rgba(226, 205, 169, 0.2), transparent 24%),
    linear-gradient(180deg, #fffdf9 0%, var(--ifu-bg) 100%);
}

.detail-preview__header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 24px;
}

.detail-preview__header h1 {
  margin-top: 8px;
  font-size: 46px;
  line-height: 1.08;
}

.detail-preview__header p {
  max-width: 420px;
  font-size: 15px;
  line-height: 1.8;
  color: var(--ifu-text);
}

.detail-preview__grid {
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

.phone-frame--light {
  background: linear-gradient(180deg, rgba(255, 248, 239, 0.98), rgba(248, 239, 226, 0.94));
}

.profile-hero,
.trust-card,
.summary-card,
.match-card,
.story-card,
.cta-card {
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(233, 221, 204, 0.92);
}

.profile-hero {
  overflow: hidden;
}

.profile-hero__cover {
  height: 160px;
  background:
    linear-gradient(180deg, rgba(25, 19, 15, 0.12), rgba(25, 19, 15, 0.32)),
    linear-gradient(135deg, #7f6548, #b08b61 68%, #d9bc91);
}

.profile-hero__content {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 18px;
  margin-top: -38px;
}

.profile-hero__avatar {
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  border-radius: 24px;
  background: rgba(255, 250, 244, 0.88);
  color: var(--ifu-gold-700);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 26px;
  box-shadow: var(--ifu-shadow-soft);
}

.profile-hero h2,
.match-card h2 {
  margin-top: 8px;
  font-size: 30px;
}

.profile-hero p,
.story-card p,
.cta-card p,
.match-card li {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.75;
  color: var(--ifu-text);
}

.profile-hero em {
  font-style: normal;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 30px;
  color: var(--ifu-gold-700);
}

.trust-card,
.summary-card,
.match-card,
.story-card,
.cta-card {
  margin-top: 14px;
  padding: 18px;
}

.trust-card__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.trust-card__head strong,
.summary-card strong,
.cta-card strong {
  font-size: 22px;
  color: var(--ifu-text-strong);
}

.trust-card__head span {
  color: var(--ifu-gold-700);
  font-size: 13px;
}

.trust-card__meter {
  height: 10px;
  margin-top: 16px;
  border-radius: 999px;
  background: rgba(200, 169, 119, 0.16);
  overflow: hidden;
}

.trust-card__meter-bar {
  width: 84%;
  height: 100%;
  background: linear-gradient(90deg, #a67c52, #dec498);
}

.trust-card__chips {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.summary-card {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.summary-card article {
  padding: 14px;
  border-radius: 22px;
  background: linear-gradient(180deg, #fffaf3, #f8eedf);
}

.summary-card span {
  color: var(--ifu-text-muted);
  font-size: 12px;
}

.summary-card strong {
  display: block;
  margin-top: 8px;
  font-size: 20px;
}

.match-card ul {
  margin-top: 14px;
  padding-left: 18px;
}

.cta-card {
  background: linear-gradient(180deg, #fffaf3, #f7eddc);
}

.cta-card__actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}
</style>
