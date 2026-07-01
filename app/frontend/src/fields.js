export const YES_NO = ["Yes", "No"];
const YES_NO_INTERNET = ["Yes", "No", "No internet service"];

export const FIELD_SECTIONS = [
  {
    title: "Customer profile",
    accent: "#E8543A",
    fields: [
      { name: "gender", label: "Gender", type: "select", options: ["Female", "Male"] },
      { name: "SeniorCitizen", label: "Senior citizen", type: "select", options: [0, 1], labels: ["No", "Yes"] },
      { name: "Partner", label: "Has partner", type: "select", options: YES_NO },
      { name: "Dependents", label: "Has dependents", type: "select", options: YES_NO },
    ],
  },
  {
    title: "Services",
    accent: "#1F6F6B",
    fields: [
      { name: "tenure", label: "Tenure (months)", type: "number", min: 0, max: 72 },
      { name: "PhoneService", label: "Phone service", type: "select", options: YES_NO },
      { name: "MultipleLines", label: "Multiple lines", type: "select", options: ["No", "Yes", "No phone service"] },
      { name: "InternetService", label: "Internet service", type: "select", options: ["DSL", "Fiber optic", "No"] },
      { name: "OnlineSecurity", label: "Online security", type: "select", options: YES_NO_INTERNET },
      { name: "OnlineBackup", label: "Online backup", type: "select", options: YES_NO_INTERNET },
      { name: "DeviceProtection", label: "Device protection", type: "select", options: YES_NO_INTERNET },
      { name: "TechSupport", label: "Tech support", type: "select", options: YES_NO_INTERNET },
      { name: "StreamingTV", label: "Streaming TV", type: "select", options: YES_NO_INTERNET },
      { name: "StreamingMovies", label: "Streaming movies", type: "select", options: YES_NO_INTERNET },
    ],
  },
  {
    title: "Account & billing",
    accent: "#D69A3C",
    fields: [
      { name: "Contract", label: "Contract", type: "select", options: ["Month-to-month", "One year", "Two year"] },
      { name: "PaperlessBilling", label: "Paperless billing", type: "select", options: YES_NO },
      {
        name: "PaymentMethod", label: "Payment method", type: "select",
        options: ["Electronic check", "Mailed check", "Bank transfer (automatic)", "Credit card (automatic)"],
      },
    ],
  },
];

export const CHURN_ONLY_FIELDS = [
  { name: "MonthlyCharges", label: "Monthly charges ($)", type: "number", step: "0.01", min: 0 },
  { name: "TotalCharges", label: "Total charges ($)", type: "number", step: "0.01", min: 0 },
];

export function sectionsWithChurnBilling() {
  return FIELD_SECTIONS.map((section) =>
    section.title === "Account & billing"
      ? { ...section, fields: [...section.fields, ...CHURN_ONLY_FIELDS] }
      : section
  );
}

export const DEFAULT_VALUES = {
  gender: "Female",
  SeniorCitizen: 0,
  Partner: "Yes",
  Dependents: "No",
  tenure: 12,
  PhoneService: "Yes",
  MultipleLines: "No",
  InternetService: "Fiber optic",
  OnlineSecurity: "No",
  OnlineBackup: "No",
  DeviceProtection: "No",
  TechSupport: "No",
  StreamingTV: "Yes",
  StreamingMovies: "Yes",
  Contract: "Month-to-month",
  PaperlessBilling: "Yes",
  PaymentMethod: "Electronic check",
  MonthlyCharges: 85.5,
  TotalCharges: 1000,
};
