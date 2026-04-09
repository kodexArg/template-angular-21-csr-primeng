---
name: kdx-tailwind-design-system
description: Extend the Tailwind v4 side of the design system — add @theme tokens, @utility classes, animations, or container queries. Use when authoring new CSS in tailwind.css. PrimeNG is the primary design system; Tailwind is its utility layer and extension mechanism.
---

# Tailwind v4 Design System — Extension Guide

> **PrimeNG is the SSOT and primary design system.**
> Tailwind v4 exists to serve PrimeNG, not compete with it.
> For PrimeNG token rules, read `docs/08-primeng.md`.
> For Tailwind usage rules, read `docs/09-tailwind4.md`.

---

## The Hierarchy

```
PrimeNG (primary — always check here first)
  └── Tailwind v4 (subordinate — three roles only)
        1. Layout utility around/between PrimeNG components
        2. Extension when PrimeNG can't do it (@theme, @utility, animations)
        3. Brand-new UI element with no PrimeNG equivalent (rare)
```

**Before writing any Tailwind:** ask — does PrimeNG already handle this?

| Situation | Answer |
|---|---|
| A PrimeNG component exists for the UI | Use PrimeNG. No Tailwind. |
| A PrimeNG token covers the style | Use `var(--p-*)` or `[dt]`. No Tailwind. |
| `tailwindcss-primeui` has a semantic utility | Use `p-*` / `bg-surface-*`. No raw Tailwind color. |
| Spacing/layout *around* PrimeNG components | Tailwind layout utilities (`flex`, `gap`, `p-4`…) |
| Token or style PrimeNG doesn't model | Extend via `@theme` / `@utility` |
| Entirely new UI with no PrimeNG equivalent | Tailwind from scratch (rare — reconsider first) |

---

## Read Before Extending

- **`docs/08-primeng.md`** — token system, KdxPreset, `[dt]` scoped overrides, customization hierarchy
- **`docs/09-tailwind4.md`** — color rules, dark mode, tailwindcss-primeui, what-not-to-do

---

## Decision Tree — Where Does the New Thing Go?

```
What do you need?
├── Color, state, or component variant
│     └── → KdxPreset in app.config.ts (see 08-primeng.md — try this first)
├── Per-instance component tweak
│     └── → [dt] on the element (see 08-primeng.md)
├── Global baseline (html/body)
│     └── → styles.scss with CSS vars
├── Spacing / sizing / font / animation token
│     └── → @theme {} in tailwind.css  ← this skill
├── Reusable utility class
│     └── → @utility in tailwind.css  ← this skill
└── Truly new UI element (no PrimeNG equivalent)
      └── → Tailwind from scratch in the component template (rare)
```

---

## `@theme {}` — Extending Non-Color Tokens

**Only spacing, sizing, fonts, container sizes, animations. Never colors — those belong in KdxPreset.**

```css
/* frontend/src/tailwind.css */
@theme {
  /* Spacing step not in Tailwind's scale */
  --spacing-18: 4.5rem;

  /* Display font (layout concern, not a brand color) */
  --font-display: 'Inter', system-ui;

  /* Named max-width container */
  --container-content: 72rem;
}
```

Usage:
```html
<div class="pt-18 font-display max-w-content">
```

Namespace override — clear defaults and define a minimal custom scale (rare):
```css
@theme {
  --spacing-*: initial;
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
}
```

---

## `@utility` — Custom Utility Classes

For styles that PrimeNG doesn't express and that you'll reuse across templates. Goes in `tailwind.css`.

**Naming rule: all custom utilities must be prefixed `kdx-`.** This distinguishes project-defined classes from standard PrimeNG and Tailwind utilities at a glance.

```css
/* Multi-line truncation — no PrimeNG equivalent */
@utility kdx-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@utility kdx-truncate-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Full-bleed horizontal rule using PrimeNG surface token */
@utility kdx-rule-h {
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100vw;
    height: 1px;
    width: 200vw;
    background: var(--p-surface-border);
  }
}

/* Text gradient — purely presentational, no PrimeNG equivalent */
@utility kdx-text-gradient-primary {
  background: linear-gradient(to right, var(--p-primary-400), var(--p-primary-600));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
```

Usage in Angular templates:
```html
<p class="kdx-truncate-2">Long description...</p>
<section class="kdx-rule-h pt-6">Content below a full-bleed rule</section>
<h1 class="kdx-text-gradient-primary text-4xl font-bold">Title</h1>
```

> For applying Tailwind utilities on the component host element, see `kdx-angular-component` → Host Bindings.

---

## Animations

PrimeNG handles component enter/leave animations internally. Use Tailwind animations only for:
- Custom non-PrimeNG elements
- Page-level transitions
- Decorative motion not tied to a PrimeNG component state

Define `@keyframes` **inside `@theme {}`** — Tailwind v4 only outputs them when the `--animate-*` variable is referenced:

```css
@theme {
  --animate-enter: enter 0.2s ease-out;
  --animate-leave: leave 0.15s ease-in;
  --animate-slide-up: slide-up 0.3s ease-out;

  @keyframes enter {
    from { opacity: 0; transform: translateY(-0.25rem); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes leave {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(-0.25rem); }
  }

  @keyframes slide-up {
    from { opacity: 0; transform: translateY(1rem); }
    to   { opacity: 1; transform: translateY(0); }
  }
}
```

Usage:
```html
<div class="animate-enter">Fades in</div>
```

### Native popover animation (`@starting-style`)

For custom popover elements not using PrimeNG's overlay system:

```css
[popover] {
  transition: opacity 0.2s, transform 0.2s, display 0.2s allow-discrete;
  opacity: 0;
  transform: scale(0.97);
}

[popover]:popover-open {
  opacity: 1;
  transform: scale(1);
}

@starting-style {
  [popover]:popover-open {
    opacity: 0;
    transform: scale(0.97);
  }
}
```

---

## Container Queries

Use when layout must respond to a **parent container's size**, not the viewport. PrimeNG has no equivalent.

```css
@theme {
  --container-card: 28rem;
  --container-panel: 40rem;
}
```

```html
<div class="@container">
  <div class="grid grid-cols-1 @card:grid-cols-2 @panel:grid-cols-3 gap-4">
    @for (item of items(); track item.id) {
      <app-item-card [item]="item" />
    }
  </div>
</div>
```

---

## QA Audit Rules

Rules learned from production audits. Mandatory for all Tailwind extensions.

### Gradient Badge Contrast — WCAG 1.4.11

When creating gradient badges or gradient backgrounds with text/icons on top, verify the **lightest** color stop passes:
- **>=3:1** contrast ratio for non-text elements (icons, borders)
- **>=4.5:1** contrast ratio for normal text

Use a contrast checker tool before shipping.

### PrimeNG Variable Naming

Always use the `--p-` prefix for PrimeNG CSS variables. Legacy unprefixed names (`--surface-ground`, `--primary-color-text`) must not appear in new code. The correct form is `var(--p-surface-ground)`, `var(--p-primary-color)`, etc.

---

## Always Verify

```bash
cd frontend && ng build --configuration=development
```
