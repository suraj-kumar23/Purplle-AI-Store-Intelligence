from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Boolean

from database.db import Base

class Visitor(Base):

    __tablename__ = "visitors"

    visitor_id = Column(
        String,
        primary_key=True
    )

    first_seen = Column(String)

    last_seen = Column(String)

    purchase_flag = Column(
        Boolean,
        default=False
    )