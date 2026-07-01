const NAV_ITEMS = [
  {
    key: "overview",
    label: "Overview",
    icon: (
      <path d="M2 12h3l2.5-7 4 14 2.5-10 2 3h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    key: "churn",
    label: "Churn Predictor",
    icon: (
      <>
        <circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.7" />
        <path d="M4 18c0-4 3-6.5 6-6.5s6 2.5 6 6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </>
    ),
  },
  {
    key: "charges",
    label: "Charges Predictor",
    icon: (
      <>
        <path d="M3 9l6-6h7a1 1 0 011 1v7l-6 6a1.2 1.2 0 01-1.7 0L3 10.7a1.2 1.2 0 010-1.7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="13.5" cy="6.5" r="1.3" fill="currentColor" />
      </>
    ),
  },
  {
    key: "leaderboard",
    label: "Model Leaderboard",
    icon: (
      <>
        <rect x="3" y="11" width="3.2" height="6" rx="1" fill="currentColor" />
        <rect x="8.4" y="6" width="3.2" height="11" rx="1" fill="currentColor" />
        <rect x="13.8" y="2" width="3.2" height="15" rx="1" fill="currentColor" />
      </>
    ),
  },
];

export default function Sidebar({ active, onSelect }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-mark">
          <svg width="17" height="15" viewBox="0 0 18 16">
            <rect x="0" y="9" width="3" height="7" rx="1" fill="currentColor" />
            <rect x="5" y="6" width="3" height="10" rx="1" fill="currentColor" />
            <rect x="10" y="3" width="3" height="13" rx="1" fill="currentColor" />
            <rect x="15" y="0" width="3" height="16" rx="1" fill="currentColor" />
          </svg>
        </div>
        <span className="sidebar-title">Telco Insights</span>
      </div>

      <div className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            data-key={item.key}
            className={active === item.key ? "sidebar-item active" : "sidebar-item"}
            onClick={() => onSelect(item.key)}
          >
            <span className="sidebar-item-icon">
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                {item.icon}
              </svg>
            </span>
            <span className="sidebar-item-label">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        Telco Customer Churn dataset
        <br />
        7,043 records
      </div>
    </nav>
  );
}
