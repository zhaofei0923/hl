# Brand Rollout Batch 4 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend the champagne-gold redesign to the next four real pages: matchmaker orders, matchmaker member detail, admin matchmakers, and admin salons.

**Architecture:** Reuse the brand-shell patterns already established in `client` and `admin` so this batch stays consistent with the earlier home, messages, profile, dashboard, users, withdrawals, and orders rollouts. Each page keeps its existing API and route behavior, but gets a new visual hierarchy plus test ids for end-to-end verification.

**Tech Stack:** Vue 3, Vant, Element Plus, Vite, Playwright

### Task 1: Add Failing Redesign Tests

**Files:**
- Modify: `e2e/tests/redesign.spec.js`
- Reference: `e2e/tests/helpers.js`

**Step 1: Write the failing tests**

Add four assertions for:
- `/matchmaker/orders`
- `/matchmaker/member/1`
- `http://localhost:5174/admin/matchmakers`
- `http://localhost:5174/admin/salons`

Use these selectors:
- `matchmaker-orders-shell`
- `matchmaker-orders-stats`
- `matchmaker-orders-list`
- `matchmaker-member-hero`
- `matchmaker-member-profile`
- `matchmaker-member-partner`
- `admin-matchmakers-shell`
- `admin-matchmakers-toolbar`
- `admin-salons-shell`
- `admin-salons-toolbar`

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/redesign.spec.js --grep "真实红娘订单页采用品牌化业绩面板|真实红娘会员详情页采用品牌化顾问视图|真实后台红娘列表采用品牌化运营壳体|真实后台沙龙列表采用品牌化运营壳体"`

Expected: FAIL because the selectors do not exist yet.

### Task 2: Redesign Matchmaker Mobile Pages

**Files:**
- Modify: `client/src/views/matchmaker/Orders.vue`
- Modify: `client/src/views/matchmaker/MemberDetail.vue`

**Step 1: Write the minimal implementation**

For `Orders.vue`:
- Add a brand hero section with performance framing and a status summary.
- Add a branded shell around the order list.
- Preserve existing summary fetch, tabs, and order loading.
- Add:
  - `data-testid="matchmaker-orders-shell"`
  - `data-testid="matchmaker-orders-stats"`
  - `data-testid="matchmaker-orders-list"`

For `MemberDetail.vue`:
- Rebuild the top section into a consultant-style profile view with trust framing.
- Separate profile facts from partner expectations.
- Preserve edit, call, image preview, and API loading.
- Add:
  - `data-testid="matchmaker-member-hero"`
  - `data-testid="matchmaker-member-profile"`
  - `data-testid="matchmaker-member-partner"`

**Step 2: Run focused tests**

Run the grep command from Task 1 again.

Expected: The two mobile-page tests now pass, while admin-page tests may still fail until Task 3.

### Task 3: Redesign Admin Operations Pages

**Files:**
- Modify: `admin/src/views/Matchmakers.vue`
- Modify: `admin/src/views/Salons.vue`

**Step 1: Write the minimal implementation**

For `Matchmakers.vue`:
- Add a branded page header, summary pills, and toolbar shell.
- Keep existing table, drawers, dialogs, and API actions.
- Add:
  - `data-testid="admin-matchmakers-shell"`
  - `data-testid="admin-matchmakers-toolbar"`

For `Salons.vue`:
- Add a branded header, summary pills, and toolbar shell.
- Keep create/edit/cancel/detail behavior intact.
- Add:
  - `data-testid="admin-salons-shell"`
  - `data-testid="admin-salons-toolbar"`

**Step 2: Run focused tests**

Run the grep command from Task 1 again.

Expected: All four new redesign tests pass.

### Task 4: Full Verification

**Files:**
- Verify: `client/src/views/matchmaker/Orders.vue`
- Verify: `client/src/views/matchmaker/MemberDetail.vue`
- Verify: `admin/src/views/Matchmakers.vue`
- Verify: `admin/src/views/Salons.vue`
- Verify: `e2e/tests/redesign.spec.js`

**Step 1: Run full redesign suite**

Run: `npx playwright test tests/redesign.spec.js`

Expected: PASS with 0 failures.

**Step 2: Run client build**

Run: `cd client && npm run build`

Expected: PASS.

**Step 3: Run admin build**

Run: `cd admin && npm run build`

Expected: PASS, with existing chunk-size warnings allowed if there are no build failures.
