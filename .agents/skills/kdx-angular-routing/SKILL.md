---
name: kdx-angular-routing
description: Routing for Angular 21 CSR on AWS Amplify. Lazy loading, functional guards, resolvers, signal inputs for params. PrimeNG navigation components.
---

# Routing — Angular 21 CSR + AWS Amplify

> **FIRST:** invoke `kdx-design-system-use` for any UI/template decisions in routed components.
> This skill handles HOW to configure routes and navigation. Design system decisions come first.

CSR only. No SSR. Deployed to AWS Amplify Hosting. API on AppRunner at same domain via Amplify rewrites.

## app.config.ts

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { routes } from './app.routes';
import { authInterceptor, errorInterceptor } from './core/interceptors';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({ theme: { preset: Aura } }),
  ],
};
```

## app.routes.ts

```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./auth/login.component').then(m => m.Login) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell.component').then(m => m.Shell),
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.Dashboard), title: 'Dashboard' },
      { path: 'users', loadChildren: () => import('./features/users/users.routes').then(m => m.usersRoutes) },
      { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then(m => m.Settings), title: 'Settings' },
    ],
  },
  { path: '**', loadComponent: () => import('./shared/not-found.component').then(m => m.NotFound) },
];
```

## Feature Routes

```typescript
// features/users/users.routes.ts
import { Routes } from '@angular/router';

export const usersRoutes: Routes = [
  { path: '', loadComponent: () => import('./user-list.component').then(m => m.UserList), title: 'Users' },
  { path: ':id', loadComponent: () => import('./user-detail.component').then(m => m.UserDetail), title: 'User Detail' },
  { path: ':id/edit', loadComponent: () => import('./user-edit.component').then(m => m.UserEdit), title: 'Edit User' },
];
```

## Route Parameters — Signal Inputs

`withComponentInputBinding()` maps route params, query params, and resolved data to `input()`.

```typescript
@Component({
  selector: 'app-user-detail',
  template: `<h1>User {{ id() }}</h1>`,
})
export class UserDetail {
  id = input.required<string>();                    // from :id
  tab = input<string>('overview');                  // from ?tab=
  user = input.required<User>();                    // from resolve
}
```

## Styling

**PrimeNG navigation components first. Tailwind for shell structure only.**

- Use PrimeNG components for all navigation chrome: `p-menubar`, `p-panelmenu`, `p-breadcrumb`, `p-tabmenu`.
- Tailwind is valid for the structural shell — `flex`, `h-screen`, `overflow-hidden`, `flex-1`, `overflow-y-auto`, `p-*` on `<main>`.
- Never use raw Tailwind color classes for nav states — use PrimeNG component props (`severity`, `[dt]`) or CSS vars.

See `docs/08-primeng.md` for token overrides and `docs/09-tailwind4.md` for layout patterns.

## Shell Layout with PrimeNG

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Menubar } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Menubar],
  template: `
    <p-menubar [model]="menuItems" />
    <main class="p-4">
      <router-outlet />
    </main>
  `,
})
export class Shell {
  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/dashboard' },
    { label: 'Users', icon: 'pi pi-users', routerLink: '/users' },
    { label: 'Settings', icon: 'pi pi-cog', routerLink: '/settings' },
  ];
}
```

## Auth Guard

`APP_INITIALIZER` calls `auth.checkAuth()` before any route guard runs, so
`isAuthenticated()` is already hydrated from the httpOnly cookie. The guard's
`checkAuth()` fallback is a safety net only.

```typescript
// core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;  // Already hydrated by APP_INITIALIZER

  const valid = await auth.checkAuth();  // Fallback: try cookie → /api/auth/me/
  if (valid) return true;

  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
```

`isAuthenticated` is `computed(() => currentUser() !== null)` — no token in JS.
Auth state is hydrated by `APP_INITIALIZER` in `app.config.ts`:

```typescript
{
  provide: APP_INITIALIZER,
  multi: true,
  useFactory: () => {
    const auth = inject(AuthService);
    return () => auth.checkAuth();
  },
}
```

## Role Guard

```typescript
export const roleGuard = (roles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const userRole = auth.user()?.role;
    if (userRole && roles.includes(userRole)) return true;
    return router.createUrlTree(['/unauthorized']);
  };
};

// Usage
{ path: 'admin', canActivate: [authGuard, roleGuard(['admin'])], ... }
```

## Resolver

```typescript
import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';

export const userResolver: ResolveFn<User> = (route) => {
  return inject(UserService).getById(route.paramMap.get('id')!);
};

// Route
{ path: ':id', component: UserDetail, resolve: { user: userResolver } }

// Component — resolved data arrives as input
export class UserDetail {
  user = input.required<User>();
}
```

## Programmatic Navigation

```typescript
router = inject(Router);

goTo(id: string) { this.router.navigate(['/users', id]); }
search(q: string) { this.router.navigate(['/search'], { queryParams: { q } }); }
```

## Breadcrumbs with PrimeNG

```typescript
import { Breadcrumb } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';

@Component({
  imports: [Breadcrumb],
  template: `<p-breadcrumb [model]="items" [home]="home" />`,
})
export class PageBreadcrumb {
  items = input<MenuItem[]>([]);
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
}
```

## AWS Amplify — SPA Redirect

In `amplify.yml` or Amplify Console → Rewrites:

```
Source: </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>
Target: /index.html
Type: 200
```

This ensures all routes resolve to `index.html` for CSR.

---

## QA Audit Rules

Rules learned from production audits. Mandatory for all routing decisions.

### No `PreloadAllModules`

Never use `PreloadAllModules`. Use a selective preloading strategy with `data: { preload: true }` on individual routes:

```typescript
{ path: 'dashboard', loadComponent: () => import('./dashboard.component').then(m => m.Dashboard), data: { preload: true } },
{ path: 'settings', loadComponent: () => import('./settings.component').then(m => m.Settings) }, // not preloaded
```

### Every Built Component Must Be Routable

Every component that is built and has content **must** have a route. Unreachable components are an accessibility and SEO gap. If a component exists, wire it into the route tree.

### Public Pages Under Public Shell

Public pages (login, pricing, legal/terms/privacy) should be grouped under the public shell route group, not scattered at the root level:

```typescript
{
  path: '',
  loadComponent: () => import('./layout/public-shell.component').then(m => m.PublicShell),
  children: [
    { path: 'login', loadComponent: () => import('./auth/login.component').then(m => m.Login) },
    { path: 'pricing', loadComponent: () => import('./pages/pricing.component').then(m => m.Pricing) },
    { path: 'terms', loadComponent: () => import('./pages/terms.component').then(m => m.Terms) },
  ],
},
```

---

## API Proxy via Amplify Rewrites

```
Source: /api/<*>
Target: https://your-apprunner-service.awsapprunner.com/api/<*>
Type: 200
```

This proxies `/api/*` requests to AppRunner, avoiding CORS.
