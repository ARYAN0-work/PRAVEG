import pandas as pd
import numpy as np
import joblib
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.model_selection import GroupKFold, RandomizedSearchCV
from xgboost import XGBClassifier

# ---------- Load & merge (same as your training script) ----------
df1 = pd.read_excel("Datastructure.xlsx", sheet_name="Sheet1")
df2 = pd.read_excel("Datastructure.xlsx", sheet_name="Sheet2")
combined = pd.merge(df1, df2, on="Project_id", how="inner", suffixes=("_static", "_snap"))


def clean_numeric_text(x):
    if pd.isna(x): return np.nan
    if isinstance(x, (int, float)): return float(x)
    s = str(x).strip().lower()
    if s in ("null", "-", ""): return np.nan
    s = s.replace(",", "").replace("cr", "").strip()
    try:
        return float(s)
    except ValueError:
        return np.nan


for col in ["Compensation_Status", "Legal Disputes", "Budget alloted", "Possesion_status"]:
    if col in combined.columns:
        combined[col] = combined[col].apply(clean_numeric_text)

label_map = {"low": 0, "medium": 1, "high": 2}
inv_label_map = {v: k.capitalize() for k, v in label_map.items()}  # 0->"Low", 1->"Medium", 2->"High"
combined["Delay_status"] = combined["Delay_status"].astype("string").str.strip().str.lower().map(label_map)
combined = combined[combined["Delay_status"].notna()].copy()
combined["Delay_status"] = combined["Delay_status"].astype(int)

numeric_features = ["Land Area", "No. Of affected Families", "Historical Performance",
                    "Budget alloted", "Compensation_Status", "Legal Disputes", "Possesion_status"]
numeric_features = [c for c in numeric_features if c in combined.columns]
categorical_features = ["Project_type_static", "State", "Stake Holder Responsiveness"]
categorical_features = [c for c in categorical_features if c in combined.columns]

groups = combined["Project_id"]
y = combined["Delay_status"]
X = combined[numeric_features + categorical_features].copy()

numeric_pipe = Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())])
categorical_pipe = Pipeline([("impute", SimpleImputer(strategy="constant", fill_value="Unknown")),
                             ("encode", OneHotEncoder(handle_unknown="ignore"))])
preprocess = ColumnTransformer([("num", numeric_pipe, numeric_features),
                                ("cat", categorical_pipe, categorical_features)])

xgb = XGBClassifier(objective="multi:softprob", num_class=3, eval_metric="mlogloss",
                    tree_method="hist", random_state=42)
pipeline = Pipeline([("prep", preprocess), ("xgb", xgb)])

n_splits = min(5, groups.nunique())
gkf = GroupKFold(n_splits=n_splits)

param_grid = {
    "xgb__max_depth": [2, 3, 4, 5],
    "xgb__min_child_weight": [1, 2, 3, 5, 7],
    "xgb__n_estimators": [50, 100, 150, 200, 300],
    "xgb__learning_rate": [0.01, 0.05, 0.1, 0.15, 0.2],
    "xgb__subsample": [0.7, 0.85, 1.0],
    "xgb__colsample_bytree": [0.7, 0.85, 1.0],
    "xgb__reg_alpha": [0, 0.1, 1],
    "xgb__reg_lambda": [1, 5, 10],
}
search = RandomizedSearchCV(pipeline, param_grid, n_iter=300, cv=gkf, scoring="accuracy",
                            n_jobs=-1, random_state=42, verbose=0)
search.fit(X, y, groups=groups)
best_pipeline = search.best_estimator_

# ---------- IMPORTANT: refit best_pipeline on ALL labeled data before saving ----------
# (cross_val_score/RandomizedSearchCV only ever fit on training folds internally;
# for the model you actually ship, you want it trained on every labeled row you have)
best_pipeline.fit(X, y)

# ---------- Save everything the prediction function will need ----------
joblib.dump({
    "pipeline": best_pipeline,
    "numeric_features": numeric_features,
    "categorical_features": categorical_features,
    "label_map": inv_label_map,  # 0/1/2 -> "Low"/"Medium"/"High"
}, "delay_model.pkl")

print("Saved delay_model.pkl")
print("Best params:", search.best_params_)
print("Best grouped-CV accuracy during search:", round(search.best_score_, 3))