import { useEffect, useState } from 'react';
import { getTransactionsForItem, deleteTransaction } from '../lib/queries';
import { formatCurrency } from '../lib/utils';
import type { Transaction } from '../types/budget';
import '../styles/PaymentHistoryDrawer.css';

interface PaymentHistoryDrawerProps {
  budgetItemId: string;
  onTransactionDeleted: () => void;
}

export default function PaymentHistoryDrawer({
  budgetItemId,
  onTransactionDeleted,
}: PaymentHistoryDrawerProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      const data = await getTransactionsForItem(budgetItemId);
      setTransactions(data);
      setLoading(false);
    };

    loadTransactions();
  }, [budgetItemId]);

  const handleDelete = async (transactionId: string) => {
    if (!confirm('Delete this transaction?')) return;

    const success = await deleteTransaction(transactionId);
    if (success) {
      setTransactions(transactions.filter((t) => t.id !== transactionId));
      onTransactionDeleted();
    } else {
      alert('Failed to delete transaction');
    }
  };

  if (loading) {
    return <div className="payment-drawer">Loading...</div>;
  }

  if (transactions.length === 0) {
    return <div className="payment-drawer empty">No transactions yet</div>;
  }

  return (
    <div className="payment-drawer">
      <table className="payment-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Payee</th>
            <th>Note</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.date}</td>
              <td>
                <span className={`badge badge-${tx.type.toLowerCase()}`}>
                  {tx.type === 'PAID_CASH' ? 'Cash' : 'Loan Draw'}
                </span>
              </td>
              <td className="amount">{formatCurrency(tx.amount)}</td>
              <td>{tx.payee || '—'}</td>
              <td>{tx.note || '—'}</td>
              <td>
                <button
                  className="delete-tx-btn"
                  onClick={() => handleDelete(tx.id)}
                  title="Delete transaction"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
