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

test('the 44px touch-target floor applies to chrome links but not prose text', async ({ page }) => {
  await page.goto('/en/articles/x402-agent-native-api-monetization');
  // The reload-until-styled dance this used to need is gone: the suite now runs
  // against a production build, so there is no per-route compilation to race.

  const result = await page.evaluate(() => {
    const prose = document.querySelector('.prose')!;
    const p = document.createElement('p');
    p.innerHTML = 'before <a href="#x" id="probe">a long inline link that has to wrap across several lines</a> after';
    prose.appendChild(p);
    const probe = document.getElementById('probe')!;
    const footer = document.querySelector('footer a')!;
    const probeStyle = getComputedStyle(probe);
    const footerStyle = getComputedStyle(footer);
    return {
      proseDisplay: probeStyle.display,
      proseMinHeight: probeStyle.minHeight,
      footerMinHeight: footerStyle.minHeight,
      footerHeight: footer.getBoundingClientRect().height,
    };
  });
  // Assert the CSS rule itself, not a side effect of it. This previously counted
  // the probe's line boxes to prove inline-flex wasn't collapsing it onto one
  // line — which depends on the viewport width and on whether the web font has
  // loaded, and flaked intermittently under parallel load. min-height is what
  // globals.css actually sets, and it is deterministic.
  expect(result.proseDisplay).toBe('inline');
  expect(result.proseMinHeight).toBe('0px'); // floor lifted for inline prose links
  expect(result.footerMinHeight).toBe('44px'); // and still applied to site chrome
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
