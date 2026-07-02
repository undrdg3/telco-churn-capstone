from pathlib import Path
from typing import Literal

import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from feature_engineering import engineer_features
from data_prep import load_clean_data, compute_overview_stats
from model_explain import compute_top_drivers

MODELS_DIR = Path(__file__).resolve().parents[2] / "models"

# Chosen in report/ml-analysis.qmd Section 11.1.1: lowered from the default 0.5 to
# prioritize recall (misses fewer real churners) at the cost of more false alarms,
# validated on the validation set and confirmed once on test (recall 0.503 -> 0.655).
CHURN_DECISION_THRESHOLD = 0.39

app = FastAPI(title="Telco Customer Churn & Charges API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted first-party artifacts: trained by report/ml-analysis.qmd in this same repo,
# not user-supplied or fetched from an external/untrusted source.
churn_pipeline = joblib.load(MODELS_DIR / "churn_pipeline.pkl")
charges_pipeline = joblib.load(MODELS_DIR / "charges_pipeline.pkl")

_overview_stats = compute_overview_stats(load_clean_data())

YesNo = Literal["Yes", "No"]


class CustomerBase(BaseModel):
    gender: Literal["Male", "Female"]
    SeniorCitizen: Literal[0, 1]
    Partner: YesNo
    Dependents: YesNo
    tenure: int
    PhoneService: YesNo
    MultipleLines: Literal["Yes", "No", "No phone service"]
    InternetService: Literal["DSL", "Fiber optic", "No"]
    OnlineSecurity: Literal["Yes", "No", "No internet service"]
    OnlineBackup: Literal["Yes", "No", "No internet service"]
    DeviceProtection: Literal["Yes", "No", "No internet service"]
    TechSupport: Literal["Yes", "No", "No internet service"]
    StreamingTV: Literal["Yes", "No", "No internet service"]
    StreamingMovies: Literal["Yes", "No", "No internet service"]
    Contract: Literal["Month-to-month", "One year", "Two year"]
    PaperlessBilling: YesNo
    PaymentMethod: Literal[
        "Electronic check", "Mailed check",
        "Bank transfer (automatic)", "Credit card (automatic)",
    ]


class ChurnInput(CustomerBase):
    MonthlyCharges: float
    TotalCharges: float


class ChargesInput(CustomerBase):
    pass


@app.get("/")
def health():
    return {"status": "ok"}


@app.get("/stats/overview")
def stats_overview():
    return _overview_stats


@app.post("/predict/churn")
def predict_churn(payload: ChurnInput):
    row = engineer_features(payload.model_dump())
    X = pd.DataFrame([row])
    proba = float(churn_pipeline.predict_proba(X)[0, 1])
    return {
        "churn_probability": round(proba, 4),
        "will_churn": bool(proba >= CHURN_DECISION_THRESHOLD),
        "decision_threshold": CHURN_DECISION_THRESHOLD,
        "top_drivers": compute_top_drivers(churn_pipeline, X, top_n=4),
    }


@app.post("/predict/charges")
def predict_charges(payload: ChargesInput):
    row = engineer_features(payload.model_dump())
    X = pd.DataFrame([row])
    prediction = float(charges_pipeline.predict(X)[0])
    return {
        "predicted_monthly_charges": round(prediction, 2),
        "top_drivers": compute_top_drivers(charges_pipeline, X, top_n=4),
    }
