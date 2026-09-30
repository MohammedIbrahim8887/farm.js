// Progressive enhancement for the server-rendered Markdown article. Native
// anchors remain usable without JavaScript; scrolling and history stay native.
(() => {
  const navigation = [...document.querySelectorAll(".blog-contents-links")];
  if (!navigation.length) return;

  const sections = [...navigation[0].querySelectorAll("a[href^='#']")]
    .map((link) => document.getElementById(link.hash.slice(1)))
    .filter(Boolean);
  if (!sections.length) return;

  let activeId = sections[0].id;
  let frame = 0;
  const updateNavigation = navigation.map((nav) => {
    const links = [...nav.querySelectorAll("a")];
    const highlight = nav.querySelector(".blog-contents-highlight");
    let pointerLink = null;
    let focusedLink = null;

    function update() {
      const current = links.find((link) => link.hash === `#${activeId}`);
      for (const link of links) {
        if (link === current) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      }
      const target = focusedLink ?? pointerLink ?? current;
      if (!target || !highlight || !nav.offsetHeight) return;
      highlight.style.transform = `translateY(${target.offsetTop}px)`;
      highlight.style.height = `${target.offsetHeight}px`;
      nav.dataset.highlightReady = "true";
    }

    for (const link of links) {
      link.addEventListener("pointerenter", (event) => {
        if (
          event.pointerType !== "mouse" ||
          !matchMedia("(hover: hover) and (pointer: fine)").matches
        )
          return;
        nav.dataset.input = "pointer";
        pointerLink = link;
        focusedLink = null;
        update();
      });
      link.addEventListener("focus", () => {
        if (!link.matches(":focus-visible")) return;
        nav.dataset.input = "keyboard";
        focusedLink = link;
        pointerLink = null;
        update();
      });
      link.addEventListener("blur", () => {
        focusedLink = null;
        update();
      });
    }
    function clearPointer() {
      pointerLink = null;
      update();
    }
    nav.addEventListener("pointerleave", clearPointer);
    nav.addEventListener("pointercancel", clearPointer);
    new ResizeObserver(update).observe(nav);
    return update;
  });

  function updateSection() {
    frame = 0;
    activeId = sections[0].id;
    // Native fragment scrolling combines the document's scroll padding with
    // the target's scroll margin. Allow a small reading-line buffer for font
    // metrics settling just after the browser lands on an initial fragment.
    const scrollPadding =
      parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    for (const section of sections) {
      const scrollMargin = parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
      if (section.getBoundingClientRect().top <= scrollPadding + scrollMargin + 16)
        activeId = section.id;
    }
    for (const update of updateNavigation) update();
  }
  function scheduleUpdate() {
    if (!frame) frame = requestAnimationFrame(updateSection);
  }
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("hashchange", scheduleUpdate);
  window.addEventListener("pageshow", scheduleUpdate);
  updateSection();
})();
