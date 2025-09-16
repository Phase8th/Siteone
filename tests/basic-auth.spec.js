import { test, expect } from '@playwright/test';

const url = 'https://the-internet.herokuapp.com/basic_auth';
const username = 'admin';
const password = 'admin';

test('basic auth succeeds with context credentials', async ({ browser }) => {
  const context = await browser.newContext({
    httpCredentials: { username, password }
  });
  const page = await context.newPage();
  const response = await page.goto(url);
  expect(response?.status()).toBe(200);
  await expect(page.locator('p')).toContainText('Congratulations!');
  await context.close();
});

test('basic auth succeeds with credentials in URL', async ({ page }) => {
  const response = await page.goto(`https://${username}:${password}@the-internet.herokuapp.com/basic_auth`);
  expect(response?.status()).toBe(200);
  await expect(page.locator('p')).toContainText('Congratulations!');
});

test('basic auth returns 401 without credentials (API request)', async ({ request }) => {
  const res = await request.get(url);
  expect(res.status()).toBe(401);
});