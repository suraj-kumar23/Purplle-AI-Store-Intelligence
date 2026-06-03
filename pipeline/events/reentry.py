import time


class ReEntryDetector:

    def __init__(self):

        self.last_exit = {}

    def update(
        self,
        visitor_id
    ):

        if visitor_id not in self.last_exit:

            return False

        diff = (

            time.time()

            -

            self.last_exit[
                visitor_id
            ]

        )

        return diff < 600

    def register_exit(
        self,
        visitor_id
    ):

        self.last_exit[
            visitor_id
        ] = time.time()