import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[3]

EVENT_FILE = BASE_DIR / "events.jsonl"

class FunnelService:

    def calculate(self):

        entries = set()

        zone_visits = set()

        billing_visits = set()

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

                        visitor = str(
                            event.get(
                                "visitor_id"
                            )
                        )

                        event_type = (
                            event.get(
                                "event_type"
                            )
                        )

                        zone = (
                            event.get(
                                "zone_id"
                            )
                        )

                        if (
                            event_type
                            == "ENTRY"
                        ):

                            entries.add(
                                visitor
                            )

                        if (
                            event_type
                            == "ZONE_ENTER"
                        ):

                            zone_visits.add(
                                visitor
                            )

                        if zone == "BILLING":

                            billing_visits.add(
                                visitor
                            )

                    except:
                        pass

        return {

            "entry_count":
            len(entries),

            "zone_visits":
            len(zone_visits),

            "billing_visits":
            len(
                billing_visits
            )
        }