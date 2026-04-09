# angular-21-csr-primeng

An opinionated Angular 21 CSR starter template built around **PrimeNG** and **Tailwind CSS v4**. Designed for AI-assisted development with a full Claude Code skill suite and Angular MCP integration baked in.

## Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21.2 — standalone components, OnPush, signals |
| UI Library | **PrimeNG 21** — Aura theme preset |
| Styling | **Tailwind CSS v4** + `tailwindcss-primeui` bridge plugin |
| HTTP | `HttpClient` + `httpResource()` ready |
| Testing | Vitest + JSDOM (no Jasmine, no Jest) |
| Language | TypeScript 5.9 — strict mode |
| Build | `@angular/build` (esbuild) |
| Formatter | Prettier |

## PrimeNG + Tailwind v4

PrimeNG is the primary component library. The Aura preset is configured in `app.config.ts` via `providePrimeNG`. The `tailwindcss-primeui` plugin bridges PrimeNG's design tokens into Tailwind, so PrimeNG surface, primary, and semantic color tokens work directly as Tailwind utilities.

```css
/* src/styles.css */
@import 'tailwindcss';
@plugin 'tailwindcss-primeui';
```

This gives you:
- All PrimeNG components styled by the Aura theme
- Full Tailwind v4 utility classes
- Shared token space: `bg-primary`, `text-surface-600`, etc. work across both systems
- No SCSS, no CSS variables ceremony — just `@import` and `@plugin`

## App Config

```ts
// src/app/app.config.ts
providePrimeNG({ theme: { preset: Aura } })
provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling(...))
provideHttpClient()
provideAnimationsAsync()
```

Router is configured with component input binding (route params as signal inputs) and scroll position restoration out of the box.

## Project Structure

```
src/
  main.ts           bootstrap
  styles.css        Tailwind + PrimeUI plugin
  app/
    app.ts          root component (standalone, OnPush)
    app.config.ts   providers (router, http, animations, PrimeNG)
    app.routes.ts   route definitions
    app.html        root template
    app.spec.ts     component test
```

## Claude Code Skills

The `.claude/skills/` directory contains linked skills that give Claude Code domain knowledge about this stack. When active, Claude uses these before writing any code.

| Skill | Purpose |
|---|---|
| `kdx-angular-component` | Standalone OnPush components with signal I/O and PrimeNG primitives |
| `kdx-angular-forms` | Signal Forms API + PrimeNG form components |
| `kdx-angular-http` | `httpResource()`, `resource()`, `HttpClient` patterns |
| `kdx-angular-routing` | Lazy loading, functional guards, signal params |
| `kdx-angular-signals` | `signal()`, `computed()`, `linkedSignal()`, `effect()` — no RxJS for state |
| `kdx-angular-testing` | Vitest + TestBed, zoneless, signal inputs, PrimeNG components |
| `kdx-design-system-use` | Maps UI requirements to validated PrimeNG + Tailwind patterns |
| `kdx-tailwind-design-system` | Extends Tailwind v4 tokens and `@utility` classes |
| `kdx-version` | Version tagging, CHANGELOG, milestones |

## MCP Integration

`.mcp.json` configures the Angular CLI MCP server, enabling Claude Code to run Angular CLI commands programmatically:

```json
{
  "mcpServers": {
    "angular": {
      "command": "npx",
      "args": ["-y", "@angular/cli", "mcp", "-E", "build", "-E", "devserver", "-E", "test", "-E", "modernize", "-E", "e2e"]
    }
  }
}
```

Available MCP tools: `build`, `devserver_start/stop`, `test`, `modernize`, `e2e`, `list_projects`, `get_best_practices`, `search_documentation`, `ai_tutor`.

## Getting Started

```bash
npm install
npm start        # ng serve  →  http://localhost:4200
npm test         # vitest
npm run build    # production build
```

## License

MIT — Copyright (c) 2026 [Gabriel Cavedal](mailto:gcavedal@gmail.com) (kodexArg)
