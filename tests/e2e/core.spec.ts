import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home hero renders primary CTAs', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /Senior DevOps Engineer & Cloud Architect/i })
  ).toBeVisible();
  await expect(page.getByRole('link', { name: /View Projects/i })).toBeVisible();
});

test('locale switcher toggles language and refreshes copy', async ({ page }) => {
  await page.goto('/');
  const switcher = page.getByRole('button', { name: /switch language/i });
  await expect(switcher).toContainText(/EN|IT/);
  const initialLabel = await switcher.innerText();
  await Promise.all([page.waitForLoadState('networkidle'), switcher.click()]);
  await expect(switcher).not.toContainText(initialLabel);
  await expect(page.getByRole('link', { name: /Vedi Progetti|View Projects/i })).toBeVisible();
});

test('lab page loads telemetry widgets', async ({ page }) => {
  await page.goto('/lab');
  await expect(page.getByRole('heading', { name: /Lab/i })).toBeVisible();
  await expect(page.getByText(/Incident History/i)).toBeVisible();
  await expect(page.getByText(/Container Orchestration/i)).toBeVisible();
});

test('theme toggle opens and offers light, dark, system', async ({ page }) => {
  await page.goto('/');
  const themeButton = page.getByRole('button', { name: /toggle theme/i });
  await expect(themeButton).toBeVisible();
  await themeButton.click();
  await expect(page.getByRole('menuitem', { name: /Light/i })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: /Dark/i })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: /System/i })).toBeVisible();
});

test('articles list page shows articles and links to slug', async ({ page }) => {
  await page.goto('/articles');
  await expect(page.getByRole('heading', { name: /articles|articoli/i })).toBeVisible();
  const firstArticleLink = page.locator('a[href^="/articles/"]').first();
  await expect(firstArticleLink).toBeVisible();
  await firstArticleLink.click();
  await expect(page).toHaveURL(/\/articles\/[^/]+/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('home page has no critical a11y violations (axe)', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  const critical = results.violations.filter((v) => v.impact === 'critical');
  expect(critical, `Critical a11y violations: ${JSON.stringify(critical, null, 2)}`).toEqual([]);
});
