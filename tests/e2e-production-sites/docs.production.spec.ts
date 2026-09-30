import { access, readFile } from "node:fs/promises";
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

test("blog connects the index, article, contents, and Markdown mirror", async ({ page }) => {
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/blog");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("The Farm.js blog.");
  await expect(page.getByRole("heading", { level: 2, name: /Latest posts/ })).toBeVisible();
  await expect(page.locator(".blog-featured h3 br")).toHaveCount(0);
  await expect(page.locator(".blog-featured h3 a > span")).toHaveCSS("display", "inline");
  await expect(page.locator(".blog-featured h3")).toHaveCSS("text-wrap", "balance");
  await expect(page.getByRole("link", { name: /Follow the releases/i })).toHaveCount(0);
  await expect(page.locator(".blog-art-version")).toHaveAttribute("data-version", "v 0.1.0");
  await expect(page.locator(".blog-post-meta time")).toHaveText("Sep 2026");
  await expect(page.locator(".blog-post-meta time")).toHaveCSS("font-family", /Geist Sans/);
  await expect(page.locator(".blog-author-profile")).toHaveAttribute(
    "href",
    "https://x.com/KinfishT",
  );
  await expect(page.getByRole("link", { name: "Farming Labs", exact: true })).toHaveAttribute(
    "href",
    "https://github.com/farming-labs",
  );
  await expect(page.getByText("RELEASE NOTES / 001", { exact: true })).toHaveCount(0);
  for (const selector of [".blog-section-rule", ".blog-explore"]) {
    await expect(page.locator(selector)).toHaveCSS("border-bottom-width", "0px");
    expect(
      await page.locator(selector).evaluate((el) => getComputedStyle(el, "::after").height),
    ).toBe("1px");
  }
  await expect(page.locator(".blog-featured a a")).toHaveCount(0);
  await expect(page.locator(".blog-featured-bottom .blog-author-name")).toHaveText(
    "KinfeMichael Tariku",
  );
  await expect(page.locator(".blog-featured-bottom img")).toHaveAttribute("width", "36");
  await expect(page.locator(".blog-author small")).toHaveCSS("margin-top", "0px");
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
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Farm.js v0.1.0");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("font-size", "36px");
  await expect(page.locator(".blog-post-heading h1 br")).toHaveCount(0);
  await expect(page.locator(".blog-post-heading h1")).toHaveCSS("text-wrap", "balance");
  const back = page.getByRole("link", { name: "All posts", exact: true });
  await expect(back).toHaveText("");
  await expect(back).toHaveAttribute("href", "/blog");
  await expect(back).toHaveCSS("width", "44px");
  await expect(back).toHaveCSS("height", "44px");
  await expect(page.locator(".blog-art-version")).toHaveAttribute("data-version", "v 0.1.0");
  await expect(page.getByText("RELEASE NOTES / 001", { exact: true })).toHaveCount(0);
  await expect(page.locator(".blog-explore")).toHaveCSS("border-bottom-width", "0px");
  await expect(page.locator(".blog-post-heading > p")).toHaveText(
    "Our first stable release. Built for apps and agents.",
  );
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
  await expect(contents).toHaveCSS("width", "280px");
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
  await expect(page.getByRole("group", { name: "Article resources" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Read Markdown/i })).toHaveCount(0);
  await expect(contents.getByRole("link", { name: /View source/i })).toHaveCount(0);
  await expect(page.getByText("This post is a", { exact: false })).toHaveCount(0);
  const markdown = await page.request.get("/blog/farm-0-1.md");
  expect(markdown.ok()).toBe(true);
  expect(await markdown.text()).toContain("# Farm.js v0.1.0: Stable, Integrated, and Agent-Native");
  expect(await markdown.text()).toContain("## Built with Farm: Viby");
  await page.goto("/blog/farm-0-1.md");
  await expect(page).toHaveURL(/\/blog\/farm-0-1\.md$/);
  await expect(page.locator("body")).toContainText("# Farm.js v0.1.0");
  await page.goBack();
  await page.getByRole("link", { name: "All posts" }).click();
  await expect(page).toHaveURL(/\/blog$/);
  expect(browserErrors).toEqual([]);
});

