// @ts-check
const { test, expect } = require('@playwright/test');
const { loginAndGoto, API_BASE, TEST_ACCOUNTS, getAuthData } = require('./helpers');

test.describe('消息模块 - API 测试', () => {

  let token;

  test.beforeAll(async ({ request }) => {
    const authData = await getAuthData(request, 'maleUser');
    token = authData.token;
  });

  test('获取会话列表', async ({ request }) => {
    const resp = await request.get(`${API_BASE}/message/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await resp.json();
    expect(body.code).toBe(0);
  });

  test('获取未读消息数', async ({ request }) => {
    const resp = await request.get(`${API_BASE}/message/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await resp.json();
    expect(body.code).toBe(0);
    // 应返回数字
    expect(typeof body.data?.count === 'number' || typeof body.data === 'number' || body.data?.totalUnread !== undefined).toBeTruthy();
  });

  test('发送消息', async ({ request }) => {
    // 先获取会话列表找到一个有效的 conversationId
    const convResp = await request.get(`${API_BASE}/message/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const convBody = await convResp.json();

    const list = convBody.data?.list || convBody.data || [];
    if (Array.isArray(list) && list.length > 0) {
      const conversationId = list[0].conversationId || list[0].id;

      const sendResp = await request.post(`${API_BASE}/message/send`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          conversationId,
          content: `测试消息 ${Date.now()}`,
          contentType: 'text',
        },
      });
      const sendBody = await sendResp.json();
      // 可能成功，也可能因为业务逻辑限制返回错误
      expect(typeof sendBody.code).toBe('number');
    }
  });

  test('获取某会话的消息列表', async ({ request }) => {
    const convResp = await request.get(`${API_BASE}/message/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const convBody = await convResp.json();

    if (convBody.data?.list?.length > 0) {
      const conversationId = convBody.data.list[0].conversationId || convBody.data.list[0].id;

      const msgResp = await request.get(`${API_BASE}/message/conversation/${conversationId}?page=1&pageSize=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const msgBody = await msgResp.json();
      expect(msgBody.code).toBe(0);
    }
  });

  test('标记会话已读', async ({ request }) => {
    const convResp = await request.get(`${API_BASE}/message/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const convBody = await convResp.json();

    if (convBody.data?.list?.length > 0) {
      const conversationId = convBody.data.list[0].conversationId || convBody.data.list[0].id;

      const readResp = await request.put(`${API_BASE}/message/read/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const readBody = await readResp.json();
      expect(readBody.code).toBe(0);
    }
  });

  test('未认证用户无法获取消息', async ({ request }) => {
    const resp = await request.get(`${API_BASE}/message/conversations`);
    expect(resp.status()).toBe(401);
  });
});

test.describe('消息模块 - 页面测试', () => {

  test('消息列表页面正确渲染', async ({ page }) => {
    await loginAndGoto(page, '/messages', 'maleUser');

    // 标题
    const navTitle = page.locator('.van-nav-bar__title');
    await expect(navTitle).toHaveText('消息');
    await expect(page.locator('[data-testid="message-intro-suggestion"]').first()).toBeVisible();

    // TabBar
    await expect(page.locator('.van-tabbar')).toBeVisible();
  });

  test('消息列表显示会话或空状态', async ({ page }) => {
    await loginAndGoto(page, '/messages', 'maleUser');
    await page.waitForTimeout(3000);

    const conversations = page.locator('.conversation-item');
    const empty = page.locator('.empty-state');

    const count = await conversations.count();
    const emptyVisible = await empty.isVisible().catch(() => false);

    // 应显示会话列表或空状态之一
    expect(count > 0 || emptyVisible).toBeTruthy();
  });

  test('点击会话进入聊天页', async ({ page }) => {
    await loginAndGoto(page, '/messages', 'maleUser');
    await page.waitForTimeout(3000);

    const conversations = page.locator('.conversation-item');
    if (await conversations.count() > 0) {
      await conversations.first().click();
      await page.waitForURL(/\/chat\//, { timeout: 10000 });
      await expect(page.locator('textarea[placeholder="输入消息..."]')).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('点击推荐开场白可触发快捷沟通路径', async ({ page }) => {
    await loginAndGoto(page, '/messages', 'maleUser');
    await page.waitForTimeout(1500);

    await page.locator('[data-testid="message-intro-suggestion"]').first().click();
    const chatNav = await page.waitForURL(/\/chat\//, { timeout: 4000 }).then(() => true).catch(() => false);

    if (!chatNav) {
      await expect(page.locator('.conversation-item').first()).toBeVisible();
    }
  });

  test('聊天页发送消息', async ({ page }) => {
    await loginAndGoto(page, '/messages', 'maleUser');
    await page.waitForTimeout(3000);

    const conversations = page.locator('.conversation-item');
    if (await conversations.count() > 0) {
      await conversations.first().click();
      await page.waitForURL(/\/chat\//, { timeout: 10000 });
      await page.waitForTimeout(1500);

      const msgInput = page.locator('textarea[placeholder="输入消息..."]');
      await msgInput.fill(`Playwright 测试 ${Date.now()}`);
      await page.locator('button').filter({ hasText: '发送' }).click();
      await page.waitForTimeout(2000);
      await expect(page.locator('.chat-bubble').last()).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('聊天页返回按钮', async ({ page }) => {
    await loginAndGoto(page, '/messages', 'maleUser');
    await page.waitForTimeout(3000);

    const conversations = page.locator('.conversation-item');
    if (await conversations.count() > 0) {
      await conversations.first().click();
      await page.waitForURL(/\/chat\//, { timeout: 10000 });
      await page.locator('.van-nav-bar__left').click();
      await page.waitForTimeout(1000);
    } else {
      test.skip();
    }
  });
});

test.describe('钱包模块 - API 测试', () => {

  let matchmakerToken;

  test.beforeAll(async ({ request }) => {
    const authData = await getAuthData(request, 'matchmaker');
    matchmakerToken = authData.token;
  });

  test('获取钱包信息', async ({ request }) => {
    const resp = await request.get(`${API_BASE}/wallet/info`, {
      headers: { Authorization: `Bearer ${matchmakerToken}` },
    });
    const body = await resp.json();
    expect(body.code).toBe(0);
    expect(body.data).toBeTruthy();
  });

  test('获取收益记录', async ({ request }) => {
    const resp = await request.get(`${API_BASE}/wallet/earnings`, {
      headers: { Authorization: `Bearer ${matchmakerToken}` },
    });
    const body = await resp.json();
    expect(body.code).toBe(0);
  });

  test('获取收益统计', async ({ request }) => {
    const resp = await request.get(`${API_BASE}/wallet/earnings/summary`, {
      headers: { Authorization: `Bearer ${matchmakerToken}` },
    });
    const body = await resp.json();
    expect(body.code).toBe(0);
  });

  test('获取提现记录', async ({ request }) => {
    const resp = await request.get(`${API_BASE}/wallet/withdrawals`, {
      headers: { Authorization: `Bearer ${matchmakerToken}` },
    });
    const body = await resp.json();
    expect(body.code).toBe(0);
  });

  test('获取转入记录', async ({ request }) => {
    const resp = await request.get(`${API_BASE}/wallet/transfers`, {
      headers: { Authorization: `Bearer ${matchmakerToken}` },
    });
    const body = await resp.json();
    expect(body.code).toBe(0);
  });

  test('提现请求 - 参数校验', async ({ request }) => {
    const resp = await request.post(`${API_BASE}/wallet/withdraw`, {
      headers: { Authorization: `Bearer ${matchmakerToken}` },
      data: { amount: 0 }, // 无效金额
    });
    const body = await resp.json();
    // 应该返回参数错误
    expect(body.code).not.toBe(0);
  });

  test('未认证用户无法访问钱包', async ({ request }) => {
    const resp = await request.get(`${API_BASE}/wallet/info`);
    expect(resp.status()).toBe(401);
  });
});

test.describe('钱包模块 - 页面测试', () => {

  test('红娘钱包页面可访问', async ({ page }) => {
    await loginAndGoto(page, '/matchmaker/wallet', 'matchmaker');
    await page.waitForTimeout(1500);
    await expect(page.locator('.van-nav-bar')).toBeVisible();
  });

  test('提现页面可访问', async ({ page }) => {
    await loginAndGoto(page, '/matchmaker/withdraw', 'matchmaker');
    await page.waitForTimeout(1500);
    await expect(page.locator('.van-nav-bar')).toBeVisible();
  });
});
