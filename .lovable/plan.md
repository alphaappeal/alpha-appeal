
1) Triage the console warnings into actionable vs external noise

- External (not from current codebase, no local source matches):
  - `osano.js ... Unrecognized feature: 'vr' | 'ambient-light-sensor' | 'battery'`
  - `iframe has both allow-scripts and allow-same-origin...`
  These come from a third-party consent script context, not from `src/` or `index.html`.
- Environment-only warning:
  - `cdn.tailwindcss.com should not be used in production` appears via `lovable.js` preview tooling, not from your app HTML.
- Actionable app warning:
  - `Function components cannot be given refs` (stack points to `MapDrawer` → `PartnerDetails`, then ancestors).

2) Fix the ref warning at source (`MapDrawer`)

Files:
- `src/components/map/MapDrawer.tsx`

Plan:
- Convert `PartnerDetails` from plain function component to `React.forwardRef<HTMLDivElement, ...>`.
- Attach the forwarded `ref` to the root wrapper `<div className="space-y-4">`.
- Keep the existing contained card layout (mobile bottom sheet + desktop panel) unchanged.
Why:
- If any wrapper (library/dev tooling) passes a ref through composition, the component will safely accept it and stop throwing warnings.

3) Harden top-level components that appear in the same ref-warning chain

Files:
- `src/App.tsx`
- `src/pages/Map.tsx`
- `src/components/AlphaMap.tsx`
- `src/components/BottomNav.tsx`
- `src/components/AgeGate.tsx`
- `src/components/ui/toaster.tsx`
- `src/components/ui/sonner.tsx`

Plan:
- Add `forwardRef` support only where low-risk and straightforward (especially small wrapper components like `Toaster`, `Sonner`, `BottomNav`).
- Do not change behavior, routing, or props; only make components ref-safe to reduce noisy warnings in composed contexts.

4) Keep the map UI containment fix intact while validating stack order

- Preserve current constraints:
  - fixed-size partner card (no full-screen takeover)
  - mobile bottom sheet / desktop side panel behavior
  - panel above map, below BottomNav
- Verify close button remains clickable and overlay does not block nav.

5) Verification checklist after patch

- On `/map`, click several markers and confirm:
  - no `Function components cannot be given refs` warning for `MapDrawer`/`PartnerDetails`
  - panel remains contained and scrollable
  - BottomNav tabs (`Shop`, `Profile`) remain clickable while panel is open
- Confirm osano/iframe feature-policy warnings remain categorized as external (unless you intentionally embed that script in this project later).
