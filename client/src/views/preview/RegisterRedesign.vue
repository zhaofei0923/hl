<template>
  <div class="register-preview" data-testid="preview-register-redesign">
    <header class="register-preview__header">
      <div>
        <span class="brand-label">07 REGISTER REDESIGN</span>
        <h1>把注册变成礼宾式建档，而不是填表</h1>
      </div>
      <p>通过明确阶段感、资料价值提示和照片引导，降低填写疲劳，让用户理解每一步都在为更好的推荐质量服务。</p>
    </header>

    <section class="register-preview__grid">
      <article class="phone-frame">
        <div class="onboarding-hero" data-testid="preview-register-progress">
          <span class="brand-label">ONBOARDING</span>
          <h2>4 步建立你的会客名片</h2>
          <p>平台先帮你搭骨架，红娘再帮你补气质和可信度。</p>
          <div class="onboarding-hero__meter">
            <div class="onboarding-hero__meter-bar"></div>
          </div>
          <div class="onboarding-hero__meta">
            <strong>第 2 步 / 4</strong>
            <span>预计还需 3 分钟</span>
          </div>
        </div>

        <div class="step-stack" data-testid="preview-register-steps">
          <article v-for="step in steps" :key="step.index" class="step-card" :class="{ 'step-card--active': step.active }">
            <div class="step-card__index">{{ step.index }}</div>
            <div>
              <strong>{{ step.title }}</strong>
              <p>{{ step.desc }}</p>
            </div>
            <span class="step-card__status">{{ step.status }}</span>
          </article>
        </div>
      </article>

      <article class="phone-frame phone-frame--light">
        <div class="form-card">
          <span class="brand-label">STEP 02</span>
          <h2>详细资料</h2>
          <div class="field-list">
            <article v-for="field in fields" :key="field.label" class="field-row">
              <label>{{ field.label }}</label>
              <div>{{ field.value }}</div>
            </article>
          </div>
        </div>

        <div class="photo-card">
          <div class="photo-card__head">
            <strong>照片建议</strong>
            <span>至少上传 3 张</span>
          </div>
          <div class="photo-grid">
            <div v-for="item in photos" :key="item.label" class="photo-tile">
              <span>{{ item.kicker }}</span>
              <strong>{{ item.label }}</strong>
            </div>
          </div>
        </div>

        <div class="trust-note">
          <span class="brand-label">WHY IT MATTERS</span>
          <p>完整资料会显著提高推荐准确度，也更利于红娘给出开场建议与线下活动分组。</p>
          <div class="trust-note__chips">
            <span class="brand-chip brand-chip--active">资料完整度 +32%</span>
            <span class="brand-chip">更高被联系率</span>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
const steps = [
  { index: '01', title: '基本信息', desc: '昵称、城市、出生日期与基本偏好。', status: '已完成', active: false },
  { index: '02', title: '详细资料', desc: '学历、职业、收入与生活方式。', status: '进行中', active: true },
  { index: '03', title: '自我介绍', desc: '补充关系观与理想对象描述。', status: '待填写', active: false },
  { index: '04', title: '完成建档', desc: '进入推荐流，等待红娘复核。', status: '待完成', active: false }
]

const fields = [
  { label: '学历', value: '硕士' },
  { label: '职业', value: '品牌策略顾问' },
  { label: '月收入', value: '30k-50k' },
  { label: '婚姻状况', value: '未婚' }
]

const photos = [
  { kicker: 'PORTRAIT', label: '清晰头像' },
  { kicker: 'LIFESTYLE', label: '生活场景' },
  { kicker: 'SOCIAL', label: '兴趣时刻' }
]
</script>

<style scoped>
.register-preview {
  min-height: 100vh;
  padding: 36px 24px 56px;
  background:
    radial-gradient(circle at 12% 14%, rgba(226, 205, 169, 0.22), transparent 24%),
    linear-gradient(180deg, #fffdf9 0%, var(--ifu-bg) 100%);
}

.register-preview__header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 24px;
}

.register-preview__header h1 {
  margin-top: 8px;
  font-size: 46px;
  line-height: 1.08;
}

.register-preview__header p {
  max-width: 420px;
  font-size: 15px;
  line-height: 1.8;
  color: var(--ifu-text);
}

.register-preview__grid {
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

.onboarding-hero,
.form-card,
.photo-card,
.trust-note {
  padding: 18px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(233, 221, 204, 0.92);
}

.onboarding-hero {
  background: linear-gradient(140deg, #8e6941, #bc9662 62%, #ecd9b9);
  color: #fffaf4;
  border: 0;
}

.onboarding-hero h2,
.form-card h2 {
  margin-top: 10px;
  font-size: 28px;
  line-height: 1.2;
}

.onboarding-hero p,
.step-card p,
.trust-note p {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.75;
}

.onboarding-hero__meter {
  height: 10px;
  margin-top: 18px;
  border-radius: 999px;
  background: rgba(255, 250, 244, 0.18);
  overflow: hidden;
}

.onboarding-hero__meter-bar {
  width: 56%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #f7e7cb, #fff9ef);
}

.onboarding-hero__meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  font-size: 12px;
}

.step-stack,
.photo-card,
.trust-note {
  margin-top: 14px;
}

.step-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid rgba(233, 221, 204, 0.76);
}

.step-card:first-of-type {
  margin-top: 6px;
}

.step-card:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.step-card--active {
  position: relative;
}

.step-card__index {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: linear-gradient(160deg, rgba(200, 169, 119, 0.2), rgba(166, 124, 82, 0.34));
  color: var(--ifu-gold-700);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
}

.step-card strong,
.photo-card__head strong,
.photo-tile strong {
  font-size: 20px;
  color: var(--ifu-text-strong);
}

.step-card__status,
.photo-card__head span {
  color: var(--ifu-text-muted);
  font-size: 12px;
}

.field-list {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.field-row {
  padding: 14px 16px;
  border-radius: 20px;
  background: linear-gradient(180deg, #fffaf3, #f8eedf);
}

.field-row label {
  display: block;
  color: var(--ifu-text-muted);
  font-size: 12px;
}

.field-row div {
  margin-top: 8px;
  color: var(--ifu-text-strong);
  font-size: 16px;
}

.photo-card__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 16px;
}

.photo-tile {
  min-height: 112px;
  padding: 14px;
  border-radius: 22px;
  background: linear-gradient(180deg, #fffdf9, #f6ebdd);
  display: flex;
  flex-direction: column;
  justify-content: end;
}

.photo-tile span {
  color: var(--ifu-text-muted);
  font-size: 11px;
}

.photo-tile strong {
  margin-top: 6px;
  font-size: 17px;
}

.trust-note {
  background: linear-gradient(180deg, #fffaf3, #f7eddc);
}

.trust-note__chips {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}
</style>
