from app.services.anomaly_service import AnomalyService


def test_anomaly_detection_returns_list():

    service = AnomalyService()

    result = service.detect()

    assert isinstance(
        result,
        list
    )


def test_anomaly_schema():

    service = AnomalyService()

    result = service.detect()

    for anomaly in result:

        assert "type" in anomaly

        assert "severity" in anomaly

        assert "suggested_action" in anomaly


def test_anomaly_severity_values():

    service = AnomalyService()

    result = service.detect()

    valid = [

        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL"

    ]

    for anomaly in result:

        assert anomaly[
            "severity"
        ] in valid