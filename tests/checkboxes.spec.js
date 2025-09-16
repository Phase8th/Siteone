import { test, expect } from '@playwright/test';

const url = 'https://the-internet.herokuapp.com/checkboxes';

// Helpers
const checkbox = (page, index) => page.locator('#checkboxes input[type="checkbox"]').nth(index);

test.describe('Checkboxes', () => {
  test('HTTP status is 200 and page has expected headings', async ({ page }) => {
    const response = await page.goto(url);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/The Internet/);
    await expect(page.locator('h3')).toHaveText('Checkboxes');
  });

  test('default states: first unchecked, second checked', async ({ page }) => {
    await page.goto(url);
    const first = checkbox(page, 0);
    const second = checkbox(page, 1);

    await expect(first).not.toBeChecked();
    await expect(second).toBeChecked();
  });

  test('toggle via mouse clicks', async ({ page }) => {
    await page.goto(url);
    const first = checkbox(page, 0);
    const second = checkbox(page, 1);

    // Click to check first
    await first.click();
    await expect(first).toBeChecked();

    // Click to uncheck second
    await second.click();
    await expect(second).not.toBeChecked();

    // Toggle back
    await first.click();
    await expect(first).not.toBeChecked();
    await second.click();
    await expect(second).toBeChecked();
  });

  test('toggle via keyboard (Space) when focused', async ({ page }) => {
    await page.goto(url);
    const first = checkbox(page, 0);

    await first.focus();
    await page.keyboard.press(' ');
    await expect(first).toBeChecked();

    await page.keyboard.press(' ');
    await expect(first).not.toBeChecked();
  });

  test('bulk check and uncheck using API', async ({ page }) => {
    await page.goto(url);
    const boxes = page.locator('#checkboxes input[type="checkbox"]');

    // Check all
    const count = await boxes.count();
    for (let i = 0; i < count; i++) {
      await boxes.nth(i).check();
    }
    for (let i = 0; i < count; i++) {
      await expect(boxes.nth(i)).toBeChecked();
    }

    // Uncheck all
    for (let i = 0; i < count; i++) {
      await boxes.nth(i).uncheck();
    }
    for (let i = 0; i < count; i++) {
      await expect(boxes.nth(i)).not.toBeChecked();
    }
  });
});