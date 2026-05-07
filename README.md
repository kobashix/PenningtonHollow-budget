# 🏗️ Pennington Hollow — Construction Budget & Project Management

A professional-grade construction budgeting platform built with **Vite + React + TypeScript + Supabase**.

> Designed specifically for owner-builder residential construction projects with strict delineation between owner equity and construction loan financing.

---

## ✨ Features

- **Real-time Budget Tracking** — Track estimated vs actual costs with variance alerts
- **Cash vs Finance Tracking** — Separate owner equity from construction loan draws
- **Schedule of Values** — Industry-standard SOV with phase grouping and completion tracking
- **Dashboard KPIs** — Total budget, % complete, cash burn, finance drawn
- **Capital Stack Visualization** — Donut charts for allocation vs spending
- **Payment Logging** — Quick modal to record transactions
- **Progress Bars** — Visual completion status per line item
- **Responsive Design** — Works on desktop, tablet, mobile

---

## 🚀 Quick Start

### 1. Set Up Database (2 minutes)

Open the Supabase SQL editor:
```
https://jvnojekzjwugjedwrvnm.supabase.co/project/default/sql/editor
```

Click **"New Query"** and paste `supabase/schema.sql`:

```sql
-- Copy entire contents of supabase/schema.sql
-- Click "Run"
```

### 2. Start Dev Server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📊 Dashboard Overview

### KPI Cards
- **Total Project Budget** — $243,700 (26 line items)
- **Project % Complete** — Cost-to-cost progress calculation
- **Cash Equity** — Allocated vs spent vs remaining
- **Loan Financing** — Allocated vs drawn vs remaining

### Charts
- **Cash Allocation** — Donut chart (spent vs available)
- **Finance Allocation** — Donut chart (drawn vs available)
- **Budget vs Actual** — Bar chart by phase

### Schedule of Values
- **26 Budget Items** — Property/Shed → Finalization phases
- **Grouped by Phase** — Collapsible phase sections
- **Variance Highlighting** — Red if over budget
- **Progress Tracking** — Completion bars per item
- **Payment Logging** — "Log" button opens payment modal

---

## 🏗️ Pennington Hollow Project Data

| Phase | Items | Total Estimated | Funding Type |
|-------|-------|-----------------|--------------|
| Property/Shed | 6 | $67,500 | Mostly CASH |
| Planning/Foundation | 5 | $17,500 | Mix (item 7 FINANCE) |
| Framing/Shell | 1 | $60,000 | FINANCE |
| Rough-ins | 3 | $28,000 | CASH |
| Close-in | 3 | $28,000 | CASH |
| Finishes | 6 | $37,000 | CASH |
| Finalization | 2 | $8,000 | CASH |
| **TOTAL** | **26** | **$243,700** | $183K CASH / $63K FINANCE |

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build**: Vite 8
- **Database**: Supabase (PostgreSQL)
- **UI Components**: Custom + Recharts + TanStack Table
- **Styling**: CSS with design tokens (dark mode support)

---

## 📁 Project Structure

```
budget/
├── README.md                    ← You are here
├── SETUP.md                     ← Setup guide (read first)
├── COMPLETED.md                 ← Full implementation details
├── .env.local                   ← Supabase credentials (configured)
├── supabase/
│   └── schema.sql              ← Database schema (paste into SQL editor)
├── src/
│   ├── App.tsx                 ← Main dashboard
│   ├── App.css                 ← Global styles
│   ├── index.css               ← Design tokens
│   ├── main.tsx                ← Entry point
│   ├── lib/
│   │   ├── supabase.ts         ← Supabase client
│   │   └── queries.ts          ← Data layer (getDashboardMetrics, etc.)
│   ├── components/
│   │   ├── KPICards.tsx        ← Top-level metrics
│   │   ├── CapitalCharts.tsx   ← Recharts visualizations
│   │   ├── SOVTable.tsx        ← Schedule of Values table
│   │   └── LogPaymentModal.tsx ← Payment entry modal
│   ├── types/
│   │   └── budget.ts           ← TypeScript interfaces
│   ├── styles/
│   │   ├── KPICards.css
│   │   ├── CapitalCharts.css
│   │   ├── SOVTable.css
│   │   └── LogPaymentModal.css
│   └── data/
│       └── initialBudget.json  ← Seed data reference
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 🎯 How It Works

### 1. Dashboard Load
App fetches `getDashboardMetrics()` and `getBudgetItemsWithActuals()` on mount.

### 2. Display Data
- KPI cards show totals
- Charts visualize capital allocation
- SOV table lists all budget items with progress

### 3. Log Payment
User clicks "Log" on a budget item:
- Modal opens with fields: Amount, Date, Type (PAID_CASH | DRAWN_FROM_LOAN), Note
- On submit, `addTransaction()` inserts into Supabase `transactions` table
- Dashboard refetches and updates in real-time

### 4. Variance Tracking
For each line item:
- `estimated_cost` from `budget_items` table
- `actual_paid` = SUM of `transactions.amount` where `budget_item_id` matches
- Variance = `actual_paid - estimated_cost`
- Red highlight if variance > 0 (over budget)

---

## 🔐 Security

- **Supabase RLS** — Row-level security policies enabled
- **Anon Key** — Public API key only (not service role key)
- **Environment Variables** — Credentials in `.env.local` (not committed)

---

## 📈 Real-World Usage

### Phase 1: Property/Shed ($67.5K CASH)
Log purchase property ($50K), utilities, shed livability costs.

### Phase 2: Planning/Foundation ($17.5K, includes $3K FINANCE)
Log architect fees ($3K via loan draw), foundation costs.

### Phase 3: Framing/Shell ($60K FINANCE)
Log steel building via construction loan draw.

### Phases 4–7: Build-out (Rough-ins → Finalization)
Log MEP rough-in, insulation, drywall, finishes, final costs.

**Dashboard updates** each time you log a payment, showing:
- % complete (cost-to-cost method)
- Cash remaining
- Financing remaining
- Budget overruns (if any)

---

## 💡 Next Steps

1. **Complete SQL setup** — See `SETUP.md`
2. **Log test payments** — Click "Log" on budget items
3. **Deploy to Vercel** — Push to GitHub (automatic CI/CD)
4. **Share with stakeholders** — Architect, lender, owner
5. **Track actual costs** — Update as invoices arrive

---

## 🤝 Support

**Questions about setup?**
- Check `SETUP.md` for step-by-step instructions
- See `COMPLETED.md` for architectural details

**Issues?**
- Check browser console (F12) for error messages
- Verify Supabase tables created (SQL editor → Tables view)
- Confirm `.env.local` has correct keys

---

## 📝 License

Built for the Pennington Hollow residential construction project (Bonnerdale, AR).

---

**Status**: ✅ Ready to deploy. Database setup remaining (~2 min).

Next: Follow instructions in `SETUP.md` → `npm run dev` → `http://localhost:5173`
