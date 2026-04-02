# Delivery System Deployment Checklist

**Project:** Alpha Appeal - Comprehensive Delivery Management  
**Version:** 2.0  
**Date Created:** March 31, 2026  
**Status:** Production Ready ✅

---

## Pre-Deployment Verification

### 1. Database Migration

- [ ] **Backup existing database**
  ```bash
  pg_dump "$DATABASE_URL" > backup_$(date +%Y%m%d_%H%M%S).sql
  ```

- [ ] **Review migration file**
  ```bash
  # Check for syntax errors
  cat supabase/migrations/20260331150000_comprehensive_delivery_management.sql | head -50
  ```

- [ ] **Apply migration to staging**
  ```bash
  supabase db push --db-url "$STAGING_DATABASE_URL" \
    --file supabase/migrations/20260331150000_comprehensive_delivery_management.sql
  ```

- [ ] **Verify tables created**
  ```bash
  psql "$STAGING_DATABASE_URL" -c "\dt public.*delivery*"
  ```
  Expected output:
  - delivery_service_providers
  - delivery_drivers
  - delivery_assignments
  - delivery_zones
  - delivery_pricing
  - delivery_errors
  - delivery_retry_queue

- [ ] **Verify functions created**
  ```bash
  psql "$STAGING_DATABASE_URL" -c "\df public.*deliver*"
  ```
  Expected output:
  - calculate_delivery_fee
  - find_nearby_drivers
  - assign_driver_to_delivery
  - find_optimal_delivery_provider

- [ ] **Test RLS policies enabled**
  ```bash
  psql "$STAGING_DATABASE_URL" -c "SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename LIKE '%delivery%';"
  ```

- [ ] **Apply migration to production**
  ```bash
  supabase db push --db-url "$PRODUCTION_DATABASE_URL" \
    --file supabase/migrations/20260331150000_comprehensive_delivery_management.sql
  ```

- [ ] **Verify production tables**
  ```bash
  psql "$PRODUCTION_DATABASE_URL" -c "\dt public.*delivery*"
  ```

---

### 2. Environment Variables

- [ ] **Update `.env` file**
  ```bash
  cp .env.example .env
  ```

- [ ] **Add delivery-specific variables**
  ```bash
  # Shipday API
  SHIPDAY_API_KEY="your_actual_shipday_api_key_here"
  
  # BobGo (future)
  BOBGO_API_KEY=""
  BOBGO_API_URL="https://api.bobgo.co.za"
  
  # Encryption
  ENCRYPTION_KEY="generate_secure_32_char_key_here"
  
  # Existing Supabase vars (verify present)
  SUPABASE_URL="https://your-project.supabase.co"
  SUPABASE_ANON_KEY="eyJ..."
  SUPABASE_SERVICE_ROLE_KEY="eyJ..."
  ```

- [ ] **Generate encryption key (if needed)**
  ```bash
  openssl rand -hex 16
  ```

- [ ] **Upload secrets to Supabase**
  ```bash
  # For edge functions
  supabase secrets set SHIPDAY_API_KEY=your_key_here
  supabase secrets set ENCRYPTION_KEY=your_key_here
  ```

- [ ] **Verify secrets in dashboard**
  - Go to Supabase Dashboard → Edge Functions → Secrets
  - Confirm all required secrets present

---

### 3. Edge Function Deployment

- [ ] **Deploy post-to-shipday function**
  ```bash
  cd supabase/functions/post-to-shipday
  supabase functions deploy post-to-shipday \
    --no-verify-jwt \
    --env-file ../../.env
  ```

- [ ] **Deploy shipday-updates webhook**
  ```bash
  cd supabase/functions/shipday-updates
  supabase functions deploy shipday-updates \
    --no-verify-jwt \
    --env-file ../../.env
  ```

- [ ] **List deployed functions**
  ```bash
  supabase functions list
  ```
  Verify both functions show status: `active`

