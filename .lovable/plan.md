

# Fix Partner Detail Pop-up Containment on Map Page

## Problem
The partner detail panel overflows the screen on both mobile and desktop. The Drawer component's overlay blocks the BottomNav, and the desktop side panel's z-index conflicts with navigation.

## Changes

### `src/components/map/MapDrawer.tsx`

**Mobile (Drawer):**
- Add `modal={false}` to the `Drawer` component so it doesn't render a full-screen overlay that blocks BottomNav
- Cap `DrawerContent` height to `max-h-[60vh]` (down from 85vh) and add `pb-20` for BottomNav clearance
- Set z-index to `z-[999]` so it sits below BottomNav (`z-50` on the fixed nav, but BottomNav is at `z-50` — we need the drawer below it)

**Desktop (Side Panel):**
- Constrain to `max-h-[60vh]` and position `bottom-20` to clear BottomNav
- Keep `z-[999]` so it's above the map but below the fixed bottom nav
- Ensure the close button has proper z-index within the panel

**Both:**
- Remove any overlay/dimming that blocks clicks on BottomNav tabs
- The Drawer's `DrawerOverlay` currently renders at `z-50` with `bg-black/80` — using `modal={false}` prevents this overlay entirely on mobile, keeping map and nav clickable

### `src/components/ui/drawer.tsx`
- No changes needed — the `modal` prop is passed through to vaul's `Drawer.Root`

### Key z-index hierarchy (maintained):
```text
BottomNav:        z-50 (fixed, must always be clickable)
Map filters:      z-[1001] 
Partner panel:    z-[999] (below filters, above map)
Map tiles:        z-0
```

