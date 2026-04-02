import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://xlyxtbcqirspcfxdznyu.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhseXh0YmNxaXJzcGNmeGR6bnl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NDExOTcsImV4cCI6MjA4MjUxNzE5N30.QKzMw0HPafKI1xyT_oUrNoGICVnWkvXxQs_G1Y-SQmM';

// Create Supabase client with service role for admin access
const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Starting delivery management system migration...\n');
  
  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260331160000_comprehensive_delivery_management_FIXED.sql');
    const sqlContent = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log('✅ Migration file loaded:', migrationPath);
    console.log(`📊 File size: ${(sqlContent.length / 1024).toFixed(2)} KB\n`);
    
    // Split into individual statements (basic splitting by semicolon)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
    
    // Execute each statement
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const statementNum = i + 1;
      
      try {
        // Extract first few words for logging
        const preview = statement.split('\n')[0].substring(0, 60);
        console.log(`⚙️  [${statementNum}/${statements.length}] Executing: ${preview}...`);
        
        // Execute via Supabase RPC (using pg_cron or direct execution)
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Some errors are expected (e.g., IF NOT EXISTS on objects that already exist)
          if (error.message.includes('already exists') || error.message.includes('IF NOT EXISTS')) {
            console.log(`   ⚠️  Warning (expected): ${error.message}`);
          } else {
            console.error(`   ❌ Error: ${error.message}`);
            errorCount++;
          }
        } else {
          console.log(`   ✅ Success`);
          successCount++;
        }
        
        // Small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (err: any) {
        console.error(`   ❌ Exception: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📝 Total: ${statements.length}`);
    console.log('='.repeat(60));
    
    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!');
    } else {
      console.log(`\n⚠️  Migration completed with ${errorCount} error(s). Review the logs above.`);
    }
    
  } catch (err: any) {
    console.error('\n❌ Fatal error:', err.message);
    console.error('Stack trace:', err.stack);
    process.exit(1);
  }
}

// Run the migration
runMigration();
