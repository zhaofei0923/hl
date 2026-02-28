// @ts-check
const { test, expect } = require('@playwright/test');
const { loginAndGoto, loginViaAPI, API_BASE, TEST_ACCOUNTS, getAuthData } = require('./helpers');

test.describe('红娘个人中心', () => {

  test('红娘首页正确渲染', async ({ page }) => {
    await loginAndGoto(page, '/matchmaker/profile', 'matchmaker');

    // 等待页面加载
    await page.waitForTimeout(1500);

    // 应该有导航栏或个人信息
    await expect(page.locator('.van-tabbar')).toBeVisible();
  });

  test('红娘仪表盘 API 正常', async ({ page }) => {
    const { token } = await getAuthData(page, 'matchmaker');

    const resp = await page.request.get(`${API_BASE}/matchmaker/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await resp.json();
    expect(body.code).toBe(0);
  });

  test('获取红娘信息 API', async ({ page }) => {
    const { token } = await getAuthData(page, 'matchmaker');

    const resp = await page.request.get(`${API_BASE}/matchmaker/info`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await resp.json();
    expect(body.code).toBe(0);
  });
});

test.describe('红娘 - 会员管理', () => {

  test('会员列表页面可访问', async ({ page }) => {
    await loginAndGoto(page, '/matchmaker/members', 'matchmaker');
    await page.waitForTimeout(1500);
    await expect(page.locator('.van-nav-bar')).toBeVisible();
  });

  test('会员列表 API 正常', async ({ page }) => {
    const { token } = await getAuthData(page, 'matchmaker');

    const resp = await page.request.get(`${API_BASE}/member/list`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await resp.json();
    expect(body.code).toBe(0);
  });

  test('会员搜索 API', async ({ page }) => {
    const { token } = await getAuthData(page, 'matchmaker');

    const resp = await page.request.get(`${API_BASE}/member/search?keyword=test`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await resp.json();
    expect(body.code).toBe(0);
  });

  test('添加会员 API', async ({ page }) => {
    const { token } = await getAuthData(page, 'matchmaker');

    const resp = await page.request.post(`${API_BASE}/member/add`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        nickname: `API测试会员_${Date.now()}`,
        phone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        gender: 2,
        age: 25,
      },
    });
    const body = await resp.json();
    // 可能成功也可能因为字段缺少而报错
    expect([0, 200, 40001]).toContain(body.code);
  });

  test('会员统计 API', async ({ page }) => {
    const { token } = await getAuthData(page, 'matchmaker');

    const resp = await page.request.get(`${API_BASE}/member/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await resp.json();
    expect(body.code).toBe(0);
  });

  test('打招呼 API', async ({ page }) => {
    const { token } = await getAuthData(page, 'matchmaker');

    const listResp = await page.request.get(`${API_BASE}/member/list`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const listBody = await listResp.json();

    if (listBody.data?.list?.length > 0) {
      const memberId = listBody.data.list[0].id;
      const greetResp = await page.request.post(`${API_BASE}/member/${memberId}/greet`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const greetBody = await greetResp.json();
      // 可能成功或返回各类业务错误
      expect(typeof greetBody.code).toBe('number');
    }
  });

  test('速配 API', async ({ page }) => {
    const { token } = await getAuthData(page, 'matchmaker');

    const listResp = await page.request.get(`${API_BASE}/member/list`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const listBody = await listResp.json();

    if (listBody.data?.list?.length > 0) {
      const memberId = listBody.data.list[0].id;
      const speedResp = await page.request.post(`${API_BASE}/member/${memberId}/speed-match`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const speedBody = await speedResp.json();
      expect(typeof speedBody.code).toBe('number');
    }
  });
});

test.describe('红娘 - 团队管理', () => {

  test('团队页面可访问', async ({ page }) => {
    await loginAndGoto(page, '/matchmaker/team', 'matchmaker');
    await page.waitForTimeout(1500);
    await expect(page.locator('.van-nav-bar')).toBeVisible();
  });

  test('团队信息 API', async ({ page }) => {
    const { token } = await getAuthData(page, 'matchmaker');

    const resp = await page.request.get(`${API_BASE}/matchmaker/team`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await resp.json();
    expect(body.code).toBe(0);
  });

  test('团队成员 API', async ({ page }) => {
    const { token } = await getAuthData(page, 'matchmaker');

    const resp = await page.request.get(`${API_BASE}/matchmaker/team/members`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await resp.json();
    expect(body.code).toBe(0);
  });
});

test.describe('红娘 - 门店管理', () => {

  test('门店信息页面可访问', async ({ page }) => {
    await loginAndGoto(page, '/matchmaker/store', 'matchmaker');
    await page.waitForTimeout(1500);
    await expect(page.locator('.van-nav-bar')).toBeVisible();
  });

  test('获取门店信息 API', async ({ page }) => {
    const { token } = await getAuthData(page, 'matchmaker');

    const resp = await page.request.get(`${API_BASE}/matchmaker/store`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await resp.json();
    // 可能还没有门店
    expect([0, 200, 40400]).toContain(body.code);
  });
});

test.describe('红娘 - 邀请好友', () => {

  test('邀请好友页面可访问', async ({ page }) => {
    await loginAndGoto(page, '/matchmaker/invite', 'matchmaker');
    await page.waitForTimeout(1500);
    await expect(page.locator('.van-nav-bar')).toBeVisible();
  });

  test('获取邀请码 API', async ({ page }) => {
    const authData = await getAuthData(page, 'matchmaker');

    const resp = await page.request.get(`${API_BASE}/matchmaker/invite/code`, {
      headers: { Authorization: `Bearer ${authData.token}` },
    });
    const body = await resp.json();
    expect(body.code).toBe(0);
  });

  test('邀请记录 API', async ({ page }) => {
    const authData = await getAuthData(page, 'matchmaker');

    const resp = await page.request.get(`${API_BASE}/matchmaker/invite/records`, {
      headers: { Authorization: `Bearer ${authData.token}` },
    });
    const body = await resp.json();
    expect(body.code).toBe(0);
  });
});

test.describe('红娘 - 业务页面导航', () => {

  test('全部资源页面可访问', async ({ page }) => {
    await loginAndGoto(page, '/matchmaker/resources', 'matchmaker');
    await page.waitForTimeout(1000);
    await expect(page.locator('.van-nav-bar')).toBeVisible();
  });

  test('业绩订单页面可访问', async ({ page }) => {
    await loginAndGoto(page, '/matchmaker/orders', 'matchmaker');
    await page.waitForTimeout(1000);
    await expect(page.locator('.van-nav-bar')).toBeVisible();
  });

  test('我的红娘页面可访问', async ({ page }) => {
    await loginAndGoto(page, '/matchmaker/my-matchmakers', 'matchmaker');
    await page.waitForTimeout(1000);
    await expect(page.locator('.van-nav-bar')).toBeVisible();
  });

  test('沙龙活动页面可访问', async ({ page }) => {
    await loginAndGoto(page, '/matchmaker/salon', 'matchmaker');
    await page.waitForTimeout(1000);
    await expect(page.locator('.van-nav-bar')).toBeVisible();
  });

  test('我的商城页面可访问', async ({ page }) => {
    await loginAndGoto(page, '/matchmaker/shop', 'matchmaker');
    await page.waitForTimeout(1000);
    await expect(page.locator('.van-nav-bar')).toBeVisible();
  });

  test('官方收款码页面可访问', async ({ page }) => {
    await loginAndGoto(page, '/matchmaker/qrcode', 'matchmaker');
    await page.waitForTimeout(1000);
    await expect(page.locator('.van-nav-bar')).toBeVisible();
  });
});

test.describe('红娘 - 角色访问控制', () => {

  test('普通用户不能访问红娘页面', async ({ page }) => {
    await loginAndGoto(page, '/matchmaker/profile', 'maleUser');

    // 应被重定向到用户首页
    await page.waitForURL(/\/user\/home/);
    await expect(page).toHaveURL(/\/user\/home/);
  });

  test('红娘不能直接访问用户专属页面', async ({ page }) => {
    await loginAndGoto(page, '/user/home', 'matchmaker');

    // 应被重定向到红娘首页
    await page.waitForURL(/\/matchmaker\/profile/);
    await expect(page).toHaveURL(/\/matchmaker\/profile/);
  });
});
