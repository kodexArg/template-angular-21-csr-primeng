---
name: kdx-angular-component
description: Create Angular 21 standalone components with PrimeNG and signal-based I/O. One way to build components — OnPush, inject(), host bindings, PrimeNG primitives. No options.
---

# Component — Angular 21 + PrimeNG

> **FIRST:** invoke `kdx-design-system-use` to decide WHAT PrimeNG components to use.
> This skill handles HOW to write the component. Design system decisions come first.
> **ALWAYS** generate a test file alongside every component (see `kdx-design-system-use` → Test Generation).

Standalone by default. Always set `standalone: true` explicitly (Angular 21 infers it, but explicit is audit-friendly). Never use NgModule.

## Anatomy

```typescript
import { Component, ChangeDetectionStrategy, input, output, computed, inject } from '@angular/core';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';

@Component({
  standalone: true,
  selector: 'app-user-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Tag],
  host: {
    'class': 'block',
    '[class.opacity-50]': 'disabled()',
  },
  template: `
    <div class="p-card">
      <div class="p-card-body">
        <h3>{{ name() }}</h3>
        <p-tag [value]="role()" severity="info" />
        <p-button label="Select" (onClick)="selected.emit(id())" [disabled]="disabled()" />
      </div>
    </div>
  `,
})
export class UserCard {
  id = input.required<string>();
  name = input.required<string>();
  role = input<string>('user');
  disabled = input(false);

  selected = output<string>();
}
```

## Inputs

```typescript
name = input.required<string>();       // required
count = input(0);                      // default value
label = input<string>();               // optional undefined
disabled = input(false, { transform: booleanAttribute }); // transform
```

## Outputs

```typescript
import { output } from '@angular/core';

clicked = output<void>();
selected = output<Item>();

// emit
this.clicked.emit();
this.selected.emit(item);
```

## Two-Way Binding (model)

```typescript
import { model } from '@angular/core';

@Component({
  selector: 'app-rating',
  template: `
    @for (star of stars; track $index) {
      <i class="pi" [class.pi-star-fill]="$index < value()" [class.pi-star]="$index >= value()"
         (click)="value.set($index + 1)"></i>
    }
  `,
})
export class Rating {
  value = model(0);
  stars = Array(5);
}

// Usage: <app-rating [(value)]="score" />
```

## Host Bindings

Always in the `host` object. Never use `@HostBinding` or `@HostListener`.

```typescript
@Component({
  selector: 'app-panel',
  host: {
    'role': 'region',
    '[class.expanded]': 'expanded()',
    '[attr.aria-expanded]': 'expanded()',
    '(click)': 'toggle()',
    '(keydown.enter)': 'toggle()',
  },
  template: `<ng-content />`,
})
export class Panel {
  expanded = model(false);
  toggle() { this.expanded.update(v => !v); }
}
```

## Content Projection

```typescript
@Component({
  selector: 'app-page-section',
  template: `
    <header><ng-content select="[section-header]" /></header>
    <main><ng-content /></main>
    <footer><ng-content select="[section-footer]" /></footer>
  `,
})
export class PageSection {}

// <app-page-section>
//   <h2 section-header>Title</h2>
//   <p>Content</p>
//   <p-button section-footer label="Action" />
// </app-page-section>
```

## View / Content Queries

```typescript
import { viewChild, viewChildren, contentChildren, ElementRef } from '@angular/core';

container = viewChild.required<ElementRef>('container');
cards = viewChildren(UserCard);
tabs = contentChildren(TabPanel);
```

## Dependency Injection

Always `inject()`. Never constructor injection.

```typescript
private router = inject(Router);
private auth = inject(AuthService);
private config = inject(APP_CONFIG);
private analytics = inject(AnalyticsService, { optional: true });
```

## Lifecycle