test("blog uses Farm.js branding, lighter reading weights, and complete launch guidance", async ({
  page,
}) => {
  await page.goto("/blog");
  await expect(page.locator(".blog-featured h3")).toContainText("Farm.js v0.1.0");
  await expect(page.locator("body")).not.toContainText("FarmJS");
  await page.locator(".blog-read-link").click();
  await expect(page).toHaveTitle("Farm.js v0.1.0: Stable, Integrated, and Agent-Native");
  await expect(page.locator("body")).not.toContainText("FarmJS");
  const prose = page.locator(".blog-prose");
  await expect(prose).toContainText("Node.js 22.13 or newer");
  await expect(prose).toContainText(
    "Browser references require the experimental server-function transform",
  );
  await expect(prose).toContainText("It does not have to live under Farming Labs.");
  await expect(prose).toContainText("farm upgrade --latest --dry-run");
  await expect(prose).toContainText(
    "removes its UI, launcher, and inspection endpoints from production output",
  );
  for (const detail of [
    "agent: eve()",
    "useEveAgent()",
    "Eve requires Node.js 24 or newer",
    "agent: cfAgent()",
    "useAgent()",
    "Cloudflare remains a beta deployment target",
    "EVE_BASE_URL / CF_AGENT_ORIGIN",
    "Other agent frameworks fit through ordinary APIs",
    "Same-origin routing is not authentication",
  ]) {
    await expect(prose).toContainText(detail);
  }
  for (const [label, path] of [
    ["Eve guide", "/docs/integrations/eve"],
    ["Cloudflare Agents guide", "/docs/integrations/cf-agent"],
    ["API route", "/docs/api-routes"],
  ]) {
    await expect(prose.getByRole("link", { name: label, exact: true })).toHaveAttribute(
      "href",
      `https://farmjs.dev${path}`,
    );
  }
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(page.locator(".blog-author small")).toHaveCSS("margin-top", "0px");
    await expect(prose.locator("p").filter({ hasText: /^Farm\.js 0\.1 is out/ })).toHaveCSS(
      "font-weight",
      "300",
    );
    await expect(prose.locator("p").filter({ hasText: /^Patch releases/ })).toHaveCSS(
      "font-weight",
      "300",
    );
    await expect(prose.locator("li").first()).toHaveCSS("font-weight", "300");
    await expect(prose.locator("h2").first()).toHaveCSS("font-weight", "400");
    await expect(prose.locator("strong").first()).toHaveCSS("font-weight", "450");
    await expect(prose.locator("pre").first()).toHaveCSS("font-weight", "400");
    await expect(prose).toHaveCSS("font-size", width === 1440 ? "16px" : "15px");
  }
  for (const path of ["/blog.md", "/blog/farm-0-1.md"]) {
    const response = await page.request.get(path);
    expect(response.ok()).toBe(true);
    const markdown = await response.text();
    expect(markdown).toContain("Farm.js v0.1.0");
    expect(markdown).not.toContain("FarmJS");
    if (path === "/blog/farm-0-1.md") {
      expect(markdown).toContain("agent: eve()");
      expect(markdown).toContain("agent: cfAgent()");
      expect(markdown).toContain("Other agent frameworks fit through ordinary APIs");
    }
  }
  const source = await readFile("docs/src/app/blog/farm-0-1/page.md", "utf8");
  const guides = new Set(
    [...source.matchAll(/https:\/\/farmjs\.dev(\/docs\/[^)#\s]+)/g)].map((match) => match[1]),
  );
  for (const path of guides) await access(`docs/src/app${path}/page.md`);
});

test("blog enhancements survive client navigation, re-entry, and back/forward without reloads", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.evaluate(() => {
    Reflect.set(window, "blogNavigationDocument", true);
    Reflect.set(window, "blogCopyCalls", 0);
    const writeText = navigator.clipboard.writeText.bind(navigator.clipboard);
    navigator.clipboard.writeText = (text) => {
      Reflect.set(window, "blogCopyCalls", Reflect.get(window, "blogCopyCalls") + 1);
      return writeText(text);
    };
  });

  async function checkArtwork() {
    expect(await page.evaluate(() => Reflect.get(window, "blogNavigationDocument"))).toBe(true);
    await expect(page.locator(".blog-release-art")).toHaveAttribute("data-motion", "running");
    await expect(page.locator(".blog-art-reel").first()).toHaveCSS(
      "animation-name",
      "blog-digit-roll",
    );
    expect(
      await page.evaluate(() => {
        const oldArticle = Reflect.get(window, "previousBlogArticle") as HTMLElement | undefined;
        return (
          !oldArticle ||
          (!oldArticle.isConnected &&
            [...oldArticle.querySelectorAll<HTMLButtonElement>(".blog-code-copy")].every(
              (button) => button.hidden && !button.disabled,
            ) &&
            [...oldArticle.querySelectorAll("[data-copy-status]")].every(
              (status) => !status.textContent,
            ))
        );
      }),
    ).toBe(true);
  }

  async function checkArticle() {
    await expect(page).toHaveURL(/\/blog\/farm-0-1$/);
    await checkArtwork();
    await expect(page.locator(".blog-code-copy:visible")).toHaveCount(6);
    const nav = page.locator(".blog-contents-links").first();
    const link = nav.getByRole("link", { name: "Built with Farm: Viby" });
    await link.click();
    await expect(link).toHaveAttribute("aria-current", "location");
    await expect(nav).toHaveAttribute("data-highlight-ready", "true");
    const block = page.locator(".blog-code-block").first();
    const calls = await page.evaluate(() => Reflect.get(window, "blogCopyCalls"));
    await block.getByRole("button").click();
    await expect(block.getByRole("status")).toHaveText("Code copied to clipboard.");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      await block.locator("pre > code").textContent(),
    );
    expect(await page.evaluate(() => Reflect.get(window, "blogCopyCalls"))).toBe(calls + 1);
    await page.evaluate(() =>
      Reflect.set(window, "previousBlogArticle", document.querySelector(".blog-reading-grid")),
    );
  }

  await page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: /Blog/ })
    .click();
  await checkArtwork();
  await page.locator(".blog-read-link").click();
  await checkArticle();
  await page.getByRole("link", { name: "All posts", exact: true }).click();
  await checkArtwork();
  await page.locator(".blog-read-link").click();
  await checkArticle();
  await page.getByRole("link", { name: "All posts", exact: true }).click();
  await page.goBack();
  await expect(page.locator(".blog-code-copy:visible")).toHaveCount(6);
  await expect(page.locator(".blog-contents-links").first()).toHaveAttribute(
    "data-highlight-ready",
    "true",
  );
  await page.goForward();
  await checkArtwork();
  expect(errors).toEqual([]);
});

