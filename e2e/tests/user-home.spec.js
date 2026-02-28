// @ts-check
const { test, expect } = require('@playwright/test');
const { loginAndGoto, loginViaAPI, API_BASE, TEST_ACCOUNTS } = require('./helpers');

test.describe('用户首页 - 每日推荐', () => {

  test('首页正确渲染标题和结构', async ({ page }) => {
    await loginAndGoto(page, '/user/home', 'femaleUser');

    await expect(page.locator('[data-testid="home-hero"]')).toBeVisible();
    await expect(page.locator('[data-testid="trust-badge"]')).toHaveCount(3);

    // TabBar 应存在
    await expect(page.locator('.van-tabbar')).toBeVisible();
  });

  test('首页显示推荐卡片或空状态', async ({ page }) => {
    await loginAndGoto(page, '/user/home', 'femaleUser');

    // 等待加载完成
    await page.waitForTimeout(2000);

    const cards = page.locator('[data-testid="recommend-card"]');
    const empty = page.locator('.empty-state');

    // 有卡片或者有空状态
    const cardsCount = await cards.count();
    if (cardsCount > 0) {
      // 验证卡片结构
      const firstCard = cards.first();
      await expect(firstCard.locator('.match-card__name')).toBeVisible();
      await expect(firstCard.locator('.match-card__tags')).toBeVisible();
      await expect(firstCard.locator('.match-card__score')).toBeVisible();
      // 打招呼按钮
      await expect(firstCard.locator('[data-testid="cta-say-hi"]')).toBeVisible();
    } else {
      await expect(empty).toBeVisible();
      await expect(page.locator('[data-testid="empty-action"]')).toHaveCount(2);
    }
  });

  test('点击推荐卡片跳转到用户详情', async ({ page }) => {
    await loginAndGoto(page, '/user/home', 'femaleUser');
    await page.waitForTimeout(2000);

    const cards = page.locator('[data-testid="recommend-card"]');
    const count = await cards.count();

    if (count > 0) {
      await cards.first().click();
      await page.waitForURL(/\/user\/detail\/\d+/);
    }
  });

  test('点击打招呼按钮显示提示', async ({ page }) => {
    await loginAndGoto(page, '/user/home', 'femaleUser');
    await page.waitForTimeout(2000);

    const hiButton = page.locator('[data-testid="cta-say-hi"]').first();
    if (await hiButton.isVisible()) {
      await hiButton.click();
      await page.locator('.van-toast').filter({ hasText: '已发送打招呼' }).waitFor({ timeout: 5000 });
    }
  });

  test('下拉刷新功能', async ({ page }) => {
    await loginAndGoto(page, '/user/home', 'femaleUser');
    await page.waitForTimeout(1000);

    // 模拟下拉刷新 - 在列表区域向下拖动
    const list = page.locator('.van-pull-refresh');
    if (await list.isVisible()) {
      const box = await list.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + 100);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2, box.y + 300, { steps: 10 });
        await page.mouse.up();
        await page.waitForTimeout(2000);
      }
    }
  });

  test('点击消息图标跳转到消息页', async ({ page }) => {
    await loginAndGoto(page, '/user/home', 'femaleUser');
    await page.locator('[data-testid="home-message-entry"]').click();
    await page.waitForURL(/\/messages/, { timeout: 10000 });
  });
});
