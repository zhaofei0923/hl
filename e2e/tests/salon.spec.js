// @ts-check
const { test, expect } = require('@playwright/test');
const { loginAndGoto, API_BASE, TEST_ACCOUNTS, getAuthData } = require('./helpers');

test.describe('沙龙活动 - API 测试', () => {

  let userToken;
  let matchmakerToken;

  test.beforeAll(async ({ request }) => {
    const userAuth = await getAuthData(request, 'maleUser');
    userToken = userAuth.token;

    const mmAuth = await getAuthData(request, 'matchmaker');
    matchmakerToken = mmAuth.token;
  });

  test('获取沙龙活动列表', async ({ request }) => {
    const resp = await request.get(`${API_BASE}/salon/events`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const body = await resp.json();
    expect(body.code).toBe(0);
  });

  test('获取沙龙活动列表 - 带分页参数', async ({ request }) => {
    const resp = await request.get(`${API_BASE}/salon/events?page=1&pageSize=10`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const body = await resp.json();
    expect(body.code).toBe(0);
  });

  test('获取单个活动详情', async ({ request }) => {
    // 先获取列表
    const listResp = await request.get(`${API_BASE}/salon/events`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const listBody = await listResp.json();

    if (listBody.data?.list?.length > 0) {
      const eventId = listBody.data.list[0].id;
      const detailResp = await request.get(`${API_BASE}/salon/events/${eventId}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const detailBody = await detailResp.json();
      expect(detailBody.code).toBe(0);
      expect(detailBody.data).toBeTruthy();
    }
  });

  test('报名沙龙活动', async ({ request }) => {
    const listResp = await request.get(`${API_BASE}/salon/events`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const listBody = await listResp.json();

    if (listBody.data?.list?.length > 0) {
      const eventId = listBody.data.list[0].id;
      const regResp = await request.post(`${API_BASE}/salon/events/${eventId}/register`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const regBody = await regResp.json();
      // 可能成功，也可能已报名或活动已结束
      expect([0, 200, 40001, 40002]).toContain(regBody.code);
    }
  });

  test('取消报名沙龙活动', async ({ request }) => {
    const listResp = await request.get(`${API_BASE}/salon/events`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const listBody = await listResp.json();

    if (listBody.data?.list?.length > 0) {
      const eventId = listBody.data.list[0].id;
      const cancelResp = await request.delete(`${API_BASE}/salon/events/${eventId}/register`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const cancelBody = await cancelResp.json();
      // 可能成功或未报名
      expect([0, 200, 40001, 40400]).toContain(cancelBody.code);
    }
  });

  test('获取我的报名记录', async ({ request }) => {
    const resp = await request.get(`${API_BASE}/salon/my-registrations`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const body = await resp.json();
    expect(body.code).toBe(0);
  });

  test('红娘也可以查看沙龙活动', async ({ request }) => {
    const resp = await request.get(`${API_BASE}/salon/events`, {
      headers: { Authorization: `Bearer ${matchmakerToken}` },
    });
    const body = await resp.json();
    expect(body.code).toBe(0);
  });

  test('未认证用户无法查看活动', async ({ request }) => {
    const resp = await request.get(`${API_BASE}/salon/events`);
    expect(resp.status()).toBe(401);
  });
});

test.describe('沙龙活动 - 页面测试', () => {

  test('红娘沙龙页面可访问', async ({ page }) => {
    await loginAndGoto(page, '/matchmaker/salon', 'matchmaker');
    await page.waitForTimeout(1500);
    await expect(page.locator('.van-nav-bar')).toBeVisible();
  });
});
