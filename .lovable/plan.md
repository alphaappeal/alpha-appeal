

# Schema Audit & Sync Plan

## Summary

After a full comparison of your uploaded Supabase schema against the live database and frontend code, I identified several issues ranging from a **critical double-stock-decrement bug** to missing RLS policies, and frontend queries that don't match the schema. This plan fixes all of them.

---

## Critical Issue: Double Stock Decrement

The `order_items` table has **two triggers** that both reduce stock on INSERT:
- `stock_update_trigger` calls `reduce_stock_after_purchase()` (decrements `stock` column)
- `trg_decrement_stock` calls `decrement_stock_on_order()` (decrements `stock_quantity` column and toggles `in_stock`)

Since the `products` table only has `stock_quantity` (no `stock` column), the first trigger likely throws a silent error while the second one works. We need to drop the redundant/broken trigger.

**Fix:** Drop `stock_update_trigger` and the `reduce_stock_after_purchase()` function entirely.

---

## Database Migration Changes

### 1. Drop duplicate stock trigger

```text
DROP TRIGGER IF EXISTS stock_update_trigger ON public.order_items;
DROP FUNCTION IF EXISTS public.reduce_stock_after_purchase();
```

### 2. Add missing RLS policies

The following tables currently lack adequate RLS policies per the schema:

- **`user_notifications`** -- needs INSERT policy for system/admin and user SELECT
- **`comment_interactions`** -- needs INSERT/DELETE for authenticated users (currently can't INSERT)
- **`navigation_permissions`** -- has RLS enabled but zero policies (fully blocked)
- **`product_views`** -- has RLS enabled but zero policies (fully blocked)

```text
-- user_notifications: users can read own, system can insert
CREATE POLICY "Users can view own notifications"
  ON public.user_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.user_notifications FOR INSERT
  WITH CHECK (true);

-- comment_interactions: users manage own
CREATE POLICY "Users manage own comment interactions"
  ON public.comment_interactions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- navigation_permissions: anyone can read
CREATE POLICY "Anyone can read nav permissions"
  ON public.navigation_permissions FOR SELECT
  USING (true);

-- product_views: users can insert own, admins can read all
CREATE POLICY "Users can insert own views"
  ON public.product_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view product views"
  ON public.product_views FOR SELECT
  USING (has_role(auth.uid(), 'admin'));
```

### 3. Add missing RLS for `reward_claims`

The `reward_claims` table is queried by `MemberPortal.tsx` but needs user-facing policies:

```text
CREATE POLICY "Users can view own claims"
  ON public.reward_claims FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own claims"
  ON public.reward_claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all claims"
  ON public.reward_claims FOR ALL
  USING (has_role(auth.uid(), 'admin'));
```

---

## Frontend Code Fixes

### 4. Update `useProfileData.ts` -- fix merged profile logic

The hook currently fetches from both `profiles` and `users` tables and merges them. The merge order should prioritize `profiles` (source of truth per your architecture memo). The current code has them backwards in one spot. Will verify and fix field references to match exact column names from both tables.

### 5. Update `AdminUsersSection.tsx` -- align tier change to both tables

When an admin changes a user's tier, both `profiles.subscription_tier` (and `profiles.tier`) AND `users.tier` must be updated atomically. Will audit the tier-change handler to ensure it updates both tables.

### 6. Update `AdminLayout.tsx` -- fix `loadProfiles` query

Currently selects from `profiles` only. The admin user list also needs `users.tier` and `users.phone_number` for full visibility. Will add a secondary fetch or adjust the query to include needed fields.

### 7. `Checkout.tsx` -- ensure order creation respects constraints

The `orders` table has CHECK constraints on `payment_status` (must be one of: pending, processing, completed, failed, refunded, cancelled) and `order_type` (subscription, one_time, upgrade, renewal). Will verify the checkout flow uses valid enum values.

### 8. `MemberPortal.tsx` -- fix `reward_claims` insert

Currently inserts `{ user_id, reward_id, message, status }`. The schema requires `user_id` (NOT NULL), `reward_id` (NOT NULL), and `status` defaults to `'pending'`. Will ensure the insert includes all required non-nullable fields.

---

## Summary of Files to Change

| File | Change |
|------|--------|
| SQL Migration | Drop duplicate trigger, add ~8 RLS policies |
| `src/hooks/useProfileData.ts` | Fix profile merge priority, ensure field names match schema |
| `src/components/admin/AdminUsersSection.tsx` | Ensure tier changes update both `profiles` and `users` tables |
| `src/components/admin/AdminLayout.tsx` | Fix profile query to include all needed columns |
| `src/pages/Checkout.tsx` | Validate order_type and payment_status values against CHECK constraints |
| `src/components/MemberPortal.tsx` | Ensure reward_claims insert respects non-nullable fields |

---

## What This Does NOT Change

- The `site_settings` table (exists in DB, works fine, just wasn't in your dump)
- The `strains` table (exists in DB, wasn't in dump but all queries are correct)
- The `user_starred_posts` view (exists and referenced correctly)
- Any Edge Functions (all currently aligned with schema)
- The `types.ts` file (auto-generated, not manually editable)

