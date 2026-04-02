# Delivery Management Quick Reference

## 🚀 Quick Start

### 1. Deploy Database Migration
```bash
supabase db push --file supabase/migrations/20260331150000_comprehensive_delivery_management.sql
```

### 2. Set Environment Variables
Add to `.env`:
```bash
SHIPDAY_API_KEY="your_api_key_here"
BOBGO_API_KEY="bobgo_key_future"
ENCRYPTION_KEY="32_char_encryption_key"
```

### 3. Deploy Edge Functions
```bash
supabase functions deploy post-to-shipday --no-verify-jwt --env-file .env
supabase functions deploy shipday-updates --no-verify-jwt --env-file .env
```

---

## 📊 System Capabilities Matrix

| Feature | Customer | Vendor | Admin | Driver |
|---------|----------|--------|-------|--------|
| **View Deliveries** | Own only | Store only | ALL | Assigned only |
| **Dispatch via Shipday** | ❌ No | ✅ Yes | ✅ Yes | ❌ No |
| **Assign Driver** | ❌ No | ✅ Yes | ✅ Override | ❌ No |
| **Live Tracking** | ✅ Yes | ✅ Yes | ✅ Yes | N/A |
| **Update Status** | ❌ No | ✅ Readiness | ✅ All | ✅ Workflow |
| **Contact Driver** | ✅ Call/SMS | ✅ Call | ✅ Call | N/A |
| **View POD** | ✅ Own | ✅ All | ✅ All | ✅ Upload |
| **Rate Delivery** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Set Pricing** | ❌ No | ✅ Own | ✅ All | ❌ No |

---

## 🔄 Delivery Status Flow

```
PENDING → ASSIGNED → EN_ROUTE_TO_PICKUP → AT_PICKUP → 
EN_ROUTE_TO_CUSTOMER → DELIVERED
                              ↓
                        FAILED/CANCELLED
```

### Status Descriptions

| Status | Description | Who Can Set |
|--------|-------------|-------------|
| `pending` | Awaiting driver assignment | System/Vendor |
| `assigned` | Driver assigned to delivery | System/Vendor/Admin |
| `en_route_to_pickup` | Driver heading to vendor | Driver/Auto (Shipday) |
| `at_pickup` | Driver arrived at vendor | Driver/Auto (Shipday) |
| `picked_up` | Order collected, en route to customer | Driver/Auto (Shipday) |
| `delivered` | Successfully completed | Driver/Auto (Shipday) |
| `failed` | Unable to complete (reason required) | Driver/Vendor/Admin |
| `cancelled` | Cancelled by customer/vendor | Vendor/Admin |

---

## 💰 Delivery Fee Calculation

### Formula
```
Base Fee + (Distance × Per Km Rate) + Time Multipliers + Priority Multiplier + Platform Markup

Example:
R50 + (12km × R15) + Peak Hour (30%) + Rush (50%) + Markup (20%)
= R50 + R180 + R69 + R115 + R82.80
= R496.80
```

### Default Pricing

| Component | Default Value |
|-----------|---------------|
| Base Fee | R50 |
| Per Km Rate | R15 |
| Peak Hour Multiplier | 1.3x (30% surcharge) |
| Weekend Multiplier | 1.2x (20% surcharge) |
| Rush Delivery | 1.5x (50% surcharge) |
| Scheduled Discount | 0.9x (10% off) |
| Platform Markup | 20% |

### Custom Query
```sql
SELECT calculate_delivery_fee(
  _vendor_id := 'your-vendor-uuid',
  _pickup_lat := -33.9249,
  _pickup_lng := 18.4241,
  _dropoff_lat := -33.9500,
  _dropoff_lng := 18.4600,
  _distance_km := 12.5,
  _provider_id := 'shipday',
  _is_rush := TRUE,
  _order_weight_kg := 2.0
);
```

---

## 🎯 Common Operations

### Vendor: Dispatch via Shipday

