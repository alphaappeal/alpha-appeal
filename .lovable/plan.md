

## Plan: Refactor Map Markers to Use Category/Event Type Icons

### Current State
- Map markers use hardcoded SVG with letter "A" for partners and "★" for events
- `map_locations` table has `category_id` and `map_events` has `event_type_id`, `start_date`, `end_date` in the database, but the **Supabase types file is out of sync** (missing these columns)
- `categories` and `event_types` tables exist in DB with `icon`, `color`, `name` fields
- DB views `map_locations_with_categories` and `map_events_with_types` exist and join the data
- The current `AlphaMap.tsx` only renders `alpha_partners` and `map_events` — it does NOT render `map_locations` at all
- `EventPinsTab.tsx` admin form uses free-text `event_type` instead of `event_type_id` dropdown

### Architecture Decision
The map currently shows two layers: **alpha_partners** (stores) and **map_events** (event pins). The request asks to also render **map_locations** with category-based icons and update **map_events** to use event_type-based icons.

This means the map will have **three marker layers**:
1. **Partner stores** (`alpha_partners`) — keep existing status-based styling but replace "A" with a store icon
2. **Map locations** (`map_locations_with_categories`) — new layer with category icons/colors
3. **Map events** (`map_events_with_types`) — updated to use event type icons/colors with date filtering

### Files to Modify

#### 1. `src/integrations/supabase/types.ts`
- Add missing columns to `map_locations`: `category_id`
- Add missing columns to `map_events`: `event_type_id`, `start_date`, `end_date`
- Add `categories` table type (id, name, icon, color)
- Add `event_types` table type (id, name, icon, color)
- Add `map_locations_with_categories` view type
- Add `map_events_with_types` view type

#### 2. `src/components/AlphaMap.tsx` — Core map refactor

**New icon helper**: Create `createCategoryIcon(icon: string, color: string)` and `createEventTypeIcon(icon: string, color: string)` functions that generate circular SVG markers with Lucide icon paths embedded. Since Leaflet markers require image URLs (not React components), the approach will be:
- Build a mapping of common Lucide icon names to their SVG path data (e.g., `store`, `coffee`, `heart`, `music`, `calendar`, `star`, `map-pin`)
- Generate `data:image/svg+xml` URLs with the icon path centered on a colored circle with white border
- Event markers get a subtle pulsing ring/glow effect via an outer circle to distinguish from locations

**Replace `createMarkerIcon`**: Update partner markers to use a store/building icon instead of "A", keeping the status-based gradient colors.

**Replace `createEventIcon`**: Use event type icon/color from the `map_events_with_types` view.

**New data loading**:
- Load `map_locations_with_categories` view (filtered to `active = true`, with valid lat/lng)
- Load `map_events_with_types` view (filtered to `active = true`, plus date logic: `start_date <= now AND (end_date IS NULL OR end_date >= now)`)

**New marker layers**: Render `map_locations` markers using category icon/color, and updated `map_events` markers using event type icon/color.

**Filter state**: Add `category: string` (default `'all'`) and `showEvents: boolean` (default `true`) to `FilterState`.

**Filter UI**: Add category filter dropdown (populated from `categories` table) and an "Events" toggle button.

#### 3. `src/components/admin/EventPinsTab.tsx` — Event type dropdown

- Load `event_types` from Supabase on mount
- Replace the free-text `event_type` input with a `<Select>` populated from `event_types`
- Store `event_type_id` instead of `event_type` string
- Add `start_date` and `end_date` fields (datetime-local inputs)
- Display the event type name and color badge in the event list

#### 4. Create `src/lib/mapIcons.ts` — Icon path registry

A utility mapping Lucide icon names to SVG path data for use in Leaflet markers:
```text
iconPaths: Record<string, string> = {
  'store': '...svg path...',
  'coffee': '...',
  'heart': '...',
  'music': '...',
  'calendar': '...',
  'map-pin': '...',
  'star': '...',
  // ~15 common icons
}

createIconMarker(iconName, bgColor, options?: { glow?: boolean }): L.Icon
```

This keeps icon logic separate from the map component and is reusable.

### Marker Design Spec

**Location markers**: 40x40 circle, background = `category.color`, white 3px border, subtle drop shadow, icon SVG path centered in white

**Event markers**: 44x44 circle (slightly larger), background = `event_type.color`, white 3px border, outer 2px ring with 50% opacity of the color (glow effect), icon centered

**Partner markers**: Keep 40x40, replace "A" text with a store/building icon path, retain status gradient

### Event Visibility Logic
```
WHERE active = true
  AND start_date <= NOW()
  AND (end_date IS NULL OR end_date >= NOW())
```
Applied client-side after fetching from the view.

### Backward Compatibility
- Partner markers retain their status-based color system, just replace the letter
- Existing `map_events` with `event_type` string (no `event_type_id`) will render with a default fallback icon/color
- `map_locations` without `category_id` render with a default pin icon

### Files Summary
| File | Action |
|------|--------|
| `src/lib/mapIcons.ts` | Create — icon path registry + marker factory |
| `src/integrations/supabase/types.ts` | Edit — add missing table/view types |
| `src/components/AlphaMap.tsx` | Edit — new marker icons, load locations + events from views, add filters |
| `src/components/admin/EventPinsTab.tsx` | Edit — event_type dropdown from DB, add start/end dates |

