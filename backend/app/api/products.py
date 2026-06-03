from fastapi import APIRouter
import pandas as pd
from pathlib import Path

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parents[3]

POS_FILE = (
    BASE_DIR /
    "data" /
    "transactions" /
    "Brigade_Bangalore.csv"
)

@router.get("/products")
def products():

    df = pd.read_csv(
        POS_FILE
    )

    top_products = (

        df.groupby(
            "product_name"
        )["qty"]

        .sum()

        .sort_values(
            ascending=False
        )

        .head(10)

    )

    return top_products.to_dict()