test("shared artwork rolls down, waves, pauses offscreen, and respects reduced motion", async ({
  page,
}) => {
  for (const path of ["/blog", "/blog/farm-0-1"]) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    const art = page.locator(".blog-release-art");
    const version = art.locator(".blog-art-version");
    await expect(art).toHaveAttribute("data-motion", "running");
    await expect(version.locator(".blog-art-value")).toHaveText(["0", "1", "0"]);
    await expect(version.locator(".blog-art-dot")).toHaveCount(2);
    const reels = art.locator(".blog-art-reel");
    await expect(reels).toHaveCount(3);
    await expect(reels.first()).toHaveCSS("animation-iteration-count", "1");
    await expect
      .poll(() => reels.last().evaluate((el) => el.getAnimations()[0].playState))
      .toBe("finished");
    const bounds = await version.boundingBox();
    for (const time of [0, 450, 1800]) {
      const offsets = await reels.evaluateAll(
        (elements, elapsed) =>
          elements.map((el) => {
            const animation = el.getAnimations()[0];
            animation.pause();
            animation.currentTime = elapsed;
            return new DOMMatrix(getComputedStyle(el).transform).m42;
          }),
        time,
      );
      if (time < 1800) expect(offsets.every((offset) => offset < 0)).toBe(true);
      else expect(offsets.every((offset) => offset === 0)).toBe(true);
      expect(await version.boundingBox()).toEqual(bounds);
    }
    const row = art.locator(".blog-ascii-row").first();
    await expect(row).toHaveCSS("animation-iteration-count", "infinite");
    const wave = [];
    for (const time of [0, 3000]) {
      wave.push(
        await row.evaluate((el, elapsed) => {
          const animation = el.getAnimations()[0];
          animation.pause();
          animation.currentTime = elapsed;
          return new DOMMatrix(getComputedStyle(el).transform).m41;
        }, time),
      );
    }
    expect(wave[0]).toBeLessThan(0);
    expect(wave[1]).toBeGreaterThan(0);
    const cursor = version.locator(".blog-art-cursor");
    for (const [time, opacity] of [
      [100, "1"],
      [700, "0"],
      [1300, "1"],
    ] as const) {
      await cursor.evaluate((el, elapsed) => {
        const animation = el.getAnimations()[0];
        animation.pause();
        animation.currentTime = elapsed;
      }, time);
      await expect(cursor).toHaveCSS("opacity", opacity);
    }
    await page.setViewportSize({ width: 1440, height: 400 });
    await page.locator("footer").scrollIntoViewIfNeeded();
    await expect(art).not.toBeInViewport();
    await expect(art).toHaveAttribute("data-motion", "paused");
    await expect(row).toHaveCSS("animation-play-state", "paused");
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await art.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
    await expect(reels.first()).toHaveCSS("display", "none");
    await expect(version.locator(".blog-art-value").first()).toHaveCSS("visibility", "visible");
  }
});

