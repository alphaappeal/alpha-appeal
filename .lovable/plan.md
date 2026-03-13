

## Plan: Correct User Tier Labels and Subscription Statuses

### Business Rules (Confirmed)
- **Essential** = Subscriber (paid R99)
- **Elite** = Subscriber (paid R499)
- **Private** = Non-subscriber (promo code users)
- **No "free" tier exists** — all fallbacks must change

### Changes

#### 1. `src/components/admin/AdminUsersSection.tsx`
- **Line 75**: Change fallback `(p.tier || "free")` → `(p.tier || "essential")`
- **Line 188**: Remove `<SelectItem value="free">Free</SelectItem>` from tier filter
- **Line 242**: Change `{p.tier || "free"}` → `{p.tier || "—"}`
- **Lines 245-249**: Replace raw `payment_status` display with subscription logic:
  - If tier is `essential` or `elite` → green dot + "Subscriber"
  - If tier is `private` → neutral dot + "Non-subscriber"
  - Fallback → grey dot + "Unknown"
- **Line 262**: Change `p.tier || "free"` → `p.tier || "essential"`
- **Lines 333-338**: Remove `<SelectItem value="free">Free</SelectItem>` from Change Tier modal

#### 2. `src/components/admin/AdminOverview.tsx`
- **Line 28**: Change fallback `"free"` → `"unknown"` in tier breakdown
- **Line 100**: Remove `free` from `tierColors`, keep `promo` entry
- **Line 184**: Change `{p.tier || "free"}` → `{p.tier || "—"}`

#### 3. `src/components/admin/AdminLayout.tsx`
- **Line 386**: Change `{p.tier || "free"}` → `{p.tier || "—"}`

#### 4. `supabase/functions/routine-maintenance/index.ts`
- **Lines 135-140**: Change expired subscription downgrade from `"free"` to `"private"` (since there's no free tier, expired users become non-subscriber/private)

#### 5. `src/pages/Signup.tsx`
- **Line 10**: Change default tier from `"free"` to `"essential"`

### Files to Edit
1. `src/components/admin/AdminUsersSection.tsx` — Remove free refs, add subscriber/non-subscriber status
2. `src/components/admin/AdminOverview.tsx` — Remove free fallback
3. `src/components/admin/AdminLayout.tsx` — Remove free badge fallback
4. `supabase/functions/routine-maintenance/index.ts` — Downgrade to "private" not "free"
5. `src/pages/Signup.tsx` — Default tier to "essential"

