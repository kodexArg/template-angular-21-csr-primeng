---
name: kdx-design-system-use
description: THE entry point for all UI work. Consult BEFORE writing any template, component, or page. Maps UI requirements to validated PrimeNG components and Tailwind layout patterns. Generates PrimeNG content exactly as kdx-ng-template requires. Always produces tests. No ambiguity.
---

# Design System — Usage Guide

> **This skill is mandatory.** Every UI task starts here.
> Every other kdx-* skill defers to this for component and styling decisions.
> PrimeNG is the SSOT. The showcase is the living catalog.
> **LLM reference:** https://primeng.org/llms/llms-full.txt — consult when unsure about a PrimeNG component API.

---

## When This Skill Activates

- Creating a new page or component
- Modifying any template
- Choosing which PrimeNG component to use
- Deciding how to style something
- Any UI decision whatsoever

**Do not skip this skill.** The other skills (`kdx-angular-component`, `kdx-angular-forms`, `kdx-angular-http`, `kdx-angular-routing`, `kdx-angular-signals`) handle HOW to write code. This skill decides WHAT to build.

---

## The Decision Flow

Every UI task follows this sequence. No exceptions.

```
1. WHAT DATA?       → Read API.md for endpoint shape
2. WHAT UI BLOCKS?  → Map each to a PrimeNG component (catalog below)
3. WHAT LAYOUT?     → Tailwind utilities only (flex, grid, gap, padding)
4. WHAT COLOR?      → PrimeNG CSS variables only — var(--p-*)
5. WHAT CUSTOM?     → Customization hierarchy: prop > token > [dt] > [pt]
6. WRITE CODE       → Delegate to kdx-angular-component for anatomy
7. WRITE TEST       → Always. No component without a test.
```

---

## Theme Identity

| Property | Value |
|---|---|
| Preset | Lara |
| Primary | Noir — primary maps to surface (monochrome) |
| Surface | Zinc |
| Color Scheme | Light (dark via `.app-dark` class on `<html>`) |
| Layout | Verona-inspired: zinc-100 ground, white cards floating |
| Typography | System font stack via `var(--font-family)` |
| Config | `frontend/src/app/theme.config.ts` |

