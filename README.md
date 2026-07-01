# Telco Customer Churn — End-to-End ML Project

Predicting customer churn (classification) and monthly charges (regression) from the
[Telco Customer Churn dataset](https://www.kaggle.com/datasets/blastchar/telco-customer-churn),
with a full leakage-safe pipeline, a benchmarked model ladder up to XGBoost, and a deployed
prediction app.

## Live app

TODO: link once deployed.

## Repo structure

```
data/           raw dataset (WA_Fn-UseC_-Telco-Customer-Churn.csv)
report/         Quarto analysis report (ml-analysis.qmd -> HTML)
slides/         Quarto reveal.js presentation
models/         trained pipelines (churn_pipeline.pkl, charges_pipeline.pkl)
app/backend/    FastAPI service serving /predict/churn and /predict/charges
app/frontend/   React (Vite) frontend
docs/           architecture notes and diagrams
```

## Running the report

```bash
pip install -r requirements.txt
quarto render report/ml-analysis.qmd
```

## Running the app locally

```bash
# backend
cd app/backend
pip install -r requirements.txt
uvicorn main:app --reload

# frontend
cd app/frontend
npm install
npm run dev
```

## Deliverables

- `report/ml-analysis.qmd` — full analysis report (D1)
- `app/` — deployed prediction app (D2)
- `docs/ai-workflow-reflection.md` — AI-workflow reflection (D3)
- `slides/` — presentation deck (D4)
- `docs/executive-summary.md` — executive summary (D5)
