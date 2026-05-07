export type FundingType = 'CASH' | 'FINANCE';
export type TransactionType = 'PAID_CASH' | 'DRAWN_FROM_LOAN';

export interface Project {
  id: string;
  name: string;
  total_cash_allocation: number;
  total_finance_allocation: number;
  created_at?: string;
}

export interface BudgetItem {
  id: string;
  project_id: string;
  process_number: number;
  action_name: string;
  phase: string;
  estimated_cost: number;
  funding_type: FundingType;
  target_date: string | null;
  is_completed: boolean;
  created_at?: string;
  actual_paid?: number; // computed via JOIN/aggregation
}

export interface Transaction {
  id: string;
  budget_item_id: string;
  amount: number;
  date: string;
  type: TransactionType;
  note?: string;
  created_at?: string;
}

export interface DashboardMetrics {
  totalEstimated: number;
  totalActual: number;
  cashAllocated: number;
  cashSpent: number;
  cashRemaining: number;
  financeAllocated: number;
  financeDrawn: number;
  financeRemaining: number;
  percentComplete: number;
}
