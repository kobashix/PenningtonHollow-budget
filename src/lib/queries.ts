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
      itemsComplete: 0,
      phasesComplete: 0,
    };
  }

  // Fetch all budget items
  const { data: items } = await supabase
    .from('budget_items')
    .select('id, estimated_cost, funding_type, is_completed, phase')
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
      itemsComplete: 0,
      phasesComplete: 0,
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

  // Count items and phases that are completed
  const itemsComplete = items.filter((item) => item.is_completed).length;
  const uniquePhases = new Set(items.map((item) => item.phase));
  let phasesComplete = 0;
  uniquePhases.forEach((phase) => {
    const phaseItems = items.filter((item) => item.phase === phase);
    if (phaseItems.every((item) => item.is_completed)) {
      phasesComplete++;
    }
  });

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
    itemsComplete,
    phasesComplete,
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
  note?: string,
  date?: string,
  payee?: string
): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        budget_item_id: budgetItemId,
        amount,
        type,
        note: note || null,
        payee: payee || null,
        date: date || new Date().toISOString().split('T')[0],
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

export async function setActualPaid(
  budgetItemId: string,
  amount: number,
  fundingType: string = 'CASH'
): Promise<boolean> {
  // Delete existing transactions for this item
  await supabase
    .from('transactions')
    .delete()
    .eq('budget_item_id', budgetItemId);

  // Create a single transaction with the new amount
  if (amount > 0) {
    const transactionType = fundingType === 'FINANCE' ? 'DRAWN_FROM_LOAN' : 'PAID_CASH';
    const { error } = await supabase.from('transactions').insert([
      {
        budget_item_id: budgetItemId,
        amount,
        type: transactionType,
        date: new Date().toISOString().split('T')[0],
      },
    ]);

    if (error) {
      console.error('Error setting actual paid:', error);
      return false;
    }
  }

  return true;
}

export async function getTransactionsForItem(
  budgetItemId: string
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('budget_item_id', budgetItemId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return (data || []) as Transaction[];
}

export async function deleteTransaction(transactionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId);

  if (error) {
    console.error('Error deleting transaction:', error);
    return false;
  }

  return true;
}

export async function createBudgetItem(
  item: Omit<BudgetItem, 'id' | 'created_at' | 'actual_paid'>
): Promise<BudgetItem | null> {
  const { data, error } = await supabase
    .from('budget_items')
    .insert([item])
    .select()
    .single();

  if (error) {
    console.error('Error creating budget item:', error);
    return null;
  }

  return data as BudgetItem;
}
