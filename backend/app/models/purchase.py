from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Float

from database.db import Base

class Purchase(Base):

    __tablename__ = "purchases"

    order_id = Column(
        String,
        primary_key=True
    )

    order_time = Column(String)

    total_amount = Column(Float)

    store_id = Column(String)