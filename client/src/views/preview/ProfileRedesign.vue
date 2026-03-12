<template>
  <div class="profile-preview" data-testid="preview-profile-redesign">
    <header class="profile-preview__header">
      <div>
        <span class="brand-label">04 PROFILE REDESIGN</span>
        <h1>个人中心像一份可持续更新的会客名片</h1>
      </div>
      <p>把会员权益、可信身份、关系进度和快捷入口拆成清晰层级，让“我的”页不再只是菜单集合，而是个人状态总览。</p>
    </header>

    <section class="profile-preview__grid">
      <article class="phone-frame">
        <div class="profile-hero">
          <div class="profile-hero__avatar">林</div>
          <div>
            <span class="brand-label">PROFILE</span>
            <h2>林知遥</h2>
            <p>32岁 · 杭州 · 品牌策略</p>
          </div>
        </div>

        <div class="membership-card" data-testid="preview-profile-membership">
          <div class="membership-card__head">
            <div>
              <span class="brand-label">MEMBERSHIP</span>
              <strong>金标相亲计划</strong>
            </div>
            <em>VIP</em>
          </div>
          <p>享受专属红娘跟进、优先曝光和一对一资料优化建议。</p>
          <div class="membership-card__stats">
            <article v-for="item in membershipStats" :key="item.label">
              <strong>{{ item.value }}</strong>
              <span>{{ item.label }}</span>
            </article>
          </div>
        </div>

        <div class="journey-card">
          <div class="journey-card__head">
            <strong>本周关系进度</strong>
            <span>由红娘同步更新</span>
          </div>
          <article v-for="step in journeySteps" :key="step.title" class="journey-item">
            <div class="journey-item__dot"></div>
            <div>
              <strong>{{ step.title }}</strong>
              <p>{{ step.desc }}</p>
            </div>
          </article>
        </div>
      </article>

      <article class="phone-frame phone-frame--soft">
        <div class="identity-card" data-testid="preview-profile-identity">
          <span class="brand-label">TRUST LAYER</span>
          <h2>可信身份与资料完整度前置</h2>
          <div class="identity-card__list">
            <article v-for="item in identityBadges" :key="item.title" class="identity-badge">
              <div class="identity-badge__icon">{{ item.icon }}</div>
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.desc }}</p>
              </div>
            </article>
          </div>
        </div>

        <div class="action-card">
          <div class="action-card__head">
            <strong>常用入口</strong>
            <span>优先使用高频操作</span>
          </div>
          <div class="action-grid">
            <article v-for="action in quickActions" :key="action.title" class="action-tile">
              <span>{{ action.kicker }}</span>
              <strong>{{ action.title }}</strong>
              <p>{{ action.desc }}</p>
            </article>
          </div>
        </div>

        <div class="notes-card">
          <span class="brand-label">MATCHMAKER NOTE</span>
          <p>建议把“旅行偏好”和“周末作息”补充得更具体，这类信息会显著提升开场质量与见面意愿。</p>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
const membershipStats = [
  { label: '资料完整度', value: '92%' },
  { label: '已认证项目', value: '4' },
  { label: '本周沟通中', value: '3' }
]

const journeySteps = [
  { title: '资料已复核', desc: '红娘已完成本周资料优化建议。' },
  { title: '2 位候选在沟通', desc: '其中 1 位建议安排线下见面前置了解。' },
  { title: '周末可参加沙龙', desc: '平台为你保留了 2 个精选活动席位。' }
]

const identityBadges = [
  { icon: '证', title: '实名资料', desc: '身份证与头像一致性已校验' },
  { icon: '业', title: '职业信息', desc: '公司与岗位信息通过人工复核' },
  { icon: '学', title: '学历认证', desc: '学历证书已上传并核实有效' }
]

const quickActions = [
  { kicker: 'PROFILE', title: '完善资料', desc: '补充兴趣、生活节奏与理想关系描述' },
  { kicker: 'MATCH', title: '我的推荐', desc: '查看本周优先推荐对象与匹配理由' },
  { kicker: 'EVENT', title: '沙龙活动', desc: '选择更适合你风格的线下轻社交活动' },
  { kicker: 'SERVICE', title: '联系红娘', desc: '获取专属建议与安排下一步推进节奏' }
]
</script>

<style scoped>
.profile-preview {
  min-height: 100vh;
  padding: 36px 24px 56px;
  background:
    radial-gradient(circle at 85% 12%, rgba(226, 205, 169, 0.22), transparent 24%),
    linear-gradient(180deg, #fffdf9 0%, var(--ifu-bg) 100%);
}

.profile-preview__header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 24px;
}

.profile-preview__header h1 {
  margin-top: 8px;
  font-size: 46px;
  line-height: 1.08;
}

.profile-preview__header p {
  max-width: 420px;
  font-size: 15px;
  line-height: 1.8;
  color: var(--ifu-text);
}

.profile-preview__grid {
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

.profile-hero,
.membership-card,
.journey-card,
.identity-card,
.action-card,
.notes-card {
  padding: 18px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(233, 221, 204, 0.92);
}

.membership-card,
.journey-card,
.action-card,
.notes-card {
  margin-top: 14px;
}

.profile-hero {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  align-items: center;
  background: linear-gradient(140deg, #8e6941, #bc9662 62%, #ecd9b9);
  color: #fffaf4;
}

.profile-hero__avatar {
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  border-radius: 24px;
  background: rgba(255, 250, 244, 0.22);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 26px;
}

.profile-hero h2,
.identity-card h2 {
  margin-top: 8px;
  font-size: 30px;
}

.profile-hero p,
.membership-card p,
.journey-item p,
.identity-badge p,
.action-tile p,
.notes-card p {
  margin-top: 8px;
  color: var(--ifu-text);
  font-size: 14px;
  line-height: 1.75;
}

.profile-hero p {
  color: rgba(255, 250, 244, 0.86);
}

.membership-card__head,
.journey-card__head,
.action-card__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
}

.membership-card__head strong,
.journey-card__head strong,
.action-card__head strong,
.identity-badge strong,
.action-tile strong {
  font-size: 22px;
  color: var(--ifu-text-strong);
}

.membership-card__head em {
  padding: 8px 12px;
  border-radius: 999px;
  font-style: normal;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  background: rgba(200, 169, 119, 0.18);
  color: var(--ifu-gold-700);
}

.membership-card__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.membership-card__stats article,
.action-tile {
  padding: 14px;
  border-radius: 22px;
  background: linear-gradient(180deg, #fffaf3, #f8eedf);
}

.membership-card__stats strong {
  display: block;
  font-size: 28px;
  color: var(--ifu-gold-700);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
}

.membership-card__stats span,
.journey-card__head span,
.action-card__head span,
.action-tile span {
  display: block;
  margin-top: 6px;
  color: var(--ifu-text-muted);
  font-size: 12px;
}

.journey-item,
.identity-badge {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  margin-top: 14px;
}

.journey-item__dot,
.identity-badge__icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: rgba(200, 169, 119, 0.16);
  color: var(--ifu-gold-700);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.notes-card {
  background: linear-gradient(180deg, #fffaf3, #f7eddc);
}
</style>
