class EntryExitManager:

    ENTRY_LINE_Y = 400

    def __init__(self):

        self.previous_positions = {}

        self.last_event = {}

    def process(
        self,
        visitor_id,
        current_y
    ):

        event = None

        if visitor_id in self.previous_positions:

            previous_y = self.previous_positions[
                visitor_id
            ]

            # -----------------------------
            # ENTRY
            # -----------------------------
            if (

                previous_y
                < self.ENTRY_LINE_Y

                and

                current_y
                >= self.ENTRY_LINE_Y

            ):

                if (

                    self.last_event.get(
                        visitor_id
                    )

                    != "ENTRY"

                ):

                    event = "ENTRY"

                    self.last_event[
                        visitor_id
                    ] = "ENTRY"

            # -----------------------------
            # EXIT
            # -----------------------------
            elif (

                previous_y
                > self.ENTRY_LINE_Y

                and

                current_y
                <= self.ENTRY_LINE_Y

            ):

                if (

                    self.last_event.get(
                        visitor_id
                    )

                    != "EXIT"

                ):

                    event = "EXIT"

                    self.last_event[
                        visitor_id
                    ] = "EXIT"

        self.previous_positions[
            visitor_id
        ] = current_y

        return event

    def reset_visitor(
        self,
        visitor_id
    ):

        if visitor_id in self.previous_positions:

            del self.previous_positions[
                visitor_id
            ]

        if visitor_id in self.last_event:

            del self.last_event[
                visitor_id
            ]