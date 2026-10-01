import { defineConfig } from "@farm.js/core";
import { devtools } from "@farm.js/devtools";
import { withDocs } from "@farming-labs/farmjs/config";

export default withDocs(
  defineConfig({
    plugins: [devtools()],
    mdx: {
      components: "./src/markdown-components.tsx",
    },
    async headers() {
      return [
        {
          source: "/:path*",
          headers: [
            { key: "X-Frame-Options", value: "DENY" },
            { key: "X-Content-Type-Options", value: "nosniff" },
          ],
        },
      ];
    },
    deploy: {
      target: "vercel",
    },
  }),
  {
    codeBlockThemes: {
      light: "github-light-default",
      dark: "vesper",
    },
  },
);
