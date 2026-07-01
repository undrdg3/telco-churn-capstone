# Management Dashboard — Design

## Goal

Turn the current bare prediction-form app into a management-facing dashboard: an at-a-glance
data overview for a non-technical manager, plus the existing ML predictors, all inside one
cohesive shell.

## Navigation

Replace the current top-tab bar with a left sidebar, 4 sections:

1. **Overview** (default/landing page)
2. **Churn Predictor**
3. **Charges Predictor**
4. **Model Leaderboard**

No routing library needed — local component state for the active section, same pattern as the
existing tab implementation, just restyled as a sidebar.

## Overview page

**KPI cards (top row, 4 cards):**
- Total customers
- Churn rate
- Average monthly charges
- Average tenure (months)

**Charts (below KPIs):**
- Churn rate by contract type (bar chart)
- Tenure distribution (histogram/bar chart)
- Monthly charges distribution (histogram/bar chart, full width)

All values and chart series are fetched from a new backend endpoint, `GET /stats/overview`.

## Backend changes

New file `app/backend/data_prep.py`:
- `load_clean_data()` — reads the raw CSV from `data/`, applies the same cleaning as
  `report/ml-analysis.qmd` Section 3 (coerce `TotalCharges` to numeric, fill missing with 0,
  map `Churn` Yes/No → 1/0). Loaded once at backend startup, not from the gitignored
  `telco_clean.parquet` checkpoint, so the backend has no hidden dependency on the report having
  been run first.

New endpoint in `app/backend/main.py`:
- `GET /stats/overview` → returns:
  ```json
  {
    "total_customers": 7043,
    "churn_rate": 0.265,
    "avg_monthly_charges": 64.76,
    "avg_tenure": 32.4,
    "churn_by_contract": [{"contract": "Month-to-month", "churn_rate": 0.427}, ...],
    "tenure_distribution": [{"bucket": "0-12", "count": 2186}, ...],
    "monthly_charges_distribution": [{"bucket": "20-40", "count": 1234}, ...]
  }
  ```
  Computed once at startup from `load_clean_data()`, served from memory on every request — real
  data from a real endpoint (not baked into the frontend build), but not recomputed per-request
  since the dataset is static.

## Frontend changes

- `app/frontend/src/Sidebar.jsx` — new sidebar nav component.
- `app/frontend/src/pages/Overview.jsx` — new page: fetches `/stats/overview` on mount, renders
  KPI cards + 3 Recharts charts.
- `app/frontend/src/App.jsx` — restructured to render `Sidebar` + the active page
  (Overview / ChurnPredictor / ChargesPredictor / Leaderboard) instead of the current top-tab
  bar. Existing `ChurnPredictor`, `ChargesPredictor`, `Leaderboard` components are moved into
  `src/pages/` and kept functionally unchanged — only the outer layout changes.
- New dependency: `recharts` (lightweight, standard React charting library).
- `App.css` extended with sidebar layout and KPI card styles; existing form/table styles reused
  as-is.

## What's explicitly out of scope (for time)

- No new charts beyond the 3 listed.
- No date-range filtering or interactivity beyond what Recharts gives for free (tooltips).
- No auth/login — this is a single-audience demo dashboard.
- Model Leaderboard stays static (already verified against real test-set numbers); not moved to
  a live endpoint.

## Testing plan

- Start backend, hit `/stats/overview` with `curl`, sanity-check the numbers against the report's
  EDA section (Section 4).
- Start frontend, visually verify Overview renders KPIs + charts, then click through to each of
  the 3 other sidebar pages and confirm predictors still work (same manual curl + browser check
  used for the original app).
