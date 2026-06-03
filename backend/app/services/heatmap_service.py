import json
from pathlib import Path
from collections import Counter

BASE_DIR = Path(__file__).resolve().parents[3]

EVENT_FILE = BASE_DIR / "events.jsonl"

class HeatmapService:

    def calculate(self):

        counter = Counter()

        if not EVENT_FILE.exists():

            return {}

        with open(EVENT_FILE, "r") as f:

            for line in f:

                event = json.loads(line)

                if (
                    event["event_type"]
                    == "ZONE_ENTER"
                ):

                    zone = event["zone_id"]

                    if zone:
                        counter[zone] += 1

        return dict(counter)