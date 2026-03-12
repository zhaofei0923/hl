# Brand Rollout Final Pass Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Finish the champagne-gold rollout across the remaining routed client utility/support pages so the app no longer has a split between redesigned primary pages and legacy utility flows.

**Architecture:** Use a two-layer approach. First, add shared utility-shell styling in `client/src/styles/global.css` so form pages, asset pages, and support pages inherit the same brand surface, spacing, and input treatment. Second, add explicit hero/shell sections plus `data-testid` anchors to the remaining routed pages that still need page-level information hierarchy.

**Tech Stack:** Vue 3, Vant, Vite, Playwright

### Task 1: Add Failing Utility-Shell Tests

**Files:**
- Modify: `e2e/tests/redesign.spec.js`
- Reference: `e2e/tests/helpers.js`

**Step 1: Write the failing tests**

Add grouped checks for these routed pages:
- `/customer-service`
- `/certification`
- `/user/match-list`
- `/matchmaker/resources`
- `/matchmaker/my-matchmakers`
- `/matchmaker/wallet`
- `/matchmaker/withdraw`
- `/matchmaker/qrcode`
- `/matchmaker/shop`
- `/matchmaker/invite`
- `/matchmaker/team`
- `/matchmaker/store`
- `/matchmaker/salon/create`
- `/matchmaker/member/add`
- `/matchmaker/member/1/edit`
- `/user/profile/edit`

Use these selectors:
- `customer-service-shell`
- `certification-shell`
- `match-list-shell`
- `matchmaker-resources-shell`
- `my-matchmakers-shell`
- `matchmaker-wallet-shell`
- `matchmaker-withdraw-shell`
- `matchmaker-qrcode-shell`
- `matchmaker-shop-shell`
- `matchmaker-invite-shell`
- `matchmaker-team-shell`
- `matchmaker-store-shell`
- `matchmaker-salon-create-shell`
- `matchmaker-member-add-shell`
- `matchmaker-member-edit-shell`
- `user-profile-edit-shell`

**Step 2: Run test to verify it fails**

Run:
`npx playwright test tests/redesign.spec.js --grep "真实客服与认证页采用品牌化支持壳体|真实发现与资源页采用品牌化推荐壳体|真实钱包与资产页采用品牌化结算壳体|真实经营协作与表单页采用品牌化工作壳体"`

Expected: FAIL because the selectors do not exist yet.

### Task 2: Add Shared Utility Styling

**Files:**
- Modify: `client/src/styles/global.css`

**Step 1: Add global utility-shell styles**

Add shared styles for:
- hero surfaces
- utility stat grids
- form/list section headers
- repeated card/list/item shells
- wallet/invite/team/qrcode/support page card upgrades
- chat, form, and bottom action bar polish

**Step 2: Re-run no tests yet**

This step only sets the shared visual system used by the page-specific shells.

### Task 3: Add Page-Level Shells and Anchors

**Files:**
- Modify: `client/src/views/common/CustomerService.vue`
- Modify: `client/src/views/common/Certification.vue`
- Modify: `client/src/views/user/MatchList.vue`
- Modify: `client/src/views/matchmaker/Resources.vue`
- Modify: `client/src/views/matchmaker/MyMatchmakers.vue`
- Modify: `client/src/views/matchmaker/Wallet.vue`
- Modify: `client/src/views/matchmaker/Withdraw.vue`
- Modify: `client/src/views/matchmaker/QrCode.vue`
- Modify: `client/src/views/matchmaker/Shop.vue`
- Modify: `client/src/views/matchmaker/InviteFriends.vue`
- Modify: `client/src/views/matchmaker/Team.vue`
- Modify: `client/src/views/matchmaker/StoreInfo.vue`
- Modify: `client/src/views/matchmaker/SalonCreate.vue`
- Modify: `client/src/views/matchmaker/MemberAdd.vue`
- Modify: `client/src/views/matchmaker/MemberEdit.vue`
- Modify: `client/src/views/user/ProfileEdit.vue`

**Step 1: Add minimal shell markup**

For each page:
- Add a brand intro/hero section near the top.
- Add the relevant `data-testid` selector from Task 1.
- Preserve all current data flow, submission logic, and route behavior.

**Step 2: Run the grouped grep tests again**

Expected: All new shell tests pass.

### Task 4: Final Verification

**Files:**
- Verify: `client/src/styles/global.css`
- Verify: all pages modified in Task 3
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
