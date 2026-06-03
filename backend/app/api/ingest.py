from fastapi import APIRouter
import json
from pathlib import Path

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parents[3]

EVENT_FILE = BASE_DIR / "events.jsonl"


@router.post("/events/ingest")
def ingest(event: dict):

    with open(
        EVENT_FILE,
        "a",
        encoding="utf-8"
    ) as f:

        f.write(
            json.dumps(event)
            + "\n"
        )

    return {
        "status": "ok"
    }