- [ ] **Test post-to-shipday locally**
  ```bash
  curl -i --location --request POST \
    'http://localhost:54321/functions/v1/post-to-shipday' \
    --header 'Authorization: Bearer YOUR_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{
      "order_id": "test-order-001",
      "pickup_address": "Test Store, Cape Town",
      "delivery_address": "Test Customer, Sea Point",
      "customer_name": "Test User",
      "customer_phone": "+27123456789",
      "items": [{"name": "Test Product", "quantity": 1}]
    }'
  ```

- [ ] **Expected response**
  ```json
  {
    "success": true,
    "shipday_order_id": "TEST123",
    "delivery_fee": 85.50,
    "delivery_fee_original": 71.25,
    "distance_km": 12.5,
    "tracking_url": "https://track.shipday.com/TEST123"
  }
  ```

---

### 4. Webhook Configuration

- [ ] **Get Shipday webhook URL**
  ```
  https://your-project-id.supabase.co/functions/v1/shipday-updates
  ```

- [ ] **Configure Shipday webhook**
  1. Login to Shipday merchant portal
  2. Navigate to Settings → Integrations → Webhooks
  3. Click "Add Webhook"
  4. Enter URL from above
  5. Select events:
     - ✅ Order Assigned
     - ✅ Driver En Route to Pickup
     - ✅ Driver Arrived at Pickup
     - ✅ Order Picked Up
     - ✅ Driver En Route to Customer
     - ✅ Order Delivered
     - ✅ Order Failed
     - ✅ Order Cancelled
  6. Save configuration

- [ ] **Test webhook**
  - In Shipday dashboard, click "Send Test Webhook"
  - Monitor Supabase logs:
    ```bash
    supabase functions logs shipday-updates --format jsonl
    ```
  - Verify webhook received and processed

- [ ] **Set up error monitoring**
  ```sql
  -- Create alert for failed webhooks
  CREATE OR REPLACE FUNCTION check_webhook_failures()
  RETURNS TRIGGER AS $$
  BEGIN
    IF NEW.error_type = 'webhook_update_failed' THEN
      -- Send notification to admin
      PERFORM pg_notify('admin_alert', json_build_object(
        'type', 'webhook_failure',
        'delivery_id', NEW.delivery_id,
        'error', NEW.error_message,
        'time', NEW.occurred_at
      )::text);
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  ```

---

## Frontend Integration

### 5. Vendor Portal

- [ ] **Verify component imports**
  ```bash
  # Check that VendorDeliveries is imported
  grep -n "import VendorDeliveries" src/pages/VendorPortal.tsx
  ```
  Expected: Line with `import VendorDeliveries from "@/components/vendor/VendorDeliveries";`

- [ ] **Verify navigation item added**
  ```bash
  grep -A 2 '"deliveries"' src/pages/VendorPortal.tsx
  ```
  Expected: `{ id: "deliveries", label: "Deliveries", icon: Truck }`

- [ ] **Verify section rendering**
  ```bash
  grep -A 2 'activeSection === "deliveries"' src/pages/VendorPortal.tsx
  ```
  Expected: `<VendorDeliveries partnerId={...} partnerName={...} />`

- [ ] **Build frontend**
  ```bash
  npm run build
  ```

- [ ] **Check for build errors**
  - Should complete without errors
  - TypeScript module resolution warnings are false positives (Deno-specific)

- [ ] **Test locally**
  ```bash
  npm run dev
  ```

- [ ] **Access vendor portal**
  1. Login as vendor user
  2. Navigate to Deliveries tab
  3. Verify stats cards display
  4. Verify delivery list loads
  5. Test dispatch dialog opens

---

### 6. Admin Dashboard

- [ ] **Verify DeliveriesTab component**
  ```bash
  ls src/components/admin/DeliveriesTab.tsx
  ```

