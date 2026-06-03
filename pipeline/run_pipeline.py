import cv2

from detector.yolo_detector import PersonDetector
from detector.tracker import VisitorTracker

from events.entry_exit import EntryExitManager
from events.event_generator import EventGenerator
from events.event_store import EventStore

from zones.polygons import STORE_ZONES
from zones.zone_mapper import ZoneMapper

from sessions.session_manager import SessionManager

from analytics.queue_detector import QueueDetector


# =====================================================
# Initialize Components
# =====================================================

detector = PersonDetector()

tracker = VisitorTracker()

entry_exit = EntryExitManager()

event_generator = EventGenerator()

event_store = EventStore()

zone_mapper = ZoneMapper(
    STORE_ZONES
)

session_manager = SessionManager()

queue_detector = QueueDetector()


# =====================================================
# Constants
# =====================================================

STORE_ID = "STORE_BLR_002"

CAMERA_ID = "CAM_01"

VIDEO_PATH = (
    r"data/videos/CCTV Footage/CAM 1.mp4"
)


# =====================================================
# Open Video
# =====================================================

video = cv2.VideoCapture(
    VIDEO_PATH
)

print(
    "Video Opened:",
    video.isOpened()
)

if not video.isOpened():

    raise Exception(
        f"Unable to open video: {VIDEO_PATH}"
    )


# =====================================================
# Main Loop
# =====================================================

while True:

    success, frame = video.read()

    if not success:

        print(
            "Video Finished"
        )

        break

    # -------------------------------------------------
    # Detection
    # -------------------------------------------------

    detections = detector.detect(
        frame
    )

    # -------------------------------------------------
    # Tracking
    # -------------------------------------------------

    tracked = tracker.update(
        detections
    )

    queue_tracks = []

    # -------------------------------------------------
    # Process Tracks
    # -------------------------------------------------

    if tracked.tracker_id is not None:

        for bbox, track_id in zip(
            tracked.xyxy,
            tracked.tracker_id
        ):

            x1, y1, x2, y2 = map(
                int,
                bbox
            )

            track_id = int(
                track_id
            )

            queue_tracks.append(
                (
                    x1,
                    y1,
                    x2,
                    y2
                )
            )

            # -----------------------------------------
            # Center Point
            # -----------------------------------------

            cx = int(
                (x1 + x2) / 2
            )

            cy = int(
                (y1 + y2) / 2
            )

            # -----------------------------------------
            # Draw Tracking Box
            # -----------------------------------------

            cv2.rectangle(
                frame,
                (x1, y1),
                (x2, y2),
                (0, 255, 0),
                2
            )

            cv2.putText(
                frame,
                f"ID {track_id}",
                (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 255, 0),
                2
            )

            # -----------------------------------------
            # ENTRY / EXIT
            # -----------------------------------------

            movement_event = (
                entry_exit.process(
                    track_id,
                    cy
                )
            )

            if movement_event:

                if movement_event == "EXIT":

                    session_manager.mark_exit(
                        track_id
                    )

                if (

                    movement_event == "ENTRY"

                    and

                    session_manager.is_reentry(
                        track_id
                    )

                ):

                    reentry_event = (

                        event_generator.generate(

                            store_id=STORE_ID,

                            camera_id=CAMERA_ID,

                            visitor_id=track_id,

                            event_type="REENTRY",

                            metadata={

                                "reentry": True

                            }

                        )

                    )

                    event_store.save(
                        reentry_event
                    )

                    print(
                        "REENTRY",
                        track_id
                    )

                event = (

                    event_generator.generate(

                        store_id=STORE_ID,

                        camera_id=CAMERA_ID,

                        visitor_id=track_id,

                        event_type=movement_event

                    )

                )

                event_store.save(
                    event
                )

                print(
                    movement_event,
                    track_id
                )

            # -----------------------------------------
            # Zone Detection
            # -----------------------------------------

            zone = zone_mapper.get_zone(
                cx,
                cy
            )

            if zone:

                cv2.putText(
                    frame,
                    zone,
                    (cx, cy),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (255, 0, 0),
                    2
                )

                zone_result = (
                    session_manager.update(
                        track_id,
                        zone
                    )
                )

                if zone_result[
                    "zone_changed"
                ]:

                    previous_zone = (
                        zone_result[
                            "previous_zone"
                        ]
                    )

                    # -----------------------------
                    # ZONE_EXIT + ZONE_DWELL
                    # -----------------------------

                    if previous_zone:

                        exit_event = (
                            event_generator.generate(
                                store_id=STORE_ID,
                                camera_id=CAMERA_ID,
                                visitor_id=track_id,
                                event_type="ZONE_EXIT",
                                zone_id=previous_zone,
                                dwell_ms=int(
                                    zone_result[
                                        "dwell_seconds"
                                    ] * 1000
                                )
                            )
                        )

                        event_store.save(
                            exit_event
                        )

                        dwell_event = (
                            event_generator.generate(
                                store_id=STORE_ID,
                                camera_id=CAMERA_ID,
                                visitor_id=track_id,
                                event_type="ZONE_DWELL",
                                zone_id=previous_zone,
                                dwell_ms=int(
                                    zone_result[
                                        "dwell_seconds"
                                    ] * 1000
                                )
                            )
                        )

                        event_store.save(
                            dwell_event
                        )

                        print(
                            "ZONE_DWELL",
                            track_id,
                            previous_zone,
                            zone_result["dwell_seconds"]
                        )

                    # -----------------------------
                    # ZONE_ENTER
                    # -----------------------------

                    enter_event = (
                        event_generator.generate(
                            store_id=STORE_ID,
                            camera_id=CAMERA_ID,
                            visitor_id=track_id,
                            event_type="ZONE_ENTER",
                            zone_id=zone
                        )
                    )

                    event_store.save(
                        enter_event
                    )

                    print(
                        "ZONE_ENTER",
                        track_id,
                        zone
                    )

    # -------------------------------------------------
    # Queue Analytics
    # -------------------------------------------------

    queue_depth = (
        queue_detector.get_queue_depth(
            queue_tracks
        )
    )

    queue_event = (
        queue_detector.detect_event(
            queue_depth
        )
    )
    print(
    "QUEUE_DEPTH:",
    queue_depth,
    "EVENT:",
    queue_event
)

    if queue_event:

        event = (
            event_generator.generate(
                store_id=STORE_ID,
                camera_id=CAMERA_ID,
                visitor_id="SYSTEM",
                event_type=queue_event,
                zone_id="BILLING",
                metadata={
                    "queue_depth":
                        queue_depth
                }
            )
        )

        event_store.save(
            event
        )

        cv2.putText(
            frame,
            f"{queue_event}: {queue_depth}",
            (50, 100),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 0, 255),
            3
        )

    # -------------------------------------------------
    # Draw Entry Line
    # -------------------------------------------------

    cv2.line(
        frame,
        (0, 400),
        (1920, 400),
        (0, 255, 255),
        3
    )

    # -------------------------------------------------
    # Queue Depth Display
    # -------------------------------------------------

    cv2.putText(
        frame,
        f"Queue Depth: {queue_depth}",
        (50, 50),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (255, 255, 0),
        2
    )

    # -------------------------------------------------
    # Show Frame
    # -------------------------------------------------

    cv2.imshow(
        "Store Intelligence",
        frame
    )

    key = cv2.waitKey(
        1
    ) & 0xFF

    if key == 27:
        break


# =====================================================
# Cleanup
# =====================================================

event_store.close()

video.release()

cv2.destroyAllWindows()

print(
    "Pipeline Finished Successfully"
)