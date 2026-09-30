// Enhance SSR code without moving the highlighter or its grammars into the client.
(() => {
  for (const block of document.querySelectorAll(".blog-prose .blog-code-block")) {
    const button = block.querySelector(".blog-code-copy");
    const code = block.querySelector("pre > code");
    const label = block.querySelector("[data-copy-label]");
    const status = block.querySelector("[data-copy-status]");
    if (!button || !code || !label || !status || button.dataset.copyReady) continue;
    button.dataset.copyReady = "true";
    button.hidden = false;
    const copyLabel = button.getAttribute("aria-label");
    let timer;
    button.addEventListener("click", async () => {
      clearTimeout(timer);
      button.disabled = true;
      try {
        await navigator.clipboard.writeText(code.textContent);
        button.dataset.state = "copied";
        label.textContent = "Copied";
        status.textContent = "Code copied to clipboard.";
      } catch {
        button.dataset.state = "error";
        label.textContent = "Retry";
        status.textContent = "Could not copy. Try again or select and copy the code manually.";
      } finally {
        button.disabled = false;
        button.setAttribute("aria-label", `${label.textContent} code`);
        timer = setTimeout(() => {
          delete button.dataset.state;
          label.textContent = "Copy";
          status.textContent = "";
          button.setAttribute("aria-label", copyLabel);
        }, 1800);
      }
    });
  }
})();
