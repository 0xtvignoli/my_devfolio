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

test('lab surfaces real CI evidence and the SLO panel', async ({ page }) => {
  await page.goto('/en/lab');
  // Rows come from the GitHub API at build time; the panel hides itself if the
  // fetch failed, so a visible heading means real data made it through.
  await expect(page.getByRole('heading', { name: /Terraform CI/i })).toBeVisible();
  await expect(page.getByText(/\d+\/\d+ green/)).toBeVisible();
  await expect(page.locator('#ci a[href*="/actions/runs/"]').first()).toBeVisible();

  await expect(page.getByRole('heading', { name: /error budget/i })).toBeVisible();
  await expect(page.getByText('Burn rate')).toBeVisible();
});

test('a session permalink replays every command it carries', async ({ page }) => {
  await page.goto('/en/lab?cmd=kubectl+get+pods&cmd=status');
  const terminal = page.locator('#lab-terminal');
  // Staggered replay: first at ~800ms, the second ~1.8s later.
  await expect(terminal.getByText('kubectl get pods').first()).toBeVisible({ timeout: 15_000 });
  await expect(terminal.getByText('status', { exact: true }).first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: /replays this session/i })).toBeVisible();
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

test('ask widget posts to the assistant and renders a reply', async ({ page }) => {
  await page.goto('/en');
  const input = page.getByLabel('Ask about my work');
  // The widget is only rendered when a model key was present at build time.
  test.skip((await input.count()) === 0, 'no model key in this environment — widget hidden by design');
  await input.fill('what has he built with Kubernetes?');
  await page.getByRole('button', { name: /^Ask$/ }).click();
  // Without a server key the endpoint answers "Assistant offline…" — either way
  // a non-empty reply proves the wiring end to end.
  await expect(page.locator('[aria-live="polite"] pre')).not.toBeEmpty({ timeout: 20_000 });
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
