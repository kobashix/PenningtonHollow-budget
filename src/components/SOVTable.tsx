import { useState } from 'react';
import type { BudgetItem } from '../types/budget';
import { updateBudgetItem, deleteBudgetItem } from '../lib/queries';
import '../styles/SOVTable.css';
import LogPaymentModal from './LogPaymentModal';

interface SOVTableProps {
  items: BudgetItem[];
  onPaymentLogged: () => void;
}

export default function SOVTable({ items, onPaymentLogged }: SOVTableProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<BudgetItem>>({});

  const handleEdit = (item: BudgetItem) => {
    setEditingId(item.id);
    setEditValues(item);
  };

  const handleSave = async () => {
    if (!editingId) return;
    try {
      await updateBudgetItem(editingId, editValues);
      setEditingId(null);
      onPaymentLogged();
    } catch (err) {
      console.error('Failed to save:', err);
      alert('Failed to save changes');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      await deleteBudgetItem(id);
      onPaymentLogged();
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Failed to delete item');
    }
  };

  const groupedByPhase = items.reduce(
    (acc, item) => {
      if (!acc[item.phase]) {
        acc[item.phase] = [];
      }
      acc[item.phase].push(item);
      return acc;
    },
    {} as Record<string, BudgetItem[]>
  );

  return (
    <>
      <div className="sov-table-wrapper">
        <h2>Schedule of Values (SOV)</h2>
        <table className="sov-table">
          <thead>
            <tr>
              <th>Phase</th>
              <th>#</th>
              <th>Action / Description</th>
              <th>Funding</th>
              <th>Estimated</th>
              <th>Actual Paid</th>
              <th>Variance</th>
              <th>Progress</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedByPhase).map(([phase]) => (
              <tr key={phase} className="group-row">
                <td colSpan={9} className="group-cell">
                  <strong>{phase}</strong>
                </td>
              </tr>
            ))}
            {items.map((item) => {
              const isEditing = editingId === item.id;
              const actual = item.actual_paid || 0;
              const variance = actual - item.estimated_cost;
              const percent =
                item.estimated_cost > 0
                  ? (actual / item.estimated_cost) * 100
                  : 0;

              return (
                <tr key={item.id}>
                  <td>{item.phase}</td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editValues.process_number || ''}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            process_number: parseInt(e.target.value),
                          })
                        }
                        className="edit-input"
                      />
                    ) : (
                      item.process_number
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editValues.action_name || ''}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            action_name: e.target.value,
                          })
                        }
                        className="edit-input"
                      />
                    ) : (
                      item.action_name
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <select
                        value={editValues.funding_type || 'CASH'}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            funding_type: e.target.value as 'CASH' | 'FINANCE',
                          })
                        }
                        className="edit-input"
                      >
                        <option value="CASH">CASH</option>
                        <option value="FINANCE">FINANCE</option>
                      </select>
                    ) : (
                      <span
                        className={`badge badge-${item.funding_type.toLowerCase()}`}
                      >
                        {item.funding_type}
                      </span>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editValues.estimated_cost || ''}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            estimated_cost: parseFloat(e.target.value),
                          })
                        }
                        className="edit-input"
                      />
                    ) : (
                      formatCurrency(item.estimated_cost)
                    )}
                  </td>
                  <td>{formatCurrency(actual)}</td>
                  <td>
                    <span
                      className={
                        variance > 0 ? 'variance-over' : 'variance-under'
                      }
                    >
                      {formatCurrency(variance)}
                    </span>
                  </td>
                  <td>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                      <span className="progress-text">
                        {percent.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {isEditing ? (
                        <>
                          <button
                            className="action-button save-btn"
                            onClick={handleSave}
                          >
                            Save
                          </button>
                          <button
                            className="action-button cancel-btn"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="action-button edit-btn"
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </button>
                          <button
                            className="action-button log-btn"
                            onClick={() => setSelectedItemId(item.id)}
                          >
                            Log
                          </button>
                          <button
                            className="action-button delete-btn"
                            onClick={() => handleDelete(item.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedItemId && (
        <LogPaymentModal
          itemId={selectedItemId}
          onClose={() => setSelectedItemId(null)}
          onSubmit={() => {
            setSelectedItemId(null);
            onPaymentLogged();
          }}
        />
      )}
    </>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);
}
