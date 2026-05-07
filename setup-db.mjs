import fetch from 'node-fetch';

const supabaseUrl = 'https://jvnojekzjwugjedwrvnm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2bm9qZWt6and1Z2plZHdydm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNDQ4NTAsImV4cCI6MjA5MzcyMDg1MH0.QG_3bYw1B1zdF2qCdrrN_OkCSRXB3eeiryxMcbZe0g0';

const sqlScript = `
-- Pennington Hollow Construction Budgeting Platform
-- Supabase PostgreSQL Schema

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Pennington Hollow',
  total_cash_allocation NUMERIC NOT NULL DEFAULT 183000,
  total_finance_allocation NUMERIC NOT NULL DEFAULT 63000,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create budget_items table (Schedule of Values)
CREATE TABLE IF NOT EXISTS budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  process_number INT NOT NULL,
  action_name TEXT NOT NULL,
  phase TEXT NOT NULL,
  estimated_cost NUMERIC NOT NULL,
  funding_type TEXT NOT NULL CHECK (funding_type IN ('CASH', 'FINANCE')),
  target_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create transactions table (payment ledger)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_item_id UUID NOT NULL REFERENCES budget_items(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('PAID_CASH', 'DRAWN_FROM_LOAN')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create permissive RLS policies (single-user app, no auth for now)
CREATE POLICY "Enable read access for all users" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON projects
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON projects
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON projects
  FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON budget_items
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON budget_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON budget_items
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON budget_items
  FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON transactions
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON transactions
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON transactions
  FOR DELETE USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_budget_items_project_id ON budget_items(project_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_phase ON budget_items(phase);
CREATE INDEX IF NOT EXISTS idx_transactions_budget_item_id ON transactions(budget_item_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);

-- Seed initial project
INSERT INTO projects (id, name, total_cash_allocation, total_finance_allocation)
VALUES ('550e8400-e29b-41d4-a716-446655440000'::UUID, 'Pennington Hollow', 183000, 63000)
ON CONFLICT DO NOTHING;

-- Seed budget items from initialBudget.json
INSERT INTO budget_items (project_id, process_number, action_name, phase, estimated_cost, funding_type)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 1, 'Purchase property', 'Property/Shed', 50000, 'CASH'),
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 2, 'Move 12×32 shed onto gravel/pier base', 'Property/Shed', 1000, 'CASH'),
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 3, 'Connect electric (meter, subpanel, grounding)', 'Property/Shed', 2000, 'CASH'),
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 4, 'Connect water (tie into existing line, shutoff, insulation)', 'Property/Shed', 1500, 'CASH'),
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 5, 'Work with septic installer (soil test, design, permit)', 'Property/Shed', 7000, 'CASH'),
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 6, 'Make shed livable with basics (insulation, HVAC, kitchenette, security)', 'Property/Shed', 5000, 'CASH'),
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 7, 'Finalize building plans with architect or draftsperson', 'Planning/Foundation', 3000, 'FINANCE'),
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 8, 'Level ground for construction pad/house site', 'Planning/Foundation', 4000, 'CASH'),
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 9, 'Schedule soil compaction, drainage planning, driveway access for concrete trucks', 'Planning/Foundation', 3500, 'CASH'),
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 10, 'Concrete install', 'Planning/Foundation', 5000, 'CASH'),
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 11, 'Run below-floor utility sleeves / conduit', 'Planning/Foundation', 2000, 'CASH'),
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 12, 'Steel Building', 'Framing/Shell', 60000, 'FINANCE'),
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 13, 'Rough plumbing (supply, drain/vent)', 'Rough-ins', 10000, 'CASH'),
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 14, 'Rough electrical (boxes, circuits, panel tie-in)', 'Rough-ins', 10000, 'CASH'),
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 15, 'Rough HVAC (ducts or mini-split runs)', 'Rough-ins', 8000, 'CASH'),
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 16, 'Insulation (walls, ceiling)', 'Close-in', 6000, 'CASH'),
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 17, 'Drywall (hang, tape, finish)', 'Close-in', 10000, 'CASH'),
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 18, 'Exterior siding & trim, caulking, paint', 'Close-in', 12000, 'CASH'),
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 19, 'Install interior doors, trim, cabinets', 'Finishes', 15000, 'CASH'),
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 20, 'Final plumbing fixtures & water heater', 'Finishes', 6000, 'CASH'),
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 21, 'Final electrical fixtures, devices, breakers', 'Finishes', 6000, 'CASH'),
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 22, 'HVAC install / test', 'Finishes', 5000, 'CASH'),
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 23, 'Painting & touch-ups', 'Finishes', 4000, 'CASH'),
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 24, 'Grade lot for drainage, install gutters/downspouts', 'Finalization', 5000, 'CASH'),
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 25, 'Seed, gravel, or fence for site finishing', 'Finalization', 3000, 'CASH'),
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 26, 'Move into house & convert shed into other use', 'Finalization', 2000, 'CASH')
ON CONFLICT DO NOTHING;
`;

async function executeSQL() {
  console.log('🔧 Setting up Pennington Hollow database...\n');

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ sql: sqlScript })
    });

    if (!response.ok) {
      console.log('⚠️  Direct RPC approach not available (expected for anon key)');
      console.log('Using manual SQL editor approach instead...\n');
      showManualSteps();
      return;
    }

    const result = await response.json();
    console.log('✅ Database setup successful!\n');
    showSuccess();

  } catch (error) {
    console.log('⚠️  Could not auto-execute SQL (this is normal)\n');
    showManualSteps();
  }
}

function showManualSteps() {
  console.log('📋 MANUAL SETUP (1 minute):\n');
  console.log('1. Open your Supabase dashboard:');
  console.log('   https://jvnojekzjwugjedwrvnm.supabase.co/project/default/sql/editor\n');
  console.log('2. Click "New Query" (or use the SQL Editor)\n');
  console.log('3. Copy and paste the entire contents of:');
  console.log('   supabase/schema.sql\n');
  console.log('4. Click "Run" button\n');
  console.log('5. Then run this again: npm run dev\n');
  console.log('The dashboard will then load with all data!\n');
}

function showSuccess() {
  console.log('🚀 Your Pennington Hollow budget dashboard is live!\n');
  console.log('Run:   npm run dev\n');
  console.log('Then open: http://localhost:5173\n');
}

executeSQL();
