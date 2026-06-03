from fastapi import APIRouter

from app.services.funnel_service import (
    FunnelService
)

router = APIRouter()


@router.get("/funnel")
def funnel():

    service = FunnelService()

    return service.calculate()


@router.get(
    "/stores/{store_id}/funnel"
)
def store_funnel(
    store_id: str
):

    service = FunnelService()

    result = service.calculate()

    result["store_id"] = (
        store_id
    )

    return result