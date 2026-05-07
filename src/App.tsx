import { useState, useEffect } from 'react';
import './App.css';
import KPICards from './components/KPICards';
import CapitalCharts from './components/CapitalCharts';
import SOVTable from './components/SOVTable';
import {
  getDashboardMetrics,
  getBudgetItemsWithActuals,
} from './lib/queries';
import type { DashboardMetrics, BudgetItem } from './types/budget';

function App() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setError('');
      const [metricsData, itemsData] = await Promise.all([
        getDashboardMetrics(),
        getBudgetItemsWithActuals(),
      ]);
      setMetrics(metricsData);
      setItems(itemsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load dashboard data. Check your Supabase connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <h2>Loading dashboard...</h2>
          <p>Connecting to your project data.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error-container">
          <h2>⚠️ Connection Error</h2>
          <p>{error}</p>
          <button onClick={loadData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="app">
        <div className="error-container">
          <h2>No Data</h2>
          <p>Unable to load project metrics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🏗️ Pennington Hollow</h1>
          <p className="subtitle">Construction Budget & Project Management</p>
        </div>
      </header>

      <main className="app-main">
        <KPICards metrics={metrics} />
        <CapitalCharts metrics={metrics} items={items} />
        <SOVTable items={items} onPaymentLogged={loadData} />
      </main>

      <footer className="app-footer">
        <p>
          Last updated:{' '}
          {new Date().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </footer>
    </div>
  );
}

export default App;
