from fastapi import APIRouter
import pandas as pd
from pathlib import Path

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parents[3]

POS_FILE = (
    BASE_DIR
    / "data"
    / "transactions"
    / "Brigade_Bangalore.csv"
)

@router.get("/brands")
def brands():

    df = pd.read_csv(POS_FILE)

    brand_data = (

        df.groupby("brand_name")["total_amount"]

        .sum()

        .sort_values(
            ascending=False
        )

        .head(10)

    )

    return brand_data.to_dict()