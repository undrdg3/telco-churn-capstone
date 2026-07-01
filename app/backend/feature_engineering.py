"""Feature engineering shared between the training notebook (report/ml-analysis.qmd)
and the live API. Must stay in sync with Section 6 of the report."""

import pandas as pd

ADDON_COLS = [
    "OnlineSecurity", "OnlineBackup", "DeviceProtection",
    "TechSupport", "StreamingTV", "StreamingMovies",
]

TENURE_BINS = [-1, 12, 24, 48, 60, 72]
TENURE_LABELS = ["0-1yr", "1-2yr", "2-4yr", "4-5yr", "5-6yr"]


def engineer_features(row: dict) -> dict:
    """Given raw customer fields, compute the same engineered features used in training."""
    out = dict(row)
    tenure = row["tenure"]

    out["tenure_years"] = tenure / 12.0
    out["num_addon_services"] = sum(1 for c in ADDON_COLS if row.get(c) == "Yes")
    out["has_internet"] = 0 if row["InternetService"] == "No" else 1
    out["has_family"] = 1 if (row.get("Partner") == "Yes" or row.get("Dependents") == "Yes") else 0
    out["is_new_customer"] = 1 if tenure <= 3 else 0
    out["tenure_bucket"] = pd.cut(
        [tenure], bins=TENURE_BINS, labels=TENURE_LABELS
    )[0]

    if "TotalCharges" in row:
        out["avg_monthly_spend_to_date"] = row["TotalCharges"] / max(tenure, 1)

    return out
