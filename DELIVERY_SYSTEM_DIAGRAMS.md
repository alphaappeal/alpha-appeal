# Delivery System Architecture Diagrams

**Purpose:** Visual representation of the comprehensive delivery management system  
**Last Updated:** March 31, 2026

---

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│                                                                      │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐      │
│  │   Customer   │      │    Vendor    │      │     Admin    │      │
│  │  Mobile App  │      │   Portal     │      │  Dashboard   │      │
│  │  (React)     │      │  (React)     │      │  (React)     │      │
│  └──────┬───────┘      └──────┬───────┘      └──────┬───────┘      │
│         │                     │                      │               │
│  ┌──────┴───────┐      ┌──────┴───────┐             │               │
│  │    Driver    │◄─────┤  Realtime    ├─────────────┘               │
│  │  Mobile App  │      │ Subscriptions│                             │
│  │  (Future)    │      └──────────────┘                             │
│  └──────┬───────┘                                                    │
└─────────┼────────────────────────────────────────────────────────────┘
          │ HTTPS / WebSocket
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SUPABASE BACKEND                                │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    EDGE FUNCTIONS                             │  │
│  │                                                               │  │
│  │  ┌──────────────────┐        ┌──────────────────┐           │  │
│  │  │  post-to-shipday │        │  shipday-updates │           │  │
│  │  │  (Dispatch)      │        │  (Webhook)       │           │  │
│  │  └────────┬─────────┘        └────────┬─────────┘           │  │
│  │           │                           │                      │  │
│  │  ┌────────┴─────────┐        ┌────────┴─────────┐           │  │
│  │  │   bobgo-dispatch │        │  error-handling  │           │  │
│  │  │   (Future)       │        │  & retry logic   │           │  │
│  │  └──────────────────┘        └──────────────────┘           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   DATABASE (PostgreSQL)                       │  │
│  │                                                               │  │
│  │  Core Tables:                                                 │  │
│  │  • user_deliveries (enhanced)                                │  │
│  │  • delivery_drivers                                          │  │
│  │  • delivery_assignments                                      │  │
│  │  • delivery_service_providers                                │  │
│  │  • delivery_zones                                            │  │
│  │  • delivery_pricing                                          │  │
│  │  • delivery_errors                                           │  │
│  │  • delivery_retry_queue                                      │  │
│  │                                                               │  │
│  │  Smart Functions:                                             │  │
│  │  • calculate_delivery_fee()                                  │  │
│  │  • find_nearby_drivers()                                     │  │
│  │  • assign_driver_to_delivery()                               │  │
│  │  • find_optimal_delivery_provider()                          │  │
│  │                                                               │  │
│  │  Security: Row Level Security Policies                        │  │
│  │  Realtime: WebSocket subscriptions                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
          │                              │
          │ API Calls                    │ Webhooks
          ▼                              ▼
┌──────────────────┐          ┌──────────────────┐
│  SHIPDAY API     │          │   BOBGO API      │
│                  │          │                  │
│ • Create Orders  │          │ • Create Orders  │
│ • Get Quotes     │          │ • Get Quotes     │
│ • Track Drivers  │          │ • Track Drivers  │
│ • Process POD    │          │ • Process POD    │
└──────────────────┘          └──────────────────┘
          │                              │
          ▼                              ▼
┌──────────────────┐          ┌──────────────────┐
│  SHIPDAY DRIVERS │          │   BOBGO DRIVERS  │
│  (Independent)   │          │  (Independent)   │
└──────────────────┘          └──────────────────┘
```

---

## 2. Database Entity Relationship Diagram

```
┌────────────────────────┐         ┌────────────────────────┐
│   auth.users           │         │   alpha_partners       │
│────────────────────────│         │────────────────────────│
│ id (PK)                │         │ id (PK)                │
│ email                  │         │ name                   │
│ created_at             │         │ phone                  │
└───────────┬────────────┘         └───────────┬────────────┘
            │                                   │
            │ 1:1                               │ 1:N
            ▼                                   ▼
