import type { BudgetItem } from '../types/budget';

export function exportToCSV(items: BudgetItem[]): void {
  const headers = [
    '#',
    'Phase',
    'Description',
    'Contractor',
    'Funding',
    'Estimated',
    'Actual',
    'Variance',
    '%',
    'Target Date',
    'Notes',
    'Done',
  ];

  const rows = items.map((item) => {
    const actual = item.actual_paid || 0;
    const variance = actual - item.estimated_cost;
    const percent =
      item.estimated_cost > 0 ? (actual / item.estimated_cost) * 100 : 0;

    return [
      item.process_number.toString(),
      item.phase,
      item.action_name,
      item.contractor || '',
      item.funding_type,
      item.estimated_cost.toString(),
      actual.toString(),
      variance.toString(),
      percent.toFixed(1),
      item.target_date || '',
      item.notes || '',
      item.is_completed ? 'Yes' : 'No',
    ];
  });

  const csvContent = [
    headers.map((h) => `"${h}"`).join(','),
    ...rows.map((r) => r.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `pennington_hollow_budget_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printDashboard(): void {
  window.print();
}
