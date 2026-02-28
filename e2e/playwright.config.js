// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * 婚恋平台 Playwright 配置
 * 前端: http://localhost:5173
 * 后端: http://localhost:3000/api
 */
module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  timeout: 30000,
  expect: {
    timeout: 10000
  },

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 10000,
    navigationTimeout: 15000,
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Pixel 7'],
      },
    },
  ],

  /* 可选：自动启动前端开发服务器 */
  // webServer: {
  //   command: 'cd ../client && npm run dev',
  //   url: 'http://localhost:5173',
  //   reuseExistingServer: true,
  //   timeout: 30000,
  // },
});
