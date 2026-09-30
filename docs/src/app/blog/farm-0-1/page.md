---
title: "FarmJS 0.1: Stable, Integrated, and Agent-Native"
description: "FarmJS 0.1 is the first release with a compatibility promise. A tour of what shipped: DevTools, the plugin and integration ecosystems, five renderers, a CLI that explains your app, and apps built for agents."
---

# FarmJS 0.1: Stable, Integrated, and Agent-Native

KinfeMichael Tariku · October 2026

FarmJS 0.1 is out. It is the first release with a compatibility promise, and the first one I am comfortable calling stable.

It is also a good moment to show everything that landed during the betas, because FarmJS is a lot more than a router now. There is a DevTools workspace, an ecosystem of plugins and product integrations, five renderers, a CLI that explains and repairs your app, and apps that work for the agents reading and calling them.

## What stable means

Patch releases (`0.1.1`, `0.1.2`) fix bugs. They do not break stable APIs, configuration, generated route types, or production output.

A minor release (`0.2.0`) can change a stable API, but only after that API was deprecated in an earlier minor release, kept working, and documented with a migration path. Experimental features stay opt-in, can change in any release, and cost nothing when they are off.

- **Stable:** core, the CLI, the app generator, DevTools, the plugin API, and the first-party integrations. They release together at the same version.
- **Beta:** the Preact, Solid, Vue, and Svelte renderers, and most plugins. Tested and supported, but their APIs can still move.
- **Experimental:** React Server Components, Partial Prerendering, isolated hydration, the React compiler, WebMCP, federation, and WebAssembly components.

