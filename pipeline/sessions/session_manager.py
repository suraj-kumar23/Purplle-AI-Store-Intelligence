from datetime import datetime, timedelta


class SessionManager:

    REENTRY_WINDOW_MINUTES = 10

    ZONE_COOLDOWN_SECONDS = 3

    def __init__(self):

        self.sessions = {}

        self.exited_visitors = {}

    def mark_exit(
        self,
        visitor_id
    ):

        self.exited_visitors[
            visitor_id
        ] = datetime.utcnow()

    def is_reentry(
        self,
        visitor_id
    ):

        if visitor_id not in self.exited_visitors:
            return False

        exit_time = self.exited_visitors[
            visitor_id
        ]

        elapsed = (
            datetime.utcnow()
            - exit_time
        )

        if elapsed <= timedelta(
            minutes=self.REENTRY_WINDOW_MINUTES
        ):

            del self.exited_visitors[
                visitor_id
            ]

            return True

        return False

    def update(
        self,
        visitor_id,
        zone
    ):

        now = datetime.utcnow()

        if visitor_id not in self.sessions:

            self.sessions[visitor_id] = {

                "zones": [],

                "last_zone": None,

                "zone_entry_time": now,

                "last_zone_event_time": None,

                "dwell_times": {},

                "session_seq": 0,

                "first_seen": now,

                "last_seen": now,

                "total_dwell": 0
            }

        session = self.sessions[
            visitor_id
        ]

        session["last_seen"] = now

        previous_zone = session[
            "last_zone"
        ]

        result = {

            "zone_changed": False,

            "event_type": None,

            "previous_zone":
                previous_zone,

            "current_zone":
                zone,

            "dwell_seconds": 0,

            "session_seq":
                session["session_seq"]
        }

        # -------------------------------------------------
        # First zone seen for this visitor
        # -------------------------------------------------

        if previous_zone is None:

            if session["last_zone_event_time"]:

                cooldown = (
                    now
                    - session["last_zone_event_time"]
                ).total_seconds()

                if cooldown < self.ZONE_COOLDOWN_SECONDS:
                    return result

            session["zones"].append(
                zone
            )

            session[
                "last_zone"
            ] = zone

            session[
                "zone_entry_time"
            ] = now

            session[
                "last_zone_event_time"
            ] = now

            session[
                "session_seq"
            ] += 1

            result.update({

                "zone_changed": True,

                "event_type":
                    "ZONE_ENTER",

                "session_seq":
                    session[
                        "session_seq"
                    ]
            })

            return result

        # -------------------------------------------------
        # Visitor moved to a different zone
        # -------------------------------------------------

        if previous_zone != zone:

            if session["last_zone_event_time"]:

                cooldown = (
                    now
                    - session["last_zone_event_time"]
                ).total_seconds()

                if cooldown < self.ZONE_COOLDOWN_SECONDS:
                    return result

            dwell = (
                now
                - session[
                    "zone_entry_time"
                ]
            ).total_seconds()

            session[
                "dwell_times"
            ][previous_zone] = (

                session[
                    "dwell_times"
                ].get(
                    previous_zone,
                    0
                )

                + dwell

            )

            session[
                "total_dwell"
            ] += dwell

            session[
                "zones"
            ].append(zone)

            session[
                "last_zone"
            ] = zone

            session[
                "zone_entry_time"
            ] = now

            session[
                "last_zone_event_time"
            ] = now

            session[
                "session_seq"
            ] += 1

            result.update({

                "zone_changed": True,

                "event_type":
                    "ZONE_EXIT",

                "dwell_seconds":
                    round(
                        dwell,
                        2
                    ),

                "session_seq":
                    session[
                        "session_seq"
                    ]
            })

        return result

    def get_session(
        self,
        visitor_id
    ):

        return self.sessions.get(
            visitor_id
        )

    def get_all_sessions(self):

        return self.sessions

    def get_total_dwell(
        self,
        visitor_id
    ):

        session = self.sessions.get(
            visitor_id
        )

        if not session:
            return 0

        return round(

            session[
                "total_dwell"
            ],

            2

        )

    def get_zone_history(
        self,
        visitor_id
    ):

        session = self.sessions.get(
            visitor_id
        )

        if not session:
            return []

        return session[
            "zones"
        ]

    def get_zone_dwell(
        self,
        visitor_id
    ):

        session = self.sessions.get(
            visitor_id
        )

        if not session:
            return {}

        return session[
            "dwell_times"
        ]