```typescript
import { afterNextRender, afterRender, OnDestroy } from '@angular/core';

export class Chart implements OnDestroy {
  private chartRef = viewChild.required<ElementRef>('chart');

  _ = afterNextRender(() => {
    // DOM ready — init chart library
  });

  ngOnDestroy() { /* cleanup */ }
}
```

## Template Syntax

Native control flow only. Never `*ngIf`, `*ngFor`, `ngClass`, `ngStyle`.

```html
@if (loading()) {
  <p-progressSpinner />
} @else if (error()) {
  <p-message severity="error" [text]="error()" />
} @else {
  @for (item of items(); track item.id) {
    <app-item-card [item]="item" />
  } @empty {
    <p-message severity="info" text="No items" />
  }
}
```

## Deferred Loading

```html
@defer (on viewport) {
  <app-heavy-chart [data]="chartData()" />
} @placeholder {
  <p-skeleton width="100%" height="300px" />
} @loading (minimum 300ms) {
  <p-progressSpinner />
}
```

## Images

```typescript
import { NgOptimizedImage } from '@angular/common';

@Component({
  imports: [NgOptimizedImage],
  template: `<img ngSrc="/assets/hero.jpg" width="800" height="600" priority />`,
})
export class Hero {}
```

## Styling

**PrimeNG first. Tailwind only when PrimeNG has no answer.**

- Use PrimeNG component props (`severity`, `variant`, `size`) and token overrides (`[dt]`) before reaching for CSS classes.
- Tailwind utilities are valid for layout *around and between* components (`flex`, `grid`, `gap-*`, `p-*`, `w-*`).
- For color, always use PrimeNG CSS variables or `tailwindcss-primeui` semantic utilities (`text-primary`, `bg-surface-card`) — never raw Tailwind palette classes (`text-blue-500`, `bg-slate-100`).
- `host: { class: '...' }` is the correct place for layout utilities on the component root element.

See `docs/08-primeng.md` for the token system and `[dt]` overrides.
See `docs/09-tailwind4.md` for color rules, dark mode, and what not to do.
See `kdx-tailwind-design-system` for extending `@theme` and `@utility`.

### Prohibited Patterns

- Never `BehaviorSubject`, `NgRx`, or `NGXS` for state — use signals
- Never `FormControl`, `FormGroup`, `ReactiveFormsModule`, or `[(ngModel)]` — use Signal Forms (`kdx-angular-forms`)
- Never Jasmine or Jest — use Vitest (`kdx-angular-testing`)

---

## QA Audit Rules

Rules learned from production audits. Mandatory for all generated components.

### Explicit `standalone: true`

Always include `standalone: true` in `@Component()`. Angular 21 infers it, but explicit declaration is clearer and audit-friendly:

```typescript
@Component({
  standalone: true,           // ← always explicit
  selector: 'app-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button],
  template: `...`,
})
```

### HTML Nesting — `<p-button>` Containers

Never wrap `<p-button>` inside `<p>`. The `<p-button>` renders a `<button>` which is block-level; nesting it in `<p>` causes HTML parsing errors. Use `<div>` or `<span>` instead:

```html
<!-- BAD -->
<p><p-button label="Click" /></p>

<!-- GOOD -->
<div><p-button label="Click" /></div>
```

### Decorative Icons — `aria-hidden`

Add `aria-hidden="true"` to all decorative PrimeIcon `<i>` elements (icons that do not convey meaning beyond adjacent text):

```html
<i class="pi pi-check" aria-hidden="true"></i>
```

### PrimeNG CSS Variable Names

Always use PrimeNG variable names with the `--p-` prefix. Never use legacy unprefixed names:

| Correct | Wrong (legacy) |
|---|---|
| `var(--p-primary-color)` | `var(--primary-color-text)` |
| `var(--p-surface-ground)` | `var(--surface-ground)` |
| `var(--p-surface-0)` | `var(--surface-card)` |
| `var(--p-surface-200)` | `var(--surface-border)` |
