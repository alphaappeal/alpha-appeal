import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('🔍 Checking if delivery tables exist in database...\n');
  
  const tablesToCheck = [
    'delivery_service_providers',
    'delivery_drivers',
    'delivery_assignments',
    'delivery_zones',
    'delivery_pricing'
  ];
  
  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase.from(table).select('id').limit(1);
      
      if (error) {
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.log(`❌ ${table} - DOES NOT EXIST`);
        } else if (error.message.includes('permission')) {
          console.log(`⚠️  ${table} - EXISTS (permission denied, but table exists)`);
        } else {
          console.log(`❌ ${table} - ERROR: ${error.message}`);
        }
      } else {
        console.log(`✅ ${table} - EXISTS`);
      }
    } catch (err: any) {
      console.log(`❌ ${table} - EXCEPTION: ${err.message}`);
    }
  }
  
  // Also check user_deliveries columns
  console.log('\n📋 Checking user_deliveries columns...');
  const { data: deliveries, error } = await supabase
    .from('user_deliveries')
    .select('delivery_service_provider,vendor_id,priority_score')
    .limit(1);
  
  if (error) {
    console.log(`❌ New columns missing: ${error.message}`);
  } else {
    console.log('✅ New columns exist in user_deliveries');
  }
}

checkTables().catch(console.error);
