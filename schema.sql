-- Pennington Hollow Relational Schema

-- 1. Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Budget Line Items
CREATE TABLE budget_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id),
    wbs_code TEXT,
    original_budget DECIMAL(15,2) NOT NULL,
    description TEXT,
    phase TEXT
);

-- 3. Commitments
CREATE TABLE commitments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_line_id UUID REFERENCES budget_line_items(id),
    amount DECIMAL(15,2) NOT NULL,
    vendor TEXT,
    status TEXT DEFAULT 'pending'
);

-- 4. Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT,
    record_id UUID,
    action TEXT,
    changed_by UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    old_value JSONB,
    new_string JSONB
);
