<template>
  <div class="member-card" @click="$emit('click', member)">
    <div class="member-card__header">
      <van-image
        round
        width="48"
        height="48"
        :src="member.avatarUrl || defaultAvatar"
        fit="cover"
      />
      <div class="member-card__info">
        <div class="member-card__name-row">
          <span class="member-card__name">{{ member.nickname || member.realName }}</span>
          <van-icon v-if="member.isVerified" name="shield-o" color="#1989fa" size="16" />
          <van-icon name="phone-o" color="var(--hl-accent-color)" size="16" @click.stop="$emit('call', member)" />
        </div>
        <div class="member-card__detail">手机号: {{ member.phone }}</div>
        <div class="member-card__detail">({{ formatDate(member.createdAt, 'YYYY-MM-DD HH:mm:ss') }}注册)</div>
        <div class="member-card__tags">
          {{ member.city || '未知' }} · {{ member.age || '?'  }}岁 · {{ member.incomeRange || '未填写' }}元
        </div>
      </div>
    </div>
    <div class="member-card__actions">
      <van-button size="small" round type="danger" plain @click.stop="$emit('speedMatch', member)">速配</van-button>
      <van-button size="small" round plain @click.stop="$emit('editProfile', member)">编辑资料</van-button>
      <van-button size="small" round plain @click.stop="$emit('editRights', member)">编辑权益</van-button>
      <van-button size="small" round type="danger" plain hairline @click.stop="$emit('greet', member)">打招呼</van-button>
    </div>
  </div>
</template>

<script setup>
import { formatDate } from '@/utils/format'

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyNCIgZmlsbD0iI0UwRTBFMCIvPjxwYXRoIGQ9Ik0yNCAxNmE2IDYgMCAxIDAgMCAxMiA2IDYgMCAwIDAgMC0xMnptMCAxNmMtNi42MyAwLTEyIDIuNjktMTIgNnYyaDI0di0yYzAtMy4zMS01LjM3LTYtMTItNnoiIGZpbGw9IiNBMEEwQTAiLz48L3N2Zz4='

defineProps({
  member: {
    type: Object,
    required: true
  }
})

defineEmits(['click', 'call', 'speedMatch', 'editProfile', 'editRights', 'greet'])
</script>

<style scoped>
.member-card {
  background: var(--hl-card-bg);
  border-radius: var(--hl-radius-md);
  margin: 12px 16px;
  padding: 16px;
}

.member-card__header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.member-card__info {
  flex: 1;
  min-width: 0;
}

.member-card__name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.member-card__name {
  font-size: 16px;
  font-weight: 600;
  color: var(--hl-text-primary);
}

.member-card__detail {
  font-size: 13px;
  color: var(--hl-text-secondary);
  line-height: 1.6;
}

.member-card__tags {
  font-size: 13px;
  color: var(--hl-text-secondary);
  margin-top: 2px;
}

.member-card__actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--hl-border-color);
}
</style>
