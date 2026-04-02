#!/usr/bin/env node

/**
 * Generate TypeScript types from Supabase database
 * This ensures frontend types match the current database schema
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

async function generateTypes() {
  console.log('🔧 Generating TypeScript types from Supabase database...\n');
  
  try {
    // Check if supabase CLI is installed
    try {
      await execAsync('supabase --version');
      console.log('✅ Supabase CLI found');
    } catch (error) {
      console.error('❌ Supabase CLI not found. Installing...');
      await execAsync('npm install -g supabase');
      console.log('✅ Supabase CLI installed');
    }

    // Generate types using supabase gen command
    console.log('\n📝 Generating types...');
    
    const outputFile = path.join(process.cwd(), 'src', 'integrations', 'supabase', 'types.ts');
    const backupFile = path.join(process.cwd(), 'src', 'integrations', 'supabase', 'types.ts.backup');
    
    // Backup existing types
    if (fs.existsSync(outputFile)) {
      console.log('💾 Creating backup of existing types...');
      fs.copyFileSync(outputFile, backupFile);
      console.log(`   Backup saved to: ${backupFile}`);
    }

    // Use supabase db dump to get types
    console.log('\n🔄 Fetching latest schema from database...');
    
    const command = `npx supabase gen types typescript --project-id xlyxtbcqirspcfxdznyu > "${outputFile}"`;
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('NOTICE')) {
      console.warn('⚠️  Warnings during generation:', stderr);
    }

    console.log('\n✅ Types generated successfully!');
    console.log(`   Output: ${outputFile}`);
    
    // Verify the file was created and has content
    const stats = fs.statSync(outputFile);
    console.log(`   File size: ${(stats.size / 1024).toFixed(2)} KB`);
    
    // Check for key tables
    const content = fs.readFileSync(outputFile, 'utf-8');
    const requiredTables = [
      'delivery_service_providers',
      'delivery_drivers',
      'delivery_assignments',
      'delivery_zones',
      'delivery_pricing',
      'user_deliveries'
    ];
    
    console.log('\n📋 Verifying required tables...');
    let allFound = true;
    
    for (const table of requiredTables) {
      const found = content.includes(table);
      console.log(`   ${found ? '✅' : '❌'} ${table}`);
      if (!found) allFound = false;
    }
    
    if (allFound) {
      console.log('\n🎉 All required tables found in type definitions!');
      console.log('✨ Frontend types are now synchronized with database.');
    } else {
      console.log('\n⚠️  Some tables are missing from type definitions.');
      console.log('This might mean they don\'t exist in the database yet.');
      
      // Restore backup if critical tables are missing
      const criticalTables = ['user_deliveries'];
      const missingCritical = criticalTables.filter(t => !content.includes(t));
      
      if (missingCritical.length > 0) {
        console.log('\n❌ Critical tables missing! Restoring backup...');
        fs.copyFileSync(backupFile, outputFile);
        console.log('Backup restored. Please check database migrations.');
        return false;
      }
    }
    
    console.log('\n✓ Type generation complete!');
    return true;
    
  } catch (error: any) {
    console.error('\n❌ Error generating types:', error.message);
    
    if (error.message.includes('fetch failed')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('   1. Make sure you\'re logged in: npx supabase login');
      console.log('   2. Check your internet connection');
      console.log('   3. Verify project ID is correct: xlyxtbcqirspcfxdznyu');
    } else if (error.message.includes('ENOENT')) {
      console.log('\n💡 Supabase CLI not found. Run: npm install -g supabase');
    }
    
    return false;
  }
}

// Run the generator
generateTypes().then(success => {
  process.exit(success ? 0 : 1);
});
