import { access } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test.beforeAll(async () => {
  await Promise.all([
    access("docs/.farm/.output/server/index.mjs"),
    access("docs/.farm/.output/public/farm-client.js"),
  ]);
});

test("boots the emitted docs site and navigates into the guide", async ({ page }) => {
  const browserErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => browserErrors.push(`page: ${error.message}`));

  const response = await page.goto("/");

  expect(response?.ok()).toBe(true);
  expect(response?.headers()["x-frame-options"]).toBe("DENY");
  await expect(page).toHaveTitle(/Farm\.js/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/a framework for/i);
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();

  const getStarted = page.getByRole("link", { name: "Get Started", exact: true }).first();
  await expect(getStarted).toBeVisible();
  await getStarted.click();

  await expect(page).toHaveURL(/\/docs\/getting-started$/);
  await expect(page.getByRole("heading", { name: "Getting Started", level: 1 })).toBeVisible();
  expect(browserErrors).toEqual([]);
});

test("blog connects the journal, article, contents, and Markdown mirror", async ({ page }) => {
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/blog");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("The Farm journal.");
  await expect(
    page
      .getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", { name: /Blog/ }),
  ).toHaveAttribute("aria-current", "page");

  await page.locator(".blog-featured").click();
  await expect(page).toHaveURL(/\/blog\/farm-0-1$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("FarmJS 0.1");
  const contents = page.locator(".blog-contents");
  await expect(contents.getByRole("navigation").getByRole("link")).toHaveCount(11);
  for (const href of await contents
    .getByRole("navigation")
    .getByRole("link")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")!))) {
    await expect(page.locator(href)).toHaveCount(1);
  }
  await contents.getByRole("link", { name: "11 Try it" }).click();
  await expect(page).toHaveURL(/#try-it$/);
  await expect(
    page.getByRole("heading", { level: 2, name: "Try it", exact: true }),
  ).toBeInViewport();
  await expect(contents.getByRole("link", { name: "Read Markdown" })).toHaveAttribute(
    "href",
    "/blog/farm-0-1.md",
  );
  const markdown = await page.request.get("/blog/farm-0-1.md");
  expect(markdown.ok()).toBe(true);
  expect(await markdown.text()).toContain("# FarmJS 0.1: Stable, Integrated, and Agent-Native");
  await contents.getByRole("link", { name: "Read Markdown" }).click();
  await expect(page).toHaveURL(/\/blog\/farm-0-1\.md$/);
  await expect(page.locator("body")).toContainText("# FarmJS 0.1");
  await page.goBack();
  await page.getByRole("link", { name: "All posts" }).click();
  await expect(page).toHaveURL(/\/blog$/);
  expect(browserErrors).toEqual([]);
});

for (const width of [320, 390, 768]) {
  test(`blog navigation and reading stay usable at ${width}px without JavaScript`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: { width, height: 844 },
      javaScriptEnabled: false,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    try {
      await page.goto("/blog");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.locator(".blog-featured").click();
      await expect(page).toHaveURL(/\/blog\/farm-0-1$/);
      await page.locator(".blog-mobile-contents summary").click();
      await page.locator(".blog-mobile-contents").getByRole("link", { name: "11 Try it" }).click();
      await expect(page).toHaveURL(/#try-it$/);
      await expect(
        page.getByRole("heading", { level: 2, name: "Try it", exact: true }),
      ).toBeInViewport();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      expect(
        await page
          .locator(".blog-prose pre")
          .evaluateAll((blocks) =>
            blocks.every((block) => getComputedStyle(block).overflowX === "auto"),
          ),
      ).toBe(true);
      await page.locator("summary").filter({ hasText: "Open navigation" }).click();
      await page
        .getByRole("navigation", { name: "Mobile navigation" })
        .getByRole("link", { name: /Blog/ })
        .click();
      await expect(page).toHaveURL(/\/blog$/);
      await page.keyboard.press("Tab");
      await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.locator("#blog-content")).toBeFocused();
    } finally {
      await context.close();
    }
  });
}