┌────────────────────────┐         ┌────────────────────────┐
│   profiles             │         │   vendor_accounts      │
│────────────────────────│         │────────────────────────│
│ id (PK, FK)            │         │ id (PK)                │
│ user_id (FK)           │         │ user_id (FK)           │
│ full_name              │         │ partner_id (FK)        │
│ phone                  │         │ role                   │
└───────────┬────────────┘         └────────────────────────┘
            │
            │ 1:N
            ▼
┌────────────────────────┐
│   user_deliveries      │◄──────────────────────┐
│────────────────────────│                       │
│ id (PK)                │                       │
│ order_id (FK)          │                       │
│ user_id (FK)           │                       │
│ vendor_id (FK)         │                       │
│ delivery_service_prov  │                       │
│ status                 │                       │
│ pickup_address         │                       │
│ delivery_address       │                       │
│ driver_name            │                       │
│ driver_phone           │                       │
│ eta_minutes            │                       │
│ distance_km            │                       │
│ delivery_fee           │                       │
│ shipday_order_id       │                       │
│ created_at             │                       │
└─────┬──────────────────┘                       │
      │                                          │
      │ 1:1                                      │ 1:N
      ▼                                          │
┌────────────────────────┐                       │
│   orders               │                       │
│────────────────────────│                       │
│ id (PK)                │                       │
│ order_number           │                       │
│ user_id (FK)           │                       │
│ product_name           │                       │
│ amount                 │                       │
└────────────────────────┘                       │
                                                  │
      ┌─────────────────────────────────────────┘
      │
      │ N:M (via delivery_id)
      ▼
┌────────────────────────┐         ┌────────────────────────┐
│   delivery_assignments │         │   delivery_drivers     │
│────────────────────────│         │────────────────────────│
│ id (PK)                │         │ id (PK)                │
│ delivery_id (FK)       │◄────────│ user_id (FK)           │
│ driver_id (FK)         │         │ vendor_id (FK)         │
│ assigned_by (FK)       │         │ is_independent_contr.  │
│ status                 │         │ current_latitude       │
│ earnings_amount        │         │ current_longitude      │
│ customer_rating        │         │ rating                 │
│ route_geometry         │         │ vehicle_type           │
│ created_at             │         │ background_check_status│
└────────────────────────┘         │ earnings_total         │
                                   └────────────────────────┘
                                            ▲
                                            │
                                            │ N:M (via driver_id)
                                            │
┌────────────────────────┐                  │
│   delivery_service_    │──────────────────┘
│   providers            │
│────────────────────────│
│ id (PK)                │
│ name                   │
│ display_name           │
│ api_key_encrypted      │
│ base_url               │
│ is_active              │
│ supported_regions      │
│ pricing_model          │
└───────────┬────────────┘
            │
            │ 1:N
            ▼
┌────────────────────────┐         ┌────────────────────────┐
│   delivery_pricing     │         │   delivery_zones       │
│────────────────────────│         │────────────────────────│
│ id (PK)                │         │ id (PK)                │
│ provider_id (FK)       │         │ provider_id (FK)       │
│ vendor_id (FK)         │         │ vendor_id (FK)         │
│ zone_id (FK)           │         │ name                   │
│ base_fee               │         │ polygon_geojson        │
│ per_km_fee             │         │ center_lat/lng         │
│ multipliers...         │         │ radius_km              │
│ platform_markup        │         │ is_active              │
│ valid_from             │         └────────────────────────┘
│ valid_until            │
│ is_active              │
└────────────────────────┘

