import { test, expect } from '@playwright/test';

const url = 'https://the-internet.herokuapp.com/context_menu';

const INSTRUCTION_TEXT_1 = 'Context menu items are custom additions that appear in the right-click menu.';
const INSTRUCTION_TEXT_2 = "Right-click in the box below to see one called 'the-internet'. When you click it, it will trigger a JavaScript alert.";

const hotspot = (page) => page.locator('#hot-spot');

test.describe('Context Menu', () => {
  test('HTTP status is 200 and heading is correct', async ({ page }) => {
    const response = await page.goto(url);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/The Internet/);
    await expect(page.locator('h3')).toHaveText('Context Menu');
  });

  test('page shows instructional text', async ({ page }) => {
    await page.goto(url);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).toContain(INSTRUCTION_TEXT_1);
    expect(bodyText).toContain(INSTRUCTION_TEXT_2);
  });

  test('right-click on hotspot triggers JavaScript alert', async ({ page }) => {
    await page.goto(url);

    const dialogPromise = new Promise((resolve) => {
      page.once('dialog', async (dialog) => {
        try {
          expect(dialog.message()).toBe('You selected a context menu');
        } finally {
          await dialog.accept();
          resolve(true);
        }
      });
    });

    await hotspot(page).click({ button: 'right' });

    await expect.poll(async () => dialogPromise.then(() => 'ok'), {
      message: 'Expected context menu alert to appear and be accepted'
    }).toBe('ok');
  });

  test('left-click on hotspot does not trigger alert', async ({ page }) => {
    await page.goto(url);

    let alertTriggered = false;
    page.once('dialog', async (dialog) => {
      alertTriggered = true;
      await dialog.dismiss();
    });

    await hotspot(page).click({ button: 'left' });
    await page.waitForTimeout(200);
    expect(alertTriggered).toBe(false);
  });
});