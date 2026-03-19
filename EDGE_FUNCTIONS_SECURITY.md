# Supabase Edge Functions Security Best Practices

## 🔒 SECURITY CHECKLIST FOR ALL EDGE FUNCTIONS

### 1. CORS Configuration (CRITICAL)

**❌ CURRENT (Insecure):**
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // DANGEROUS: Allows ANY domain
};
```

**✅ RECOMMENDED (Secure):**
```typescript
// Allowed origins from environment variables
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") || "https://alpha-appeal.co.za").split(",");

function getCorsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  
  // Only allow specific origins
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  } else {
    headers["Access-Control-Allow-Origin"] = "https://alpha-appeal.co.za"; // Fallback to production
  }
  
  return headers;
}

// Usage in handler
const origin = req.headers.get("Origin");
const corsHeaders = getCorsHeaders(origin);
```

### 2. Input Validation (CRITICAL)

**❌ CURRENT (No validation):**
```typescript
const { email, name, tier } = await req.json();
// Directly uses untrusted input
```

**✅ RECOMMENDED (With validation):**
```typescript
import { z } from "https://deno.land/x/zod/mod.ts";

// Define schema
const SubscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2).max(100),
  tier: z.enum(["essential", "elite", "private"]),
  userId: z.string().uuid(),
});

// In handler
try {
  const body = await req.json();
  const validated = SubscribeSchema.parse(body);
  // Now safe to use validated.email, validated.name, etc.
} catch (error) {
  return new Response(
    JSON.stringify({ error: "Invalid input", details: error }),
    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

### 3. Rate Limiting (HIGH PRIORITY)

**✅ IMPLEMENTATION:**
```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

async function checkRateLimit(userId: string, action: string): Promise<boolean> {
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
  
  const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
  
  const { count } = await supabase
    .from("rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action", action)
    .gte("created_at", oneMinuteAgo);
  
  return (count || 0) < 10; // Max 10 requests per minute
}

// In handler
if (!await checkRateLimit(userId, "mailerlite-sync")) {
  return new Response(
    JSON.stringify({ error: "Rate limit exceeded" }),
    { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

### 4. Error Handling & Logging (HIGH PRIORITY)

**❌ CURRENT (Generic errors):**
```typescript
catch (err) {
  console.error("Error:", err);
  return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
}
```

**✅ RECOMMENDED (Detailed logging + user-friendly errors):**
```typescript
catch (err) {
  // Log full error details for debugging
  console.error(`[${req.method}] ${req.url}`, {
    error: err.message,
    stack: err.stack,
    userId: claimsData?.claims?.sub,
    timestamp: new Date().toISOString(),
  });
  
  // Log to activity_logs table for audit trail
  await supabase.from("activity_logs").insert({
    activity_type: "edge_function_error",
    user_id: claimsData?.claims?.sub,
    metadata: {
      function: "mailerlite-sync",
      error: err.message,
      url: req.url,
    },
  });
  
  // Return generic error to user (never expose internal details)
  return new Response(
    JSON.stringify({ 
      error: "An unexpected error occurred",
      code: "INTERNAL_ERROR"
    }),
    { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}
```

### 5. Secret Management (CRITICAL)

**✅ REQUIRED ENVIRONMENT VARIABLES:**

Create a `.env.local` file (gitignored) for local development:

```bash
# DO NOT COMMIT THIS FILE
SUPABASE_URL=https://xlyxtbcqirspcfxdznyu.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... # KEEP SECRET

# Payment Processing
PAYFAST_MERCHANT_ID=10000100
PAYFAST_MERCHANT_KEY=your_merchant_key
PAYFAST_PASSPHRASE=your_passphrase

# Email Marketing
MAILERLITE_API_KEY=your_api_key

# Shipping
SHIPDAY_API_KEY=your_api_key

# Security
ALLOWED_ORIGINS=https://alpha-appeal.co.za,https://www.alpha-appeal.co.za
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
```

**For Production:** Set these in Supabase Dashboard → Settings → Edge Functions

### 6. Function-Specific Recommendations

#### **mailerlite-sync**
- ✅ Add email validation
- ✅ Verify user subscription status before syncing
- ⚠️ Add retry logic for MailerLite API failures

#### **create-payfast-checkout**
- ✅ Validate cart items and prices against database
- ✅ Implement signature verification for ITN callbacks
- ⚠️ Add fraud detection (IP geolocation, amount limits)

#### **payfast-itn**
- ✅ Verify ITN signature using PayFast public key
- ✅ Check payment status matches expected amount
- ⚠️ Implement duplicate transaction prevention

#### **shipday-updates & post-to-shipday**
- ✅ Validate webhook signatures
- ✅ Sanitize address data before sending
- ⚠️ Add fallback for API rate limits

#### **routine-maintenance**
- ✅ Implement proper locking (prevent concurrent runs)
- ✅ Add execution timeout (max 5 minutes)
- ⚠️ Send alerts on failure via email/SMS

### 7. Testing Checklist

Before deploying any edge function:

- [ ] Unit tests for input validation
- [ ] Integration tests with Supabase
- [ ] CORS preflight requests work correctly
- [ ] Rate limiting enforced
- [ ] Errors logged but not exposed to users
- [ ] Secrets loaded from environment
- [ ] JWT authentication working
- [ ] Database RLS policies compatible

### 8. Monitoring & Alerts

Set up monitoring in Supabase Dashboard:

```sql
-- Create view for function errors
CREATE VIEW admin.edge_function_errors AS
SELECT 
  created_at,
  user_id,
  metadata->>'function' as function_name,
  metadata->>'error' as error_message
FROM activity_logs
WHERE activity_type = 'edge_function_error'
ORDER BY created_at DESC;

-- Alert on high error rate
CREATE OR REPLACE FUNCTION check_edge_function_health()
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  error_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO error_count
  FROM activity_logs
  WHERE activity_type = 'edge_function_error'
    AND created_at > NOW() - INTERVAL '5 minutes';
  
  IF error_count > 10 THEN
    -- Send alert email
    PERFORM net.http_post(
      url:='https://api.mailerlite.com/...',
      headers:='{"Content-Type": "application/json"}'::jsonb,
      body:=('{"errors": ' || error_count || '}')::jsonb
    );
  END IF;
END;
$$;
```

---

## 📊 IMPLEMENTATION PRIORITY

| Priority | Task | Estimated Time |
|----------|------|----------------|
| 🔴 CRITICAL | Fix CORS headers (all functions) | 1 hour |
| 🔴 CRITICAL | Add input validation (all functions) | 2 hours |
| 🟠 HIGH | Implement rate limiting | 3 hours |
| 🟠 HIGH | Improve error logging | 2 hours |
| 🟡 MEDIUM | Add monitoring views | 1 hour |
| 🟡 MEDIUM | Write unit tests | 4 hours |
| 🟢 LOW | Documentation updates | 1 hour |

**Total Estimated Time:** ~14 hours

---

## 🚀 DEPLOYMENT STEPS

1. **Update functions locally**
2. **Test with `supabase functions serve`**
3. **Deploy to staging environment**
4. **Run integration tests**
5. **Deploy to production**
6. **Monitor logs for 24 hours**

---

**Last Updated:** 2026-03-19  
**Reviewed By:** AI Security Audit
