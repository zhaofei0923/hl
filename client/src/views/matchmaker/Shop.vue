<template>
  <div class="page utility-page">
    <van-nav-bar title="我的商城" left-arrow :border="false" @click-left="$router.back()" />

    <section class="card utility-hero" data-testid="matchmaker-shop-shell">
      <div class="utility-hero__top">
        <div>
          <span class="brand-label">STORE</span>
          <h1>把商品区做成可直接承接服务转化的资产位</h1>
          <p>先按分类看服务包、礼品和全部商品，再决定后续接入成交链路或继续补商品信息。</p>
        </div>
        <span class="brand-chip brand-chip--active">{{ categoryTab === 'all' ? '全部' : categoryTab === 'service' ? '服务包' : '礼品' }}</span>
      </div>
      <div class="utility-hero__chips">
        <span class="brand-chip">{{ productList.length }} 件商品</span>
        <span class="brand-chip">服务转化</span>
        <span class="brand-chip">商城筹备中</span>
      </div>
    </section>

    <van-tabs v-model:active="categoryTab" @change="handleCategoryChange">
      <van-tab title="全部" name="all" />
      <van-tab title="服务包" name="service" />
      <van-tab title="礼品" name="gift" />
    </van-tabs>

    <section class="shop-readiness-card" data-testid="matchmaker-shop-readiness">
      <div class="shop-readiness-card__head">
        <div>
          <span class="brand-label">MERCHANDISE PLAN</span>
          <h2>商城承接判断</h2>
        </div>
        <strong>{{ productList.length ? '有商品' : '筹备中' }}</strong>
      </div>
      <div class="shop-readiness-card__grid">
        <article v-for="item in shopReadinessItems" :key="item.label">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p>{{ item.hint }}</p>
        </article>
      </div>
    </section>

    <div class="product-grid">
      <div
        v-for="item in productList"
        :key="item.id"
        class="product-card"
        @click="handleProduct(item)"
      >
        <van-image
          :src="item.imageUrl"
          width="100%"
          height="140"
          fit="cover"
          :radius="8"
          class="product-card__image"
        >
          <template #error>
            <div class="product-card__image-fallback">
              <van-icon name="shopping-cart-o" size="32" color="#ddd" />
            </div>
          </template>
        </van-image>
        <div class="product-card__body">
          <div class="product-card__name">{{ item.name }}</div>
          <div class="product-card__bottom">
            <span class="product-card__price">
              <em>¥</em>{{ formatMoney(item.price) }}
            </span>
            <span class="product-card__sales">已售{{ item.salesCount || 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <EmptyState v-if="productList.length === 0" text="商城即将上线" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { showToast } from 'vant'
import { formatMoney } from '@/utils/format'
import EmptyState from '@/components/common/EmptyState.vue'

const categoryTab = ref('all')
const productList = ref([])
const serviceProductCount = computed(() => productList.value.filter(item => item.category === 'service').length)
const giftProductCount = computed(() => productList.value.filter(item => item.category === 'gift').length)
const shopReadinessItems = computed(() => [
  {
    label: '当前分类',
    value: categoryTab.value === 'all' ? '全部' : categoryTab.value === 'service' ? '服务包' : '礼品',
    hint: '分类清晰后，后续可承接不同成交场景。'
  },
  {
    label: '服务商品',
    value: `${serviceProductCount.value} 件`,
    hint: serviceProductCount.value ? '可用于会员服务包转化。' : '建议优先准备标准服务包。'
  },
  {
    label: '礼品商品',
    value: `${giftProductCount.value} 件`,
    hint: giftProductCount.value ? '可辅助活动、邀约和关系维护。' : '礼品位可作为后续运营补充。'
  }
])

function handleCategoryChange() {
  // 商城API暂未对接
}

function handleProduct(item) {
  showToast('商城即将上线，敬请期待')
}
</script>

<style scoped>
.product-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 12px 16px;
}

.shop-readiness-card {
  margin: 12px 16px 0;
  padding: 16px;
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: var(--ifu-shadow-soft);
}

.shop-readiness-card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.shop-readiness-card__head h2 {
  margin-top: 6px;
  color: var(--ifu-text-strong);
  font-size: 22px;
  line-height: 1.3;
}

.shop-readiness-card__head strong {
  flex-shrink: 0;
  padding: 8px 11px;
  border-radius: 999px;
  background: rgba(200, 169, 119, 0.16);
  color: var(--ifu-gold-700);
  font-size: 12px;
}

.shop-readiness-card__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.shop-readiness-card__grid article {
  padding: 13px 12px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 252, 248, 0.94), rgba(249, 241, 230, 0.76));
  border: 1px solid rgba(233, 221, 204, 0.86);
}

.shop-readiness-card__grid span {
  display: block;
  color: var(--ifu-text-muted);
  font-size: 11px;
}

.shop-readiness-card__grid strong {
  display: block;
  margin-top: 8px;
  color: var(--ifu-text-strong);
  font-size: 16px;
}

.shop-readiness-card__grid p {
  margin-top: 6px;
  color: var(--ifu-text-muted);
  font-size: 11px;
  line-height: 1.5;
}

.product-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(233, 221, 204, 0.92);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--ifu-shadow-soft);
}

.product-card__image-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 140px;
  background: rgba(249, 241, 230, 0.72);
}

.product-card__body {
  padding: 10px 10px 12px;
}

.product-card__name {
  font-size: 14px;
  font-weight: 500;
  color: var(--ifu-text-strong);
  line-height: 1.3;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card__bottom {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.product-card__price {
  font-size: 16px;
  font-weight: 700;
  color: var(--ifu-gold-700);
}

.product-card__price em {
  font-size: 12px;
  font-style: normal;
}

.product-card__sales {
  font-size: 11px;
  color: var(--ifu-text-muted);
}

@media (max-width: 380px) {
  .shop-readiness-card__grid {
    grid-template-columns: 1fr;
  }
}
</style>
