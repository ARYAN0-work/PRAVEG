import pandas as pd
import joblib
from pathlib import Path

# Load once, at process startup — not inside the function, since reloading
# the model from disk on every request would be slow and pointless.
_bundle = joblib.load(Path(__file__).with_name("delay_model.pkl"))
_pipeline = _bundle["pipeline"]
_numeric_features = _bundle["numeric_features"]
_categorical_features = _bundle["categorical_features"]
_label_map = _bundle["label_map"]  # {0: "Low", 1: "Medium", 2: "High"}


def predict_delay(input_data: dict) -> dict:
    """
    Takes raw project parameters (e.g. from a frontend form / API request)
    and returns a delay-risk prediction.

    input_data keys expected (all optional — missing ones are imputed
    automatically by the same pipeline used in training):
        "Land Area": float (hectares)
        "No. Of affected Families": int
        "Historical Performance": float
        "Budget alloted": float (crore)
        "Compensation_Status": float (crore, or % — whatever unit you trained on)
        "Legal Disputes": float (count)
        "Possesion_status": float (% possession)
        "Project_type_static": str  (e.g. "Irrigation", "Airport", "Metro Rail"...)
        "State": str
        "Stake Holder Responsiveness": str  (e.g. "High"/"Moderate"/"Low"/"Poor")

    Returns:
        {
          "predicted_class": "Low" | "Medium" | "High",
          "confidence": float (0-1, probability of the predicted class),
          "probabilities": {"Low": .., "Medium": .., "High": ..}
        }
    """
    all_features = _numeric_features + _categorical_features

    # Build a single-row DataFrame with exactly the columns/order the pipeline expects.
    # Any key not supplied becomes None -> the pipeline's own imputer fills it in,
    # exactly like it does for missing values during training.
    row = {feat: input_data.get(feat, None) for feat in all_features}
    X_new = pd.DataFrame([row])

    pred_class_idx = _pipeline.predict(X_new)[0]
    pred_proba = _pipeline.predict_proba(X_new)[0]

    return {
        "predicted_class": _label_map[pred_class_idx],
        "confidence": round(float(pred_proba[pred_class_idx]), 3),
        "probabilities": {
            _label_map[i]: round(float(p), 3) for i, p in enumerate(pred_proba)
        },
    }


if __name__ == "__main__":
    # Quick smoke test with realistic values
    example_input = {
        "Land Area": 4131.5,
        "No. Of affected Families": 2278,
        "Historical Performance": 3.5,
        "Legal Disputes": 4,
        "Possesion_status": 82.0,
        "Project_type_static": "Irrigation",
        "State": "Uttar Pradesh",
        "Stake Holder Responsiveness": "Moderate",
        # Budget alloted / Compensation_Status intentionally left out
        # -> pipeline imputes them, exactly like a real incomplete frontend submission
    }
    result = predict_delay(example_input)
    print(result)
