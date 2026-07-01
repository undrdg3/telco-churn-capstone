# Management Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing bare-form React app into a management dashboard with a sidebar, a live KPI/chart Overview page backed by a new FastAPI endpoint, and the existing predictors/leaderboard restyled to fit inside the new shell.

**Architecture:** FastAPI gains one new module (`data_prep.py`) and one new endpoint (`/stats/overview`) that load and clean the raw CSV once at startup and serve precomputed aggregates. React gains a `Sidebar` component and an `Overview` page (using Recharts), and `App.jsx` is restructured to route between 4 sidebar sections instead of top tabs. The existing `ChurnPredictor`/`ChargesPredictor`/`Leaderboard` logic is moved into `src/pages/` unchanged.

**Tech Stack:** FastAPI, pandas (backend, already in use); React, Vite, Recharts (new dependency) (frontend).

## Global Constraints

- Backend must not depend on the gitignored `data/telco_clean.parquet` checkpoint — clean the raw CSV independently in `data_prep.py`.
- `/stats/overview` numbers must match the report's Section 4 EDA figures (~26.5% churn rate, etc.) — used as the correctness check.
- No new frontend routing library — sidebar section switching uses local component state, same pattern as the current tab implementation.
- Existing predictor/leaderboard behavior must not regress — verified with the same curl + browser checks used originally.

---

### Task 1: Backend — cleaned-data loader + `/stats/overview` endpoint

**Files:**
- Create: `app/backend/data_prep.py`
- Modify: `app/backend/main.py` (add import + new route)

**Interfaces:**
- Produces: `data_prep.load_clean_data() -> pandas.DataFrame` (columns: all raw Telco columns plus cleaned `TotalCharges` (float, no NaN) and `Churn` (int 0/1))
- Produces: `data_prep.compute_overview_stats(df: pandas.DataFrame) -> dict` matching the JSON shape in the spec (`total_customers`, `churn_rate`, `avg_monthly_charges`, `avg_tenure`, `churn_by_contract`, `tenure_distribution`, `monthly_charges_distribution`)
- Consumes (in `main.py`): `data_prep.load_clean_data`, `data_prep.compute_overview_stats`

- [x] **Step 1: Write `data_prep.py`** — done, `app/backend/data_prep.py`.
- [x] **Step 2: Sanity-check the module directly** — confirmed `total_customers == 7043`, `churn_rate == 0.2654`.
- [x] **Step 3: Wire the endpoint into `main.py`** — `GET /stats/overview` added.
- [x] **Step 4: Run the backend and verify the endpoint** — confirmed via curl, numbers match report Section 4.
- [x] **Step 5: Commit** — commit `cf67352`.

---

### Task 2: Frontend — install Recharts, add Sidebar, restructure App shell

**Files:**
- Modify: `app/frontend/package.json` (new dependency)
- Create: `app/frontend/src/Sidebar.jsx`
- Create: `app/frontend/src/pages/` directory
- Modify: `app/frontend/src/App.jsx`
- Modify: `app/frontend/src/App.css`

**Interfaces:**
- Produces: `Sidebar` component — props `{ active: string, onSelect: (key: string) => void }`, renders 4 nav buttons with `data-key` values `"overview" | "churn" | "charges" | "leaderboard"`.
- Consumes (from Task 1): `GET {API_URL}/stats/overview`

- [x] **Step 1: Install Recharts** — done.
- [x] **Step 2: Move existing page components into `src/pages/`** — `ChurnPredictor.jsx`, `ChargesPredictor.jsx`, `Leaderboard.jsx` created under `src/pages/`.
- [x] **Step 3: Write `Sidebar.jsx`** — done.
- [x] **Step 4: Rewrite `App.jsx`** — done (references `./pages/Overview`, built in Task 3).
- [x] **Step 5: Delete the backup file** — no backup file was created (components were written fresh from the prior `App.jsx` content directly), so nothing to delete.
- [x] **Step 6: Commit** — commit `ef84afb`.

---

### Task 3: Frontend — Overview page with KPI cards + Recharts charts

**Files:**
- Create: `app/frontend/src/pages/Overview.jsx`
- Modify: `app/frontend/src/App.css` (sidebar + KPI card styles)

**Interfaces:**
- Consumes: `GET {API_URL}/stats/overview` (from Task 1)
- Consumes (from Task 2): `Sidebar` nav key `"overview"` routes here via `App.jsx`

- [x] **Step 1: Write `Overview.jsx`** — done.
- [x] **Step 2: Add sidebar + KPI + chart styles to `App.css`** — done, also removed now-dead `.app`/`.tabs`/`header h1` rules from the old top-tab layout.
- [x] **Step 3: Build and verify** — `npm run build` succeeded.
- [x] **Step 4: Manual verification with backend running** — verified via headless browser: Overview renders 4 KPI cards with real numbers + 3 charts; Churn Predictor and Charges Predictor both still return correct predictions (68.3% churn probability, $89.80 charges) after the refactor; Model Leaderboard renders unchanged.
- [x] **Step 5: Commit** — commit `c319ac3`.

---

## Self-Review Notes

- **Spec coverage:** Sidebar (Task 2) ✓, Overview KPIs+charts (Task 3) ✓, `/stats/overview` endpoint (Task 1) ✓, existing predictors/leaderboard preserved (Task 2) ✓, Recharts dependency (Task 2) ✓, out-of-scope items (auth, extra charts, live leaderboard) correctly excluded from all tasks.
- **Type/interface consistency:** `Sidebar` nav keys (`overview`/`churn`/`charges`/`leaderboard`) match `PAGES` object keys in `App.jsx` and match the spec's 4 sections. `/stats/overview` JSON field names match exactly what `Overview.jsx` reads.
- **No placeholders:** all steps contain complete, runnable code.

## Status: Complete

All 3 tasks implemented, verified, and committed locally (not pushed to any remote per user instruction).
