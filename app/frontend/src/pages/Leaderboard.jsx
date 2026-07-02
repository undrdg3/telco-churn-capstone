import leaderboard from "../leaderboard.json";

function OverfittingDisclaimer() {
  return (
    <div className="glass-card disclaimer-card">
      <p className="disclaimer-title">
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none" style={{ flex: "none" }}>
          <path d="M10 2 L18 17 H2 Z" stroke="#D69A3C" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M10 8v4" stroke="#D69A3C" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="10" cy="14.5" r="0.9" fill="#D69A3C" />
        </svg>
        Why is R² this high — and is it overfitting?
      </p>
      <p className="disclaimer-body">
        No. A near-perfect R² is a fair reason for suspicion, so we checked it four ways instead
        of just trusting it: <strong>train / validation / test R² are all ≈0.999 with no gap</strong> (overfitting
        means train performance is much higher than held-out — that gap doesn't exist here);
        <strong> 5-fold cross-validation</strong> gives the same score every time; a <strong>permutation
        test</strong> (shuffling the target and refitting) collapses R² to ~0.03, ruling out a leak or
        bug; and Ridge's own coefficients recover a clean, human-readable <strong>price list</strong> per
        service. The real explanation: this telecom's billing is close to a fixed rate card —
        within an identical service plan, bills vary by ~$1 on average — so the task is closer to
        "reverse-engineer a price list" than "predict a noisy outcome." That's why we use this
        model as a <strong>pricing sanity check</strong>, not evidence of a hard prediction problem solved.
      </p>
    </div>
  );
}

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
        <OverfittingDisclaimer />
      </div>
    </>
  );
}
