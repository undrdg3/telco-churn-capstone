import { useState } from "react";
import CustomerForm from "../CustomerForm";
import { BASE_FIELDS, CHURN_ONLY_FIELDS, DEFAULT_VALUES } from "../fields";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function useCustomerValues() {
  const [values, setValues] = useState({ ...DEFAULT_VALUES });
  const onChange = (name, value) => setValues((v) => ({ ...v, [name]: value }));
  return [values, onChange];
}

export default function ChurnPredictor() {
  const [values, onChange] = useCustomerValues();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fields = [...BASE_FIELDS, ...CHURN_ONLY_FIELDS];

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
      setResult(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <h2>Will this customer churn?</h2>
      <p className="muted">Model: Logistic Regression (best ROC-AUC on test set).</p>
      <CustomerForm fields={fields} values={values} onChange={onChange} />
      <button onClick={submit} disabled={loading}>
        {loading ? "Predicting..." : "Predict churn"}
      </button>
      {error && <p className="error">{error}</p>}
      {result && (
        <div className={`result ${result.will_churn ? "danger" : "safe"}`}>
          <strong>{result.will_churn ? "Likely to churn" : "Likely to stay"}</strong>
          <div>Churn probability: {(result.churn_probability * 100).toFixed(1)}%</div>
        </div>
      )}
    </div>
  );
}
