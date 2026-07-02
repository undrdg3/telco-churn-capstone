# Project Review & Action Plan — 2026-07-02 (deadline: Thursday July 2, midnight)

> **Purpose of this file:** a critical review of the Telco Churn capstone as of 2026-07-02,
> written so a fresh AI session (or the student) can pick up the remaining work without
> re-deriving context. Treat the "Priority list" at the bottom as the instruction set;
> everything above it is the justification. Verify claims against the current repo state
> before acting — files may have changed since this was written.

## Repo state at time of review (verified, not assumed)

- **Done and in good shape:** Quarto report (`report/ml-analysis.qmd`, 622 lines, renders),
  slides (`slides/presentation.qmd`), executive summary, AI-workflow reflection,
  `docs/explain-to-professor.md`, feature engineering (tenure buckets, add-on counts,
  family/internet flags, spend rate), L1 feature selection (`SelectFromModel`),
  classification validation curve (Section 9.1), FastAPI backend (`app/backend/main.py`),
  React frontend (`app/frontend/src/`) with probability gauge + risk bands.
- **Not done:** deployment (biggest risk), `.pkl` models not committed (`models/` has only
  `.gitkeep`), no threshold discussion in report, app "explanations" are canned text.
- Leaderboard results (test set): Classification winner Logistic Regression
  (ROC-AUC 0.837 vs XGBoost 0.832); Regression winner Ridge (R² 0.999, RMSE 1.02).

## Overall verdict

Strong project. Leakage discipline is real (task-specific feature sets, fit-inside-pipeline
preprocessing, `TotalCharges`/`avg_monthly_spend_to_date` correctly excluded from regression).
The honest-evaluation narrative is consistent across report, slides, exec summary, and app.
Section 11.2's near-determinism investigation is exactly what "honest evaluation" grading
rewards. Weaknesses are small and fixable, but two sit precisely on the rigor axis being graded.

## Weaknesses found (in severity order)

1. **Test-set model selection.** In report Section 11,
   `best_clf_name = clf_leaderboard_df["roc_auc"].idxmax()` — the test set picks the winner,
   which then gets deployed. This contradicts the report's own claim that the test set is
   "touched only for final leaderboard evaluation." Fix: select the winner on the
   **validation** set, report its test score as confirmation. LR still wins, so this is a
   wording-plus-one-line change.
2. **Overselling the LR-vs-XGBoost gap.** Report says the 0.837 vs 0.832 gap is "real but not
   dramatic"; `app/frontend/src/leaderboard.json` `winner_reason` says "small but real margin."
   On a ~1,400-row test set, 0.005 AUC is not statistically distinguishable. Soften to
   "effectively tied; we prefer the simpler model" (or add a bootstrap CI). Same for
   regression: Ridge "wins" 0.999 vs 0.999 by rounding — say explicitly the tie is broken in
   favor of the simpler model. Also check `docs/explain-to-professor.md` for the same claim.
3. **Canned app explanations.** `ChurnPredictor.jsx` `interpret()` (lines ~16–26) returns
   hardcoded strings keyed only on the probability band — e.g. the high-risk text asserts
   contract/tenure are the drivers regardless of actual inputs. Undercuts the honesty story.
   Fix: derive drivers from the LR model (coefficient × standardized feature value gives exact
   per-prediction contributions; no SHAP needed) or hedge the wording ("typical drivers at
   this risk level include…").
4. **No deployment; models not committed.** Grading rewards a working deployed app over
   everything else. Simplest path: commit the two `.pkl` files (small; reproducibility is
   preserved since the report regenerates them), have FastAPI serve the built React `dist/`
   as static files (one service), deploy on Render/Railway/Fly. Budget 2–3 hrs incl.
   CORS/env debugging.
5. **No threshold discussion.** `will_churn = proba >= 0.5` with 26.5% churn gives recall
   0.50 — half of churners missed. A short precision-recall/threshold paragraph in the report
   closes the one classic imbalanced-classification rigor gap.
6. Minor: `leaderboard.json` is hardcoded in the frontend — if the report is re-rendered,
   re-check the numbers match. `Telco Insights (standalone).html` (~570KB design mockup at
   repo root) should be gitignored/moved before submission — it's a design artifact, not a
   deliverable.

## Decisions already made (do NOT relitigate)

- **MonthlyCharges near-determinism framing: keep the rate-card framing. Do NOT pivot to
  "charges in 3 months" or LTV.** The dataset is a single snapshot with no timestamps; any
  future-charges target would be fabricated data — the exact sin the project already refused
  to commit in the dashboard KPI cards. Section 11.2 (within-plan std ≈ $1, "solvable by
  construction, not leakage", pricing-sanity-check use case) is the correct handling and is
  already written.
- **Optional upgrade (~1 hr, only if time):** make rate-card reconstruction literal — present
  Ridge coefficients as the recovered price list (Fiber optic ≈ +$X/mo, StreamingTV ≈ +$Y/mo).
  Turns the suspicious R² into a positive finding and a great slide.
- **Refit-on-full-data before deployment (Section 12) is fine** and correctly justified.
- **Skip SHAP** — new dependency + serialization fiddliness; LR coefficients give the same
  thing honestly and cheaply.

## Feature engineering (future-work material, not implementation targets)

Regression is saturated; further features won't move it. For classification, in value order:
1. **Billing-deviation feature** — residual between actual `MonthlyCharges` and the rate-card
   model's prediction from plan features, as a churn feature ("is this customer overpaying?").
   Connects the two tasks. Leakage caveat: rate-card model must be fit on training folds only.
2. **Auto-pay flag** — `PaymentMethod.str.contains("automatic")`; electronic-check customers
   churn notoriously more.
3. **`Contract × is_new_customer` interaction.**
Given the deadline, write these into the report's future-work paragraph rather than implement.

## App features worth adding (impact per hour)

1. **What-if contract toggle** — after a prediction, re-call the API with `Contract` flipped
   to "One year"; show "64% → 41%". One extra fetch; add a one-line "correlational, not
   causal" caption (the caveat itself earns rigor points).
2. **Real prediction drivers** (replaces weakness #3 above) — top-3 LR contributions exposed
   from the API.
3. **Sample-customer prefill buttons** ("typical churner" / "loyal customer") — ~20 min,
   makes the demo land instantly.
4. Billing-deviation input on the Charges page (enter actual bill, see deviation from rate
   card) — only if 1–3 are done and deployed.

## Priority list for remaining hours (the instruction set)

1. **Deploy. First, before anything else.** Commit `.pkl`s, one FastAPI service serving the
   React build, Render/Railway/Fly. A deployed app with zero further improvements beats
   everything below.
2. **Fix test-set selection + soften "real margin" language** (~45 min) — report Section 11,
   `leaderboard.json`, `explain-to-professor.md`. Re-render the report.
3. **Prefill buttons + what-if contract toggle** (~1 hr).
4. **Rate-card coefficient table in the report** (~45 min).
5. **Threshold/PR-curve paragraph** (~30 min).
6. **LR-based prediction drivers in the app** (~1–1.5 hrs) — only if 1–5 are done.

**Cut without guilt:** SHAP, billing-deviation feature, LTV/future-charges reframing (never
do this regardless of time), regression learning curves, further visual polish.

**Bottom line:** the methodology story is already top-of-class for a course capstone. The
remaining risk is logistical (no deployment) plus two sentences that oversell where everything
else carefully undersells. Fix those and ship.
