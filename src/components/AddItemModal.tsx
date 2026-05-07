import { useRef, useState } from 'react';
import { createBudgetItem } from '../lib/queries';
import type { BudgetItem, FundingType } from '../types/budget';
import '../styles/AddItemModal.css';

interface AddItemModalProps {
  onClose: () => void;
  onSubmit: () => void;
  existingPhases: string[];
}

export default function AddItemModal({
  onClose,
  onSubmit,
  existingPhases,
}: AddItemModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [description, setDescription] = useState('');
  const [phase, setPhase] = useState(existingPhases[0] || '');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [fundingType, setFundingType] = useState<FundingType>('CASH');
  const [contractor, setContractor] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    if (!phase.trim()) {
      setError('Phase is required');
      return;
    }

    if (!estimatedCost || parseFloat(estimatedCost) <= 0) {
      setError('Please enter a valid estimated cost');
      return;
    }

    setLoading(true);
    try {
      // Get the next process number
      const maxProcessNumber = 26; // You may want to pass this as a prop
      const newItem: Omit<BudgetItem, 'id' | 'created_at' | 'actual_paid'> = {
        project_id: '550e8400-e29b-41d4-a716-446655440000',
        process_number: maxProcessNumber + 1,
        action_name: description,
        phase: phase,
        estimated_cost: parseFloat(estimatedCost),
        funding_type: fundingType,
        target_date: targetDate || null,
        is_completed: false,
        contractor: contractor || undefined,
        notes: notes || undefined,
      };

      const result = await createBudgetItem(newItem);

      if (result) {
        setDescription('');
        setPhase(existingPhases[0] || '');
        setEstimatedCost('');
        setFundingType('CASH');
        setContractor('');
        setTargetDate('');
        setNotes('');
        onSubmit();
        dialogRef.current?.close();
      } else {
        setError('Failed to create item. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      open
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Budget Item</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Framing labor"
              disabled={loading}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phase">Phase *</label>
              <select
                id="phase"
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                disabled={loading}
                required
              >
                {existingPhases.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="estimatedCost">Estimated Cost *</label>
              <input
                id="estimatedCost"
                type="number"
                step="0.01"
                min="0"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="0.00"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fundingType">Funding Type *</label>
              <select
                id="fundingType"
                value={fundingType}
                onChange={(e) => setFundingType(e.target.value as FundingType)}
                disabled={loading}
                required
              >
                <option value="CASH">Owner's Cash Equity</option>
                <option value="FINANCE">Construction Loan</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="targetDate">Target Date</label>
              <input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="contractor">Contractor</label>
            <input
              id="contractor"
              type="text"
              value={contractor}
              onChange={(e) => setContractor(e.target.value)}
              placeholder="e.g., ABC Framing Inc."
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes or specifications"
              disabled={loading}
              rows={3}
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
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