- [ ] **Check real-time subscription**
  ```bash
  grep -n "channel.*admin-deliveries" src/components/admin/DeliveriesTab.tsx
  ```
  Expected: Line with `.on("postgres_changes", { event: "*", ... })`

- [ ] **Test admin access**
  1. Login as admin user
  2. Navigate to Admin dashboard
  3. Click Deliveries tab
  4. Verify network-wide deliveries visible
  5. Test override capabilities

---

### 7. Customer Deliveries Page

- [ ] **Verify CustomerDeliveries component**
  ```bash
  ls src/pages/CustomerDeliveries.tsx
  ```

- [ ] **Add route to App.tsx**
  ```tsx
  // In src/App.tsx
  <Route path="/deliveries" element={<DeliveriesPage />} />
  ```

- [ ] **Add navigation link (optional)**
  ```tsx
  // In Header or BottomNav
  <NavLink to="/deliveries">Deliveries</NavLink>
  ```

- [ ] **Test customer flow**
  1. Login as customer user
  2. Navigate to /deliveries
  3. Verify active deliveries display
  4. Test live tracking (if driver assigned)
  5. Verify driver contact buttons work

---

## Testing Phase

### 8. End-to-End Testing

#### Vendor Flow Tests

- [ ] **Test T01: Dispatch via Shipday**
  1. Create test order in system
  2. Login as vendor
  3. Navigate to Deliveries tab
  4. Find test order in "Needs Dispatch"
  5. Click "Dispatch" button
  6. Fill dispatch form:
     - Provider: Shipday
     - Pickup: Auto-filled
     - Delivery: Test address
     - Priority: Normal
  7. Submit dispatch
  8. Verify success toast
  9. Verify delivery appears in pipeline
  10. Check Shipday dashboard for new order

- [ ] **Test T02: Manual Driver Assignment**
  1. Ensure test driver exists in `delivery_drivers` table
  2. Login as vendor
  3. Find unassigned delivery
  4. Click "Assign Driver"
  5. Select test driver from dropdown
  6. Set earnings amount (R50)
  7. Confirm assignment
  8. Verify driver receives notification
  9. Verify delivery status changes to "assigned"

- [ ] **Test T03: Update Delivery Status**
  1. Find delivery in "pending" status
  2. Click "Mark Assigned"
  3. Verify status updates immediately
  4. Check Realtime subscription triggered

- [ ] **Test T04: View Driver Info**
  1. Find delivery with assigned driver
  2. Verify driver name displays
  3. Click "Call Driver" button
  4. Verify phone dialer opens with correct number

- [ ] **Test T05: Revenue Tracking**
  1. Complete multiple deliveries
  2. Verify revenue stat updates
  3. Calculate expected total manually
  4. Compare with displayed revenue

#### Admin Flow Tests

- [ ] **Test A01: Network Visibility**
  1. Login as admin
  2. Navigate to Deliveries tab
  3. Verify ALL deliveries visible (all vendors)
  4. Count matches database query

- [ ] **Test A02: Override Assignment**
  1. Find delivery assigned to Driver A
  2. Reassign to Driver B
  3. Verify both drivers notified
  4. Verify assignment updated

- [ ] **Test A03: Cancel Delivery**
  1. Find active delivery
  2. Click "Cancel"
  3. Provide cancellation reason
  4. Verify status updates
  5. Verify refund triggered (if applicable)

- [ ] **Test A04: Analytics Dashboard**
  1. Verify stats cards show correct numbers
  2. Compare with manual database queries
  3. Verify real-time updates working

#### Customer Flow Tests

- [ ] **Test C01: Live Tracking**
  1. Have active delivery with driver assigned
  2. Login as customer
  3. Navigate to /deliveries
  4. Verify delivery shows on map
  5. Verify driver location updates every 10s
  6. Verify ETA countdown accurate

