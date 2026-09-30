---
title: "FarmJS 0.1: a stable, agent-native full-stack framework"
description: "FarmJS 0.1 is the first release with a compatibility promise. What stable means, what is still beta, and how FarmJS apps work for the agents reading and calling them."
---

# FarmJS 0.1: a stable, agent-native full-stack framework

KinfeMichael Tariku · October 2026

FarmJS 0.1 is out. It is the first release with a compatibility promise, and the first one I am comfortable calling stable.

That word needed a definition before I could use it, so here is what it means for 0.1.

## What stable means

Patch releases (`0.1.1`, `0.1.2`) fix bugs. They do not break stable APIs, configuration, generated route types, or production output.

A minor release (`0.2.0`) can change a stable API, but only after that API was deprecated in an earlier minor release, kept working, and documented with a migration path.

Experimental features stay opt-in. They can change in any release, and when they are off they cost nothing.

Not everything is stable yet, and I would rather say that plainly:

- **Stable:** core, the CLI, the app generator, devtools, the plugin API, and the first-party integrations. They release together at the same version.
- **Beta:** the Preact, Solid, Vue, and Svelte renderers, and most plugins. They work and are tested, but their APIs can still move.
- **Experimental:** React Server Components, Partial Prerendering, isolated hydration, the React compiler, WebMCP, federation, and WebAssembly components.

The full list lives on the [Stability and Support](https://farmjs.dev/docs/stability) page, including which deployment targets are verified and how.

## Built for the people and the agents using your app

More of the traffic hitting a product is not a person in a browser. It is an agent reading a page, calling an API, or acting on someone's behalf. I wanted FarmJS apps to handle that by default instead of as an afterthought.

### Every page has a Markdown version

Every route in a FarmJS app has a Markdown representation with no configuration. Ask for it with a `.md` suffix or an `Accept` header:

```bash
curl https://your-app.com/pricing.md
curl -H "Accept: text/markdown" https://your-app.com/pricing
```

A `page.tsx` route is rendered on the server and converted. A `page.md` or `page.mdx` route returns its source. If the generated version is not good enough, drop a `page.md` next to `page.tsx` and FarmJS serves that instead, while browsers still get the React page.

Missing routes answer agents in Markdown too, so a wrong guess gets a readable 404 instead of an HTML error page.

### Your API describes itself

Typed API routes produce an OpenAPI document, served as JSON at `/openapi.json` next to the rendered reference. Pages get a canonical URL and Open Graph defaults, and JSON-LD is one option away. An agent that lands on your app can find out what it does and how to call it.

### Agents inside your app

A chat endpoint is one command:

```bash
farm add integration ai
```

That writes a typed route:

```ts
import { aiChatRoute } from "@farm.js/ai";

export const POST = aiChatRoute({
  model: "openai/gpt-4o-mini",
  system: "You are a helpful assistant.",
});
```

For long-running, stateful agents, `@farm.js/cf-agent` connects [Cloudflare Agents](https://developers.cloudflare.com/agents/) to your app, and `@farm.js/eve` runs the Eve agent runtime beside it. Either way, the agent sits behind the same routing, middleware, and deployment as the rest of your app, instead of a second service with its own auth story.

### Tools the browser can hand to an agent

With the experimental `@farm.js/webmcp` plugin, a page can register typed tools that a browser agent can call:

```ts
import { defineWebMCPTool } from "@farm.js/webmcp/client";

export const searchProducts = defineWebMCPTool({
  name: "search_products",
  description: "Search products currently available in this store.",
  inputSchema: {
    type: "object",
    properties: { query: { type: "string", minLength: 1 } },
    required: ["query"],
  },
  annotations: { readOnlyHint: true },
  async execute({ query }: { query: string }) {
    const response = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
    return response.json();
  },
});
```

Tools are explicit and same-origin. Nothing is exposed unless you register it. WebMCP itself is still a Community Group draft, which is why this one is experimental.

### And for the agents writing the code

Routes, params, API calls, and configuration are typed and generated, so a coding agent's wrong guess fails at type-check instead of in production. `farm doctor` checks the Node version, configuration, routes, deployment target, and cron and storage setup in one command, and can probe a running deployment.

## How we earned "stable"

I did not want 0.1 to be a relabelled beta, so most of the last stretch went into proving the release, not adding features.

Every release now installs representative integrations and a freshly generated app from the packed tarballs, the way a user gets them, then type-checks, builds, and serves that app. Workspace links hide missing files and bad version pins; tarballs do not.

We also ran deployment output in the real runtimes instead of trusting build logs. Booting Cloudflare output in `workerd`, Cloudflare's runtime, turned up two bugs no unit test could have caught: React apps on the `cloudflare-module` preset could not start at all, and a fix meant to give edge targets React's Web streaming build was being silently dropped from the build config. Both are fixed, and both now have build-level tests.

The rest was a lot of small, unglamorous fixes: malformed request bodies that returned 500 instead of 400, a storage dependency that let fresh installs close a database the app still owned, and a Content Security Policy warning that stayed quiet for policies that break hydration.

## What is not there yet

- **Strict script CSP.** FarmJS's inline hydration scripts do not carry nonces yet, so `script-src` has to allow `'unsafe-inline'`. Per-request nonces are next.
- **Netlify and Cloudflare** are beta targets: their builds are tested, but only Node and Vercel are stable.
- **MCP from your API.** Generating an MCP server from typed API routes is the next agent feature I want to ship, as an experimental plugin.

## Try it

```bash
pnpm create @farm.js/app my-app
```

Upgrading from a beta is one command, `farm upgrade --latest`, and the [upgrade guide](https://farmjs.dev/docs/upgrading) lists the behavior changes and the deprecated APIs to move off before 0.2.

If something breaks, `farm doctor` output and an issue on [GitHub](https://github.com/farming-labs/farm.js/issues) is the fastest way to reach me. Thanks to everyone who ran the betas and told me what was wrong.

---

This post is a `page.md` route in a FarmJS app. Append `.md` to its URL to read it the way an agent does.