```typescript
const response = await supabase.functions.invoke("post-to-shipday", {
  body: {
    order_id: orderId,
    pickup_address: "Your Store Address",
    delivery_address: customerAddress,
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: customerEmail,
    order_items: [{ name: productName, quantity: 1 }],
    priority: "normal", // or "rush" or "scheduled"
    special_instructions: "Gate code: 1234",
  },
});

console.log(`Dispatched! Fee: R${response.data.delivery_fee}`);
```

### Vendor: Assign Manual Driver

```typescript
// Use database function
const { error } = await supabase.rpc("assign_driver_to_delivery", {
  _delivery_id: deliveryId,
  _driver_id: driverId,
  _assigned_by: (await supabase.auth.getUser()).data.user?.id,
  _assignment_method: 'manual',
});

if (error) throw error;
console.log("Driver assigned and notified!");
```

### Admin: Find Nearby Drivers

```sql
SELECT * FROM find_nearby_drivers(
  _latitude := -33.9249,
  _longitude := 18.4241,
  _radius_km := 10.0,
  _limit := 10
);

-- Returns: driver_id, distance_km, rating, total_deliveries, vehicle_type
```

### Customer: Track Live Delivery

```typescript
useEffect(() => {
  const channel = supabase
    .channel(`track-${deliveryId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      table: 'user_deliveries',
      filter: `id=eq.${deliveryId}`
    }, (payload) => {
      // Update UI
      setStatus(payload.new.status);
      if (payload.new.driver_latitude) {
        setDriverLocation({
          lat: payload.new.driver_latitude,
          lng: payload.new.driver_longitude
        });
      }
    })
    .subscribe();
    
  return () => supabase.removeChannel(channel);
}, []);
```

---

## 🔍 Database Queries

### Get All Active Deliveries for Vendor
```sql
SELECT 
  ud.*,
  o.order_number,
  o.product_name,
  o.amount,
  dd.name as driver_name,
  dd.phone as driver_phone,
  dd.rating as driver_rating
FROM user_deliveries ud
LEFT JOIN orders o ON ud.order_id = o.id
LEFT JOIN delivery_assignments da ON ud.id = da.delivery_id
LEFT JOIN delivery_drivers dd ON da.driver_id = dd.id
WHERE ud.vendor_id = 'vendor-uuid'
  AND ud.status NOT IN ('delivered', 'failed', 'cancelled')
ORDER BY ud.created_at DESC;
```

### Get Driver Earnings This Week
```sql
SELECT 
  dd.name,
  COUNT(da.id) as deliveries_count,
  SUM(da.earnings_amount) as total_earnings,
  SUM(da.tip_amount) as total_tips,
  AVG(da.customer_rating) as avg_rating
