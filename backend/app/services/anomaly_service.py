import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[3]

EVENT_FILE = BASE_DIR / "events.jsonl"


class AnomalyService:

    def detect(self):

        anomalies = []

        billing_count = 0
        entry_count = 0

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

                        if (
                            event.get(
                                "event_type"
                            )
                            ==
                            "ENTRY"
                        ):

                            entry_count += 1

                        if (
                            event.get(
                                "zone_id"
                            )
                            ==
                            "BILLING"
                        ):

                            billing_count += 1

                    except Exception:

                        continue

        if billing_count > 100:

            anomalies.append({

                "type":
                "BILLING_CONGESTION",

                "severity":
                "HIGH",

                "suggested_action":
                "Open another billing counter"

            })

        if entry_count > 500:

            anomalies.append({

                "type":
                "QUEUE_SPIKE",

                "severity":
                "CRITICAL",

                "suggested_action":
                "Deploy additional staff"

            })

        return anomalies