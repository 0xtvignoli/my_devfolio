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

test('the 44px touch-target floor applies to chrome links but not prose text', async ({ page }) => {
  await page.goto('/en/articles/x402-agent-native-api-monetization');
  const result = await page.evaluate(() => {
    const prose = document.querySelector('.prose')!;
    const p = document.createElement('p');
    p.innerHTML = 'before <a href="#x" id="probe">a long inline link that has to wrap across several lines</a> after';
    prose.appendChild(p);
    const probe = document.getElementById('probe')!;
    const footer = document.querySelector('footer a')!;
    return {
      proseDisplay: getComputedStyle(probe).display,
      proseLineBoxes: probe.getClientRects().length,
      footerHeight: footer.getBoundingClientRect().height,
    };
  });
  expect(result.proseDisplay).toBe('inline');
  expect(result.proseLineBoxes).toBeGreaterThan(1); // inline-flex would force one box
  expect(result.footerHeight).toBeGreaterThanOrEqual(44);
});

test('terminal input keeps a usable width next to the prompt', async ({ page }) => {
  await page.goto('/en/lab');
  const input = page.locator('#terminal-input');
  await input.scrollIntoViewIfNeeded();
  const box = await input.boundingBox();
  // Was 10px at 320: the prompt sat on the same row and ate the whole line.
  expect(box!.width).toBeGreaterThan(200);
});
