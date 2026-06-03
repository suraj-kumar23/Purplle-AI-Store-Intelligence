import json
import os

class EventStore:

    def __init__(
        self,
        output_file="events.jsonl"
    ):

        self.file = open(
            output_file,
            "a",
            buffering=1
        )

    def save(
        self,
        event
    ):

        self.file.write(

            json.dumps(event)

            + "\n"

        )

    def close(self):

        self.file.close()