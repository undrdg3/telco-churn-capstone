# AI-Workflow Reflection

## Tools used

- **Claude Code** (Sonnet 5) as the primary AI pair-programmer for the entire project: dataset
  inspection, cleaning, EDA, feature engineering, the leakage-safe modeling pipeline, the model
  ladder + tuning, the FastAPI backend, and the React dashboard (built in two passes — first a
  functional predictor UI, then restyled to match an externally-designed mockup).
- **Playwright** (both the MCP server and, once that disconnected mid-session, standalone
  `npx playwright` + small Node scripts) — used to drive a real headless browser against the
  running React app: typing into forms, clicking "Predict churn," clicking through sidebar
  navigation, opening/closing the profile and notification dropdowns, and reading back rendered
  results, to verify the frontend actually calls the FastAPI backend correctly end-to-end rather
  than trusting that the code "looks right."
- **superpowers:brainstorming skill** (design-spec workflow) — used before the dashboard redesign
  to ask clarifying questions (landing view, data source, navigation style) and produce a written
  design spec (`docs/superpowers/specs/2026-07-01-management-dashboard-design.md`) and
  implementation plan before writing any code.
- **A design-tool HTML export** the user supplied (a "bundler" artifact with embedded
  fonts/JSON-escaped template markup) was decoded and read directly (via `python -c 'json.loads(...)'`,
  not by trusting a visual preview) to extract the actual mockup's colors, layout, and copy before
  reproducing it in React/CSS.
- **Bash/shell tool** — used to run `quarto render` repeatedly during development (34 code
  cells), `curl` against the FastAPI endpoints, `npm run build`/`npm run dev`, and `git`.
- No GitHub MCP server was used in this session; the repo is committed locally with plain `git`
  and will be pushed to a public remote as a separate, deliberate step (not done automatically,
  since pushing to GitHub is a user-facing action requiring explicit confirmation).

## How the AI's output was verified (not just trusted)

- **Re-rendered the Quarto report after every section was added**, checking that every one of
  the 34 code cells executed without errors — not just that the code "looked plausible."
- **Manually inspected the raw data quirks** the AI reported (e.g., that `TotalCharges` loads as
  text because of blank strings for `tenure == 0` customers) by printing the actual offending
  rows, rather than accepting the explanation at face value.
- **Caught and investigated a suspicious result myself**: the regression model's R² came back at
  0.999, which is a classic leakage red flag. Instead of accepting it, a direct check was run —
  grouping customers by identical service configuration and measuring the within-group spread of
  `MonthlyCharges` (~$1 on average) — which confirmed the high score reflects genuinely
  deterministic pricing in this dataset, not a leaked feature. This is documented directly in the
  report (Section 11.2) rather than glossed over.
- **Tested the deployed prediction logic directly**, not just the training notebook: ran the
  FastAPI endpoints with `curl` and with a real browser session (via Playwright) to confirm the
  same feature-engineering logic used in training (`app/backend/feature_engineering.py`) produces
  sane, non-crashing predictions on new, hand-entered inputs.
- **Checked the leakage boundaries by hand**: verified that `TotalCharges` and the derived
  `avg_monthly_spend_to_date` feature are excluded from the regression feature set (they are
  near-restatements of the regression target), and that `Churn` is excluded from regression
  features as a downstream outcome — these were reasoned through explicitly, not just taken as
  given.
- **Fixed a real (not cosmetic) reporting bug**: the feature-importance chart in Section 11.3
  originally labeled bars `feature_0`, `feature_1`, etc. — meaningless once one-hot encoding and
  feature selection had reordered columns. Rather than leaving this footnoted as a known
  limitation, the fix (recovering real column names via
  `ColumnTransformer.get_feature_names_out()` combined with `SelectFromModel.get_support()`) was
  implemented and the report re-rendered to confirm real feature names (e.g. `Contract
  Month-to-month`, `tenure`) now appear on the chart.
- **Re-derived every number shown in the dashboard's "Recommended actions" and "Revenue at risk"
  panels directly from the cleaned dataset** (`df.groupby(...)['Churn'].agg(['mean','count'])`,
  summed `MonthlyCharges` for churned customers) before writing any of that text into the UI —
  none of those figures were carried over from the design mockup, since the mockup's numbers were
  placeholder/fabricated for visual purposes only.
- **Caught a mockup-fidelity vs. honesty conflict and flagged it instead of silently picking a
  side**: the supplied design mockup's KPI cards showed fabricated trend deltas (e.g. "+1.2%")
  implying a time series that doesn't exist in this static, single-snapshot dataset. This was
  raised explicitly rather than reproduced blindly, and — per the user's direction — replaced with
  real segment breakdowns (churn by contract, tenure/charges distribution, internet-service mix)
  that convey similar visual information without inventing data.

## What I (the student) understand and can explain

Every design decision in this project — why `TotalCharges` was imputed with 0 rather than the
mean, why scaling is deferred into the pipeline instead of applied globally, why two different
feature sets exist for the two tasks, why the Decision Tree is deliberately left unconstrained to
demonstrate overfitting, why Logistic Regression beat XGBoost on this particular dataset — is
written out in plain language in `docs/explain-to-professor.md`, in the order it was done, so it
can be walked through without needing to re-read code.

## Rough sense of cost / effort

- Total wall-clock time across the project: roughly a full day across two sessions — the first
  covering EDA → feature engineering → model ladder → leaderboard → initial FastAPI/React app,
  the second covering the dashboard redesign (glassmorphism UI matching a supplied mockup, real
  KPI/segment data wired to a new `/stats/overview` endpoint, interactive dropdown menus).
- Iteration cost was low because of tight feedback loops in both phases: Quarto re-renders in
  well under a minute for the full 34-cell report, and `npm run build` for the React app takes
  under a second, so changes could be verified immediately rather than trusted blind.
- The most expensive modeling step, time-wise, was the `GridSearchCV` hyperparameter search for
  XGBoost on both tasks (a few dozen fits each) — kept deliberately small (2×2×2 grid, cv=3) to
  stay fast under a tight deadline, an explicit tradeoff given Logistic Regression/Ridge were
  already close to or better than XGBoost on this dataset.
- The most expensive dashboard step was decoding the supplied design-tool export — a 570KB
  bundled HTML file with JSON-escaped template markup and embedded fonts — which took targeted
  `grep`/`python -c` inspection rather than a naive full-file read (the file exceeded the file-read
  tool's size limit) to extract the real layout and copy before reproducing it.
