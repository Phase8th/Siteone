// @ts-check
import { test, expect } from '@playwright/test';

async function disableAnimations(page) {
	await page.addStyleTag({
		content: `
			* {
				transition: none !important;
				animation: none !important;
				caret-color: transparent !important;
			}
			html::-webkit-scrollbar { display: none; }
		`
	});
}

test.describe('Visual regression', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('https://playwright.dev/');
		await disableAnimations(page);
	});

	test('homepage full page snapshot', async ({ page }) => {
		await expect(page).toHaveScreenshot('homepage-full.png', {
			fullPage: true,
			// Смягчаем чувствительность к антиалиасингу между платформами
			maxDiffPixelRatio: 0.01
		});
	});

	test('hero section snapshot', async ({ page }) => {
		const hero = page.locator('section.hero, .hero, [data-test=hero]').first();
		await expect(hero).toBeVisible();
		await expect(hero).toHaveScreenshot('hero-section.png', {
			maxDiffPixelRatio: 0.01
		});
	});
});


