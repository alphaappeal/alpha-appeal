import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigration() {
  console.log('🔍 Verifying delivery management system migration...\n');
  
  const checks = [];
  
  // Check 1: Verify delivery_service_providers table has correct columns
  try {
    const { data: providers, error } = await supabase
      .from('delivery_service_providers')
      .select('name, display_name, is_active, is_default');
    
    if (error) throw error;
    
    console.log('✅ delivery_service_providers table');
    if (providers && providers.length > 0) {
      console.log(`   Found ${providers.length} providers:`);
      providers.forEach(p => {
        console.log(`   - ${p.name} (${p.display_name}) ${p.is_active ? '✅' : '❌'}`);
      });
    }
    checks.push(true);
  } catch (err: any) {
    console.log('❌ delivery_service_providers check failed:', err.message);
    checks.push(false);
  }
  
  console.log('');
  
  // Check 2: Verify delivery_drivers table exists with correct structure
  try {
    const { data: drivers, error } = await supabase
      .from('delivery_drivers')
      .select('id, user_id, vendor_id, is_available, rating')
      .limit(1);
    
    if (error && !error.message.includes('permission')) throw error;
    
    console.log('✅ delivery_drivers table exists');
    checks.push(true);
  } catch (err: any) {
    console.log('❌ delivery_drivers check failed:', err.message);
    checks.push(false);
  }
  
  // Check 3: Verify delivery_assignments table
  try {
    const { error } = await supabase
      .from('delivery_assignments')
      .select('id, delivery_id, driver_id, status')
      .limit(1);
    
    if (error && !error.message.includes('permission')) throw error;
    
    console.log('✅ delivery_assignments table exists');
    checks.push(true);
  } catch (err: any) {
    console.log('❌ delivery_assignments check failed:', err.message);
    checks.push(false);
  }
  
  // Check 4: Verify delivery_pricing table
  try {
    const { data: pricing, error } = await supabase
      .from('delivery_pricing')
      .select('base_fee, per_km_fee, platform_markup_percent')
      .limit(1);
    
    if (error && !error.message.includes('permission')) throw error;
    
    console.log('✅ delivery_pricing table exists');
    if (pricing && pricing.length > 0) {
      console.log(`   Sample pricing: Base R${pricing[0].base_fee}, R${pricing[0].per_km_fee}/km`);
    }
    checks.push(true);
  } catch (err: any) {
    console.log('❌ delivery_pricing check failed:', err.message);
    checks.push(false);
  }
  
  // Check 5: Verify delivery_zones table with JSONB polygon field
  try {
    const { error } = await supabase
      .from('delivery_zones')
      .select('id, name, polygon')
      .limit(1);
    
    if (error && !error.message.includes('permission')) throw error;
    
    console.log('✅ delivery_zones table exists (with JSONB polygon field)');
    checks.push(true);
  } catch (err: any) {
    console.log('❌ delivery_zones check failed:', err.message);
    checks.push(false);
  }
  
  // Check 6: Verify user_deliveries has new columns
  try {
    const { data: delivery, error } = await supabase
      .from('user_deliveries')
      .select('delivery_service_provider, vendor_id, priority_score')
      .limit(1);
    
    // This might fail if columns don't exist, which is expected on old schema
    if (error) {
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('⚠️  user_deliveries missing new columns (needs migration update)');
        checks.push(false);
      } else if (!error.message.includes('permission')) {
        throw error;
      } else {
        console.log('✅ user_deliveries table exists (new columns may need verification)');
        checks.push(true);
      }
    } else {
      console.log('✅ user_deliveries table has new columns');
      checks.push(true);
    }
  } catch (err: any) {
    console.log('❌ user_deliveries check failed:', err.message);
    checks.push(false);
  }
  
  // Check 7: Verify database functions exist
  try {
    const { data: funcCheck, error } = await supabase.rpc('calculate_delivery_fee', {
      _vendor_id: '00000000-0000-0000-0000-000000000000',
      _pickup_lat: 0,
      _pickup_lng: 0,
      _dropoff_lat: 0,
      _dropoff_lng: 0,
      _distance_km: 5,
    });
    
    if (error && error.message.includes('function')) {
      console.log('❌ calculate_delivery_fee function does NOT exist');
      checks.push(false);
    } else if (error && !error.message.includes('permission')) {
      console.log('⚠️  calculate_delivery_fee function exists (permission test)');
      checks.push(true);
    } else {
      console.log('✅ calculate_delivery_fee function exists');
      checks.push(true);
    }
  } catch (err: any) {
    console.log('❌ calculate_delivery_fee check failed:', err.message);
    checks.push(false);
  }
  
  // Check 8: Verify assign_driver_to_delivery function
  try {
    const { error } = await supabase.rpc('assign_driver_to_delivery', {
      _delivery_id: '00000000-0000-0000-0000-000000000000',
      _driver_id: '00000000-0000-0000-0000-000000000000',
      _assigned_by: '00000000-0000-0000-0000-000000000000',
    });
    
    if (error && error.message.includes('function')) {
      console.log('❌ assign_driver_to_delivery function does NOT exist');
      checks.push(false);
    } else if (error && !error.message.includes('permission')) {
      console.log('⚠️  assign_driver_to_delivery function exists (permission test)');
      checks.push(true);
    } else {
      console.log('✅ assign_driver_to_delivery function exists');
      checks.push(true);
    }
  } catch (err: any) {
    console.log('❌ assign_driver_to_delivery check failed:', err.message);
    checks.push(false);
  }
  
  console.log('\n' + '='.repeat(60));
  const passedChecks = checks.filter(c => c).length;
  const totalChecks = checks.length;
  
  console.log(`📊 Migration Verification Results: ${passedChecks}/${totalChecks} checks passed`);
  
  if (passedChecks === totalChecks) {
    console.log('\n🎉 SUCCESS! All migration components are in place.');
    console.log('The delivery management system is ready to use!\n');
  } else if (passedChecks >= totalChecks - 2) {
    console.log('\n✅ MOSTLY COMPLETE. Minor issues detected but core functionality should work.');
    console.log('Recommendation: Review failed checks above.\n');
  } else {
    console.log('\n⚠️  INCOMPLETE. Some migration components are missing.');
    console.log('Recommendation: Apply the full migration via Supabase Dashboard.\n');
  }
  
  console.log('='.repeat(60));
}

verifyMigration().catch(console.error);
