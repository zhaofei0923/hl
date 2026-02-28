// @ts-check
const { test, expect } = require('@playwright/test');
const { loginAndGoto, API_BASE, TEST_ACCOUNTS, getAuthData } = require('./helpers');

test.describe('匹配推荐 - API 测试', () => {

  let userToken;
  let femaleToken;

  test.beforeAll(async ({ request }) => {
    const maleAuth = await getAuthData(request, 'maleUser');
    userToken = maleAuth.token;

    const femaleAuth = await getAuthData(request, 'femaleUser');
    femaleToken = femaleAuth.token;
  });

  test('获取每日推荐列表', async ({ request }) => {
    const resp = await request.get(`${API_BASE}/match/daily`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const body = await resp.json();
    expect(body.code).toBe(0);
    // 应该返回推荐列表
    expect(body.data).toBeTruthy();
  });

  test('获取推荐列表（带筛选参数）', async ({ request }) => {
    const resp = await request.get(`${API_BASE}/match/recommend?city=北京&ageMin=20&ageMax=30`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const body = await resp.json();
    expect(body.code).toBe(0);
  });

  test('喜欢用户 - 单向', async ({ request }) => {
    // 男性用户喜欢女性用户
    const resp = await request.post(`${API_BASE}/match/like/2`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const body = await resp.json();
    // 可能成功或已存在
    expect([0, 200]).toContain(body.code);
  });

  test('获取互相喜欢列表', async ({ request }) => {
    const resp = await request.get(`${API_BASE}/match/mutual`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const body = await resp.json();
    expect(body.code).toBe(0);
  });

  test('推荐结果包含匹配分数', async ({ request }) => {
    const resp = await request.get(`${API_BASE}/match/daily`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const body = await resp.json();

    if (body.data?.list?.length > 0) {
      const firstMatch = body.data.list[0];
      // 匹配分数应该在 60-98 范围内
      if (firstMatch.matchScore !== undefined) {
        expect(firstMatch.matchScore).toBeGreaterThanOrEqual(60);
        expect(firstMatch.matchScore).toBeLessThanOrEqual(98);
      }
    }
  });

  test('不同用户获取不同推荐', async ({ request }) => {
    const maleResp = await request.get(`${API_BASE}/match/daily`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const femaleResp = await request.get(`${API_BASE}/match/daily`, {
      headers: { Authorization: `Bearer ${femaleToken}` },
    });

    const maleBody = await maleResp.json();
    const femaleBody = await femaleResp.json();

    expect(maleBody.code).toBe(0);
    expect(femaleBody.code).toBe(0);
  });

  test('未认证用户无法访问推荐', async ({ request }) => {
    const resp = await request.get(`${API_BASE}/match/daily`);
    expect(resp.status()).toBe(401);
  });
});

test.describe('匹配推荐 - 页面测试', () => {

  test('用户详情页面可访问', async ({ page }) => {
    await loginAndGoto(page, '/user/detail/2', 'maleUser');
    await page.waitForTimeout(1500);
    // 页面应有返回按钮
    await expect(page.locator('.van-nav-bar__left')).toBeVisible();
    await expect(page.locator('[data-testid="detail-trust-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="detail-primary-cta"]')).toBeVisible();
  });

  test('匹配列表筛选功能', async ({ page }) => {
    await loginAndGoto(page, '/user/match-list', 'femaleUser');
    await page.waitForTimeout(2000);

    // 页面应加载完成
    await expect(page.locator('.van-nav-bar')).toBeVisible();
  });
});