FROM delivery_drivers dd
JOIN delivery_assignments da ON dd.id = da.driver_id
WHERE da.assigned_at >= NOW() - INTERVAL '7 days'
GROUP BY dd.id, dd.name
ORDER BY total_earnings DESC;
```

### Get Delivery Performance Metrics
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_deliveries,
  COUNT(*) FILTER (WHERE status = 'delivered') as completed,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'delivered') * 100.0 / NULLIF(COUNT(*), 0),
    2
  ) as success_rate_percent,
  AVG(delivery_fee) as avg_fee,
  AVG(EXTRACT(EPOCH FROM (
    CASE WHEN delivered_at IS NOT NULL THEN delivered_at ELSE updated_at END 
    - created_at
  ))/60) as avg_time_minutes
FROM user_deliveries
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## ⚠️ Error Handling

### Failed Delivery Workflow

1. **Driver marks as failed:**
   ```typescript
   await supabase
     .from('user_deliveries')
     .update({ 
       status: 'failed',
       internal_notes: 'Customer not available, no response'
     })
     .eq('id', deliveryId);
   ```

2. **System logs error:**
   ```sql
   INSERT INTO delivery_errors (
     delivery_id,
     error_type,
     error_message,
     occurred_at
   ) VALUES (
     'delivery-uuid',
     'delivery_failed',
     'Customer unavailable after 3 attempts',
     NOW()
   );
   ```

3. **Retry logic triggers:**
   ```sql
   INSERT INTO delivery_retry_queue (
     order_id,
     operation_type,
     priority,
     retry_after
   ) VALUES (
     'order-uuid',
     'reassign_driver',
     1, -- High priority
     NOW() + INTERVAL '5 minutes'
   );
   ```

### Common Error Codes

| Error Type | Code | Resolution |
|------------|------|------------|
| Invalid Address | `INVALID_ADDRESS` | Verify address with customer |
| Driver Unavailable | `DRIVER_UNAVAILABLE` | Reassign to different driver |
| API Timeout | `SHIPDAY_TIMEOUT` | Retry with exponential backoff |
| Payment Failed | `PAYMENT_FAILED` | Contact customer for new payment method |
| Item Out of Stock | `OUT_OF_STOCK` | Vendor refunds, cancels order |

---

## 🔐 Access Control Summary

### Table Permissions

| Table | Public | Authenticated | Vendor | Admin |
|-------|--------|---------------|--------|-------|
| `delivery_service_providers` | Read (active only) | Read | Read | ALL |
| `user_deliveries` | ❌ | ❌ | Own store | ALL |
| `delivery_drivers` | ❌ | Read (basic) | View assigned | ALL |
| `delivery_assignments` | ❌ | View own | View store | ALL |
| `delivery_zones` | ❌ | Read | Manage own | ALL |
| `delivery_pricing` | ❌ | Read | Manage own | ALL |

### Function Permissions

| Function | Who Can Execute |
|----------|-----------------|
| `calculate_delivery_fee()` | Vendors, Admins |
| `find_nearby_drivers()` | Vendors, Admins |
| `assign_driver_to_delivery()` | Vendors (own), Admins (all) |
| `find_optimal_delivery_provider()` | Vendors, Admins |

---

## 📱 Real-Time Events

### Supabase Realtime Channels

**Customer Channel:**
```typescript
supabase.channel(`deliveries-${userId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    table: 'user_deliveries',
    filter: `user_id=eq.${userId}`
  })
```

**Vendor Channel:**
```typescript
supabase.channel(`vendor-deliveries-${partnerId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'user_deliveries',
    filter: `vendor_id=eq.${partnerId}`
  })
```

**Driver Notification Channel:**
```typescript
// PostgreSQL NOTIFY (triggered by assign_driver_to_delivery function)
LISTEN driver_notification;

// Receives JSON payload:
{
  "assignment_id": "uuid",
  "delivery_id": "uuid",
  "driver_id": "uuid",
  "type": "new_assignment"
}
```

---

## 🛠️ Troubleshooting

### Issue: Driver Not Receiving Assignments

**Check:**
1. Driver `is_available` status:
   ```sql
   SELECT is_available FROM delivery_drivers WHERE id = 'driver-id';
   ```
2. Background check approval:
   ```sql
   SELECT background_check_status FROM delivery_drivers WHERE id = 'driver-id';
   ```
3. pg_notify listener active (check driver app logs)

**Fix:**
```sql
UPDATE delivery_drivers 
SET is_available = TRUE, 
    background_check_status = 'approved'
WHERE id = 'driver-id';
```

### Issue: Webhook Not Updating

**Check Shipday webhook logs:**
```bash
supabase functions logs shipday-updates --format jsonl | grep "webhook"
```

**Verify webhook URL in Shipday dashboard:**
```
https://your-project.supabase.co/functions/v1/shipday-updates
```

**Test manually:**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/shipday-updates \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-order-123",
    "orderNumber": "TEST-001",
    "orderStatus": "COMPLETED",
    "assignedCarrier": {
      "name": "Test Driver",
      "phone": "+27123456789"
    }
  }'
```