test("every code block copies exact source and exposes recoverable clipboard failure", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/blog");
  await page.locator(".blog-read-link").click();
  const blocks = page.locator(".blog-code-block");
  await expect(blocks).toHaveCount(6);
  for (const block of await blocks.all()) {
    const text = await block.locator("pre > code").textContent();
    const button = block.getByRole("button");
    await expect(button).toBeVisible();
    const bounds = await button.boundingBox();
    await button.click();
    await expect(button).toHaveText("COPIED");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(text);
    expect((await button.boundingBox())!.width).toBe(bounds!.width);
    await expect(block.getByRole("status")).toHaveText("Code copied to clipboard.");
  }
  await page.evaluate(() => {
    Object.defineProperty(navigator.clipboard, "writeText", {
      configurable: true,
      value: () => Promise.reject(new Error("denied")),
    });
  });
  const first = blocks.first();
  await first.getByRole("button").click();
  await expect(first.getByRole("button")).toHaveText("RETRY");
  await expect(first.getByRole("status")).toContainText("Could not copy");
  await expect(first.getByRole("button")).toHaveText("COPY");
  await page.evaluate(() => {
    delete (navigator.clipboard as unknown as { writeText?: unknown }).writeText;
  });
  await first.getByRole("button").focus();
  await page.keyboard.press("Enter");
  await expect(first.getByRole("button")).toHaveText("COPIED");
});

test("blog syntax highlighting is server-rendered and preserves every fenced code sample", async ({
  browser,
  baseURL,
}) => {
  const source = await readFile("docs/src/app/blog/farm-0-1/page.md", "utf8");
  const fences = Array.from(source.matchAll(/^```(\w+)\n([\s\S]*?)^```/gm));
  expect(fences).toHaveLength(6);
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("/blog/farm-0-1");
    const blocks = page.locator(".blog-prose pre > code");
    await expect(blocks).toHaveCount(fences.length);
    for (const [index, [, language, code]] of fences.entries()) {
      const block = blocks.nth(index);
      await expect(block).toHaveAttribute("class", `language-${language}`);
      await expect(block).toHaveAttribute("data-highlighted", "true");
      expect(await block.textContent()).toBe(code);
      const colors = await block
        .locator("span")
        .evaluateAll((tokens) => [
          ...new Set(tokens.map((token) => getComputedStyle(token).color)),
        ]);
      expect(colors.length).toBeGreaterThan(1);
    }
    await expect(page.getByRole("link", { name: /Read Markdown/i })).toHaveCount(0);
  } finally {
    await context.close();
  }
});

test("article sidebar tracks native navigation, reading position, pointer, and keyboard focus", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/blog/farm-0-1");
  await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
  const nav = page.locator(".blog-contents-links").first();
  const first = nav.getByRole("link", { name: "What stable means", exact: true });
  const integrations = nav.getByRole("link", { name: "Integrations", exact: true });
  const highlight = nav.locator(".blog-contents-highlight");
  const indicator = nav.locator(".blog-contents-indicator");
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
  const activeBounds = (await nav
    .getByRole("link", { name: "Built with Farm: Viby" })
    .boundingBox())!;
  await expect
    .poll(async () => (await indicator.boundingBox())!.y)
    .toBeCloseTo(activeBounds.y + (activeBounds.height - 18) / 2, 1);
  const markerPosition = await indicator.boundingBox();
  await first.hover();
  await expect
    .poll(async () => (await highlight.boundingBox())!.y)
    .toBe((await first.boundingBox())!.y);
  expect(await indicator.boundingBox()).toEqual(markerPosition);
  await expect(nav.getByRole("link", { name: "Built with Farm: Viby" })).toHaveAttribute(
    "aria-current",
    "location",
  );
  // Revisit the named anchor before testing history, so browser-specific
  // manual-scroll restoration policy cannot change the expected destination.
  await integrations.click();
  await expect(integrations).toHaveAttribute("aria-current", "location");
  await first.focus();
  await page.keyboard.press("Tab");
  await expect(nav.getByRole("link", { name: "The app foundation" })).toBeFocused();
  await expect(nav).toHaveAttribute("data-input", "keyboard");
  await expect(highlight).toHaveCSS("transition-duration", "0s");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#the-app-foundation$/);
  await expect(nav.getByRole("link", { name: "The app foundation" })).toHaveAttribute(
    "aria-current",
    "location",
  );
  await page.goBack();
  await expect(page).toHaveURL(/#an-integrations-ecosystem$/);
  await expect(integrations).toHaveAttribute("aria-current", "location");
  await page.goto("/blog/farm-0-1#built-with-farm-viby");
  await page.evaluate(() => document.fonts.ready);
  await expect(nav.getByRole("link", { name: "Built with Farm: Viby" })).toHaveAttribute(
    "aria-current",
    "location",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.mouse.move(1000, 300);
  await page.mouse.wheel(0, 120);
  await expect(nav).toHaveAttribute("data-input", "scroll");
  await expect(indicator).toHaveCSS("transition-duration", "0.22s");
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
      await expect(page.locator(".blog-code-copy:visible")).toHaveCount(0);
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
