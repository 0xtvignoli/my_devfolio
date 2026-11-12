import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const HOME = '/en';

test('home hero renders primary CTAs', async ({ page }) => {
  await page.goto(HOME);
  await expect(page.getByRole('heading', { level: 1, name: /I build infrastructure/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Selected work/i })).toBeVisible();
});

test('locale switcher links to the same page in the other language', async ({ page }) => {
  await page.goto('/en/portfolio');
  await page.getByRole('link', { name: 'Italiano' }).click();
  await expect(page).toHaveURL(/\/it\/portfolio\/?$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Lavori' })).toBeVisible();
});

test('the lab index lists every experiment and each one links on', async ({ page }) => {
  await page.goto('/en/lab');
  await expect(page.getByRole('heading', { level: 1, name: 'The Lab' })).toBeVisible();
  await expect(page.locator('ol > li a[href^="/en/lab/"]')).toHaveCount(9);
  await page.goto('/en/lab/decoys/ports');
  await expect(page.getByRole('navigation', { name: 'Lab experiments' }).getByRole('link', { name: /next.*An AI server left open/ })).toBeVisible();
});

test('observatory renders real aggregates and the case studies', async ({ page }) => {
  await page.goto('/en/lab/observatory');
  await expect(page.getByRole('heading', { level: 1, name: 'Observatory' })).toBeVisible();
  // The four headline figures are numbers, not placeholders.
  await expect(page.locator('dl dd').first()).toHaveText(/^\d[\d,.]*/);
  await expect(page.getByRole('heading', { name: 'What they look for' })).toBeVisible();
  await expect(page.locator('a[href="/en/articles/react2shell-scan-case-study"]')).toBeVisible();

  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  const critical = results.violations.filter((v) => v.impact === 'critical');
  expect(critical, `Critical a11y violations: ${JSON.stringify(critical, null, 2)}`).toEqual([]);
});

test('removed experiments redirect to the lab', async ({ request }) => {
  for (const path of ['/en/dashboard', '/en/live', '/it/shell', '/it/lab/decoys']) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(308);
    expect(response.headers()['location']).toMatch(/\/(en|it)\/lab$/);
  }
});

test('theme toggle switches between light and dark', async ({ page }) => {
  await page.goto(HOME);
  // The button is labelled with the theme a click switches TO. Which one it
  // starts on depends on the runner's colour scheme, so assert the flip.
  const toggle = page.getByRole('button', { name: /^(Light|Dark)$/ });
  await expect(toggle).toBeVisible();
  const startedDark = ((await page.locator('html').getAttribute('class')) ?? '').includes('dark');
  await toggle.click();
  await expect(page.locator('html')).toHaveClass(startedDark ? /^(?!.*dark).*$/ : /dark/);
});

test('articles list page shows articles and links to slug', async ({ page }) => {
  await page.goto('/en/articles');
  await expect(page.getByRole('heading', { level: 1, name: 'Writing' })).toBeVisible();
  const firstArticleLink = page.locator('a[href^="/en/articles/"]').first();
  await expect(firstArticleLink).toBeVisible();
  await firstArticleLink.click();
  await expect(page).toHaveURL(/\/en\/articles\/[^/]+/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('machine endpoints are served, not swallowed by the locale redirect', async ({ request }) => {
  const feed = await request.get('/en/feed.xml');
  expect(feed.status()).toBe(200);
  expect(feed.headers()['content-type']).toContain('application/rss+xml');
  expect(await feed.text()).toContain('<rss');

  // /llms.txt has no locale prefix — it only works because proxy.ts excludes it.
  const llms = await request.get('/llms.txt');
  expect(llms.status()).toBe(200);
  expect(await llms.text()).toContain('## Articles');
});

test('tag filter narrows the article list and All restores it', async ({ page }) => {
  await page.goto('/en/articles');
  const cards = page.locator('a[href^="/en/articles/"]');
  const total = await cards.count();
  expect(total).toBeGreaterThan(1);

  await page.getByRole('button', { name: 'Kubernetes', exact: true }).click();
  const filtered = await cards.count();
  expect(filtered).toBeGreaterThan(0);
  expect(filtered).toBeLessThan(total);

  await page.getByRole('button', { name: 'All', exact: true }).click();
  expect(await cards.count()).toBe(total);
});

test('cv page renders from site data and is printable', async ({ page }) => {
  await page.goto('/en/cv');
  await expect(page.getByRole('heading', { level: 1, name: /Thomas Vignoli/ })).toBeVisible();
  // Sections are generated from experiences/projects — empty means the data broke.
  await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Print/i })).toBeVisible();

  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  const critical = results.violations.filter((v) => v.impact === 'critical');
  expect(critical, `Critical a11y violations: ${JSON.stringify(critical, null, 2)}`).toEqual([]);
});

// The address used to be inside the Translations bundle, which Header and the
// mobile nav — both client components on every page — serialise wholesale into
// each page's RSC payload. That put it in the HTML of pages with no contact form
// at all, where Cloudflare's email obfuscation cannot reach it.
test('the contact address only appears where a mail link is rendered', async ({ request }) => {
  const ADDRESS = 'thomas.vignoli@pm.me';

  for (const path of ['/en/articles', '/it/articles', '/en/lab', '/en/portfolio', '/en/experience']) {
    const html = await (await request.get(path)).text();
    expect(html.includes(ADDRESS), `${path} should not carry the contact address`).toBe(false);
  }

  // Where it is legitimate, it must be server-rendered so obfuscation covers it.
  for (const path of ['/en', '/en/cv']) {
    const html = await (await request.get(path)).text();
    expect(html.includes(`mailto:${ADDRESS}`), `${path} should render a real mail link`).toBe(true);
  }

  // The client-side copy button reads it from here instead of a prop.
  const api = await request.get('/api/contact');
  expect(api.status()).toBe(200);
  expect((await api.json()).email).toBe(ADDRESS);
});

// The form is hidden unless a mail provider key is configured, but its contract is
// testable regardless: validation runs before the config check on purpose.
test('the contact endpoint validates before it reveals anything', async ({ request }) => {
  const valid = {
    name: 'Jane Recruiter',
    email: 'jane@example.com',
    message: 'We have a platform engineering role and your GitOps work looks relevant.',
  };

  // Garbage is rejected without touching the mail provider.
  for (const bad of [
    { ...valid, email: 'not-an-address' },
    { ...valid, message: 'too short' },
    { ...valid, name: 'J' },
    { ...valid, email: 'jane@example.com\nBcc: victim@example.com' },
  ]) {
    const response = await request.post('/api/contact/send', { data: bad });
    expect(response.status(), `should reject ${JSON.stringify(bad).slice(0, 60)}`).toBe(400);
  }

  // A filled honeypot is told everything is fine — it learns nothing.
  const trapped = await request.post('/api/contact/send', { data: { ...valid, company: 'Acme' } });
  expect(trapped.status()).toBe(200);

  // A valid message always answers 200 and reports the outcome in the body:
  // Cloudflare replaces origin 5xx bodies with its own, so a 5xx here would reach
  // the browser as an unexplained "error code: 502".
  const good = await request.post('/api/contact/send', { data: valid });
  expect(good.status()).toBe(200);
  const payload = await good.json();
  expect(typeof payload.ok).toBe('boolean');
  // Locally there is no provider key, so ok:false with a reason is correct.
  if (!payload.ok) expect(['not_configured', 'send_failed']).toContain(payload.reason);
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
