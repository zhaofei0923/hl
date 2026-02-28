// 用户角色
export const ROLES = {
  USER: 'user',
  MATCHMAKER: 'matchmaker'
}

// 性别
export const GENDER = {
  UNKNOWN: 0,
  MALE: 1,
  FEMALE: 2
}

export const GENDER_TEXT = {
  [GENDER.UNKNOWN]: '未知',
  [GENDER.MALE]: '男',
  [GENDER.FEMALE]: '女'
}

// 会员类型
export const MEMBER_TYPE = {
  FREE: 'free',
  MEMBER: 'member',
  MANUAL_MATCH: 'manual_match',
  NO_CONSUMPTION: 'no_consumption'
}

export const MEMBER_TYPE_TEXT = {
  [MEMBER_TYPE.FREE]: '免费',
  [MEMBER_TYPE.MEMBER]: '会员',
  [MEMBER_TYPE.MANUAL_MATCH]: '人工牵线',
  [MEMBER_TYPE.NO_CONSUMPTION]: '无消费'
}

// 收益类型
export const EARNING_TYPE = {
  SHARE: 'share_earning',
  MATCH: 'match_earning',
  TEAM: 'team_earning',
  LIFETIME: 'lifetime_earning',
  XI_COIN: 'xi_coin_earning'
}

export const EARNING_TYPE_TEXT = {
  [EARNING_TYPE.SHARE]: '分享收益',
  [EARNING_TYPE.MATCH]: '婚介收益',
  [EARNING_TYPE.TEAM]: '团队收益',
  [EARNING_TYPE.LIFETIME]: '终身收益',
  [EARNING_TYPE.XI_COIN]: '囍币收益'
}

// 提现状态
export const WITHDRAW_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed',
  REJECTED: 'rejected'
}

export const WITHDRAW_STATUS_TEXT = {
  [WITHDRAW_STATUS.PENDING]: '审核中',
  [WITHDRAW_STATUS.PROCESSING]: '处理中',
  [WITHDRAW_STATUS.SUCCESS]: '已到账',
  [WITHDRAW_STATUS.FAILED]: '失败',
  [WITHDRAW_STATUS.REJECTED]: '已拒绝'
}

// 学历
export const EDUCATION_OPTIONS = [
  '高中及以下', '大专', '本科', '硕士', '博士'
]

// 婚姻状况
export const MARITAL_STATUS_OPTIONS = [
  '未婚', '离异', '丧偶'
]

// 收入范围
export const INCOME_OPTIONS = [
  '3000以下', '3000-5000', '5000-7000', '7000-10000',
  '10000-15000', '15000-20000', '20000-30000', '30000以上'
]
