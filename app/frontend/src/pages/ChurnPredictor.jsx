import { useState } from "react";
import CustomerForm from "../CustomerForm";
import { sectionsWithChurnBilling, DEFAULT_VALUES, CHURN_PRESETS } from "../fields";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const SECTIONS = sectionsWithChurnBilling();
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * 60;
const CONTRACT_OPTIONS = ["Month-to-month", "One year", "Two year"];

function riskBand(probability) {
  const pct = probability * 100;
  if (pct >= 60) return { label: "High risk", color: "#E8543A", badgeBg: "rgba(232,84,58,0.12)" };
  if (pct >= 30) return { label: "Medium risk", color: "#D69A3C", badgeBg: "rgba(214,154,60,0.14)" };
  return { label: "Low risk", color: "#1F6F6B", badgeBg: "rgba(31,111,107,0.12)" };
}

async function fetchChurn(values) {
  const res = await fetch(`${API_URL}/predict/churn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

function DriverList({ drivers }) {
  if (!drivers || drivers.length === 0) return null;
  const maxAbs = Math.max(...drivers.map((d) => Math.abs(d.value)), 0.0001);
  return (
    <div className="driver-list">
      <p className="driver-list-title">Top factors in this prediction</p>
      {drivers.map((d) => (
        <div key={d.feature} className="driver-row">
          <span className="driver-name" title={d.feature}>{d.feature}</span>
          <div className="driver-bar-track">
            <div
              className="driver-bar-fill"
              style={{
                width: `${(Math.abs(d.value) / maxAbs) * 100}%`,
                background: d.value >= 0 ? "#E8543A" : "#1F6F6B",
                marginLeft: d.value >= 0 ? "0" : "auto",
              }}
            />
          </div>
        </div>
      ))}
      <p className="whatif-caption" style={{ marginTop: 4 }}>
        Orange bars push toward churn, teal bars push away — computed from this specific
        customer's values, not a generic ranking.
      </p>
    </div>
  );
}

function WhatIfContract({ currentContract, currentProbability, alternates }) {
  if (!alternates) return null;
  const all = [
    { contract: currentContract, probability: currentProbability, isCurrent: true },
    ...alternates,
  ];
  const maxP = Math.max(...all.map((r) => r.probability), 0.01);
  return (
    <div className="glass-card whatif-card">
      <p className="whatif-title">What if the contract were different?</p>
      <p className="whatif-caption">
        Model estimate only — correlational, not a guarantee a real contract change moves risk
        by exactly this much.
      </p>
      {all.map((r) => (
        <div key={r.contract} className={`whatif-row ${r.isCurrent ? "current" : ""}`}>
          <span className="whatif-name">{r.contract}{r.isCurrent ? " (current)" : ""}</span>
          <div className="whatif-bar-track">
            <div
              className="whatif-bar-fill"
              style={{ width: `${(r.probability / maxP) * 100}%` }}
            />
          </div>
          <span className="whatif-value">{Math.round(r.probability * 100)}%</span>
        </div>
      ))}
    </div>
  );
}

export default function ChurnPredictor() {
  const [values, setValues] = useState({ ...DEFAULT_VALUES });
  const onChange = (name, value) => setValues((v) => ({ ...v, [name]: value }));
  const [result, setResult] = useState(null);
  const [whatIf, setWhatIf] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const applyPreset = (preset) => {
    setValues({ ...preset.values });
    setResult(null);
    setWhatIf(null);
  };

  const submit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setWhatIf(null);
    try {
      const data = await fetchChurn(values);
      const band = riskBand(data.churn_probability);
      setResult({
        contract: values.Contract,
        probText: `${Math.round(data.churn_probability * 100)}%`,
        gaugeOffset: (GAUGE_CIRCUMFERENCE * (1 - data.churn_probability)).toFixed(1),
        probability: data.churn_probability,
        willChurn: data.will_churn,
        threshold: data.decision_threshold,
        drivers: data.top_drivers,
        ...band,
      });

      const otherContracts = CONTRACT_OPTIONS.filter((c) => c !== values.Contract);
      const alternates = await Promise.all(
        otherContracts.map(async (contract) => {
          const altData = await fetchChurn({ ...values, Contract: contract });
          return { contract, probability: altData.churn_probability };
        })
      );
      setWhatIf(alternates);
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
        <p>Model: Logistic Regression — effectively tied with XGBoost, preferred for simplicity</p>
      </div>

      <div className="predictor-layout">
        <div className="predictor-form-col">
          <div className="preset-row">
            <span className="preset-label">Try a sample profile:</span>
            {CHURN_PRESETS.map((preset) => (
              <button key={preset.label} type="button" className="preset-btn" onClick={() => applyPreset(preset)}>
                {preset.label}
              </button>
            ))}
          </div>

          <CustomerForm sections={SECTIONS} values={values} onChange={onChange} />
          <button className="predict-btn" onClick={submit} disabled={loading}>
            {loading ? "Predicting..." : "Predict churn"}
          </button>
          {error && <p className="error">{error}</p>}
        </div>

        <div className="predictor-result-col">
          {result ? (
            <>
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
                <p className="result-interpretation" style={{ borderTop: "none", paddingTop: 0, marginTop: 10 }}>
                  Flagged <strong>{result.willChurn ? "at risk" : "not at risk"}</strong> at the
                  {" "}{Math.round(result.threshold * 100)}% decision threshold (tuned for recall —
                  see Model Leaderboard for why).
                </p>
                <DriverList drivers={result.drivers} />
              </div>
              <WhatIfContract
                currentContract={result.contract}
                currentProbability={result.probability}
                alternates={whatIf}
              />
            </>
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
