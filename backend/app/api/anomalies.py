from fastapi import APIRouter

from app.services.anomaly_service import (
    AnomalyService
)

router = APIRouter()


@router.get("/anomalies")
def anomalies():

    service = AnomalyService()

    return service.detect()


@router.get(
    "/stores/{store_id}/anomalies"
)
def store_anomalies(
    store_id: str
):

    service = AnomalyService()

    return {

        "store_id":
        store_id,

        "anomalies":
        service.detect()

    }