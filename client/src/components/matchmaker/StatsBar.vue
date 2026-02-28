<template>
  <div class="stats-bar">
    <div v-for="item in items" :key="item.label" class="stats-bar__item" @click="$emit('click', item)">
      <span class="stats-bar__value">{{ item.value }}</span>
      <span class="stats-bar__label">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true
    // [{ label: '团队业绩', value: 0 }]
  }
})

defineEmits(['click'])
</script>

<style scoped>
.stats-bar {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
}

.stats-bar__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.stats-bar__value {
  font-size: 20px;
  font-weight: 600;
  color: var(--hl-text-primary);
  line-height: 1.4;
}

.stats-bar__label {
  font-size: 12px;
  color: var(--hl-text-placeholder);
  margin-top: 4px;
}
</style>
