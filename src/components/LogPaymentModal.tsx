import { useRef, useState } from 'react';
import { addTransaction } from '../lib/queries';
import type { TransactionType } from '../types/budget';
import '../styles/LogPaymentModal.css';

interface LogPaymentModalProps {
  itemId: string;
  onClose: () => void;
  onSubmit: () => void;
}

export default function LogPaymentModal({
  itemId,
  onClose,
  onSubmit,
}: LogPaymentModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<TransactionType>('PAID_CASH');
  const [note, setNote] = useState('');
  const [payee, setPayee] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const result = await addTransaction(
        itemId,
        parseFloat(amount),
        type,
        note || undefined,
        date,
        payee || undefined
      );

      if (result) {
        setAmount('');
        setNote('');
        setPayee('');
        setDate(new Date().toISOString().split('T')[0]);
        setType('PAID_CASH');
        onSubmit();
        dialogRef.current?.close();
      } else {
        setError('Failed to log payment. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog ref={dialogRef} className="modal" open onClick={(e) => {
      if (e.target === dialogRef.current) onClose();
    }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Log Payment</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="amount">Amount *</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Payment Type *</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as TransactionType)}
              disabled={loading}
              required
            >
              <option value="PAID_CASH">Owner's Cash Equity</option>
              <option value="DRAWN_FROM_LOAN">Construction Loan Draw</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="payee">Payee (optional)</label>
            <input
              id="payee"
              type="text"
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              placeholder="e.g., Contractor name or vendor"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="note">Note (optional)</label>
            <input
              id="note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Invoice #ABC123, partial payment"
              disabled={loading}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Logging...' : 'Log Payment'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
