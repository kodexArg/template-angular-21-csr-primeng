---
name: kdx-angular-http
description: HTTP data fetching for Angular 21 with httpResource() and HttpClient. Interceptors, pagination, file upload. No TanStack Query.
---

# HTTP — Angular 21

> **FIRST:** invoke `kdx-design-system-use` for any UI/template decisions when displaying fetched data.
> This skill handles HOW to fetch data. Design system decisions come first.

## httpResource() — Primary Data Fetching

```typescript
import { Component, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Message } from 'primeng/message';
import { Button } from 'primeng/button';

interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-user-profile',
  imports: [ProgressSpinner, Message, Button],
  template: `
    @switch (userResource.status()) {
      @case ('loading') { <p-progressSpinner /> }
      @case ('error') {
        <p-message severity="error" text="Failed to load user" />
        <p-button label="Retry" (onClick)="userResource.reload()" />
      }
      @case ('resolved') {
        <h1>{{ userResource.value()!.name }}</h1>
        <p>{{ userResource.value()!.email }}</p>
      }
    }
  `,
})
export class UserProfile {
  userId = signal('123');
  userResource = httpResource<User>(() => `/api/users/${this.userId()}/`);
}
```

### Request Options

```typescript
// Simple GET
users = httpResource<User[]>(() => '/api/users/');

// Full request config
users = httpResource<User[]>(() => ({
  url: '/api/users/',
  method: 'GET',
  headers: { 'Authorization': `Bearer ${this.token()}` },
  params: { page: '1', page_size: '20' },
}));

// With default value
users = httpResource<User[]>(() => '/api/users/', { defaultValue: [] });

// Conditional — skip when undefined
user = httpResource<User>(() => {
  const id = this.userId();
  return id ? `/api/users/${id}/` : undefined;
});
```

### Resource State

```typescript
resource.value()      // T | undefined
resource.hasValue()   // boolean
resource.error()      // HttpErrorResponse | undefined
resource.isLoading()  // boolean
resource.status()     // 'idle' | 'loading' | 'reloading' | 'resolved' | 'error' | 'local'
resource.reload()     // manual refetch
resource.set(value)   // local override
resource.update(fn)   // local transform
```

## Service Layer — CRUD

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private base = '/api/users';

  getAll() { return this.http.get<User[]>(`${this.base}/`); }
  getById(id: string) { return this.http.get<User>(`${this.base}/${id}/`); }
  create(data: CreateUserDto) { return this.http.post<User>(`${this.base}/`, data); }
  update(id: string, data: Partial<User>) { return this.http.patch<User>(`${this.base}/${id}/`, data); }
  delete(id: string) { return this.http.delete<void>(`${this.base}/${id}/`); }
}
```


## Interceptors

### Auth Interceptor

Cookie-based auth — adds `withCredentials: true` to every request so the browser
automatically sends httpOnly auth cookies cross-origin (Amplify ↔ AppRunner).

```typescript
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req.clone({ withCredentials: true }));
};
```

No token injection, no `Authorization: Bearer` header. The server reads the
`access_token` httpOnly cookie via `CookieJWTAuthentication`.

### Error Interceptor

Uses a Promise-based refresh queue to coalesce concurrent 401 retries (signal-first; no `BehaviorSubject`):

```typescript
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, from, switchMap, throwError } from 'rxjs';

let refreshPromise: Promise<boolean> | null = null;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/')) {
        if (!refreshPromise) {
          refreshPromise = inject(AuthService).refreshSession()
            .finally(() => { refreshPromise = null; });
        }
        return from(refreshPromise).pipe(
          switchMap(ok => ok ? next(req) : throwError(() => error))
        );
      }
      return throwError(() => error);
    })
  );
};
```

### Register in app.config.ts

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({ theme: { preset: Aura } }),
  ],
};
```

## Paginated Response

```typescript
interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Component({
  imports: [Table, Paginator, ProgressSpinner],
  template: `
    @if (usersResource.isLoading()) {
      <p-progressSpinner />
    } @else if (usersResource.hasValue()) {
      <p-table [value]="usersResource.value()!.results" [lazy]="true"
               [totalRecords]="usersResource.value()!.count"
               (onLazyLoad)="onPage($event)" [rows]="pageSize()">
        <ng-template #header>
          <tr><th>Name</th><th>Email</th></tr>
        </ng-template>
        <ng-template #body let-user>
          <tr><td>{{ user.name }}</td><td>{{ user.email }}</td></tr>
        </ng-template>
      </p-table>
    }
  `,
})
export class UserList {
  page = signal(1);
  pageSize = signal(20);

  usersResource = httpResource<Paginated<User>>(() => ({
    url: '/api/users/',
    params: { page: this.page().toString(), page_size: this.pageSize().toString() },
  }));

  onPage(event: any) {
    this.page.set(Math.floor(event.first / event.rows) + 1);
  }
}
```

## File Upload

```typescript
import { HttpEventType } from '@angular/common/http';
import { FileUpload } from 'primeng/fileupload';

@Component({
  imports: [FileUpload, ProgressBar],
  template: `
    <p-fileUpload mode="basic" chooseLabel="Upload" (onSelect)="onUpload($event)" />
    @if (progress() !== null) {
      <p-progressBar [value]="progress()!" />
    }
  `,
})
export class DocumentUpload {
  private http = inject(HttpClient);
  progress = signal<number | null>(null);

  onUpload(event: any) {
    const file: File = event.files[0];
    const formData = new FormData();
    formData.append('file', file);

    this.http.post('/api/documents/', formData, {
      reportProgress: true,
      observe: 'events',
    // subscribe is valid here — upload progress requires imperative stream
    }).subscribe(ev => {
      if (ev.type === HttpEventType.UploadProgress && ev.total) {
        this.progress.set(Math.round(100 * ev.loaded / ev.total));
      } else if (ev.type === HttpEventType.Response) {
        this.progress.set(null);
      }
    });
  }
}
```

## Debounced Search

Debounce the input signal before passing it to `httpResource()`. No RxJS pipeline needed.

```typescript
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({...})
export class Search {
  query = signal('');

  // Debounce via RxJS interop — httpResource reads debouncedQuery reactively
  private debouncedQuery = toSignal(
    toObservable(this.query).pipe(debounceTime(300), distinctUntilChanged()),
    { initialValue: '' }
  );

  results = httpResource<Paginated<Result>>(() => {
    const q = this.debouncedQuery();
    return q.length >= 2 ? { url: '/api/search/', params: { q } } : undefined;
  }, { defaultValue: { count: 0, next: null, previous: null, results: [] } });
}
```

---

## QA Audit Rules

Rules learned from production audits. Mandatory for all HTTP/auth code.

### Auth Fast-Path — Skip Redundant Server Calls

`checkAuth()` must skip the server call if the user signal is already populated. This prevents a double `GET /api/auth/me/` on cold navigation (APP_INITIALIZER + guard fallback):

```typescript
async checkAuth(): Promise<boolean> {
  if (this.currentUser()) return true;  // ← fast-path
  try {
    const user = await firstValueFrom(this.http.get<User>('/api/auth/me/'));
    this.currentUser.set(user);
    return true;
  } catch {
    this.currentUser.set(null);
    return false;
  }
}
```

### Error Interceptor — Promise-Based Refresh Queue

See the canonical `errorInterceptor` in the **Interceptors** section above.
