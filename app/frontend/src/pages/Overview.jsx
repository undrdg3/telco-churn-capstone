import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function MiniBars({ values, color }) {
  const max = Math.max(...values, 1);
  return (
    <div className="mini-bars">
      {values.map((v, i) => (
        <div
          key={i}
          className="mini-bar"
          style={{ height: `${Math.max(8, (v / max) * 100)}%`, background: color }}
        />
      ))}
    </div>
  );
}

function KpiCard({ label, value, hero, contextLabel, contextValues, barColor }) {
  return (
    <div className={hero ? "glass-card kpi-card hero" : "glass-card kpi-card"}>
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
      </div>
      <div className="kpi-value">{value}</div>
      {contextValues && (
        <>
          <div className="kpi-context-label">{contextLabel}</div>
          <MiniBars values={contextValues} color={hero ? "rgba(255,255,255,0.85)" : barColor} />
        </>
      )}
    </div>
  );
}

function BarChartCard({ title, subtitle, bars, accent, wide }) {
  const max = Math.max(...bars.map((b) => b.value), 1);
  return (
    <div className={wide ? "glass-card chart-card-wide" : "glass-card"}>
      <h3 className="chart-title">{title}</h3>
      <p className="chart-subtitle">{subtitle}</p>
      <div className="bars-row">
        {bars.map((b) => (
          <div key={b.label} className="bar-col">
            <div className="bar-tooltip">{b.tooltip}</div>
            <div
              className="bar-fill"
              style={{ height: `${Math.max(4, (b.value / max) * 100)}%`, background: accent }}
            />
          </div>
        ))}
      </div>
      <div className="bar-labels">
        {bars.map((b) => (
          <div key={b.label} className="bar-label">{b.label}</div>
        ))}
      </div>
    </div>
  );
}

function RevenueAtRiskCard({ revenue }) {
  return (
    <div className="glass-card revenue-card">
      <div className="revenue-label">Revenue at risk</div>
      <div className="revenue-amount">
        ${revenue.monthly_amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
      </div>
      <div className="revenue-note">
        {(revenue.pct_of_revenue * 100).toFixed(1)}% of total monthly billing (${revenue.total_monthly_revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })})
        {" "}is tied to the {revenue.churned_customers.toLocaleString()} customers who have already churned.
      </div>
    </div>
  );
}

function RecommendationsCard() {
  const items = [
    "Target month-to-month customers in their first 12 months first — this segment drives the bulk of churn (42.7% vs. 11.3% for one-year contracts).",
    "Prioritize customers paying by electronic check — churn runs ~45% there vs. 15-17% for automatic payment methods, the largest lever after contract type.",
    "The single riskiest segment (month-to-month + fiber optic + electronic check) churns above 60% — a targeted retention offer here protects revenue fastest.",
  ];
  return (
    <div className="glass-card recommendations-card">
      <h3 className="chart-title">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ color: "#E8543A" }}>
          <path d="M10 3a4.5 4.5 0 00-4.5 4.5c0 3 1.5 4.5 1.5 4.5v2a1 1 0 001 1h4a1 1 0 001-1v-2s1.5-1.5 1.5-4.5A4.5 4.5 0 0010 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M8.5 17.5h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        Recommended actions
      </h3>
      <p className="chart-subtitle">Derived directly from the segment breakdowns above</p>
      <div className="recommendations-list">
        {items.map((text, i) => (
          <div key={i} className="recommendation-item">
            <div className="recommendation-num">{i + 1}</div>
            <div className="recommendation-text">{text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

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

  if (error) return <div className="glass-card"><p className="error">{error}</p></div>;
  if (!stats) return <div className="glass-card"><p className="muted">Loading...</p></div>;

  const churnByContractPct = stats.churn_by_contract.map((r) => ({
    label: r.contract,
    value: Math.round(r.churn_rate * 1000) / 10,
    tooltip: `${(r.churn_rate * 100).toFixed(1)}%`,
  }));

  const tenureBars = stats.tenure_distribution.map((r) => ({
    label: r.bucket,
    value: r.count,
    tooltip: `${r.count.toLocaleString()} customers`,
  }));

  const chargesBars = stats.monthly_charges_distribution.map((r) => ({
    label: `$${r.bucket}`,
    value: r.count,
    tooltip: `${r.count.toLocaleString()} customers`,
  }));

  const internetCounts = stats.customers_by_internet.map((r) => r.count);

  return (
    <>
      <div className="page-header">
        <h1>Overview</h1>
        <p>Customer base health, at a glance</p>
      </div>

      <div className="kpi-grid">
        <KpiCard
          label="Total Customers"
          value={stats.total_customers.toLocaleString()}
          contextLabel="by internet service"
          contextValues={internetCounts}
          barColor="#1F6F6B"
        />
        <KpiCard
          label="Churn Rate"
          value={`${(stats.churn_rate * 100).toFixed(1)}%`}
          hero
          contextLabel="by contract type"
          contextValues={stats.churn_by_contract.map((r) => r.churn_rate)}
        />
        <KpiCard
          label="Avg Monthly Charges"
          value={`$${stats.avg_monthly_charges.toFixed(2)}`}
          contextLabel="by bill amount"
          contextValues={stats.monthly_charges_distribution.map((r) => r.count)}
          barColor="#D69A3C"
        />
        <KpiCard
          label="Avg Tenure"
          value={`${stats.avg_tenure.toFixed(1)} mo`}
          contextLabel="by months on service"
          contextValues={stats.tenure_distribution.map((r) => r.count)}
          barColor="#E8543A"
        />
      </div>

      <div className="chart-grid">
        <BarChartCard
          title="Churn rate by contract"
          subtitle="% of customers who churned"
          bars={churnByContractPct}
          accent="linear-gradient(180deg, #E8543A 0%, #F2896F 100%)"
        />
        <BarChartCard
          title="Tenure distribution"
          subtitle="Customers by months on service"
          bars={tenureBars}
          accent="linear-gradient(180deg, #1F6F6B 0%, #4FA39D 100%)"
        />
        <BarChartCard
          title="Monthly charges distribution"
          subtitle="Customers by bill amount"
          bars={chargesBars}
          accent="linear-gradient(180deg, #D69A3C 0%, #E7BE77 100%)"
          wide
        />
      </div>

      <div className="overview-bottom-grid">
        <RevenueAtRiskCard revenue={stats.revenue_at_risk} />
        <RecommendationsCard />
      </div>
    </>
  );
}
