from pydantic import BaseModel
from typing import Optional
from typing import Dict
from pydantic import Field


class Event(BaseModel):

    event_id: str

    store_id: str

    camera_id: str

    visitor_id: str

    event_type: str

    timestamp: str

    zone_id: Optional[str] = None

    dwell_ms: int = 0

    is_staff: bool = False

    confidence: float = 0.0

    metadata: Dict = Field(
        default_factory=dict
    )