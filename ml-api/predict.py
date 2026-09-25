from pathlib import Path
import pandas as pd
import joblib

MODEL_PATH = Path(__file__).resolve().parent / "delay_model.pkl"

saved = joblib.load(MODEL_PATH)

model = saved["pipeline"]
label_map = saved["label_map"]

def predict_project(
    project_type,
    land_area,
    affected_families,
    stakeholder_responsiveness,
    historical_performance,
    possession_status,
    state
):
    project = {
        "Land Area": land_area,
        "No. Of affected Families": affected_families,
        "Stake Holder Responsiveness": stakeholder_responsiveness,
        "Historical Performance": historical_performance,
        "Possesion_status": possession_status,
        "Project_type_static": project_type,
        "State": state
    }

    X_new = pd.DataFrame([project])

    prediction = model.predict(X_new)[0]
    probabilities = model.predict_proba(X_new)[0]

    risk = label_map[prediction]

    # Find probability corresponding to predicted class
    class_probability = {
        "Low": probabilities[0],
        "Medium": probabilities[1],
        "High": probabilities[2]
    }

    confidence = class_probability[risk]

    return {
        "predicted_class": risk,
        "confidence": float(confidence),
        "probabilities": {
            "Low": float(probabilities[0]),
            "Medium": float(probabilities[1]),
            "High": float(probabilities[2])
        }
    }