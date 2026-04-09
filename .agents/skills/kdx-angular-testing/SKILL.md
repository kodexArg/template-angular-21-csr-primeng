---
name: kdx-angular-testing
description: Write unit and integration tests for Angular 21 with Vitest and TestBed. Zoneless, OnPush, signal inputs, signal stores, httpResource, Signal Forms, PrimeNG components. MCP Playwright visual validation. No Jasmine, no Jest, no Reactive Forms.
---

# Testing — Angular 21 + Vitest

> This skill handles HOW to test. Every component, service, pipe, and directive gets a co-located `*.spec.ts` file.
> For visual validation after generating UI, use the MCP Playwright workflow at the end of this skill.

Vitest is the only test runner. Never Jasmine, never Jest, never Karma.

## Test Setup

Every `TestBed.configureTestingModule` must include `provideZonelessChangeDetection()`. This project is zoneless — no Zone.js, no `NgZone`, no `fakeAsync` zone patches.

```typescript
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [MyComponent],
    providers: [
      provideZonelessChangeDetection(),
    ],
  }).compileComponents();
});
```

### Full Test Setup with HTTP and PrimeNG

```typescript
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [UserList],
    providers: [
      provideZonelessChangeDetection(),
      provideHttpClient(),
      provideHttpClientTesting(),
      provideAnimationsAsync(),
      providePrimeNG({ theme: { preset: Aura } }),
    ],
  }).compileComponents();

  httpMock = TestBed.inject(HttpTestingController);
});

afterEach(() => {
  httpMock.verify();
});
```

### Running Tests

```bash
ng test                          # single run
ng test --watch                  # watch mode
ng test --code-coverage          # with coverage
ng test --include='**/user*.spec.ts'  # filter
```

## Component Testing

### Standalone Component with Signal Inputs

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { UserCard } from './user-card';

describe('UserCard', () => {
  let fixture: ComponentFixture<UserCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCard],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(UserCard);
  });

  it('should display the user name', () => {
    fixture.componentRef.setInput('name', 'Alice');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Alice');
  });

  it('should emit selected on click', () => {
    fixture.componentRef.setInput('id', '42');
    fixture.componentRef.setInput('name', 'Alice');
    fixture.detectChanges();

    let emitted: string | undefined;
    fixture.componentInstance.selected.subscribe(v => emitted = v);

    fixture.nativeElement.querySelector('p-button button')?.click();

    expect(emitted).toBe('42');
  });
});
```

Always use `fixture.componentRef.setInput()` for signal inputs. Never set inputs directly on the component instance.

### OnPush Components

All components in this project use `ChangeDetectionStrategy.OnPush`. After `setInput()`, always call `fixture.detectChanges()`:

```typescript
it('should update when input changes', () => {
  fixture.componentRef.setInput('data', { name: 'Initial' });
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('Initial');

  fixture.componentRef.setInput('data', { name: 'Updated' });
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('Updated');
});
```

### Testing Computed Signals in Components

```typescript
it('should compute filtered list', () => {
  const component = fixture.componentInstance;
  component.todos.set([
    { id: '1', text: 'A', done: false },
    { id: '2', text: 'B', done: true },
  ]);
  component.filter.set('active');

  expect(component.filteredTodos()).toEqual([{ id: '1', text: 'A', done: false }]);
  expect(component.remaining()).toBe(1);
});
```

### Testing PrimeNG Components in Templates

PrimeNG components render their own DOM. Query the rendered HTML, not the Angular selectors:

```typescript
// p-button renders <button class="p-button">
fixture.nativeElement.querySelector('p-button button')?.click();

// p-tag renders <span class="p-tag">
const tag = fixture.nativeElement.querySelector('p-tag .p-tag');
expect(tag?.textContent).toContain('Active');

// p-table renders <table> with <tr> rows
const rows = fixture.nativeElement.querySelectorAll('p-table tbody tr');
expect(rows.length).toBe(3);

// p-message renders <div class="p-message">
const msg = fixture.nativeElement.querySelector('p-message .p-message-text');
expect(msg?.textContent).toContain('Error');

