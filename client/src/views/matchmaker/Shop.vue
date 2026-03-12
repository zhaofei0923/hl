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
import { ref } from 'vue'
import { showToast } from 'vant'
import { formatMoney } from '@/utils/format'
import EmptyState from '@/components/common/EmptyState.vue'

const categoryTab = ref('all')
const productList = ref([])

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

.product-card {
  background: var(--hl-card-bg);
  border-radius: var(--hl-radius-md);
  overflow: hidden;
}

.product-card__image-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 140px;
  background: var(--hl-bg-color);
}

.product-card__body {
  padding: 10px 10px 12px;
}

.product-card__name {
  font-size: 14px;
  font-weight: 500;
  color: var(--hl-text-primary);
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
  color: var(--hl-accent-color);
}

.product-card__price em {
  font-size: 12px;
  font-style: normal;
}

.product-card__sales {
  font-size: 11px;
  color: var(--hl-text-placeholder);
}
</style>
