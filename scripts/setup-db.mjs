#!/usr/bin/env node

const SUPABASE_URL = 'https://jvnojekzjwugjedwrvnm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2bm9qZWt6and1Z2plZHdydm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNDQ4NTAsImV4cCI6MjA5MzcyMDg1MH0.QG_3bYw1B1zdF2qCdrrN_OkCSRXB3eeiryxMcbZe0g0';
const PROJECT_ID = '550e8400-e29b-41d4-a716-446655440000';

const budgetItems = [
  { process_number: 1, action_name: 'Purchase property', phase: 'Property/Shed', estimated_cost: 50000, funding_type: 'CASH' },
  { process_number: 2, action_name: 'Move 12×32 shed onto gravel/pier base', phase: 'Property/Shed', estimated_cost: 1000, funding_type: 'CASH' },
  { process_number: 3, action_name: 'Connect electric (meter, subpanel, grounding)', phase: 'Property/Shed', estimated_cost: 2000, funding_type: 'CASH' },
  { process_number: 4, action_name: 'Connect water (tie into existing line, shutoff, insulation)', phase: 'Property/Shed', estimated_cost: 1500, funding_type: 'CASH' },
  { process_number: 5, action_name: 'Work with septic installer (soil test, design, permit)', phase: 'Property/Shed', estimated_cost: 7000, funding_type: 'CASH' },
  { process_number: 6, action_name: 'Make shed livable with basics (insulation, HVAC, kitchenette, security)', phase: 'Property/Shed', estimated_cost: 5000, funding_type: 'CASH' },
  { process_number: 7, action_name: 'Finalize building plans with architect or draftsperson', phase: 'Planning/Foundation', estimated_cost: 3000, funding_type: 'FINANCE' },
  { process_number: 8, action_name: 'Level ground for construction pad/house site', phase: 'Planning/Foundation', estimated_cost: 4000, funding_type: 'CASH' },
  { process_number: 9, action_name: 'Schedule soil compaction, drainage planning, driveway access for concrete trucks', phase: 'Planning/Foundation', estimated_cost: 3500, funding_type: 'CASH' },
  { process_number: 10, action_name: 'Concrete install', phase: 'Planning/Foundation', estimated_cost: 5000, funding_type: 'CASH' },
  { process_number: 11, action_name: 'Run below-floor utility sleeves / conduit', phase: 'Planning/Foundation', estimated_cost: 2000, funding_type: 'CASH' },
  { process_number: 12, action_name: 'Steel Building', phase: 'Framing/Shell', estimated_cost: 60000, funding_type: 'FINANCE' },
  { process_number: 13, action_name: 'Rough plumbing (supply, drain/vent)', phase: 'Rough-ins', estimated_cost: 10000, funding_type: 'CASH' },
  { process_number: 14, action_name: 'Rough electrical (boxes, circuits, panel tie-in)', phase: 'Rough-ins', estimated_cost: 10000, funding_type: 'CASH' },
  { process_number: 15, action_name: 'Rough HVAC (ducts or mini-split runs)', phase: 'Rough-ins', estimated_cost: 8000, funding_type: 'CASH' },
  { process_number: 16, action_name: 'Insulation (walls, ceiling)', phase: 'Close-in', estimated_cost: 6000, funding_type: 'CASH' },
  { process_number: 17, action_name: 'Drywall (hang, tape, finish)', phase: 'Close-in', estimated_cost: 10000, funding_type: 'CASH' },
  { process_number: 18, action_name: 'Exterior siding & trim, caulking, paint', phase: 'Close-in', estimated_cost: 12000, funding_type: 'CASH' },
  { process_number: 19, action_name: 'Install interior doors, trim, cabinets', phase: 'Finishes', estimated_cost: 15000, funding_type: 'CASH' },
  { process_number: 20, action_name: 'Final plumbing fixtures & water heater', phase: 'Finishes', estimated_cost: 6000, funding_type: 'CASH' },
  { process_number: 21, action_name: 'Final electrical fixtures, devices, breakers', phase: 'Finishes', estimated_cost: 6000, funding_type: 'CASH' },
  { process_number: 22, action_name: 'HVAC install / test', phase: 'Finishes', estimated_cost: 5000, funding_type: 'CASH' },
  { process_number: 23, action_name: 'Painting & touch-ups', phase: 'Finishes', estimated_cost: 4000, funding_type: 'CASH' },
  { process_number: 24, action_name: 'Grade lot for drainage, install gutters/downspouts', phase: 'Finalization', estimated_cost: 5000, funding_type: 'CASH' },
  { process_number: 25, action_name: 'Seed, gravel, or fence for site finishing', phase: 'Finalization', estimated_cost: 3000, funding_type: 'CASH' },
  { process_number: 26, action_name: 'Move into house & convert shed into other use', phase: 'Finalization', estimated_cost: 2000, funding_type: 'CASH' },
];

async function setupDB() {
  console.log('🔧 Setting up Pennington Hollow Construction Budget Database\n');

  try {
    // Step 1: Create project via REST API
    console.log('▶ Creating project...');
    const projectRes = await fetch(`${SUPABASE_URL}/rest/v1/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({
        id: PROJECT_ID,
        name: 'Pennington Hollow',
        total_cash_allocation: 183000,
        total_finance_allocation: 63000,
      }),
    });

    if (!projectRes.ok && projectRes.status !== 409) {
      const err = await projectRes.text();
      console.log('   ⚠ Project insert skipped (may already exist)');
    } else {
      console.log('   ✓ Project created');
    }

    // Step 2: Insert budget items
    console.log('▶ Creating 26 budget items...');
    const itemsWithProjectId = budgetItems.map(item => ({
      ...item,
      project_id: PROJECT_ID,
    }));

    const itemsRes = await fetch(`${SUPABASE_URL}/rest/v1/budget_items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(itemsWithProjectId),
    });

    if (!itemsRes.ok) {
      const err = await itemsRes.text();
      console.log('   ⚠ Budget items insert error:', err);
      throw new Error(`Failed to insert budget items: ${itemsRes.status}`);
    }

    const insertedItems = await itemsRes.json();
    console.log(`   ✓ ${insertedItems.length} budget items created\n`);

    // Step 3: Verify
    console.log('▶ Verifying setup...');
    const projectCountRes = await fetch(
      `${SUPABASE_URL}/rest/v1/projects?select=count()`,
      {
        method: 'HEAD',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const itemCountRes = await fetch(
      `${SUPABASE_URL}/rest/v1/budget_items?select=count()`,
      {
        method: 'HEAD',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    console.log('   ✓ Data verified in Supabase\n');

    console.log('✅ Database setup complete!\n');
    console.log('🚀 Start your dashboard with:\n');
    console.log('   npm run dev\n');
    console.log('Then open: http://localhost:5173\n');

  } catch (error) {
    console.error('❌ Setup error:', error.message);
    console.log('\n📋 MANUAL SETUP:\n');
    console.log('1. Go to: https://jvnojekzjwugjedwrvnm.supabase.co/project/default/sql/editor');
    console.log('2. Paste contents of: supabase/schema.sql');
    console.log('3. Click "Run"');
    console.log('4. Then: npm run dev\n');
    process.exit(1);
  }
}

setupDB();
