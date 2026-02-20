import { test, expect } from '@playwright/test';

const url = 'https://the-internet.herokuapp.com/add_remove_elements/';

test('@regress HTTP status is 200', async ({ page }) => {
  const response = await page.goto(url);
  expect(response?.status()).toBe(200);
});

test('@regress has title', async ({ page }) => {
  await page.goto(url);
  await expect(page).toHaveTitle(/The Internet/);
});

test('@regress h3 header text', async ({ page }) => {
  await page.goto(url);
  await expect(page.locator('h3')).toHaveText('Add/Remove Elements');
});

test('@smoke add and remove element flow', async ({ page }) => {
	await page.goto(url);
	await page.getByRole('button', { name: 'Add Element' }).click();
	await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
	await page.getByRole('button', { name: 'Delete' }).click();
	await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(0);
});
