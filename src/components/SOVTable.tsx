import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import type { BudgetItem } from '../types/budget';
import { updateBudgetItem, deleteBudgetItem } from '../lib/queries';
import '../styles/SOVTable.css';
import LogPaymentModal from './LogPaymentModal';

interface SOVTableProps {
  items: BudgetItem[];
  onPaymentLogged: () => void;
}

const columnHelper = createColumnHelper<BudgetItem>();

export default function SOVTable({ items, onPaymentLogged }: SOVTableProps) {
  const [expanded, setExpanded] = useState({});
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

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'expander',
        header: '▶',
        cell: ({ row }) =>
          row.getCanExpand() ? (
            <button
              className="expander-button"
              onClick={row.getToggleExpandedHandler()}
            >
              {row.getIsExpanded() ? '▼' : '▶'}
            </button>
          ) : null,
      }),
      columnHelper.accessor('process_number', {
        id: 'number',
        header: '#',
        cell: (info) => {
          const item = info.row.original;
          const isEditing = editingId === item.id;
          return isEditing ? (
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
            info.getValue()
          );
        },
      }),
      columnHelper.accessor('action_name', {
        header: 'Action / Description',
        cell: (info) => {
          const item = info.row.original;
          const isEditing = editingId === item.id;
          return isEditing ? (
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
            info.getValue()
          );
        },
      }),
      columnHelper.display({
        id: 'phase',
        header: 'Phase',
        cell: (info) => {
          const item = info.row.original;
          const isEditing = editingId === item.id;
          return isEditing ? (
            <input
              type="text"
              value={editValues.phase || ''}
              onChange={(e) =>
                setEditValues({ ...editValues, phase: e.target.value })
              }
              className="edit-input"
            />
          ) : (
            item.phase
          );
        },
      }),
      columnHelper.display({
        id: 'funding_type',
        header: 'Funding',
        cell: (info) => {
          const item = info.row.original;
          const isEditing = editingId === item.id;
          return isEditing ? (
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
            <span className={`badge badge-${item.funding_type.toLowerCase()}`}>
              {item.funding_type}
            </span>
          );
        },
      }),
      columnHelper.accessor('estimated_cost', {
        header: 'Estimated',
        cell: (info) => {
          const item = info.row.original;
          const isEditing = editingId === item.id;
          return isEditing ? (
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
            formatCurrency(info.getValue())
          );
        },
      }),
      columnHelper.display({
        id: 'actual_paid',
        header: 'Actual Paid',
        cell: (info) => {
          const actual = info.row.original.actual_paid || 0;
          return formatCurrency(actual);
        },
      }),
      columnHelper.display({
        id: 'variance',
        header: 'Variance',
        cell: (info) => {
          const variance =
            (info.row.original.actual_paid || 0) -
            info.row.original.estimated_cost;
          const isOver = variance > 0;
          return (
            <span className={isOver ? 'variance-over' : 'variance-under'}>
              {formatCurrency(variance)}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'progress',
        header: 'Progress',
        cell: (info) => {
          const estimated = info.row.original.estimated_cost;
          const actual = info.row.original.actual_paid || 0;
          const percent = estimated > 0 ? (actual / estimated) * 100 : 0;
          return (
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
              <span className="progress-text">{percent.toFixed(0)}%</span>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const item = info.row.original;
          const isEditing = editingId === item.id;
          return (
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
          );
        },
      }),
    ],
    [editingId, editValues, onPaymentLogged]
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    state: {
      expanded,
      grouping: ['phase'],
    },
    onExpandedChange: setExpanded,
  });

  return (
    <>
      <div className="sov-table-wrapper">
        <h2>Schedule of Values (SOV)</h2>
        <table className="sov-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className={row.getIsGrouped() ? 'group-row' : ''}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={cell.getIsGrouped() ? 'group-cell' : ''}>
                    {cell.getIsGrouped() ? (
                      <strong>{cell.renderValue() as React.ReactNode}</strong>
                    ) : cell.getIsAggregated() ? null : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                  </td>
                ))}
              </tr>
            ))}
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
