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
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('action_name', {
        header: 'Action / Description',
      }),
      columnHelper.display({
        id: 'phase',
        header: 'Phase',
        cell: (info) => info.row.original.phase,
      }),
      columnHelper.display({
        id: 'funding_type',
        header: 'Funding',
        cell: (info) => {
          const type = info.row.original.funding_type;
          return (
            <span className={`badge badge-${type.toLowerCase()}`}>
              {type}
            </span>
          );
        },
      }),
      columnHelper.accessor('estimated_cost', {
        header: 'Estimated',
        cell: (info) => formatCurrency(info.getValue()),
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
        id: 'completed',
        header: 'Done',
        cell: (info) => (
          <input
            type="checkbox"
            checked={info.row.original.is_completed}
            onChange={() => {
              onPaymentLogged();
            }}
            className="checkbox"
          />
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Log Payment',
        cell: (info) => (
          <button
            className="action-button"
            onClick={() => setSelectedItemId(info.row.original.id)}
          >
            Log
          </button>
        ),
      }),
    ],
    [onPaymentLogged]
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
