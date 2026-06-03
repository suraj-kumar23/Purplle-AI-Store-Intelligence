from fastapi import APIRouter

from app.services.heatmap_service import (
    HeatmapService
)

router = APIRouter()


@router.get("/heatmap")
def heatmap():

    service = HeatmapService()

    return service.calculate()


@router.get(
    "/stores/{store_id}/heatmap"
)
def store_heatmap(
    store_id: str
):

    service = HeatmapService()

    result = service.calculate()

    return {

        "store_id":
        store_id,

        "zones":
        result

    }