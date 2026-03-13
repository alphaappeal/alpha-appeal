

## Fix Plan: Admin Saves, Map, Build Error, and Security

### Critical Build Error (Immediate)

**`src/pages/Community.tsx` line 57** — `NodeJS.Timeout` type doesn't exist in browser/Vite context. Replace with `ReturnType<typeof setTimeout>`.

---

### 1. Admin Changes Not Saving — RLS Policy Gaps

Root cause identified via database audit. Several tables have missing RLS policies that silently block admin writes:

| Table | Missing Policy | Impact |
|---|---|---|
| `alpha_partners` | No admin UPDATE policy | Partner edits from PartnersTab fail silently |
| `store_suggestions` | No admin SELECT or UPDATE | StoreApprovalsTab can't load or reject suggestions |
| `users` | No admin UPDATE policy | Tier changes fail on the `users` table (only `profiles` succeeds) |

**Fix**: Single migration adding:
- `ALTER POLICY` or new policy for admin UPDATE on `alpha_partners`
- Admin SELECT + UPDATE policies on `store_suggestions`
- Admin UPDATE policy on `users` table

---

### 2. Map Page — Dual Data Source Problem

The map renders partners from a **hardcoded TypeScript file** (`src/data/alphaPartners.ts`) while admins manage partners in the **`alpha_partners` database table**. Changes made in the admin dashboard never appear on the map.

**Fix approach**: Update `AlphaMap.tsx` to fetch from the `alpha_partners` Supabase table as the primary source, falling back to the static data for any partners not yet migrated. This aligns admin CRUD operations with what users see on the map.

Files: `src/components/AlphaMap.tsx`, `src/components/map/MapDrawer.tsx` (update interface to handle DB shape)

---

### 3. Security — RLS Disabled Tables

Two public tables have RLS disabled:
- `navigation_permissions` — enable RLS + add read policy
- `product_views` — enable RLS + add insert/select policies

**Fix**: Migration to enable RLS and add appropriate policies.

---

### 4. Performance — Route Lazy Loading

Currently all 20+ page components are eagerly imported in `App.tsx`. This increases initial bundle size unnecessarily.

**Fix**: Convert page imports to `React.lazy()` with a `Suspense` wrapper for code splitting. Heavy pages like Map (Leaflet), Shop, Community, and Admin benefit most.

---

### Files to Edit

1. **`src/pages/Community.tsx`** — Fix `NodeJS.Timeout` type error
2. **New migration** — Add missing admin RLS policies for `alpha_partners`, `store_suggestions`, `users`; enable RLS on `navigation_permissions` and `product_views`
3. **`src/components/AlphaMap.tsx`** — Fetch partners from Supabase `alpha_partners` table
4. **`src/components/map/MapDrawer.tsx`** — Update interface to accept DB-shaped partner data
5. **`src/App.tsx`** — Add `React.lazy` + `Suspense` for route-level code splitting