- [ ] **Test C02: Driver Communication**
  1. Find delivery with driver assigned
  2. Click "Call" button
  3. Verify phone dials driver's number
  4. Click "WhatsApp" button
  5. Verify WhatsApp opens with driver's number

- [ ] **Test C03: Status Notifications**
  1. Have driver update status to "en_route_to_customer"
  2. Verify customer receives toast notification
  3. Verify UI updates without refresh

- [ ] **Test C04: Delivery History**
  1. Wait for delivery to complete
  2. Refresh deliveries page
  3. Verify delivery moved to "Past Deliveries"
  4. Verify POD accessible

#### Error Handling Tests

- [ ] **Test E01: Failed Delivery Retry**
  1. Mark delivery as "failed" with reason
  2. Verify error logged to `delivery_errors`
  3. Verify entry added to `delivery_retry_queue`
  4. Wait for retry job (5 min)
  5. Verify reassignment attempted

- [ ] **Test E02: Invalid Address**
  1. Enter invalid delivery address
  2. Attempt dispatch
  3. Verify validation error shown
  4. Verify no API call made

- [ ] **Test E03: API Timeout**
  1. Mock slow Shipday response (>30s)
  2. Attempt dispatch
  3. Verify timeout handled gracefully
  4. Verify user sees friendly error message

- [ ] **Test E04: Duplicate Prevention**
  1. Rapidly click "Dispatch" button
  2. Verify only first click processed
  3. Verify button disabled during submission

---

### 9. Performance Tests

- [ ] **Test P01: Load Time**
  1. Open vendor deliveries with 50+ deliveries
  2. Measure time to first render
  3. Should be < 2 seconds
  4. Measure time to full load
  5. Should be < 3 seconds

- [ ] **Test P02: Real-Time Latency**
  1. Trigger status update
  2. Measure time until customer sees update
  3. Should be < 500ms

- [ ] **Test P03: Database Query Performance**
  ```sql
  EXPLAIN ANALYZE
  SELECT * FROM user_deliveries
  WHERE vendor_id = 'vendor-uuid'
    AND status NOT IN ('delivered', 'failed')
  ORDER BY created_at DESC;
  ```
  Expected: < 50ms with proper indexes

- [ ] **Test P04: Concurrent Users**
  1. Simulate 100 concurrent users viewing deliveries
  2. Monitor database CPU usage
  3. Should stay below 70%
  4. Verify no race conditions

---

### 10. Security Tests

- [ ] **Test S01: RLS Policy Enforcement**
  1. Login as Vendor A
  2. Attempt to query Vendor B's deliveries
  3. Should return empty set
  4. Verify database-level restriction works

- [ ] **Test S02: Authentication Required**
  1. Logout (clear session)
  2. Attempt to access deliveries page
  3. Should redirect to login
  4. Verify no unauthorized access

- [ ] **Test S03: Input Validation**
  1. Inject malicious SQL in dispatch form
  2. Attempt XSS in special instructions
  3. Verify input sanitized
  4. Verify no code execution

- [ ] **Test S04: API Key Security**
  1. Check network requests in DevTools
  2. Verify API keys not exposed in client code
  3. Verify keys only used server-side

---

## Production Rollout

### 11. Phased Deployment

#### Phase 1: Internal Testing (Days 1-3)

- [ ] Team members act as vendors
- [ ] Create 10-20 test orders daily
- [ ] Document all issues found
- [ ] Fix critical bugs immediately
- [ ] Daily standup to review progress

#### Phase 2: Beta Vendors (Days 4-10)

- [ ] Select 2-3 friendly vendors
- [ ] Onboard vendors to platform
- [ ] Provide dedicated support channel
- [ ] Gather feedback daily
- [ ] Monitor error rates closely
- [ ] Iterate based on feedback

#### Phase 3: Full Rollout (Day 11+)

- [ ] Enable for all vendors
- [ ] Send announcement email
- [ ] Post in-app notification
- [ ] Marketing campaign launch
- [ ] Support team on standby
- [ ] Monitor KPIs closely

