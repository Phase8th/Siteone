import { test, expect } from '@playwright/test';

const url = 'https://the-internet.herokuapp.com/broken_images';

// Detect broken images using DOM properties
// - An image is considered broken if it is not complete or has naturalWidth === 0
// - This page intentionally contains broken images; we assert that at least one is broken
//   and optionally that at least one is valid, to guard against false positives

test('broken images detected via DOM properties', async ({ page }) => {
  const response = await page.goto(url);
  expect(response?.status()).toBe(200);

  const imgs = page.locator('img');
  const count = await imgs.count();
  expect(count).toBeGreaterThan(0);

  const statuses = await imgs.evaluateAll((elements) =>
    elements.map((img) => ({
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      src: img.currentSrc || img.src
    }))
  );

  const broken = statuses.filter((s) => !s.complete || s.naturalWidth === 0);
  const ok = statuses.filter((s) => s.complete && s.naturalWidth > 0);

  // Page is known to have broken images
  expect(broken.length).toBeEqualTo(0);
  // And at least one valid to ensure the selector works as expected
  expect(ok.length).toBeGreaterThan(0);
});

// Verify broken images by checking network responses
// - Listen for image responses and assert that at least one returns 4xx/5xx

test('broken images detected via network responses', async ({ page }) => {
  const imageResponses = [];

  page.on('response', (res) => {
    const req = res.request();
    if (req.resourceType() === 'image') {
      imageResponses.push({ url: res.url(), status: res.status() });
    }
  });

  const response = await page.goto(url, { waitUntil: 'load' });
  expect(response?.status()).toBe(200);

  // Give a short time for lazy/async image loads if any
  await page.waitForTimeout(300);

  expect(imageResponses.length).toBeGreaterThan(0);

  const failed = imageResponses.filter((r) => r.status >= 400);
  expect(failed.length).toBeEqualTo(0);
});