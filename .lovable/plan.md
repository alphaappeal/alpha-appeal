

## Plan: Targeted Auth & Payment Fixes

### Analysis

After reviewing all relevant files, here's what's actually broken vs already working:

**PayFast Subscriptions & ITN** -- Already correctly implemented. The `create-payfast-checkout` edge function (lines 209-217) already includes `subscription_type=1`, `frequency=3`, `cycles=0`, `billing_date`, and `recurring_amount` when `subscription_tier` is passed. The `payfast-itn` handler already creates/updates `subscriptions` records on `COMPLETE` with a token. The `AdminSubscriptions` component already calculates active count and MRR. No changes needed here.

**Password Reset** -- This is the real bug. There's a race condition in `ResetPassword.tsx`:

1. When a user clicks the recovery link, Supabase redirects to `/reset-password#access_token=...&type=recovery`
2. The Supabase client (initialized in `client.ts`) processes the hash fragment **immediately on page load**, before the React component mounts
3. The `PASSWORD_RECOVERY` auth state change event fires before `onAuthStateChange` listener is registered
4. The hash is consumed/cleared from the URL by the Supabase client
5. Both detection methods fail: the listener misses the event, and the hash check finds nothing
6. `isRecovery` stays `false` → user sees "Invalid or expired reset link"

### File Changes

**`src/pages/ResetPassword.tsx`** -- Fix the recovery detection:
- On mount, call `supabase.auth.getSession()` to check if there's an active session (the recovery token was already exchanged)
- Also check URL search params for `code` and `type=recovery` (PKCE flow support)
- Keep the existing `onAuthStateChange` listener as a fallback for cases where the event arrives after mount
- After successful password update, redirect to `/login` instead of `/profile` (as specified in requirements)

This is a single-file fix, ~10 lines changed.

