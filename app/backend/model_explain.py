"""Per-prediction driver extraction, mirroring the rate-card/feature-importance
logic in report/ml-analysis.qmd Sections 11.1.3 and 11.3."""

import numpy as np
import scipy.sparse as sp


def _clean_name(name: str) -> str:
    return name.replace("num__", "").replace("cat__", "").replace("_", " ")


def compute_top_drivers(pipeline, X, top_n: int = 4):
    """Return the top_n features driving this single prediction.

    For linear models (LogisticRegression, Ridge), each driver's "value" is its
    exact contribution (coefficient * this row's scaled/encoded feature value) —
    additive contributions that combine with the intercept into the prediction.
    For tree models, falls back to global feature_importances_ (not
    prediction-specific), flagged via "type".
    """
    preprocess = pipeline.named_steps["preprocess"]
    selector = pipeline.named_steps["select"]
    model = pipeline.named_steps["model"]

    transformed = preprocess.transform(X)
    selected = selector.transform(transformed)
    if sp.issparse(selected):
        selected = selected.toarray()
    row = np.asarray(selected)[0]

    feature_names = preprocess.get_feature_names_out()
    mask = selector.get_support()
    selected_names = [_clean_name(n) for n in feature_names[mask]]

    if hasattr(model, "coef_"):
        coef = model.coef_
        coef = coef[0] if coef.ndim == 2 else coef
        values = row * coef
        driver_type = "contribution"
    elif hasattr(model, "feature_importances_"):
        values = model.feature_importances_
        driver_type = "importance"
    else:
        return []

    order = np.argsort(-np.abs(values))[:top_n]
    return [
        {"feature": selected_names[i], "value": round(float(values[i]), 4), "type": driver_type}
        for i in order
    ]
