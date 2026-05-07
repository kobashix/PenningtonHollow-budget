#!/usr/bin/env node

import fs from 'fs';

const SUPABASE_URL = 'https://jvnojekzjwugjedwrvnm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2bm9qZWt6and1Z2plZHdydm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNDQ4NTAsImV4cCI6MjA5MzcyMDg1MH0.QG_3bYw1B1zdF2qCdrrN_OkCSRXB3eeiryxMcbZe0g0';

// Read the schema file
const schemaPath = './supabase/schema.sql';
const sql = fs.readFileSync(schemaPath, 'utf-8');

// Split into individual statements (basic parsing)
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--'));

console.log(`🔧 Executing ${statements.length} SQL statements...\n`);

async function executeSql() {
  let executed = 0;
  let failed = 0;

  for (const statement of statements) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ sql: statement + ';' }),
      });

      if (response.ok) {
        executed++;
        console.log(`✓ Executed statement ${executed}`);
      } else if (response.status === 404) {
        // exec_sql function doesn't exist, fall back to message
        console.log('⚠️  Cannot execute SQL directly via API');
        throw new Error('exec_sql RPC function not found');
      }
    } catch (error) {
      failed++;
      if (failed === 1) {
        console.log('\n❌ Direct SQL execution not available\n');
        console.log('📋 MANUAL SETUP (takes 1 minute):\n');
        console.log('1. Open: https://jvnojekzjwugjedwrvnm.supabase.co/project/default/sql/editor');
        console.log('2. Click "New Query"');
        console.log('3. Copy entire contents of: supabase/schema.sql');
        console.log('4. Paste into editor');
        console.log('5. Click "Run" button');
        console.log('6. Wait for completion ✓');
        console.log('7. Then run: npm run dev\n');
        process.exit(0);
      }
    }
  }

  if (executed > 0) {
    console.log(`\n✅ Successfully executed ${executed} statements!\n`);
    console.log('🚀 Now run: npm run dev\n');
  }
}

executeSql().catch(error => {
  console.error('Setup error:', error.message);
});
