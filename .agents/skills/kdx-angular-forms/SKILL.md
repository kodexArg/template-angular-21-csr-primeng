---
name: kdx-angular-forms
description: Forms for Angular 21 with Signal Forms API and PrimeNG form components. signal-based models, schema validation, PrimeNG inputs. One form pattern — no Reactive Forms, no template-driven.
---

# Forms — Angular 21 Signal Forms + PrimeNG

> **FIRST:** invoke `kdx-design-system-use` to decide WHAT PrimeNG form components to use.
> This skill handles HOW to write forms. Design system decisions come first.

Signal Forms is the only form API. No Reactive Forms, no template-driven, no ngModel for forms.

## Login Form

```typescript
import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { form, FormField, required, email, minLength } from '@angular/forms/signals';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { Message } from 'primeng/message';

// NOTE: Use `input pInputText type="password"` instead of `p-password`.
// PrimeNG's p-password is a wrapper component that does NOT implement FormValueControl,
// so [formField] cannot bind to it. Native inputs with pInputText directive work correctly.

interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, InputText, Button, FloatLabel, Message],
  template: `
    <form (submit)="onSubmit($event)" class="flex flex-col gap-4" style="max-width: 400px">
      <p-floatlabel variant="on">
        <input pInputText id="email" type="email" [formField]="loginForm.email" />
        <label for="email">Email</label>
      </p-floatlabel>
      @if (loginForm.email().touched() && loginForm.email().invalid()) {
        <p-message severity="error" [text]="loginForm.email().errors()[0].message" />
      }

      <p-floatlabel variant="on">
        <input pInputText id="password" type="password" [formField]="loginForm.password" />
        <label for="password">Password</label>
      </p-floatlabel>
      @if (loginForm.password().touched() && loginForm.password().invalid()) {
        <p-message severity="error" [text]="loginForm.password().errors()[0].message" />
      }

      <p-button type="submit" label="Sign in" [disabled]="loginForm().invalid()" [loading]="submitting()" />
    </form>
  `,
})
export class Login {
  private auth = inject(AuthService);
  submitting = signal(false);

  loginModel = signal<LoginData>({ email: '', password: '' });

  loginForm = form(this.loginModel, (s) => {
    required(s.email, { message: 'Email is required' });
    email(s.email, { message: 'Enter a valid email' });
    required(s.password, { message: 'Password is required' });
    minLength(s.password, 8, { message: 'Password must be at least 8 characters' });
  });

  onSubmit(event: Event) {
    event.preventDefault();
    submit(this.loginForm, async () => {
      this.submitting.set(true);
      try {
        await this.auth.login(this.loginModel());
      } finally {
        this.submitting.set(false);
      }
    });
  }
}
```

## Form Model

```typescript
interface UserProfile {
  name: string;
  email: string;
  role: string;
  preferences: {
    newsletter: boolean;
    theme: 'light' | 'dark';
  };
}

const model = signal<UserProfile>({
  name: '',
  email: '',
  role: 'user',
  preferences: { newsletter: false, theme: 'light' },
});

const profileForm = form(model);

// Access
profileForm.name().value();
profileForm.preferences.theme().value();

// Update
profileForm.name().value.set('Alice');
```

## Validation — Built-in

```typescript
import { form, required, email, min, max, minLength, maxLength, pattern } from '@angular/forms/signals';

const userForm = form(model, (s) => {
  required(s.name, { message: 'Required' });
  email(s.email, { message: 'Invalid email' });
  minLength(s.password, 8, { message: 'Min 8 chars' });
  min(s.age, 18, { message: 'Must be 18+' });
  pattern(s.phone, /^\d{3}-\d{3}-\d{4}$/, { message: 'Format: 555-123-4567' });
});
```

## Validation — Custom

```typescript
import { validate } from '@angular/forms/signals';

const signupForm = form(model, (s) => {
  validate(s.username, ({ value }) => {
    if (value().includes(' ')) return { kind: 'noSpaces', message: 'No spaces allowed' };
    return null;
  });
});
```

## Validation — Cross-Field

```typescript
const passwordForm = form(model, (s) => {
  required(s.password);
  required(s.confirmPassword);
  validate(s.confirmPassword, ({ value, valueOf }) => {
    if (value() !== valueOf(s.password)) return { kind: 'mismatch', message: 'Passwords do not match' };
    return null;
  });
});
```

## Validation — Async (HTTP)

```typescript
import { validateHttp } from '@angular/forms/signals';

const signupForm = form(model, (s) => {
  validateHttp(s.username, {
    request: ({ value }) => `/api/check-username/?u=${value()}`,
    onSuccess: (res: { taken: boolean }) =>
      res.taken ? { kind: 'taken', message: 'Already taken' } : null,
    onError: () => ({ kind: 'network', message: 'Could not verify' }),
  });
});
```

## Conditional Validation

```typescript
import { hidden, disabled } from '@angular/forms/signals';

const orderForm = form(model, (s) => {
  required(s.promoCode, {
    message: 'Promo code required',
    when: ({ valueOf }) => valueOf(s.applyDiscount),
  });
  hidden(s.companyName, ({ valueOf }) => valueOf(s.accountType) !== 'business');
  disabled(s.couponCode, ({ valueOf }) => valueOf(s.total) < 50);
});
```

