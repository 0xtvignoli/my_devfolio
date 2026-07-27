import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const HOME = '/en';

test('home hero renders primary CTAs', async ({ page }) => {
  await page.goto(HOME);
  await expect(
    page.getByRole('heading', { name: /Senior DevOps Engineer & Cloud Architect/i })
  ).toBeVisible();
  await expect(page.getByRole('link', { name: /View Projects/i })).toBeVisible();
});

test('locale switcher toggles language and refreshes copy', async ({ page }) => {
  await page.goto(HOME);
  const switcher = page.getByRole('button', { name: /switch language/i });
  await expect(switcher).toContainText(/EN|IT/);
  await switcher.click();
  await expect(page).toHaveURL(/\/it\/?$/);
  await expect(page.getByRole('link', { name: /Vedi Progetti|View Projects/i })).toBeVisible();
});

test('lab page loads telemetry widgets', async ({ page }) => {
  await page.goto('/en/lab');
  await expect(page.getByRole('heading', { name: /Incident history/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Cluster topology/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Deploy pipeline/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Command Interface/i })).toBeVisible();
});

test('lab layout toggle switches to immersive view and back with Escape', async ({ page }) => {
  await page.goto('/en/lab');
  const immersiveToggle = page.getByRole('button', { name: /Focus:/i });
  await expect(immersiveToggle).toBeVisible();
  await immersiveToggle.click();
  // Site header is hidden in immersive mode.
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Incident history/i })).toBeVisible();
});

test('lab page has no critical a11y violations (axe)', async ({ page }) => {
  await page.goto('/en/lab');
  await expect(page.getByRole('heading', { name: /Incident history/i })).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  const critical = results.violations.filter((v) => v.impact === 'critical');
  expect(critical, `Critical a11y violations: ${JSON.stringify(critical, null, 2)}`).toEqual([]);
});

test('theme toggle switches between light and dark', async ({ page }) => {
  await page.goto(HOME);
  // The button is labelled with the theme a click switches TO, and it renders a
  // pre-hydration placeholder ("Toggle theme") first — matching Light|Dark is
  // what proves React took over. Which one it starts on depends on the runner's
  // colour scheme, so assert the flip rather than a fixed direction.
  const toggle = page.getByRole('button', { name: /^(Light|Dark)$/ });
  await expect(toggle).toBeVisible();
  const startedDark = ((await page.locator('html').getAttribute('class')) ?? '').includes('dark');
  await toggle.click();
  await expect(page.locator('html')).toHaveClass(startedDark ? /^(?!.*dark).*$/ : /dark/);
});

test('articles list page shows articles and links to slug', async ({ page }) => {
  await page.goto('/en/articles');
  await expect(page.getByRole('heading', { name: /articles|articoli/i })).toBeVisible();
  const firstArticleLink = page.locator('a[href^="/en/articles/"]').first();
  await expect(firstArticleLink).toBeVisible();
  await firstArticleLink.click();
  await expect(page).toHaveURL(/\/en\/articles\/[^/]+/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('legacy root path redirects to locale prefix', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/(en|it)\/?$/);
});

test('home page has no critical a11y violations (axe)', async ({ page }) => {
  await page.goto(HOME);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  const critical = results.violations.filter((v) => v.impact === 'critical');
  expect(critical, `Critical a11y violations: ${JSON.stringify(critical, null, 2)}`).toEqual([]);
});
