<template>
  <div class="page member-detail-page">
    <van-nav-bar title="会员详情" left-arrow :border="false" @click-left="$router.back()">
      <template #right>
        <button type="button" class="member-detail-page__edit" @click="handleEdit">编辑</button>
      </template>
    </van-nav-bar>

    <van-loading v-if="loading" class="page-loading" size="24px" vertical>加载中...</van-loading>

    <template v-if="!loading && member">
      <section class="card member-hero" data-testid="matchmaker-member-hero">
        <div class="member-hero__identity">
          <van-image
            round
            width="84"
            height="84"
            :src="member.avatarUrl || defaultAvatar"
            fit="cover"
            class="member-hero__avatar"
          />
          <div class="member-hero__info">
            <span class="brand-label">MEMBER PROFILE</span>
            <div class="member-hero__name-row">
              <h1>{{ member.realName || member.nickname || '未填写' }}</h1>
              <span class="brand-chip brand-chip--active">{{ member.gender === 1 ? '男士' : member.gender === 2 ? '女士' : '待确认' }}</span>
            </div>
            <p>{{ maskPhone(member.phone) }} · {{ primaryLocation }} · {{ careerText }}</p>
            <div class="member-hero__chips">
              <span v-for="tag in heroTags" :key="tag" class="brand-chip">{{ tag }}</span>
            </div>
          </div>
        </div>

        <div class="member-hero__stats">
          <article v-for="item in heroStats" :key="item.label" class="member-hero__stat">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <small>{{ item.hint }}</small>
          </article>
        </div>
      </section>

      <section class="card member-section" data-testid="matchmaker-member-profile">
        <div class="member-section__header">
          <div>
            <span class="brand-label">PROFILE FACTS</span>
            <h3>顾问视角的基础资料</h3>
          </div>
          <span class="member-section__badge">{{ constellation || '星座待补充' }}</span>
        </div>

        <div class="member-profile-grid">
          <article v-for="item in profileItems" :key="item.label" class="member-profile-grid__item">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </article>
        </div>

        <div v-if="introText" class="member-note">
          <span class="brand-label">SELF INTRO</span>
          <p>{{ introText }}</p>
        </div>
      </section>

      <section class="card member-section" data-testid="matchmaker-member-partner">
        <div class="member-section__header">
          <div>
            <span class="brand-label">MATCH NOTES</span>
            <h3>择偶要求与跟进建议</h3>
          </div>
          <span class="member-section__badge">顾问跟进</span>
        </div>

        <div class="member-advice-list">
          <article v-for="item in advisorNotes" :key="item.title" class="member-advice-list__item">
            <strong>{{ item.title }}</strong>
            <p>{{ item.desc }}</p>
          </article>
        </div>

        <div class="member-note member-note--soft">
          <span class="brand-label">PARTNER REQUIREMENT</span>
          <p>{{ partnerRequirementText }}</p>
        </div>
      </section>

      <section v-if="photoList.length > 0" class="card member-section">
        <div class="member-section__header">
          <div>
            <span class="brand-label">GALLERY</span>
            <h3>个人相册</h3>
          </div>
          <span class="member-section__badge">{{ photoList.length }} 张</span>
        </div>

        <div class="photo-grid">
          <van-image
            v-for="(photo, index) in photoList"
            :key="index"
            :src="photo"
            width="100%"
            height="110"
            fit="cover"
            radius="16"
            @click="previewImage(index)"
          />
        </div>
      </section>
    </template>

    <EmptyState v-if="!loading && !member" text="会员不存在" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showImagePreview } from 'vant'
import { memberApi } from '@/api/member'
import { maskPhone, calcAge } from '@/utils/format'
import EmptyState from '@/components/common/EmptyState.vue'

