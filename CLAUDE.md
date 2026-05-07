# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pennington Hollow is a **construction budgeting platform** for residential owner-builder projects. It tracks estimated vs actual costs, separates owner equity (CASH) from construction loan financing (FINANCE), and provides real-time financial dashboards.

**Key differentiator**: Unlike enterprise PMIS (Procore), this focuses on the owner-builder perspective with strict capital stack delineation and cost-to-cost % complete calculations.

---

## Essential Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server on `http://localhost:5173` |
| `npm run build` | TypeScript check + Vite production build to `dist/` |
| `npm run lint` | ESLint check (no auto-fix) |
| `npm run preview` | Preview production build locally |
| `vercel deploy --prod` | Deploy to Vercel production |

**Database setup** (one-time, manual):
1. Open `https://jvnojekzjwugjedwrvnm.supabase.co/project/default/sql/editor`
2. Paste entire contents of `supabase/schema.sql`
3. Click "Run"

---

## Architecture Overview

### Data Flow

```
App.tsx (useEffect on mount)
  ↓
getDashboardMetrics() + getBudgetItemsWithActuals()
  ↓
[KPICards, CapitalCharts, SOVTable]
  ↓
User clicks "Log Payment" button
  ↓
LogPaymentModal (dialog form)
  ↓
addTransaction() → Supabase INSERT
  ↓
Dashboard refetches → Real-time updates
```

### Database Schema (3 tables in Supabase PostgreSQL)

**projects** (1 row)
- `id`: UUID (fixed: `550e8400-e29b-41d4-a716-446655440000`)
- `total_cash_allocation`: numeric ($183,000)
- `total_finance_allocation`: numeric ($63,000)

**budget_items** (26 rows, pre-seeded)
- `id`, `project_id`, `process_number` (1–26)
- `action_name`, `phase` (6 phases: Property/Shed → Finalization)
- `estimated_cost`, `funding_type` (CASH | FINANCE), `is_completed`
- Items #7 (Architect fees) and #12 (Steel building) are FINANCE; rest are CASH

**transactions** (grows as payments logged)
- `id`, `budget_item_id`, `amount`, `date`
- `type`: PAID_CASH | DRAWN_FROM_LOAN
- `note`: optional (invoice reference, etc.)

**Key calculation**: Dashboard metrics = SUM(transactions.amount) per budget_item, grouped by funding_type, with cost-to-cost % complete: `totalActual / totalEstimated * 100`

### Component Structure

| Component | Purpose | Deps |
|-----------|---------|------|
| **App.tsx** | Main orchestrator; fetches metrics + items on mount; passes callbacks | queries.ts |
| **KPICards** | Displays 4 KPI metrics (Budget, % Complete, Cash, Finance) | DashboardMetrics type |
| **CapitalCharts** | 3 Recharts: cash donut, finance donut, budget-vs-actual bar by phase | Recharts |
| **SOVTable** | 26 budget items grouped by phase (collapsible); variance highlighting; progress bars; "Log" button | @tanstack/react-table |
| **LogPaymentModal** | Dialog form (amount, date, type, note); calls `addTransaction()` on submit | HTML `<dialog>` element |

**Data layer** (`src/lib/queries.ts`):
- `getDashboardMetrics()` → calculates all KPI totals
- `getBudgetItemsWithActuals()` → budget_items with `actual_paid` computed from transactions
- `addTransaction()` → INSERT into transactions table
- `toggleItemComplete()` → update budget_items.is_completed
- `getProject()` → fetch project row

**Types** (`src/types/budget.ts`):
- `FundingType` = 'CASH' | 'FINANCE'
- `TransactionType` = 'PAID_CASH' | 'DRAWN_FROM_LOAN'
- `BudgetItem`, `Project`, `Transaction`, `DashboardMetrics` interfaces

### Styling & Design Tokens

