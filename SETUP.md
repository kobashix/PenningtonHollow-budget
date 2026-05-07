# 🏗️ Pennington Hollow Construction Budget Platform — Setup Guide

Your app is **99% ready**. Just one quick step to complete the Supabase database schema:

## ⚡ Quick Start (< 2 minutes)

### Step 1: Set Up the Database

Open the Supabase SQL Editor:
```
https://jvnojekzjwugjedwrvnm.supabase.co/project/default/sql/editor
```

Click **"New Query"** in the top-right corner.

### Step 2: Paste the Schema

Copy the entire contents of:
```
supabase/schema.sql
```

Paste it into the SQL editor (replace any default content).

### Step 3: Execute

Click the **"Run"** button (or press `Ctrl+Enter`).

You'll see:
- ✓ 3 tables created (`projects`, `budget_items`, `transactions`)
- ✓ 26 budget items seeded for your project
- ✓ RLS policies enabled

### Step 4: Launch the Dashboard

In your terminal:
```bash
npm run dev
```

Open: `http://localhost:5173`

---

## 🎯 What You'll See

The dashboard loads with:

- **Total Budget**: $243,700 (26 line items)
- **Cash Equity**: $183,000 allocated
- **Loan Financing**: $63,000 allocated (items 7 & 12)
- **Schedule of Values**: Grouped by phase, sortable, with variance tracking
- **Capital Charts**: Donut charts (cash/finance) + budget vs actual by phase

---

## 📝 Features

✅ **Real-time Budget Tracking** — Log payments, watch KPIs update  
✅ **Cash vs Finance Delineation** — Strict separation of owner equity and loan draws  
✅ **Schedule of Values** — Industry-standard SOV with completion tracking  
✅ **Variance Alerts** — Red highlight if spending exceeds budget  
✅ **Progress Visualization** — Phase completion bars and overall % complete  
✅ **Payment History** — Full transaction ledger per line item  

---

## 🔧 Need Help?

**Tables not appearing?**
- Check the SQL execution completed successfully (green checkmark in Supabase)
- Refresh the browser: `Ctrl+Shift+R` (hard refresh)

**Data not loading?**
- Verify `.env.local` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Check browser console (F12) for error messages

**Payment logging not working?**
- Ensure `transactions` table was created in Step 1

---

## 📦 Project Structure

```
budget/
├── .env.local                   ← Your Supabase credentials (already set)
├── supabase/schema.sql          ← Database schema (paste into SQL editor)
├── src/
│   ├── App.tsx                  ← Main dashboard
│   ├── lib/
│   │   ├── supabase.ts          ← Supabase client (configured)
│   │   └── queries.ts           ← Data fetching logic
│   ├── components/
│   │   ├── KPICards.tsx         ← Top-level metrics
│   │   ├── CapitalCharts.tsx    ← Recharts visualizations
│   │   ├── SOVTable.tsx         ← Schedule of Values table
│   │   └── LogPaymentModal.tsx  ← Payment entry dialog
│   ├── types/budget.ts          ← TypeScript interfaces
│   └── styles/                  ← Component-specific CSS
└── package.json
```

---

## 🚀 Ready?

1. Open SQL editor link above
2. Paste `supabase/schema.sql`
3. Click **Run**
4. Run `npm run dev`
5. Open `http://localhost:5173`

**That's it!** Your construction budget dashboard is live. 🎉
