# Pennington Hollow Platform Architecture (Procore-Grade)

This architecture moves from a spreadsheet-based UI to a relational data platform.

## Core Relational Schema (Supabase/PostgreSQL)

### 1. Cost Management Module
- `projects`: ID, name, status, created_at.
- `budget_line_items`: project_id, wbs_code, original_budget, description, phase.
- `commitments` (PO/Contracts): id, budget_line_id, amount, vendor, status.
- `change_events`: id, project_id, description, potential_impact, status.
- `change_orders`: id, change_event_id, amount, status, approval_date.
- `invoices`: id, commitment_id, amount_requested, status (draft/approved).

### 2. Project Execution Module
- `rfis`: id, project_id, question, response, status, created_by.
- `submittals`: id, project_id, item_name, status, due_date.

### 3. Governance
- `audit_logs`: id, table_name, record_id, action, changed_by, timestamp, old_value, new_value.

## Strategic Roadmap Update

### Phase 1: Foundation
- [ ] Define Relational Schema (PostgreSQL).
- [ ] Implement Supabase/Auth for user-based audit trails.
- [ ] Build "Cost Management" module (the core financial backbone).

### Phase 2: Execution
- [ ] Build "RFI/Submittal" module.
- [ ] Implement Document Control (Storage integration).

### Phase 3: Reporting
- [ ] Build Executive Dashboards (Live FTC/EAC tracking).
- [ ] Implement automated Draw Request PDF generation.
