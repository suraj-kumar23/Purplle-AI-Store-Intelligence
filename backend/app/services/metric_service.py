import json
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[3]

EVENT_FILE = BASE_DIR / "events.jsonl"

POS_FILE = (
    BASE_DIR
    / "data"
    / "transactions"
    / "Brigade_Bangalore.csv"
)

class MetricService:

    def calculate(self):

        visitors = set()

        # --------------------------
        # CCTV Visitors
        # --------------------------

        if EVENT_FILE.exists():

            with open(
                EVENT_FILE,
                "r",
                encoding="utf-8"
            ) as f:

                for line in f:

                    try:

                        event = json.loads(
                            line
                        )

                        visitors.add(
                            str(
                                event.get(
                                    "visitor_id"
                                )
                            )
                        )

                    except Exception:
                        continue

        unique_visitors = len(
            visitors
        )

        # --------------------------
        # POS Metrics
        # --------------------------

        purchases = 0
        revenue = 0
        avg_order_value = 0

        if POS_FILE.exists():

            try:

                df = pd.read_csv(
                    POS_FILE
                )

                print(
                    "POS Columns:",
                    df.columns.tolist()
                )

                # Purchases

                if "order_id" in df.columns:

                    purchases = int(
                        df["order_id"]
                        .nunique()
                    )

                # Revenue

                if (
                    "total_amount"
                    in df.columns
                ):

                    revenue = float(
                        df[
                            "total_amount"
                        ].fillna(0)
                        .sum()
                    )

                elif (
                    "NMV"
                    in df.columns
                ):

                    revenue = float(
                        df["NMV"]
                        .fillna(0)
                        .sum()
                    )

                elif (
                    "GMV"
                    in df.columns
                ):

                    revenue = float(
                        df["GMV"]
                        .fillna(0)
                        .sum()
                    )

                # AOV

                if purchases > 0:

                    avg_order_value = (
                        revenue /
                        purchases
                    )

            except Exception as e:

                print(
                    "POS ERROR:",
                    str(e)
                )

        # --------------------------
        # Conversion Rate
        # --------------------------

        conversion_rate = 0

        if unique_visitors > 0:

            conversion_rate = (

                purchases
                /
                unique_visitors

            ) * 100

        return {

            "unique_visitors":
            unique_visitors,

            "purchases":
            purchases,

            "revenue":
            round(
                revenue,
                2
            ),

            "avg_order_value":
            round(
                avg_order_value,
                2
            ),

            "conversion_rate":
            round(
                conversion_rate,
                2
            )
        }