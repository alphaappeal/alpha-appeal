import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAnonAccess() {
  console.log('🔍 Testing anon user access to delivery tables...\n');
  
  const tests = [
    {
      table: 'delivery_service_providers',
      columns: 'name,display_name,is_active',
      filter: 'is_active'
    },
    {
      table: 'delivery_drivers',
      columns: 'id,name,vehicle_type,is_available',
      filter: undefined
    },
    {
      table: 'delivery_assignments',
      columns: 'id,delivery_id,driver_id,status',
      filter: undefined
    },
    {
      table: 'delivery_zones',
      columns: 'id,name,is_active',
      filter: 'is_active'
    },
    {
      table: 'delivery_pricing',
      columns: 'id,base_fee,per_km_fee,is_active',
      filter: 'is_active'
    }
  ];
  
  for (const test of tests) {
    try {
      const query = supabase.from(test.table).select(test.columns);
      
      if (test.filter) {
        query.eq(test.filter, true);
      }
      
      const { data, error } = await query.limit(1);
      
      if (error) {
        console.log(`❌ ${test.table}`);
        console.log(`   Error: ${error.message}`);
        
        if (error.message.includes('permission denied')) {
          console.log('   ⚠️  RLS policy may be blocking access');
        } else if (error.message.includes('relation does not exist')) {
          console.log('   ❌ Table does not exist!');
        }
      } else {
        console.log(`✅ ${test.table} - ACCESSIBLE`);
        if (data && data.length > 0) {
          console.log(`   Sample: ${JSON.stringify(data[0])}`);
        } else {
          console.log(`   (table is empty)`);
        }
      }
    } catch (err: any) {
      console.log(`❌ ${test.table} - EXCEPTION`);
      console.log(`   ${err.message}`);
    }
  }
  
  console.log('\n📊 Summary:');
  console.log('If all tables show ✅ ACCESSIBLE, then permissions are working.');
  console.log('If types still fail to generate, it\'s a Supabase CLI issue.');
}

testAnonAccess().catch(console.error);
