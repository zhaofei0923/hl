<template>
  <div class="empty-state">
    <img v-if="image" :src="image" class="empty-state__image" alt="" />
    <div v-else class="empty-state__icon">
      <van-icon name="search" size="64" color="#ddd" />
    </div>
    <p class="empty-state__text">{{ text }}</p>
    <slot name="action" />
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: '~ 空空如也 ~'
  },
  image: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 56px 20px;
}

.empty-state__image {
  width: 120px;
  height: 120px;
  object-fit: contain;
  margin-bottom: 16px;
}

.empty-state__icon {
  width: 88px;
  height: 88px;
  display: grid;
  place-items: center;
  margin-bottom: 18px;
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(255, 250, 242, 0.94), rgba(246, 235, 221, 0.76));
  border: 1px solid rgba(226, 205, 169, 0.4);
}

.empty-state__text {
  font-size: 14px;
  line-height: 1.7;
  color: var(--ifu-text-muted);
  text-align: center;
}
</style>
