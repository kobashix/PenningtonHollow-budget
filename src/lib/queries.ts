import { supabase } from './supabase';
import type {
  BudgetItem,
  DashboardMetrics,
  Transaction,
  TransactionType,
} from '../types/budget';

const PROJECT_ID = '550e8400-e29b-41d4-a716-446655440000';

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  // Fetch project to get allocations
  const { data: project } = await supabase
    .from('projects')
    .select('total_cash_allocation, total_finance_allocation')
    .eq('id', PROJECT_ID)
    .single();

  if (!project) {
    return {
      totalEstimated: 0,
      totalActual: 0,
      cashAllocated: 0,
      cashSpent: 0,
      cashRemaining: 0,
      financeAllocated: 0,
      financeDrawn: 0,
      financeRemaining: 0,
      percentComplete: 0,
    };
  }

  // Fetch all budget items
  const { data: items } = await supabase
    .from('budget_items')
    .select('id, estimated_cost, funding_type')
    .eq('project_id', PROJECT_ID);

  // Fetch all transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('budget_item_id, amount, type');

  if (!items || !transactions) {
    return {
      totalEstimated: 0,
      totalActual: 0,
      cashAllocated: 0,
      cashSpent: 0,
      cashRemaining: 0,
      financeAllocated: 0,
      financeDrawn: 0,
      financeRemaining: 0,
      percentComplete: 0,
    };
  }

  // Aggregate transactions by item
  const transactionsByItem: Record<string, number> = {};
  transactions.forEach((t) => {
    const key = t.budget_item_id;
    transactionsByItem[key] = (transactionsByItem[key] || 0) + t.amount;
  });

  // Calculate totals
  let totalEstimated = 0;
  let totalActual = 0;
  let cashAllocated = 0;
  let cashSpent = 0;
  let financeAllocated = 0;
  let financeDrawn = 0;

  items.forEach((item) => {
    const actual = transactionsByItem[item.id] || 0;
    totalEstimated += item.estimated_cost;
    totalActual += actual;

    if (item.funding_type === 'CASH') {
      cashAllocated += item.estimated_cost;
      cashSpent += actual;
    } else {
      financeAllocated += item.estimated_cost;
      financeDrawn += actual;
    }
  });

  const percentComplete =
    totalEstimated > 0 ? (totalActual / totalEstimated) * 100 : 0;

  return {
    totalEstimated,
    totalActual,
    cashAllocated,
    cashSpent,
    cashRemaining: Math.max(0, cashAllocated - cashSpent),
    financeAllocated,
    financeDrawn,
    financeRemaining: Math.max(0, financeAllocated - financeDrawn),
    percentComplete,
  };
}

export async function getBudgetItemsWithActuals(): Promise<BudgetItem[]> {
  // Fetch all budget items
  const { data: items } = await supabase
    .from('budget_items')
    .select('*')
    .eq('project_id', PROJECT_ID)
    .order('process_number');

  if (!items) return [];

  // Fetch all transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('budget_item_id, amount');

  if (!transactions) return items as BudgetItem[];

  // Aggregate transactions by item
  const transactionsByItem: Record<string, number> = {};
  transactions.forEach((t) => {
    const key = t.budget_item_id;
    transactionsByItem[key] = (transactionsByItem[key] || 0) + t.amount;
  });

  // Attach actual_paid to each item
  return (items as BudgetItem[]).map((item) => ({
    ...item,
    actual_paid: transactionsByItem[item.id] || 0,
  }));
}

export async function addTransaction(
  budgetItemId: string,
  amount: number,
  type: TransactionType,
  note?: string
): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        budget_item_id: budgetItemId,
        amount,
        type,
        note: note || null,
        date: new Date().toISOString().split('T')[0],
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding transaction:', error);
    return null;
  }

  return data as Transaction;
}

export async function toggleItemComplete(
  itemId: string,
  isCompleted: boolean
): Promise<boolean> {
  const { error } = await supabase
    .from('budget_items')
    .update({ is_completed: isCompleted })
    .eq('id', itemId);

  if (error) {
    console.error('Error updating item:', error);
    return false;
  }

  return true;
}

export async function getProject() {
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('id', PROJECT_ID)
    .single();

  return data;
}

export async function updateBudgetItem(
  itemId: string,
  updates: Partial<BudgetItem>
): Promise<BudgetItem | null> {
  const { error } = await supabase
    .from('budget_items')
    .update(updates)
    .eq('id', itemId);

  if (error) {
    console.error('Error updating budget item:', error);
    return null;
  }

  return null;
}

export async function deleteBudgetItem(itemId: string): Promise<boolean> {
  const { error } = await supabase
    .from('budget_items')
    .delete()
    .eq('id', itemId);

  if (error) {
    console.error('Error deleting budget item:', error);
    return false;
  }

  return true;
}
