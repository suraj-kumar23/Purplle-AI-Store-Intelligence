import time


class ReIDManager:

    def __init__(self):

        self.recent_exits = {}

        self.reentry_window = 600

    def register_exit(
        self,
        visitor_id,
        center
    ):

        self.recent_exits[
            visitor_id
        ] = {

            "time": time.time(),

            "center": center
        }

    def check_reentry(
        self,
        visitor_id
    ):

        if visitor_id not in self.recent_exits:

            return False

        elapsed = (

            time.time()

            -

            self.recent_exits[
                visitor_id
            ]["time"]

        )

        return elapsed < self.reentry_window