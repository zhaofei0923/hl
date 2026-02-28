/**
 * 测试助手工具
 * 提供登录、API请求、常用选择器等辅助功能
 */

const API_BASE = 'http://localhost:3000/api';

/** 测试账号 - 与 seed_test_data.js 对应（种子数据只设置了 phone，未设置 username） */
const TEST_ACCOUNTS = {
  // 用户端 - 男性
  maleUser: { phone: '13800000001', password: 'test123456', nickname: '张明远' },
  maleUser2: { phone: '13800000002', password: 'test123456', nickname: '李文博' },
  // 用户端 - 女性
  femaleUser: { phone: '13900000001', password: 'test123456', nickname: '林婉婷' },
  femaleUser2: { phone: '13900000002', password: 'test123456', nickname: '陈雨萱' },
  // 红娘端
  matchmaker: { phone: '13700000001', password: 'test123456', nickname: '王红娘' },
  matchmaker2: { phone: '13700000002', password: 'test123456', nickname: '李月老' },
  // 双角色用户（同时拥有求偶和婚介身份）
  dualRoleUser: { phone: '13600000001', password: 'test123456', nickname: '赵双双' },
  dualRoleMatchmaker: { phone: '13600000002', password: 'test123456', nickname: '钱婉兮' },
};

/**
 * Token 缓存 - 避免重复登录，减少 API 请求次数以防止触发频率限制
 * key: accountKey, value: { token, refreshToken, user }
 */
const _tokenCache = new Map();

/**
 * 获取缓存的 token（仅用于 API 测试，不设置 localStorage）
 * @param {import('@playwright/test').APIRequestContext|import('@playwright/test').Page} reqOrPage
 * @param {string} accountKey
 * @returns {Promise<{token: string, refreshToken: string, user: object}>}
 */
async function getAuthData(reqOrPage, accountKey = 'maleUser') {
  if (_tokenCache.has(accountKey)) {
    return _tokenCache.get(accountKey);
  }
  const account = TEST_ACCOUNTS[accountKey];
  // reqOrPage 可能是 page 或 request context
  const request = reqOrPage.request ? reqOrPage.request : reqOrPage;
  const response = await request.post(`${API_BASE}/auth/password/login`, {
    data: { phone: account.phone, password: account.password },
  });
  const body = await response.json();
  if (body.code !== 0 && body.code !== 200) {
    throw new Error(`Login failed for ${accountKey}: ${body.message}`);
  }
  const authData = body.data;
  _tokenCache.set(accountKey, authData);
  return authData;
}

/**
 * 通过 API 登录并设置 localStorage token（使用缓存）
 * @param {import('@playwright/test').Page} page
 * @param {'maleUser'|'femaleUser'|'matchmaker'|'maleUser2'|'femaleUser2'|'matchmaker2'} accountKey
 */
async function loginViaAPI(page, accountKey = 'maleUser') {
  const { token, refreshToken, user } = await getAuthData(page, accountKey);

  // 在页面上设置 localStorage
  await page.addInitScript(({ token, refreshToken, user }) => {
    localStorage.setItem('hl_token', token);
    localStorage.setItem('hl_refresh_token', refreshToken);
    localStorage.setItem('userInfo', JSON.stringify(user));
  }, { token, refreshToken, user });

  return { token, refreshToken, user };
}

/**
 * 通过 UI 执行用户名/密码登录
 * @param {import('@playwright/test').Page} page
 * @param {string} username
 * @param {string} password
 */
async function loginViaUI(page, username, password) {
  await page.goto('/login');
  // 默认就是"账号登录" tab (activeTab=1)
  await page.locator('.van-tab').filter({ hasText: '账号登录' }).click();
  // 勾选协议
  await page.locator('.login-agreement .van-checkbox__icon').click();
  // 填写用户名和密码
  await page.fill('input[placeholder="请输入用户名"]', username);
  await page.fill('input[placeholder="请输入密码"]', password);
  // 点击登录
  await page.locator('.login-form__submit').filter({ hasText: '登录' }).click();
}

/**
 * 确保页面已登录并导航到指定路径
 * @param {import('@playwright/test').Page} page
 * @param {string} path
 * @param {string} accountKey
 */
async function loginAndGoto(page, path, accountKey = 'maleUser') {
  await loginViaAPI(page, accountKey);
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

/**
 * 发送 API 请求（带 token）
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} token
 * @param {string} method
 * @param {string} endpoint
 * @param {object} [data]
 */
async function apiRequest(request, token, method, endpoint, data) {
  const options = {
    headers: { Authorization: `Bearer ${token}` },
  };
  if (data) options.data = data;

  const url = `${API_BASE}${endpoint}`;
  switch (method.toUpperCase()) {
    case 'GET':
      return request.get(url, options);
    case 'POST':
      return request.post(url, options);
    case 'PUT':
      return request.put(url, options);
    case 'DELETE':
      return request.delete(url, options);
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
}

/**
 * 等待 Vant Toast 消息出现
 * @param {import('@playwright/test').Page} page
 * @param {string} text
 */
async function waitForToast(page, text) {
  await page.locator('.van-toast').filter({ hasText: text }).waitFor({ timeout: 5000 });
}

/**
 * 等待页面 URL 变化
 * @param {import('@playwright/test').Page} page
 * @param {string|RegExp} urlPattern
 */
async function waitForNavigation(page, urlPattern) {
  await page.waitForURL(urlPattern, { timeout: 10000 });
}

module.exports = {
  API_BASE,
  TEST_ACCOUNTS,
  getAuthData,
  loginViaAPI,
  loginViaUI,
  loginAndGoto,
  apiRequest,
  waitForToast,
  waitForNavigation,
};
