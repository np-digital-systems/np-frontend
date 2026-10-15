# np-frontend

Next.js 16 (App Router, React 19, React Compiler) frontend for the temple: a public website and a management portal. All data comes from `np-backend` (NestJS) at `API_URL`.

## Top rules

1. **Never commit, push, merge, rebase, or create branches/PRs.** Leave changes in the working tree; the user commits.
2. **Keep changes scoped to the task.** No drive-by refactors, renames, or reformatting.
3. **The API owns business logic.** Never duplicate rules, totals, or balances on the client.
4. **`npm run lint` and `npm run build` must pass** before you finish.
5. **Never read, print, or edit `.env.local`.**

## Commands

```bash
npm run dev        # http://localhost:3000
npm run lint       # ESLint
npm run build      # type-check + production build (CI runs lint + build on every PR to main)
npx tsc --noEmit   # quick type-check while working
```

TODO(confirm): test command, or "No test suite — don't add one unless asked."

Local setup: copy `.env.example` to `.env.local`.

## Git

- No AI attribution anywhere: no `Co-Authored-By`, no "Generated with Claude", not in code, comments, commit messages, or PR text.
- When asked for a commit message, suggest one in Conventional Commits format (`feat:`, `fix:`, `refactor:`, `chore:` …; enforced by commitlint) and let the user run it.

## Project structure

```
src/app/[locale]/(site)/        public website routes
src/app/[locale]/(portal)/      management portal routes
src/app/[locale]/(auth)/        login
src/features/<domain>/          all feature code (events, finance, accounting, contributions, …)
  sections/<area>/                <x>-feature.tsx  server: session, access, data
                                  <x>-screen.tsx   client: UI
  components/                     feature-specific components
  lib/
    *-service.ts                  server reads
    *-actions.ts                  'use server' writes
    *-schemas.ts                  zod schemas
    *-access.ts                   permission helpers
    routes.ts                     feature routes
  types/
  index.ts                        public exports; import via '@/features/<domain>'
src/components/ui/              shadcn primitives (radix-nova style)
src/components/portal/ui/       shared portal blocks: PageShell, PortalPageHeader, Card, DataTable,
                                EmptyState, ErrorState, FormField, ConfirmDialog, StatusBadge, ActionError
src/components/site/            shared website blocks
src/lib/api/                    server-side API client (`api.get/post/…`, `ApiError`)
src/lib/format.ts               date and money formatting
src/hooks/use-server-action.ts  run a server action, surface errors, refresh
messages/en.json, ta.json       i18n strings (next-intl): English and Tamil
```

**Reference implementation:** `src/features/events` — TODO(confirm). Read it and copy its structure when building a new feature.

Pages in `app/` stay thin: export `metadata` and render `<X>Feature` from `@/features/<domain>`.

## Data flow

- **Reads:** `*-service.ts` with `import 'server-only'`, calling `api` from `@/lib/api`. Never call the API from the browser.
- **Writes:** `'use server'` actions in `*-actions.ts` that:
  1. call `requireSession()` (from TODO(confirm): `@/lib/auth`) and check the feature's access helper,
  2. validate input with the zod schema from `*-schemas.ts`,
  3. call the API, catching `ApiError` and returning `{ ok: false, message }` (never throw to the client),
  4. `revalidatePath` and return `{ ok: true }`.
- **Client:** run actions through `useServerAction`. After a write, re-render from the server; don't patch local state.
- **Permissions:** check `getXAccess(permissions)` before rendering a portal screen and before offering any action.

## Code practices

- TypeScript strict. No `any`, no non-null `!` to silence errors, no unused code or imports.
- Server Components by default. `'use client'` only on the screen or component that needs state, effects, or handlers.
- React Compiler is on: don't add `useMemo`, `useCallback`, or `memo` by default.
- Reuse before creating: check `components/portal/ui`, `components/ui`, and the feature's `components/` first.
- Add shadcn components with `npx shadcn@latest add <name>`; don't hand-edit generated primitives without reason.
- Use `cn()` from `@/lib/utils`, `lucide-react` for icons, `date-fns` / `src/lib/format.ts` for dates and money.

## Comments

- Only comment a non-obvious *why* (workaround, business rule, browser quirk), in one short line.
- No comments that describe a change ("updated to…", "fixed…", "now uses…"). Git records changes.
- No comments that restate the code, and no JSDoc on obvious functions, props, or components.
- Leave existing comments alone unless the code they describe changes.

## Design system

Two themes that must never mix:

- **Portal** (`src/styles/portal-theme.css`, scoped to `.portal-theme`): Apple-style. Neutral grays (`#f5f5f7` canvas, white cards), one blue accent (`--primary`) for interactive elements only, hairline borders instead of shadows, 10px radius, dense layout, tabular numerals for figures. Colour only carries meaning (status, destructive), never decoration.
- **Site** (`src/styles/site-theme.css`): the public temple website, with its own palette and serif headings.

Rules:
- Use theme tokens and semantic classes (`bg-card`, `text-muted-foreground`, `border-border`, `text-primary`). No hard-coded hex, arbitrary shadows, or gradients.
- New tokens go in exactly one theme file, never in `globals.css`.
- Support light and dark mode through tokens.
- Match the spacing, type scale, and layout of neighbouring screens.

## UI rules

**Minimal, consistent UI**
- Build only what the feature needs. No extra cards, sections, badges, icons, banners, tooltips, or descriptions.
- Reuse existing components and patterns; never build lookalikes or redesign unrelated parts of a page.
- Don't turn simple screens into dashboards. Avoid oversized headings and excess whitespace.

**Copy**
- Short, natural copy and short headings. Supporting text only if truly needed, one sentence max.
- Don't explain obvious functionality, repeat the page title, or show technical details.
- Don't invent marketing copy, placeholder descriptions, or sample content.
- Use the project's terms: pooja, costing, sponsor, voucher, financial year.

**i18n**
- Site text goes in both `messages/en.json` and `messages/ta.json` with matching keys.
- Portal text: TODO(confirm): "hard-coded English" or "also in messages/".

**Forms and feedback**
- Always: labels, validation messages, pending states, error messages (`FormField`, `ActionError`).
- Disable submit while pending; prevent double submits.
- No helper text under every field. No success message when the UI already shows success.
- `ConfirmDialog` only for destructive or irreversible actions.
- Empty and error states are short and actionable (`EmptyState`, `ErrorState`).

**Accessibility and responsive**
- Keyboard reachable with visible focus. Icon-only buttons need `aria-label`.
- Semantic HTML (`button`, `nav`, `table`, headings in order).
- Works down to mobile width; tables scroll horizontally.
- Destructive actions use the destructive variant and sit apart from primary actions.

## Before finishing

1. `npm run lint` and `npm run build` pass; fix anything you introduced.
2. No unused imports, `any`, or leftover debug code.
3. New site strings exist in both `en.json` and `ta.json`.
4. Nothing committed; summarize what changed so the user can review and commit.