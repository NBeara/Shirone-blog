import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
	test(`post typography stays scoped and readable (${theme})`, async ({ page }) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await page.goto("/posts/guide/");
		await page.waitForFunction(() =>
			getComputedStyle(document.documentElement).getPropertyValue("--mc-primary").trim().startsWith("#"),
		);
		const body = page.locator('[data-current-page="post"] .markdown-content');
		await expect(body).toHaveCSS("opacity", "1");
		await expect(body.locator("h2").first()).toHaveCSS("margin-top", "0px");
		await expect(body.locator("h3").first()).toHaveCSS("margin-top", "32px");
		await expect(body.locator("blockquote").first()).toHaveCSS("border-left-width", "4px");
		await expect(body.locator("blockquote").first()).toHaveCSS("border-radius", "8px");
		await expect(body.locator("blockquote").first()).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
		await expect(body.locator(".expressive-code").first()).toBeVisible();
		await page.setViewportSize({ width: 375, height: 812 });
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

		// A persistent window marker distinguishes Swup navigation from a reload.
		await page.evaluate(() => { (window as any).__postStyleNavigation = true; });
		await page.locator('a[href="/about/"]').first().click();
		await expect(page.locator('[data-current-page="about"]')).toBeVisible();
		expect(await page.evaluate(() => (window as any).__postStyleNavigation)).toBe(true);
		await expect(page.locator(".markdown-content h2").first()).toHaveCSS("margin-top", "16px");
		await page.goBack();
		await expect(page.locator('[data-current-page="post"] .markdown-content blockquote').first()).toHaveCSS("border-left-width", "4px");
	});
}
