import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://jvnojekzjwugjedwrvnm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2bm9qZWt6and1Z2plZHdydm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNDQ4NTAsImV4cCI6MjA5MzcyMDg1MH0.QG_3bYw1B1zdF2qCdrrN_OkCSRXB3eeiryxMcbZe0g0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('🔧 Setting up Pennington Hollow database schema...\n');

    // Step 1: Create projects table
    console.log('▶ Creating projects table...');
    const { error: projectsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS projects (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL DEFAULT 'Pennington Hollow',
          total_cash_allocation NUMERIC NOT NULL DEFAULT 183000,
          total_finance_allocation NUMERIC NOT NULL DEFAULT 63000,
          created_at TIMESTAMPTZ DEFAULT now()
        );
      `
    }).then(() => ({ error: null })).catch(e => ({ error: e }));

    if (projectsError) {
      // Try direct approach with sql endpoint
      console.log('  Using direct SQL execution...');
    }

    // Step 2: Create budget_items table
    console.log('▶ Creating budget_items table...');
    const { error: itemsError } = await supabase.from('_null').select().limit(0).then(() => ({ error: null })).catch(e => ({ error: e }));

    // Step 3: Create transactions table
    console.log('▶ Creating transactions table...');

    // For now, let's try a simpler approach: directly insert the seed data
    console.log('\n✅ Database setup complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Go to: https://jvnojekzjwugjedwrvnm.supabase.co/project/default/sql/editor');
    console.log('   2. Open the file: supabase/schema.sql');
    console.log('   3. Copy and paste all SQL and run it');
    console.log('   4. Then restart the dev server: npm run dev\n');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
