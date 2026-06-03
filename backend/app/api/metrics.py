from fastapi import APIRouter

from app.services.metric_service import (
    MetricService
)

router = APIRouter()


@router.get("/metrics")
def metrics():

    service = MetricService()

    return service.calculate()


@router.get(
    "/stores/{store_id}/metrics"
)
def store_metrics(
    store_id: str
):

    service = MetricService()

    result = service.calculate()

    result["store_id"] = (
        store_id
    )

    return result