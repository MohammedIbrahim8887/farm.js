---
title: "Farm.js v0.1.0: Stable, Integrated, and Agent-Native"
description: "Our first stable release. Built for apps and agents."
---

# Farm.js v0.1.0: Stable, Integrated, and Agent-Native

KinfeMichael Tariku · Sep 2026

Farm.js 0.1 is out. It is the first release with a compatibility promise, and the first one I am comfortable calling stable.

It is also a good moment to show everything that landed during the betas, because Farm.js is a lot more than a router now. There is a DevTools workspace, an ecosystem of plugins and product integrations, five renderers, a CLI that explains and repairs your app, and apps that work for the agents reading and calling them.

<span id="what-stable-means" className="blog-heading-anchor" />

## What stable means

Patch releases (`0.1.1`, `0.1.2`) fix bugs. They do not break stable APIs, configuration, generated route types, or production output. Security fixes can tighten previously unsafe behavior; those changes are called out in the release notes.

A minor release (`0.2.0`) can change a stable API, but only after that API was deprecated in an earlier minor release, kept working, and documented with a migration path. Experimental features stay opt-in, can change in any release, and cost nothing when they are off.

- **Stable:** core, the CLI, the app generator, DevTools, the plugin API, and the first-party integrations. They release together at the same version.
- **Beta:** the Preact, Solid, Vue, and Svelte renderers, the separate `@farm.js/react` compiler/runtime package, and most plugins. Tested and supported, but their APIs can still move. The default React renderer is built into core and is stable.
- **Experimental:** React Server Components, Server Actions under RSC, Partial Prerendering, isolated hydration, the React compiler, WebMCP, federation, and WebAssembly components.

Stable integrations promise compatibility for their Farm.js factory, configuration, routes, and typed callers. The external service still follows its own SDK and API contract. Keep core, the CLI, DevTools, and the integrations on matching shared-release versions; independently versioned renderer and plugin packages can remain in beta.

