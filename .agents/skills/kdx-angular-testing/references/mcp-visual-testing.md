# MCP Playwright — Visual Validation

Agent-assisted visual smoke testing using the Playwright MCP server. This is NOT E2E testing — no test artifacts are produced, no CI integration. This is for the agent to verify its own UI output during development.

## Prerequisites

- Playwright MCP server is installed globally in `~/.claude/mcp.json`
- Angular dev server can be started via `mcp__angular__devserver_start`
- The MCP tools `mcp__playwright__*` are available in the session

## Full Workflow

### 1. Start Dev Server

```
mcp__angular__devserver_start
mcp__angular__devserver_wait_for_build
```

Wait for the build to complete before navigating.

### 2. Navigate to the Route

```
mcp__playwright__browser_navigate({ url: "http://localhost:4200/users" })
```

### 3. Take a Snapshot

```
mcp__playwright__browser_snapshot
```

The snapshot returns an accessibility tree — use it to verify:
- PrimeNG components rendered (buttons, tables, inputs visible in the tree)
- Text content correct
- ARIA labels and roles present
- Interactive elements accessible

### 4. Take a Screenshot

```
mcp__playwright__browser_take_screenshot
```

Use screenshots when layout/styling matters — the accessibility tree does not show visual positioning or colors.

### 5. Test Interactivity

```
mcp__playwright__browser_click({ element: "Submit button" })
mcp__playwright__browser_fill_form({ values: [{ selector: "input[name=email]", value: "test@example.com" }] })
mcp__playwright__browser_snapshot  // verify state changed
```

### 6. Test Responsive Layouts

```
mcp__playwright__browser_resize({ width: 375, height: 812 })  // iPhone
mcp__playwright__browser_snapshot
mcp__playwright__browser_resize({ width: 1920, height: 1080 })  // Desktop
```

### 7. Stop Dev Server

```
mcp__angular__devserver_stop
```

## PrimeNG Rendering Reference

What PrimeNG Angular selectors become in the rendered DOM:

| Angular Template | Rendered HTML |
|---|---|
| `<p-button label="Save">` | `<button class="p-button"><span>Save</span></button>` |
| `<p-table [value]="data">` | `<table class="p-datatable-table">` |
| `<p-dialog header="Confirm">` | `<div class="p-dialog">` (in overlay container) |
| `<p-dropdown>` | `<div class="p-select">` |
| `<p-inputText>` | `<input class="p-inputtext">` |
| `<p-message severity="error">` | `<div class="p-message p-message-error">` |
| `<p-progressSpinner>` | `<svg class="p-progress-spinner">` |
| `<p-tag value="Active">` | `<span class="p-tag">Active</span>` |
| `<p-card>` | `<div class="p-card">` |
| `<p-toolbar>` | `<div class="p-toolbar">` |

## What to Verify

### After generating a page:
- All PrimeNG components render (not blank or collapsed)
- Text content matches expected data
- Navigation links work
- Page title/heading correct

### After modifying styles:
- Layout unchanged (or changed as intended)
- Dark mode not broken (toggle via PrimeNG theme)
- Responsive breakpoints still work

### After adding a form:
- All fields visible and labeled
- Validation messages appear on invalid input
- Submit button disabled when form invalid
- Successful submission navigates or shows feedback

## Limitations

- MCP Playwright is ephemeral — snapshots/screenshots are per-session
- No CI/CD integration — use a future `kdx-angular-e2e` skill for pipeline tests
- Overlays (dialog, dropdown, tooltip) may need a click to trigger before verification
- Dev server must be running — if it crashes, restart via MCP tools
- The accessibility tree from `browser_snapshot` does not reflect CSS-only visual states (hover colors, transitions)