// p-dialog — must be opened first
fixture.componentRef.setInput('visible', true);
fixture.detectChanges();
const dialog = document.querySelector('.p-dialog'); // renders in overlay
expect(dialog?.textContent).toContain('Confirm');
```

### Testing @defer Blocks

```typescript
it('should render deferred content', async () => {
  const fixture = TestBed.createComponent(LazySection);
  fixture.detectChanges();

  // Placeholder shown initially
  expect(fixture.nativeElement.textContent).toContain('Loading');

  // Trigger deferred loading
  await fixture.whenStable();
  fixture.detectChanges();

  expect(fixture.nativeElement.querySelector('app-heavy-chart')).toBeTruthy();
});
```

## Service Testing

### Signal Store Service

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { CounterStore } from './counter.store';

describe('CounterStore', () => {
  let store: CounterStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    store = TestBed.inject(CounterStore);
  });

  it('should increment', () => {
    expect(store.count()).toBe(0);
    store.increment();
    expect(store.count()).toBe(1);
  });

  it('should compute doubled', () => {
    store.increment();
    store.increment();
    expect(store.doubled()).toBe(4);
  });

  it('should reset', () => {
    store.increment();
    store.reset();
    expect(store.count()).toBe(0);
  });
});
```

### Service with HttpClient

```typescript
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should fetch user by id', () => {
    const mock = { id: '1', name: 'Alice' };

    service.getById('1').subscribe(user => {
      expect(user).toEqual(mock);
    });

    const req = httpMock.expectOne('/api/users/1/');
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });
});
```

## httpResource Testing

```typescript
@Component({
  imports: [ProgressSpinner, Message],
  template: `
    @switch (userResource.status()) {
      @case ('loading') { <p-progressSpinner /> }
      @case ('error') { <p-message severity="error" text="Failed" /> }
      @case ('resolved') { <h1>{{ userResource.value()!.name }}</h1> }
    }
  `,
})
export class UserProfile {
  userId = signal('1');
  userResource = httpResource<User>(() => `/api/users/${this.userId()}/`);
}

describe('UserProfile', () => {
  let httpMock: HttpTestingController;
  let fixture: ComponentFixture<UserProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfile],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimationsAsync(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(UserProfile);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should show loading then user name', () => {
    expect(fixture.nativeElement.querySelector('p-progressSpinner')).toBeTruthy();

    httpMock.expectOne('/api/users/1/').flush({ id: '1', name: 'Alice' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Alice');
  });

  it('should show error on failure', () => {
    httpMock.expectOne('/api/users/1/')
      .flush('Not found', { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('p-message')).toBeTruthy();
  });

  it('should refetch when userId changes', () => {
    httpMock.expectOne('/api/users/1/').flush({ id: '1', name: 'Alice' });
    fixture.detectChanges();

    fixture.componentInstance.userId.set('2');
    fixture.detectChanges();

    httpMock.expectOne('/api/users/2/').flush({ id: '2', name: 'Bob' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Bob');
  });
});
```

## Signal Forms Testing

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('LoginForm', () => {
  let fixture: ComponentFixture<LoginForm>;
  let component: LoginForm;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginForm],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be invalid when empty', () => {
    expect(component.loginForm().invalid()).toBeTrue();
  });

  it('should be valid with correct data', () => {
    component.model.set({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(component.loginForm().valid()).toBeTrue();
  });

  it('should show email validation error', () => {
    component.model.set({ email: 'invalid', password: '' });
    fixture.detectChanges();

    expect(component.loginForm.email().invalid()).toBeTrue();
  });

  it('should disable submit button when invalid', () => {
    const button = fixture.nativeElement.querySelector('p-button button');
    expect(button?.disabled).toBeTrue();
  });

  it('should submit when valid', () => {
    component.model.set({
      email: 'test@example.com',
      password: 'secret',
    });
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('p-button button');
    button?.click();

    expect(component.submitted()).toBeTrue();
  });
});
```

## Router Testing

### RouterTestingHarness

```typescript
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';

