# 🚀 Database Setup — 1 Minute

Your dashboard is built and deployed. Now set up the database in 1 minute.

## Quick Start

### Step 1: Open Supabase SQL Editor
```
https://jvnojekzjwugjedwrvnm.supabase.co/project/default/sql/editor
```

You'll see a blank editor.

### Step 2: Copy the Schema
Open the file in your project:
```
supabase/schema.sql
```

Select all and copy (Ctrl+A, Ctrl+C).

### Step 3: Paste and Execute
- Click **New Query** in Supabase
- Paste the schema
- Press **Run** (or Ctrl+Enter)
- Wait for green checkmark ✅

That's it! Your database is ready.

### Step 4: Start the App
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## What You'll See

**Dashboard** with:
- 4 KPI cards showing $243,700 total budget
- 26 budget items across 6 construction phases
- Pie charts for cash vs. finance allocation
- Schedule of Values table
- "Log Payment" buttons to record costs

Try logging a payment to see the KPIs update in real-time.

---

## Troubleshooting

### "Tables not found" error?
- Verify SQL executed successfully (green checkmark in Supabase)
- Hard refresh dashboard: **Ctrl+Shift+R**
- Check browser console (F12) for API errors

### "API Error 400"?
- Make sure all 26 budget items were inserted
- Check Supabase Tables view to confirm tables exist

### Want to reset?
In Supabase SQL editor, run:
```sql
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS budget_items CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
```

Then paste `schema.sql` again and click Run.

---

## Next: Deploy to Vercel

Once dashboard works locally:
```bash
git push origin main
```

Vercel auto-deploys. Your app is live at:
```
https://budget-bice-ten.vercel.app
```

---

**Done!** You now have a fully functional construction budget tracker. 🎉
