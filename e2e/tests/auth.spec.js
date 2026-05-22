// @ts-check
const { test, expect } = require('@playwright/test');
const { TEST_ACCOUNTS, waitForToast, API_BASE, getAuthData } = require('./helpers');

test.describe('认证模块', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });
  });

  // ==================== 登录页面渲染 ====================

  test('登录页面正确渲染', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('[data-testid="login-brand-panel"]')).toBeVisible();
    await expect(page.locator('.login-header__title')).toHaveText('IFU');
    await expect(page.locator('.login-header__subtitle')).toHaveText('严选匹配 / 红娘协作 / 真实认证');
    await expect(page.locator('[data-testid="login-brand-pill"]')).toHaveCount(3);

    const tabs = page.locator('.van-tab');
    await expect(tabs).toHaveCount(3);
    await expect(tabs.nth(0)).toHaveText('短信登录');
    await expect(tabs.nth(1)).toHaveText('账号登录');
    await expect(tabs.nth(2)).toHaveText('注册');
    await expect(tabs.nth(1)).toHaveClass(/van-tab--active/);

    await expect(page.locator('.login-agreement')).toBeVisible();
    await expect(page.locator('.login-third__icon')).toBeVisible();
  });

  // ==================== API 级别登录验证 ====================

  test('手机号密码登录 - 普通用户（API）', async ({ page }) => {
    const authData = await getAuthData(page, 'maleUser');
    expect(authData.token).toBeTruthy();
    expect(authData.refreshToken).toBeTruthy();
    expect(authData.user.currentRole).toBe('user');
  });

  test('手机号密码登录 - 红娘（API）', async ({ page }) => {
    const authData = await getAuthData(page, 'matchmaker');
    expect(authData.token).toBeTruthy();
    expect(authData.user.currentRole).toBe('matchmaker');
  });

  test('登录失败 - 手机号密码错误（API）', async ({ page }) => {
    const resp = await page.request.post(`${API_BASE}/auth/password/login`, {
      data: { phone: '13800000001', password: 'wrongpassword' },
    });
    const body = await resp.json();
    expect(body.code).toBe(40001);
  });

  // ==================== UI 用户名密码登录 ====================

  test('用户名密码登录 - 通过UI', async ({ page }) => {
    // 先通过 API 注册
    const timestamp = Date.now();
    const username = `ul${timestamp}`;
    const regResp = await page.request.post(`${API_BASE}/auth/username/register`, {
      data: { username, password: 'test123456', role: 'user' },
    });
    const regBody = await regResp.json();
    expect([0, 200]).toContain(regBody.code);

    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.van-tab').nth(1)).toHaveClass(/van-tab--active/);

    await page.locator('.login-agreement .van-checkbox__icon').click();
    const usernameInput = page.locator('input[placeholder="请输入用户名/手机号"]');
    await usernameInput.waitFor({ state: 'visible', timeout: 5000 });
    await usernameInput.fill(username);
    await page.locator('input[placeholder="请输入密码"]').fill('test123456');
    // 定位包含用户名输入框的 form 内的提交按钮，避免匹配短信登录的同名按钮
    const accountForm = page.locator('.login-form', { has: page.locator('input[placeholder="请输入用户名/手机号"]') });
    await accountForm.locator('.login-form__submit').click();

    await page.waitForURL(/\/user\/home/, { timeout: 15000 });
    const token = await page.evaluate(() => localStorage.getItem('hl_token'));
    expect(token).toBeTruthy();
  });

  test('登录失败 - 用户名或密码错误（UI）', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.locator('.login-agreement .van-checkbox__icon').click();
    const usernameInput = page.locator('input[placeholder="请输入用户名/手机号"]');
    await usernameInput.waitFor({ state: 'visible', timeout: 5000 });
    await usernameInput.fill('nonexistent_user_xyz');
    await page.locator('input[placeholder="请输入密码"]').fill('wrongpassword');
    const accountForm = page.locator('.login-form', { has: page.locator('input[placeholder="请输入用户名/手机号"]') });
    await accountForm.locator('.login-form__submit').click();

    await page.locator('.van-toast').waitFor({ timeout: 10000 });
  });

  test('登录失败 - 未勾选协议', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const usernameInput = page.locator('input[placeholder="请输入用户名/手机号"]');
    await usernameInput.waitFor({ state: 'visible', timeout: 5000 });
    await usernameInput.fill('someuser');
    await page.locator('input[placeholder="请输入密码"]').fill('test123456');
    const accountForm = page.locator('.login-form', { has: page.locator('input[placeholder="请输入用户名/手机号"]') });
    await accountForm.locator('.login-form__submit').click();

    await waitForToast(page, '请先同意用户协议和隐私政策');
    await expect(page).toHaveURL(/\/login/);
  });

  test('登录失败 - 空用户名', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.locator('.login-agreement .van-checkbox__icon').click();
    const passwordInput = page.locator('input[placeholder="请输入密码"]');
    await passwordInput.waitFor({ state: 'visible', timeout: 5000 });
    await passwordInput.fill('test123456');
    const accountForm = page.locator('.login-form', { has: page.locator('input[placeholder="请输入密码"]') });
    await accountForm.locator('.login-form__submit').click();

    await page.locator('.van-toast').waitFor({ timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });

  // ==================== 短信登录 ====================

  test('短信登录 Tab 切换及表单展示', async ({ page }) => {
    await page.goto('/login');
    await page.locator('.van-tab').filter({ hasText: '短信登录' }).click();
    await page.waitForTimeout(500);

    await expect(page.locator('input[placeholder="请输入手机号"]')).toBeVisible();
    await expect(page.locator('input[placeholder="请输入验证码"]')).toBeVisible();
    await expect(page.locator('button').filter({ hasText: '获取验证码' })).toBeVisible();
  });

  test('短信登录 - 发送验证码', async ({ page }) => {
    await page.goto('/login');
    await page.locator('.van-tab').filter({ hasText: '短信登录' }).click();
    await page.waitForTimeout(500);

    await page.fill('input[placeholder="请输入手机号"]', TEST_ACCOUNTS.maleUser.phone);

    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/auth/sms/send') && resp.status() === 200),
      page.locator('button').filter({ hasText: '获取验证码' }).click(),
    ]);

    const body = await response.json();
    if (body.data?.code) {
      expect(body.data.code).toMatch(/^\d{6}$/);
    }

    await waitForToast(page, '验证码已发送');
    await expect(page.locator('button').filter({ hasText: /\d+s/ })).toBeVisible();
  });

  // ==================== 注册 ====================

  test('注册 Tab 表单展示', async ({ page }) => {
    await page.goto('/login');
    await page.locator('.van-tab').filter({ hasText: '注册' }).click();
    await page.waitForTimeout(500);

    await expect(page.locator('.role-select__item').first()).toBeVisible();
    await expect(page.locator('.role-select__label').first()).toHaveText('我有婚恋需求');
    await expect(page.locator('.role-select__label').last()).toHaveText('我是婚介/资源方');

    await expect(page.locator('input[placeholder="请输入用户名（3-20位）"]')).toBeVisible();
    await expect(page.locator('input[placeholder="请输入密码（6位以上）"]')).toBeVisible();
    await expect(page.locator('input[placeholder="请再次输入密码"]')).toBeVisible();
  });

  test('注册新用户 - 普通用户（API）', async ({ page }) => {
    const resp = await page.request.post(`${API_BASE}/auth/username/register`, {
      data: { username: `ru${Date.now()}`, password: 'test123456', role: 'user' },
    });
    const body = await resp.json();
    expect(body.code).toBe(0);
    expect(body.data.user.currentRole).toBe('user');
    expect(body.data.isNewUser).toBe(true);
  });

  test('注册新用户 - 红娘（API）', async ({ page }) => {
    const resp = await page.request.post(`${API_BASE}/auth/username/register`, {
      data: { username: `rm${Date.now()}`, password: 'test123456', role: 'matchmaker' },
    });
    const body = await resp.json();
    expect(body.code).toBe(0);
    expect(body.data.user.currentRole).toBe('matchmaker');
  });

  test('注册 - 通过UI', async ({ page }) => {
    await page.goto('/login');
    await page.locator('.van-tab').filter({ hasText: '注册' }).click();
    await page.waitForTimeout(500);

    await page.locator('.login-agreement .van-checkbox__icon').click();

    const usernameInput = page.locator('input[placeholder="请输入用户名（3-20位）"]');
    await usernameInput.waitFor({ state: 'visible', timeout: 5000 });
    await usernameInput.fill(`ur${Date.now()}`);
    await page.fill('input[placeholder="请输入密码（6位以上）"]', 'test123456');
    await page.fill('input[placeholder="请再次输入密码"]', 'test123456');

    await page.locator('.login-form__submit').filter({ hasText: '注册' }).click();
    await page.waitForURL(/\/user\/home/, { timeout: 15000 });
  });

  test('注册失败 - 用户名已存在（API）', async ({ page }) => {
    const username = `dp${Date.now()}`;
    await page.request.post(`${API_BASE}/auth/username/register`, {
      data: { username, password: 'test123456' },
    });
    const resp = await page.request.post(`${API_BASE}/auth/username/register`, {
      data: { username, password: 'test123456' },
    });
    const body = await resp.json();
    expect(body.code).toBe(40002);
  });

  test('注册失败 - 密码不一致（UI）', async ({ page }) => {
    await page.goto('/login');
    await page.locator('.van-tab').filter({ hasText: '注册' }).click();
    await page.waitForTimeout(500);

    await page.locator('.login-agreement .van-checkbox__icon').click();
    const usernameInput = page.locator('input[placeholder="请输入用户名（3-20位）"]');
    await usernameInput.waitFor({ state: 'visible', timeout: 5000 });
    await usernameInput.fill(`mm${Date.now()}`);
    await page.fill('input[placeholder="请输入密码（6位以上）"]', 'test123456');
    await page.fill('input[placeholder="请再次输入密码"]', 'different_pass');

    await page.locator('.login-form__submit').filter({ hasText: '注册' }).click();
    await waitForToast(page, '两次输入的密码不一致');
  });

  // ==================== Tab 切换 ====================

  test('Tab 之间切换', async ({ page }) => {
    await page.goto('/login');

    await page.locator('.van-tab').filter({ hasText: '短信登录' }).click();
    await page.waitForTimeout(400);
    await expect(page.locator('input[placeholder="请输入手机号"]')).toBeVisible();

    await page.locator('.van-tab').filter({ hasText: '账号登录' }).click();
    await page.waitForTimeout(400);
    await expect(page.locator('input[placeholder="请输入用户名/手机号"]')).toBeVisible();

    await page.locator('.van-tab').filter({ hasText: '注册' }).click();
    await page.waitForTimeout(400);
    await expect(page.locator('input[placeholder="请输入用户名（3-20位）"]')).toBeVisible();
  });

  test('点击"立即注册"跳转', async ({ page }) => {
    await page.goto('/login');
    await page.locator('.login-form__link').filter({ hasText: '立即注册' }).click();
    await page.waitForTimeout(400);
    await expect(page.locator('.van-tab').nth(2)).toHaveClass(/van-tab--active/);
  });

  // ==================== 路由守卫 ====================

  test('未登录访问受保护页面重定向到登录页', async ({ page }) => {
    await page.goto('/user/home');
    await page.waitForURL(/\/login/, { timeout: 10000 });
  });

  test('已登录用户访问登录页自动重定向', async ({ page }) => {
    const authData = await getAuthData(page, 'maleUser');

    await page.addInitScript(({ token, refreshToken, user }) => {
      localStorage.setItem('hl_token', token);
      localStorage.setItem('hl_refresh_token', refreshToken);
      localStorage.setItem('userInfo', JSON.stringify(user));
    }, authData);

    await page.goto('/login');
    await page.waitForURL(/\/user\/home/, { timeout: 10000 });
  });

  // ==================== 微信登录 ====================

  test('微信登录提示开发中', async ({ page }) => {
    await page.goto('/login');
    await page.locator('.login-third__icon').click();
    await waitForToast(page, '微信登录开发中');
  });

  // ==================== Token ====================

  test('Token 刷新 API', async ({ page }) => {
    const authData = await getAuthData(page, 'maleUser');

    const refreshResp = await page.request.post(`${API_BASE}/auth/token/refresh`, {
      data: { refreshToken: authData.refreshToken },
    });
    const refreshBody = await refreshResp.json();
    expect(refreshBody.code).toBe(0);
    expect(refreshBody.data.token).toBeTruthy();
    expect(refreshBody.data.refreshToken).toBeTruthy();
  });

  test('Token 刷新 - 无效token', async ({ page }) => {
    const resp = await page.request.post(`${API_BASE}/auth/token/refresh`, {
      data: { refreshToken: 'invalid_token' },
    });
    expect(resp.status()).not.toBe(200);
  });

  test('退出登录 API', async ({ page }) => {
    // 退出登录需要一个有效 token，使用缓存 token 但退出后清除缓存
    const authData = await getAuthData(page, 'maleUser2');

    const logoutResp = await page.request.post(`${API_BASE}/auth/logout`, {
      headers: { Authorization: `Bearer ${authData.token}` },
    });
    const logoutBody = await logoutResp.json();
    expect(logoutBody.code).toBe(0);
  });
});
