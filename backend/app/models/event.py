from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Float
from sqlalchemy import JSON
from sqlalchemy import Integer

from database.db import Base

class Event(Base):

    __tablename__ = "events"

    event_id = Column(
        String,
        primary_key=True
    )

    visitor_id = Column(String)

    event_type = Column(String)

    zone_id = Column(String)

    timestamp = Column(String)

    confidence = Column(Float)

    metadata = Column(JSON)

    dwell_ms = Column(Integer)