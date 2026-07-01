import { useState } from "react";
import CustomerForm from "../CustomerForm";
import { BASE_FIELDS, DEFAULT_VALUES } from "../fields";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function ChargesPredictor() {
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
      const res = await fetch(`${API_URL}/predict/charges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      setResult(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <h2>What should this customer's monthly bill be?</h2>
      <p className="muted">
        Model: Ridge Regression (best R² on test set). Useful as a pricing sanity check, not a
        replacement for actual billing.
      </p>
      <CustomerForm fields={BASE_FIELDS} values={values} onChange={onChange} />
      <button onClick={submit} disabled={loading}>
        {loading ? "Predicting..." : "Predict monthly charges"}
      </button>
      {error && <p className="error">{error}</p>}
      {result && (
        <div className="result safe">
          <strong>Predicted monthly charges: ${result.predicted_monthly_charges.toFixed(2)}</strong>
        </div>
      )}
    </div>
  );
}
