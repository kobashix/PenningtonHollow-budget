#!/usr/bin/env node

const SUPABASE_URL = 'https://jvnojekzjwugjedwrvnm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2bm9qZWt6and1Z2plZHdydm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNDQ4NTAsImV4cCI6MjA5MzcyMDg1MH0.QG_3bYw1B1zdF2qCdrrN_OkCSRXB3eeiryxMcbZe0g0';
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

async function initDB() {
  console.log('🔧 Initializing Pennington Hollow database...\n');

  try {
    // 1. Insert project
    console.log('▶ Creating project...');
    let res = await fetch(`${SUPABASE_URL}/rest/v1/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        id: PROJECT_ID,
        name: 'Pennington Hollow',
        total_cash_allocation: 183000,
        total_finance_allocation: 63000,
      }),
    });

    if (res.ok || res.status === 409) {
      console.log('   ✓ Project ready\n');
    } else {
      console.error('   ✗ Failed to create project:', res.status);
      return;
    }

    // 2. Insert budget items
    console.log('▶ Creating 26 budget items...');
    const itemsWithProject = budgetItems.map(item => ({
      ...item,
      project_id: PROJECT_ID,
    }));

    res = await fetch(`${SUPABASE_URL}/rest/v1/budget_items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(itemsWithProject),
    });

    if (res.ok) {
      const inserted = await res.json();
      console.log(`   ✓ ${inserted.length} items created\n`);
    } else {
      const error = await res.text();
      console.error('   ✗ Failed to create items:', error);
      return;
    }

    console.log('✅ Database initialized successfully!\n');
    console.log('🚀 Go to: https://budget-bice-ten.vercel.app');
    console.log('   Hard refresh (Ctrl+Shift+R) to see the data\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

initDB();
