class QueueDetector:

    JOIN_THRESHOLD = 4

    CONGESTION_THRESHOLD = 8

    ABANDON_MIN_DEPTH = 4

    def __init__(self):

        self.billing_zone = (
            1450,
            250,
            1850,
            900
        )

        self.previous_depth = 0

    def get_queue_depth(
        self,
        tracks
    ):

        count = 0

        for x1, y1, x2, y2 in tracks:

            cx = (x1 + x2) / 2
            cy = (y1 + y2) / 2

            if (

                self.billing_zone[0]
                <= cx <=
                self.billing_zone[2]

                and

                self.billing_zone[1]
                <= cy <=
                self.billing_zone[3]

            ):

                count += 1

        return count

    def detect_event(
        self,
        queue_depth
    ):

        event = None

        # -------------------------------------------------
        # BILLING_CONGESTION — very high queue
        # -------------------------------------------------

        if queue_depth >= self.CONGESTION_THRESHOLD:

            event = "BILLING_CONGESTION"

        # -------------------------------------------------
        # BILLING_QUEUE_JOIN — queue building up
        # -------------------------------------------------

        elif (

            queue_depth >= self.JOIN_THRESHOLD

            and

            queue_depth > self.previous_depth

        ):

            event = "BILLING_QUEUE_JOIN"

        # -------------------------------------------------
        # BILLING_QUEUE_ABANDON — queue was long, now empty
        # -------------------------------------------------

        elif (

            self.previous_depth >= self.ABANDON_MIN_DEPTH

            and

            queue_depth == 0

        ):

            event = "BILLING_QUEUE_ABANDON"

        self.previous_depth = queue_depth

        return event