import leaderboard from "../leaderboard.json";

export default function Leaderboard() {
  const { classification, regression } = leaderboard;
  return (
    <div className="panel">
      <h2>Model leaderboard (test set)</h2>

      <h3>Classification — {classification.target}</h3>
      <p className="muted">{classification.metric_note}</p>
      <table>
        <thead>
          <tr>
            <th>Model</th><th>Accuracy</th><th>Precision</th><th>Recall</th><th>F1</th><th>ROC-AUC</th>
          </tr>
        </thead>
        <tbody>
          {classification.rows.map((r) => (
            <tr key={r.model} className={r.model === classification.winner ? "winner" : ""}>
              <td>{r.model}</td><td>{r.accuracy}</td><td>{r.precision}</td>
              <td>{r.recall}</td><td>{r.f1}</td><td>{r.roc_auc}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="note">
        <strong>{classification.winner}</strong> wins — {classification.winner_reason}
      </p>

      <h3>Regression — {regression.target}</h3>
      <p className="muted">{regression.metric_note}</p>
      <table>
        <thead>
          <tr><th>Model</th><th>R²</th><th>MAE</th><th>RMSE</th></tr>
        </thead>
        <tbody>
          {regression.rows.map((r) => (
            <tr key={r.model} className={r.model === regression.winner ? "winner" : ""}>
              <td>{r.model}</td><td>{r.r2}</td><td>{r.mae}</td><td>{r.rmse}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="note">
        <strong>{regression.winner}</strong> wins — {regression.winner_reason}
      </p>
    </div>
  );
}
