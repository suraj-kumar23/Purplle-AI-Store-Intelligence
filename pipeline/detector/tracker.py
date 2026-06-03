import supervision as sv

class VisitorTracker:

    def __init__(self):

        self.tracker = sv.ByteTrack(
            lost_track_buffer=60,
            track_activation_threshold=0.25,
            minimum_matching_threshold=0.8
        )

    def update(self, detections):

        return self.tracker.update_with_detections(
            detections
        )