### Issue: Incorrect Delivery Fee

**Debug calculation:**
```sql
SELECT 
  base_fee,
  per_km_fee,
  platform_markup_percent,
  rush_delivery_multiplier
FROM delivery_pricing
WHERE vendor_id = 'your-vendor-id'
  AND is_active = TRUE;
```

**Recalculate manually:**
```sql
SELECT calculate_delivery_fee(
  _vendor_id := 'vendor-id',
  _pickup_lat := -33.9249,
  _pickup_lng := 18.4241,
  _dropoff_lat := -33.9500,
  _dropoff_lng := 18.4600,
  _distance_km := 12.5,
  _is_rush := FALSE
);
```

---

## 📈 Monitoring Queries

### Today's Stats
```sql
SELECT 
  COUNT(*) as total_deliveries,
  COUNT(*) FILTER (WHERE status = 'delivered') as completed,
  COUNT(*) FILTER (WHERE status = 'in_transit') as in_progress,
  SUM(delivery_fee) as total_revenue,
  AVG(delivery_fee) as avg_fee
FROM user_deliveries
WHERE DATE(created_at) = CURRENT_DATE;
```

### Top Performing Drivers (This Month)
```sql
SELECT 
  dd.name,
  COUNT(da.id) as deliveries,
  AVG(da.customer_rating) as avg_rating,
  SUM(da.earnings_amount) as earnings
FROM delivery_drivers dd
JOIN delivery_assignments da ON dd.id = da.driver_id
WHERE da.assigned_at >= DATE_TRUNC('month', NOW())
GROUP BY dd.id, dd.name
ORDER BY deliveries DESC, avg_rating DESC
LIMIT 10;
```

### Vendor Delivery Analytics
```sql
SELECT 
  ap.name as vendor_name,
  COUNT(ud.id) as total_deliveries,
  ROUND(AVG(ud.delivery_fee)) as avg_fee,
  ROUND(AVG(EXTRACT(EPOCH FROM (ud.delivered_at - ud.created_at))/60)) as avg_time_min,
  COUNT(*) FILTER (WHERE ud.status = 'delivered') * 100 / COUNT(*) as success_rate
FROM user_deliveries ud
JOIN alpha_partners ap ON ud.vendor_id = ap.id
WHERE ud.created_at >= NOW() - INTERVAL '30 days'
GROUP BY ap.id, ap.name
HAVING COUNT(ud.id) > 5
ORDER BY total_deliveries DESC;
```

---

## 🎨 UI Component Locations

| Component | File Path | Purpose |
|-----------|-----------|---------|
| Customer Deliveries | `src/pages/CustomerDeliveries.tsx` | User tracking interface |
| Vendor Deliveries | `src/components/vendor/VendorDeliveries.tsx` | Vendor dispatch hub |
| Admin Deliveries | `src/components/admin/DeliveriesTab.tsx` | Network oversight |
| Delivery Services Lib | `supabase/functions/_shared/deliveryServices.ts` | API integrations |

---

## 📞 Emergency Contacts

| Role | Action | Contact |
|------|--------|---------|
| Driver Support | Report issue | support@alpha.app |
| Vendor Support | Technical help | vendors@alpha.app |
| Admin Escalation | Critical failure | admin@alpha.app |
| Shipday API | API issues | api-support@shipday.com |

---

## 🔗 Useful Links

- **Main Documentation:** `COMPREHENSIVE_DELIVERY_MANAGEMENT.md`
- **Implementation Guide:** `UBER_EATS_DELIVERY_ENHANCEMENT.md`
- **Database Schema:** `supabase/migrations/20260331150000_comprehensive_delivery_management.sql`
- **Shipday API Docs:** https://docs.shipday.com
- **Supabase Realtime:** https://supabase.com/docs/guides/realtime

---

**Quick Reference v2.0** | Last Updated: March 31, 2026 | Alpha Development Team