The full breakdown, including which deployment targets are verified and how, is on the [Stability and Support](https://farmjs.dev/docs/stability) page.

## The app foundation

The parts every product needs, typed end to end:

- **App-directory routing** with generated route types, layouts, route groups, and loading and error boundaries.
- **Typed APIs and data.** API routes produce a typed client (`apiClient.hello.get()`), and server queries give you deduplicated, prefetchable, invalidatable reads defined once on the server.
- **Rendering control.** Streaming SSR, static generation, ISR-style revalidation, shared cache helpers with tag and path invalidation, and per-route runtime, region, and duration hints.
- **Built-ins you would otherwise assemble:** internationalization with typed ICU messages and RTL, light and dark themes with a pre-paint selector, responsive images, self-hosted fonts, cron schedules that compile to each platform's native triggers, `after()` for post-response work, a KV storage layer, and layers for sharing app directories between projects.

## Five renderers, one framework

React is the default. Preact, Solid, Vue, and Svelte use the same routing, APIs, middleware, integrations, and deployment. You can pick a renderer when you create an app:

```bash
pnpm create @farm.js/app my-app --template basic --renderer vue
```

The other four are beta in 0.1, and a test-checked [capability matrix](https://farmjs.dev/docs/renderers) shows exactly what each one supports, including streaming per deployment target.

## An integrations ecosystem

Most products are the same dozen services wired together. FarmJS integrations are typed packages that mount their routes, webhooks, client bindings, and configuration through one model, and `farm add integration` scaffolds them:

```bash
farm add integration stripe
```

What is available in 0.1:

- **Auth:** Better Auth, Auth.js, Clerk, Auth0, WorkOS, and Supabase, plus Farm's built-in auth.
- **Billing:** Stripe, Autumn, and Polar.
- **Email:** Resend.
- **Background jobs:** Trigger.dev and Inngest.
- **Content:** Sanity and Contentful.
- **API keys:** Unkey.
- **AI and agents:** AI SDK chat routes, Cloudflare Agents, and Eve.

Integrations can also scaffold working screens through a shadcn-style UI registry, and schema-backed integrations can share your relational models through [@farming-labs/orm](https://orm.farming-labs.dev).

## A plugin ecosystem, starting with DevTools

**DevTools** ships in every new app. Open it from the button in the corner or with `Cmd + Shift + .` to browse your routes and their runtime settings, inspect configured integrations, read runtime diagnostics, and compare your source with the JavaScript Vite actually served.

```ts
import { defineConfig } from "@farm.js/core";
import { devtools } from "@farm.js/devtools";
import { hints } from "@farm.js/hints";

export default defineConfig({
  plugins: [devtools(), hints()],
});
```

The rest of the official plugins:

- **Hints** finds accessibility, performance, and HTML problems in the live development page.
- **Analyzer** explains page, client, and server bundle size and enforces limits in CI.
- **Content** validates local Markdown, MDX, JSON, and YAML as typed collections.
- **Search** builds a chunked browser search index from your static pages.
- **PWA** generates a route-aware service worker for offline navigation and safe updates.
- **Sync** and the local-first patterns add instant cached reads, optimistic writes, and reconnect recovery on top of the API you already have.
- **Scripts** and **Partytown** load third-party SDKs with typed handles and consent, or move them off the main thread.
- **Sentry** and **OpenTelemetry** report errors and traces with Farm's route and event context.
- **StyleX**, **MSW**, **WebAssembly**, **federation**, and **WebMCP** cover styling, mocking, Wasm, independently deployed modules, and browser agent tools.

## A CLI that explains your app

- `farm doctor` checks your Node version, configuration, routes, deployment target, cron, and storage, and can probe a running deployment with `--url`.
- `farm explain /some/path` tells you which route handles a URL and where it runs.
- `farm preview` gives your local app a public URL for webhooks, OAuth callbacks, and testing on a phone.
- `farm migrate next` and `farm migrate tanstack` move an existing Next.js App Router or TanStack Start project over. Nuxt and SvelteKit have migration guides.
- `farm upgrade --latest` keeps every Farm package on the same release.

## Built for agents too

More of the traffic hitting a product is an agent reading a page, calling an API, or acting on someone's behalf. FarmJS apps handle that by default.

**Every page has a Markdown version,** with no configuration. Ask with a `.md` suffix or an `Accept` header:

```bash
curl https://your-app.com/pricing.md
curl -H "Accept: text/markdown" https://your-app.com/pricing
```

A `page.tsx` route is rendered and converted; a `page.md` route returns its source; a `page.md` next to a `page.tsx` overrides the generated version while browsers still get the React page. Missing routes answer agents in Markdown too.

**Your API describes itself.** Typed API routes produce an OpenAPI document at `/openapi.json`, pages get canonical and Open Graph defaults, and JSON-LD is one option away.

**Agents can live inside your app.** A chat endpoint is one command, `farm add integration ai`, which writes:

```ts
import { aiChatRoute } from "@farm.js/ai";

export const POST = aiChatRoute({
  model: "openai/gpt-4o-mini",
  system: "You are a helpful assistant.",
});
```

For long-running, stateful agents, Cloudflare Agents and Eve run behind the same routing, middleware, and deployment as the rest of your app. With the experimental WebMCP plugin, a page can register explicit, typed tools that a browser agent can call.

**And for the agents writing your code,** routes, params, API calls, and configuration are typed and generated, so a wrong guess fails at type-check instead of in production.

## Deploy where you already are

`deploy.target` maps to a tested Nitro output: `node` and `vercel` are stable, `cloudflare` and `netlify` are beta, and any other Nitro preset passes through. `farm deploy` wraps the platform CLIs for Vercel, Cloudflare, and Netlify.

## How we earned "stable"

I did not want 0.1 to be a relabelled beta, so the last stretch went into proving the release rather than adding features.

Every release now installs representative integrations and a freshly generated app from the packed tarballs, the way a user gets them, then type-checks, builds, and serves that app. That check paid for itself immediately: while cutting the release candidate it caught our own integration smoke test quietly installing core from npm instead of the new build.

We also ran deployment output in real runtimes instead of trusting build logs. Booting Cloudflare output in `workerd`, Cloudflare's runtime, turned up two bugs no unit test could have caught: React apps on the `cloudflare-module` preset could not start, and a fix meant to give edge targets React's Web streaming build was being silently dropped from the build config. Both are fixed and covered by build-level tests.

The rest was unglamorous and necessary: malformed request bodies that returned 500 instead of 400, a storage dependency that let fresh installs close a database the app still owned, and a Content Security Policy warning that stayed quiet for policies that break hydration.

## What is not there yet

- **Strict script CSP.** Inline hydration scripts do not carry nonces yet, so `script-src` has to allow `'unsafe-inline'`. Per-request nonces are next.
- **Netlify and Cloudflare** builds are tested, but only Node and Vercel are stable targets.
- **MCP from your API.** Generating an MCP server from typed API routes is the next agent feature, as an experimental plugin.

## Try it

```bash
pnpm create @farm.js/app my-app
```

Coming from a beta, `farm upgrade --latest` and the [upgrade guide](https://farmjs.dev/docs/upgrading) cover the behavior changes and the deprecated APIs to move off before 0.2.

If something breaks, `farm doctor` output and an issue on [GitHub](https://github.com/farming-labs/farm.js/issues) is the fastest way to reach me. Thanks to everyone who ran the betas and told me what was wrong.

---

This post is a `page.md` route in a FarmJS app. Append `.md` to its URL to read it the way an agent does.
