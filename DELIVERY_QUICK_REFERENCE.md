# 🚀 DELIVERY SYSTEM QUICK REFERENCE

**Last Updated:** March 31, 2026

---

## 🔧 QUICK START COMMANDS

### Deploy Database Changes
```bash
supabase db push
```

### Test Functions Locally
```bash
supabase functions serve
```

### Deploy Edge Functions
```bash
supabase functions deploy post-to-shipday
supabase functions deploy shipday-updates
supabase functions deploy process-delivery-retries
```

---

## 📁 FILE REFERENCE

### Edge Functions
| Function | Purpose | URL Pattern |
|----------|---------|-------------|
| `post-to-shipday` | Create delivery orders | `/functions/v1/post-to-shipday` |
| `shipday-updates` | Handle Shipday webhooks | `/functions/v1/shipday-updates` |
| `process-delivery-retries` | Process retry queue | Cron job every 5 min |

### Shared Utilities
| File | Purpose |
|------|---------|
| `_shared/cors.ts` | CORS header management |
| `_shared/validation.ts` | Zod schemas for validation |
| `_shared/notifications.ts` | Multi-channel notifications |

### Frontend Components
| File | Purpose |
|------|---------|
| `src/pages/Deliveries.tsx` | Customer delivery tracking |
| `src/components/admin/DeliveriesTab.tsx` | Admin delivery management |

### Database Tables
| Table | Purpose |
|-------|---------|
| `user_deliveries` | Main delivery tracking |
| `delivery_errors` | Error monitoring |
| `delivery_retry_queue` | Automatic retries |
| `delivery_notifications` | Notification logs |

---

## 🔍 DEBUGGING CHECKLIST

### Webhook Not Processing
1. Check Shipday webhook URL in Supabase config
2. Verify webhook signature (if enabled)
3. Check `delivery_errors` table for failures
4. Review edge function logs in Supabase dashboard
5. Test with Postman using sample payload

### Delivery Not Updating
1. Verify `shipday_order_id` matches
2. Check RLS policies allow updates
3. Confirm service role key used
4. Check database triggers firing
5. Look for constraint violations

### Notifications Not Sending
1. Verify API keys configured (MailerLite, Twilio, FCM)
2. Check user has valid email/phone
3. Review `delivery_notifications` table status
4. Test each channel separately
5. Check rate limits not exceeded

---

## 🧪 TESTING PAYLOADS

### Post to Shipday - Valid Request
```json
{
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+27123456789",
  "delivery_address": "123 Main St, Sandton, Johannesburg",
  "items": [
    {"name": "Product A", "quantity": 2}
  ],
  "priority": "normal",
  "admin_notes": "Handle with care"
}
```

### Shipday Webhook - Driver Assigned
```json
{
  "id": "SHIP-12345",
  "orderNumber": "ORD-67890",
  "orderStatus": "ASSIGNED",
  "assignedCarrier": {
    "name": "Jane Driver",
    "phone": "+27987654321",
    "latitude": -26.107568,
    "longitude": 28.056713
  }
}
```

### Shipday Webhook - Delivered
```json
{
  "id": "SHIP-12345",
  "orderNumber": "ORD-67890",
  "orderStatus": "COMPLETED",
  "proofOfDelivery": {
    "photoUrl": "https://...",
    "signatureUrl": "https://..."
  }
}
```

---

## 📊 USEFUL SQL QUERIES

### Check Active Deliveries
```sql
SELECT * FROM user_deliveries
WHERE status NOT IN ('delivered', 'failed')
ORDER BY created_at DESC;
```

### View Unresolved Errors
```sql
SELECT * FROM delivery_errors
WHERE resolved = false
ORDER BY occurred_at DESC
LIMIT 20;
```

### Check Pending Retries
```sql
SELECT * FROM delivery_retry_queue
WHERE resolved = false
  AND retry_after <= NOW()
ORDER BY priority ASC, retry_after ASC;
```

### Today's Delivery Metrics
```sql
SELECT * FROM admin.delivery_metrics
WHERE metric_date = CURRENT_DATE;
```

### User's Delivery History
```sql
SELECT ud.*, o.order_number, o.product_name
FROM user_deliveries ud
JOIN orders o ON ud.order_id = o.id
WHERE ud.user_id = 'USER_UUID'
ORDER BY ud.created_at DESC;
```

---

## ⚙️ ENVIRONMENT VARIABLES

### Required for All Functions
```bash
SUPABASE_URL=https://xlyxtbcqirspcfxdznyu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ALLOWED_ORIGINS=https://alpha-appeal.co.za
```

### Shipday Integration
```bash
SHIPDAY_API_KEY=your_api_key
SHIPDAY_WEBHOOK_SECRET=your_webhook_secret
```

### Notifications
```bash
MAILERLITE_API_KEY=your_mailerlite_key
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
FCM_SERVER_KEY=your_fcm_key
```

---

## 🚨 COMMON ERRORS & FIXES

### Error: "Invalid JSON payload"
**Cause:** Malformed request body  
**Fix:** Validate JSON syntax, check Content-Type header

### Error: "No order ID in payload"
**Cause:** Missing order identifier  
**Fix:** Ensure `orderNumber` or `orderId` in payload

### Error: "Failed to update delivery"
**Cause:** Database constraint violation or missing record  
**Fix:** Check RLS policies, verify `shipday_order_id` exists

### Error: "Shipday API key not configured"
**Cause:** Missing environment variable  
**Fix:** Set `SHIPDAY_API_KEY` in Edge Functions secrets

### Error: "Rate limited"
**Cause:** Too many requests to Shipday API  
**Fix:** Implement exponential backoff, use retry queue

---

## 📞 ESCALATION PATHS

### Level 1: Automated Systems
- Retry queue handles transient failures
- Error logging captures details
- Alerts notify on-call developer

### Level 2: Developer Intervention
- Manual retry via admin dashboard
- Database record fixes
- Configuration adjustments

### Level 3: Shipday Support
- Contact: support@shipday.com
- Provide: Order ID, error details, timestamps
- SLA: 24-48 hour response

### Level 4: Customer Recovery
- Refund or redelivery
- Personal apology from support
- Credit voucher for inconvenience

---

## 🎯 MONITORING DASHBOARD

### Daily Checks
- Active deliveries count
- Failed deliveries count
- Unresolved errors
- Pending retries
- Average delivery time

### Weekly Reports
- Success rate trend
- Top error types
- Notification delivery rates
- Cost per delivery analysis

### Monthly Reviews
- Overall performance metrics
- Customer satisfaction scores
- Shipday partnership review
- Feature roadmap planning

---

## 📚 ADDITIONAL RESOURCES

### Documentation
- [Full Implementation Guide](DELIVERY_SYSTEM_IMPLEMENTATION.md)
- [Enhancements Summary](DELIVERY_ENHANCEMENTS_SUMMARY.md)
- [Audit Report](COMPREHENSIVE_AUDIT_REPORT.md)

### External Links
- [Shipday API Docs](https://www.shipday.com/api-docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Zod Validation Library](https://zod.dev/)

### Team Contacts
- **Lead Developer:** [Name] - [Email]
- **DevOps:** [Name] - [Email]
- **Shipday Account Manager:** [Name] - [Email]

---

**Need Help?** Check the comprehensive guides above or reach out to the development team!
