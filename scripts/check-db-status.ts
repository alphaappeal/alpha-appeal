import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

console.log('🔧 Connecting to Supabase database...');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey.substring(0, 20)}...\n`);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('📡 Testing database connection...\n');
  
  try {
    // Try to query an existing table to verify connection
    const { data, error } = await supabase.from('alpha_partners').select('id').limit(1);
    
    if (error) {
      if (error.message.includes('JWT') || error.message.includes('permission denied')) {
        console.log('⚠️  Connection successful but permission limited with anon key.');
        console.log('   For full admin access, you need the service_role key.\n');
        console.log('   Current permissions:');
        console.log('   ✅ Can read public tables');
        console.log('   ❌ Cannot create/alter tables (requires service role)\n');
        return false;
      }
      throw error;
    }
    
    console.log('✅ Database connection successful!\n');
    return true;
  } catch (err: any) {
    console.error('❌ Connection failed:', err.message);
    return false;
  }
}

async function checkExistingTables() {
  console.log('📋 Checking existing delivery-related tables...\n');
  
  const tablesToCheck = [
    'delivery_service_providers',
    'delivery_drivers', 
    'delivery_assignments',
    'delivery_zones',
    'delivery_pricing',
    'user_deliveries'
  ];
  
  for (const table of tablesToCheck) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`   ❌ ${table}: Does not exist`);
      } else {
        console.log(`   ✅ ${table}: Exists (${count} rows)`);
      }
    } catch (err: any) {
      console.log(`   ❌ ${table}: Error - ${err.message}`);
    }
  }
  
  console.log('\n');
}

async function main() {
  console.log('='.repeat(60));
  console.log('🚀 Supabase Database Migration Tool');
  console.log('='.repeat(60));
  console.log('');
  
  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.log('\n⚠️  Continuing with limited permissions...\n');
  }
  
  // Check existing tables
  await checkExistingTables();
  
  console.log('📝 To apply the migration, you have these options:\n');
  console.log('Option 1: Use Supabase Dashboard SQL Editor');
  console.log('   1. Go to https://xlyxtbcqirspcfxdznyu.supabase.co');
  console.log('   2. Navigate to SQL Editor');
  console.log('   3. Copy and paste the content from:');
  console.log('      supabase/migrations/20260331160000_comprehensive_delivery_management_FIXED.sql');
  console.log('   4. Click "Run"\n');
  
  console.log('Option 2: Use psql (PostgreSQL CLI)');
  console.log('   1. Install PostgreSQL client if not already installed');
  console.log('   2. Get your database connection string from Supabase Dashboard');
  console.log('   3. Run: psql <connection_string> -f supabase/migrations/20260331160000_comprehensive_delivery_management_FIXED.sql\n');
  
  console.log('Option 3: Use Supabase CLI (Recommended)');
  console.log('   1. Run: supabase login');
  console.log('   2. Run: supabase link --project-ref xlyxtbcqirspcfxdznyu');
  console.log('   3. Run: supabase db push\n');
  
  console.log('='.repeat(60));
  console.log('💡 Note: The anon key has limited permissions.');
  console.log('   For creating tables, you need either:');
  console.log('   - Service role key (admin access)');
  console.log('   - Direct database connection via psql');
  console.log('   - Supabase Dashboard SQL Editor');
  console.log('='.repeat(60));
}

main().catch(console.error);
