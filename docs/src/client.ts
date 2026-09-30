import { defineClient } from "@farm.js/core/client/lifecycle";
import { enhanceArtwork } from "./components/blog/artwork-motion";
import { enhanceCodeBlocks } from "./components/blog/code-copy";
import { enhanceContents } from "./components/blog/contents-navigation";

export default defineClient({
  setup() {
    const mounted = new Map<HTMLElement, () => void>();
    function refresh() {
      for (const [element, dispose] of mounted) {
        if (!element.isConnected) {
          dispose();
          mounted.delete(element);
        }
      }
      for (const element of document.querySelectorAll<HTMLElement>(
        ".farm-blog .blog-release-art, .farm-blog .blog-reading-grid",
      )) {
        if (mounted.has(element)) continue;
        if (element.matches(".blog-release-art")) {
          mounted.set(element, enhanceArtwork(element));
        } else {
          const disposeContents = enhanceContents(element);
          const disposeCode = enhanceCodeBlocks(element);
          mounted.set(element, () => {
            disposeContents?.();
            disposeCode();
          });
        }
      }
    }
    // Setup covers initial HTML; rendered covers route entry and history.
    refresh();
    return {
      refresh,
      dispose() {
        for (const dispose of mounted.values()) dispose();
        mounted.clear();
      },
    };
  },
  hydration: {
    after({ state }) {
      state.refresh();
    },
  },
  navigation: {
    rendered({ state }) {
      state.refresh();
    },
  },
  close({ state }) {
    state.dispose();
  },
});
