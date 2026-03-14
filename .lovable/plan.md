

## Fix: Map UI Clipping/Overlap and Filter Button Inconsistencies

### Problem 1: Partner Detail Panel Blocked by Filter Bar

The filter bar sits at `z-[1001]` and extends vertically from `top-24` downward. The MapDrawer partner detail panel sits at `z-40`. On mobile, the close button (X) at the top of the partner panel is completely hidden behind the filter bar, making it impossible to dismiss the popup.

**Fix approach:**
- When a partner is selected, **collapse the filter bar** to just the search input (or hide it entirely) to free up vertical space and eliminate the overlap.
- Alternatively, raise the MapDrawer's z-index to `z-[1002]` so the close button renders above the filters, and add a slight top offset so the close button isn't visually buried.
- Best approach: **hide the filter bar when a partner is selected** on mobile, and ensure the close button is always accessible. On desktop the side panel is already positioned at `right-4` away from the left-side filters, but verify no overlap there either.

### Problem 2: Filter Buttons Inconsistent Styling

- "Reservations" button (line 224) is missing the active-state class logic — it never gets `bg-secondary text-secondary-foreground` when toggled on, unlike "Open Now" and "Member Perks".
- The `select` dropdown for regions uses raw HTML styling rather than matching the Button component aesthetic.

**Fix approach:**
- Add the same conditional className pattern to the Reservations button: `className={filter.reservations ? 'bg-secondary text-secondary-foreground' : ''}`.
- Style the region `<select>` to better match the button pill style with consistent height/padding.

### Files to Edit

1. **`src/components/AlphaMap.tsx`**
   - Hide the filter bar (or collapse it) on mobile when `selectedPartner` is set, preventing overlap with the partner panel.
   - Fix the Reservations button active-state styling.
   - Unify region select styling with the filter buttons.

2. **`src/components/map/MapDrawer.tsx`**
   - Bump mobile panel z-index to `z-[1002]` so it sits above the filter bar when both are visible.
   - Ensure the close button is always in a tappable, unobstructed position.

