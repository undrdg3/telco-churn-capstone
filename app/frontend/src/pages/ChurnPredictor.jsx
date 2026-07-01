import { useState } from "react";
import CustomerForm from "../CustomerForm";
import { sectionsWithChurnBilling, DEFAULT_VALUES } from "../fields";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const SECTIONS = sectionsWithChurnBilling();
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * 60;

function riskBand(probability) {
  const pct = probability * 100;
  if (pct >= 60) return { label: "High risk", color: "#E8543A", badgeBg: "rgba(232,84,58,0.12)" };
  if (pct >= 30) return { label: "Medium risk", color: "#D69A3C", badgeBg: "rgba(214,154,60,0.14)" };
  return { label: "Low risk", color: "#1F6F6B", badgeBg: "rgba(31,111,107,0.12)" };
}

function interpret(values, probability) {
  const pct = probability * 100;
  const tenure = values.tenure;
  if (pct >= 60) {
    return `A ${values.Contract.toLowerCase()} contract combined with ${tenure} month${tenure === 1 ? "" : "s"} of tenure puts this customer well above average churn risk — worth a proactive retention offer.`;
  }
  if (pct >= 30) {
    return "This customer sits near the churn threshold; contract type and lack of security/support add-ons are among the main factors the model weighs.";
  }
  return "Longer tenure and a longer-term contract make this customer unlikely to churn in the near term, based on the model's learned patterns.";
}

export default function ChurnPredictor() {
  const [values, setValues] = useState({ ...DEFAULT_VALUES });
  const onChange = (name, value) => setValues((v) => ({ ...v, [name]: value }));
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/predict/churn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      const band = riskBand(data.churn_probability);
      setResult({
        probText: `${Math.round(data.churn_probability * 100)}%`,
        gaugeOffset: (GAUGE_CIRCUMFERENCE * (1 - data.churn_probability)).toFixed(1),
        ...band,
        interpretation: interpret(values, data.churn_probability),
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Will this customer churn?</h1>
        <p>Model: Logistic Regression — best ROC-AUC on test set</p>
      </div>

      <div className="predictor-layout">
        <div className="predictor-form-col">
          <CustomerForm sections={SECTIONS} values={values} onChange={onChange} />
          <button className="predict-btn" onClick={submit} disabled={loading}>
            {loading ? "Predicting..." : "Predict churn"}
          </button>
          {error && <p className="error">{error}</p>}
        </div>

        <div className="predictor-result-col">
          {result ? (
            <div className="result-card">
              <div className="gauge-wrap">
                <div className="result-badge" style={{ background: result.badgeBg, color: result.color }}>
                  {result.label}
                </div>
                <div className="gauge">
                  <svg width="164" height="164" viewBox="0 0 150 150">
                    <circle cx="75" cy="75" r="60" fill="none" stroke="rgba(27,37,33,0.1)" strokeWidth="13" />
                    <circle
                      cx="75" cy="75" r="60" fill="none" stroke={result.color} strokeWidth="13"
                      strokeLinecap="round"
                      strokeDasharray={GAUGE_CIRCUMFERENCE.toFixed(1)}
                      strokeDashoffset={result.gaugeOffset}
                      style={{ transition: "stroke-dashoffset 0.7s ease" }}
                    />
                  </svg>
                  <div className="gauge-center">
                    <span className="gauge-value" style={{ color: result.color }}>{result.probText}</span>
                    <span className="gauge-caption">churn prob.</span>
                  </div>
                </div>
              </div>
              <p className="result-interpretation">{result.interpretation}</p>
            </div>
          ) : (
            <div className="result-empty">
              <svg width="28" height="28" viewBox="0 0 20 20" fill="none" style={{ margin: "0 auto 12px", display: "block", color: "rgba(27,37,33,0.3)" }}>
                <circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 18c0-4 3-6.5 6-6.5s6 2.5 6 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p>Fill out the form and click Predict churn to see a result here.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