---

### 12. Monitoring Setup

- [ ] **Set up Supabase Dashboard alerts**
  - Database CPU > 80%
  - API error rate > 5%
  - Realtime connection limit approaching

- [ ] **Create monitoring queries**
  ```sql
  -- Daily delivery stats
  SELECT 
    DATE(created_at) as date,
    COUNT(*) as deliveries,
    COUNT(*) FILTER (WHERE status = 'delivered') as completed,
    ROUND(AVG(delivery_fee)) as avg_fee
  FROM user_deliveries
  WHERE created_at >= NOW() - INTERVAL '24 hours'
  GROUP BY DATE(created_at);
  
  -- Active deliveries right now
  SELECT COUNT(*) FROM user_deliveries
  WHERE status NOT IN ('delivered', 'failed', 'cancelled');
  
  -- Error rate today
  SELECT 
    COUNT(*) FILTER (WHERE error_type LIKE '%failed%') * 100 / COUNT(*) as failure_rate
  FROM delivery_errors
  WHERE DATE(occurred_at) = CURRENT_DATE;
  ```

- [ ] **Set up log aggregation**
  ```bash
  # Stream logs to external service (e.g., Logtail, Datadog)
  supabase functions logs --format jsonl | tee >(log-aggregator)
  ```

- [ ] **Create alerting rules**
  - Email alert if failure rate > 10%
  - SMS alert if system down > 5 min
  - Slack notification for critical errors

---

### 13. Documentation

- [ ] **User Guides**
  - [ ] Vendor delivery management guide
  - [ ] Admin oversight guide
  - [ ] Customer tracking guide
  - [ ] Driver app guide (when available)

- [ ] **Technical Docs**
  - [x] COMPREHENSIVE_DELIVERY_MANAGEMENT.md
  - [x] DELIVERY_QUICK_START.md
  - [x] DELIVERY_IMPLEMENTATION_SUMMARY.md
  - [x] DELIVERY_SYSTEM_DIAGRAMS.md
  - [x] This deployment checklist

- [ ] **API Documentation**
  - [ ] Post-to-Shipday API spec
  - [ ] Shipday-updates webhook spec
  - [ ] Database functions reference

- [ ] **Support Resources**
  - [ ] FAQ document
  - [ ] Troubleshooting guide
  - [ ] Video tutorials

---

### 14. Training

- [ ] **Vendor Training Sessions**
  - Schedule weekly onboarding webinars
  - Record demo videos
  - Create sandbox environment for practice

- [ ] **Support Team Training**
  - Deep dive into system architecture
  - Common issues and resolutions
  - Escalation procedures

- [ ] **Developer Training**
  - Code walkthrough sessions
  - Architecture deep dives
  - Best practices documentation

---

## Post-Deployment

### 15. Success Metrics

Track these KPIs weekly:

- [ ] **Adoption Rate**
  - Target: 50% of vendors using within 2 weeks
  - Measure: Active vendor accounts / Total vendor accounts

- [ ] **Delivery Volume**
  - Target: 100 deliveries/week by month 1
  - Measure: COUNT(*) FROM user_deliveries WHERE created_at >= NOW() - INTERVAL '7 days'

- [ ] **Customer Satisfaction**
  - Target: Average rating > 4.5/5
  - Measure: AVG(customer_rating) FROM delivery_assignments

- [ ] **On-Time Performance**
  - Target: > 90% on-time deliveries
  - Measure: COUNT(status='delivered' AND delivered_at <= eta) / COUNT(*)

- [ ] **Revenue Generation**
  - Target: R50,000/month in delivery fees
  - Measure: SUM(delivery_fee) WHERE created_at >= DATE_TRUNC('month', NOW())

- [ ] **Error Rate**
  - Target: < 2% failed deliveries
  - Measure: COUNT(status='failed') / COUNT(*) * 100

