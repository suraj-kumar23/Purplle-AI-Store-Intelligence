import pandas as pd
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]

POS_FILE = (
    BASE_DIR /
    "data" /
    "transactions" /
    "Brigade_Bangalore.csv"
)


class POSLoader:

    def __init__(self):

        self.df = pd.read_csv(
            POS_FILE
        )

    def get_all_transactions(self):

        return self.df

    def find_amount_column(self):

        possible_columns = [

            "total_amount",
            "GMV",
            "NMV",

            "Amount",
            "amount",

            "Revenue",
            "revenue",

            "Total",
            "total"
        ]

        for col in possible_columns:

            if col in self.df.columns:

                return col

        raise Exception(

            f"Amount column not found. "
            f"Available columns = "
            f"{list(self.df.columns)}"

        )

    def get_total_revenue(self):

        amount_col = self.find_amount_column()

        return float(

            self.df[
                amount_col
            ].fillna(0).sum()

        )

    def get_total_orders(self):

        if "order_id" in self.df.columns:

            return (

                self.df[
                    "order_id"
                ].nunique()

            )

        return len(self.df)

    def get_average_order_value(self):

        revenue = self.get_total_revenue()

        orders = self.get_total_orders()

        return round(

            revenue / orders,

            2

        ) if orders > 0 else 0

    def get_top_products(
        self,
        top_n=10
    ):

        if (

            "product_name"
            not in self.df.columns

        ):

            return {}

        return (

            self.df
            .groupby(
                "product_name"
            )["qty"]
            .sum()
            .sort_values(
                ascending=False
            )
            .head(top_n)
            .to_dict()

        )

    def get_top_brands(
        self,
        top_n=10
    ):

        amount_col = (
            self.find_amount_column()
        )

        if (

            "brand_name"
            not in self.df.columns

        ):

            return {}

        return (

            self.df
            .groupby(
                "brand_name"
            )[amount_col]
            .sum()
            .sort_values(
                ascending=False
            )
            .head(top_n)
            .to_dict()

        )

    def get_top_categories(
        self,
        top_n=10
    ):

        amount_col = (
            self.find_amount_column()
        )

        if (

            "sub_category"
            not in self.df.columns

        ):

            return {}

        return (

            self.df
            .groupby(
                "sub_category"
            )[amount_col]
            .sum()
            .sort_values(
                ascending=False
            )
            .head(top_n)
            .to_dict()

        )

    def get_store_summary(self):

        return {

            "revenue":
                self.get_total_revenue(),

            "orders":
                self.get_total_orders(),

            "average_order_value":
                self.get_average_order_value(),

            "top_products":
                self.get_top_products(5),

            "top_brands":
                self.get_top_brands(5),

            "top_categories":
                self.get_top_categories(5)
        }


if __name__ == "__main__":

    pos = POSLoader()

    print(
        pos.get_store_summary()
    )