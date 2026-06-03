import uuid
from datetime import datetime


class EventGenerator:

    def generate(
        self,
        visitor_id,
        event_type,
        zone_id=None,
        dwell_ms=0,
        confidence=1.0,
        metadata=None,
        store_id="STORE_BLR_002",
        camera_id="CAM_03"
    ):

        if metadata is None:
            metadata = {}

        return {

            "event_id": str(
                uuid.uuid4()
            ),

            "store_id":
                store_id,

            "camera_id":
                camera_id,

            "visitor_id":
                str(visitor_id),

            "event_type":
                event_type,

            "timestamp":
                datetime.utcnow()
                .isoformat(),

            "zone_id":
                zone_id,

            "dwell_ms":
                dwell_ms,

            "is_staff":
                False,

            "confidence":
                confidence,

            "metadata":
                metadata
        }