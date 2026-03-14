## Global Store Location Support — IMPLEMENTED

### What was done

1. **Database**: Added `country text NOT NULL DEFAULT 'South Africa'` to `alpha_partners` table
2. **Interface**: Added required `country: string` to `AlphaPartner` in `src/data/alphaPartners.ts`
3. **AlphaMap**: Added `country` to mapper (`row.country || 'South Africa'`), country filter, `BoundsController` for dynamic map bounds, country-aware search, location display
4. **Admin PartnersTab**: Added country selector (16 countries), replaced hardcoded province dropdown with free-text region input, updated search/display to include country
5. **MapDrawer**: Shows country in address for non-SA partners
6. **UI Copy**: Updated Hero, Footer, MemberNetwork, TierSection, Index, Map meta to be globally inclusive