The full breakdown, including which deployment targets are verified and how, is on the [Stability and Support](https://farmjs.dev/docs/stability) page.

<span id="the-app-foundation" className="blog-heading-anchor" />

## The app foundation

The parts every product needs, typed end to end:

- **App-directory routing** with generated route types, layouts, route groups, and loading and error boundaries.
- **Typed APIs and data.** API routes produce a typed client (`apiClient.hello.get()`), and server queries give you deduplicated, prefetchable, invalidatable reads defined once on the server.
- **Server functions and mutations.** `createServerFn` gives shared server operations input and output validation. `createServerQuery` adds structured cache keys, stale-while-revalidate, and invalidation for reads. Browser references require the experimental server-function transform; without it, keep the handler on the server and call a typed API route. The [server-query guide](https://farmjs.dev/docs/server-queries) explains that boundary.
- **Rendering control.** Streaming SSR, static generation, ISR-style revalidation, shared cache helpers with tag and path invalidation, and per-route runtime, region, and duration hints.
- **Built-ins you would otherwise assemble:** internationalization with typed ICU messages and RTL, light and dark themes with a pre-paint selector, responsive images, self-hosted fonts, cron schedules that compile to each platform's native triggers, `after()` for post-response work, a KV storage layer, and layers for sharing app directories between projects.

Small browser enhancements do not need a hydrated component tree. An optional [`src/client.ts`](https://farmjs.dev/docs/project-structure#html-first-client-lifecycle) connects server-rendered HTML to Farm.js's browser lifecycle, including initial setup, navigation, and cleanup. It is how this blog keeps its copy controls and reading indicator working between pages.

<span id="five-renderers-one-framework" className="blog-heading-anchor" />

## Five renderers, one framework

React is the default. Preact, Solid, Vue, and Svelte use the same routing, APIs, middleware, integrations, and deployment. You can pick a renderer when you create an app:

```bash
npx @farm.js/create-app@latest my-app --template basic --renderer vue
```

The other four are beta in 0.1, and a test-checked [capability matrix](https://farmjs.dev/docs/renderers) shows exactly what each one supports, including streaming per deployment target. Shared routing does not mean identical rendering features: Svelte currently buffers server rendering rather than streaming it. Check the matrix before choosing an adapter for a specific runtime.

<span id="an-integrations-ecosystem" className="blog-heading-anchor" />

## An integrations ecosystem

Most products are the same dozen services wired together. Farm.js integrations are typed packages that mount their routes, webhooks, client bindings, and configuration through one model, and `farm add integration` scaffolds them:

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

This is not a closed catalog. Use [`defineIntegration`](https://farmjs.dev/docs/integrations/custom) to build an app-local adapter or publish a community package with the same typed routes, configuration validation, and lifecycle hooks. It does not have to live under Farming Labs. Adapters such as Stripe can also wrap an SDK instance your app already owns. Keep that instance and its credentials in server-only modules.

<span id="a-plugin-ecosystem-starting-with-devtools" className="blog-heading-anchor" />

## A plugin ecosystem, starting with DevTools

**DevTools** ships in every new app. Open it from the button in the corner or with `Cmd + Shift + .` on macOS (`Ctrl + Shift + .` on Windows and Linux) to browse your routes and their runtime settings, inspect configured integrations, read runtime diagnostics, and compare your source with the JavaScript Vite actually served.

It is development-only: the plugin removes its UI, launcher, and inspection endpoints from production output. Snapshots show environment key names, not their values. Source code is still sensitive, so keep development servers on a trusted network. The [DevTools guide](https://farmjs.dev/docs/plugins/devtools) covers those boundaries.

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

Plugins change how the framework builds, renders, or handles requests; integrations connect a service to your app. Both have public authoring APIs. The [plugin authoring guide](https://farmjs.dev/docs/plugins/create-plugin) is the starting point for your own build tooling, diagnostics, or runtime policies.

<span id="a-cli-that-explains-your-app" className="blog-heading-anchor" />

## A CLI that explains your app

- `farm doctor` checks your Node version, configuration, routes, deployment target, cron, and storage, and can probe a running deployment with `--url`.
- `farm explain /some/path` tells you which route handles a URL and where it runs.
- `farm preview` gives your local app a public URL for webhooks, OAuth callbacks, and testing on a phone.
- `farm migrate next` and `farm migrate tanstack` move an existing Next.js App Router or TanStack Start project over. Nuxt and SvelteKit have migration guides.
- `farm upgrade --latest` keeps every Farm package on the same release.

<span id="built-for-agents-too" className="blog-heading-anchor" />

## Built for agents too

More of the traffic hitting a product is an agent reading a page, calling an API, or acting on someone's behalf. Farm.js apps handle that by default.

**Every page has a Markdown version,** with no configuration. Ask with a `.md` suffix or an `Accept` header:

```bash
curl https://your-app.com/pricing.md
curl -H "Accept: text/markdown" https://your-app.com/pricing
```

A `page.tsx` route is rendered and converted; a `page.md` route returns its source; a `page.md` next to a `page.tsx` overrides the generated version while browsers still get the React page. Missing routes answer agents in Markdown too.

**Your API can describe itself.** Turn on `openapi` in `farm.config.ts` and your typed API routes produce an OpenAPI document at `/openapi.json`, next to a rendered reference. Pages get canonical and Open Graph defaults, and JSON-LD is one option away.

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

<span id="built-with-farm-viby" className="blog-heading-anchor" />

## Built with Farm: Viby

We are also building with this foundation ourselves. [Viby](https://viby-app.farming-labs.dev) is a conversation-first software builder built on Farm.js and powered by [Viby SDK](https://viby.farming-labs.dev). Start with a prompt, reference files, or an existing repository, then inspect the generated source, iterate in the conversation, and preview the result in an isolated sandbox.

**Viby SDK is the infrastructure behind the experience.** `@viby/sdk` is an open-source, framework-agnostic TypeScript SDK for building persistent, skill-guided vibe coding products. It handles durable chats, generation attempts and events, immutable source versions, workspace tools, and optional sandbox previews. Your application owns its interface, authentication, model credentials, and infrastructure.

**The Viby app shows how those pieces come together.** The demo itself runs on Farm.js, and its generated projects start from a Farm.js baseline. Farm and design-engineering skills guide the generation; source versions let you keep iterating from the last result. You can inspect and edit files, preview the app, download the source, or use the repository and deployment integrations.

The SDK is not tied to Farm.js. Farm is one supported framework, and the app is a concrete example of the kind of product you can build on top of it: your product experience, with the generation and workspace infrastructure supplied by Viby.

[Explore the SDK](https://viby.farming-labs.dev) · [Try the Viby demo](https://viby-app.farming-labs.dev) · [Read the source](https://github.com/farming-labs/viby-sdk)

<span id="deploy-where-you-already-are" className="blog-heading-anchor" />

## Deploy where you already are

`deploy.target` maps to a tested Nitro output: `node` and `vercel` are stable, `cloudflare` and `netlify` are beta, and any other Nitro preset passes through on a best-effort basis. Pass-through is not a claim that Farm.js tests every Nitro runtime. `farm deploy` wraps the platform CLIs for Vercel, Cloudflare, and Netlify.

Run a production build for the target you will actually deploy, not only the development server. The [deployment guide](https://farmjs.dev/docs/deployment) covers target configuration and output. Use cron for scheduled HTTP work, `after()` for short post-response tasks, and a [jobs integration](https://farmjs.dev/docs/integrations/jobs) when work needs durable retries and execution history.

<span id="how-we-earned-stable" className="blog-heading-anchor" />

## How we earned "stable"

I did not want 0.1 to be a relabelled beta, so the last stretch went into proving the release rather than adding features.

Every release now installs representative integrations and a freshly generated app from the packed tarballs, the way a user gets them, then type-checks, builds, and serves that app. That check paid for itself immediately: while cutting the release candidate it caught our own integration smoke test quietly installing core from npm instead of the new build.

We also ran deployment output in real runtimes instead of trusting build logs. Booting Cloudflare output in `workerd`, Cloudflare's runtime, turned up two bugs no unit test could have caught: React apps on the `cloudflare-module` preset could not start, and a fix meant to give edge targets React's Web streaming build was being silently dropped from the build config. Both are fixed and covered by build-level tests.

The rest was unglamorous and necessary: malformed request bodies that returned 500 instead of 400, a storage dependency that let fresh installs close a database the app still owned, and a Content Security Policy warning that stayed quiet for policies that break hydration.

<span id="what-is-not-there-yet" className="blog-heading-anchor" />

## What is not there yet

- **Strict script CSP.** Inline hydration scripts do not carry nonces yet, so `script-src` has to allow `'unsafe-inline'`. Per-request nonces are next.
- **Netlify and Cloudflare** builds are tested, but only Node and Vercel are stable targets.
- **Docs on the edge.** The built-in docs engine needs a Node target for now; Cloudflare builds with docs enabled stop with an explanation.
- **MCP from your API.** Generating an MCP server from typed API routes is the next agent feature, as an experimental plugin.

<span id="try-it" className="blog-heading-anchor" />

## Try it

Use **Node.js 22.13 or newer** for development and Node deployments. The initializer installs the starter dependencies; then start the development server:

```bash
npx @farm.js/create-app@latest my-app
cd my-app
npm run dev
```

If you prefer pnpm, `pnpm create @farm.js/app my-app` works too; use `pnpm dev` inside the generated app. Use `--template basic --typescript` for the minimal starter, or `--list-templates` to find an auth, billing, jobs, or AI starter. Provider starters include the integration wiring and an `.env.example`; you supply the provider credentials.

If pnpm's `minimumReleaseAge` policy holds back a just-published release, the [upgrade guide](https://farmjs.dev/docs/upgrading) explains the scoped `@farm.js/*` exclusion. Keep the protection for unrelated dependencies.

Coming from a beta, preview the package changes with `farm upgrade --latest --dry-run`, then run `farm upgrade --latest`. Review the [upgrade guide](https://farmjs.dev/docs/upgrading), run your app's checks and production build, and replace deprecated APIs before a later minor release removes them. `latest` does not turn every independently versioned plugin or renderer into a stable package.

If something breaks, open an issue on [GitHub](https://github.com/farming-labs/farm.js/issues) with `farm doctor` output, the renderer, deployment target, and a small reproduction. Remove credentials and private application data before sharing logs. Thanks to everyone who ran the betas and told me what was wrong.
