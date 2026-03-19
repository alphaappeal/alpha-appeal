# 🚀 SUPABASE QUICK REFERENCE GUIDE
**Alpha Appeal Platform** | Last Updated: March 19, 2026

---

## 🔑 ENVIRONMENT VARIABLES

### Required (.env.local)
```bash
VITE_SUPABASE_PROJECT_ID="xlyxtbcqirspcfxdznyu"
VITE_SUPABASE_URL="https://xlyxtbcqirspcfxdznyu.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your_anon_key"

# For Edge Functions (local dev only)
SUPABASE_ANON_KEY="your_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_service_key" # KEEP SECRET!
```

### Production Secrets (Set in Supabase Dashboard)
- `PAYFAST_MERCHANT_ID`
- `PAYFAST_MERCHANT_KEY`
- `PAYFAST_PASSPHRASE`
- `MAILERLITE_API_KEY`
- `SHIPDAY_API_KEY`
- `ALLOWED_ORIGINS`

---

## 📦 NPM COMMANDS

```bash
# Development
npm run dev                     # Start dev server (port 8080)
npm run build                   # Production build
npm run build:dev              # Development build
npm run preview                # Preview production build

# Linting
npm run lint                   # Run ESLint

# Supabase Utilities
npm run supabase:types         # Generate TypeScript types
npm run supabase:migrate       # Push migrations to DB
npm run supabase:link          # Link to Supabase project
```

---

## 🗄️ KEY DATABASE TABLES

### Authentication & Users
| Table | Purpose | RLS |
|-------|---------|-----|
| `users` | Auth users with roles | ✅ |
| `profiles` | User profiles & subscriptions | ✅ |
| `vendor_accounts` | Vendor access control | ✅ |
| `vendor_applications` | Application workflow | ✅ |

### E-Commerce
| Table | Purpose | RLS |
|-------|---------|-----|
| `alpha_partners` | Partner directory | ✅ |
| `partner_products` | Product catalog | ✅ |
| `orders` | Order management | ✅ |
| `payments` | Payment tracking | ✅ |

### Community
| Table | Purpose | RLS |
|-------|---------|-----|
| `diary_entries` | Blog/diary posts | ✅ |
| `comments` | Discussion threads | ✅ |
| `map_locations` | Geospatial data | ✅ |
| `map_events` | Event listings | ✅ |

### System
| Table | Purpose | RLS |
|-------|---------|-----|
| `activity_logs` | User activity tracking | ✅ |
| `admin_logs` | Admin action audit trail | ✅ |
| `platform_metrics` | Analytics data | ✅ |
| `maintenance_logs` | System maintenance | ✅ |

---

## 🔐 SECURITY FUNCTIONS

### Check User Role
```typescript
const { data } = await supabase.rpc("has_role", {
  _user_id: userId,
  _role: "admin" // or "moderator", "user", "vendor"
});
const isAdmin = data === true;
```

### Custom Hooks
```typescript
// Check admin access
import { useAdminCheck } from "@/hooks/useAdminCheck";
const { isAdmin, loading } = useAdminCheck();

// Check vendor access (NEW!)
import { useVendorCheck } from "@/hooks/useVendorCheck";
const { isVendor, loading, vendorAccounts } = useVendorCheck();
```

---

## 📊 COMMON QUERIES

### Get User Profile with Data
```typescript
const { data: profile } = await supabase
  .from("profiles")
  .select("*, users!inner(email, app_role)")
  .eq("user_id", userId)
  .single();
```

### Check Vendor Access
```typescript
const { data: vendorAccounts } = await supabase
  .from("vendor_accounts")
  .select(`id, partner_id, role, alpha_partners!inner(id, name)`)
  .eq("user_id", userId)
  .eq("is_active", true);

const isVendor = vendorAccounts && vendorAccounts.length > 0;
```

### Get Recent Activity
```typescript
const { data: activities } = await supabase
  .from("activity_logs")
  .select("*")
  .eq("user_id", userId)
  .order("created_at", { ascending: false })
  .limit(10);
```

### Fetch Published Diary Entries
```typescript
const { data: entries } = await supabase
  .from("diary_entries")
  .select("*, profiles(full_name, avatar_url)")
  .eq("published", true)
  .order("created_at", { ascending: false });
```

---

## 🔧 EDGE FUNCTIONS

