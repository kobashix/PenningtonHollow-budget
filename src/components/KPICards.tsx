import type { DashboardMetrics } from '../types/budget';
import { formatCurrency } from '../lib/utils';
import '../styles/KPICards.css';

interface KPICardsProps {
  metrics: DashboardMetrics;
}

export default function KPICards({ metrics }: KPICardsProps) {
  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <div className="kpi-label">Total Project Budget</div>
        <div className="kpi-value">{formatCurrency(metrics.totalEstimated)}</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-label">Project % Complete</div>
        <div className="kpi-value">{metrics.percentComplete.toFixed(1)}%</div>
        <div className="kpi-detail">
          {formatCurrency(metrics.totalActual)} spent
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-label">Cash Equity</div>
        <div className="kpi-detail">
          Allocated: {formatCurrency(metrics.cashAllocated)}
        </div>
        <div className="kpi-detail">
          Spent: {formatCurrency(metrics.cashSpent)}
        </div>
        <div className="kpi-value cash">
          {formatCurrency(metrics.cashRemaining)} remaining
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-label">Loan Financing</div>
        <div className="kpi-detail">
          Allocated: {formatCurrency(metrics.financeAllocated)}
        </div>
        <div className="kpi-detail">
          Drawn: {formatCurrency(metrics.financeDrawn)}
        </div>
        <div className="kpi-value finance">
          {formatCurrency(metrics.financeRemaining)} remaining
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-label">Items Complete</div>
        <div className="kpi-value">{metrics.itemsComplete} / 26</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-label">Phases Complete</div>
        <div className="kpi-value">{metrics.phasesComplete} / 6</div>
      </div>
    </div>
  );
}
