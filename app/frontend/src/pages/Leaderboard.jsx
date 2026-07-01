import leaderboard from "../leaderboard.json";

function Board({ title, metricLabel, rows, columns, metricKey, winner, winnerReason, fmt }) {
  const max = Math.max(...rows.map((r) => r[metricKey]));

  return (
    <div>
      <h2 className="board-title">{title}</h2>

      <div className="glass-card board-bars-card">
        <p className="board-metric-label">{metricLabel}</p>
        <div className="board-bar-rows">
          {rows.map((r) => {
            const isWinner = r.model === winner;
            return (
              <div key={r.model} className="board-bar-row">
                <div className="board-bar-name" style={{ fontWeight: isWinner ? 600 : 400 }}>{r.model}</div>
                <div className="board-bar-track">
                  <div
                    className="board-bar-fill"
                    style={{
                      width: `${Math.max(3, (r[metricKey] / max) * 100)}%`,
                      background: isWinner ? "#1F6F6B" : "#C9C2AE",
                    }}
                  />
                </div>
                <div className="board-bar-value">{fmt(r[metricKey])}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card board-table-card">
        <table>
          <thead>
            <tr>
              {columns.map((c) => <th key={c}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const isWinner = r.model === winner;
              return (
                <tr key={r.model} className={isWinner ? "winner-row" : ""}>
                  <td className="model-name" style={{ fontWeight: isWinner ? 700 : 400 }}>
                    {r.model}
                    {isWinner && (
                      <span className="winner-tag">
                        <svg width="9" height="8" viewBox="0 0 18 16" style={{ flex: "none" }}>
                          <rect x="0" y="9" width="3" height="7" rx="1" fill="currentColor" />
                          <rect x="5" y="6" width="3" height="10" rx="1" fill="currentColor" />
                          <rect x="10" y="3" width="3" height="13" rx="1" fill="currentColor" />
                          <rect x="15" y="0" width="3" height="16" rx="1" fill="currentColor" />
                        </svg>
                        Winner
                      </span>
                    )}
                  </td>
                  {columns.slice(1).map((c) => (
                    <td key={c} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{r[c.toLowerCase().replace(/[^a-z0-9]/g, "_")] ?? r[colKeyMap[c]]}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="muted" style={{ marginTop: "10px", fontSize: "13.5px" }}>
        <strong style={{ color: "#1B2521" }}>{winner}</strong> wins — {winnerReason}
      </p>
    </div>
  );
}

const colKeyMap = {
  "Accuracy": "accuracy",
  "Precision": "precision",
  "Recall": "recall",
  "F1": "f1",
  "ROC-AUC": "roc_auc",
  "R²": "r2",
  "MAE": "mae",
  "RMSE": "rmse",
};

export default function Leaderboard() {
  const { classification, regression } = leaderboard;

  return (
    <>
      <div className="page-header">
        <h1>Model leaderboard (test set)</h1>
        <p>Candidate models compared head-to-head on held-out data</p>
      </div>

      <div className="board-section">
        <Board
          title={`Classification — ${classification.target}`}
          metricLabel="ROC-AUC"
          rows={classification.rows}
          columns={["Model", "Accuracy", "Precision", "Recall", "F1", "ROC-AUC"]}
          metricKey="roc_auc"
          winner={classification.winner}
          winnerReason={classification.winner_reason}
          fmt={(v) => v.toFixed(3)}
        />
        <Board
          title={`Regression — ${regression.target}`}
          metricLabel="R²"
          rows={regression.rows}
          columns={["Model", "R²", "MAE", "RMSE"]}
          metricKey="r2"
          winner={regression.winner}
          winnerReason={regression.winner_reason}
          fmt={(v) => v.toFixed(3)}
        />
      </div>
    </>
  );
}
