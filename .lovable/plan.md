

## Plan: Fix Admin Partner/Product Changes Not Reflecting on Map & Store

### Root Cause

The admin partner edit form is **missing critical fields** — most importantly `latitude` and `longitude`. The map component filters out any partner without coordinates (`r.latitude && r.longitude`), so partners created/edited in admin without coordinates never appear on the map. Additionally, several fields aren't included in the update payload, so edits to those fields are silently lost.

### Specific Issues Found

1. **Admin PartnersTab edit form** is missing input fields for:
   - `latitude` / `longitude` (required for map display)
   - `website`
   - `logo_url`
   - `specialties` (array)
   - `special_events`

2. **Admin PartnersTab save function** (`handleSavePartner`) omits these columns from the `update()` and `insert()` payloads:
   - `latitude`, `longitude`, `website`, `logo_url`, `specialties`, `payment_methods`, `amenities`, `rating_overall`, `review_count`, `partner_since`

3. **Database confirms the issue**: `sky420` has `latitude: null, longitude: null` — so it's invisible on the map despite existing in the DB.

4. **The Shop/Products flow** appears correct — `ProductsTab` saves to `products` table, and `Shop.tsx` reads from `products` with a realtime listener. If product changes aren't showing, it may be a stale-tab issue (no realtime on the admin side).

### Changes Required

#### 1. `src/components/admin/PartnersTab.tsx` — Add missing form fields and save them

**Form fields to add:**
- Latitude and Longitude inputs (number fields, side by side)
- Website URL input
- Logo URL input
- Special Events input (text)
- Specialties input (comma-separated text → array)

**Save function updates:**
- Add `latitude`, `longitude`, `website`, `logo_url`, `special_events`, `specialties`, `partner_since` to both the `update()` and `insert()` payloads
- Parse latitude/longitude as numbers (or null if empty)
- Parse specialties from comma-separated string to array

**Interface update:**
- Add `latitude`, `longitude`, `website`, `logo_url`, `specialties`, `partner_since` to the `AlphaPartner` interface (most already exist, just ensure they're in `formData`)

#### 2. `src/components/admin/ProductsTab.tsx` — Minor: ensure admin sees updated data

The products tab already works correctly with Supabase CRUD. No code changes needed unless the user reports specific product fields not saving.

### Files to Edit
1. `src/components/admin/PartnersTab.tsx` — Add missing form fields (lat/lng, website, logo, specialties, special_events) and include them in save payloads

