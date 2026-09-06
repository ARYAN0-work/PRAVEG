from fastapi import FastAPI
from Predict import predict_delay

app = FastAPI(title="PRAVEG ML API")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "message": "PRAVEG ML API is running"
    }


@app.post("/predict")
def predict(data: dict):
    return predict_delay(data)
