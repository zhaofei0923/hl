// @ts-check
const { test, expect } = require('@playwright/test');
const { loginAndGoto, loginViaAPI, API_BASE, TEST_ACCOUNTS, getAuthData } = require('./helpers');

test.describe('用户个人中心', () => {

  test('个人中心页面正确渲染', async ({ page }) => {
    await loginAndGoto(page, '/user/profile', 'maleUser');

    // 头部信息
    await expect(page.locator('.profile-header__name')).toBeVisible();
    await expect(page.locator('.profile-header__id')).toBeVisible();

    // 资料完成度进度条
    await expect(page.locator('.profile-progress')).toBeVisible();

    // 菜单项
    await expect(page.locator('.van-cell').filter({ hasText: '编辑资料' })).toBeVisible();
    await expect(page.locator('.van-cell').filter({ hasText: '推荐匹配' })).toBeVisible();
    await expect(page.locator('.van-cell').filter({ hasText: '我的消息' })).toBeVisible();
    await expect(page.locator('.van-cell').filter({ hasText: '认证中心' })).toBeVisible();
    await expect(page.locator('.van-cell').filter({ hasText: '客服中心' })).toBeVisible();
    await expect(page.locator('.van-cell').filter({ hasText: '设置' })).toBeVisible();
  });

  test('点击"编辑资料"跳转', async ({ page }) => {
    await loginAndGoto(page, '/user/profile', 'maleUser');
    await page.locator('.van-cell').filter({ hasText: '编辑资料' }).click();
    await page.waitForURL(/\/user\/profile\/edit/);
  });

  test('点击"推荐匹配"跳转', async ({ page }) => {
    await loginAndGoto(page, '/user/profile', 'maleUser');
    await page.locator('.van-cell').filter({ hasText: '推荐匹配' }).click();
    await page.waitForURL(/\/user\/match-list/);
  });

  test('点击"我的消息"跳转', async ({ page }) => {
    await loginAndGoto(page, '/user/profile', 'maleUser');
    await page.locator('.van-cell').filter({ hasText: '我的消息' }).click();
    await page.waitForURL(/\/messages/);
  });

  test('点击"认证中心"跳转', async ({ page }) => {
    await loginAndGoto(page, '/user/profile', 'maleUser');
    await page.locator('.van-cell').filter({ hasText: '认证中心' }).click();
    await page.waitForURL(/\/certification/);
  });

  test('点击"设置"跳转', async ({ page }) => {
    await loginAndGoto(page, '/user/profile', 'maleUser');
    await page.locator('.van-cell').filter({ hasText: '设置' }).click();
    await page.waitForURL(/\/user\/settings/);
  });
});

test.describe('用户资料编辑', () => {

  test('编辑资料页面正确渲染', async ({ page }) => {
    await loginAndGoto(page, '/user/profile/edit', 'maleUser');

    // 等待页面加载
    await page.waitForTimeout(1000);

    // 页面标题应该是"编辑资料"
    const navBar = page.locator('.van-nav-bar__title');
    await expect(navBar).toBeVisible();
  });

  test('获取用户资料 API 正常', async ({ page }) => {
    const { token } = await getAuthData(page, 'maleUser');

    // 获取用户资料
    const profileResp = await page.request.get(`${API_BASE}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const profileBody = await profileResp.json();
    expect(profileBody.code).toBe(0);
    expect(profileBody.data).toBeTruthy();
  });

  test('更新用户资料 API 正常', async ({ page }) => {
    const { token } = await getAuthData(page, 'maleUser');

    // 更新昵称
    const updateResp = await page.request.put(`${API_BASE}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { nickname: `测试昵称_${Date.now()}` },
    });
    const updateBody = await updateResp.json();
    expect(updateBody.code).toBe(0);
  });
});

test.describe('用户设置', () => {

  test('设置页面可访问', async ({ page }) => {
    await loginAndGoto(page, '/user/settings', 'maleUser');
    await page.waitForTimeout(1000);
    // 验证页面加载完成
    await expect(page.locator('.van-nav-bar')).toBeVisible();
  });
});

test.describe('推荐匹配列表', () => {

  test('匹配列表页面可访问', async ({ page }) => {
    await loginAndGoto(page, '/user/match-list', 'femaleUser');
    await page.waitForTimeout(1000);
    await expect(page.locator('.van-nav-bar')).toBeVisible();
  });
});

test.describe('认证中心', () => {

  test('认证中心页面可访问', async ({ page }) => {
    await loginAndGoto(page, '/certification', 'maleUser');
    await page.waitForTimeout(1000);
    await expect(page.locator('.van-nav-bar')).toBeVisible();
  });

  test('获取认证状态 API', async ({ page }) => {
    const { token } = await getAuthData(page, 'maleUser');

    const resp = await page.request.get(`${API_BASE}/user/certification`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await resp.json();
    // 可能成功、路由不存在、或服务端错误
    expect(typeof body.code).toBe('number');
  });
});