- **Design tokens** in `src/index.css`: `--accent` (purple), `--bg`, `--text`, `--border`, etc.
- **Dark mode**: via `prefers-color-scheme` media query
- **Component styles**: scoped CSS files in `src/styles/` (KPICards.css, CapitalCharts.css, SOVTable.css, LogPaymentModal.css)
- **Global**: App.css (header gradient, main layout, footer)

---

## Deployment

**GitHub**: https://github.com/kobashix/PenningtonHollow-budget (auto-linked to Vercel)

**Vercel Setup**:
- `.vercel/project.json` created via `vercel link`
- `vercel.json`: buildCommand, outputDirectory, framework
- Environment variables on Vercel dashboard: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `.env.local` (git-ignored) for local dev (created during setup)

**Build Output**: `dist/` (828KB gzipped with Recharts)

---

## Key Implementation Details

### Variance Calculation

For each budget item:
```
Variance = actual_paid - estimated_cost
```
- If variance > 0 (over budget): red text highlight
- If variance ≤ 0 (under budget): normal text

### Progress Bar

```
% Progress = (actual_paid / estimated_cost) * 100
```
Capped at 100% visually (can overrun budget).

### Cost-to-Cost % Complete

```
% Complete = (totalActual / totalEstimated) * 100
```
Where totalActual = SUM of all transactions, totalEstimated = SUM of all budget_items.estimated_cost.

### Transaction Aggregation

In `getDashboardMetrics()`:
- Fetch all transactions for the project
- Group by budget_item_id, summing amounts
- Split sums by funding_type (CASH vs FINANCE) to calculate cash/finance burn

---

## Common Modifications

### Adding a New Dashboard Metric

1. Add field to `DashboardMetrics` interface (src/types/budget.ts)
2. Compute it in `getDashboardMetrics()` (src/lib/queries.ts)
3. Pass to KPICards or another component
4. Add corresponding card or chart in component

### Adding a Budget Phase or Line Item

1. **Pre-seeded data**: Edit `supabase/schema.sql` INSERT statement, re-run schema
2. **Or via API**: Insert row into budget_items table with project_id, process_number, action_name, phase, estimated_cost, funding_type

### Logging a Payment (User Workflow)

1. Click "Log" button on SOV row
2. Modal opens: enter amount, date, type (PAID_CASH | DRAWN_FROM_LOAN), optional note
3. Click "Log Payment"
4. `addTransaction()` INSERTs into transactions table
5. `onPaymentLogged()` callback refetches all data
6. Dashboard updates with new metrics and charts

---

## Environment Variables

**Required in production** (set via Vercel dashboard or `.env.local` for local dev):
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Public anon key (okay to expose, no secrets)

**.env.local**: Git-ignored, created during setup. Never commit.

---

## Supabase Notes

- **RLS enabled**: Permissive policies (all operations allowed, single-user app)
- **Auth**: Currently none (permissive RLS); if adding auth, tighten RLS policies to `auth.uid()` matching user_id column
- **Project ID**: Fixed UUID `550e8400-e29b-41d4-a716-446655440000` (used in all queries)

---

## Known Limitations

- **Single project**: All queries hardcode PROJECT_ID (no multi-project support)
- **No user auth**: RLS permissive; any client with anon key can read/write
- **No audit log**: Transactions table doesn't track who/when created; add `created_by`, `created_at` if needed
- **Retainage not implemented**: Plan.md mentions lender retainage (5–10%); currently basic transaction tracking

---

## Testing Workflow

1. **Local**: `npm run dev` → click "Log" on budget items → verify KPIs update
2. **Build**: `npm run build` → check for TypeScript errors, warnings
3. **Lint**: `npm run lint` → check ESLint violations
4. **Deploy**: `git push` → auto-deploys to Vercel staging, `vercel deploy --prod` for production

---

## References

- **Plan**: `/plan.md` — Original architecture requirements & business logic
- **SETUP.md**: Database setup instructions
- **COMPLETED.md**: Implementation summary
- **START_HERE.md**: Quick-start guide for first-time users
