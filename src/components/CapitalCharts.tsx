import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { BudgetItem, DashboardMetrics } from '../types/budget';
import '../styles/CapitalCharts.css';

interface CapitalChartsProps {
  metrics: DashboardMetrics;
  items: BudgetItem[];
}

export default function CapitalCharts({ metrics, items }: CapitalChartsProps) {
  // Prepare cash allocation data
  const cashData = [
    {
      name: 'Spent',
      value: metrics.cashSpent,
    },
    {
      name: 'Remaining',
      value: metrics.cashRemaining,
    },
  ];

  // Prepare finance allocation data
  const financeData = [
    {
      name: 'Drawn',
      value: metrics.financeDrawn,
    },
    {
      name: 'Available',
      value: metrics.financeRemaining,
    },
  ];

  // Prepare budget vs actual by phase
  const phaseMap: Record<
    string,
    { estimated: number; actual: number; phase: string }
  > = {};

  items.forEach((item) => {
    const key = item.phase;
    if (!phaseMap[key]) {
      phaseMap[key] = { phase: key, estimated: 0, actual: 0 };
    }
    phaseMap[key].estimated += item.estimated_cost;
    phaseMap[key].actual += item.actual_paid || 0;
  });

  const phaseData = Object.values(phaseMap).sort(
    (a, b) => a.phase.localeCompare(b.phase)
  );

  const formatCurrency = (value: number) => {
    return '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  return (
    <div className="charts-container">
      <div className="chart-wrapper">
        <h3>Cash Equity Allocation</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={cashData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
            >
              <Cell fill="#16a34a" />
              <Cell fill="#dcfce7" />
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-wrapper">
        <h3>Loan Financing Allocation</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={financeData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
            >
              <Cell fill="#2563eb" />
              <Cell fill="#dbeafe" />
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-full">
        <h3>Budget vs Actual Spend by Phase</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={phaseData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="phase"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
            <Legend />
            <Bar dataKey="estimated" fill="#aa3bff" name="Estimated Budget" />
            <Bar dataKey="actual" fill="#16a34a" name="Actual Spend" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
