# np-frontend

The temple management portal. Next.js 16 App Router, Tamil and English.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Needs `np-backend` running. Sign in with the account the API seed created.

## How it talks to the API

Every read and write goes through `src/lib/api`, on the server. The browser is
never given a token and makes no API call of its own.

```
browser ──httpOnly cookie──▶ Next server ──bearer token──▶ API
```

- **`src/lib/api/client.ts`** attaches the access token from the cookie and
  turns a failure into a typed `ApiError`.
- **`src/proxy.ts`** guards portal routes and refreshes an expired token pair
  before the render begins — the only place Next can write a cookie ahead of a
  render.
- **`src/features/auth/lib/session.ts`** resolves the session from
  `GET /auth/me`, cached for the lifetime of one request.

## The shape of a feature

```
features/<domain>/
  lib/<domain>-service.ts   server-only reads     → api.get(...)
  lib/<domain>-actions.ts   'use server' writes   → api.post/patch/delete(...)
  lib/<domain>-access.ts    capability checks against the session's permissions
  sections/*-feature.tsx    server component: checks access, fetches, renders
  sections/*-screen.tsx     client component: props in, server actions out
```

A `*-feature.tsx` resolves the session once, refuses the page if the capability
is missing, and fetches everything it needs in one `Promise.all`. A `*-screen.tsx`
holds no copy of the list: it renders what it was given, calls an action, and
lets `useServerAction` refetch. Ids, references and derived balances belong to
the API, and a screen that guessed any of them would eventually disagree with
the records it is displaying.

Every write is checked twice — once by the page before it renders, once by the
action before it writes. An action is the boundary a typed URL cannot get around.

## Permissions

`GET /auth/me` returns the session's permissions and the portal gates on those,
so a role an administrator re-scopes changes what people see without a redeploy.
`src/features/auth/types/permission.ts` holds the catalogue of 48; it must stay
in step with `np-backend/prisma/seed.ts`, which is its source of truth.

## No mock data

There is none left. Every figure the portal shows comes from the API, including
the dashboards, the header's notification badge and the command palette. What
remains under `constants/` is the vocabulary the screens render — the shape of a
notification, the tone each priority uses, the tabs the inbox offers, the steps
a voucher moves through — none of which is data about the temple.

## Checks

```bash
npx tsc --noEmit
npx eslint .
npm run build
```
