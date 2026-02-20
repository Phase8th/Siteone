import { test, expect } from '@playwright/test';

const url = 'https://the-internet.herokuapp.com/context_menu';
const hotspot = (page) => page.locator('#hot-spot');

test.describe('Context Menu', () => {
  test('@smoke HTTP status is 200 and heading is correct', async ({ page }) => {
    const response = await page.goto(url);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/The Internet/);
    await expect(page.locator('h3')).toHaveText('Context Menu');
  });

  test('@regress page shows instructional text', async ({ page }) => {
    await page.goto(url);
    const bodyText = await page.locator('body').innerText();
    await expect(bodyText).toContain('Right-click in the box below');
    await expect(bodyText).toContain('trigger a JavaScript alert');
  });

  test('@regress right-click on hotspot triggers JavaScript alert', async ({ page }) => {
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

  test('@regress left-click on hotspot does not trigger alert', async ({ page }) => {
    await page.goto(url);

    const dialogPromise = page
      .waitForEvent('dialog', { timeout: 500 })
      .then(async (dialog) => {
        await dialog.dismiss();
        return true;
      })
      .catch(() => false);

    await hotspot(page).click({ button: 'left' });
    await expect(dialogPromise).resolves.toBe(false);
  });
});
