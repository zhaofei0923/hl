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
  padding: 60px 20px;
}

.empty-state__image {
  width: 120px;
  height: 120px;
  object-fit: contain;
  margin-bottom: 16px;
}

.empty-state__icon {
  margin-bottom: 16px;
}

.empty-state__text {
  font-size: 14px;
  color: var(--hl-text-placeholder);
}
</style>
