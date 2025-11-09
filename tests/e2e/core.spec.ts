import { test, expect } from '@playwright/test';

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
