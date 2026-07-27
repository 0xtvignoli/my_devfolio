import { test, expect, devices } from '@playwright/test';

// 320px — the narrowest viewport we support. Chromium, not the device default
// webkit: this checks layout, and webkit isn't in the installed browser set.
test.use({ ...devices['iPhone SE'], browserName: 'chromium' });

const ROUTES = ['/en', '/en/portfolio', '/en/experience', '/en/articles', '/en/lab'];

for (const route of ROUTES) {
  test(`${route} does not scroll horizontally on a 320px viewport`, async ({ page }) => {
    await page.goto(route);
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
}

test('viewport-fit=cover is set so safe-area insets resolve', async ({ page }) => {
  await page.goto('/en');
  const content = await page.locator('meta[name="viewport"]').getAttribute('content');
  expect(content).toContain('viewport-fit=cover');
});

test('terminal input keeps a usable width next to the prompt', async ({ page }) => {
  await page.goto('/en/lab');
  const input = page.locator('#terminal-input');
  await input.scrollIntoViewIfNeeded();
  const box = await input.boundingBox();
  // Was 10px at 320: the prompt sat on the same row and ate the whole line.
  expect(box!.width).toBeGreaterThan(200);
});
