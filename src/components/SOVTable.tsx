import { useState, useMemo } from 'react';
import type { BudgetItem } from '../types/budget';
import {
  updateBudgetItem,
  deleteBudgetItem,
  setActualPaid,
  toggleItemComplete,
} from '../lib/queries';
import { formatCurrency } from '../lib/utils';
import '../styles/SOVTable.css';
import LogPaymentModal from './LogPaymentModal';
import PaymentHistoryDrawer from './PaymentHistoryDrawer';
import AddItemModal from './AddItemModal';

interface SOVTableProps {
  items: BudgetItem[];
  onPaymentLogged: () => void;
}

export default function SOVTable({ items, onPaymentLogged }: SOVTableProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(
    new Set(new Set([...new Set(items.map((i) => i.phase))]))
  );
  const [expandedTransactionDrawers, setExpandedTransactionDrawers] = useState<
    Set<string>
  >(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<BudgetItem>>({});
  const [searchText, setSearchText] = useState('');
  const [fundingFilter, setFundingFilter] = useState<'ALL' | 'CASH' | 'FINANCE'>(
    'ALL'
  );
  const [phaseFilter, setPhaseFilter] = useState<string>('ALL');
  const [showCompleted, setShowCompleted] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const uniquePhases = useMemo(
    () => [...new Set(items.map((i) => i.phase))].sort(),
    [items]
  );

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Text search
      const searchLower = searchText.toLowerCase();
      const matchesSearch =
        !searchText ||
        item.action_name.toLowerCase().includes(searchLower) ||
        (item.contractor?.toLowerCase().includes(searchLower) || false) ||
        (item.notes?.toLowerCase().includes(searchLower) || false);

      // Funding filter
      const matchesFunding =
        fundingFilter === 'ALL' || item.funding_type === fundingFilter;

      // Phase filter
      const matchesPhase = phaseFilter === 'ALL' || item.phase === phaseFilter;

      // Completed filter
      const matchesCompleted = showCompleted || !item.is_completed;

      return matchesSearch && matchesFunding && matchesPhase && matchesCompleted;
    });
  }, [items, searchText, fundingFilter, phaseFilter, showCompleted]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, BudgetItem[]> = {};
    filteredItems.forEach((item) => {
      if (!groups[item.phase]) {
        groups[item.phase] = [];
      }
      groups[item.phase].push(item);
    });

    return Object.fromEntries(
      Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
    );
  }, [filteredItems]);

  const togglePhase = (phase: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phase)) {
      newExpanded.delete(phase);
    } else {
      newExpanded.add(phase);
    }
    setExpandedPhases(newExpanded);
  };

  const toggleTransactionDrawer = (itemId: string) => {
    const newDrawers = new Set(expandedTransactionDrawers);
    if (newDrawers.has(itemId)) {
      newDrawers.delete(itemId);
    } else {
      newDrawers.add(itemId);
    }
    setExpandedTransactionDrawers(newDrawers);
  };

  const handleEdit = (item: BudgetItem) => {
    setEditingId(item.id);
    setEditValues(item);
  };

  const handleSave = async () => {
    if (!editingId) return;
    try {
      const item = items.find((i) => i.id === editingId);

      if (editValues.actual_paid !== undefined && item) {
        await setActualPaid(editingId, editValues.actual_paid, item.funding_type);
      }

      const { actual_paid, ...otherUpdates } = editValues;
      if (Object.keys(otherUpdates).length > 0) {
        await updateBudgetItem(editingId, otherUpdates);
      }

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

  const handleToggleComplete = async (id: string, isCompleted: boolean) => {
    try {
      await toggleItemComplete(id, !isCompleted);
      onPaymentLogged();
    } catch (err) {
      console.error('Failed to toggle complete:', err);
    }
  };

  // Calculate totals for visible items
  const totals = useMemo(() => {
    const estimated = filteredItems.reduce((sum, i) => sum + i.estimated_cost, 0);
    const actual = filteredItems.reduce((sum, i) => sum + (i.actual_paid || 0), 0);
    return {
      estimated,
      actual,
      variance: actual - estimated,
    };
  }, [filteredItems]);

  return (
    <>
      <div className="sov-table-wrapper">
        <div className="sov-header">
          <div>
            <h2>Schedule of Values (SOV)</h2>
          </div>
          <button
            className="btn-add-item"
            onClick={() => setShowAddModal(true)}
          >
            ＋ Add Item
          </button>
        </div>

        <div className="search-filter-bar">
          <input
            type="text"
            placeholder="Search by description, contractor, or notes..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="search-input"
          />

          <select
            value={fundingFilter}
            onChange={(e) =>
              setFundingFilter(e.target.value as 'ALL' | 'CASH' | 'FINANCE')
            }
            className="filter-select"
          >
            <option value="ALL">All Funding</option>
            <option value="CASH">Cash Equity</option>
            <option value="FINANCE">Construction Loan</option>
          </select>

          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Phases</option>
            {uniquePhases.map((phase) => (
              <option key={phase} value={phase}>
                {phase}
              </option>
            ))}
          </select>

          <label className="toggle-completed">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
            />
            Show Completed
          </label>
        </div>

        <table className="sov-table">
          <thead>
            <tr>
              <th>Phase</th>
              <th>#</th>
              <th>Action / Description</th>
              <th>Contractor</th>
              <th>Funding</th>
              <th>Estimated</th>
              <th>Actual Paid</th>
              <th>Variance</th>
              <th>Progress</th>
              <th>Done</th>
              <th>Target Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedItems).map(([phase, phaseItems]) => {
              const isPhaseExpanded = expandedPhases.has(phase);
              const phaseEstimated = phaseItems.reduce(
                (sum, i) => sum + i.estimated_cost,
                0
              );
              const phaseActual = phaseItems.reduce(
                (sum, i) => sum + (i.actual_paid || 0),
                0
              );
              const phaseVariance = phaseActual - phaseEstimated;
              const phasePercent =
                phaseEstimated > 0 ? (phaseActual / phaseEstimated) * 100 : 0;
              const allPhaseItemsComplete = phaseItems.every(
                (i) => i.is_completed
              );

              return (
                <>
                  <tr className="group-row" onClick={() => togglePhase(phase)}>
                    <td className="group-cell">
                      <span className="expander">
                        {isPhaseExpanded ? '▼' : '▶'}
                      </span>
                      {phase}
                    </td>
                    <td colSpan={2} style={{ textAlign: 'center' }}>
                      {phaseItems.length} items
                    </td>
                    <td />
                    <td />
                    <td>{formatCurrency(phaseEstimated)}</td>
                    <td>{formatCurrency(phaseActual)}</td>
                    <td
                      className={
                        phaseVariance > 0 ? 'variance-over' : 'variance-under'
                      }
                    >
                      {formatCurrency(phaseVariance)}
                      {phaseVariance > 0 && (
                        <span className="overrun-indicator" title="Over budget">
                          🔴
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="progress-bar-container">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${Math.min(phasePercent, 100)}%`,
                          }}
                        />
                        <span className="progress-text">
                          {phasePercent.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {allPhaseItemsComplete && '✓'}
                    </td>
                    <td />
                    <td />
                  </tr>

                  {isPhaseExpanded &&
                    phaseItems.map((item) => {
                      const isEditing = editingId === item.id;
                      const actual = item.actual_paid || 0;
                      const variance = actual - item.estimated_cost;
                      const percent =
                        item.estimated_cost > 0
                          ? (actual / item.estimated_cost) * 100
                          : 0;
                      const hasTransactionDrawer =
                        expandedTransactionDrawers.has(item.id);

                      return (
                        <tr
                          key={item.id}
                          className={item.is_completed ? 'row-completed' : ''}
                        >
                          <td />
                          <td>{item.process_number}</td>
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
                              <span
                                className={
                                  item.is_completed ? 'strikethrough' : ''
                                }
                              >
                                {item.action_name}
                              </span>
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editValues.contractor || ''}
                                onChange={(e) =>
                                  setEditValues({
                                    ...editValues,
                                    contractor: e.target.value,
                                  })
                                }
                                className="edit-input"
                              />
                            ) : (
                              item.contractor || '—'
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <select
                                value={editValues.funding_type || 'CASH'}
                                onChange={(e) =>
                                  setEditValues({
                                    ...editValues,
                                    funding_type: e.target.value as
                                      | 'CASH'
                                      | 'FINANCE',
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
                          <td>
                            {isEditing ? (
                              <input
                                type="number"
                                value={editValues.actual_paid || ''}
                                onChange={(e) =>
                                  setEditValues({
                                    ...editValues,
                                    actual_paid: parseFloat(e.target.value),
                                  })
                                }
                                className="edit-input"
                              />
                            ) : (
                              formatCurrency(actual)
                            )}
                          </td>
                          <td
                            className={
                              variance > 0 ? 'variance-over' : 'variance-under'
                            }
                          >
                            {formatCurrency(variance)}
                          </td>
                          <td>
                            <div className="progress-bar-container">
                              <div
                                className="progress-bar-fill"
                                style={{
                                  width: `${Math.min(percent, 100)}%`,
                                }}
                              />
                              <span className="progress-text">
                                {percent.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {isEditing ? (
                              <input
                                type="checkbox"
                                checked={editValues.is_completed || false}
                                onChange={(e) =>
                                  setEditValues({
                                    ...editValues,
                                    is_completed: e.target.checked,
                                  })
                                }
                                className="checkbox"
                              />
                            ) : (
                              <input
                                type="checkbox"
                                checked={item.is_completed}
                                onChange={() =>
                                  handleToggleComplete(item.id, item.is_completed)
                                }
                                className="checkbox"
                              />
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <input
                                type="date"
                                value={editValues.target_date || ''}
                                onChange={(e) =>
                                  setEditValues({
                                    ...editValues,
                                    target_date: e.target.value,
                                  })
                                }
                                className="edit-input"
                              />
                            ) : (
                              item.target_date || '—'
                            )}
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
                                    className="action-button expand-btn"
                                    onClick={() =>
                                      toggleTransactionDrawer(item.id)
                                    }
                                    title="Show transaction history"
                                  >
                                    {hasTransactionDrawer ? '▲' : '▼'}
                                  </button>
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

                  {isPhaseExpanded &&
                    phaseItems.map((item) => {
                      if (!expandedTransactionDrawers.has(item.id)) return null;
                      return (
                        <tr key={`drawer-${item.id}`} className="drawer-row">
                          <td colSpan={12}>
                            <PaymentHistoryDrawer
                              budgetItemId={item.id}
                              onTransactionDeleted={onPaymentLogged}
                            />
                          </td>
                        </tr>
                      );
                    })}
                </>
              );
            })}

            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={12} style={{ textAlign: 'center', padding: '20px' }}>
                  No items match your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="totals-row sticky">
          <div className="totals-label">Totals (Visible)</div>
          <div className="totals-values">
            <div className="total-cell">
              <span className="total-label">Estimated:</span>
              <span className="total-value">
                {formatCurrency(totals.estimated)}
              </span>
            </div>
            <div className="total-cell">
              <span className="total-label">Actual:</span>
              <span className="total-value">
                {formatCurrency(totals.actual)}
              </span>
            </div>
            <div className="total-cell">
              <span className="total-label">Variance:</span>
              <span
                className={`total-value ${
                  totals.variance > 0 ? 'variance-over' : 'variance-under'
                }`}
              >
                {formatCurrency(totals.variance)}
              </span>
            </div>
          </div>
        </div>
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

      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onSubmit={() => {
            setShowAddModal(false);
            onPaymentLogged();
          }}
          existingPhases={uniquePhases}
        />
      )}
    </>
  );
}
