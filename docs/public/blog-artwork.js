// CSS owns the motion; pause decorative work offscreen and in background tabs.
(() => {
  if (!("IntersectionObserver" in window)) return;
  const visible = new Set();
  const artwork = document.querySelectorAll(".blog-release-art");
  function update() {
    for (const element of artwork) {
      element.dataset.motion = !document.hidden && visible.has(element) ? "running" : "paused";
    }
  }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    update();
  });
  for (const element of artwork) observer.observe(element);
  document.addEventListener("visibilitychange", update);
})();
