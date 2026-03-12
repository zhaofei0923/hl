<template>
  <div class="preview-page" data-testid="preview-home-redesign">
    <header class="preview-page__header">
      <div>
        <span class="brand-label">01 HOME REDESIGN</span>
        <h1>首页高保真样板</h1>
      </div>
      <p>同一份 Figma 内输出默认态、筛选态和空状态，作为后续主应用扩展基准。</p>
    </header>

    <section class="preview-grid">
      <article class="phone-frame" data-testid="preview-home-state-default">
        <div class="phone-frame__hero">
          <span class="brand-label">DEFAULT</span>
          <h2>今天先看值得认识的人</h2>
          <p>平台先筛选，红娘再复核。</p>
        </div>
        <div class="phone-frame__chips">
          <span class="brand-chip">年龄段</span>
          <span class="brand-chip">城市</span>
          <span class="brand-chip">学历</span>
        </div>
        <div class="phone-card">
          <div class="phone-card__top">
            <div>
              <strong>张明远</strong>
              <span>36岁 · 北京 · 本科</span>
            </div>
            <em>98%</em>
          </div>
          <p>同城且教育背景接近，适合先从轻松话题开始。</p>
        </div>
      </article>

      <article class="phone-frame" data-testid="preview-home-state-filtered">
        <div class="phone-frame__hero phone-frame__hero--soft">
          <span class="brand-label">FILTERED</span>
          <h2>保留更接近你条件的人</h2>
          <p>筛选激活后，用更明确的状态表达反馈。</p>
        </div>
        <div class="phone-frame__chips">
          <span class="brand-chip brand-chip--active">29-33岁</span>
          <span class="brand-chip brand-chip--active">杭州</span>
          <span class="brand-chip">学历</span>
        </div>
        <div class="phone-card">
          <div class="phone-card__top">
            <div>
              <strong>赵浩然</strong>
              <span>33岁 · 杭州 · 博士</span>
            </div>
            <em>92%</em>
          </div>
          <p>同城高潜匹配，见面门槛更低，适合优先推进认识节奏。</p>
        </div>
      </article>

      <article class="phone-frame" data-testid="preview-home-state-empty">
        <div class="phone-frame__hero phone-frame__hero--light">
          <span class="brand-label">EMPTY</span>
          <h2>空状态也要有明确行动</h2>
          <p>把“完善资料”和“去认证”变成主行动。</p>
        </div>
        <div class="empty-card">
          <div class="empty-card__icon">
            <span>♡</span>
          </div>
          <strong>暂无推荐</strong>
          <p>先完善资料可提升匹配精准度。</p>
          <div class="empty-card__actions">
            <span class="brand-chip brand-chip--active">完善资料</span>
            <span class="brand-chip">去认证</span>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.preview-page {
  min-height: 100vh;
  padding: 36px 24px 56px;
  background: linear-gradient(180deg, #fffdf9, var(--ifu-bg));
}

.preview-page__header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: end;
}

.preview-page__header h1 {
  margin-top: 8px;
  font-size: 46px;
  color: var(--ifu-text-strong);
}

.preview-page__header p {
  max-width: 360px;
  font-size: 15px;
  line-height: 1.75;
  color: var(--ifu-text);
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
  margin-top: 34px;
}

.phone-frame {
  padding: 18px;
  border-radius: 40px;
  background: #f8f1e8;
  border: 1px solid rgba(233, 221, 204, 0.96);
  box-shadow: var(--ifu-shadow-card);
}

.phone-frame__hero {
  padding: 18px;
  border-radius: 28px;
  background: linear-gradient(145deg, #8e6941, #be965f 64%, #ddc292);
  color: #fffaf4;
}

.phone-frame__hero--soft {
  background: linear-gradient(145deg, #9a7752, #ccab7b 70%, #efe0bf);
}

.phone-frame__hero--light {
  background: linear-gradient(180deg, #fffaf3, #f7eddc);
  color: var(--ifu-text-strong);
  border: 1px solid rgba(226, 205, 169, 0.5);
}

.phone-frame__hero h2 {
  margin-top: 10px;
  font-size: 26px;
  line-height: 1.2;
}

.phone-frame__hero p {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.7;
}

.phone-frame__chips {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.phone-card,
.empty-card {
  margin-top: 14px;
  padding: 18px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(233, 221, 204, 0.92);
}

.phone-card__top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.phone-card strong,
.empty-card strong {
  display: block;
  font-size: 22px;
  color: var(--ifu-text-strong);
}

.phone-card span {
  display: block;
  margin-top: 6px;
  font-size: 13px;
  color: var(--ifu-text-muted);
}

.phone-card em {
  font-style: normal;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 24px;
  color: var(--ifu-gold-700);
}

.phone-card p,
.empty-card p {
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.75;
  color: var(--ifu-text);
}

.empty-card {
  text-align: center;
}

.empty-card__icon {
  width: 86px;
  height: 86px;
  display: grid;
  place-items: center;
  margin: 0 auto;
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(255, 250, 242, 0.94), rgba(246, 235, 221, 0.76));
  border: 1px solid rgba(226, 205, 169, 0.4);
}

.empty-card__icon span {
  font-size: 34px;
  color: var(--ifu-gold-700);
}

.empty-card__actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}
</style>
