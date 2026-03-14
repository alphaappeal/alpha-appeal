

## Plan: Refactor Partner Map + Admin Data Flow

### Problem Summary
The map component still imports and falls back to static data (`alphaPartners.ts`), uses absolute positioning causing layout overlap, and lacks flyTo behavior when clicking sidebar items. Admin form lacks coordinate range validation.

### Changes

#### 1. `src/components/AlphaMap.tsx` — Full refactor

**Remove static fallback:**
- Remove `import { alphaPartners as staticPartners ... } from '@/data/alphaPartners'`
- Keep only `AlphaPartner` type and `isPartnerOpen`, `AlphaStatus` imports (or inline them)
- If Supabase returns 0 partners with coordinates, show empty state — no static fallback

**Add flyTo on sidebar click:**
- Create a `MapController` child component using `useMap()` hook
- When `selectedPartner` changes, call `map.flyTo(partner.coordinates, 14)`

**Fix layout to flex:**
- Replace the outer `relative` div with a flex container: `flex h-screen`
- Sidebar: `w-[380px] flex-shrink-0 overflow-y-auto` (always visible on lg+)
- Map container: `flex-1 relative` containing the MapContainer, header overlay, and filters
- This prevents sidebar/map overlap

**Filter only valid coordinates:**
- Already filtering `r.latitude && r.longitude` — keep this, add `typeof` number check

#### 2. `src/components/admin/PartnersTab.tsx` — Add coordinate validation

**In `handleSavePartner`**, after existing required-field check:
- Validate lat is between -90 and 90
- Validate lng is between -180 and 180
- Show toast error if out of range

#### 3. `src/pages/Map.tsx` — No changes needed
Already just renders `<AlphaMap />`.

#### 4. `src/data/alphaPartners.ts` — Keep for type exports only
The `AlphaPartner` interface, `AlphaStatus` type, and `isPartnerOpen` function are still used across MapDrawer and other components. The static partner array data will no longer be imported by AlphaMap.

### Files to Edit
1. `src/components/AlphaMap.tsx` — Remove static fallback, add flyTo, convert to flex layout
2. `src/components/admin/PartnersTab.tsx` — Add lat/lng range validation