const route = useRoute()
const router = useRouter()

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iI0UwRTBFMCIvPjxwYXRoIGQ9Ik0zMiAyMGE4IDggMCAxIDAgMCAxNiA4IDggMCAwIDAgMC0xNnptMCAyMGMtOC44NCAwLTE2IDMuNTgtMTYgOHYyaDMydi0yYzAtNC40Mi03LjE2LTgtMTYtOHoiIGZpbGw9IiNBMEEwQTAiLz48L3N2Zz4='

const loading = ref(true)
const member = ref(null)

const constellation = computed(() => {
  const remark = member.value?.remark || ''
  const match = remark.match(/星座[：:]\s*([^\s|]+)/)
  return match ? match[1] : ''
})

const primaryLocation = computed(() => member.value?.city || member.value?.hometown || member.value?.nativePlace || '城市待补充')
const careerText = computed(() => member.value?.occupation || '职业待补充')
const incomeText = computed(() => member.value?.income || member.value?.incomeRange || '收入待补充')
const ageText = computed(() => {
  if (!member.value) return '未填写'
  if (member.value.age) return `${member.value.age}岁`
  if (member.value.birthDate) return `${calcAge(member.value.birthDate)}岁`
  return '未填写'
})

const heroTags = computed(() => [
  ageText.value,
  member.value?.education || '学历待补充',
  incomeText.value
].filter(Boolean))

const heroStats = computed(() => [
  {
    label: '登记时间',
    value: member.value?.createdAt ? String(member.value.createdAt).slice(0, 10) : '待补充',
    hint: '便于判断跟进周期'
  },
  {
    label: '资料密度',
    value: `${profileCompletion.value}%`,
    hint: '越完整越适合进入匹配'
  },
  {
    label: '沟通优先级',
    value: profileCompletion.value >= 70 ? '可推进' : '待补齐',
    hint: '先补资料还是直接约聊'
  }
])

const profileCompletion = computed(() => {
  const fields = [
    member.value?.avatarUrl,
    member.value?.city,
    member.value?.education,
    member.value?.occupation,
    incomeText.value,
    member.value?.maritalStatus,
    member.value?.partnerRequirement || member.value?.partner_requirement,
    member.value?.selfIntro
  ]
  const filled = fields.filter(Boolean).length
  return Math.max(35, Math.round((filled / fields.length) * 100))
})

const profileItems = computed(() => [
  { label: '姓名', value: member.value?.realName || member.value?.nickname || '未填写' },
  { label: '性别', value: member.value?.gender === 1 ? '男' : member.value?.gender === 2 ? '女' : '未填写' },
  { label: '年龄', value: ageText.value },
  { label: '身高', value: member.value?.height ? `${member.value.height} cm` : '未填写' },
  { label: '学历', value: member.value?.education || '未填写' },
  { label: '职业', value: member.value?.occupation || '未填写' },
  { label: '常住地', value: primaryLocation.value },
  { label: '收入', value: incomeText.value },
  { label: '婚姻情况', value: member.value?.maritalStatus || '未填写' },
  { label: '房产', value: member.value?.houseStatus || '未填写' },
  { label: '车辆', value: member.value?.carStatus || '未填写' },
  { label: '籍贯', value: member.value?.hometown || member.value?.nativePlace || '未填写' }
])

const introText = computed(() => member.value?.selfIntro || '')
const partnerRequirementText = computed(() => member.value?.partnerRequirement || member.value?.partner_requirement || '暂无择偶要求')

const advisorNotes = computed(() => [
  {
    title: '资料梳理',
    desc: profileCompletion.value >= 70
      ? '基础资料已经达到可推进状态，优先围绕真实生活节奏和婚恋预期继续追问。'
      : '建议先补充职业、收入与择偶要求，让后续推荐理由更具体。'
  },
  {
    title: '开场建议',
    desc: `${primaryLocation.value}和${careerText.value}是最自然的切入口，适合先从城市节奏、工作稳定性和择偶节奏展开。`
  },
  {
    title: '匹配提醒',
    desc: partnerRequirementText.value === '暂无择偶要求'
      ? '尚未明确择偶边界，推荐先帮助会员梳理不能接受与优先考虑的条件。'
      : '已有明确择偶要求，推荐资源时先优先筛掉明显不匹配人选。'
  }
])

