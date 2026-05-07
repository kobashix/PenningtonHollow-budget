# Getting Started — Pennington Hollow Budget Dashboard

Your construction budgeting platform is **built, tested, and deployed**. Now set it up in 1 minute.

## The Situation

✅ Frontend dashboard: Complete  
✅ Vercel deployment: Live  
✅ Supabase project: Created  
⏳ **Database tables**: Need to be created (1 copy-paste step)

## One-Minute Setup

### Step 1: Create Database Tables

Open Supabase SQL Editor:
```
https://jvnojekzjwugjedwrvnm.supabase.co/project/default/sql/editor
```

**Then:**

1. Click **"New Query"** button
2. Open file `supabase/schema.sql` in your project
3. Copy all contents (Ctrl+A → Ctrl+C)
4. Paste into Supabase editor
5. Click **"Run"** button
6. Wait for **green checkmark** ✅

**That's it!** Your database is ready.

### Step 2: Test Locally

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

**You'll see:**
- Dashboard with 4 KPI cards
- $243,700 total budget across 26 items
- 6 construction phases
- Charts showing cash vs. finance allocation
- "Log Payment" button to record costs

Try clicking **"Log"** on any line item and logging a payment. Watch the KPI cards update in real-time.

## The Dashboard Explained

### KPI Cards (Top Row)
- **Total Budget**: $243,700 (26 line items)
- **% Complete**: Cost-to-cost method (total paid / total budget)
- **Cash Equity**: Allocated ($183K), Spent, Remaining
- **Loan Financing**: Allocated ($63K), Drawn, Remaining

### Charts (Middle)
- **Cash Donut**: Spent vs. remaining equity
- **Finance Donut**: Drawn vs. remaining loan
- **Budget vs Actual**: Bar chart by phase

### Schedule of Values (Table)
- **26 Budget Items**: Property/Shed → Finalization phases
- **Grouped by Phase**: Click to expand/collapse
- **Progress Bars**: Visual completion per item
- **Variance Highlighting**: Red if over budget
- **Log Payment**: Record PAID_CASH or DRAWN_FROM_LOAN

## Example Workflow

**You've paid $50K for property (item #1):**

1. Find "Purchase property" row in "Property/Shed" phase
2. Click **"Log"** button
3. Modal appears:
   ```
   Amount: 50000
   Date: [today]
   Type: Owner's Cash Equity
   Note: Property deed transfer
   ```
4. Click **"Log Payment"**
5. **Dashboard updates instantly**:
   - % Complete: 20.5% (50K / 243.7K)
   - Cash Spent: $50,000
   - Cash Remaining: $133,000
   - Progress bar on item updates

That's the entire workflow!

## Your 26 Budget Items

| Phase | Items | Total Estimated | Funding |
|-------|-------|-----------------|---------|
| Property/Shed | 6 | $67.5K | CASH |
| Planning/Foundation | 5 | $17.5K | Mix* |
| Framing/Shell | 1 | $60K | FINANCE |
| Rough-ins | 3 | $28K | CASH |
| Close-in | 3 | $28K | CASH |
| Finishes | 6 | $37K | CASH |
| Finalization | 2 | $8K | CASH |
| **TOTAL** | **26** | **$243.7K** | $183K CASH / $63K FINANCE |

*Item 7 (Architect fees $3K) is FINANCE; rest are CASH

## Production Deployment

Once you've tested locally and everything works:

```bash
git push origin master
```

Vercel auto-deploys your changes. Your app is live at:
```
https://budget-bice-ten.vercel.app
```

Hard refresh the page (Ctrl+Shift+R) to see the latest version.

## Files to Know

| File | Purpose |
|------|---------|
| `supabase/schema.sql` | Database schema (paste into Supabase) |
| `.env.local` | Supabase credentials (configured) |
| `src/App.tsx` | Main dashboard |
| `src/components/KPICards.tsx` | Metric cards |
| `src/components/CapitalCharts.tsx` | Recharts visualizations |
| `src/components/SOVTable.tsx` | Budget item table |
| `src/components/LogPaymentModal.tsx` | Payment entry form |
| `src/lib/queries.ts` | Data layer (Supabase queries) |
| `src/types/budget.ts` | TypeScript types |

## Troubleshooting

### Dashboard shows "Database Setup Required"

This means the Supabase tables haven't been created yet. Go back to Step 1 and paste the schema.

### Tables were created but dashboard still shows an error

Try a hard refresh: **Ctrl+Shift+R** (or Cmd+Shift+R on Mac)

### "Failed to load dashboard data" error

Check your browser console (F12 → Console tab). Look for:
- **Missing tables**: Run the schema.sql in Supabase
- **Wrong credentials**: Verify `.env.local` has correct URL and API key
- **Network error**: Check Supabase status page

### Want to reset the database

In Supabase SQL editor:

```sql
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS budget_items CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
```

Then paste `schema.sql` again and click Run.

## Next Steps

1. ✅ Run the schema.sql in Supabase (1 minute)
2. ✅ Test locally: `npm run dev`
3. ✅ Deploy: `git push origin master`
4. 🎯 Start logging payments as invoices arrive
5. 🎯 Monitor budget burn rate via dashboard KPIs
6. 🎯 Share dashboard with architect, lender, stakeholders

## Support

- **Setup issues?** Check the Troubleshooting section above
- **Feature requests?** Edit `src/` files and push to trigger Vercel auto-deploy
- **Database questions?** See `README.md` or `CLAUDE.md` for architecture details

---

**Status**: ✅ Ready. Database setup remaining (~1 min).

**Next**: Open Supabase SQL editor and paste `schema.sql`. That's all! 🚀
