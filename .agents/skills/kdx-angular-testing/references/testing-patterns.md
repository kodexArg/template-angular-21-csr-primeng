# Advanced Testing Patterns

## Snapshot Testing

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

describe('UserCard', () => {
  let fixture: ComponentFixture<UserCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCard],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(UserCard);
  });

  it('should match snapshot', () => {
    fixture.componentRef.setInput('user', { id: '1', name: 'Alice', email: 'alice@example.com' });
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toMatchSnapshot();
  });
});
```

Use snapshots sparingly — only for components with stable, well-defined output. Avoid for components with dynamic content or PrimeNG overlays.

## Parameterized Tests

```typescript
describe('Validator', () => {
  it.each([
    { input: '', expected: false },
    { input: 'test', expected: false },
    { input: 'test@example.com', expected: true },
    { input: 'invalid@', expected: false },
  ])('should validate email "$input" as $expected', ({ input, expected }) => {
    expect(isValidEmail(input)).toBe(expected);
  });
});
```

## Fake Timers

Use `vi.useFakeTimers()` for debounced search, auto-refresh, or timeout logic:

```typescript
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

describe('Debounced Search', () => {
  let fixture: ComponentFixture<Search>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Search],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Search);
    vi.useFakeTimers();
  });

  afterEach(() => vi.useRealTimers());

  it('should debounce search input', async () => {
    fixture.detectChanges();

    fixture.componentInstance.query.set('test');
    expect(fixture.componentInstance.results()).toEqual([]);

    vi.advanceTimersByTime(300);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.results().length).toBeGreaterThan(0);
  });
});
```

## Module Mocking

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

vi.mock('./analytics.service', () => ({
  AnalyticsService: class {
    track = vi.fn();
    identify = vi.fn();
  },
}));

describe('with mocked analytics', () => {
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
  });

  it('should track page view', () => {
    const analytics = TestBed.inject(AnalyticsService);
    fixture.detectChanges();

    expect(analytics.track).toHaveBeenCalledWith('dashboard_viewed');
  });
});
```

## Component Harnesses

Use Angular CDK harnesses for components with complex DOM interaction:

### Creating a Harness

```typescript
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

export class CounterHarness extends ComponentHarness {
  static hostSelector = 'app-counter';

  private getIncrementButton = this.locatorFor('button.increment');
  private getCountDisplay = this.locatorFor('.count');

  async increment(): Promise<void> {
    const button = await this.getIncrementButton();
    await button.click();
  }

  async getCount(): Promise<number> {
    const display = await this.getCountDisplay();
    return parseInt(await display.text(), 10);
  }

  static with(options: { count?: number } = {}): HarnessPredicate<CounterHarness> {
    return new HarnessPredicate(CounterHarness, options)
      .addOption('count', options.count, async (harness, count) => {
        return (await harness.getCount()) === count;
      });
  }
}
```

### Using Harnesses

```typescript
import { TestbedHarnessEnvironment, HarnessLoader } from '@angular/cdk/testing/testbed';

describe('Counter with Harness', () => {
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Counter],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    const fixture = TestBed.createComponent(Counter);
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should increment count', async () => {
    const counter = await loader.getHarness(CounterHarness);
    expect(await counter.getCount()).toBe(0);
    await counter.increment();
    expect(await counter.getCount()).toBe(1);
  });
});
```

## Testing Paginated Paginated Responses

```typescript
import { createPaginatedPage } from '../../test/factories';

it('should render paginated table', () => {
  const users = [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
  ];

  httpMock.expectOne('/api/users/?page=1&page_size=20')
    .flush(createPaginatedPage(users, 50));
  fixture.detectChanges();

  const rows = fixture.nativeElement.querySelectorAll('p-table tbody tr');
  expect(rows.length).toBe(2);
});

it('should paginate on page change', () => {
  httpMock.expectOne('/api/users/?page=1&page_size=20')
    .flush(createPaginatedPage([{ id: '1', name: 'Alice' }], 50));
  fixture.detectChanges();

  fixture.componentInstance.page.set(2);
  fixture.detectChanges();

  httpMock.expectOne('/api/users/?page=2&page_size=20')
    .flush(createPaginatedPage([{ id: '21', name: 'Charlie' }], 50));
  fixture.detectChanges();

  expect(fixture.nativeElement.textContent).toContain('Charlie');
});
```

## Testing Interceptors

```typescript
import { vi, describe, it, expect } from 'vitest';
import { HttpRequest, HttpHandlerFn, HttpResponse } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';

describe('authInterceptor', () => {
  it('should add withCredentials', async () => {
    const req = new HttpRequest('GET', '/api/users/');
    let capturedRequest: HttpRequest<unknown> | undefined;

    const next: HttpHandlerFn = (cloned) => {
      capturedRequest = cloned as HttpRequest<unknown>;
      return of(new HttpResponse());
    };

    await firstValueFrom(authInterceptor(req, next));

    expect(capturedRequest?.withCredentials).toBe(true);
  });
});
```

## Coverage Configuration

Coverage is configured via `angular.json` — no separate `vite.config.ts` needed:

```bash
ng test --code-coverage
```

Coverage reports are generated in `coverage/`. CI should enforce thresholds via the build pipeline, not in test config.