Additional Tables:
• delivery_errors (error tracking)
• delivery_retry_queue (retry logic)
```

---

## 3. Delivery Lifecycle Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    STAGE 1: ORDER PLACEMENT                          │
│                                                                      │
│  Customer places order                                              │
│         │                                                           │
│         ▼                                                           │
│  Payment processed (PayFast)                                        │
│         │                                                           │
│         ▼                                                           │
│  Order created in `orders` table                                    │
│         │                                                           │
│         ▼                                                           │
│  Notification sent to vendor                                        │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  STAGE 2: VENDOR ACCEPTANCE                          │
│                                                                      │
│  Vendor accepts order                                               │
│         │                                                           │
│         ├──► Mark as "ready for delivery"                           │
│         │                                                           │
│         ├──► System calculates delivery fee                         │
│         │   (calculate_delivery_fee function)                       │
│         │                                                           │
│         └──► Delivery record created                                │
│             in `user_deliveries`                                    │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  STAGE 3: DELIVERY ASSIGNMENT                        │
│                                                                      │
│         ┌─────────────────┬─────────────────┬──────────────────┐   │
│         │                 │                 │                  │   │
│         ▼                 ▼                 ▼                  ▼   │
│   Option A:          Option B:         Option C:          Option D: │
│   Automatic          Manual           Third-Party        Driver     │
│   (System)           (Vendor)         (Shipday/BobGo)    Acceptance│
│         │                 │                 │                  │   │
│         │                 │                 │                  │   │
│         ▼                 ▼                 ▼                  ▼   │
│   find_nearby_      Vendor opens      Vendor selects     Driver    │
│   drivers()         assignment        "Dispatch via      sees      │
│                     dialog            Provider"          available │
│         │                 │                 │          deliveries  │
│         │                 │                 │                  │   │
│         ▼                 ▼                 ▼                  ▼   │
│   Best driver       Select from       Choose provider    Driver    │
│   selected          available         (Shipday/BobGo)    accepts   │
│   (rating,          drivers                                         │
│   distance)         Set earnings                                    │
│         │           amount                                          │
│         │                 │                 │                  │   │
│         └─────────────────┴─────────────────┴──────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│                    assign_driver_to_delivery()                      │
│                              │                                      │
│                              ▼                                      │
│                    Creates assignment record                        │
│                    Updates delivery status                          │
│                    Sends pg_notify to driver                        │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STAGE 4: DRIVER PICKUP                            │
│                                                                      │
│  Driver receives notification                                       │
│         │                                                           │
│         ▼                                                           │
│  Status: en_route_to_pickup                                         │
│         │                                                           │
│         ├──► GPS tracking active                                    │
│         │   (location updates every 10s)                            │
│         │                                                           │
│         ▼                                                           │
│  Arrives at vendor                                                  │
│  Status: at_pickup                                                  │
│         │                                                           │
│         ▼                                                           │
│  Picks up order                                                     │
│  Status: en_route_to_customer                                       │
│         │                                                           │
│         ▼                                                           │
│  Geofence left (auto-update via Shipday)                            │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  STAGE 5: DELIVERY IN PROGRESS                       │
│                                                                      │
│  Live location updates                                              │
│         │                                                           │
│         ├──► Supabase Realtime subscription                         │
│         │   broadcasts to customer/vendor/admin                     │
│         │                                                           │
│         ├──► ETA calculated based on traffic                        │
│         │   (light/moderate/heavy/severe)                           │
│         │                                                           │
│         ▼                                                           │
│  Customer tracks driver on map                                      │
│         │                                                           │
│         ▼                                                           │
│  Push notifications sent:                                           │
│  • "Driver is 5 min away"                                           │
│  • "Driver has arrived"                                             │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  STAGE 6: DELIVERY COMPLETION                        │
│                                                                      │
│  Driver arrives at destination                                      │
│         │                                                           │
│         ▼                                                           │
│  Captures Proof of Delivery (POD):                                  │
│         ├──► Photo of delivery at door                              │
│         └──► Customer signature (if required)                       │
│         │                                                           │
│         ▼                                                           │
│  Marks delivery as `delivered`                                      │
│         │                                                           │
│         ▼                                                           │
│  Final status update sent                                           │
│         │                                                           │
│         ▼                                                           │
│  Driver earnings released:                                          │
│         ├──► earnings_pending → earnings_total                      │
│         └──► Payout scheduled (weekly/daily)                        │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STAGE 7: POST-DELIVERY                            │
│                                                                      │
│  Customer rates driver (1-5 stars)                                  │
│         │                                                           │
│         ▼                                                           │
│  Driver rates customer (optional)                                   │
│         │                                                           │
│         ▼                                                           │
│  Feedback stored in `delivery_assignments`:                         │
│         ├──► customer_rating                                        │
│         ├──► customer_feedback                                      │
│         ├──► driver_rating                                          │
│         └──► driver_feedback                                        │
│         │                                                           │
│         ▼                                                           │
│  Driver stats updated:                                              │
│         ├──► total_deliveries++                                     │
│         ├──► completed_deliveries++                                 │
│         └──► earnings_total += earnings_amount                      │
│         │                                                           │
│         ▼                                                           │
│  Analytics updated:                                                 │
│         ├──► vendor metrics                                         │
│         ├──► provider performance                                   │
│         └──► platform revenue                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Error Handling Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ERROR SCENARIO TRIGGER                          │
│                                                                      │
│  Examples:                                                          │
│  • Driver unable to locate customer                                 │
│  • Vehicle breakdown                                                │
│  • Item damaged during transport                                    │
│  • Customer unavailable                                             │
│  • API timeout (Shipday/BobGo)                                      │
│  • Payment failure                                                  │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  STEP 1: ERROR DETECTION                             │
│                                                                      │
│  Driver marks delivery as `failed`                                  │
│         │                                                           │
│         OR                                                          │
│         │                                                           │
│  Webhook returns error status                                       │
│         │                                                           │
│         OR                                                          │
│         │                                                           │
│  Edge function throws exception                                     │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  STEP 2: ERROR LOGGING                               │
│                                                                      │
│  INSERT INTO delivery_errors:                                       │
│  • delivery_id                                                      │
│  • error_type (e.g., "customer_unavailable")                        │
│  • error_message                                                    │
│  • occurred_at (timestamp)                                          │
│         │                                                           │
│         ▼                                                           │
│  Notify admin via:                                                  │
│  • Email                                                            │
│  • SMS                                                              │
│  • In-app notification                                              │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  STEP 3: AUTOMATIC RETRY                             │
│                                                                      │
│  INSERT INTO delivery_retry_queue:                                  │
│  • order_id                                                         │
│  • operation_type ("reassign_driver")                               │
│  • attempts = 0                                                     │
│  • max_attempts = 3                                                 │
│  • priority (1=highest)                                             │
│  • retry_after (NOW + 5 min)                                        │
│         │                                                           │
│         ▼                                                           │
│  Retry job runs every 5 minutes:                                    │
│         │                                                           │
│         ├──► Check retry_after timestamp                            │
│         │                                                           │
│         ├──► If attempts < max_attempts:                            │
│         │   │                                                       │
│         │   ├──► Attempt reassignment                               │
│         │   │   (find_nearby_drivers + assign)                      │
│         │   │                                                       │
│         │   ├──► If success:                                        │
│         │   │   └──► Remove from queue                              │
│         │   │                                                       │
│         │   └──► If failure:                                        │
│         │       ├──► attempts++                                     │
│         │       └──► Schedule next retry (exponential backoff)      │
│         │                                                           │
│         └──► If attempts >= max_attempts:                           │
│             └──► Escalate to human review                           │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  STEP 4: RESOLUTION PATHS                            │
│                                                                      │
│         ┌─────────────────┬─────────────────┬──────────────────┐   │
│         │                 │                 │                  │   │
│         ▼                 ▼                 ▼                  ▼   │
│   Path A:            Path B:           Path C:            Path D:   │
│   Reassign           Reschedule        Refund             Human     │
│   (New Driver)       (Later Time)      (Cancel)           Review    │
│         │                 │                 │                  │   │
│         │                 │                 │                  │   │
│         ▼                 ▼                 ▼                  ▼   │
│   Find new          Contact          Void payment         Support   │
│   driver via        customer         Reverse fees         team      │
│   find_nearby_      New delivery     Issue credit         intervenes│
│   drivers()         time             note                 manually  │
│                                                             │       │
│         └─────────────────┴─────────────────┴──────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│                    Update delivery status                           │
│                    Log resolution in DB                             │
│                    Send notifications                               │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  STEP 5: POST-MORTEM ANALYSIS                        │
│                                                                      │
│  Weekly error report generated:                                     │
│  • Total errors by type                                             │
│  • Average resolution time                                          │
│  • Success rate of retries                                          │
│  • Top failing vendors/drivers                                      │
│  • Recommendations for improvement                                  │
│         │                                                           │
│         ▼                                                           │
│  System optimizations applied:                                      │
│  • Adjust driver matching algorithm                                 │
│  • Update pricing for high-failure zones                            │
│  • Provide additional training                                      │
│  • Terminate repeat offenders                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Real-Time Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                   REAL-TIME EVENT SOURCES                            │
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │  Database    │    │   Webhook    │    │   User       │          │
│  │  Triggers    │    │   Events     │    │   Actions    │          │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘          │
│         │                   │                   │                   │
│         │ UPDATE on         │ Shipday status    │ Driver clicks     │
│         │ user_deliveries   │ change            │ "Start Delivery"  │
│         │                   │                   │                   │
│         ▼                   ▼                   ▼                   │
└─────────────────────────────────────────────────────────────────────┘
         │                   │                   │
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SUPABASE REALTIME HUB                             │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Channel: deliveries-{userId}                                │  │
│  │  Event: postgres_changes (UPDATE)                            │  │
│  │  Table: user_deliveries                                      │  │
│  │  Filter: user_id = {userId}                                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Channel: vendor-deliveries-{partnerId}                      │  │
│  │  Event: postgres_changes (*)                                 │  │
│  │  Table: user_deliveries                                      │  │
│  │  Filter: vendor_id = {partnerId}                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Channel: admin-deliveries                                   │  │
│  │  Event: postgres_changes (*)                                 │  │
│  │  Table: user_deliveries                                      │  │
│  │  Filter: none (all changes)                                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  System Channel: driver-notification                         │  │
│  │  Event: pg_notify                                            │  │
│  │  Payload: JSON with assignment details                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
         │                   │                   │
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CLIENT SUBSCRIPTIONS                            │
│                                                                      │
│  Customer App:                        Vendor Portal:                │
│  ─────────────                        ──────────────                │
│  subscribe(`deliveries-${userId}`)    subscribe(`vendor-deliveries- │
│    on UPDATE:                         {partnerId}`)                  │
│      - Update status badge            on ANY change:                │
│      - Show toast notification          - Reload deliveries list    │
│      - Animate map marker             Admin Dashboard:              │
│                                         ─────────────────           │
│  Driver App:                          subscribe(`admin-deliveries`) │
│  ────────────                         on ANY change:                │
│  listen(pg_notify)                    - Update network stats        │
│    on assignment:                     - Refresh analytics           │
│      - Play notification sound        - Trigger alerts if needed    │
│      - Show assignment modal                                        │
│      - Navigate to pickup                                           │
└─────────────────────────────────────────────────────────────────────┘
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    UI UPDATE EXAMPLES                                │
│                                                                      │
│  Customer sees:                         Vendor sees:                │
│  ──────────────                         ─────────────               │
│  [Order Status Badge]                 [Delivery Pipeline]           │
│  🟡 In Transit    → 🟢 Arrived         Order #123: En Route         │
│                                         ↓                            │
│  [Map with Driver]                    Order #123: Delivered ✅      │
│  🚗 → → → 🏠                                                       │
│                                         Admin sees:                 │
│  [ETA Timer]                          ───────────────               │
│  8 min → 5 min → 2 min                Network-wide dashboard:       │
│                                         156 active deliveries       │
│                                         94% on-time rate            │
│                                         R12,450 revenue today       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Component Hierarchy Diagram

```
App.tsx
│
├─── Header
│
├─── Routes
│    │
│    ├─── / (Home)
│    │
│    ├─── /profile → Profile Page
│    │
│    ├─── /vendor-portal → VendorPortal
│    │    │
│    │    ├─── Sidebar Navigation
│    │    │    ├─── Dashboard
│    │    │    ├─── Products
│    │    │    ├─── Store Details
│    │    │    ├─── Store Hours
│    │    │    ├─── Orders
│    │    │    └─── Deliveries ← VendorDeliveries Component
│    │    │
│    │    └─── Main Content Area
│    │         │
│    │         └─── activeSection === "deliveries"
│    │              │
│    │              └─── VendorDeliveries.tsx
│    │                   │
│    │                   ├─── Stats Cards
│    │                   │    ├─── Active Count
│    │                   │    ├─── Completed Count
│    │                   │    ├─── Revenue Total
│    │                   │    └─── Avg Delivery Time
│    │                   │
│    │                   ├─── Needs Dispatch Section
│    │                   │    └─── DeliveryCard (unassigned)
│    │                   │         ├─── Order Info
│    │                   │         ├─── Assign Driver Button
│    │                   │         └─── Dispatch Button
│    │                   │
│    │                   └─── Delivery Pipeline Section
│    │                        └─── DeliveryCard (all statuses)
│    │                             ├─── Status Badge
│    │                             ├─── Driver Info Card
│    │                             │    ├─── Driver Name
│    │                             │    ├─── Phone (clickable)
│    │                             │    ├─── Rating
│    │                             │    └─── Vehicle Info
│    │                             ├─── Delivery Details Grid
│    │                             │    ├─── ETA
│    │                             │    ├─── Distance
│    │                             │    ├─── Fee
│    │                             │    └─── Scheduled Time
│    │                             └─── Action Buttons
│    │                                  ├─── Update Status
│    │                                  ├─── Track (external link)
│    │                                  └─── View POD
│    │
│    ├─── /admin → Admin Dashboard
│    │    │
│    │    └─── Tabs
│    │         │
│    │         └─── DeliveriesTab.tsx
│    │              │
│    │              ├─── Network Stats
│    │              ├─── Unassigned Orders
│    │              │    └─── PostToShipday Dialog
│    │              └─── Delivery Pipeline
│    │
│    ├─── /deliveries → CustomerDeliveries.tsx
│    │    │
│    │    ├─── Active Deliveries List
│    │    │    └─── DeliveryCard
│    │    │         ├─── Progress Stepper
│    │    │         │    ├─── Pending
│    │    │         │    ├─── Assigned
│    │    │         │    ├─── In Transit
│    │    │         │    └─── Delivered
│    │    │         ├─── Map (driver location)
│    │    │         ├─── Driver Info
│    │    │         │    ├─── Name
│    │    │         │    ├─── Rating
│    │    │         │    └─── Contact Buttons
│    │    │         └─── ETA Countdown
│    │    │
│    │    └─── Delivery History
│    │         └─── PastDeliveryCard
│    │              ├─── Order Details
│    │              ├─── POD Thumbnail
│    │              └─── Reorder Button
│    │
│    └─── Other Pages...
│
└─── Footer
```

---

## 7. Data Flow: Vendor Dispatching via Shipday

```
┌─────────────────────────────────────────────────────────────────────┐
│  VENDOR ACTION: Click "Dispatch via Shipday" button                 │
│  Location: VendorDeliveries.tsx component                           │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: Open Dispatch Dialog                                       │
│  ─────────────────────────────                                        │
│  User fills form:                                                   │
│  • Provider: Shipday ▼                                              │
│  • Pickup Address: "My Store, Cape Town"                            │
│  • Delivery Address: "Customer Address"                             │
│  • Customer Name: "John Doe"                                        │
│  • Priority: Normal/Rush/Scheduled                                  │
│  • Special Instructions: "Gate code: 1234"                          │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 2: Submit Form                                                │
│  ───────────────────────                                            │
│  handlePostToProvider() called                                      │
│         │                                                           │
│         ▼                                                           │
│  Validate required fields:                                          │
│  • delivery_address present?                                        │
│  • customer_phone valid?                                            │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 3: Invoke Edge Function                                       │
│  ──────────────────────────────                                       │
│  supabase.functions.invoke("post-to-shipday", {                     │
│    body: {                                                          │
│      order_id: "order-uuid",                                        │
│      pickup_address: "...",                                         │
│      delivery_address: "...",                                       │
│      customer_name: "...",                                          │
│      customer_phone: "...",                                         │
│      order_items: [{name: "Product", qty: 1}],                      │
│      priority: "normal",                                            │
│      special_instructions: "..."                                    │
│    }                                                                │
│  })                                                                 │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 4: Edge Function Processing                                   │
│  ────────────────────────────────                                   │
│  post-to-shipday/index.ts receives request                          │
│         │                                                           │
│         ▼                                                           │
│  Validate input with Zod schema                                     │
│         │                                                           │
│         ▼                                                           │
│  Verify authentication (JWT token)                                  │
│         │                                                           │
│         ▼                                                           │
│  Check vendor permissions                                           │
│         │                                                           │
│         ▼                                                           │
│  Build Shipday API payload:                                         │
│  {                                                                  │
│    orderNumber: "order-uuid",                                       │
│    customerName: "John Doe",                                        │
│    customerAddress: "Customer Address",                             │
│    restaurantAddress: "Vendor Address",                             │
│    orderItem: [...],                                                │
│    deliveryInstruction: "Gate code: 1234"                           │
│  }                                                                  │
│         │                                                           │
│         ▼                                                           │
│  POST to Shipday API:                                               │
│  fetch('https://api.shipday.com/orders', {                          │
│    method: 'POST',                                                  │
│    headers: {                                                       │
│      'Authorization': 'Basic SHIPDAY_API_KEY'                       │
│    },                                                               │
│    body: JSON.stringify(payload)                                    │
│  })                                                                 │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 5: Shipday API Response                                       │
│  ────────────────────────────                                       │
│  Shipday creates order and returns:                                 │
│  {                                                                  │
│    orderId: "shipday-12345",                                        │
│    trackingLink: "https://track.shipday.com/12345",                 │
│    deliveryFee: 85.50,                                              │
│    distance: 12.5                                                   │
│  }                                                                  │
│         │                                                           │
│         ▼                                                           │
│  Calculate platform markup:                                         │
│  markedUpFee = 85.50 × 1.2 = R102.60                                │
│         │                                                           │
│         ▼                                                           │
│  Update database:                                                   │
│  UPDATE user_deliveries SET                                       │
│    shipday_order_id = "shipday-12345",                              │
│    shipday_status = "ACTIVE",                                       │
│    status = "pending",                                              │
│    delivery_fee = 102.60,                                           │
│    tracking_url = "https://..."                                     │
│  WHERE order_id = "order-uuid"                                      │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 6: Return Response to Client                                  │
│  ──────────────────────────────────                                 │
│  Edge function returns:                                             │
│  {                                                                  │
│    success: true,                                                   │
│    shipday_order_id: "shipday-12345",                               │
│    delivery_fee: 102.60,                                            │
│    delivery_fee_original: 85.50,                                    │
│    distance_km: 12.5,                                               │
│    tracking_url: "https://..."                                      │
│  }                                                                  │
│         │                                                           │
│         ▼                                                           │
│  Frontend displays toast:                                           │
│  "✅ Dispatched Successfully!"                                      │
│  "Fee: R102.60 (Original: R85.50)"                                  │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 7: Real-Time Updates Begin                                    │
│  ────────────────────────────────                                   │
│  Shipday webhook configured to send updates to:                     │
│  https://project.supabase.co/functions/v1/shipday-updates           │
│         │                                                           │
│         ▼                                                           │
│  When Shipday status changes:                                       │
│  1. Shipday sends webhook                                           │
│  2. shipday-updates function processes payload                      │
│  3. Updates user_deliveries table                                   │
│  4. Supabase Realtime notifies subscribers                          │
│  5. Vendor/Customer/Admin see live update                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

These diagrams provide a comprehensive visual understanding of the delivery management system architecture, data flows, and component interactions.

**Document Version:** 1.0  
**Created:** March 31, 2026  
**Purpose:** Technical documentation and onboarding
