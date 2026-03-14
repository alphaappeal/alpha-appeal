

## Plan: Global Store Location Support

### Verification of Pre-conditions

1. **`country` field on AlphaPartner interface** — Currently missing from both the UI interface (`src/data/alphaPartners.ts` line 3-51) and the admin interface (`src/components/admin/PartnersTab.tsx` line 43-76). Will add as **required** `country: string`.

2. **`dbPartnerToAlphaPartner` mapper** (AlphaMap.tsx line 97-137) — Currently does not map `country`. Will add `country: row.country || 'South Africa'`.

3. **Map filter region logic** (AlphaMap.tsx line 211) — Currently `partner.region !== filter.region`. When adding country filter, region filter must guard against undefined values from partners in countries without region data.

4. **`map.fitBounds()` timing** — Currently uses hardcoded center `[-26.1, 28.0]` (line 216). MapContainer initializes with this center. Will add a `BoundsController` component (sibling to `MapController`) that calls `fitBounds` only after `partnersLoaded === true` and partners exist.

5. **SA backward compatibility** — SA partners will display identically: country label omitted in sidebar/list when `country === 'South Africa'`, default region value preserved.

### Database Change

Add `country` column to `alpha_partners`:
```sql
ALTER TABLE alpha_partners ADD COLUMN country text NOT NULL DEFAULT 'South Africa';
```

No data migration needed — all existing rows get 'South Africa'.

### Files to Modify

#### 1. `src/data/alphaPartners.ts`
- Add `country: string` (required) to `AlphaPartner` interface after `region`
- Add `country: 'South Africa'` to all static partner objects (maintains type safety)

#### 2. `src/components/AlphaMap.tsx`
- **Mapper** (line 104): Add `country: row.country || 'South Africa'`
- **FilterState** (line 65): Add `country: string` (default `'all'`)
- **Filter logic** (line 196-213): Add country check before region check; skip region filter if partner.region is undefined/empty and filter.region is 'all'
- **BoundsController** component: After `partnersLoaded && partners.length > 0`, compute `L.latLngBounds` from all partner coordinates and call `map.fitBounds()`. Skip if `initialPartnerId` is set. Fallback center: `[20, 0]` zoom 2 if no partners.
- **Filter UI** (line 372-383): Add country dropdown before region dropdown. Region dropdown filters options to match selected country. Both populated dynamically from partner data.
- **Search** (line 200-204): Add `partner.country?.toLowerCase().includes(query)`
- **Sidebar cards** (line 293-294): Show `City, Country` for non-SA partners below the vibe line

#### 3. `src/components/admin/PartnersTab.tsx`
- Add `country` to interface and `formData` (default `'South Africa'`)
- Replace hardcoded 9-province `<Select>` (lines 536-555) with:
  - Country `<Select>` with ~20 common countries + "Other" free-text option
  - Region `<Input>` (free text, labeled "Province" for SA, "State/Region" otherwise)
- Add `country` to `buildPayload()` and search matching
- Display location as `City, Region, Country` (omit country for SA)

#### 4. `src/components/map/MapDrawer.tsx`
- Show country in location line when not 'South Africa'

#### 5. UI Copy Updates (6 files, minor text changes)
| File | Line | Change |
|------|------|--------|
| `src/pages/Map.tsx` | 10 | "across South Africa" → "worldwide" |
| `src/components/Hero.tsx` | 36 | "South Africa's most intentional" → "the world's most intentional" |
| `src/components/Footer.tsx` | 17 | "South Africa's premier" → "The premier" |
| `src/components/Footer.tsx` | 82 | Keep "Made in South Africa" (brand origin) |
| `src/components/MemberNetwork.tsx` | 113, 220 | Dynamic center from data; "across South Africa" → "worldwide" |
| `src/components/TierSection.tsx` | 121 | Append "International rates may apply" |
| `src/pages/Index.tsx` | 39, 41 | Broaden meta descriptions |
| `src/components/Philosophy.tsx` | 82 | Keep (factual HQ) |
| `src/components/SocialProof.tsx` | 25 | Keep (factual press mention) |

### Safety Guarantees

- `DEFAULT 'South Africa'` preserves all existing DB rows
- Required `country: string` on interface ensures no undefined access
- `row.country || 'South Africa'` in mapper guarantees value even if DB column is somehow null
- `BoundsController` guards on `partnersLoaded` to avoid Leaflet init errors
- SA partners render identically: country label hidden, same map bounds when only SA data exists
- Region filter returns all partners when set to 'all' regardless of undefined region values