**What "Noir" means:** buttons, links, and highlights use the same neutral zinc scale as the page. Primary-950 (#09090b) is near-black. This creates a sophisticated, typography-first aesthetic where color is reserved for semantic meaning (success/warn/danger/info).

---

## PrimeNG LLM Reference

PrimeNG provides machine-readable documentation for LLMs:

- **Full docs:** `https://primeng.org/llms/llms-full.txt`
- **Index:** `https://primeng.org/llms/llms.txt`
- **MCP server:** `https://primeng.org/mcp`

**When to consult:** when unsure about a component's API, props, events, or available features. The llms-full.txt contains every component's documentation optimized for LLM consumption.

**Constraint:** only use components and APIs documented there. Do not hallucinate PrimeNG APIs.

---

## Component Catalog

For EVERY UI need, there is ONE answer. The showcase (`frontend/src/app/showcase/`) validates each visually.

### Containers

| UI Need | Component | Import | Notes |
|---|---|---|---|
| Content section | `p-card` | `Card` from `primeng/card` | White background on zinc-100 ground. Use `#header`, `#footer` templates |
| Collapsible section | `p-panel` | `Panel` from `primeng/panel` | `[toggleable]="true"`. Header bar separates from card |
| Tab container | `p-tabs` | `Tabs, TabList, Tab, TabPanels, TabPanel` from `primeng/tabs` | New API: `<p-tabs value="0">` with `<p-tablist>` + `<p-tabpanels>` |

### Actions

| UI Need | Component | Import | Notes |
|---|---|---|---|
| Primary action | `p-button` | `Button` from `primeng/button` | Default = Noir (near-black). Strongest visual weight |
| Secondary action | `p-button [outlined]="true"` | same | Border only, no fill |
| Tertiary action | `p-button [text]="true"` | same | No border, no fill. Lowest weight |
| Destructive | `p-button severity="danger"` | same | Red. For delete/remove |
| With icon | `p-button icon="pi pi-*"` | same | PrimeIcons. Browse: primeng.org/icons |
| Sizes | `p-button size="small\|large"` | same | Three sizes. Default for most UI |

### Data Display

| UI Need | Component | Import | Notes |
|---|---|---|---|
| Tabular data | `p-table` | `TableModule` from `primeng/table` | `[stripedRows]="true"`. Use `#header` + `#body` templates |
| Status indicator | `p-tag` | `Tag` from `primeng/tag` | `severity="success\|warn\|danger\|info\|secondary"` |
| Count badge | `p-badge` | `Badge` from `primeng/badge` | Numeric. Same severity system |
| Removable token | `p-chip` | `Chip` from `primeng/chip` | `[removable]="true"` for selections |
| User avatar | `p-avatar` | `Avatar` from `primeng/avatar` | `label="AB" shape="circle"`. Circle for people, square for entities |
| Completion | `p-progressbar` | `ProgressBar` from `primeng/progressbar` | Default height or thin: `[style]="{ height: '6px' }"` |

### Form Inputs

| UI Need | Component | Import | Notes |
|---|---|---|---|
| Text input | `input pInputText` | `InputText` from `primeng/inputtext` | Always inside `p-floatlabel variant="on"` |
| Textarea | `textarea pTextarea` | `Textarea` from `primeng/textarea` | Same float label pattern |
| Password | `input pInputText type="password"` | `InputText` | **NOT p-password** for Signal Forms ([formField] compat) |
| Number | `p-inputnumber` | `InputNumber` from `primeng/inputnumber` | `mode="currency"`, `mode="decimal"` |
| Dropdown | `p-select` | `Select` from `primeng/select` | `[options]`, `optionLabel`, `optionValue` |
| Date | `p-datepicker` | `DatePicker` from `primeng/datepicker` | Calendar popup |
| Checkbox | `p-checkbox` | `Checkbox` from `primeng/checkbox` | `[binary]="true"` for boolean |
| Radio | `p-radiobutton` | `RadioButton` from `primeng/radiobutton` | Group via `[(value)]` with Signal Forms `[formField]` |
| Toggle | `p-toggleswitch` | `ToggleSwitch` from `primeng/toggleswitch` | On/off state |
| Float label | `p-floatlabel` | `FloatLabel` from `primeng/floatlabel` | **Always use.** `variant="on"` preferred |
| File upload | `p-fileupload` | `FileUpload` from `primeng/fileupload` | See kdx-angular-http for S3 pattern |

### Feedback

| UI Need | Component | Import | Notes |
|---|---|---|---|
| Inline message | `p-message` | `Message` from `primeng/message` | `severity="success\|info\|warn\|error\|secondary\|contrast"` |
| Loading spinner | `p-progressSpinner` | `ProgressSpinner` from `primeng/progressspinner` | Full component loading |
| Skeleton | `p-skeleton` | `Skeleton` from `primeng/skeleton` | Placeholder during `@defer` |
| Empty state | `p-message severity="info"` | `Message` | Inside `@empty` block |

### Navigation & Chrome

| UI Need | Component | Import | Notes |
|---|---|---|---|
| Page action bar | `p-toolbar` | `Toolbar` from `primeng/toolbar` | `#start` = title/context. `#end` = action buttons |
| Menu bar | `p-menubar` | `Menubar` from `primeng/menubar` | Main navigation |
| Breadcrumbs | `p-breadcrumb` | `Breadcrumb` from `primeng/breadcrumb` | Route hierarchy |
| Sidebar menu | `p-panelmenu` | `PanelMenu` from `primeng/panelmenu` | Collapsible groups |
| Section divider | `p-divider` | `Divider` from `primeng/divider` | Visual separator within cards |

---

## Page Structure

Every page follows this skeleton. No exceptions.

```html
<div class="max-w-7xl mx-auto p-6">

  <!-- Page header -->
  <header class="mb-10">
    <h1 class="text-4xl font-bold mb-2"
        style="color: var(--p-surface-900)">
      Page Title
    </h1>
    <p class="text-lg" style="color: var(--p-surface-500)">
      One-line description of this page.
    </p>
  </header>

  <!-- Toolbar (optional — for CRUD pages) -->
  <p-toolbar class="mb-6">
    <ng-template #start>
      <span class="text-lg font-semibold" style="color: var(--p-surface-800)">
        Context Title
      </span>
    </ng-template>
    <ng-template #end>
      <div class="flex gap-2">
        <p-button label="Secondary" severity="secondary" [outlined]="true" />
        <p-button label="Primary Action" />
      </div>
    </ng-template>
  </p-toolbar>

  <!-- Content sections — mb-10 between them -->
  <section class="mb-10">
    <p-card>
      <!-- Content -->
    </p-card>
  </section>

</div>
```

### Grid patterns

```html
<!-- 3-column card grid -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
  <p-card>...</p-card>
  <p-card>...</p-card>
  <p-card>...</p-card>
</div>

<!-- 2-column form layout -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  <p-floatlabel variant="on">...</p-floatlabel>
  <p-floatlabel variant="on">...</p-floatlabel>
  <!-- Full-width field -->
  <div class="md:col-span-2">
    <p-floatlabel variant="on">...</p-floatlabel>
  </div>
</div>

<!-- Flex row with gap -->
<div class="flex flex-wrap gap-3">
  <p-button label="A" />
  <p-button label="B" />
</div>

<!-- Vertical stack -->
<div class="flex flex-col gap-4">
  <p-message severity="info">...</p-message>
  <p-message severity="warn">...</p-message>
</div>
```

---

## Typography Scale

Exact hierarchy used throughout the application. Do not deviate.

| Class | Color token | Use for |
|---|---|---|
| `text-4xl font-bold` | `var(--p-surface-900)` | Page title (one per page) |
| `text-2xl font-semibold` | `var(--p-surface-800)` | Section heading |
| `text-lg font-semibold` | `var(--p-surface-700)` | Card heading, subsection |
| `text-base` | `var(--p-surface-700)` | Body text |
| `text-sm` | `var(--p-surface-500)` | Secondary/muted text, descriptions |
| `text-xs` | `var(--p-surface-400)` | Labels, captions, metadata |
| `text-xs font-mono` | `var(--p-surface-400)` | Code annotations |

**How to apply:** always via inline `style` attribute for color, Tailwind class for size/weight.

```html
<h2 class="text-2xl font-semibold mb-1"
    style="color: var(--p-surface-800)">
  Section Title
</h2>
<p class="mb-6" style="color: var(--p-surface-500)">
  Description of this section.
</p>
```

---

## Color Rules — Absolute

### Allowed

| Source | Example | When |
|---|---|---|
| PrimeNG CSS variable | `style="color: var(--p-surface-700)"` | Typography, custom elements |
| PrimeNG component prop | `severity="success"` | Component semantic color |
| `tailwindcss-primeui` utility | `text-primary`, `bg-surface-card` | Rare — when style attr is awkward |

### Forbidden

| Pattern | Why |
|---|---|
| `text-zinc-500`, `bg-slate-100` | Raw Tailwind colors bypass the design system |
| `text-red-500`, `text-green-500` | Use PrimeNG severity or `var(--p-red-500)` |
| `dark:` variant | PrimeNG CSS variables auto-resolve for both schemes |
| `#3B82F6`, `rgb(...)` in templates | Hardcoded values don't respond to theme changes |

---

## Customization Hierarchy

When you need to change a component's appearance, follow this order. Stop at the first level that works.

```
1. Component prop    →  severity="warn", size="small", [outlined]="true"
2. PrimeNG token     →  Change in KdxPreset (theme.config.ts) — cascades everywhere
3. [dt] scoped       →  Per-instance token override (no ::ng-deep)
4. [pt] passthrough  →  DOM-level class/attribute injection
5. Tailwind class    →  Last resort for things PrimeNG doesn't model
```

**Examples:**

```html
<!-- 1. Prop (best) -->
<p-button severity="danger" size="small" />

<!-- 3. [dt] scoped override -->
<p-toggleswitch [dt]="customSwitch" />
```

```typescript
// In component class
customSwitch = {
  colorScheme: {
    light: { root: { checkedBackground: '{amber.500}' } },
    dark:  { root: { checkedBackground: '{amber.400}' } }
  }
};
```

**Never use `::ng-deep`.** It is deprecated and breaks encapsulation.

---

## Data Table Pattern

The validated pattern for tabular data. Copy this structure.

```html
<p-card>
  <p-table [value]="data()" [stripedRows]="true"
           [tableStyle]="{ 'min-width': '40rem' }">
    <ng-template #header>
      <tr>
        <th>Name</th>
        <th>Role</th>
        <th>Status</th>
        <th>Progress</th>
      </tr>
    </ng-template>
    <ng-template #body let-row>
      <tr>
        <td>
          <div class="flex items-center gap-3">
            <p-avatar [label]="row.initials" shape="circle"
                      [style]="{ 'background-color': 'var(--p-primary-100)',
                                 'color': 'var(--p-primary-700)' }" />
            <div>
              <p class="font-semibold"
                 style="color: var(--p-surface-800)">{{ row.name }}</p>
              <p class="text-xs"
                 style="color: var(--p-surface-500)">{{ row.email }}</p>
            </div>
          </div>
        </td>
        <td style="color: var(--p-surface-600)">{{ row.role }}</td>
        <td><p-tag [value]="row.status" [severity]="row.severity" /></td>
        <td>
          <p-progressbar [value]="row.progress" [showValue]="false"
                         [style]="{ height: '6px' }" />
        </td>
      </tr>
    </ng-template>
  </p-table>
</p-card>
```

---

## Form Pattern

The validated pattern for forms. Float labels always.

```html
<p-card>
  <form (submit)="onSubmit($event)" class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <p-floatlabel variant="on">
      <input pInputText id="name" class="w-full" [formField]="form.name" />
      <label for="name">Full Name</label>
    </p-floatlabel>

    <p-floatlabel variant="on">
      <p-select id="role" [options]="roleOptions" optionLabel="label"
                [formField]="form.role" styleClass="w-full" />
      <label for="role">Role</label>
    </p-floatlabel>

    <!-- Full width -->
    <div class="md:col-span-2">
      <p-floatlabel variant="on">
        <textarea pTextarea id="notes" class="w-full" rows="3"
                  [formField]="form.notes"></textarea>
        <label for="notes">Notes</label>
      </p-floatlabel>
    </div>

    <!-- Actions -->
    <div class="md:col-span-2 flex justify-end gap-2">
      <p-button label="Cancel" severity="secondary" [text]="true" />
      <p-button type="submit" label="Save"
                [disabled]="form().invalid()" [loading]="submitting()" />
    </div>
  </form>
</p-card>
```

**For Signal Forms API details**, delegate to `kdx-angular-forms`.
**For password fields in Signal Forms**, use `input pInputText type="password"` — NOT `p-password` (it doesn't implement `FormValueControl`).

---

## Loading & Error States

Every data-fetching component must handle three states.

```html
@switch (resource.status()) {
  @case ('loading') {
    <p-progressSpinner />
  }
  @case ('error') {
    <p-message severity="error" text="Failed to load data" />
    <p-button label="Retry" (onClick)="resource.reload()" class="mt-2" />
  }
  @case ('resolved') {
    <!-- Content -->
  }
}
```

For lists, add `@empty`:

```html
@for (item of items(); track item.id) {
  <app-item-card [item]="item" />
} @empty {
  <p-message severity="info" text="No items found" />
}
```

---

## Prohibited Patterns

These rules are enforced by `showcase.component.spec.ts` and apply to ALL components.

| Rule | Regex / Pattern | Fix |
|---|---|---|
| No raw Tailwind colors | `text-(red\|green\|blue\|...\|rose)-\d{3}` | Use `var(--p-*)` or `severity` |
| No PrimeFlex legacy | `flex-column` | Use Tailwind `flex-col` |
| No Tailwind dark mode | `dark:` | PrimeNG CSS vars auto-resolve |
| No unprefixed custom classes | any non-standard class | Prefix with `kdx-*` |
| No `::ng-deep` | anywhere | Use `[dt]` or `[pt]` |
| No `*ngIf`, `*ngFor` | structural directives | Use `@if`, `@for` |
| No `ngClass`, `ngStyle` | attribute directives | Use `[class.*]` or `[style.*]` |
| No NgModule | `@NgModule` | Standalone only |
| No constructor DI | `constructor(private ...)` | Use `inject()` |
| No `@Input()`, `@Output()` | decorators | Use `input()`, `output()` |

---

## Test Generation — Mandatory

**Every component gets a test.** Both this skill and `kdx-angular-component` enforce this.

### Test Template

```typescript
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { kdxThemeOptions } from '../theme.config'; // adjust path
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  let fixture: ComponentFixture<MyComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideAnimationsAsync(),
        providePrimeNG(kdxThemeOptions),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  // ── Component ──────────────────────────────────────────────────────
  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  // ── PrimeNG components render ──────────────────────────────────────
  it('should render expected PrimeNG components', () => {
    // Add assertions for each PrimeNG component used:
    // expect(el.querySelector('p-card')).toBeTruthy();
    // expect(el.querySelector('p-button')).toBeTruthy();
    // expect(el.querySelector('p-table')).toBeTruthy();
  });

  // ── Design system rule enforcement ─────────────────────────────────

  function getOwnClassValues(): string {
    const allEls = el.querySelectorAll('[class]');
    const ownClasses: string[] = [];
    allEls.forEach((node) => {
      if (node.hasAttribute('data-pc-name') || node.hasAttribute('data-pc-section')) return;
      ownClasses.push(node.getAttribute('class')!);
    });
    return ownClasses.join(' ');
  }

  it('should not contain raw Tailwind color classes', () => {
    const forbidden = /\btext-(red|green|blue|emerald|slate|zinc|gray|neutral|stone|orange|amber|yellow|lime|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose)-\d{3}\b/;
    expect(getOwnClassValues()).not.toMatch(forbidden);
  });

  it('should not use dark: Tailwind variant', () => {
    expect(getOwnClassValues()).not.toMatch(/\bdark:/);
  });
});
```

### What to test per component type

| Component Type | Additional Tests |
|---|---|
| Page with table | Table renders, correct columns, row count |
| Page with form | Float labels present, submit button state |
| Page with toolbar | Toolbar renders, action buttons present |
| Card layout | Grid structure, responsive classes |
| Data fetching | Loading state, error state, resolved state |

---

## Delegation — Which Skill Handles What

After this skill decides WHAT to build, delegate HOW:

| Concern | Delegate to |
|---|---|
| Component anatomy (OnPush, inject, host) | `kdx-angular-component` |
| Signal state (signal, computed, effect) | `kdx-angular-signals` |
| Forms (Signal Forms API, validation) | `kdx-angular-forms` |
| HTTP (httpResource, interceptors, DRF) | `kdx-angular-http` |
| Routing (lazy routes, guards, resolvers) | `kdx-angular-routing` |
| New Tailwind tokens (@theme, @utility) | `kdx-tailwind-design-system` |
| Modify design system itself (rare) | `kdx-design-system-modification` |

---

## Showcase as Living Catalog

The showcase (`frontend/src/app/showcase/`) is the visual proof that every pattern works. When in doubt about how a component should look, read the showcase source.

The showcase validates:
- Every PrimeNG component listed in this catalog
- Every typography level
- Every color token usage
- Every layout pattern (grid, flex, spacing)
- The design rules via automated tests

**If a pattern is not in the showcase, it has not been validated.** Add it before using it in production components.

---

## Quick Reference — File Map

| File | Purpose |
|---|---|
| `frontend/src/app/theme.config.ts` | KdxPreset: Lara + Noir + Zinc. SSOT for theme |
| `frontend/src/tailwind.css` | Tailwind entry: layers, imports, `@utility` |
| `frontend/src/styles.css` | Global baseline: html/body, skip-link |
| `frontend/src/app/showcase/` | Living catalog — visual proof |
| `docs/08-primeng.md` | Token system deep dive |
| `docs/09-tailwind4.md` | Tailwind rules and prohibitions |
| `API.md` | HTTP contracts — read BEFORE building data pages |

---

## QA Audit Rules

Rules learned from production audits. Mandatory for all generated UI.

### WCAG 1.4.11 — Gradient Badge Contrast

Gradient badges must achieve **>=3:1 contrast ratio** between the lightest gradient color stop and the foreground (icon/text) color. Verify before using any gradient background with text or icons on top.

### `p-toggleswitch` — Accessibility Label

Every `p-toggleswitch` **must** have an `inputId` paired with a matching `<label for="...">`:

```html
<p-toggleswitch inputId="darkMode" [(checked)]="dark" />
<label for="darkMode">Dark mode</label>
```

### Repeated CTA Buttons — Unique `ariaLabel`

When multiple buttons share the same visible label (e.g., "Get Started" on a pricing page), each must have a unique `ariaLabel` to distinguish them for assistive technology:

```html
<p-button label="Get Started" ariaLabel="Get Started — Basic" />
<p-button label="Get Started" ariaLabel="Get Started — Premium" />
```

### PrimeNG CSS Variable Names

Use the correct modern `--p-*` names. Legacy unprefixed aliases are invalid in new code:

| Correct (`--p-*`) | Wrong (legacy) |
|---|---|
| `var(--p-surface-0)` | `var(--p-surface-card)` |
| `var(--p-surface-200)` | `var(--p-surface-border)` |
| `var(--p-surface-ground)` | `var(--surface-ground)` in new code |
