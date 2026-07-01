function FieldInput({ field, value, onChange }) {
  if (field.type === "select") {
    return (
      <select
        value={value}
        onChange={(e) => {
          const raw = e.target.value;
          const val = field.options.includes(Number(raw)) && typeof field.options[0] === "number"
            ? Number(raw)
            : raw;
          onChange(field.name, val);
        }}
      >
        {field.options.map((opt, i) => (
          <option key={opt} value={opt}>
            {field.labels ? field.labels[i] : String(opt)}
          </option>
        ))}
      </select>
    );
  }
  return (
    <input
      type="number"
      min={field.min}
      max={field.max}
      step={field.step || "1"}
      value={value}
      onChange={(e) => onChange(field.name, Number(e.target.value))}
    />
  );
}

export default function CustomerForm({ sections, values, onChange }) {
  return (
    <>
      {sections.map((section) => (
        <div key={section.title} className="glass-card form-section">
          <h3 className="form-section-title">
            <span className="form-section-dot" style={{ background: section.accent }} />
            {section.title}
          </h3>
          <div className="form-grid">
            {section.fields.map((f) => (
              <label key={f.name} className="field">
                <span>{f.label}</span>
                <FieldInput field={f} value={values[f.name]} onChange={onChange} />
              </label>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