describe('UserPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([
          { path: 'users/:id', component: UserPage },
        ]),
      ],
    }).compileComponents();
  });

  it('should receive route param as signal input', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/users/42', UserPage);

    expect(component.id()).toBe('42');
  });
});
```

### Testing Guards

```typescript
import { vi } from 'vitest';

describe('authGuard', () => {
  const mockAuth = {
    currentUser: signal<User | null>(null),
    checkAuth: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: mockAuth },
        provideRouter([
          { path: 'login', component: LoginPage },
          { path: 'dashboard', component: DashboardPage, canActivate: [authGuard] },
        ]),
      ],
    }).compileComponents();
  });

  it('should allow when authenticated', async () => {
    mockAuth.currentUser.set({ id: '1', name: 'Alice' });
    mockAuth.checkAuth.mockResolvedValue(true);

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/dashboard');

    expect(harness.routeNativeElement?.textContent).toContain('Dashboard');
  });

  it('should redirect to login when not authenticated', async () => {
    mockAuth.checkAuth.mockResolvedValue(false);

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/dashboard');

    expect(TestBed.inject(Router).url).toBe('/login');
  });
});
```

## Mocking

### vi.fn() for Service Mocks

```typescript
import { vi } from 'vitest';
import { signal, computed } from '@angular/core';

const mockAuth = {
  currentUser: signal<User | null>(null),
  isAuthenticated: computed(() => mockAuth.currentUser() !== null),
  login: vi.fn(),
  logout: vi.fn(),
};

beforeEach(async () => {
  vi.clearAllMocks();

  await TestBed.configureTestingModule({
    imports: [ProtectedPage],
    providers: [
      provideZonelessChangeDetection(),
      { provide: AuthService, useValue: mockAuth },
    ],
  }).compileComponents();
});

it('should show content when authenticated', () => {
  mockAuth.currentUser.set({ id: '1', name: 'Alice' });

  const fixture = TestBed.createComponent(ProtectedPage);
  fixture.detectChanges();

  expect(fixture.nativeElement.querySelector('.protected-content')).toBeTruthy();
});
```

### vi.spyOn for Partial Mocking

```typescript
it('should call navigate on submit', () => {
  const router = TestBed.inject(Router);
  const spy = vi.spyOn(router, 'navigate');

  component.onSubmit();

  expect(spy).toHaveBeenCalledWith(['/dashboard']);
});
```

### Parameterized Tests

```typescript
it.each([
  { input: '', expected: false },
  { input: 'bad', expected: false },
  { input: 'test@example.com', expected: true },
])('should validate "$input" as $expected', ({ input, expected }) => {
  expect(isValidEmail(input)).toBe(expected);
});
```

## Pipe & Directive Testing

### Pipe — TestBed

```typescript
describe('TruncatePipe', () => {
  let pipe: TruncatePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), TruncatePipe],
    });
    pipe = TestBed.inject(TruncatePipe);
  });

  it('should truncate long strings', () => {
    expect(pipe.transform('Hello World', 5)).toBe('Hello...');
  });

  it('should not truncate short strings', () => {
    expect(pipe.transform('Hi', 10)).toBe('Hi');
  });
});
```

### Directive — Host Component

```typescript
@Component({
  imports: [HighlightDirective],
  template: `<p appHighlight="lightblue">Test</p>`,
})
class TestHost {}

describe('HighlightDirective', () => {
  let fixture: ComponentFixture<TestHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
  });

  it('should apply background color', () => {
    fixture.detectChanges();

    const p = fixture.nativeElement.querySelector('p');
    expect(p.style.backgroundColor).toBe('lightblue');
  });
});
```

## Test Utilities

### Factory Functions for Test Data

```typescript
// test/factories.ts
export const createUser = (overrides: Partial<User> = {}): User => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  ...overrides,
});

