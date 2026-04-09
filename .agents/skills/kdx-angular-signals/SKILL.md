---
name: kdx-angular-signals
description: Signal-based state management for Angular 21. signal(), computed(), linkedSignal(), effect(). Service stores with signals. No RxJS for state — only for interop.
---

# Signals — Angular 21

> **FIRST:** invoke `kdx-design-system-use` for any UI/template decisions.
> This skill handles HOW to manage state with signals. Design system decisions come first.

Signals are the only state primitive. No BehaviorSubject, no NgRx, no NGXS.

## signal() — Writable State

```typescript
import { signal } from '@angular/core';

const count = signal(0);
count();              // read: 0
count.set(5);         // replace
count.update(c => c + 1); // derive from current

const user = signal<User | null>(null);
```

## computed() — Derived State

```typescript
import { computed } from '@angular/core';

const items = signal<Item[]>([]);
const filter = signal('');

const filtered = computed(() => {
  const q = filter().toLowerCase();
  return items().filter(i => i.name.toLowerCase().includes(q));
});

const total = computed(() =>
  filtered().reduce((sum, i) => sum + i.price, 0)
);
```

## linkedSignal() — Dependent State with Auto-Reset

```typescript
import { linkedSignal } from '@angular/core';

const options = signal(['A', 'B', 'C']);
const selected = linkedSignal(() => options()[0]);

// User picks 'B' → selected() === 'B'
// options change → selected() auto-resets to new first

// With previous value preservation
const selectedItem = linkedSignal<Item[], Item | null>({
  source: () => items(),
  computation: (newItems, previous) => {
    const prev = previous?.value;
    if (prev && newItems.some(i => i.id === prev.id)) return prev;
    return newItems[0] ?? null;
  },
});
```

## effect() — Side Effects

```typescript
import { effect } from '@angular/core';

@Component({...})
export class Search {
  query = signal('');

  _ = effect(() => {
    console.log('Count changed:', this.count());
  });

  // With cleanup — use constructor when onCleanup is needed
  constructor() {
    effect((onCleanup) => {
      const timer = setInterval(() => this.poll(), 5000);
      onCleanup(() => clearInterval(timer));
    });
  }
}
```

Rules:
- Prefer field initializer (`_ = effect(...)`) for simple effects
- Use constructor only when `onCleanup` is required
- Auto-cleaned on component destroy

## Component State

```typescript
@Component({
  selector: 'app-todo-list',
  imports: [InputText, Button, Checkbox],
  template: `
    <div class="flex gap-2 mb-3">
      <input pInputText [value]="newTodo()" (input)="newTodo.set($any($event.target).value)" />
      <p-button label="Add" (onClick)="addTodo()" [disabled]="!canAdd()" />
    </div>
    @for (todo of filteredTodos(); track todo.id) {
      <div class="flex align-items-center gap-2 mb-2">
        <p-checkbox [binary]="true" [(checked)]="todo.done" (onChange)="toggle(todo.id)" />
        <span [class.line-through]="todo.done">{{ todo.text }}</span>
      </div>
    }
    <p class="text-sm text-color-secondary">{{ remaining() }} remaining</p>
  `,
})
export class TodoList {
  todos = signal<Todo[]>([]);
  newTodo = signal('');
  filter = signal<'all' | 'active' | 'done'>('all');

  canAdd = computed(() => this.newTodo().trim().length > 0);
  filteredTodos = computed(() => {
    const todos = this.todos();
    switch (this.filter()) {
      case 'active': return todos.filter(t => !t.done);
      case 'done': return todos.filter(t => t.done);
      default: return todos;
    }
  });
  remaining = computed(() => this.todos().filter(t => !t.done).length);

  addTodo() {
    const text = this.newTodo().trim();
    if (!text) return;
    this.todos.update(t => [...t, { id: crypto.randomUUID(), text, done: false }]);
    this.newTodo.set('');
  }

  toggle(id: string) {
    this.todos.update(t => t.map(i => i.id === id ? { ...i, done: !i.done } : i));
  }
}
```

## Service Store Pattern

The only way to share state across components.

```typescript
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface ProductState {
  products: Product[];
  selectedId: string | null;
  filter: string;
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProductStore {
  private http = inject(HttpClient);

  private state = signal<ProductState>({
    products: [],
    selectedId: null,
    filter: '',
    loading: false,
    error: null,
  });

  // Read-only selectors
  readonly products = computed(() => this.state().products);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly filtered = computed(() => {
    const { products, filter } = this.state();
    if (!filter) return products;
    return products.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));
  });
  readonly selected = computed(() => {
    const { products, selectedId } = this.state();
    return products.find(p => p.id === selectedId) ?? null;
  });

  // Actions
  setFilter(filter: string) { this.state.update(s => ({ ...s, filter })); }
  select(id: string | null) { this.state.update(s => ({ ...s, selectedId: id })); }

  // HttpClient for mutations — httpResource() is for reads only
  async load() {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    try {
      const products = await firstValueFrom(this.http.get<Product[]>('/api/products'));
      this.state.update(s => ({ ...s, products, loading: false }));
    } catch {
      this.state.update(s => ({ ...s, loading: false, error: 'Failed to load' }));
    }
  }

  async add(product: Omit<Product, 'id'>) {
    // HttpClient for mutations — httpResource() is for reads only
    const created = await firstValueFrom(this.http.post<Product>('/api/products', product));
    this.state.update(s => ({ ...s, products: [...s.products, created] }));
  }
}
```

## RxJS Interop — Debounce and Streams Only

```typescript
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';

// Observable → Signal
counter = toSignal(interval(1000), { initialValue: 0 });

// Signal → Observable → back to Signal (debounce only — no HTTP here)
debouncedQuery = toSignal(
  toObservable(this.query).pipe(
    debounceTime(300),
    distinctUntilChanged(),
  ),
  { initialValue: '' }
);
```

## Signal Equality

```typescript
const user = signal<User>(
  { id: 1, name: 'Alice' },
  { equal: (a, b) => a.id === b.id }
);
```

## Untracked Reads

```typescript
import { untracked } from '@angular/core';

const result = computed(() => {
  const aVal = a();
  const bVal = untracked(() => b()); // won't trigger recomputation
  return aVal + bVal;
});
```