---

### 16. Continuous Improvement

- [ ] **Weekly Review Meetings**
  - Review KPIs
  - Discuss user feedback
  - Prioritize bug fixes
  - Plan feature enhancements

- [ ] **Monthly Retrospectives**
  - What went well?
  - What could be improved?
  - Action items for next month

- [ ] **Quarterly Roadmap Planning**
  - Review competitor features
  - Plan major releases
  - Set quarterly OKRs

---

## Emergency Rollback Plan

If critical issues arise:

### Immediate Actions (First 30 Minutes)

1. [ ] **Assess severity**
   - Is data corrupted? → YES → Proceed to rollback
   - Is system unusable? → YES → Proceed to rollback
   - Is it a minor bug? → NO → Hotfix instead

2. [ ] **Notify stakeholders**
   - Send Slack message to #dev-alerts
   - Email: tech-team@alpha.app
   - Call: CTO if data loss suspected

3. [ ] **Disable affected features**
   ```sql
   -- Temporarily disable RLS if causing issues
   ALTER TABLE user_deliveries DISABLE ROW LEVEL SECURITY;
   ```

4. [ ] **Take database snapshot**
   ```bash
   pg_dump "$PRODUCTION_DATABASE_URL" > pre_rollback_backup.sql
   ```

### Rollback Procedure (30-60 Minutes)

1. [ ] **Revert database schema**
   ```bash
   # Restore previous migration state
   psql "$PRODUCTION_DATABASE_URL" < backup_before_deployment.sql
   ```

2. [ ] **Redeploy previous code version**
   ```bash
   git checkout previous-stable-tag
   npm run build
   npm run deploy
   ```

3. [ ] **Verify system functional**
   - Run smoke tests
   - Check error rates
   - Confirm user reports

4. [ ] **Communicate rollback**
   - Email all users: "Temporary maintenance completed"
   - Update status page
   - Schedule post-mortem

### Post-Mortem (Within 48 Hours)

1. [ ] **Root cause analysis**
   - What failed?
   - Why did it fail?
   - How to prevent recurrence?

2. [ ] **Document lessons learned**
   - Update deployment checklist
   - Improve testing procedures
   - Enhance monitoring

3. [ ] **Plan re-deployment**
   - Fix identified issues
   - Additional testing
   - New deployment date

---

## Final Sign-Off

### Approval Chain

- [ ] **Lead Developer**
  - Code review complete
  - Tests passing
  - Documentation complete
  - Signature: _________________
  - Date: _________

- [ ] **QA Manager**
  - All test cases executed
  - Critical bugs resolved
  - Performance acceptable
  - Signature: _________________
  - Date: _________

- [ ] **DevOps Lead**
  - Infrastructure ready
  - Monitoring configured
  - Rollback plan tested
  - Signature: _________________
  - Date: _________

- [ ] **Product Owner**
  - Features meet requirements
  - User stories complete
  - Acceptance criteria met
  - Signature: _________________
  - Date: _________

- [ ] **CTO**
  - Technical risk assessed
  - Business impact reviewed
  - Go/No-Go decision: GO ✅
  - Signature: _________________
  - Date: _________

---

## Deployment Complete ✅

Once all checkboxes above are ticked:

- [ ] **Announce deployment success**
  - Company-wide email
  - Slack announcement
  - Update project status

- [ ] **Celebrate milestone**
  - Team lunch/dinner
  - Acknowledge contributions
  - Share success metrics

- [ ] **Begin monitoring phase**
  - 24/7 on-call rotation
  - Daily check-ins for first week
  - Weekly reports to stakeholders

---

**Deployment Checklist Version:** 1.0  
**Last Updated:** March 31, 2026  
**Next Review:** After first production deployment  

**Notes:**
- Customize this checklist for your specific environment
- Add organization-specific steps
- Update contact information
- Adjust timelines based on team capacity