## Field State

```typescript
const field = form.email();

field.valid()     // boolean
field.invalid()   // boolean
field.errors()    // ValidationError[]
field.pending()   // boolean (async validation)
field.touched()   // boolean
field.dirty()     // boolean
field.disabled()  // boolean
field.hidden()    // boolean
field.readonly()  // boolean
field.value()     // T
```

## Form-Level State

```typescript
form().valid()    // all fields valid
form().touched()  // any field touched
form().dirty()    // any field dirty
```

## Error Display with PrimeNG

```html
<p-floatlabel variant="on">
  <input pInputText [formField]="form.email" [class.ng-invalid]="form.email().touched() && form.email().invalid()" />
  <label>Email</label>
</p-floatlabel>
@if (form.email().touched() && form.email().invalid()) {
  @for (error of form.email().errors(); track error.kind) {
    <p-message severity="error" [text]="error.message" />
  }
}
@if (form.email().pending()) {
  <small class="text-color-secondary">Validating...</small>
}
```

## Dynamic Array Fields

```typescript
interface Order {
  items: Array<{ product: string; quantity: number }>;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, InputText, InputNumber, Button],
  template: `
    @for (item of orderForm.items; track $index; let i = $index) {
      <div class="flex gap-2 mb-2">
        <input pInputText [formField]="item.product" placeholder="Product" />
        <p-inputNumber [formField]="item.quantity" [min]="1" />
        <p-button icon="pi pi-trash" severity="danger" (onClick)="removeItem(i)" />
      </div>
    }
    <p-button label="Add Item" icon="pi pi-plus" (onClick)="addItem()" />
  `,
})
export class OrderForm {
  orderModel = signal<Order>({ items: [{ product: '', quantity: 1 }] });

  orderForm = form(this.orderModel, (s) => {
    applyEach(s.items, (item) => {
      required(item.product, { message: 'Product required' });
      min(item.quantity, 1, { message: 'Min 1' });
    });
  });

  addItem() {
    this.orderModel.update(m => ({ ...m, items: [...m.items, { product: '', quantity: 1 }] }));
  }
  removeItem(i: number) {
    this.orderModel.update(m => ({ ...m, items: m.items.filter((_, idx) => idx !== i) }));
  }
}
```

## Submit

```typescript
import { submit } from '@angular/forms/signals';

onSubmit(event: Event) {
  event.preventDefault();
  submit(this.form, async () => {
    await this.api.save(this.model());
    this.form().reset();
    this.model.set(initialValue);
  });
}
```

`submit()` marks all fields as touched. Runs callback only if valid.

## Styling

**PrimeNG first. Tailwind only for layout between form elements.**

- Use PrimeNG form components (`p-floatlabel`, `p-inputtext`, `pInputText` directive) for all input rendering.
- `flex flex-col gap-4` is the correct Tailwind pattern for vertical form stacking — no PrimeNG equivalent for structural form layout.
- `grid grid-cols-2 gap-4` for side-by-side field pairs.
- Never use raw Tailwind color classes for validation states — use PrimeNG's `ng-invalid` class and `p-message` component instead.

See `docs/08-primeng.md` for token overrides and `docs/09-tailwind4.md` for color rules.

## FormValueControl — Custom PrimeNG-Style Control

```typescript
import { Component, model, input, InputSignal, Signal, signal } from '@angular/core';
import { FormValueControl, ValidationError, WithOptionalField } from '@angular/forms/signals';

@Component({
  selector: 'app-star-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (star of stars; track $index) {
      <i class="pi cursor-pointer text-xl"
         [class.pi-star-fill]="$index < value()" [class.pi-star]="$index >= value()"
         [class.kdx-text-invalid]="invalid()"
         (click)="!readonly() && value.set($index + 1)"></i>
    }
  `,
})
export class StarRating implements FormValueControl<number> {
  readonly value = model<number>(0);
  readonly readonly = input(false);
  readonly invalid = input(false);
  readonly errors: InputSignal<readonly WithOptionalField<ValidationError>[]> = input([]);
  stars = Array(5);
}

// Usage: <app-star-rating [formField]="form.rating" />
```

---

## QA Audit Rules

Rules learned from production audits. Mandatory for all generated forms.

### Auth Forms — Client-Side Validation

Login and auth forms must always include client-side validation rules:
- **Email:** `required` + `email` validator
- **Password:** `required` + `minLength(8)` (or project minimum)

```typescript
const loginForm = form(model, (s) => {
  required(s.email, { message: 'Email is required' });
  email(s.email, { message: 'Enter a valid email' });
  required(s.password, { message: 'Password is required' });
  minLength(s.password, 8, { message: 'Password must be at least 8 characters' });
});
```

### Submit Button — Disable on Invalid

The submit button must be disabled when the form is **invalid**, not just when fields are empty. Use `form().invalid()` (not a manual empty check):

Never use manual empty checks like `!email() || !password()` — they bypass format and length validators.

```html
<p-button type="submit" label="Sign in"
          [disabled]="loginForm().invalid() || submitting()" />
```
