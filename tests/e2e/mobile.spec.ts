import { test, expect, devices } from '@playwright/test';

// 320px — the narrowest viewport we support. Chromium, not the device default
// webkit: this checks layout, and webkit isn't in the installed browser set.
test.use({ ...devices['iPhone SE'], browserName: 'chromium' });

const ROUTES = ['/en', '/en/portfolio', '/en/experience', '/en/articles', '/en/lab', '/en/cv'];

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

test('prose links stay inline and chrome links keep a usable target', async ({ page }) => {
  await page.goto('/en/articles/x402-agent-native-api-monetization');
  const result = await page.evaluate(() => {
    const footer = document.querySelector('footer a')!;
    const nav = document.querySelector('nav[aria-label="Primary"] a')!;
    return {
      footerHeight: footer.getBoundingClientRect().height,
      navHeight: nav.getBoundingClientRect().height,
    };
  });
  // WCAG 2.5.8 floor is 24px; header links get the full 44px from padding.
  expect(result.footerHeight).toBeGreaterThanOrEqual(24);
  expect(result.navHeight).toBeGreaterThanOrEqual(44);
});