export const createDRFPage = <T>(results: T[], count?: number): DRFPaginated<T> => ({
  count: count ?? results.length,
  next: null,
  previous: null,
  results,
});
```

### setSignalInput Helper

```typescript
export function setSignalInput<T>(
  fixture: ComponentFixture<any>,
  name: string,
  value: T,
): void {
  fixture.componentRef.setInput(name, value);
  fixture.detectChanges();
}

// Usage
setSignalInput(fixture, 'user', createUser({ name: 'Alice' }));
```

## Visual Validation — MCP Playwright

After generating or modifying a component, use the Playwright MCP tools to visually verify rendering. This is agent-assisted smoke testing, not CI — no test artifacts are produced.

### Workflow

1. Start the dev server: `mcp__angular__devserver_start`
2. Wait for build: `mcp__angular__devserver_wait_for_build`
3. Navigate: `mcp__playwright__browser_navigate` to the component's route
4. Snapshot: `mcp__playwright__browser_snapshot` to get the accessibility tree
5. Take a Screenshot: `mcp__playwright__browser_take_screenshot` for visual check
6. Verify: PrimeNG components render correctly (buttons have `p-button` class, tables render `<table>`, dialogs have correct content)
7. Stop: `mcp__angular__devserver_stop` when done

### What to Check

- PrimeNG components rendered (not just Angular selectors in DOM)
- Layout correct (Tailwind grid/flex applied)
- Dark mode works (if applicable)
- Responsive breakpoints (use `mcp__playwright__browser_resize`)
- Interactive state (click buttons, open dialogs, fill forms via MCP tools)

### When to Use

- After generating a new page or component with PrimeNG
- After changing layout or styling
- When the user asks to "check" or "verify" the UI
- NOT for every unit test — unit tests use Vitest

For advanced patterns (snapshots, concurrent tests, harnesses, fake timers), see [references/testing-patterns.md](references/testing-patterns.md).
For MCP visual testing details, see [references/mcp-visual-testing.md](references/mcp-visual-testing.md).

---

## QA Audit Rules

Rules learned from production audits. Mandatory for all test code.

### Always provideZonelessChangeDetection()

Every `TestBed.configureTestingModule` must include `provideZonelessChangeDetection()`. Tests without it will pass locally but mask zoneless compatibility issues:

```typescript
// BAD — masks zone dependency bugs
TestBed.configureTestingModule({ imports: [MyComponent] });

// GOOD
TestBed.configureTestingModule({
  imports: [MyComponent],
  providers: [provideZonelessChangeDetection()],
});
```

### Never Set Signal Inputs Directly

Use `fixture.componentRef.setInput()`, not direct property assignment. Direct assignment bypasses the input binding mechanism:

```typescript
// BAD — bypasses input signal binding
component.name = 'Alice';

// GOOD
fixture.componentRef.setInput('name', 'Alice');
fixture.detectChanges();
```

### Always Verify httpMock in afterEach

Every test suite using `HttpTestingController` must call `httpMock.verify()` in `afterEach`. Unverified requests hide bugs:

```typescript
afterEach(() => {
  httpMock.verify(); // ← mandatory
});
```

### Never Use Jasmine APIs

No `jasmine.createSpy()`, `jasmine.createSpyObj()`, `jasmine.clock()`, or `spyOn()` (the Jasmine global). Always use Vitest:

```typescript
// BAD
const spy = jasmine.createSpy();
spyOn(service, 'method');

// GOOD
const spy = vi.fn();
vi.spyOn(service, 'method');
```

### Co-locate Test Files

Every `*.ts` file gets a `*.spec.ts` next to it. Never put tests in a separate `tests/` directory:

```
src/app/features/user/
  user-card.ts
  user-card.spec.ts      ← same directory
  user.service.ts
  user.service.spec.ts   ← same directory
```

### PrimeNG Provider in Integration Tests

When testing components that render PrimeNG components (tables, dialogs, overlays), include `provideAnimationsAsync()` and `providePrimeNG()`. Missing providers cause silent rendering failures:

```typescript
providers: [
  provideZonelessChangeDetection(),
  provideAnimationsAsync(),         // ← required for PrimeNG animations
  providePrimeNG({ theme: { preset: Aura } }),
],
```
