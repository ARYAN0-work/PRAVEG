from fastapi import FastAPI
from pydantic import BaseModel
from predict import predict_project
app = FastAPI()

class ProjectData(BaseModel):
    project_type: str
    land_area: float
    affected_families: float
    stakeholder_responsiveness: str
    historical_performance: float
    possession_status: float
    state: str


@app.post("/predict")
def predict(data: ProjectData):

    result = predict_project(
        project_type=data.project_type,
        land_area=data.land_area,
        affected_families=data.affected_families,
        stakeholder_responsiveness=data.stakeholder_responsiveness,
        historical_performance=data.historical_performance,
        possession_status=data.possession_status,
        state=data.state
    )

    return result
