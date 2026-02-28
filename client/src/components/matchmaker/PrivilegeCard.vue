<template>
  <div class="privilege-card">
    <div class="privilege-card__header">
      <div class="privilege-card__title">
        <van-icon name="diamond-o" size="24" color="#D4A44C" />
        <span>婚介特权</span>
      </div>
      <van-button size="small" round color="linear-gradient(135deg, #D4A44C, #F0D48B)" @click="$emit('openStore')">
        开通实体店
      </van-button>
    </div>
    <div class="privilege-card__features">
      <div v-for="item in features" :key="item.label" class="privilege-card__feature">
        <van-icon :name="item.icon" size="22" color="#D4A44C" />
        <span>{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['openStore'])

const features = [
  { icon: 'share-o', label: '分享收益' },
  { icon: 'certificate', label: '培训支撑' },
  { icon: 'friends-o', label: '婚介收益' },
  { icon: 'gold-coin-o', label: '终身收益' }
]
</script>

<style scoped>
.privilege-card {
  background: linear-gradient(135deg, #FFF9F0, #FFFAF3);
  border-radius: var(--hl-radius-md);
  margin: 12px 16px;
  padding: 16px;
  border: 1px solid #F0D48B33;
}

.privilege-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.privilege-card__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #8B6914;
}

.privilege-card__features {
  display: flex;
  justify-content: space-around;
}

.privilege-card__feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8B6914;
}
</style>
