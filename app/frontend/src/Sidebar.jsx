const NAV_ITEMS = [
  { key: "overview", label: "Overview", icon: "📊" },
  { key: "churn", label: "Churn Predictor", icon: "👤" },
  { key: "charges", label: "Charges Predictor", icon: "💵" },
  { key: "leaderboard", label: "Model Leaderboard", icon: "🏆" },
];

export default function Sidebar({ active, onSelect }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-title">Telco Insights</div>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.key}
          data-key={item.key}
          className={active === item.key ? "sidebar-item active" : "sidebar-item"}
          onClick={() => onSelect(item.key)}
        >
          <span>{item.icon}</span> {item.label}
        </button>
      ))}
    </nav>
  );
}
