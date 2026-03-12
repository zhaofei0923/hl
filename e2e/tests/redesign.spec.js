// @ts-check
const { test, expect } = require('@playwright/test');
const { loginViaAPI } = require('./helpers');

test.describe('香槟金 UI 重设计', () => {
  test('首页高保真预览和设计系统预览可访问', async ({ page }) => {
    await page.goto('/preview/home-redesign');
    await expect(page.locator('[data-testid="preview-home-redesign"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-home-state-default"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-home-state-filtered"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-home-state-empty"]')).toBeVisible();

    await page.goto('/preview/design-system');
    await expect(page.locator('[data-testid="design-system-preview"]')).toBeVisible();
    await expect(page.getByText('Champagne Gold Tokens')).toBeVisible();
    await expect(page.getByText('Admin Console Components')).toBeVisible();
  });

  test('更多移动端高保真预览页可访问', async ({ page }) => {
    await page.goto('/preview/messages-redesign');
    await expect(page.locator('[data-testid="preview-messages-redesign"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-messages-priority"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-messages-conversation"]')).toBeVisible();

    await page.goto('/preview/profile-redesign');
    await expect(page.locator('[data-testid="preview-profile-redesign"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-profile-membership"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-profile-identity"]')).toBeVisible();

    await page.goto('/preview/matchmaker-redesign');
    await expect(page.locator('[data-testid="preview-matchmaker-redesign"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-matchmaker-kpi"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-matchmaker-queue"]')).toBeVisible();
  });

  test('注册、详情与活动页高保真预览可访问', async ({ page }) => {
    await page.goto('/preview/register-redesign');
    await expect(page.locator('[data-testid="preview-register-redesign"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-register-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-register-steps"]')).toBeVisible();

    await page.goto('/preview/detail-redesign');
    await expect(page.locator('[data-testid="preview-detail-redesign"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-detail-trust"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-detail-cta"]')).toBeVisible();

    await page.goto('/preview/salon-redesign');
    await expect(page.locator('[data-testid="preview-salon-redesign"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-salon-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-salon-detail"]')).toBeVisible();
  });

  test('后台高保真预览页可访问', async ({ page }) => {
    await page.goto('http://localhost:5174/admin/preview/console-redesign');
    await expect(page.locator('[data-testid="preview-admin-redesign"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-admin-login-frame"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-admin-dashboard-frame"]')).toBeVisible();
  });

  test('后台运营列表高保真预览可访问', async ({ page }) => {
    await page.goto('http://localhost:5174/admin/preview/operations-redesign');
    await expect(page.locator('[data-testid="preview-admin-operations"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-admin-users-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-admin-withdrawals-table"]')).toBeVisible();
  });

  test('最终支持与工作流高保真预览可访问', async ({ page }) => {
    await page.goto('/preview/support-suite');
    await expect(page.locator('[data-testid="preview-support-suite"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-support-chat"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-support-wallet"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-support-team"]')).toBeVisible();
  });

  test('后台仪表盘采用品牌化壳体和优先事项面板', async ({ page }) => {
    const loginResponse = await page.request.post('http://localhost:3000/api/auth/username/login', {
      data: { username: 'admin', password: 'test123456' }
    });
    const loginData = await loginResponse.json();

    await page.addInitScript((auth) => {
      localStorage.setItem('admin_token', auth.token);
      localStorage.setItem('admin_user', JSON.stringify(auth.user));
    }, loginData.data);

    await page.goto('http://localhost:5174/admin/dashboard');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('[data-testid="admin-brand-shell"]')).toBeVisible();
    await expect(page.locator('[data-testid="admin-priority-panel"]')).toBeVisible();
    await expect(page.getByText('今日优先处理')).toBeVisible();
  });

  test('真实注册页采用品牌化分步引导', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('[data-testid="register-brand-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-progress-board"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-step-card"]')).toHaveCount(4);
  });

  test('真实用户详情页采用信任与匹配双层结构', async ({ page }) => {
    await loginViaAPI(page, 'maleUser');
    await page.goto('/user/detail/1');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('[data-testid="detail-trust-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="detail-match-reasons"]')).toBeVisible();
    await expect(page.locator('[data-testid="detail-primary-cta"]')).toBeVisible();
  });

  test('真实沙龙活动页采用品牌化 hero 与活动卡片', async ({ page }) => {
    await loginViaAPI(page, 'maleUser');
    await page.goto('/user/salon');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('[data-testid="salon-hero"]')).toBeVisible();
    await expect(page.locator('[data-testid="salon-filter-tabs"]')).toBeVisible();
    await expect(page.locator('[data-testid="salon-list-shell"]')).toBeVisible();
  });

  test('真实后台用户与提现列表采用品牌化运营壳体', async ({ page }) => {
    const loginResponse = await page.request.post('http://localhost:3000/api/auth/username/login', {
      data: { username: 'admin', password: 'test123456' }
    });
    const loginData = await loginResponse.json();

    await page.addInitScript((auth) => {
      localStorage.setItem('admin_token', auth.token);
      localStorage.setItem('admin_user', JSON.stringify(auth.user));
    }, loginData.data);

    await page.goto('http://localhost:5174/admin/users');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="admin-users-shell"]')).toBeVisible();
    await expect(page.locator('[data-testid="admin-users-toolbar"]')).toBeVisible();

    await page.goto('http://localhost:5174/admin/withdrawals');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="admin-withdrawals-shell"]')).toBeVisible();
    await expect(page.locator('[data-testid="admin-withdrawals-toolbar"]')).toBeVisible();
  });

  test('真实沙龙详情页采用品牌化详情结构', async ({ page }) => {
    await loginViaAPI(page, 'maleUser');
    await page.goto('/user/salon/1');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('[data-testid="salon-detail-hero"]')).toBeVisible();
    await expect(page.locator('[data-testid="salon-detail-flow"]')).toBeVisible();
    await expect(page.locator('[data-testid="salon-detail-booking"]')).toBeVisible();
  });

  test('真实设置页采用品牌化账户面板', async ({ page }) => {
    await loginViaAPI(page, 'maleUser');
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('[data-testid="settings-brand-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings-account-shell"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings-logout-shell"]')).toBeVisible();
  });

  test('真实后台订单页采用品牌化运营壳体', async ({ page }) => {
    const loginResponse = await page.request.post('http://localhost:3000/api/auth/username/login', {
      data: { username: 'admin', password: 'test123456' }
    });
    const loginData = await loginResponse.json();

    await page.addInitScript((auth) => {
      localStorage.setItem('admin_token', auth.token);
      localStorage.setItem('admin_user', JSON.stringify(auth.user));
    }, loginData.data);

    await page.goto('http://localhost:5174/admin/orders');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="admin-orders-shell"]')).toBeVisible();
    await expect(page.locator('[data-testid="admin-orders-toolbar"]')).toBeVisible();
  });

  test('真实红娘会员页采用品牌化经营面板', async ({ page }) => {
    await loginViaAPI(page, 'matchmaker');
    await page.goto('/matchmaker/members');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('[data-testid="matchmaker-members-shell"]')).toBeVisible();
    await expect(page.locator('[data-testid="matchmaker-members-toolbar"]')).toBeVisible();
    await expect(page.locator('[data-testid="matchmaker-members-fab"]')).toBeVisible();
  });

  test('真实红娘订单页采用品牌化业绩面板', async ({ page }) => {
    await loginViaAPI(page, 'matchmaker');
    await page.goto('/matchmaker/orders');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('[data-testid="matchmaker-orders-shell"]')).toBeVisible();
    await expect(page.locator('[data-testid="matchmaker-orders-stats"]')).toBeVisible();
    await expect(page.locator('[data-testid="matchmaker-orders-list"]')).toBeVisible();
  });

  test('真实红娘会员详情页采用品牌化顾问视图', async ({ page }) => {
    await loginViaAPI(page, 'matchmaker');
    await page.goto('/matchmaker/member/1');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('[data-testid="matchmaker-member-hero"]')).toBeVisible();
    await expect(page.locator('[data-testid="matchmaker-member-profile"]')).toBeVisible();
    await expect(page.locator('[data-testid="matchmaker-member-partner"]')).toBeVisible();
  });

  test('真实后台红娘列表采用品牌化运营壳体', async ({ page }) => {
    const loginResponse = await page.request.post('http://localhost:3000/api/auth/username/login', {
      data: { username: 'admin', password: 'test123456' }
    });
    const loginData = await loginResponse.json();

    await page.addInitScript((auth) => {
      localStorage.setItem('admin_token', auth.token);
      localStorage.setItem('admin_user', JSON.stringify(auth.user));
    }, loginData.data);

    await page.goto('http://localhost:5174/admin/matchmakers');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="admin-matchmakers-shell"]')).toBeVisible();
    await expect(page.locator('[data-testid="admin-matchmakers-toolbar"]')).toBeVisible();
  });

  test('真实后台沙龙列表采用品牌化运营壳体', async ({ page }) => {
    const loginResponse = await page.request.post('http://localhost:3000/api/auth/username/login', {
      data: { username: 'admin', password: 'test123456' }
    });
    const loginData = await loginResponse.json();

    await page.addInitScript((auth) => {
      localStorage.setItem('admin_token', auth.token);
      localStorage.setItem('admin_user', JSON.stringify(auth.user));
    }, loginData.data);

    await page.goto('http://localhost:5174/admin/salons');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="admin-salons-shell"]')).toBeVisible();
    await expect(page.locator('[data-testid="admin-salons-toolbar"]')).toBeVisible();
  });

  test('真实客服与认证页采用品牌化支持壳体', async ({ page }) => {
    await loginViaAPI(page, 'maleUser');

    await page.goto('/customer-service');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="customer-service-shell"]')).toBeVisible();

    await page.goto('/certification');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="certification-shell"]')).toBeVisible();
  });

  test('真实发现与资源页采用品牌化推荐壳体', async ({ page }) => {
    await loginViaAPI(page, 'maleUser');

    await page.goto('/user/match-list');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="match-list-shell"]')).toBeVisible();

    await loginViaAPI(page, 'matchmaker');
    await page.goto('/matchmaker/resources');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="matchmaker-resources-shell"]')).toBeVisible();

    await page.goto('/matchmaker/my-matchmakers');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="my-matchmakers-shell"]')).toBeVisible();
  });

  test('真实钱包与资产页采用品牌化结算壳体', async ({ page }) => {
    await loginViaAPI(page, 'matchmaker');

    await page.goto('/matchmaker/wallet');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="matchmaker-wallet-shell"]')).toBeVisible();

    await page.goto('/matchmaker/withdraw');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="matchmaker-withdraw-shell"]')).toBeVisible();

    await page.goto('/matchmaker/qrcode');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="matchmaker-qrcode-shell"]')).toBeVisible();

    await page.goto('/matchmaker/shop');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="matchmaker-shop-shell"]')).toBeVisible();
  });

  test('真实经营协作与表单页采用品牌化工作壳体', async ({ page }) => {
    await loginViaAPI(page, 'matchmaker');

    await page.goto('/matchmaker/invite');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="matchmaker-invite-shell"]')).toBeVisible();

    await page.goto('/matchmaker/team');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="matchmaker-team-shell"]')).toBeVisible();

    await page.goto('/matchmaker/store');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="matchmaker-store-shell"]')).toBeVisible();

    await page.goto('/matchmaker/salon/create');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="matchmaker-salon-create-shell"]')).toBeVisible();

    await page.goto('/matchmaker/member/add');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="matchmaker-member-add-shell"]')).toBeVisible();

    await page.goto('/matchmaker/member/1/edit');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="matchmaker-member-edit-shell"]')).toBeVisible();

    await loginViaAPI(page, 'maleUser');
    await page.goto('/user/profile/edit');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="user-profile-edit-shell"]')).toBeVisible();
  });

  test('真实聊天页采用品牌化对话壳体', async ({ page }) => {
    await loginViaAPI(page, 'maleUser');
    await page.goto('/chat/1');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('[data-testid="chat-brand-shell"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-message-shell"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-input-shell"]')).toBeVisible();
  });
});
