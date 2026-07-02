import { useState } from "react";
import CustomerForm from "../CustomerForm";
import { FIELD_SECTIONS, DEFAULT_VALUES, CHARGES_PRESETS } from "../fields";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const AVG_MONTHLY_CHARGES = 64.76;

function interpret(values, predicted) {
  const addonKeys = ["OnlineSecurity", "OnlineBackup", "DeviceProtection", "TechSupport", "StreamingTV", "StreamingMovies"];
  const addonCount = addonKeys.filter((k) => values[k] === "Yes").length;
  if (values.InternetService === "Fiber optic") {
    return `Fiber optic internet plus ${addonCount} add-on service${addonCount === 1 ? "" : "s"} puts this bill ${predicted >= AVG_MONTHLY_CHARGES ? "above" : "near"} the $${AVG_MONTHLY_CHARGES.toFixed(2)} dataset average — typical for this profile.`;
  }
  if (values.InternetService === "No") {
    return `No internet service keeps this bill well below the $${AVG_MONTHLY_CHARGES.toFixed(2)} dataset average — mostly phone-line charges.`;
  }
  return `DSL internet with ${addonCount} add-on service${addonCount === 1 ? "" : "s"} lands close to the $${AVG_MONTHLY_CHARGES.toFixed(2)} dataset average bill.`;
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
                background: d.value >= 0 ? "#D69A3C" : "#1F6F6B",
                marginLeft: d.value >= 0 ? "0" : "auto",
              }}
            />
          </div>
        </div>
      ))}
      <p className="whatif-caption" style={{ marginTop: 4 }}>
        Gold bars push the bill up, teal bars push it down — this is the recovered rate card
        applied to this specific customer, not a generic ranking.
      </p>
    </div>
  );
}

export default function ChargesPredictor() {
  const [values, setValues] = useState({ ...DEFAULT_VALUES });
  const onChange = (name, value) => setValues((v) => ({ ...v, [name]: value }));
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const applyPreset = (preset) => {
    setValues({ ...values, ...preset.values });
    setResult(null);
  };

  const submit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/predict/charges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      setResult({
        amountText: `$${data.predicted_monthly_charges.toFixed(2)}`,
        interpretation: interpret(values, data.predicted_monthly_charges),
        drivers: data.top_drivers,
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
        <h1>What should this customer's monthly bill be?</h1>
        <p>Model: Ridge Regression — effectively tied with XGBoost, preferred for interpretability. A pricing sanity check, not a billing replacement.</p>
      </div>

      <div className="predictor-layout">
        <div className="predictor-form-col">
          <div className="preset-row">
            <span className="preset-label">Try a sample profile:</span>
            {CHARGES_PRESETS.map((preset) => (
              <button key={preset.label} type="button" className="preset-btn" onClick={() => applyPreset(preset)}>
                {preset.label}
              </button>
            ))}
          </div>

          <CustomerForm sections={FIELD_SECTIONS} values={values} onChange={onChange} />
          <button className="predict-btn gold" onClick={submit} disabled={loading}>
            {loading ? "Predicting..." : "Predict monthly charges"}
          </button>
          {error && <p className="error">{error}</p>}
        </div>

        <div className="predictor-result-col">
          {result ? (
            <div className="result-card">
              <div className="result-badge" style={{ background: "rgba(214,154,60,0.14)", color: "#D69A3C" }}>
                Predicted bill
              </div>
              <div className="charges-amount">{result.amountText}</div>
              <div className="charges-amount-caption">predicted monthly charge</div>
              <p className="result-interpretation">{result.interpretation}</p>
              <DriverList drivers={result.drivers} />
            </div>
          ) : (
            <div className="result-empty">
              <svg width="28" height="28" viewBox="0 0 20 20" fill="none" style={{ margin: "0 auto 12px", display: "block", color: "rgba(27,37,33,0.3)" }}>
                <path d="M3 9l6-6h7a1 1 0 011 1v7l-6 6a1.2 1.2 0 01-1.7 0L3 10.7a1.2 1.2 0 010-1.7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
              <p>Fill out the form and click Predict monthly charges to see a result here.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
