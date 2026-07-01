from pathlib import Path

import pandas as pd

DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "WA_Fn-UseC_-Telco-Customer-Churn.csv"

TENURE_BINS = [-1, 12, 24, 36, 48, 60, 72]
TENURE_LABELS = ["0-12", "12-24", "24-36", "36-48", "48-60", "60-72"]

CHARGES_BINS = [0, 20, 40, 60, 80, 100, 120]
CHARGES_LABELS = ["0-20", "20-40", "40-60", "60-80", "80-100", "100-120"]


def load_clean_data() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)
    df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce").fillna(0.0)
    df["Churn"] = df["Churn"].map({"Yes": 1, "No": 0})
    return df


def compute_overview_stats(df: pd.DataFrame) -> dict:
    churn_by_contract = (
        df.groupby("Contract")["Churn"].mean()
        .reset_index()
        .rename(columns={"Churn": "churn_rate"})
        .to_dict(orient="records")
    )

    tenure_binned = pd.cut(df["tenure"], bins=TENURE_BINS, labels=TENURE_LABELS)
    tenure_distribution = (
        tenure_binned.value_counts().reindex(TENURE_LABELS).fillna(0).astype(int)
        .reset_index()
        .rename(columns={"index": "bucket", "tenure": "bucket", "count": "count"})
        .to_dict(orient="records")
    )

    charges_binned = pd.cut(df["MonthlyCharges"], bins=CHARGES_BINS, labels=CHARGES_LABELS)
    monthly_charges_distribution = (
        charges_binned.value_counts().reindex(CHARGES_LABELS).fillna(0).astype(int)
        .reset_index()
        .rename(columns={"index": "bucket", "MonthlyCharges": "bucket", "count": "count"})
        .to_dict(orient="records")
    )

    customers_by_internet = (
        df["InternetService"].value_counts()
        .reset_index()
        .rename(columns={"index": "internet_service", "InternetService": "internet_service", "count": "count"})
        .to_dict(orient="records")
    )

    churned = df[df["Churn"] == 1]
    revenue_at_risk_monthly = float(churned["MonthlyCharges"].sum())
    total_monthly_revenue = float(df["MonthlyCharges"].sum())

    segment_cols = ["Contract", "InternetService", "PaymentMethod"]
    segments = (
        df.groupby(segment_cols)["Churn"].agg(["mean", "count"])
        .reset_index()
        .rename(columns={"mean": "churn_rate", "count": "customers"})
    )
    segments = segments[segments["customers"] >= 30].sort_values("churn_rate", ascending=False).head(5)
    top_risk_segments = [
        {
            "contract": r["Contract"],
            "internet_service": r["InternetService"],
            "payment_method": r["PaymentMethod"],
            "churn_rate": round(float(r["churn_rate"]), 4),
            "customers": int(r["customers"]),
        }
        for _, r in segments.iterrows()
    ]

    return {
        "total_customers": int(len(df)),
        "churn_rate": round(float(df["Churn"].mean()), 4),
        "avg_monthly_charges": round(float(df["MonthlyCharges"].mean()), 2),
        "avg_tenure": round(float(df["tenure"].mean()), 1),
        "churn_by_contract": [
            {"contract": r["Contract"], "churn_rate": round(r["churn_rate"], 4)}
            for r in churn_by_contract
        ],
        "tenure_distribution": [
            {"bucket": r["bucket"], "count": int(r["count"])} for r in tenure_distribution
        ],
        "monthly_charges_distribution": [
            {"bucket": r["bucket"], "count": int(r["count"])} for r in monthly_charges_distribution
        ],
        "customers_by_internet": [
            {"internet_service": r["internet_service"], "count": int(r["count"])}
            for r in customers_by_internet
        ],
        "revenue_at_risk": {
            "monthly_amount": round(revenue_at_risk_monthly, 2),
            "total_monthly_revenue": round(total_monthly_revenue, 2),
            "pct_of_revenue": round(revenue_at_risk_monthly / total_monthly_revenue, 4),
            "churned_customers": int(len(churned)),
        },
        "top_risk_segments": top_risk_segments,
    }