### Available Functions
1. `create-payfast-checkout` - Create PayFast payment
2. `payfast-itn` - Handle ITN callbacks
3. `mailerlite-sync` - Sync email subscribers
4. `import-strains` - Import strain data
5. `import-culture-items` - Import culture content
6. `shipday-updates` - Process delivery webhooks
7. `post-to-shipday` - Send orders to Shipday
8. `routine-maintenance` - Automated cleanup

### Invoke Edge Function
```typescript
const { data, error } = await supabase.functions.invoke('mailerlite-sync', {
  body: { email, name, tier, userId },
});
```

### Example: Create Checkout
```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/create-payfast-checkout`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    items: cartItems,
    return_url: '/checkout/success',
    cancel_url: '/checkout/cancel',
  }),
});
```

---

## 🎯 PERFORMANCE TIPS

### Optimize Queries
```typescript
// ✅ GOOD - Select only needed fields
const { data } = await supabase
  .from("users")
  .select("id, email, app_role")
  .eq("id", userId);

// ❌ BAD - Select all
const { data } = await supabase
  .from("users")
  .select("*")
  .eq("id", userId);
```

### Use Indexes
New performance indexes added (migration `20260319000000`):
- `idx_vendor_accounts_user_active` - Vendor auth checks
- `idx_users_role_lookup` - Role lookups
- `idx_activity_logs_created` - Recent activity
- `idx_orders_user_created` - User orders
- +12 more for various queries

### Monitor Slow Queries
Client now logs queries taking >1 second:
```
console.warn(`Slow Supabase query detected: ${duration}ms for ${url}`)
```

---

## 🐛 TROUBLESHOOTING

### Authentication Issues
**Problem:** Session not persisting  
**Solution:** Check `localStorage` is enabled, verify PKCE flow

**Problem:** Token expired errors  
**Solution:** Auto-refresh is enabled, check network requests

### RLS Policy Errors
**Problem:** "permission denied for table"  
**Solution:** Ensure user has proper role, check RLS policies

**Problem:** Can't insert data  
**Solution:** Verify INSERT policy exists for user's role

### Edge Function Failures
**Problem:** CORS errors  
**Solution:** Check `ALLOWED_ORIGINS` includes your domain

**Problem:** "Function not found"  
**Solution:** Deploy function: `supabase functions deploy FUNCTION_NAME`

**Problem:** Secret not loaded  
**Solution:** Set in Supabase Dashboard → Settings → Edge Functions

---

## 📈 MONITORING

### Check Database Health
```sql
-- Recent errors
SELECT * FROM admin_logs 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Active users (last hour)
SELECT COUNT(DISTINCT user_id) 
FROM activity_logs 
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Pending orders
SELECT COUNT(*) FROM orders 
WHERE payment_status = 'pending';
```

### View Performance Stats
```sql
-- Slow queries (if logging enabled)
SELECT query, calls, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Table sizes
SELECT relname, n_live_tup 
FROM pg_stat_user_tables 
ORDER BY n_live_tup DESC;
```

---

## 🔗 USEFUL LINKS

### Supabase Dashboard
- Project: https://app.supabase.com/project/xlyxtbcqirspcfxdznyu
- API Settings: https://app.supabase.com/project/xlyxtbcqirspcfxdznyu/settings/api
- Edge Functions: https://app.supabase.com/project/xlyxtbcqirspcfxdznyu/functions
- SQL Editor: https://app.supabase.com/project/xlyxtbcqirspcfxdznyu/sql

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [PayFast Developers](https://developers.payfast.co.za/)
- [MailerLite API](https://www.mailerlite.com/integrations/api)

---

## 🆘 EMERGENCY CONTACTS

### Support Channels
- **Technical Issues:** Check project documentation first
- **Database Problems:** Review migration files, check RLS policies
- **Payment Issues:** Verify PayFast credentials, check ITN logs
- **Email Problems:** Test MailerLite API key, verify group IDs

### Rollback Procedure
1. Identify problematic migration/function
2. Create fix migration or update function
3. Test in staging environment
4. Deploy to production
5. Monitor logs for 24 hours

---

## 📝 MIGRATION STATUS

**Total Migrations:** 35  
**Latest:** Performance indexes (2026-03-19)  
**Status:** ✅ All applied successfully

### Recent Migrations
- `20260319000000` - Performance optimization indexes
- `20260318153459` - Enhanced map events view
- `20260314151813` - Vendor applications system
- `20260314151126` - Navigation permissions

---

**Quick Reference Version:** 1.0  
**Maintained By:** Development Team  
**Last Review:** March 19, 2026
