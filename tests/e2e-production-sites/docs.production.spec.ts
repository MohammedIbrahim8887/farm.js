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
  await expect(page.getByRole("link", { name: /Follow the releases/i })).toHaveCount(0);
  await expect(page.locator(".blog-art-version")).toHaveText("v0.1.0_");
  await expect(page.locator(".blog-featured-bottom .blog-author-name")).toHaveText(
    "KinfeMichael Tariku",
  );
  await expect(page.locator(".blog-featured-bottom img")).toHaveAttribute("width", "36");
  await expect(page.locator(".blog-read-link")).toHaveText("Read article");
  await expect(page.locator(".blog-explore a")).toHaveCount(2);
  await expect(page.locator(".blog-explore a").first()).toHaveAttribute(
    "href",
    "/docs/getting-started",
  );
  await expect(page.locator(".blog-explore a").last()).toHaveAttribute(
    "href",
    "https://github.com/farming-labs/farm.js",
  );
  await expect(
    page
      .getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", { name: /Blog/ }),
  ).toHaveAttribute("aria-current", "page");

  await page.locator(".blog-featured").click();
  await expect(page).toHaveURL(/\/blog\/farm-0-1$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("FarmJS v0.1.0");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("font-size", "42px");
  await expect(page.locator(".blog-art-version")).toHaveText("v0.1.0_");
  await expect(page.getByRole("heading", { name: /Keep exploring/ })).toHaveCount(1);
  await expect(page.locator(".blog-explore")).toHaveCSS("border-top-width", "1px");
  const hero = await page.locator(".blog-post-header").boundingBox();
  const art = await page.locator(".blog-release-art").boundingBox();
  expect(art!.x).toBeCloseTo(hero!.x + hero!.width / 2, 0);
  expect(art!.width).toBeCloseTo(hero!.width / 2, 0);
  expect(art!.y).toBe(hero!.y);
  expect(art!.height).toBeCloseTo(hero!.height - 1, 0);
  await expect(page.locator(".blog-art-corner")).toHaveCount(0);
  await expect(page.locator(".blog-ascii-field")).toHaveCSS(
    "mask-composite",
    /^intersect(?:, intersect)?$/,
  );
  const contents = page.locator(".blog-contents");
  await expect(contents.getByRole("navigation").getByRole("link")).toHaveCount(12);
  for (const href of await contents
    .getByRole("navigation")
    .getByRole("link")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")!))) {
    await expect(page.locator(href)).toHaveCount(1);
  }
  await contents.getByRole("link", { name: "Built with Farm: Viby" }).click();
  await expect(page.getByRole("heading", { name: "Built with Farm: Viby" })).toBeInViewport();
  await expect(page.getByRole("link", { name: "Explore the SDK", exact: true })).toHaveAttribute(
    "href",
    "https://viby.farming-labs.dev",
  );
  await expect(page.getByRole("link", { name: "Try the Viby demo", exact: true })).toHaveAttribute(
    "href",
    "https://viby-app.farming-labs.dev",
  );
  await contents.getByRole("link", { name: "Try it", exact: true }).click();
  await expect(page).toHaveURL(/#try-it$/);
  await expect(
    page.getByRole("heading", { level: 2, name: "Try it", exact: true }),
  ).toBeInViewport();
  await expect(contents.getByRole("link", { name: /Read Markdown/i })).toHaveAttribute(
    "href",
    "/blog/farm-0-1.md",
  );
  await expect(contents.getByRole("link", { name: /Read Markdown/i })).toHaveCSS(
    "text-transform",
    "uppercase",
  );
  await expect(contents.getByRole("link", { name: /View source/i })).toHaveAttribute(
    "href",
    "https://github.com/farming-labs/farm.js/blob/main/docs/src/app/blog/farm-0-1/page.md",
  );
  const markdown = await page.request.get("/blog/farm-0-1.md");
  expect(markdown.ok()).toBe(true);
  expect(await markdown.text()).toContain("# FarmJS v0.1.0: Stable, Integrated, and Agent-Native");
  expect(await markdown.text()).toContain("## Built with Farm: Viby");
  await contents.getByRole("link", { name: /Read Markdown/i }).click();
  await expect(page).toHaveURL(/\/blog\/farm-0-1\.md$/);
  await expect(page.locator("body")).toContainText("# FarmJS v0.1.0");
  await page.goBack();
  await page.getByRole("link", { name: "All posts" }).click();
  await expect(page).toHaveURL(/\/blog$/);
  expect(browserErrors).toEqual([]);
});

test("article sidebar tracks native navigation, reading position, pointer, and keyboard focus", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/blog/farm-0-1");
  const nav = page.locator(".blog-contents-links").first();
  const first = nav.getByRole("link", { name: "What stable means", exact: true });
  const integrations = nav.getByRole("link", { name: "Integrations", exact: true });
  const highlight = nav.locator(".blog-contents-highlight");
  await expect(first).toHaveAttribute("aria-current", "location");
  await expect(nav).toHaveAttribute("data-highlight-ready", "true");
  await integrations.click();
  await expect(integrations).toHaveAttribute("aria-current", "location");
  await expect(page).toHaveURL(/#an-integrations-ecosystem$/);
  await page.locator("#built-with-farm-viby").evaluate((section) => section.scrollIntoView());
  await expect(nav.getByRole("link", { name: "Built with Farm: Viby" })).toHaveAttribute(
    "aria-current",
    "location",
  );
  await first.hover();
  await expect
    .poll(async () => (await highlight.boundingBox())!.y)
    .toBe((await first.boundingBox())!.y);
  await expect(nav.getByRole("link", { name: "Built with Farm: Viby" })).toHaveAttribute(
    "aria-current",
    "location",
  );
  await first.focus();
  await page.keyboard.press("Tab");
  await expect(nav.getByRole("link", { name: "The app foundation" })).toBeFocused();
  await expect(nav).toHaveAttribute("data-input", "keyboard");
  await expect(highlight).toHaveCSS("transition-duration", "0s");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#the-app-foundation$/);
  await page.goBack();
  await expect(page).toHaveURL(/#an-integrations-ecosystem$/);
  await expect(integrations).toHaveAttribute("aria-current", "location");
  await page.goto("/blog/farm-0-1#built-with-farm-viby");
  await page.evaluate(() => document.fonts.ready);
  await expect(nav.getByRole("link", { name: "Built with Farm: Viby" })).toHaveAttribute(
    "aria-current",
    "location",
  );
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
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.locator(".blog-art-version").evaluate((version) => {
          const text = version.getBoundingClientRect();
          const artwork = version.closest(".blog-release-art")!.getBoundingClientRect();
          return text.left >= artwork.left && text.right <= artwork.right;
        }),
      ).toBe(true);
      const byline = await page.locator(".blog-featured-bottom .blog-author").boundingBox();
      const action = await page.locator(".blog-read-link").boundingBox();
      expect(byline).not.toBeNull();
      expect(action).not.toBeNull();
      expect(
        action!.x >= byline!.x + byline!.width || action!.y >= byline!.y + byline!.height,
      ).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.locator(".blog-featured").click();
      await expect(page).toHaveURL(/\/blog\/farm-0-1$/);
      await page.locator(".blog-mobile-contents summary").click();
      await page
        .locator(".blog-mobile-contents")
        .getByRole("link", { name: "Try it", exact: true })
        .click();
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
