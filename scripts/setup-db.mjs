#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function setupDatabase() {
  console.log('🔧 Setting up Pennington Hollow database...\n');

  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf-8');

  const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1]?.trim();
  const anonKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();

  if (!supabaseUrl || !anonKey) {
    console.error('Missing credentials in .env.local');
    process.exit(1);
  }

  try {
    console.log('Seeding data...\n');
    const projectId = '550e8400-e29b-41d4-a716-446655440000';
    
    console.log('  Creating project...');
    let res = await fetch(`${supabaseUrl}/rest/v1/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        id: projectId,
        name: 'Pennington Hollow',
        total_cash_allocation: 183000,
        total_finance_allocation: 63000,
      }),
    });

    if (!res.ok && res.status !== 409) {
      const error = await res.text();
      console.error('Project creation failed - tables may not exist yet');
      console.error('You must run the SQL setup in Supabase\n');
      throw new Error('Tables need to be created first');
    }

    console.log('  Creating budget items...');
    const items = [
      { process_number: 1, action_name: 'Purchase property', phase: 'Property/Shed', estimated_cost: 50000, funding_type: 'CASH' },
      { process_number: 2, action_name: 'Move 12x32 shed onto gravel/pier base', phase: 'Property/Shed', estimated_cost: 1000, funding_type: 'CASH' },
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

    const itemsWithProject = items.map(item => ({
      ...item,
      project_id: projectId,
    }));

    res = await fetch(`${supabaseUrl}/rest/v1/budget_items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify(itemsWithProject),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed: ${error}`);
    }

    const inserted = await res.json();
    console.log(`  OK - ${inserted.length} items created\n`);
    console.log('✓ Database ready!');
    console.log('Run: npm run dev\n');

  } catch (error) {
    console.error('\n⚠️  Automatic setup requires SQL table creation first.\n');
    console.error('Quick setup (2 minutes):');
    console.error('1. https://jvnojekzjwugjedwrvnm.supabase.co/project/default/sql/editor');
    console.error('2. Click "New Query"');
    console.error('3. Copy file: supabase/schema.sql');
    console.error('4. Paste and click "Run"');
    console.error('5. npm run dev\n');
    process.exit(1);
  }
}

setupDatabase();
