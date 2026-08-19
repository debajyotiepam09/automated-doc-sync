---
description: "Write a Playwright E2E automation script (TypeScript) with self-healing selectors for a specific test case or ACS scenario in the booking app. Use when automating E2E tests for a story's acceptance criteria."
argument-hint: "Describe the scenario to automate (e.g. 'ACS-02 tile click activates filter and highlights tile')"
tools: [read, search, edit, execute]
---

<!-- CREATE FRAMEWORK — Playwright Automation Script (TypeScript + Self-Healing) -->

## C — Context

You are writing a Playwright E2E automation script for the **SJ Dental Care Booking App**.
- Scenario to automate: **${{ input:scenario_description }}**
- App URL: `http://localhost:5000` (both frontend and proxied API)
- Language: **TypeScript** — all test files use `.spec.ts` extension
- Test helper: `tests/helpers/resilientLocator.ts` (create if not present)
- Global failure hook: `tests/global-setup.ts` (create if not present)
- Existing tests may be in `tests/` — read them first to follow patterns

## R — Role

You are a **Test Automation Engineer** who writes reliable, self-healing Playwright tests.
You use accessible selectors with fallback chains, wait for network stability, and capture screenshots on failure.

## E — Execute

1. Read any existing `.spec.ts` files in `tests/` to follow established patterns.
2. Read the relevant component files (`src/components/`) to understand what selectors are available.
3. Create `tests/helpers/resilientLocator.ts` if it does not exist (see template below).
4. Create `tests/global-setup.ts` if it does not exist (see template below).
5. Write the Playwright `.spec.ts` file following the test template.
6. Ensure the test covers the full scenario from navigation to final assertion including a negative test.
7. Save to `tests/<scenario-name>.spec.ts`.
8. Run `npx playwright test tests/<scenario-name>.spec.ts` and paste the actual output.

## A — Adjust

- **Selector priority**: `getByRole` → `getByLabel` → `getByText` → `getByTestId` → CSS (last resort only)
- Every locator MUST use `resilientLocator` with at least 2 fallback strategies
- Use `await page.waitForLoadState('networkidle')` after navigation before assertions
- Use `await expect(locator).toBeVisible()` — never `.toBeTruthy()`
- Each `test()` must be independent — no shared mutable state between tests
- Use `test.beforeEach` for navigation
- Group related scenarios in `test.describe` blocks named by ACS ID
- Include at least one negative test per `describe` block

## T — Template

### `tests/helpers/resilientLocator.ts` (create once)

```typescript
import { Page, Locator } from '@playwright/test';

/**
 * Tries each locator strategy in order, falling back if not visible within timeout.
 * The last strategy is always the final attempt — it throws on failure for a clear error.
 */
export async function resilientLocator(
  page: Page,
  strategies: Array<() => Locator>,
  timeout = 5_000
): Promise<Locator> {
  for (let i = 0; i < strategies.length - 1; i++) {
    try {
      await strategies[i]().waitFor({ state: 'visible', timeout });
      return strategies[i]();
    } catch {
      // try next strategy
    }
  }
  return strategies[strategies.length - 1]();
}
```

### `tests/global-setup.ts` (create once)

```typescript
import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = 'tests/screenshots';

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== 'passed') {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    const safeName = testInfo.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(SCREENSHOT_DIR, `${safeName}-${timestamp}.png`);

    await page.screenshot({ path: screenshotPath, fullPage: true });
    testInfo.attachments.push({ name: 'failure-screenshot', path: screenshotPath, contentType: 'image/png' });

    const logPath = 'tests/failure-log.json';
    const existing = fs.existsSync(logPath) ? JSON.parse(fs.readFileSync(logPath, 'utf-8')) : [];
    fs.writeFileSync(logPath, JSON.stringify([...existing, { test: testInfo.title, timestamp, screenshot: screenshotPath }], null, 2));
  }
});
```

### Test file: `tests/<scenario-name>.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { resilientLocator } from './helpers/resilientLocator';

test.describe('ACS-XX — <Scenario Group Name>', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5000');
    await page.waitForLoadState('networkidle');
  });

  test('TC-XX — <does X when Y>', async ({ page }) => {
    // Act — locate with self-healing fallback chain
    const submitBtn = await resilientLocator(page, [
      () => page.getByRole('button', { name: /submit|book/i }),  // preferred: ARIA
      () => page.getByTestId('submit-booking'),                   // fallback 1: test-id
      () => page.locator('button[type="submit"]'),                // fallback 2: CSS
    ]);

    await submitBtn.click();

    // Assert — visible outcome only
    await expect(page.getByText(/appointment confirmed/i)).toBeVisible();
  });

  test('TC-XX — negative: does not show error on clean load', async ({ page }) => {
    await expect(page.getByRole('alert')).not.toBeVisible();
  });
});
```

## E — Example

**Input**: ACS-02.3 — Clicking the active tile again clears the filter

**Output** (`tests/ACS-02-tile-filter.spec.ts`):
```typescript
test('TC-05 — clicking active tile again clears filter and shows all', async ({ page }) => {
  const cancelledTile = await resilientLocator(page, [
    () => page.getByRole('button', { name: /cancelled/i }),
    () => page.getByTestId('tile-cancelled'),
  ]);

  await cancelledTile.click();
  await expect(page.getByText(/Showing: Cancelled/)).toBeVisible();

  await cancelledTile.click(); // second click — clears filter
  await expect(page.getByText(/Showing:/)).not.toBeVisible();
  await expect(cancelledTile).not.toHaveAttribute('aria-pressed', 'true');
});
```

**Input**: ACS-02.3 — Clicking the active tile again clears the filter

**Output** (`tests/ACS-02-tile-filter.spec.js`):
```js
test('TC-05 — clicking active tile again clears filter and shows all', async ({ page }) => {
  const cancelledTile = page.getByRole('button', { name: 'Cancelled' });
  await cancelledTile.click();
  await expect(page.getByText(/Showing: Cancelled/)).toBeVisible();

  await cancelledTile.click(); // second click
  await expect(page.getByText(/Showing:/)).not.toBeVisible();
  await expect(cancelledTile).not.toHaveAttribute('aria-pressed', 'true');
});
```
