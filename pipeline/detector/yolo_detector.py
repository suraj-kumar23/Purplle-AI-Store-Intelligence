from ultralytics import YOLO
import supervision as sv

class PersonDetector:

    def __init__(self):
        self.model = YOLO("yolov8m.pt")

    def detect(self, frame):

        result = self.model(
            frame,
            conf=0.35,
            verbose=False
        )[0]

        detections = sv.Detections.from_ultralytics(
            result
        )

        detections = detections[
            detections.class_id == 0
        ]

        return detections