const photoList = computed(() => Array.isArray(member.value?.photos) ? member.value.photos : [])

function previewImage(index) {
  if (photoList.value.length) {
    showImagePreview({
      images: photoList.value,
      startPosition: index
    })
  }
}

function handleEdit() {
  router.push(`/matchmaker/member/${route.params.id}/edit`)
}

onMounted(async () => {
  try {
    const res = await memberApi.getDetail(route.params.id)
    member.value = res.data
  } catch (err) {
    // handled by interceptor
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.member-detail-page {
  padding-bottom: 36px;
}

.page-loading {
  padding: 100px 0;
}

.member-detail-page__edit {
  min-height: 34px;
  padding: 0 14px;
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 999px;
  background: rgba(255, 252, 247, 0.82);
  color: var(--ifu-text-strong);
}

.member-hero {
  overflow: hidden;
  background:
    radial-gradient(circle at right top, rgba(255, 250, 244, 0.2), transparent 28%),
    linear-gradient(145deg, #7d5f42, #ba915d 66%, #e0c7a1);
  color: #fff8ef;
}

.member-hero::after {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.14), transparent 36%);
}

.member-hero .brand-label {
  color: rgba(255, 248, 239, 0.74);
}

.member-hero .brand-chip--active {
  background: rgba(255, 248, 239, 0.18);
  color: #fff8ef;
  border-color: rgba(255, 248, 239, 0.28);
}

.member-hero__identity {
  display: flex;
  gap: 14px;
  align-items: center;
}

.member-hero__avatar {
  box-shadow: 0 18px 32px rgba(64, 44, 18, 0.18);
}

.member-hero__info {
  flex: 1;
}

.member-hero__name-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.member-hero__name-row h1 {
  font-size: 30px;
  line-height: 1.15;
}

.member-hero__info p {
  margin-top: 10px;
  color: rgba(255, 248, 239, 0.82);
  line-height: 1.6;
}

.member-hero__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.member-hero__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.member-hero__stat {
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 248, 239, 0.12);
  border: 1px solid rgba(255, 248, 239, 0.14);
}

.member-hero__stat span,
.member-hero__stat small {
  display: block;
  color: rgba(255, 248, 239, 0.72);
}

.member-hero__stat strong {
  display: block;
  margin: 8px 0 6px;
  font-size: 22px;
  color: #fffdf9;
}

.member-section__header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 16px;
}

.member-section__header h3 {
  margin-top: 8px;
  font-size: 21px;
  color: var(--ifu-text-strong);
}

.member-section__badge {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(200, 169, 119, 0.14);
  color: var(--ifu-gold-700);
  font-size: 12px;
}

.member-profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.member-profile-grid__item,
.member-advice-list__item {
  padding: 14px;
  border-radius: 18px;
  background: linear-gradient(180deg, #fffaf3, #f8eedf);
}

.member-profile-grid__item span {
  display: block;
  color: var(--ifu-text-muted);
  font-size: 12px;
}

.member-profile-grid__item strong {
  display: block;
  margin-top: 8px;
  color: var(--ifu-text-strong);
  font-size: 15px;
  line-height: 1.5;
}

.member-advice-list {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.member-advice-list__item strong {
  color: var(--ifu-text-strong);
  font-size: 16px;
}

.member-advice-list__item p,
.member-note p {
  margin-top: 8px;
  color: var(--ifu-text);
  line-height: 1.7;
}

.member-note {
  margin-top: 18px;
  padding: 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(233, 221, 204, 0.88);
}

.member-note--soft {
  background: linear-gradient(180deg, #fffaf3, #f8eedf);
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 18px;
}
</style>
