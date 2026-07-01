import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/stats/overview`)
      .then((res) => {
        if (!res.ok) throw new Error(`API error ${res.status}`);
        return res.json();
      })
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="panel"><p className="error">{error}</p></div>;
  if (!stats) return <div className="panel"><p className="muted">Loading...</p></div>;

  const churnByContractPct = stats.churn_by_contract.map((r) => ({
    contract: r.contract,
    churn_rate: Math.round(r.churn_rate * 1000) / 10,
  }));

  return (
    <div className="panel">
      <h2>Overview</h2>
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="label">Total Customers</div>
          <div className="kpi-value">{stats.total_customers.toLocaleString()}</div>
        </div>
        <div className="kpi-card">
          <div className="label">Churn Rate</div>
          <div className="kpi-value">{(stats.churn_rate * 100).toFixed(1)}%</div>
        </div>
        <div className="kpi-card">
          <div className="label">Avg Monthly Charges</div>
          <div className="kpi-value">${stats.avg_monthly_charges.toFixed(2)}</div>
        </div>
        <div className="kpi-card">
          <div className="label">Avg Tenure</div>
          <div className="kpi-value">{stats.avg_tenure.toFixed(1)} mo</div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-box">
          <h3>Churn rate by contract</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={churnByContractPct}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="contract" />
              <YAxis unit="%" />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="churn_rate" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h3>Tenure distribution (months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.tenure_distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bucket" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box chart-box-wide">
          <h3>Monthly charges distribution ($)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.monthly_charges_distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bucket" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#d97706" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
