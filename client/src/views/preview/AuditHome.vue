<template>
  <div class="audit-page">
    <section class="audit-hero">
      <span class="brand-label">00 CURRENT AUDIT</span>
      <h1>旧版首页问题梳理</h1>
      <p>用于 Figma 的基线页，不再依赖旧代码本身，而是把需要优化的视觉与信息层级问题显式呈现出来。</p>
    </section>

    <section class="audit-grid">
      <article v-for="item in auditItems" :key="item.title" class="audit-card">
        <span class="audit-card__index">{{ item.index }}</span>
        <h2>{{ item.title }}</h2>
        <p>{{ item.desc }}</p>
      </article>
    </section>
  </div>
</template>

<script setup>
const auditItems = [
  { index: '01', title: '首屏过高', desc: 'Hero 的高度和信息量都偏大，推荐流被压到更下方，降低了首屏决策效率。' },
  { index: '02', title: '品牌语言未贯穿', desc: '首页局部有棕金感，但消息、个人中心和后台仍是不同语言，用户很难感知为同一品牌。' },
  { index: '03', title: '推荐卡信息顺序偏弱', desc: '匹配理由、可信度和行动按钮没有形成清晰的阅读动线，介绍文案占比过重。' }
]
</script>

<style scoped>
.audit-page {
  min-height: 100vh;
  padding: 36px 24px 56px;
  background: var(--ifu-bg);
}

.audit-hero {
  max-width: 760px;
}

.audit-hero h1 {
  margin-top: 8px;
  font-size: 44px;
  line-height: 1.1;
  color: var(--ifu-text-strong);
}

.audit-hero p {
  margin-top: 14px;
  font-size: 16px;
  line-height: 1.75;
  color: var(--ifu-text);
}

.audit-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 32px;
}

.audit-card {
  padding: 24px;
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 239, 226, 0.92));
  border: 1px solid rgba(233, 221, 204, 0.96);
  box-shadow: var(--ifu-shadow-card);
}

.audit-card__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(200, 169, 119, 0.16);
  color: var(--ifu-gold-700);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 18px;
}

.audit-card h2 {
  margin-top: 18px;
  font-size: 26px;
}

.audit-card p {
  margin-top: 10px;
  font-size: 15px;
  line-height: 1.75;
  color: var(--ifu-text);
}
</style>
